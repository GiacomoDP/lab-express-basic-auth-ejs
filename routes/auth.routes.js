const router = require("express").Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const User = require('../models/User.model')
const saltRounds = 10
//GET signup page
router.get('/signup', (req, res, next) => {
    res.render('auth/signup')
})
// POST route ==> let’s create a new post route and use req.body to see what a user has submitted:
router.post('/signup', (req, res, next) => {
        //The consoleLog is only to see the output in the terminal like this:
        // The form data:
        // {
        //     username: 'ironhacker',
        //     email: 'rockstar@ironhack.com',
        //     password: '123'
        // }
        // console.log("The form data: ", req.body);
        const { username, email, password } = req.body
        // make sure users fill all mandatory fields:
        if (!username || !email || !password) {
            res.render('auth/signup', {
                errorMessage: 'All fields are mandatory. Please provide your username, email and password.'
            })
            return
        }
        // make sure passwords are strong:
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
        if (!regex.test(password)) {
            res.status(500)
                .render('auth/signup', {
                    errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
                })
            return
        }
        bcryptjs
            .genSalt(saltRounds)
            .then(salt => bcryptjs.hash(password, salt))
            .then(hashedPassword => {
                // to see the Hash in the terminal:
                // console.log(`Password hash: ${hashedPassword}`);
                return User.create({
                    // username: username
                    username,
                    email,
                    // passwordHash => this is the key from the User model
                    //     ^
                    //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
                    passwordHash: hashedPassword
                })
            })
            .then(userFromDB => {
                // console.log('Newly created user is: ', userFromDB)
                res.redirect('/userProfile')
            })
            .catch((error) => {
              console.log("Errore", error)
                if (error instanceof mongoose.Error.ValidationError) {
                    res.status(500).render('auth/signup', { errorMessage: error.message })
                } else if (error.code === 11000) {
                    res.status(500).render('auth/signup', {
                        errorMessage: 'Username and email need to be unique. Either username or email is already used.'
                    })
                } else {
                    next(error)
                }
            }) // close .catch()
    }) // close .post()
//////////// L O G I N ///////////
// GET route ==> to display the login form to users
router.get('/login', (req, res, next) => res.render('auth/login'))
// POST login route ==> to process form data
router.post('/login', (req, res, next) => {
  console.log('SESSION =====>', req.session)
    const { email, password } = req.body
    if (email === '' || password === '') {
        res.render('auth/login', {
            errorMessage: 'Please enter both, email and password to login.'
        })
        return
    }
    User.findOne({ email }) // <== check if there's user with the provided email
        .then(user => {
            // <== "user" here is just a placeholder and represents the response from the DB
            //es gibt eine modernere Variante und weniger Fehleranfällig: !user?.email
            // if (!user ? .email) {
            if (!user) {
                // <== if there's no user with provided email, notify the user who is trying to login
                res.render('auth/login', {
                    errorMessage: 'Email is not registered. Try with other email.'
                })
                return
            }
            // if there's a user, compare provided password
            // with the hashed password saved in the database
            else if (bcryptjs.compareSync(password, user.passwordHash)) {
                // if the two passwords match, render the user-profile.ejs and
                //                   pass the user object to this view
                //                                 |
                //                         
                req.session.currentUser = user        
                res.redirect('/userProfile')
            } else {
                // if the two passwords DON'T match, render the login form again
                // and send the error message to the user
                res.render('auth/login', { errorMessage: 'Incorrect password.' })
            }
        })
        .catch(error => next(error))
})
router.get('/userProfile', (req, res, ) => {(
  res.render('users/user-profile'), {userInSession: req.session.currentUser})
})






module.exports = router;