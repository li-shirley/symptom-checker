import express from 'express';

import { signupUser, loginUser, refreshAccessToken, logoutUser } from '../controllers/userController.js';

const router = express.Router()

// signup route
router.post('/signup', signupUser)

// login
router.post('/login', loginUser)

// refresh token
router.post('/refresh', refreshAccessToken);

// logout
router.post('/logout', logoutUser);

export default router