const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require("../utils/APIFeatures");


exports.getAllReviews = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const review = await features.query;
    return res.status(200).json({
        status: 'success',
        result: review.length,
        data: {review}
    });
});
exports.createNewReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);
    return res.status(201).json({
        status: "Success",
        data: {
            review: newReview
        }
    });
});
