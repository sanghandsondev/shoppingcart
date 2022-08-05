var express = require('express')
var router = express.Router()

var auth = require('../middleware/auth')

let mkdirp = require('mkdirp')
var fs = require('fs-extra')
var resizeImg = require('resize-img')

//Get model
var Product = require('../models/product')
var Category = require('../models/category')

router.get('/add-product', auth.isAdmin, (req, res) => {
    var title = ""
    var desc = ""
    var price = ""
    Category.find((err, categories) => {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        })
    })
})

router.post('/add-product', (req, res) => {

    let imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : ''

    req.checkBody('title', 'Title must have a value').notEmpty()
    req.checkBody('desc', 'Description must have a value').notEmpty()
    req.checkBody('price', 'Price must have a value').isDecimal()
    // req.checkBody('image', 'You must upload an image').isImage(imageFile)

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-').toLowerCase()
    var desc = req.body.desc
    var price = req.body.price
    var category = req.body.category

    var errors = req.validationErrors()

    if (errors) {
        Category.find((err, categories) => {
            if (err) return console.log(err)
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })
        })
    } else {
        Product.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.')
                Category.find((err, categories) => {
                    if (err) return console.log(err)
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    })
                })
            } else {
                var price2 = parseFloat(price).toFixed(2)
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                })
                product.save((err) => {
                    if (err) return console.log(err)

                    mkdirp('public/images/product_images/' + product._id)
                    mkdirp('public/images/product_images/' + product._id + '/gallery')
                    mkdirp('public/images/product_images/' + product._id + '/gallery/thumbs')


                    if (imageFile != "") {
                        var productImage = req.files.image
                        let path = __dirname + 'public/images/product_images/' + product._id + '/' + imageFile
                        productImage.mv(path, (err) => {
                            return console.log(err)
                        })
                    }

                    req.flash('success', 'Product added')
                    res.redirect('/admin/products')
                })
            }
        })
    }
})

router.get('/edit-product/:id', auth.isAdmin, (req, res) => {

    var errors
    if (req.session.errors) errors = req.session.errors
    req.session.errors = null

    Category.find((err, categories) => {
        Product.findById(req.params.id, (err, p) => {
            if (err) {
                console.log(err)
                res.redirect('/admin/products')
            } else {
                var galleryDir = 'public/images/product_images/' + p._id + '/gallery'
                var galleryImages = null

                fs.readdir(galleryDir, (err, files) => {
                    if (err) { console.log(err) }
                    else {
                        galleryImages = files

                        res.render('admin/edit_product', {
                            errors: errors,
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        })
                    }
                })
            }
        })

    })
})

router.post('/edit-product/:id', (req, res) => {

    req.checkBody('title', 'Title must have a value').notEmpty()
    req.checkBody('desc', 'Description must have a value').notEmpty()
    req.checkBody('price', 'Price must have a value').isDecimal()
    // req.checkBody('image', 'You must upload an image').isImage(imageFile)

    var title = req.body.title
    var slug = title.replace(/\s+/g, '-').toLowerCase()
    var desc = req.body.desc
    var price = req.body.price
    var category = req.body.category
    var pimage = req.body.pimage
    var id = req.params.id

    let imageFile = typeof req.files.image != 'undefined' ? req.files.image.name : ""

    var errors = req.validationErrors()
    if (errors) {
        req.session.errors = errors
        res.redirect('/admin/products/edit-product/' + id)
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, (err, p) => {
            if (err) console.log(err)
            if (p) {
                req.flash('danger', 'Product title exists, choose another.')
                res.redirect('admin/products/edit-product/' + id)
            } else {
                Product.findById(id, (err, p) => {
                    if (err) return console.log(err)
                    p.title = title
                    p.slug = slug
                    p.desc = desc
                    p.price = parseFloat(price).toFixed(2)
                    p.category = category
                    if (imageFile != "")
                        p.image = imageFile

                    p.save((err) => {
                        if (err) return console.log(err)
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/images/product_images/' + id + '/' + pimage)
                            }
                        }
                        var productImage = req.files.image
                        let path = __dirname + 'public/images/product_images/' + id + '/' + imageFile
                        productImage.mv(path, (err) => {
                            return console.log(err)
                        })

                        req.flash('success', 'Product updated')
                        res.redirect('/admin/products/edit-product/' + id)
                    })
                })
            }
        })
    }
})

router.get('/delete-product/:id', auth.isAdmin, (req, res) => {
    var id = req.params.id
    var path = 'public/images/product_images/' + id
    fs.remove(path, (err) => {
        if (err) console.log(err)
        else {
            Product.findByIdAndRemove(id, (err) => {
                console.log(err)
                req.flash('success', 'Product deleted')
                res.redirect('/admin/products')
            })

        }
    })
})

router.get('/', auth.isAdmin, (req, res) => {
    var count
    Product.count((err, c) => {
        count = c
    })

    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        })
    })
})

//Exports
module.exports = router