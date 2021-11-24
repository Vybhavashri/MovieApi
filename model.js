const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
  Title: {
    type: String,
    required: true
  },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birthday: Date
  },
  Actors: [String],
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Name: {type: String, required: true},
  EmailID: {type: String, required: true},
  Password: {type: String, required: true},
  Birth: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
