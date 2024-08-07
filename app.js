var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/garansi.router");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use(
  "/fontawesome",
  express.static("node_modules/@fortawesome/fontawesome-free")
);

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // err || {}
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(4001, () => {
  console.log(`Example app listening on port 4000`);
});

module.exports = app;
