const e = require('connect-flash')
var express = require('express')
var router = express.Router()

var auth = require('../middleware/auth')

let Product = require('../models/product')


router.get('/add/:product', auth.isUser, (req, res) => {

    var slug = req.params.product
    Product.findOne({ slug: slug }, (err, p) => {
        if (err) console.log(err)
        if (typeof req.session.cart == "undefined") {
            req.session.cart = []
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/images/product_images/' + p.image
            })
        } else {
            let cart = req.session.cart

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {      //that is not a new item
                    cart[i].qty++

                    break;
                }
                else {
                    req.session.cart.push({
                        title: slug,
                        qty: 1,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/images/product_images/' + p.image
                    })
                    break
                }
            }
        }
        // req.session.cart = cart
        // console.log(req.session.cart)
        req.flash('success', 'Product added to cart')
        res.redirect('back')
    })


})

router.get('/update/:product', auth.isUser, (req, res) => {
    var slug = req.params.product
    var cart = req.session.cart
    var action = req.query.action
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++
                    break
                case "sub":
                    cart[i].qty--
                    if (cart[i].qty < 1) cart.splice(i, 1)
                    break
                case "clear":
                    cart.splice(i, 1)
                    if (cart.length == 0) delete req.session.cart
                    break
                default:
                    console.log('update problem')
                    break
            }
            break
        }
    }
    req.flash('success', 'Cart updated')
    res.redirect('/cart/checkout')
})

router.get('/clear', auth.isUser, (req, res) => {
    delete req.session.cart
    req.flash('success', 'Cart cleared!')
    res.redirect('/cart/checkout')

})

router.get('/checkout', auth.isUser, (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart
        res.redirect('/cart/checkout')
    }
    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    })
})

//Exports
module.exports = router 