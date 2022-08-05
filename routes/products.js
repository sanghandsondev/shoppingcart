var express = require('express')
var router = express.Router()
var fs = require('fs-extra')


let Product = require('../models/product')
let Category = require('../models/category')

router.get('/:category/:product', (req, res) => {

    //check lại để show Gallery Images

    var loggedIn = (req.isAuthenticated()) ? true : false

    Product.findOne({ slug: req.params.product }, (err, product) => {
        if (err) { console.log(err) }
        else {
            res.render('product', {
                title: product.title,
                p: product,
                loggedIn: loggedIn
            })
        }
    })
})

router.get('/:category', (req, res) => {
    Category.findOne({ slug: req.params.category }, (err, cat) => {
        if (err) console.log(err)
        Product.find({ category: req.params.category }, (err, products) => {
            if (err) console.log(err)
            res.render('cat_products', {
                title: cat.title,
                products: products,
            })
        })
    })
})

router.get('/', (req, res) => {
    Product.find((err, products) => {
        if (err) console.log(err)
        res.render('all_products', {
            title: 'All products',
            products: products,
        })
    })


})

//Exports
module.exports = router