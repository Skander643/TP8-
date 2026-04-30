// apiGateway.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const resolvers = require('./resolvers');
const typeDefs = fs.readFileSync('./schema.gql', 'utf8');

const movieProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('movie.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).movie;

const tvShowProto = grpc.loadPackageDefinition(
  protoLoader.loadSync('tvShow.proto', { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
).tvShow;

const movieClient = () => new movieProto.MovieService('localhost:50051', grpc.credentials.createInsecure());
const tvClient = () => new tvShowProto.TVShowService('localhost:50052', grpc.credentials.createInsecure());

const app = express();
app.use(express.json());

const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.start().then(() => {
  app.use('/graphql', cors(), expressMiddleware(apolloServer));
});

// ── Movies ─────────────────────────────────────────────
app.get('/movies', (req, res) => {
  movieClient().searchMovies({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.movies);
  });
});

app.get('/movies/:id', (req, res) => {
  movieClient().getMovie({ movie_id: req.params.id }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response.movie);
  });
});

app.post('/movies', (req, res) => {
  const { title, description } = req.body;
  movieClient().createMovie({ title, description }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(response.movie);
  });
});

app.put('/movies/:id', (req, res) => {
  const { title, description } = req.body;
  movieClient().updateMovie({ movie_id: req.params.id, title, description }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response.movie);
  });
});

app.delete('/movies/:id', (req, res) => {
  movieClient().deleteMovie({ movie_id: req.params.id }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: response.success });
  });
});

// ── TV Shows ────────────────────────────────────────────
app.get('/tvshows', (req, res) => {
  tvClient().searchTvshows({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.tv_shows);
  });
});

app.get('/tvshows/:id', (req, res) => {
  tvClient().getTvshow({ tv_show_id: req.params.id }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response.tv_show);
  });
});

app.post('/tvshows', (req, res) => {
  const { title, description } = req.body;
  tvClient().createTvshow({ title, description }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(response.tv_show);
  });
});

app.put('/tvshows/:id', (req, res) => {
  const { title, description } = req.body;
  tvClient().updateTvshow({ tv_show_id: req.params.id, title, description }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response.tv_show);
  });
});

app.delete('/tvshows/:id', (req, res) => {
  tvClient().deleteTvshow({ tv_show_id: req.params.id }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: response.success });
  });
});

const port = 3000;
app.listen(port, () => console.log(`API Gateway running on port ${port}`));