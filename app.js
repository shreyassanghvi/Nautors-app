const path = require('path');
const express = require("express");
const app = express();
const rateLimit = require('express-rate-limit');
const morgan = require("morgan");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require("./routes/viewRoutes")
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
///////////////////////////////////////////////////
//  Middleware
//////////////////////////////////////////////////
// app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', path.join(`${__dirname}`, 'views'));
app.use(express.static(path.join(`${__dirname}`, 'public')));
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
    whiteList: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
}));


///////////////////////////////////////////////////
//  router Calls
//////////////////////////////////////////////////

app.use('/', viewRouter)
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
