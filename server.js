const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const { port, env, dbURI, sessionSecret } = require("./config/environment");
const errorHandler = require("./lib/errorHandler");
const routes = require("./config/routes");
const customResponses = require("./lib/customResponses");
const authentication = require("./lib/authentication");

//create an express app
const app = express();

app.get("/getThreeWords", (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const apiKey = process.env.WHAT3WORDS_API_KEY;

  const apiUrl = `https://api.what3words.com/v2/reverse?coords=${lat},${lng}&display=full&format=json&key=${apiKey}`;

  request(apiUrl, (error, response, body) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Failed to fetch data from What3Words API" });
    }
    res.json(JSON.parse(body));
  });
});

//setup template engine
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use(expressLayouts);

//setup static files folder
app.use(express.static(`${__dirname}/public`));

//connect to the database
mongoose.connect(dbURI);

// set up our middleware
if (env !== "test") app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  methodOverride((req) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      const method = req.body._method;
      delete req.body._method;

      return method;
    }
  })
);

// set up sessions
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

// set up flash messages AFTER sessions
app.use(flash());

// set up custom middleware
app.use(customResponses);
app.use(authentication);
// set up our routes - just before the error handler
app.use(routes);
// set up error handler - the LAST piece of middleware
app.use(errorHandler);

app.listen(port, () => console.log(`Express is listening on port ${port}`));
