const dbConnection = process.env.DATABASE_CONNECTION_STRING;
const Sequelize= require('sequelize');
// Создание нового экземпляра Sequelize
const sequelize = new Sequelize(dbConnection, {
    dialect: 'postgres',
    logging: false,  // Отключить логгирование SQL запросов для чистоты вывода
});

// Импорт моделей
const User = require('../models/user')(sequelize, Sequelize);
const User_type = require('../models/user_type')(sequelize, Sequelize);
const Trip = require('../models/trip')(sequelize, Sequelize);
const Trip_status = require('../models/trip_status')(sequelize, Sequelize);
const Car = require('../models/car')(sequelize, Sequelize);

module.exports = {
    sequelize,
    User,
    User_type,
    Trip,
    Trip_status,
    Car,
};
