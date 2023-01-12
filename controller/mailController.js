const asynchandler = require('express-async-handler')
const Joi = require('joi')
const transporter = require('../config/mailConfig')
const connection = require('../config/db')
const { decrypt } = require('../config/crypto')

const mailPassword = asynchandler(async (req, res) => {

    const error = []

    connection.query(`select password from ${req.body.type} where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            error.push('Server error')
            return res.status(500).render('forgotPassword', { error: error })
        } else {
            if (results.length == 0) {
                error.push('Entered email not registered')
                return res.status(400).render('forgotPassword', { error: error })
            }
            results[0].password = decrypt(results[0].password)
            sendMail(req, res, results, error)
        }
    })

})

function sendMail(req, res, user, error){
    try{

        const mailOptions = {
            from: process.env.email,
            to: req.body.email,
            subject: 'Password for login to Agro-Point',
            text: `Your Agro-Point Account Password : ${user[0].password} 
                   Don't share this with anyone`,
        }

        transporter.sendMail(mailOptions, (err, info) =>{
            if(err){
                error.push('Server error')
                return res.status(500).render('forgotPassword', { error: error })
            }
            error.push('See for mail from us...click LOGIN to go to login page')
            res.status(200).render('forgotPassword', { error: error })
        })


    }

    catch(err){
        res.status(400)
        throw new Error(err.message)
    }
}


function validate(obj){
    const schema = Joi.object({
        email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),

        profile_type: Joi.string()
        .valid('user','org_user')
        .required()
    })

    return schema.validate(obj).error
}

module.exports = {
    mailPassword
}