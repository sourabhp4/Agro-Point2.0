
const asynchandler = require('express-async-handler')
const { decrypt } = require('../config/crypto')
const connection = require('../config/db')

const validateProfile = asynchandler(async (req, res) => {
    const error = []
    
    connection.query(`select * from ${req.body.type} where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            res.status(500).render('login', {
                error: error
              })
        } else {
            if (results.length == 0) {
                error.push('The entered credentials do not match')
                return res.status(400).render('login', {
                    error: error
                  })
            }
            
            const pwd = decrypt(results[0].password)
            if (pwd === req.body.password) {
                if(req.body.type === 'user'){
                    req.session.user = results[0];
                    res.redirect(`/api/home/${results[0].uid}`)
                }
                else{
                    req.session.user = results[0]
                    res.redirect(`/api/adminControl/${results[0].o_uid}`)
                }
            } else {
                error.push('Entered credentials do not match')
                res.status(401).render('login', {
                    error: error
                })
            }
        }
    })

})


const logout = asynchandler(async (req, res) => {

    if (req.session.user) {
        
        req.session.destroy(() => {

            res.status(200).redirect('/api/login')
            
        })

    } else {
      res.status(400).redirect('/api/login')
    }
})

module.exports = {
    validateProfile,
    logout
}