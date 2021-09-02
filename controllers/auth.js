const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const shortId = require('shortid');
const { findDefaultLocation } = require('../helpers/location');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.preSignup = (req, res) => {
    const { name, email, password } = req.body;

    return User.findOne({ email }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: 'Could not process information.'
            });
        }

        if (user) {
            return res.status(400).json({
                error: 'Email is already taken.'
            });
        }

        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const email_data = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: `Account activation link - ${ process.env.APP_NAME }`,
            html: `
                <h4>Please use the following link to activate your account:</h4>
                <p>${ process.env.CLIENT_URL }/auth/account/activate/${ token }</p>
                <hr/>
                <p>This email may contain sensitive information</p>
                <p>https://worldchat.com</p>`
        };

        return sgMail.send(email_data)
            .then(sent => {
                return res.json({
                    message: `Email has been sent to ${ email }. Follow the instructions to activate your account.`
                });
            })
            .catch(err => console.log(err));
    });
};

exports.signup = (req, res) => {
    const { token } = req.body;

    if (token) {
        return jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired link. Please sign up again.'
                });
            }

            const { name, email, password } = jwt.decode(token);

            const username = shortId.generate();
            const profile = `${ process.env.CLIENT_URL }/profile/${ username }`;

            return findDefaultLocation(req.socket.remoteAddress)
                .then(data => {
                    const location = {
                        country: data.country_name,
                        city: data.city,
                        zip: data.postal,
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude),
                        defaultLat: parseFloat(data.latitude),
                        defaultLong: parseFloat(data.longitude)
                    };

                    const user = new User({ name, email, password, username, profile, location });

                    return user.save()
                        .then(user => {
                            return res.json({
                                message: 'Sign up successful! Please sign in.'
                            });
                        })
                        .catch(err => {
                            return res.status(401).json({
                                error: 'Could not sign up. Please try again.'
                            });
                        });
                })
        });
    } else {
        return res.status(400).json({
            error: 'Could not sign up. Please try again.'
        });
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body;

    return User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please sign up."
            });
        }

        return user.authenticate(password)
            .then(same_password => {
                if (!same_password) {
                    return res.status(400).json({
                        error: "Email and password do not match."
                    });
                }

                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                res.cookie('token', token, { expiresIn: '1d' });

                const { _id, username, name } = user;
                return res.json({
                    token,
                    user: { _id, username, name, email }
                });
            });
    });
};

exports.signout = (req, res) => {
    res.clearCookie('token');
    return res.json({
        message: "Sign out successful."
    })
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth"
});

exports.authMiddleware = (req, res, next) => {
    const _id = req.auth._id;

    User.findById({ _id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found."
            })
        }

        req.profile = user;
        next();
    });
};