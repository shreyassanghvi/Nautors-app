const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const {model} = require("mongoose");


exports.deleteOne = model => catchAsync(async (req, res, next) => {
    const item = await model.findByIdAndDelete(req.params.id);
    if (!item) {
        return next(new AppError(`No Document with id ${req.params.id}`, 404));
    }
    return res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.updateOne = model => catchAsync(async (req, res, next) => {
    const item = await model.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
    if (!item) {
        return next(new AppError(`No Document with id ${req.params.id}`, 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {
            data: item
        }
    });
});
exports.createOne = model => catchAsync(async (req, res, next) => {
    const newDoc = await model.create(req.body);
    return res.status(201).json({
        status: 'success', data: {
            data: newDoc
        }
    });
});