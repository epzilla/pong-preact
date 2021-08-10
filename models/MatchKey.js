/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('MatchKey', {
      id: {
        field: 'id',
        primaryKey: true,
        type: DataTypes.STRING
      },
      matchId: {
        field: 'match_id',
        type: DataTypes.INTEGER
      }
    }, {
      tableName: 'match_key',
      timestamps: false,
      freezeTableName: true
    });
  };