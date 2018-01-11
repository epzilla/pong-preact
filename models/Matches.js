/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Matches', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: true,
      autoIncrement: true,
      primaryKey: true
    },
    player1Id: {
      field: 'player1_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    player2Id: {
      field: 'player2_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined
    },
    finished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    dateTime: {
      field: 'date_time',
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'matches',
    timestamps: false,
    freezeTableName: true
  });
};
