const Tour = require("./../models/tourModel");
const catchAsync = require('./../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
});
exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'the Forest Hiker'
    })
};
exports.getRoot = (req, res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Jonas'
    });
};
