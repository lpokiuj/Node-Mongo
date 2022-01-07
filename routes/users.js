const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// Take User Models
let User = require('../models/user');
const { route } = require('./articles');

// Register Form
router.get('/register', (req, res) => {
    res.render('register');
})

// Register Proccess
router.post('/register', (req, res) => {
    
    let errors = {};
    let errorFlag = 0;
    if(!req.body.name){
        errors.name = "Name is required"
        errorFlag = 1;
    }
    if(!req.body.email){
        errors.email = "Email is required"
        errorFlag = 1;
    }
    if(!req.body.username){
        errors.username = "Username is required"
        errorFlag = 1;
    }
    if(!req.body.password){
        errors.password = "Password is required"
        errorFlag = 1;
    }
    if(!req.body.password2){
        errors.password2 = "Confirmation password is required"
        errorFlag = 1;
    }
    if(req.body.password != req.body.password2){
        errors.confirm = "Password must be matched"
        errorFlag = 1;
    }

    if(errorFlag == 1){
        res.render('register', {
            errors: errors
        });
        return;
    }

    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    let newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password
    });

    // Hashing Password
    bcrypt.genSalt(10, (err, salt) => {
        if(err){
            console.log('Error in hashing password1');
        }
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err){
                console.log('Error in hashing password2');
                return;
            }
            newUser.password = hash;
            newUser.save((err) => {
                if(err){
                    console.log(err);
                    return;
                }
                req.flash('success', 'You are now registered');
                res.redirect('/users/login');
            });
        });
    });

});

// Login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Login Proccess
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logout');
    res.redirect('/users/login');
});



module.exports = router;