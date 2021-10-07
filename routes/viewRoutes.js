const express = require("express");
const controller = require("./../controllers/viewControllers")
const router = express.Router();

router.get('/', controller.getRoot);

router.get('/overview', controller.getOverview);

router.get('/tour', controller.getTour);

module.exports = router;