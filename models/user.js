const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        max: 32,
        unique: true,
        index: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
        max: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    profile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    about: {
        type: String
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    reset_password_link: {
        type: String,
        default: ''
    },
    location: {
        street: {
            type: String
        },
        country: {
            type: String
        },
        state: {
            type: String
        },
        city: {
            type: String
        },
        zip: {
            type: Number
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
        defaultCountry: {
            type: String
        },
        defaultState: {
            type: String
        },
        defaultCity: {
            type: String
        },
        defaultZip: {
            type: Number
        },
        defaultLat: {
            type: Number
        },
        defaultLong: {
            type: Number
        }
    },
    language: {
        type: String,
        required: true,
        default: 'English'
    }
}, { timestamps: true });

userSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    bcrypt.hash(this.password, 10)
        .then(hash => {
            this.password = hash;
            next();
        })
        .catch(err => {
            next(err);
        });
});

userSchema.methods = {
    authenticate: function(plain_text) {
        return bcrypt.compare(plain_text, this.password)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }
};

module.exports = mongoose.model('User', userSchema);