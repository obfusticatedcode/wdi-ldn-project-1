const axios = require('axios');
const { countryNamesAPI } = require('../config/environment');

function countryProxy(req, res, next) {
  axios.get(`http://ws.geonames.org/countryCodeJSON?lat=${req.query.lat}&lng=${req.query.lng}&username=${countryNamesAPI}`)
    .then((response) => res.json(response.data))
    .catch(next);
}

module.exports = {
  proxy: countryProxy
};
