const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment-timezone");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const responseOptik = await fetch("http://localhost:5000/api/optik").then(
    (res) => res.json()
  );
  res.render("index", {
    title: "Cetak Kartu Garansi",
    dataOptik: responseOptik.data,
  });
});

// Print Page
router.get("/print/:id", async (req, res) => {
  const response = await fetch(
    "http://localhost:5000/api/garansi/" + req.params.id
  ).then((res) => res.json());

  res.render("print", {
    data: response.data,
    moment: moment,
  });
});

module.exports = router;
