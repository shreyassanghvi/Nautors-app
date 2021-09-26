const express = require("express");
const controller = require('../controllers/tourController');
const router = express.Router();
const authController = require('../controllers/authController');
///////////////////////////////////////////////////
//  router Calls
//////////////////////////////////////////////////

router.route('/top-five-cheap')
    .get(controller.aliasTopTour, controller.getAllTours)
router.route('/tour-stats')
    .get(controller.getTourStats);
router.route('/monthly-plan/:year')
    .get(controller.getMonthlyPlan);
router
    .route('/')
    .get(authController.protect, authController.resitrictTo('admin'), controller.getAllTours)
    .post(controller.createNewTour);
router
    .route('/:id')
    .get(controller.getTourById)
    .patch(controller.updateTourById)
    .delete(authController.protect, authController.resitrictTo('admin'), controller.deleteTourById);

module.exports = router;