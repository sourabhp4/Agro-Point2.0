const express = require('express')
const router = express.Router()

const { validateProfile } = require('../controller/loginController')

router.route('/').get( (req, res) => {
    if (!req.session.user) {
      res.statusCode = 200
      res.render("login", { error: [] })
    } else {
      res.status = 401
      res.redirect(`/api/adminControl/${user.o_uid}`)
    }
  })
  .post(validateProfile)

module.exports = router