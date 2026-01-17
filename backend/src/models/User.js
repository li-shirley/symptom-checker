import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

import HttpError from "../utils/HttpError.js";
import Triage from "./Triage.js";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // hashed w/ bcrypt
    password:{
        type: String,
        required: true,
        select: false,
    },
    birthDate: {
        type: Date,
        required: true,
    },
    // hashed - SHA-256 
    refreshToken: {
        type: String,
        default: null,
        select: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete ret.password; // hide sensitive data
            delete ret.refreshToken;
            return ret;
        }
    },  // include virtuals in JSON
    toObject: {
        virtuals: true,
        transform(doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            return ret;
        },
    },
});

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// virtual property for age (does not store age in DB, calculates it and returns in user body instead)
userSchema.virtual('age').get(function () {
    return calculateAge(this.birthDate);
});

// static method: signup
userSchema.statics.signup = async function (email, password, birthDate) {
    // validation 
    if (!email || !password || !birthDate) {
        throw new HttpError(400, "Please fill in all required fields", "BAD_REQUEST");
    }

    // validate password
    if (password.length < 8) {
        throw new HttpError(400, 'Password must be at least 8 characters long', "BAD_REQUEST");
    }
    if (!validator.isStrongPassword(password)) {
        throw new HttpError(400, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', "BAD_REQUEST");
    }

    // validate email
    if (!validator.isEmail(email)) {
        throw new HttpError(400, "Email is not valid", "BAD_REQUEST");
    }
    const exists = await this.findOne({ email });
    if (exists) {
        throw new HttpError(409, "Email already in use. Please login instead", "CONFLICT");
    }

    // validate birthDate
    const birth = new Date(birthDate);
    if (isNaN(birth)) {
        throw new HttpError(400, 'Invalid birth date', "BAD_REQUEST");
    }
    if (birth > new Date()) {
        throw new HttpError(400, 'Birth date cannot be in the future', "BAD_REQUEST");
    }
    const age = calculateAge(birth);
    if (age < 1 || age > 120) {
        throw new HttpError(400, 'Invalid age range', "BAD_REQUEST");
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ email, password: hash, birthDate });

    return user;
}

// static method: login
userSchema.statics.login = async function (email, password) {
    // validation
    if (!email || !password) {
        throw new HttpError(400, 'All fields must be filled in', "BAD_REQUEST")
    }

    const user = await this.findOne({ email }).select("+password");

    if (!user) {
        throw new HttpError(401, "Invalid login credentials", "UNAUTHORIZED");
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw new HttpError(401, 'Invalid login credentials', "UNAUTHORIZED")
    }

    return user
}

// instance method: change password
userSchema.methods.changePassword = async function (currentPassword, newPassword) {
    const match = await bcrypt.compare(currentPassword, this.password);
    if (!match) throw new HttpError(401, "Current password is incorrect", "UNAUTHORIZED");

    const isSame = await bcrypt.compare(newPassword, this.password);
    if (isSame) throw new HttpError(400, "New password cannot be the same as the current password", "BAD_REQUEST");

    if (newPassword.length < 8 || !validator.isStrongPassword(newPassword)) {
        throw new HttpError(400, "New password is not strong enough", "BAD_REQUEST");
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
};

// instance method: delete user & their triage records
userSchema.methods.deleteWithTriage = async function (password) {
    const match = await bcrypt.compare(password, this.password);
    if (!match) throw new HttpError(401, "Password is incorrect", "UNAUTHORIZED");

    await Triage.deleteMany({ userId: this._id });
    await this.deleteOne();
};

export default mongoose.model('User', userSchema)