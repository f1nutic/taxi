require('dotenv').config();
const { expect } = require('chai');
const sinon = require('sinon');
const { validationResult } = require('express-validator');
const { User } = require('../config/database');
const userController = require('../controllers/userController');
const { validateRegistration } = require('../validations/auth');

describe('User Controller - createUser with validation', function () {
    this.timeout(10000);
    let req, res;

    beforeEach(() => {
        // Подготовка запроса и ответа
        req = {
            body: {
                name: 'Test User',
                phone: '+79999998880',
                birthday: '1990-01-01',
                password: 'password!3232323',
            },
            session: {},
        };
        res = {
            redirect: sinon.spy(),
        };

        // Подменяем методы модели User
        sinon.stub(User, 'create').resolves({
            id: 1,
            name: 'Test User',
            phone: '1234567890',
            birthday: '1990-01-01',
            user_type: 2,
            hashed_password: 'hashed_password',
        });
    });

    afterEach(() => {
        // Восстанавливаем оригинальные методы
        sinon.restore();
    });

    const runValidation = async (req, validations) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(errors.errors[0].msg);
        }
    };

    it('should create a new user with valid data', async function () {
        // Запускаем валидацию
        await runValidation(req, validateRegistration);

        // Вызываем метод создания пользователя
        await userController.createUser(req, res);

        // Проверяем, что пользователь был создан
        expect(User.create.calledOnce).to.be.true;
        const userData = User.create.getCall(0).args[0];
        expect(userData.name).to.equal('Test User');
        expect(userData.phone).to.equal('79999998880');
        expect(userData.birthday).to.equal('1990-01-01');
    });

    it('should not create a user with invalid phone number', async function () {
        req.body.phone = 'invalid_phone';

        try {
            // Запускаем валидацию, она должна выбросить ошибку
            await runValidation(req, validateRegistration);
        } catch (error) {
            expect(error.message).to.equal('Некорректный формат номера телефона');
        }

        // Проверяем, что пользователь не был создан
        expect(User.create.called).to.be.false;
    });
});
