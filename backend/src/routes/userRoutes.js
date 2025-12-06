import express from 'express';

import { signupUser, loginUser, refreshAccessToken, logoutUser, deleteUser, changePassword } from '../controllers/userController.js';
import guestRateLimiter from "../middleware/guestRateLimiter.js";
import authRateLimiter from "../middleware/authRateLimiter.js";
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router()

// PUBLIC ENDPOINTS
// signup user
router.post('/signup', guestRateLimiter, signupUser)
// login user
router.post('/login', guestRateLimiter, loginUser)
// refresh token
router.post('/refresh', guestRateLimiter, refreshAccessToken);

router.use(requireAuth)
// PROTECTED ENDPOINTS
// logout user
router.post('/logout', authRateLimiter, logoutUser);
// delete user 
router.delete('/', authRateLimiter, deleteUser);
// change password
router.patch('/password', authRateLimiter, changePassword);

export default router