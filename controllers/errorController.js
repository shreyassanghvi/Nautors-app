const AppError = require('../utils/appError')
const sendDevError = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
};
const sendProdError = (err, res) => {
    if (err.isOperational)
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    else {
        return res.status(500).json({
            status: 'Fail',
            message: 'Something went wrong. Please try again'
        })
    }
}
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}
const handleDuplicateFieldDbError = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate field ${value}. Please use another field!!`;
    return new AppError(message, 400);
}
const handleValidatorErrorDB = (err) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid Input error: ${errors.join(', ')}`;
    return new AppError(message, 400);
}
const JsonWebTokenError = () => {
    return new AppError("Invalid Token Please try again", 401);
}
const JWTTokenExpiredError = () => {
    return new AppError('Token Expired Please try again', 401);
}
module.exports = (err, req, res, next) => {

    err.status = err.status || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development')
        sendDevError(err, res);
    else if (process.env.NODE_ENV === 'production') {
        let error = {...err};
        error.name = err.name;
        if (error.name === 'CastError')
            error = handleCastErrorDB(error);
        else if (error.code === 11000)
            error = handleDuplicateFieldDbError(error);
        else if (error.name === 'ValidationError')
            error = handleValidatorErrorDB(error);
        else if (err.name === 'JsonWebTokenError')
            error = JsonWebTokenError();
        else if (err.name === 'TokenExpiredError')
            error = JWTTokenExpiredError();
        sendProdError(error, res);
    }

    next();
}