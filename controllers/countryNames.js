const rp = require('request-promise');
const { countryNamesAPI } = require('../config/environment');

function countryProxy(req, res) {

  rp({
    url: `http://ws.geonames.org/countryCodeJSON?lat=${req.query.lat}&lng=${req.query.lng}&username=${countryNamesAPI}`,
    method: 'GET',
    json: true
  })
  .then((country) => {
    res.json(country);
  });
}

module.exports = {
  proxy: countryProxy
};
