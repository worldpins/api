module.exports = {
  database: {
    host: 'localhost',
    name: 'worldpins',
    user: 'root',
    password: 'secret',
    port: 5431,
  },
  password: {
    salt: 10,
  },
  server: {
    ip: '0.0.0.0',
    port: 3001,
    origin: 'http://localhost:3001/',
  },
  token: {
    audience: 'worldpins',
    expiration: 14 * 24 * 3600 * 1000, // 14 days,
    issuer: 'worldpins',
    secret: 'BanaanSchilPeer98',
  },
};
