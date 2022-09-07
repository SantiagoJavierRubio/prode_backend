class Container {
  normalizeTeams(data) {
    if (!data) return null;
    return {
      id: data.IdTeam,
      name: data.TeamName[0]?.Description,
      shortName: data.IdCountry,
      flag: data.PictureUrl,
    };
  }
  normalizeMatches(data) {
    try {
      return data.map((match) => {
        return {
          id: match.IdMatch,
          stageId: match.IdStage,
          stage: match.StageName[0]?.Description,
          groupId: match.IdGroup,
          group: match.GroupName[0]?.Description,
          date: match.Date,
          stadiumId: match.Stadium.IdStadium,
          stadium: match.Stadium.Name[0]?.Description,
          home: this.normalizeTeams(match.Home) || match.PlaceHolderA,
          away: this.normalizeTeams(match.Away) || match.PlaceHolderB,
          homeScore: match.HomeTeamScore,
          awayScore: match.AwayTeamScore,
          status: match.MatchStatus,
          winner: match.Winner,
        };
      });
    } catch (err) {
      return { error: err.message };
    }
  }
  groupByStage(matches) {
    const stages = matches.reduce((acc, match) => {
      const stage = match.stageId;
      if (!acc[stage]) {
        acc[stage] = {
          id: stage,
          name: match.stage,
          matches: [],
        };
      }
      acc[stage].matches.push(match);
      return acc;
    }, {});
    return Object.values(stages);
  }
  groupByGroup(matches) {
    const groups = matches.reduce((acc, match) => {
      const group = match.groupId;
      if (!acc[group]) {
        acc[group] = {
          id: group,
          name: match.group,
          matches: [],
        };
      }
      acc[group].matches.push(match);
      return acc;
    }, {});
    return Object.values(groups);
  }
}

export default Container;
