const express = require('express'),
  app = express(),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  Models = require('./model.js'),
  Movies = Models.Movie,
  Users = Models.User,
  cors = require('cors'),
  passport = require('passport');
require('./passport');
let allowedOrigins = ['*'];
const { check, validationResult } = require('express-validator');
//Mongoose Atlas Database connection string
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//Middleware
app.use(cors());
app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).send('Something broke!'); });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
let auth = require('./auth')(app);

// HTTP requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movie Database. Navigate to /movies URL to find the Movie data');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * Get all movies
 * @method GET
 * @param {string} endpoint - endpoint to fetch all the movies - "url/movies"
 * @returns {object} - returns all the movies
 * @requires authentication JWT
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get a movie by title
 * @method GET
 * @param {string} endpoint - endpoint to fetch a movie by title
 * @param {string} Title - is used to get a specific movie - "url/movies/:Title"
 * @returns {object} - returns the specific movie 
 * @requires authentication JWT
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * Get a genre by it's name
 * @method GET
 * @param {string} endpoint - endpoint to fetch a genre by it's name
 * @param {string} GenreName - is used to get a specific genre - "url/movies/Genre/:Name"
 * @returns {object} - returns the specific genre
 * @requires authentication JWT
 */
app.get('/movies/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Genre.Name": req.params.Name })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get a director by name
 * @method GET
 * @param {string} endpoint - endpoint to fetch a director by name
 * @param {string} DirectorName - is used to get a specific director - "url/movies/directors/:Name"
 * @returns {object} - returns the specific director
 * @requires authentication JWT
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Director.Name": req.params.Name }, { "Director.$": 1 })
    .then((Director) => {
      res.status(201).json(Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get all users
 * @method GET
 * @param {string} endpoint - endpoint to fetch all users - "url/users"
 * @returns {object} - returns all the users
 * @requires authentication JWT
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Get user by username
 * @method GET
 * @param {string} endpoint - endpoint to fetch user by username
 * @param {string} Username - is used to get a specific user - "url/users/:Username"
 * @returns {object} - returns the specific user
 * @requires authentication JWT
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Create a new user
 * @method POST
 * @param {string} endpoint - endpoint to create a new user - "url/users"
 * @param {string} Username - username choosen by user
 * @param {string} Password - password choosen by user
 * @param {string} Email - email choosen by user
 * @param {string} Birthday - birthday choosen by user
 * @returns {object} - returns the new created user
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('EmailID', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              EmailID: req.body.EmailID,
              Birth: req.body.Birth
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/**
 * Update user by username
 * @method PUT
 * @param {string} endpoint - endpoint to update a user - "url/users/:Username"
 * @param {string} Username - user's new username 
 * @param {string} Password - user's new password
 * @param {string} Email - user's new email 
 * @param {string} Birthday - user's new birthday
 * @returns {object} - returns the new updated user
 * @requires authentication JWT
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      EmailID: req.body.EmailID,
      Birth: req.body.Birth
    }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/**
 * Add movie to favorites
 * @method POST
 * @param {string} endpoint - endpoint to add movies to favorites - "url/users/:Username/movies/:MovieID"
 * @param {string} Username - is used to find a specific user
 * @param {string} MovieID - is used to add a movie's id to the user's favorites 
 * @returns {string} - returns success or error message
 */
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavouriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/**
 * Delete user by username
 * @method DELETE
 * @param {string} endpoint - endpoint to delete a user
 * @param {string} Username - is used to delete a specific user - "url/users/delete/:Username"
 * @returns {string} success or error message
 * @requires authentication JWT
 */
app.delete('/users/delete/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Delete movie from favorites
 * @method DELETE
 * @param {string} endpoint - endpoint to remove movies from favorites - "url/users/:Username/movies/MovieID"
 * @param {string} Username - is used to find a specific user
 * @param {string} MovieID - is used to remove a movie's id from the user's favorites 
 * @returns {string} - returns success or error message
 */
app.delete('/users/:Username/delete/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavouriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
