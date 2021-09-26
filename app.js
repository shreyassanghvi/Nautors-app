const express = require("express");
const app = express();
const rateLimit = require('express-rate-limit');
const morgan = require("morgan");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-santize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
///////////////////////////////////////////////////
//  Middleware
//////////////////////////////////////////////////
app.use(helmet());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));


const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request!! please try again later'
});
app.use('/api', limiter);

app.use(express.json({limit: "10kb"}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whiteList: ['duration'],
}));


app.use(express.static(`${__dirname}/public/`));
///////////////////////////////////////////////////
//  router Calls
//////////////////////////////////////////////////
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
