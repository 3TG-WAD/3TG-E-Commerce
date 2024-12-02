const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landing.controller');

router.get('/', landingController.index);

module.exports = router;