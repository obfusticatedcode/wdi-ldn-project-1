const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/wdi-ldn-project-1';

module.exports = { port, dbURI };
