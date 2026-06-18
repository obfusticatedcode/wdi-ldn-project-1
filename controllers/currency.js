const axios = require('axios');
const { currencyAPI } = require('../config/environment');

function currencyProxy(req, res, next) {
  axios.get(`http://www.apilayer.net/api/live?access_key=${currencyAPI}`)
    .then((response) => res.json(response.data))
    .catch(next);
}

module.exports = {
  proxy: currencyProxy
};
