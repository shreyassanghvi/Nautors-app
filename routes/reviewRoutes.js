const express = require("express");
const controller = require('../controllers/reviewController');
const router = express.Router({mergeParams: true});
const authController = require('../controllers/authController');

router.use(authController.protect);
router
    .route('/')
    .get(controller.getAllReviews)
    .post(authController.resitrictTo('user'), controller.setTourUserID, controller.createNewReview);


router.route('/:id')
    .get(controller.getReviewByID)
    .delete(authController.resitrictTo('user', 'admin'), controller.deleteReviewById)
    .patch(authController.resitrictTo('user', 'admin'), controller.updateReviewById)

module.exports = router;

