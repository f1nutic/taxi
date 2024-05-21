require('dotenv').config();

const { expect } = require('chai');
const { sequelize } = require('../config/database');

describe('Подключение к БД', function () {
    this.timeout(10000);

    it('Успешное подключение к базе данных PostgreSQL через ORM', async function () {
        try {
            await sequelize.authenticate();
            console.log('Диалект:', sequelize.getDialect());
            console.log('Хост:', sequelize.options.host);
            console.log('Порт:', sequelize.config.port);
            console.log('Имя БД:', sequelize.config.database);
            console.log('Пользователь:', sequelize.config.username);
            expect(true).to.be.true;
        } catch (error) {
            expect.fail('Не удалось подключиться к БД: ' + error.message);
        }
    });
});
