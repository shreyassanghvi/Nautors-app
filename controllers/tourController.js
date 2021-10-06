const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require("./handlerFactory");
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
exports.createNewTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, {path: 'reviews'})
exports.updateTourById = factory.updateOne(Tour);
exports.deleteTourById = factory.deleteOne(Tour);
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
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlan, unit} = req.params;
    const [lat, lng] = latlan.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!(lat && lng))
        return next(new AppError("Please provide in the format specified: lat,lan", 400));

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    return res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});
exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlan, unit} = req.params;
    const [lat, lng] = latlan.split(',');

    if (!(lat && lng))
        return next(new AppError("Please provide in the format specified: lat,lan", 400));

    const multiplier = (unit === 'mi') ? 0.0006213712 : 0.001;

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }

    ]);
    return res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});