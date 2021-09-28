const express = require("express");
const controller = require('../controllers/reviewController');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .route('/')
    .get(authController.protect, controller.getAllReviews)
    .post(authController.protect, authController.resitrictTo('user'), controller.createNewReview);


module.exports = router;