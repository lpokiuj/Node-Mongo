// // Dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {body, validationResult} = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// MongoDB connection
mongoose.connect(config.database);
let db = mongoose.connection;

// Check DB connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check DB error
db.on('error', (err) => {
    console.log(err);
});

// Take DB models
let Article = require('./models/article');

// App initialization and pug configuration
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// PORT
const port = 3000;
app.listen(port, (req, res) => {
    console.log('Listening at PORT ' + port + '...');
});

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});



// Home route
app.get('/', (req, res) => {

    Article.find({}, (err, articles) => {
        if(err){
            console.log(err);
            return;
        }

        res.render('index', {
            title: 'Articles',
            articles: articles
        });
    });
})

// Route files
let articles = require('./routes/articles');
app.use('/articles', articles); 
let users = require('./routes/users');
app.use('/users', users);