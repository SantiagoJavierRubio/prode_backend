// TODO> remove tests
// ONLY FOR DEV TEST PURPOSE, REMOVE ON DEPLOY
// import "dotenv/config";

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
        // remove after testing
        // const d = new Date(match.Date);
        // d.setFullYear(2022);
        // d.getMonth() === 5 ? d.setMonth(9) : d.setMonth(10);
        // d.setDate(d.getDate() + 1);
        return {
          id: match.IdMatch,
          stageId: match.IdStage,
          stage: match.StageName[0]?.Description,
          groupId: match.IdGroup,
          group: match.GroupName[0]?.Description,
          date: match.Date, // <= ORIGINAL
          // date: (process.env.MODO_PRUEBA = "RUSIA" ? d : match.Date), // <= PRUEBA
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
