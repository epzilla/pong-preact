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
    updateEveryPoint: {
      field: 'update_every_point',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    playTo: {
      field: 'play_to',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 21
    },
    winByTwo: {
      field: 'win_by_two',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    bestOf: {
      field: 'best_of',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 4
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
    startTime: {
      field: 'start_time',
      type: DataTypes.DATE,
      allowNull: true
    },
    finishTime: {
      field: 'finish_time',
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'matches',
    timestamps: false,
    freezeTableName: true
  });
};
