const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have name'],
        trim: true,
        minLength: [1, "User name cannot be empty"]
    },
    email: {
        type: String,
        required: [true, "User must have an email address"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Entered email must be a valid email address']

    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    photo: String,
    password: {
        type: String,
        required: [true, "User must have a password"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords do not match",
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();

});

userSchema.pre(/^find/, function (next) {

    this.find({active: {$ne: false}});
    next();
});

userSchema.methods.correctPassword = async function (candidate, userPassword) {
    return await bcrypt.compare(candidate, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWWTimestamp) {

    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(JWWTimestamp < changedTimeStamp)
        return JWWTimestamp < changedTimeStamp;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log(resetToken, this.passwordResetToken)
    return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;