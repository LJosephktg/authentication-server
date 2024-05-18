const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

exports.getTime = (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    try {
      const user = await userModel.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ time: new Date() });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
