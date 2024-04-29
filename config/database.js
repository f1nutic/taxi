const dbConnection = process.env.DATABASE_CONNECTION_STRING;
const Sequelize= require('sequelize');
// Создание нового экземпляра Sequelize
const sequelize = new Sequelize(dbConnection, {
    dialect: 'postgres',
    logging: false,  // Отключить логгирование SQL запросов для чистоты вывода
});

// Импорт моделей
const User = require('../models/user')(sequelize, Sequelize.DataTypes);

module.exports = {
    sequelize,
    User
};
