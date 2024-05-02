const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('car_body', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'car_body',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "car_body_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
