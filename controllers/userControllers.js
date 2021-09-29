const User = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const Tour = require("../models/tourModel");

///////////////////////////////////////////////////
//  Callback Function
//////////////////////////////////////////////////
exports.createUser = (req, res) => {
    return res.status(500).json({
        status: 'Error',
        message: "routes Not Implemented"
    });
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    return res.status(200).json({
        status: 'success',
        result: users.length,
        data: {users}
    });
});

const filterObject = (obj, ...allowedOFields) => {
    const newObject = {};
    Object.keys(obj).forEach(el => {
        if (allowedOFields.includes(el))
            newObject[el] = obj[el];
    });
    return newObject;
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('You cannot change password here', 400));
    }
    const updateObject = filterObject(req.body, 'name', 'email');

    const user = await User.findByIdAndUpdate(req.user.id, updateObject, {new: true, runValidators: true});
    return res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({status: 'success', data: null});
});
exports.getUserById = async (req, res) => {
    const users = await User.findById(req.params.id);
    return res.status(200).json({
        status: 'success',
        result: users.length,
        data: {users}
    });
};
exports.updateUserById = factory.updateOne(User);
exports.deleteUserById = factory.deleteOne(User);