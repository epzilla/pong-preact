/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Games', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: true,
      allowNull: true,
      autoIncrement: true,
      primaryKey: true
    },
    score1: {
      field: 'score1',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0'
    },
    score2: {
      field: 'score2',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0'
    },
    matchFinished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0'
    },
    gameFinished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0'
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
    player1Fname: {
      field: 'player1_fname',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    player2Fname: {
      field: 'player2_fname',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    player1Lname: {
      field: 'player1_lname',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    player2Lname: {
      field: 'player2_lname',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    player1MiddleInitial: {
      field: 'player1_mi',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    },
    player2MiddleInitial: {
      field: 'player2_mi',
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: undefined
    }
  }, {
    tableName: 'games',
    timestamps: false,
    freezeTableName: true
  });
};
