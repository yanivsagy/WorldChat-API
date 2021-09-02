const express = require('express');
const router = express.Router();

const { userSigninValidator, userSignupValidator } = require('../validators/auth');
const { runValidation } = require('../validators');
const { preSignup, signup, signin } = require('../controllers/auth');

router.post('/auth/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/auth/signup', signup);
router.post('/auth/signin', userSigninValidator, runValidation, signin);

module.exports = router;