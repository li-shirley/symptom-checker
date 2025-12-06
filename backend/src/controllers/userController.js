import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

import Triage from '../models/Triage.js';


const isProduction = process.env.NODE_ENV === "production";

const createToken = (_id) => {
    return jwt.sign(
        { _id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    )
}

const createRefreshToken = (_id) => {
    return jwt.sign(
        { _id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )
}

// signup user
export const signupUser = async (req, res) => {
    const { email, password, birthDate, sex } = req.body;

    const emailNormalized = email.trim().toLowerCase();

    try {
        const user = await User.signup(emailNormalized, password, birthDate, sex)

        // create tokens
        const accessToken = createToken(user._id)
        const refreshToken = createRefreshToken(user._id)

        // save refresh token in db
        user.refreshToken = refreshToken
        await user.save()

        // send refresh token as secure httpOnly cookie
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            email,
            token: accessToken,
            birthDate: user.birthDate,
            sex: user.sex,
            age: user.age,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body
    const emailNormalized = email.trim().toLowerCase();

    try {
        const user = await User.login(emailNormalized, password)

        const accessToken = createToken(user._id)
        const refreshToken = createRefreshToken(user._id)

        user.refreshToken = refreshToken
        await user.save()

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            email,
            token: accessToken,
            birthDate: user.birthDate,
            sex: user.sex,
            age: user.age,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// refresh token
export const refreshAccessToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ error: "No refresh token" });

    const refreshToken = cookies.jwt;

    try {
        // find user with this refresh token in DB
        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(403).json({ error: "Forbidden" });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // does token match user
        if (decoded._id !== user._id.toString()) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        // create new access token
        const newAccessToken = createToken(user._id);

        res.status(200).json({ token: newAccessToken });
    } catch (err) {
        console.error("Refresh token error:", err.message);
        res.status(403).json({ error: "Invalid refresh token" });
    }
};


// logout user
export const logoutUser = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204); // No content

    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie("jwt", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    });

    res.sendStatus(204);
};

// delete user
export const deleteUser = async (req, res) => {
    const { currentPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ error: "Password is required to delete account" });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(400).json({ error: "Password is incorrect" });
        }

        // Delete all triage records for this user
        await Triage.deleteMany({ userId: user._id });

        // Delete user from DB
        await User.findByIdAndDelete(user._id);

        // Clear refresh token cookie using logoutUser helper
        await logoutUser(req, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete account" });
    }
};

// change password
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        // verify current password matches hashed one in DB
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ error: "Current password is incorrect" });

        // check if new password is same as current (check hashed version in case of white space)
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) return res.status(400).json({ error: "New password cannot be the same as the current password" });

        // validate new password strength
        if (newPassword.length < 8 || !validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ error: "New password is not strong enough" });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to change password" });
    }
};
