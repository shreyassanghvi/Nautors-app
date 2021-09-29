const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory");


exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = {tour: req.params.tourId}


    const review = await Review.find(filter);
    return res.status(200).json({
        status: 'success',
        result: review.length,
        data: {review}
    });
});
exports.setTourUserID = (req, res, next) => {
    if (!req.body.tour)
        req.body.tour = req.params.tourId;
    if (!req.body.user)
        req.body.user = req.user.id;
    next();
};
exports.createNewReview = factory.createOne(Review);
exports.deleteReviewById = factory.deleteOne(Review);
exports.updateReviewById = factory.updateOne(Review)