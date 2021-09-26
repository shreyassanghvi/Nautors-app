const express = require("express");
const app = express();

const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
///////////////////////////////////////////////////
//  Middleware
//////////////////////////////////////////////////
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
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
