const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const userValidation = require('../validations/auth');
const userController = require('../controllers/userController');

// Middleware для валидации данных регистрации
router.post('/registration', userValidation.validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect(`/registration?message=Ошибка:+${errors.errors[0].msg}&status=fail`); // Вывод ошибки по валидации
    }

    try {
        await userController.createUser(req, res);
    } catch (error) {
        console.error(error);
        return res.redirect(`/registration?message=Ошибка:+${error}&status=fail`);
    }
});

router.post('/login', userController.loginUser);

module.exports = router;