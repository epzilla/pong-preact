/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Matches', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true
    },
    player1Id: {
      field: 'player1_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    },
    player2Id: {
      field: 'player2_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    },
    finished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '0'
    },
    dateTime: {
      field: 'date_time',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: undefined
    }
  }, {
    tableName: 'matches',
    timestamps: false,
    freezeTableName: true
  });
};
