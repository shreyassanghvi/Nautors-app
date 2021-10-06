const express = require("express");
const controller = require('../controllers/tourController');
const router = express.Router();
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes')
///////////////////////////////////////////////////
//  router Calls
//////////////////////////////////////////////////

router.use('/:tourId/review', reviewRouter);
router.route('/distances/:latlan/unit/:unit').get(controller.getDistances);
router.route('/top-five-cheap')
    .get(controller.aliasTopTour, controller.getAllTours)
router.route('/tour-stats')
    .get(controller.getTourStats);
router.route('/monthly-plan/:year')
    .get(authController.protect, authController.resitrictTo('admin', 'lead-guide', 'guide'), controller.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlan/unit/:unit').get(controller.getToursWithin)

router
    .route('/')
    .get(controller.getAllTours)
    .post(authController.protect, authController.resitrictTo('admin', 'lead-guide'), controller.createNewTour);
router
    .route('/:id')
    .get(controller.getTourById)
    .patch(authController.protect, authController.resitrictTo('admin', 'lead-guide'), controller.updateTourById)
    .delete(authController.protect, authController.resitrictTo('admin', 'lead-guide'), controller.deleteTourById);


module.exports = router;