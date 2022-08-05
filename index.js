var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var session = require('express-session')
var expressValidator = require('express-validator')
var fileUpload = require('express-fileupload')
var passport = require('passport')
const dotenv = require('dotenv')

dotenv.config()

//Connect to DB
mongoose.connect(process.env.DATABASE)
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('Connected to MongoDB')
})

//Init app
var app = express()

//View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Set global errors variable
app.locals.errors = null

// Get Page Model
var Page = require('./models/page')
// Get all pages to pass to header.ejs
//(do header dùng chung nên mới lưu model vào biến local chung)
Page.find((err, pages) => {
    if (err) { console.log(err) }
    else {
        app.locals.pages = pages
    }
})

var Category = require('./models/category')
Category.find((err, categories) => {
    if (err) { console.log(err) }
    else {
        app.locals.categories = categories
    }
})

// Express fileUpload middleware
app.use(fileUpload())

// Body parser middleware
//
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())

//Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

//Express validator middleware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }

}))

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passpord Config
require('./config/passport')(passport)
// Passpord Middleware
app.use(passport.initialize())
app.use(passport.session())

// 
app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart
    res.locals.user = req.user || null
    next()
})

//Set routes
var pages = require('./routes/pages')
var products = require('./routes/products')
var cart = require('./routes/cart')
var users = require('./routes/users')
var adminPages = require('./routes/admin_pages')
var adminCategories = require('./routes/admin_categories')
var adminProducts = require('./routes/admin_products')

app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/products', products)
app.use('/cart', cart)
app.use('/users', users)
app.use('/', pages)

//start the server
var port = 8000;
app.listen(port, () => {
    console.log('Server running on port localhost:' + port)
})