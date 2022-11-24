import {
  ApiMatchData,
  GoalData,
  PlayerData,
  SubstitutionData,
  ApiTeamData,
} from "./fifa.match.dto";

export class Goal {
  player: string;
  minute: string;
  type: number;
  constructor(goal: GoalData) {
    this.player = goal.IdPlayer;
    this.minute = goal.Minute;
    this.type = goal.Type;
  }
}

export class Substitution {
  minute: string;
  playerOn: string;
  playerOff: string;
  constructor(data: SubstitutionData) {
    this.minute = data.Minute;
    this.playerOn = data.IdPlayerOn;
    this.playerOff = data.IdPlayerOff;
  }
}

export class Player {
  id: string;
  name: string;
  shirtNumber: number;
  constructor(data: PlayerData) {
    this.id = data.IdPlayer;
    this.name = data.ShortName[0].Description;
    this.shirtNumber = data.ShirtNumber;
  }
}

export class LiveTeam {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  goals: Goal[];
  players: Player[];
  substitutions: Substitution[];
  score: number;
  constructor(data: ApiTeamData) {
    this.id = data.IdTeam;
    this.name = data.TeamName[0].Description;
    this.shortName = data.IdCountry;
    this.flag = data.PictureUrl;
    this.goals = data.Goals.map((goal) => new Goal(goal)) || [];
    this.players = data.Players.map((player) => new Player(player)) || [];
    this.substitutions =
      data.Substitutions.map((sub) => new Substitution(sub)) || [];
    this.score = data.Score || 0;
  }
}

export class LiveMatch {
  id: string;
  stageId: string;
  stage: string;
  groupId: string | null;
  group: string | null;
  date: Date;
  stadiumId: string;
  stadium: string;
  home?: LiveTeam;
  away?: LiveTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: number;
  winner: string | null;
  time: string;
  constructor(data: ApiMatchData) {
    this.id = data.IdMatch;
    this.stageId = data.IdStage;
    this.stage = data.StageName[0].Description;
    this.groupId = data.IdGroup;
    this.group =
      data.GroupName && data.GroupName[0]
        ? data.GroupName[0].Description
        : null;
    this.date = new Date(data.Date);
    this.stadiumId = data.Stadium.IdStadium;
    this.stadium = data.Stadium.Name[0].Description;
    this.home = data.HomeTeam ? new LiveTeam(data.HomeTeam) : undefined;
    this.away = data.AwayTeam ? new LiveTeam(data.AwayTeam) : undefined;
    this.homeScore = data.HomeTeamScore;
    this.awayScore = data.AwayTeamScore;
    this.status = data.MatchStatus;
    this.winner = data.Winner;
    this.time = data.MatchTime;
  }
}
