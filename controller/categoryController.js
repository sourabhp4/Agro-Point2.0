
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getProducts = asynchandler(async (req, res) => {
    
    const category_id = req.params.category_id
    const error = []

    connection.query(`select * from category where category_id = ${category_id}`, async (err, results1, field) => {
        if (err) {
            error.push('Server Error')
            req.session.destroy(() => {
                return res.status(500).render('login', {
                    error: error
                })
            })
        } else {
            if (results1.length == 0) {
                error.push('You are trying to access UNAUTHORIZED CONTENT')
                req.session.destroy(() => {
                    return res.status(401).render('login', {
                        error: error
                    })
                })
            }
            else{
                connection.query(`select pid, name, rating, description from products where category_id = ${category_id}`,(err, results2, field) => {
                    if (err){
                        error.push('Server Error')
                        req.session.destroy(() => {
                            return res.status(500).render('login', {
                                error: error
                            })
                        })
                    }
                    else{
                        const categoryProducts = { category_name: results1[0].category_name, 
                            desc: results1[0].description,
                            products: results2
                        }
                        res.render('categoryProducts', categoryProducts)
                    }
                })
            }
        }
    })

})

const getCategories = asynchandler(async (req, res) => {

    return res.status(200).render('categories', { userName: req.session.user.name })

})

module.exports = {
    getCategories,
    getProducts
}