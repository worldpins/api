module.exports = {
  database: {
    host: 'localhost',
    name: 'worldpins',
    user: 'root',
    password: 'secret',
  },
  password: {
    salt: 10,
  },
  server: {
    ip: '0.0.0.0',
    port: 3000,
    origin: 'http://localhost:3000/',
  },
  token: {
    audience: 'worldpins',
    expiration: 14 * 24 * 3600 * 1000, // 14 days,
    issuer: 'worldpins',
    secret: 'BanaanSchilPeer98',
  },
};
