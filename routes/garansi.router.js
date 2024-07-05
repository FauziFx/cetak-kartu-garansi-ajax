const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment-timezone");
const dotenv = require("dotenv");
dotenv.config();
/* GET home page. */
router.get("/", async (req, res, next) => {
  const responseOptik = await fetch(process.env.URL_API + "optik").then((res) =>
    res.json()
  );
  res.render("index", {
    title: "Cetak Kartu Garansi",
    dataOptik: responseOptik.data,
  });
});

// Print Page
router.get("/print/:id", async (req, res) => {
  const response = await fetch(
    process.env.URL_API + "garansi/" + req.params.id
  ).then((res) => res.json());

  res.render("print", {
    data: response.data,
    moment: moment,
  });
});

module.exports = router;
