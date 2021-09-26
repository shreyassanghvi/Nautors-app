const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync')
const AppError = require("../utils/appError");
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signInToken = (id) => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_TOKEN_EXPIRATION});
}
const createAndSendToken = (user, statusCode, res) => {
    let token = signInToken(user._id);

    let cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
        secure: false,
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOption.secure = true;
    }
    res.cookie('jwt', token, cookieOption);
    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            name: user.name,
            email: user.email,
            role: user.role,
        }
    });
};


exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!(email && password)) {
        return next(new AppError('Please Enter email and password', 400));
    }
    const user = await User.findOne({email: email}).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect username or password', 401));
    }

    createAndSendToken(user, 200, res);
});


exports.protect = catchAsync(async (req, res, next) => {
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = (req.headers.authorization.split(' '))[1];
    }
    if (!token)
        return next(new AppError('You are not logged in', 401));
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
        return next(new AppError('The User does not exist', 401));

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password', 401));
    }
    req.user = currentUser;
    next();
});

exports.resitrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to view this page.', 403))
        }
        next();
    }
};

exports.forgetPassword = catchAsync(async (req, res, next) => {

    const user = await User.findOne({email: req.body.email});
    if (!user)
        return next(new AppError('Provide Email and password', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot Password? Visit to reset password: ${resetUrl}\n`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token valid for 10 minutes',
            message: message
        });
        return res.status(200).json({
            status: 'success',
            message: "Token sent to the email address!"
        })
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError("There wan an error sending email", 500));
    }

});
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
    if (!user)
        return next(new AppError('Token is either invalid or expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createAndSendToken(user, 200, res);

});
exports.updateMyPassword = catchAsync(async (req, res, next) => {

    const {passwordCurrent, password, passwordConfirm} = req.body;
    console.log('Test')
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.correctPassword(passwordCurrent, user.password))) {
        return next(new AppError('Incorrect password', 401));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    createAndSendToken(user, 200, res);
});