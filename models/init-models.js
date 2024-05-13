var DataTypes = require("sequelize").DataTypes;
var _car = require("./car");
var _trip = require("./trip");
var _trip_status = require("./trip_status");
var _user = require("./user");
var _user_type = require("./user_type");

function initModels(sequelize) {
  var car = _car(sequelize, DataTypes);
  var trip = _trip(sequelize, DataTypes);
  var trip_status = _trip_status(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_type = _user_type(sequelize, DataTypes);

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
    trip,
    trip_status,
    user,
    user_type,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
