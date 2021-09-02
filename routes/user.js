const express = require('express');
const router = express.Router();

const { requireSignin, authMiddleware } = require('../controllers/auth');
const { getAbout, getLocation, getPhoto, editAbout, editLocation, editPhoto } = require('../controllers/user');

router.get('/user/profile/about', requireSignin, authMiddleware, getAbout);
router.get('/user/profile/location', requireSignin, authMiddleware, getLocation);
router.get('/user/profile/photo/:username', getPhoto);
router.put('/user/profile/edit/about', requireSignin, authMiddleware, editAbout);
router.put('/user/profile/edit/location', requireSignin, authMiddleware, editLocation);
router.put('/user/profile/edit/photo', requireSignin, authMiddleware, editPhoto);

module.exports = router;