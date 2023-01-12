
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getinfo = asynchandler(async (req, res) => {
    const error = []
    let adminName
    connection.query(`select name from org_user where o_uid = ${req.params.o_uid}`, async (err, results, field) => {
        if (err) {
            error.push('Server Error')
            return res.status(500).render('login', {
                error: error
            })
        }
        if (results.length == 0) {
            error.push('User has no privilege to be admin')
            return res.status(500).render('login', {
                error: error
            }) 
        }
        adminName = results[0].name
    })

    const sql = `select p.pid, p.name, p.release_year, p.official_link, p.rating, p.description, c.category_name
                from category c, products p where p.category_id = c.category_id`
    connection.query(sql, async (err, results1, field) => {
        if (err) {
            error.push('Server Error')
            return res.status(500).render('login', {
                error: error
            })
        }
        return res.status(200).render('adminControl', { admin: {name: adminName, o_uid: req.params.o_uid}, products: results1})
    })

})

const addProduct = asynchandler(async (req, res) => {

    const error = []
    const o_uid = req.params.o_uid
    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results, field) => {
        if (err) {
            error.push('Server Error... Try again')
            return res.status(500).render('productCreate', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            return res.status(500).render('login', {error: error})
        }

        connection.query(`insert into products (name, release_year, official_link, description, category_id, org_uid) values 
        ("${req.body.name}", ${req.body.release_year}, "${req.body.official_link}", "${req.body.description}", ${req.body.category_id}, ${o_uid})`,
        (err, results, field) => {
            if (err) {
                if (err.errno === 1062)
                    error.push(err.message)
                else
                    error.push('Server Error')
                return res.render('productCreate', { o_uid: o_uid, error: error })
            } 
            error.push('Product Creation Successful.. You can create another product or Press cancel to go back')
            return res.status(200).render('productCreate', { o_uid: o_uid, error: error })
        })
    })

})

const updateProduct = asynchandler(async (req, res) => {

    const error = []

    const pid = req.params.pid
    const o_uid = req.params.o_uid

    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results1, field) => {
        if (err) {
            error.push('Server Error... Try again')
            return res.status(500).render('productDelete', { o_uid: o_uid, error: error })
        }
        if (results1.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            return res.status(500).render('login', {error: error})
        }
        
        connection.query(`update products set name = ?, release_year = ?, official_link = ?, description = ?, category_id = ? where pid = ${pid}`, 
        [req.body.name, req.body.release_year, req.body.official_link, req.body.description, req.body.category_id],
            async (err, results2, field) => {
                if (err) {
                    error.push('Server Error.. Try again.. You can go Back')
                    return res.status(500).render('productDelete', { o_uid: o_uid, error: error})
                } else {
                    connection.query(`select * from products where pid = ${pid}`,
                    async (err, results3, field) => {
                            if(err){
                                error.push('Server Error while retrieving.. But the product Updated... You can go Back')
                                return res.status(500).render('productDelete', { o_uid: o_uid, error: error})
                            }
                            const product = results3[0]
                            error.push('Product Updated Successfully, You can Update Once again or Press Cancel to go back')
                            return res.status(200).render('productUpdate', { o_uid: o_uid, pid: pid, error: error, product: product})
                    })
                }
            })
        })
})

const deleteProduct = asynchandler(async (req, res) => {

    const error = []
    const pid = req.params.pid
    const o_uid = req.params.o_uid

    if(pid === null){
        error.push('pid required in the request to delete the product')
        return res.render('productDelete', {o_uid: req.params.o_uid, error: error})
    }

    connection.query(`select * from products where pid = ${pid}`, 
        async (err, results, field) => {
        if (err) {  
            error.push('Server Error.. Try again')
            return res.status(500).render('productDelete', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Product not found')
            return res.status(400).render('productDelete', { o_uid: o_uid, error: error })
        }
        connection.query(`delete from products where pid = ${pid}`,
            async (err, results, field) => {
            if (err) {
                error.push(err.message)
                return res.status(500).render('productDelete', { o_uid: o_uid, error: error })
            } else {
                error.push('Product deleted successfully')
                return res.status(200).render('productDelete', { o_uid: o_uid, error: error })
            }
        })
    })
})

const getUpdateForm = asynchandler(async (req, res) => {

    const error = []
    const pid = req.params.pid
    const o_uid = req.params.o_uid
    connection.query(`select * from products where pid = ${pid}`,
        async (err, results, field) => {
        if (err) {  
            error.push(err.message)
            return res.status(500).render('productDelete', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Product Not Found')
            return res.status(400).render('productDelete', { o_uid: o_uid, error: error })
        }
        const product = { 
            name: results[0].name,
            release_year: results[0].release_year,
            official_link: results[0].official_link,
            description: results[0].description
        }
        
        res.status(200).render('productUpdate', { o_uid: o_uid, pid: pid, error: [], product: product})
    })
})

const getCreateForm = asynchandler(async (req, res) => {

    const error = []
    const o_uid = req.params.o_uid
    connection.query(`select * from org_user where o_uid = ${o_uid}`, async (err, results, field) => {
        
        if (err) {
            error.push('Server Error... Try again')
            return res.status(500).render('productDelete', { o_uid: o_uid, error: error })
        }
        if (results.length == 0) {
            error.push('Credentials not matches with admin... Try LogIn again')
            return res.status(500).render('login', {error: error})
        }

        res.render('productCreate', { o_uid: o_uid, error : [] })
    })

})

module.exports = {
    getinfo,
    addProduct,
    updateProduct,
    deleteProduct,
    getUpdateForm,
    getCreateForm
}