const User = require('../models/user');

exports.populateMap = (req, res) => {
    return User.find({}, { location: 1, _id: 0 }).exec((err, users) => {
        if (err || !users) {
            return res.status(400).json({
                error: "Could not find users."
            })
        }

        return res.json(users);
    });
}