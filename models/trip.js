const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trip', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    driver: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    point_start: {
      type: DataTypes.STRING,
      allowNull: true
    },
    point_final: {
      type: DataTypes.STRING,
      allowNull: true
    },
    time_create: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_final: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trip_status',
        key: 'id'
      }
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    route_data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'trip',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "trip_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
