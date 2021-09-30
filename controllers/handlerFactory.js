const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const {model} = require("mongoose");
const APIFeatures = require("../utils/APIFeatures");


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

exports.getOne = (model, popOptions) => catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id)
    if (popOptions)
        query = query.populate(popOptions)

    const doc = await query;
    if (!doc) {
        return next(new AppError(`No document with id ${req.params.id}`, 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});
exports.getAll = model => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = {tour: req.params.tourId}
    const features = new APIFeatures(model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const doc = await features.query;
    return res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    });
});