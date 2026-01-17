import mongoose from 'mongoose';

export const connectDB = async (uri) => {
    try {
        if (!uri) throw new Error("MONGO_URI is missing");
        await mongoose.connect(uri);
        console.log('MongoDB connected succesfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};

