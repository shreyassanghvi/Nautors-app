const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
///////////////////////////////////////////////////
//  Middleware
//////////////////////////////////////////////////

exports.aliasTopTour = (req, res, next) => {

    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}

///////////////////////////////////////////////////
//  Callback Function
//////////////////////////////////////////////////
exports.createNewTour = catchAsync(async (req, res, next) => {
    const newTours = await Tour.create(req.body);
    return res.status(201).json({
        status: 'success', data: {
            tour: newTours
        }
    });
});
exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;
    return res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {tours}
    });
});
exports.getTourById = catchAsync(async (req, res, next) => {
    const tours = await Tour.findById(req.params.id).populate('reviews')
    if (!tours) {
        return next(new AppError(`No Tour with id ${req.params.id}`, 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {tours}
    });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
    if (!tour) {
        return next(new AppError(`No Tour with id ${req.params.id}`, 404));
    }
    return res.status(200).json({
        status: 'success',
        data: {tour}
    });
});
exports.deleteTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError(`No Tour with id ${req.params.id}`, 404));
    }
    return res.status(204).json({
        status: 'success',
        data: null
    });
});
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: {$gte: 4.5}
            }
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRating: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    return res.status(200).json({
        status: 'success',
        data: {stats}
    });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: {$month: '$startDates'},
                noOfTours: {$sum: 1},
                tours: {$push: '$name'},
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                noOfTours: -1
            }
        },
        {
            $limit: 12
        }
    ]);
    return res.status(200).json({
        status: 'success',
        data: {plan}
    });
});

