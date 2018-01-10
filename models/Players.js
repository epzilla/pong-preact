/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Players', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true
    },
    fname: {
      field: 'fname',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    lname: {
      field: 'lname',
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: undefined
    }
  }, {
    tableName: 'players',
    timestamps: false,
    freezeTableName: true
  });
};
