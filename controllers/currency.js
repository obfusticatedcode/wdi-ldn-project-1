
const rp = require('request-promise');
const { currencyAPI } = require('../config/environment');

function currencyProxy(req, res) {
  rp({
    url: `http://www.apilayer.net/api/live?access_key=${currencyAPI}`,
    method: 'GET',
    json: true
  })
  .then((currency) => {
    res.json(currency);
  });
}

module.exports = {
  proxy: currencyProxy
};
