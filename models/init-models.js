var DataTypes = require("sequelize").DataTypes;
var _car = require("./car");
var _car_body = require("./car_body");
var _payment = require("./payment");
var _payment_status = require("./payment_status");
var _trip = require("./trip");
var _trip_status = require("./trip_status");
var _user = require("./user");
var _user_type = require("./user_type");

function initModels(sequelize) {
  var car = _car(sequelize, DataTypes);
  var car_body = _car_body(sequelize, DataTypes);
  var payment = _payment(sequelize, DataTypes);
  var payment_status = _payment_status(sequelize, DataTypes);
  var trip = _trip(sequelize, DataTypes);
  var trip_status = _trip_status(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_type = _user_type(sequelize, DataTypes);

  car.belongsTo(car_body, { as: "body_car_body", foreignKey: "body"});
  car_body.hasMany(car, { as: "cars", foreignKey: "body"});
  payment.belongsTo(payment_status, { as: "type_payment_payment_status", foreignKey: "type_payment"});
  payment_status.hasMany(payment, { as: "payments", foreignKey: "type_payment"});
  payment.belongsTo(trip, { as: "trip_trip", foreignKey: "trip"});
  trip.hasMany(payment, { as: "payments", foreignKey: "trip"});
  trip.belongsTo(trip_status, { as: "status_trip_status", foreignKey: "status"});
  trip_status.hasMany(trip, { as: "trips", foreignKey: "status"});
  car.belongsTo(user, { as: "user_user", foreignKey: "user"});
  user.hasMany(car, { as: "cars", foreignKey: "user"});
  trip.belongsTo(user, { as: "customer_user", foreignKey: "customer"});
  user.hasMany(trip, { as: "trips", foreignKey: "customer"});
  trip.belongsTo(user, { as: "driver_user", foreignKey: "driver"});
  user.hasMany(trip, { as: "driver_trips", foreignKey: "driver"});
  user.belongsTo(user_type, { as: "user_type_user_type", foreignKey: "user_type"});
  user_type.hasMany(user, { as: "users", foreignKey: "user_type"});

  return {
    car,
    car_body,
    payment,
    payment_status,
    trip,
    trip_status,
    user,
    user_type,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
