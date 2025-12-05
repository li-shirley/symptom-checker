import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const requireAuth = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    try {
        const { _id } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(_id).select('_id');

        if (!user) {
            return res.status(401).json({ error: 'User not found. Request unauthorized.' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('JWT verification failed:', error.message);
        res.status(401).json({ error: 'Request is not authorized' });
    }
};

export default requireAuth;

