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
    birthDate: {
        type: Date,
        required: true,
    },
    sex: {
        type: String,
        enum: ['male', 'female'],
        required: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, {
    timestamps: true, toJSON: { virtuals: true },  // include virtuals in JSON
    toObject: { virtuals: true } // include virtuals when using .toObject()},
});

// virtual property for age (does not store age in DB, calculates it and returns in user body instead)
userSchema.virtual('age').get(function () {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

// static signup method
userSchema.statics.signup = async function (email, password, birthDate, sex) {
    // validation 
    if (!email || !password || !birthDate || !sex) {
        throw Error('All fields must be filled in');
    }

    // validate password
    if (password.length < 8) {
        throw Error('Password must be at least 8 characters long');
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // validate email
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid');
    }
    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('Email already in use. Please login instead');
    }

    // validate birthDate
    const birth = new Date(birthDate);
    if (isNaN(birth)){
        throw Error('Invalid birth date');
    } 
    if (birth > new Date()){
        throw Error('Birth date cannot be in the future');
    } 
    const age = new Date().getFullYear() - birth.getFullYear();
    if (age < 0 || age > 120) {
        throw Error('Invalid age range');
    }

    // validate sex
    sex = sex.toLowerCase();
    if (!['male', 'female'].includes(sex)) {
        throw Error('Invalid sex value');
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({ email, password: hash, birthDate, sex });

    return user;
}

// static login method
userSchema.statics.login = async function (email, password) {
    // validation
    if (!email || !password) {
        throw Error('All fields must be filled in')
    }

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