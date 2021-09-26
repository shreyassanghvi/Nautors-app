const express = require("express");
const controller = require('../controllers/userControllers');
const authController = require('../controllers/authController');
const router = express.Router();

///////////////////////////////////////////////////
//  router Calls
//////////////////////////////////////////////////

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword)
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updateMyPassword);
router.patch('/updateMe', authController.protect, controller.updateMe)
router.delete('/deleteMe', authController.protect, controller.deleteMe)

router
    .route('/')
    .get(controller.getAllUsers)
    .post(controller.createUser);
router
    .route('/:id')
    .get(controller.getUserById)
    .patch(controller.updateUserById)
    .delete(controller.deleteUserById);

module.exports = router;