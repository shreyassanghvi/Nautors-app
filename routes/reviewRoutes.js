const express = require("express");
const controller = require('../controllers/reviewController');
const router = express.Router({mergeParams: true});
const authController = require('../controllers/authController');

router
    .route('/')
    .get(authController.protect, controller.getAllReviews)
    .post(authController.protect, authController.resitrictTo('user'), controller.setTourUserID, controller.createNewReview);


router.route('/:id')
    .get(controller.getReviewByID)
    .delete(controller.deleteReviewById)
    .patch(controller.updateReviewById)

module.exports = router;