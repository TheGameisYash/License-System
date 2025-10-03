// routes/landing.js
const express = require('express');
const router = express.Router();
const { generateLandingPage } = require('../views/landing');

router.get('/', (req, res) => {
  res.send(generateLandingPage());
});

module.exports = router;
