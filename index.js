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
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('CONNECTION_URI',{ useNewUrlParser: true, useUnifiedTopology: true });
//CONNECTION_URI:mongodb+srv://myFlixDBadmin:myFlixPassword@myflixdb.qfala.mongodb.net/myFlixDB?retryWrites=true&w=majority

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'www.heroku.com','www.mongodb.com'];
const { check, validationResult } = require('express-validator');
const port = process.env.PORT || 8080;

//Middleware
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {console.error(err.stack);res.status(500).send('Something broke!');});
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

//Return a list of ALL movies to the user
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

//Return data about a single movie by title to the user
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

//Return the list of all movies by genre to the user
app.get('/movies/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Genre.Name" : req.params.Name })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Return data about a director by name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Director.Name" : req.params.Name },{"Director.$" : 1})
  .then((Director) => {
    res.status(201).json(Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Return a list of all users
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

// Return a user by username
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

//Allow new users to register
app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
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

//Allow users to update their user info (Username,Password,EmailID,Birthday)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      EmailID: req.body.EmailID,
      Birth: req.body.Birth
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//Allow existing users to deregister
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


//Allow users to remove a movie from their list of favorites
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
 app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port ' + port);
 });
// app.listen(8080, () =>{
//   console.log('Your app is listening on port 8080.');
// });
