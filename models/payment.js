const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    trip: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trip',
        key: 'id'
      }
    },
    cost: {
      type: DataTypes.DECIMAL(19,4),
      allowNull: true
    },
    type_payment: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'payment_status',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payment',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "payment_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
