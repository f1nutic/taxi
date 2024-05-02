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
const Payment = require('../models/payment')(sequelize, Sequelize);
const Payment_status = require('../models/payment_status')(sequelize, Sequelize);
const Car = require('../models/car')(sequelize, Sequelize);
const Car_body = require('../models/car_body')(sequelize, Sequelize);

module.exports = {
    sequelize,
    User,
    User_type,
    Trip,
    Trip_status,
    Payment,
    Payment_status,
    Car,
    Car_body
};
