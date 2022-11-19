module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // Get the SeachMovie file
    app.get('/searchMovie', (req, res) => {
      res.render('searchMovie.ejs')
    })

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('favorite').find().toArray((err, result) => {

          if (err) return console.log(err)
          res.render('profile.ejs', {
            Bookmarks: result,
            user : req.user // Send the email. This will help us only show the post made by a particular email
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

    // When the user clicks to add a movie/tv show to bookmars. Post is coming from js file
    app.post('/addBookMark', (req, res) => {
        console.log(req.body)
        // Passing Email: req.user.local.email so that the email of the logged in user can be saved to the collection. This will help us only show the post made by this email address
      db.collection('favorite').insertOne({Title: req.body.Title, Year: req.body.Year, Image: req.body.Image, Complete: "false", Email: req.user.local.email, Raiting: ""}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        console.log(req.user.local.email)
        res.redirect('/profile')
      })
    })

    // When user clicks on checkmark, it sends a put request to db to update it from movie false(not watched) to complete(movie watched)
    app.put('/updateComplete', (req, res) => {
      db.collection('favorite')
      .findOneAndUpdate({Title: req.body.Title, Title: req.body.Title}, {
        $set: {
          Complete: req.body.true
        }
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })


    // When user clicks on the trash icon to remove a movie
    app.delete('/deleteMovie', (req, res) => {
     
      // Make sure to pass in Email: req.user.local.email this will delete only the movies that the logged in user has added, not any other users bookmarks
      db.collection('favorite').findOneAndDelete({Title: req.body.Title, Email: req.user.local.email}, (err, result) => {
        if (err) return res.send(500, err)
        // res.redirect('/profile')
        res.send(JSON.stringify({'Result': req.body.Title}))
      })
    })

       // Post request when user submits a movie review
       app.put('/movieRaiting', (req, res) => {
        db.collection('favorite')
        .findOneAndUpdate({Title: req.body.name, Email: req.user.local.email}, { // Make sure to pass in Email: req.user.local.email this will give a review  the movies that the logged in user has reviewd, not any other users bookmarks
          $set: {
            Raiting: req.body.rating
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}