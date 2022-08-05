var express = require('express')
var router = express.Router()

let Page = require('../models/page')
// let Category = require('../models/category')

router.get('/:slug', (req, res) => {
    var slug = req.params.slug
    Page.findOne({ slug: slug }, (err, page) => {
        if (err) console.log(err)
        if (page) {
            res.render('index', {
                title: page.title,
                content: page.content
            })
        }

    })

})

router.get('/', (req, res) => {
    Page.findOne({ slug: 'home' }, (err, page) => {
        if (err) console.log(err)
        res.render('index', {
            title: page.title,
            content: page.content,
        })
    })


})

//Exports
module.exports = router