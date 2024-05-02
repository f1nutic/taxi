const { body } = require('express-validator');
const moment = require('moment');

const validateRegistration = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Имя должно содержать от 2 до 50 символов'),
    body('phone').trim().isMobilePhone('ru-RU').withMessage('Некорректный формат номера телефона'),
    body('password').trim().isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('birthday')
        .trim()
        .isDate({ format: 'YYYY-MM-DD' })
        .withMessage('Дата должна быть в формате YYYY-MM-DD')
        .custom((value) => {
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