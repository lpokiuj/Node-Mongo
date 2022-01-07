const express = require('express');
const router = express.Router();

// Take Article Models
let Article = require('../models/article');
// Take User Models
let User = require('../models/user');

// Access Control
function ensureAuthenticated(req, res, next){

    if(req.isAuthenticated()){
        return next();
    }
    req.flash('danger', 'Please log in');
    res.redirect('/users/login')

}

// Add route
router.get('/add', ensureAuthenticated, (req, res) => {

    res.render('add_article', {
        title: 'Add articles'
    }); 

});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit article',
            article: article
        });
    });
})

// Get Single Article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, (err, user) => {
            res.render('article', {
                article: article,
                author: user.name
            });
        }); 
        
    });
});

// Add Submit POST Route
router.post('/add', (req, res) => {

    let errors = {};
    let errorFlag = 0;
    if(!req.body.title){    
        errors.title = 'Title is required';
        errorFlag = 1;
    }
    if(!req.body.body){    
        errors.body = 'Body is required';
        errorFlag = 1;
    }

    if(errorFlag == 1){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
        return;
    }

    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
        if(err){
            console.log(err);
            return;
        }
        req.flash('success', 'Article Added');
        res.redirect('/');
    })
    
})

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {

    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, (err) => {
        if(err){
            console.log(err);
            return;
        }
        req.flash('success', 'Article Updated');
        res.redirect('/');
    })
    
})

// Delete Article Method
router.delete('/:id', (req, res) => {

    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id: req.params.id}

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            res.status(500).send();
        }
        else{
            Article.remove(query, (err) => {
                if(err){
                    console.log(err);
                    return;
                }
                res.send('Success');
            });
        }
    });
});

module.exports = router;