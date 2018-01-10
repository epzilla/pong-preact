/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MatchGame', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined,
      primaryKey: true
    },
    matchId: {
      field: 'match_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    },
    gameId: {
      field: 'game_id',
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: undefined
    }
  }, {
    tableName: 'match_game',
    timestamps: false,
    freezeTableName: true
  });
};
