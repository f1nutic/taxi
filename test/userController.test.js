require('dotenv').config();
const { expect } = require('chai');
const sinon = require('sinon');
const { validationResult } = require('express-validator');
const { User } = require('../config/database');
const userController = require('../controllers/userController');
const { validateRegistration } = require('../validations/auth');

describe('Проверка механизма регистрации пользователя', function () {
    this.timeout(10000);
    let req, res;
    let nameUser = 'Юнит';
    let phoneUser = '79999998666';
    let birthdayUser = '2003-12-01';
    let passwordUser = 'password!123'

    beforeEach(() => {
        req = {
            body: {
                name: nameUser,
                phone: `+${phoneUser}`,
                birthday: birthdayUser,
                password: passwordUser,
            },
            session: {},
        };
        res = {
            redirect: sinon.spy(),
        };

        sinon.stub(User, 'create').resolves({
            name: nameUser,
            phone: phoneUser,
            birthday: birthdayUser,
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

    it('Создан пользователь с верными данными', async function () {
        try {
            await runValidation(req, validateRegistration);
            await userController.createUser(req, res);
            expect(User.create.calledOnce).to.be.true;
            const userData = User.create.getCall(0).args[0];
            expect(userData.name).to.equal(nameUser);
            expect(userData.phone).to.equal(phoneUser);
            expect(userData.birthday).to.equal(birthdayUser);
            console.log('Создан пользователь:');
            console.log(userData);
        } catch (error) {
            console.log(error.message);
        }
    });

    it('Пользователь не создан из-за некорректного номера', async function () {
        req.body.phone = '+41231231234';
        try {
            await runValidation(req, validateRegistration);
            await userController.createUser(req, res);
        } catch (error) {
            console.log('Ошибка: ' + error.message +
                `\nНеккоректный номер: ${req.body.phone}`);
            expect(error.message).to.equal('Некорректный формат номера телефона');
        }
        expect(User.create.called).to.be.false;

    });

    it('Пользователь не создан, так как минимальная длина имена - два символа', async function () {
        req.body.name = 'Я';
        try {
            await runValidation(req, validateRegistration);
            await userController.createUser(req, res);
        } catch (error) {
            console.log('Ошибка: ' + error.message +
                `\nНеккоректное имя: ${req.body.name}`);
            expect(error.message).to.equal('Имя должно содержать от 2 до 50 символов');
        }
        expect(User.create.called).to.be.false;
    });

    it('Пользователь не создан, так как имя должно содержать только русские буквы', async function () {
        req.body.name = 'Lara Croft';
        try {
            await runValidation(req, validateRegistration);
            await userController.createUser(req, res);
        } catch (error) {
            console.log('Ошибка: ' + error.message +
                `\nНеккоректное имя: ${req.body.name}`);
            expect(error.message).to.equal('Имя должно содержать только русские буквы');
        }
        expect(User.create.called).to.be.false;
    });
});
