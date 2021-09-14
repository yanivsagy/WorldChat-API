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
            });
        }

        const { name, username, language, about } = user;
        const aboutData = { name, username, language, about };

        return res.json(aboutData);
    });
};

exports.getLocation = (req, res) => {
    const _id = req.auth._id;

    return User.findOne({ _id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            });
        }

        return res.json(user.location);
    });
};

exports.getPhoto = (req, res) => {
    const username = req.params.username;

    return User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            });
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

        const { name, username, language } = fields;

        if (!name) {
            return res.status(400).json({
                error: 'Name is required.'
            });
        }
        if (!username) {
            return res.status(400).json({
                error: 'Username is required.'
            });
        }
        if (username.includes(" ")) {
            return res.status(400).json({
                error: 'Username cannot include a space.'
            });
        }
        if (!language) {
            return res.status(400).json({
                error: 'Language is required.'
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

        const { country } = fields;

        if (!country) {
            return res.status(400).json({
                error: 'Country is required.'
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

exports.uploadPhoto = (req, res) => {
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
        }
    });
};

exports.removePhoto = (req, res) => {
    const _id = req.auth._id;

    User.updateOne({ _id }, { $unset: { photo: '' } }).exec((err, user) => {
        if (err) {
            return res.status(401).json({
                error: 'Could not save updates. Please try again.'
            });
        }

        return res.json({
            message: 'Profile photo successfully removed!'
        });
    });
};

exports.listProfiles = (req, res) => {
    const coordinates = req.body.coordinates;

    let arrCoordinates = coordinates.split('&');
    lat = parseFloat(arrCoordinates[0].substring(4));
    lng = parseFloat(arrCoordinates[1].substring(4));

    return User.find({
        $and: [{ "location.latitude": lat }, { "location.longitude": lng }]
    })
        .select('name username')
        .exec((err, users) => {
            if (err || !users) {
                return res.status(400).json({
                    error: "Could not find users at the specified coordinates."
                });
            }

            return res.json(users);
        });
}

exports.getProfile = (req, res) => {
    const username = req.params.username;

    return User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found.'
            })
        }

        user.photo = undefined;

        return res.json(user);
    });
};