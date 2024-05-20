require('dotenv').config();

const { expect } = require('chai');
const { sequelize } = require('../config/database');

describe('Database Connection', function () {
    this.timeout(10000);

    it('Подключение к базе данных PostgreSQL через ORM', async function () {
        try {
            await sequelize.authenticate();
            expect(true).to.be.true;
        } catch (error) {
            expect.fail('Не удалось подключиться к БД: ' + error.message);
        }
    });
});
