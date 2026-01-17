import jwt from 'jsonwebtoken';
import crypto from "crypto";

import User from '../models/User.js';
import HttpError from "../utils/HttpError.js";

const isProduction = process.env.NODE_ENV === "production";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const createToken = (_id) => {
    return jwt.sign(
        { _id },
        JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    )
}

const createRefreshToken = (_id) => {
    return jwt.sign(
        { _id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )
}

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const timingSafeEqualHex = (a, b) => {
    // a and b are hex strings
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
};

const handleAuthTokens = async (user, res) => {
    const accessToken = createToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // Save hashed refresh token in DB
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    // Send refresh token as secure httpOnly cookie
    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return accessToken;
};

// signup user
export const signupUser = async (req, res, next) => {
    const { email, password, birthDate } = req.body;
    const emailNormalized = typeof email === "string" ? email.trim().toLowerCase() : "";

    try {
        const user = await User.signup(emailNormalized, password, birthDate)

        // create tokens
        const accessToken = await handleAuthTokens(user, res);

        res.status(201).json({
            email: emailNormalized,
            token: accessToken,
            birthDate: user.birthDate,
            age: user.age,
        })
    } catch (err) {
        next(err);
    }
}

// login user
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    const emailNormalized = typeof email === "string" ? email.trim().toLowerCase() : "";

    try {
        const user = await User.login(emailNormalized, password)

        // create tokens
        const accessToken = await handleAuthTokens(user, res);

        res.status(200).json({
            email: emailNormalized,
            token: accessToken,
            birthDate: user.birthDate,
            age: user.age,
        })
    } catch (err) {
        next(err);
    }
}

// refresh token
export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.jwt;
        if (!refreshToken) {
            return next(new HttpError(401, "No refresh token", "UNAUTHORIZED"));
        }

        // verify refresh token signature
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const userId = decoded._id;

        // load user + stored refreshToken
        const user = await User.findById(userId).select("+refreshToken");
        if (!user || !user.refreshToken) {
            return next(new HttpError(403, "Request is not authorized", "FORBIDDEN"));
        }

        // compare hashes in timing-safe way
        const incomingHash = hashToken(refreshToken);
        const match = timingSafeEqualHex(incomingHash, user.refreshToken);

        if (!match) {
            // token reuse/invalid token: invalidate server-side
            user.refreshToken = null;
            await user.save();

            res.clearCookie("jwt", {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                path: "/",
            });

            return next(new HttpError(403, "Request is not authorized", "FORBIDDEN"));
        }

        // issue new access token
        const newAccessToken = createToken(user._id);

        // rotate refresh token
        const newRefreshToken = createRefreshToken(user._id);
        user.refreshToken = hashToken(newRefreshToken);
        await user.save();

        res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ token: newAccessToken });
    } catch (e) {
        const err = new HttpError(401, "Request is not authorized", "UNAUTHORIZED");
        err.meta = { jwtError: e?.name };
        return next(err);
    }

};

// logout user
export const logoutUser = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.jwt;

        // clear stored refresh hash if token is valid
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                const user = await User.findById(decoded._id).select("+refreshToken");
                if (user) {
                    user.refreshToken = null;
                    await user.save();
                }
            } catch {
                // ignore invalid/expired refresh token
            }
        }

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });

        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
};

// delete user
export const deleteUser = async (req, res, next) => {
    const { currentPassword } = req.body;
    if (!currentPassword) {
        return next(new HttpError(400, "Password is required to delete account", "BAD_REQUEST"));
    }

    try {
        const user = await User.findById(req.user._id).select("+password");
        if (!user) return next(new HttpError(404, "User not found", "NOT_FOUND"));

        await user.deleteWithTriage(currentPassword);

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });

        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
        return next(err);
    }
};

// change password
export const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id).select("+password");
        if (!user) return next(new HttpError(404, "User not found", "NOT_FOUND"));

        await user.changePassword(currentPassword, newPassword);

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return next(err);
    }
};

