const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory");


exports.getAllReviews = factory.getAll(Review);
exports.getReviewByID = factory.getOne(Review);
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