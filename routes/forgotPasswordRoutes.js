const express = require('express')
const router = express.Router()

const { mailPassword } = require('../controller/mailController')

router.route('/')
.get((req, res) => {
    if (!req.session.user) {
    res.statusCode = 200
    res.render("forgotPassword", {error: []})
    } else {
    res.status = 401;
    res.redirect("/api/dashboard?logout+first")
    }
})
.post(mailPassword)

module.exports = router