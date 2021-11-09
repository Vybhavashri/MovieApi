const express = require('express'),
app = express(),
morgan = require('morgan');

let movies = [
  {
    movieID: 1,
    title: "The Shawshank Redemption",
    rank: "1",
    genre: "Drama",
    director: "Frank Darabont",
    yea: "1994",
    duration: "2h 22m"
  },
  {
    movieID: 2,
    title: "The Godfather",
    rank: "2",
    genre: "Crime",
    director: "Francis Ford Coppola",
    year: "1972",
    duration: "2h 55m"
  },
  {
    movieID: 3,
    title: "The Godfather: Part II",
    rank: "3",
    genre: "Crime",
    director: "Francis Ford Coppola",
    year: "1974",
    duration: "3h 22m"
  },
  {
    movieID: 4,
    title: "The Godfather: Part III",
    rank: "4",
    genre: "Crime",
    director: "Francis Ford Coppola",
    year: "1990",
    duration: "2h 55m"
  },
  {
    movieID: 5,
    title: "The Dark Knight",
    rank: "5",
    genre: "Action",
    director: "Christopher Nolan",
    year: "2008",
    duration: "2h 32m"
  },
  {
    movieID: 6,
    title: "The Lord of the Rings: The Return of the King",
    rank: "6",
    genre: "Adventure",
    director: "Peter Jackson",
    year: "2003",
    duration: "3h 21m"
  },
  {
    movieID: 7,
    title: "Batman Begins",
    rank: "7",
    genre: "Action",
    director: "Christopher Nolan",
    year: "2005",
    duration: "2h 20m"
  },
  {
    movieID: 8,
    title: "The Dark Knight Rises",
    rank: "8",
    genre: "Action",
    director: "Christopher Nolan",
    year: "2012",
    duration: "2h 44m"
  },
  {
    movieID: 9,
    title: "The Lord of the Rings: The Fellowship of the Ring",
    rank: "9",
    genre: "Adventure",
    director: "Peter Jackson",
    year: "2001",
    duration: "2h 58m"
  },
  {
    movieID: 10,
    title: " Schindler's List",
    rank: "10",
    genre: "Biography",
    director: "Steven Spielberg",
    year: "1993",
    duration: "2h 15m"
  }
];

let directors = [
  {
    directorID: 1,
    name: "Steven Spielberg",
    description: "One of the most influential personalities in the history of cinema",
    birthDate: "18/12/1946",
    deathDate: ""
  },
  {
    directorID: 2,
    name: "Peter Jackson",
    description: "Sir Peter Jackson made history with The Lord of the Rings trilogy",
    birthDate: "31/10/1961",
    deathDate: ""
  },
  {
    directorID: 3,
    name: "Christopher Nolan",
    description: "Best known for his cerebral, often nonlinear, storytelling",
    birthDate: "30/07/1970",
    deathDate: ""
  },
  {
    directorID: 4,
    name: "Francis Ford Coppola",
    description: "His first two Oscar-winning screenplays were for Patton(1970) and The Godfather(1972)",
    birthDate: "07/04/1939",
    deathDate: ""
  },
  {
    directorID: 5,
    name: "Frank Darabont",
    description: "Writer, Producer, Writer. Three-time Oscar nominee",
    birthDate: "28/01/1959",
    deathDate: ""
  }
];

let users = [
  {
    userID: 1,
    name: "User1",
    emailID: "user1@mydomain.com",
    password: "user1",
    favouriteMovies: []
  },
  {
    userID: 2,
    name: "User2",
    emailID: "user2@mydomain.com",
    password: "user2",
    favouriteMovies: []
  },
  {
    userID: 3,
    name: "User3",
    emailID: "user3@mydomain.com",
    password: "user3",
    favouriteMovies: []
  },
  {
    userID: 4,
    name: "User4",
    emailID: "user4@mydomain.com",
    password: "user4",
    favouriteMovies: []
  }
];

//Middleware
app.use(express.static('public'));
app.use(morgan('common'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my Movie Database. Navigate to /movies URL to find the Movie data');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.json(movies);
});

//Return data about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  let movie = movies.find((movie) => {
    return movie.title === req.params.title;
  });
  if(movie) {
    res.status(200).json(movie)
  } else {
    res.status(400).send('No movie with that title is found')
  }
});

//Return the list of all movies by genre to the user
app.get('/movies/genre/:genre', (req, res) => {
  let movieList = []
  movies.find((movie) => {
    if(movie.genre === req.params.genre) {
      movieList.push(movie)
    }
  });
  res.json(movieList)
});

//Return data about a director by name
app.get('/directors/:name', (req, res) => {
  let director = directors.find((director) => {
    return director.name === req.params.name;
  });
  if(director) {
    res.status(200).json(director)
  } else {
    res.status(400).send('No director with that name is found')
  }
});

//Allow new users to register
app.post('/users', (req, res) => {
    res.send('New user is registered');
});

//Allow users to update their user info (email)
app.put('/users/:name/:emailID', (req, res) => {
		let user = users.find((user) => { return user.name === req.params.name });
		if (user) {
			user.emailID = req.params.emailID;
			res.status(201).send('User emailID is changed to ' + req.params.emailID);
		} else {
			res.status(404).send('User with the name ' + req.params.name + ' was not found.');
		}
	});

//Allow users to add a movie to their list of favorites
  app.post('/users/:name/:title', (req, res) => {
    let user = users.find((user) => { return user.name === req.params.name });
      if(user) {
          user.favouriteMovies.push(req.params.title)
          res.status(200).send(`Movie has been added to your favorites list`);
      } else {
          res.status(400).send('Cannot find user with that name');
      }
  });

//Allow users to remove a movie from their list of favorites
app.delete('/users/:name/:title', (req, res) => {
    res.status(200).send(`Movie has been removed from your favorites list`);
});

//Allow existing users to deregister
app.delete('/delete/:name', (req, res) => {
		res.status(200).send(`User had been deregistered`);
	});

// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});
