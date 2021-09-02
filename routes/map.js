const express = require('express');
const router = express.Router();

const { populateMap } = require('../controllers/map');

router.get('/map/populate-map', populateMap);

module.exports = router;