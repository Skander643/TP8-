// movieMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require('./database');

const movieProtoDefinition = protoLoader.loadSync('movie.proto', {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
});
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

const movieService = {
  getMovie: (call, callback) => {
    const row = db.prepare('SELECT * FROM movies WHERE id = ?').get(call.request.movie_id);
    if (!row) return callback({ code: grpc.status.NOT_FOUND, message: 'Movie not found' });
    callback(null, { movie: { id: String(row.id), title: row.title, description: row.description } });
  },

  searchMovies: (call, callback) => {
    const rows = db.prepare('SELECT * FROM movies').all();
    const movies = rows.map(r => ({ id: String(r.id), title: r.title, description: r.description }));
    callback(null, { movies });
  },

  createMovie: (call, callback) => {
    const { title, description } = call.request;
    const result = db.prepare('INSERT INTO movies (title, description) VALUES (?, ?)').run(title, description);
    const movie = { id: String(result.lastInsertRowid), title, description };
    callback(null, { movie });
  },

  updateMovie: (call, callback) => {
    const { movie_id, title, description } = call.request;
    const existing = db.prepare('SELECT * FROM movies WHERE id = ?').get(movie_id);
    if (!existing) return callback({ code: grpc.status.NOT_FOUND, message: 'Movie not found' });
    db.prepare('UPDATE movies SET title = ?, description = ? WHERE id = ?').run(title, description, movie_id);
    callback(null, { movie: { id: String(movie_id), title, description } });
  },

  deleteMovie: (call, callback) => {
    const { movie_id } = call.request;
    const result = db.prepare('DELETE FROM movies WHERE id = ?').run(movie_id);
    callback(null, { success: result.changes > 0 });
  },
};

const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);

const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) { console.error('Bind failed:', err); return; }
  console.log(`Movie microservice running on port ${port}`);
});