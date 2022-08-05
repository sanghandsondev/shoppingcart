var express = require('express')
var router = express.Router()

var auth = require('../middleware/auth')

var Page = require('../models/page')

router.get('/add-page', auth.isAdmin, (req, res) => {
    var title = ""
    var slug = ""
    var content = ""
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content,
    })
})

router.post('/add-page', (req, res) => {
    req.checkBody('title', 'Title must have a value').notEmpty()
    req.checkBody('content', 'Content must have a value').notEmpty()

    var title = req.body.title
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()   // nếu nhập slug 
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase()   //ko nhập slug thì tự động lưu từ Title
    var content = req.body.content

    var errors = req.validationErrors()

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
        })
    } else {
        Page.findOne({ slug: slug }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.')
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content,
                })
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                })
                page.save((err) => {
                    if (err) return console.log(err)
                    Page.find((err, pages) => {
                        if (err) { console.log(err) }
                        else {
                            req.app.locals.pages = pages
                        }
                    })
                    req.flash('success', 'Page added')
                    res.redirect('/admin/pages')
                })
            }
        })
    }
})

router.get('/edit-page/:id', auth.isAdmin, (req, res) => {
    Page.findById(req.params.id, (err, page) => {
        if (err) {
            return console.log(err)
        }

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        })
    })
})

router.post('/edit-page/:id', (req, res) => {
    req.checkBody('title', 'Title must have a value').notEmpty()
    req.checkBody('content', 'Content must have a value').notEmpty()

    var title = req.body.title

    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase()

    var content = req.body.content
    var id = req.params.id

    var errors = req.validationErrors()

    if (errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        })
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.')
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id,
                })
            } else {
                Page.findById(id, (err, page) => {
                    if (err) return console.log(err)
                    page.title = title
                    page.slug = slug
                    page.content = content

                    page.save((err) => {
                        if (err) return console.log(err)
                        Page.find((err, pages) => {
                            if (err) { console.log(err) }
                            else {
                                req.app.locals.pages = pages
                            }
                        })
                        req.flash('success', 'Page updated')
                        res.redirect('/admin/pages/edit-page/' + id)
                    })
                })
            }
        })
    }
})

router.get('/delete-page/:id', auth.isAdmin, (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err) return console.log(err)
        Page.find((err, pages) => {
            if (err) { console.log(err) }
            else {
                req.app.locals.pages = pages
            }
        })
        req.flash('success', 'Page deleted')
        res.redirect('/admin/pages')
    })
})

router.get('/', auth.isAdmin, (req, res) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        res.render('admin/pages', {
            pages: pages
        })
    })
})

//Exports
module.exports = router