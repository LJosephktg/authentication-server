const db = require('../db/db');
const bcrypt = require('bcryptjs');

exports.getUserByUsername = async (username) => {
  console.log(username)
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  console.log("Test",rows[0])
  return rows[0];
};

exports.updateLoginAttempts = (username, attempts) => {
  return db.query('UPDATE users SET login_attempts = ? WHERE username = ?', [attempts, username]);
};

exports.lockUserAccount = (username) => {
  return db.query('UPDATE users SET is_locked = true WHERE username = ?', [username]);
};

exports.invalidateTokens = (username) => {
  return db.query('DELETE FROM tokens WHERE user_id = (SELECT id FROM users WHERE username = ?)', [username]);
};

exports.addUser = (username, password) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
};

exports.getUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

exports.storeOneTimeLink = (userId, token, expiry) => {
  return db.query('INSERT INTO one_time_links (user_id, token, expiry) VALUES (?, ?, ?)', [userId, token, expiry]);
};

exports.getOneTimeLink = async (token) => {
  const [rows] = await db.query('SELECT * FROM one_time_links WHERE token = ?', [token]);
  return rows[0];
};

exports.deleteOneTimeLink = (token) => {
  return db.query('DELETE FROM one_time_links WHERE token = ?', [token]);
};
