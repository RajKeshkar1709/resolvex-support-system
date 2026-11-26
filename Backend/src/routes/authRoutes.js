const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, validate(registerValidator), authController.register);
router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.post('/logout', authenticateUser, authController.logout);
router.get('/me', authenticateUser, authController.getCurrentUser);
router.post('/refresh', authController.refreshToken);

module.exports = router;
