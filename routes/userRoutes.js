const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const userValidation = require('../validations/auth');
const userController = require('../controllers/userController');

// Middleware для валидации данных регистрации
router.post('/registration', userValidation.validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    console.log(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await userController.createUser(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.post('/login', userController.loginUser);

module.exports = router;