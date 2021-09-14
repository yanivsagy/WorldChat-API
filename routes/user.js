const express = require('express');
const router = express.Router();

const { requireSignin, authMiddleware } = require('../controllers/auth');
const {
    getAbout,
    getLocation,
    getPhoto,
    listProfiles,
    getProfile,
    editAbout,
    editLocation,
    uploadPhoto,
    removePhoto
} = require('../controllers/user');

router.get('/user/profile/about', requireSignin, authMiddleware, getAbout);
router.get('/user/profile/location', requireSignin, authMiddleware, getLocation);
router.get('/user/profile/photo/:username/:version', getPhoto);
router.put('/user/profile/edit/about', requireSignin, authMiddleware, editAbout);
router.put('/user/profile/edit/location', requireSignin, authMiddleware, editLocation);
router.put('/user/profile/upload/photo', requireSignin, authMiddleware, uploadPhoto);
router.put('/user/profile/remove/photo', requireSignin, authMiddleware, removePhoto);
router.post('/user/profile/list', listProfiles);
router.get('/user/profile/:username', getProfile);

module.exports = router;