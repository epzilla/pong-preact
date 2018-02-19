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
    matchId: {
      field: 'match_id',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: undefined,
      references: {
        model: 'matches',
        key: 'id'
      }
    },
    matchFinished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0',
      references: {
        model: 'matches',
        key: 'finished'
      }
    },
    gameFinished: {
      field: 'finished',
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'games',
    timestamps: false,
    freezeTableName: true
  });
};
