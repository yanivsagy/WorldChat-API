const User = require('../models/user');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');
const { updateLocation } = require('../helpers/location');

exports.getAbout = (req, res) => {
    const _id = req.auth._id;

    return User.findOne({ _id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            })
        }

        const { username, language, about } = user;
        const aboutData = { username, language, about };

        return res.json(aboutData);
    });
};

exports.getLocation = (req, res) => {
    const _id = req.auth._id;

    return User.findOne({ _id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            })
        }

        const { street, city, country, zip } = user.location;
        const locationData = { street, city, country, zip };

        return res.json(locationData);
    });
};

exports.getPhoto = (req, res) => {
    const username = req.params.username;

    return User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            })
        }

        if (user.photo && user.photo.data) {
            res.set('Content-Type', user.photo.contentType);
            return res.send(user.photo.data);
        } else {
            res.set('Content-Type', 'Image/jpeg');
            return res.sendFile(process.env.DEFAULT_USER_PHOTO_PATH);
        }
    });
};

exports.editAbout = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    return form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Information could not be updated.'
            });
        }

        let user = req.profile;
        user = _.extend(user, fields);

        return user.save()
            .then(user => {
                user.password = undefined;
                user.photo = undefined;
                user.location = undefined;
                user.profile = undefined;
                user.reset_password_link = undefined;

                return res.json(user);
            })
            .catch(err => {
                return res.status(401).json({
                    error: 'Could not save updates. Please try again.'
                });
            });
    });
};

exports.editLocation = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    return form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Information could not be updated.'
            });
        }

        let user = req.profile;
        location = _.extend(user.location, fields);
        user.location = location;

        return updateLocation(location)
            .then(data => {
                if (data.error_message) {
                    user.location.latitude = user.location.defaultLat;
                    user.location.longitude= user.location.defaultLong;
                } else {
                    user.location.latitude = data.results[0].geometry.location.lat;
                    user.location.longitude = data.results[0].geometry.location.lng;
                }

                return user.save()
                    .then(user => {
                        return res.json(user.location);
                    })
                    .catch(err => {
                        return res.status(401).json({
                            error: 'Could not save updates. Please try again.'
                        });
                    });
            });
    });
};

exports.editPhoto = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    return form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Profile photo could not be uploaded.'
            });
        }

        let user = req.profile;

        if (files.upload) {
            if (files.upload.size > 10000000) {
                return json.status(400).json({
                    error: 'Photo should be less than 1 MB.'
                });
            }

            return fs.readFile(files.upload.path, (err, data) => {
                if (err) {
                    return json.status(400).json({
                        error: 'Profile photo could not be uploaded.'
                    });
                }

                user.photo.data = data;
                user.photo.contentType = files.upload.type;

                return user.save()
                    .then(user => {
                        return res.json({
                            message: 'Profile photo successfully updated!'
                        });
                    })
                    .catch(err => {
                        return res.status(401).json({
                            error: 'Could not save updates. Please try again.'
                        });
                    });
            })
        } else {
            let user = req.profile;
            user.photo = undefined;

            return user.save()
                .then(user => {
                    return res.json({
                        message: 'Profile photo successfully removed!'
                    });
                })
                .catch(err => {
                    return res.status(401).json({
                        error: 'Could not save updates. Please try again.'
                    });
                });
        }
    });
};