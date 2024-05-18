const userModel = require('../models/user');

exports.kickoutUser = async (req, res) => {
  const { username } = req.body;
  try {
    await userModel.invalidateTokens(username);
    res.json({ message: 'User kicked out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
