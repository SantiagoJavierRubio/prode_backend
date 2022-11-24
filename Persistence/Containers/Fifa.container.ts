import { ApiMatchData, Match } from "../../DTOS/Fixture/fifa.match.dto";
import { LiveMatch } from "../../DTOS/Fixture/fifa.liveMatch.dto";

export interface MatchesByCategory {
  id: string;
  name: string;
  matches: Match[];
}

interface CategoryAcc {
  [name: string]: MatchesByCategory;
}

export class FifaContainer {
  normalizeMatches(matches: ApiMatchData[]): Match[] {
    return matches.map((match) => new Match(match));
  }
  normalizeLiveMatch(matchData: ApiMatchData): LiveMatch {
    return new LiveMatch(matchData);
  }
  groupByStage(matches: Match[]): MatchesByCategory[] {
    const stages = matches.reduce((acc: CategoryAcc, match): CategoryAcc => {
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
  groupByGroup(matches: Match[]): MatchesByCategory[] {
    const groups = matches.reduce((acc: CategoryAcc, match): CategoryAcc => {
      const group = match.groupId;
      if (!group || !match.group) throw new Error();
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
