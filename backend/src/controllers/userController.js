import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
    const { email, password } = req.body
    const emailNormalized = email.trim().toLowerCase();

    try {
        const user = await User.signup(emailNormalized, password)

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

        res.status(201).json({ email, token: accessToken })
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

        res.status(200).json({ email, token: accessToken })
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