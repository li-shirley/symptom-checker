import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:
    {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, { timestamps: true },)

// static signup method
userSchema.statics.signup = async function (email, password) {
    // validation 
    if (!email || !password) {
        throw Error('All fields must be filled in')
    }

    email = email.toLowerCase().trim();
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }
    if (password.length < 8) {
        throw Error('Password must be at least 8 characters long')
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use. Please login instead')
    }

    const salt = await bcrypt.genSalt(12)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ email, password: hash })

    return user
}

// static login method
userSchema.statics.login = async function (email, password) {
    // validation
    if (!email || !password) {
        throw Error('All fields must be filled in')
    }

    email = email.toLowerCase().trim();
    const user = await this.findOne({ email })

    if (!user) {
        throw Error('Invalid login credentials')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error('Invalid login credentials')
    }

    return user
}

export default mongoose.model('User', userSchema)