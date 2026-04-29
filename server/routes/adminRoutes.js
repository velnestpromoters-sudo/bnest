const express = require('express');
const router = express.Router();
const { loginAdmin, getDashboardStats } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/stats', protectAdmin, getDashboardStats);

module.exports = router;
