require("dotenv").config();

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

const app = express();

app.locals.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || "";

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use(expressLayouts);

app.use(express.static(`${__dirname}/public`));

mongoose.connect(dbURI);
mongoose.connection.on("connected", () => console.log("MongoDB connected!"));
mongoose.connection.on("error", (err) => console.error(`MongoDB error: ${err}`));
mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected."));

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

app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
app.use(flash());
app.use(customResponses);
app.use(authentication);
app.use(routes);
app.use(errorHandler);

app.listen(port, () => console.log(`Express is listening on port ${port}`));
