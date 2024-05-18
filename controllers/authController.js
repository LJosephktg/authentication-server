const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { generateToken } = require('../utils/token');
const crypto = require('crypto');
const { promisify } = require('util');

const MAX_ATTEMPTS = 5;
const LINK_VALIDITY_MINUTES = 10;

// Helper function to generate a unique token
const generateUniqueToken = async () => {
  const randomBytes = promisify(crypto.randomBytes);
  const buffer = await randomBytes(20);
  return buffer.toString('hex');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    if (user.is_locked) {
      return res.status(403).json({ error: 'Account is locked' });
    }
    console.log('check', password, user.password)
    const match = await bcrypt.compare(password, user.password);
    console.log(match)
    if (!match) {
      await userModel.updateLoginAttempts(username, user.login_attempts + 1);
      if (user.login_attempts + 1 >= MAX_ATTEMPTS) {
        await userModel.lockUserAccount(username);
      }
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user.id);
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateLink = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const token = await generateUniqueToken();
    const expiry = Date.now() + LINK_VALIDITY_MINUTES * 60 * 1000;

    await userModel.storeOneTimeLink(user.id, token, expiry);

    res.json({ link: `http://localhost/auth/verify-link?token=${token}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyLink = async (req, res) => {
  const { token } = req.query;

  try {
    const linkData = await userModel.getOneTimeLink(token);
    if (!linkData || linkData.expiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    const userToken = generateToken(linkData.user_id);
    // link can only be used once
    await userModel.deleteOneTimeLink(token); 

    res.json({ token: userToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
