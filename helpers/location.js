const fetch = require('node-fetch');

exports.findDefaultLocation = (clientIP) => {
    if (clientIP === '::1') {
        clientIP = '99.6.40.236';   //get rid of this if statement prior to deployment
    }

    return fetch(`https://geolocation-db.com/json/${ process.env.GEOLOCATION_DB_API_KEY }/${ clientIP }`)
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
}

exports.updateLocation = (locationData) => {
    let geocodingAPICall = '';

    if (locationData.street) {
        geocodingAPICall += '+' + locationData.street.replace(/ /g, '+') + ',';
    }
    if (locationData.city) {
        geocodingAPICall += '+' + locationData.city.replace(/ /g, '+') + ',';
    }
    if (locationData.state) {
        geocodingAPICall += '+' + locationData.state.replace(/ /g, '+') + ',';
    }
    if (locationData.country) {
        geocodingAPICall += '+' + locationData.country.replace(/ /g, '+') + ',';
    }
    if (locationData.zip) {
        geocodingAPICall += '+' + locationData.zip.toString();
    }

    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${ geocodingAPICall }&key=${ process.env.GEOCODING_API_KEY }`)
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};