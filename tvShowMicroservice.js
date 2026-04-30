// tvShowMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const db = require('./database');

const tvShowProtoDefinition = protoLoader.loadSync('tvShow.proto', {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
});
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

const tvShowService = {
  getTvshow: (call, callback) => {
    const row = db.prepare('SELECT * FROM tvshows WHERE id = ?').get(call.request.tv_show_id);
    if (!row) return callback({ code: grpc.status.NOT_FOUND, message: 'TV show not found' });
    callback(null, { tv_show: { id: String(row.id), title: row.title, description: row.description } });
  },

  searchTvshows: (call, callback) => {
    const rows = db.prepare('SELECT * FROM tvshows').all();
    const tv_shows = rows.map(r => ({ id: String(r.id), title: r.title, description: r.description }));
    callback(null, { tv_shows });
  },

  createTvshow: (call, callback) => {
    const { title, description } = call.request;
    const result = db.prepare('INSERT INTO tvshows (title, description) VALUES (?, ?)').run(title, description);
    const tv_show = { id: String(result.lastInsertRowid), title, description };
    callback(null, { tv_show });
  },

  updateTvshow: (call, callback) => {
    const { tv_show_id, title, description } = call.request;
    const existing = db.prepare('SELECT * FROM tvshows WHERE id = ?').get(tv_show_id);
    if (!existing) return callback({ code: grpc.status.NOT_FOUND, message: 'TV show not found' });
    db.prepare('UPDATE tvshows SET title = ?, description = ? WHERE id = ?').run(title, description, tv_show_id);
    callback(null, { tv_show: { id: String(tv_show_id), title, description } });
  },

  deleteTvshow: (call, callback) => {
    const { tv_show_id } = call.request;
    const result = db.prepare('DELETE FROM tvshows WHERE id = ?').run(tv_show_id);
    callback(null, { success: result.changes > 0 });
  },
};

const server = new grpc.Server();
server.addService(tvShowProto.TVShowService.service, tvShowService);

const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) { console.error('Bind failed:', err); return; }
  console.log(`TV show microservice running on port ${port}`);
});