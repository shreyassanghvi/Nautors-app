const express = require("express");
const controller = require("./../controllers/viewControllers");

const router = express.Router();

router.get('/', controller.getOverview);

// router.get('/overview', controller.getOverview);

router.get('/tour/:slug', controller.getTour);

module.exports = router;