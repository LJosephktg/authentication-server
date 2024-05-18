const express = require('express');
const rateLimit = require('./middleware/rateLimit');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const timeController = require('./controllers/timeController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(rateLimit);

// Routes
app.post('/auth/login', authController.login);
app.post('/auth/generate-link', authController.generateLink);
app.get('/auth/verify-link', authController.verifyLink);
app.post('/admin/kickout', adminController.kickoutUser);
app.get('/time', timeController.getTime);

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
