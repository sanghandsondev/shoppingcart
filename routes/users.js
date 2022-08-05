var express = require('express')
var router = express.Router()
var passport = require('passport')
var bcrypt = require('bcryptjs')

let User = require('../models/user')

router.get('/register', (req, res) => {

    res.render('register', {
        title: 'Register'
    })
})

router.post('/register', (req, res) => {
    var name = req.body.name
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var password2 = req.body.password2

    req.checkBody('name', 'Name is required!').notEmpty()
    req.checkBody('email', 'Email must be an email').isEmail()
    req.checkBody('username', 'Username is required!').notEmpty()
    req.checkBody('password', 'Password is required!').notEmpty()
    req.checkBody('password2', 'Password do not match!').equals(password)

    var errors = req.validationErrors()

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register',
        })
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err) console.log(err)
            if (user) {
                req.flash('danger', 'Username exists, choose another!')
                res.redirect('/users/register')
            } else {

                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: false
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        user.password = hash

                        user.save((err) => {
                            if (err) console.log(err)
                            else {
                                req.flash('success', 'You are now registered!')
                                res.redirect('/users/login')
                            }
                        })
                    })
                })
            }
        })
    }
})

router.get('/login', (req, res) => {
    if (res.locals.user) res.redirect('/')
    res.render('login', {
        title: 'Login'
    })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res) => {
    var loggedIn = (req.isAuthenticated()) ? true : false
    if (loggedIn) {

        req.logout()

        req.flash('success', 'You are logged out!')
        res.redirect('/users/login')
    } else {
        req.flash('danger', 'Something wrong, you are not logginng')
        res.redirect('back')
    }
})

//Exports
module.exports = router