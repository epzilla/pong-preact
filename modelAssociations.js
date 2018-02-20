module.exports = function (models) {
  const Devices = models.Devices;
  const Players = models.Players;
  const Games = models.Games;
  const Matches = models.Matches;

  // Matches/Players
  Players.hasOne(Matches, { as: 'player1', foreignKey: 'id', sourceKey: 'player1_id' });
  Players.hasOne(Matches, { as: 'player2', foreignKey: 'id', sourceKey: 'player2_id' });
  Players.hasOne(Matches, { as: 'partner1', foreignKey: 'id', sourceKey: 'partner1_id' });
  Players.hasOne(Matches, { as: 'partner2', foreignKey: 'id', sourceKey: 'partner2_id' });
  Matches.belongsTo(Players, { as: 'player1'});
  Matches.belongsTo(Players, { as: 'player2'});
  Matches.belongsTo(Players, { as: 'partner1'});
  Matches.belongsTo(Players, { as: 'partner2'});

  // Matches/Sets/Games
  Matches.hasMany(Games, { as: 'games', foreignKey: 'match_id'});
};