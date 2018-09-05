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
  },
  token: {
    audience: 'Coaches',
    expirationTime: 14 * 24 * 3600 * 1000, // 14 days,
    issuer: 'SpexxNasty',
    secret: 'BanaanSchilPeer98',
  },
};
