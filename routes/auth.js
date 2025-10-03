// routes/auth.js
const express = require('express');
const router = express.Router();
const { CONFIG } = require('../config/constants');
const { generateLoginPage } = require('../views/login');

router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }
  res.send(generateLoginPage(req.query.error));
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
    req.session.user = username;
    console.log(`✅ Admin logged in: ${username}`);
    return res.redirect('/admin');
  }
  
  console.log(`❌ Failed login: ${username}`);
  res.redirect('/auth/login?error=1');
});

router.post('/logout', (req, res) => {
  const user = req.session.user;
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    console.log(`👋 Admin logged out: ${user}`);
    res.redirect('/auth/login');
  });
});

module.exports = router;
