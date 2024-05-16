const { body } = require('express-validator');
const moment = require('moment');
const { User } = require('../config/database');

const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя может содержать от 2 до 50 символов'),

    body('phone')
        .trim()
        .isMobilePhone('ru-RU')
        .withMessage('Некорректный формат номера телефона')
        .custom(async value => {
            const phone = value.slice(1); // Удаление первого символа ('+') из номера телефона
            const user = await User.findOne({ where: {phone} });
            if (user) {
                throw new Error(`Номер телефона уже зарегистрирован`);
            }
            return true;
        }),

    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов')
        .matches(/\d/)
        .withMessage('Пароль должен содержать хотя бы одну цифру')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Пароль должен содержать хотя бы один специальный символ'),

    body('birthday')
        .trim()
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Дата должна быть в формате YYYY-MM-DD')
        .custom(value => {
            const eighteenYearsAgo = moment().subtract(18, 'years');
            const birthdate = moment(value, 'YYYY-MM-DD');
            if (!birthdate.isValid()) {
                throw new Error('Невалидная дата');
            }
            if (birthdate.isAfter(eighteenYearsAgo)) {
                throw new Error('Вам должно быть минимум 18 лет');
            }
            return true;
        }),
];

module.exports = {
    validateRegistration,
};
