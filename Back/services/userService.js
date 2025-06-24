const db = require('../db');

exports.findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};
