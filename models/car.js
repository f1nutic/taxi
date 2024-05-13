const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('car', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registration_number: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    mark: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'car',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "car_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
