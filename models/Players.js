/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Players', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fname: {
      field: 'fname',
      type: DataTypes.STRING,
      allowNull: true,
    },
    lname: {
      field: 'lname',
      type: DataTypes.STRING,
      allowNull: true,
    },
    middleInitial: {
      field: 'mi',
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'players',
    timestamps: false,
    freezeTableName: true
  });
};
