const express = require('express')
const router = express.Router()

const { getinfo ,addProduct, updateProduct, deleteProduct, getUpdateForm, getCreateForm } = require('../controller/adminController')

router.route('/:o_uid').get(getinfo)


router.route('/update/:o_uid/:pid').post(updateProduct).get(getUpdateForm)
router.route('/delete/:o_uid/:pid').post(deleteProduct)
router.route('/add/:o_uid').get(getCreateForm)
.post(addProduct)

module.exports = router