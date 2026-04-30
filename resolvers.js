// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('movie.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).movie;

const tvShowProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('tvShow.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).tvShow;

const movieClient = () => new movieProto.MovieService('localhost:50051', grpc.credentials.createInsecure());
const tvClient = () => new tvShowProto.TVShowService('localhost:50052', grpc.credentials.createInsecure());

const resolvers = {
  Query: {
    movie: (_, { id }) => new Promise((resolve, reject) => {
      movieClient().getMovie({ movie_id: id }, (err, res) => err ? reject(err) : resolve(res.movie));
    }),
    movies: () => new Promise((resolve, reject) => {
      movieClient().searchMovies({}, (err, res) => err ? reject(err) : resolve(res.movies));
    }),
    tvShow: (_, { id }) => new Promise((resolve, reject) => {
      tvClient().getTvshow({ tv_show_id: id }, (err, res) => err ? reject(err) : resolve(res.tv_show));
    }),
    tvShows: () => new Promise((resolve, reject) => {
      tvClient().searchTvshows({}, (err, res) => err ? reject(err) : resolve(res.tv_shows));
    }),
  },

  Mutation: {
    createMovie: (_, { title, description }) => new Promise((resolve, reject) => {
      movieClient().createMovie({ title, description }, (err, res) => err ? reject(err) : resolve(res.movie));
    }),
    updateMovie: (_, { id, title, description }) => new Promise((resolve, reject) => {
      movieClient().updateMovie({ movie_id: id, title, description }, (err, res) => err ? reject(err) : resolve(res.movie));
    }),
    deleteMovie: (_, { id }) => new Promise((resolve, reject) => {
      movieClient().deleteMovie({ movie_id: id }, (err, res) => err ? reject(err) : resolve({ success: res.success }));
    }),

    createTVShow: (_, { title, description }) => new Promise((resolve, reject) => {
      tvClient().createTvshow({ title, description }, (err, res) => err ? reject(err) : resolve(res.tv_show));
    }),
    updateTVShow: (_, { id, title, description }) => new Promise((resolve, reject) => {
      tvClient().updateTvshow({ tv_show_id: id, title, description }, (err, res) => err ? reject(err) : resolve(res.tv_show));
    }),
    deleteTVShow: (_, { id }) => new Promise((resolve, reject) => {
      tvClient().deleteTvshow({ tv_show_id: id }, (err, res) => err ? reject(err) : resolve({ success: res.success }));
    }),
  },
};

module.exports = resolvers;