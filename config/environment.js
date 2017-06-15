const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';
const currencyAPI = process.env.CURRENCY_LAYER_API_KEY;
const countryNamesAPI = process.env.GEONAMES_API_USERNAME;
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/wdi-ldn-project-1';
const sessionSecret = process.env.SESSION_SECRET || 'my awesome secret';

module.exports = { port, env, dbURI, currencyAPI, countryNamesAPI, sessionSecret };
