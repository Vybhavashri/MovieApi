const express = require('express'),
app = express(),
morgan = require('morgan'),
mongoose = require('mongoose'),
bodyParser = require('body-parser'),
Models = require('./model.js'),
Movies = Models.Movie,
Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

//Middleware
app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {console.error(err.stack);res.status(500).send('Something broke!');});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HTTP requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movie Database. Navigate to /movies URL to find the Movie data');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.get('/movies/Genre/:Name', (req, res) => {
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
app.get('/movies/directors/:Name', (req, res) => {
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
app.get('/users', (req, res) => {
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
app.get('/users/:Name', (req, res) => {
  Users.findOne({ Name: req.params.Name })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Allow new users to register
app.post('/users', (req, res) => {
  Users.findOne({ Name: req.body.Name })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Name + 'already exists');
    } else {
      Users.create({
        Name: req.body.Name,
        Password: req.body.Password,
        EmailID: req.body.EmailID,
        Birth: req.body.Birth
      })
      .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

//Allow users to update their user info (Username,Password,EmailID,Birthday)
app.put('/users/:Name', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
    {
      Name: req.body.Name,
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
app.post('/users/:Name/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, {
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
app.delete('/users/delete/:Name', (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Name })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Name + ' was not found');
    } else {
      res.status(200).send(req.params.Name + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//Allow users to remove a movie from their list of favorites
app.delete('/users/:Name/delete/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Name }, {
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
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});
