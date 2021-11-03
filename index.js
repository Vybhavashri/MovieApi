const express = require('express'),
app = express(),
morgan = require('morgan');

let topMovies = [
  {
    "title": "The Shawshank Redemption",
    "rank": "1",
    "id": "tt0111161"
  },
  {
    "title": "The Godfather",
    "rank": "2",
    "id": "tt0068646"
  },
  {
    "title": "The Godfather: Part II",
    "rank": "3",
    "id": "tt0071562"
  },
  {
    "title": "Pulp Fiction",
    "rank": "4",
    "id": "tt0110912"
  },
  {
    "title": "The Good, the Bad and the Ugly",
    "rank": "5",
    "id": "tt0060196"
  },
  {
    "title": "The Dark Knight",
    "rank": "6",
    "id": "tt0468569"
  },
  {
    "title": "12 Angry Men",
    "rank": "7",
    "id": "tt0050083"
  },
  {
    "title": "Schindler's List",
    "rank": "8",
    "id": "tt0108052"
  },
  {
    "title": "The Lord of the Rings: The Return of the King",
    "rank": "9",
    "id": "tt0167260"
  },
  {
    "title": "Fight Club",
    "rank": "10",
    "id": "tt0137523"
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

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});
