export interface GoalData {
  IdPlayer: string;
  Minute: string;
  Type: number;
}

export interface PlayerData {
  IdPlayer: string;
  ShirtNumber: number;
  ShortName: [{ Description: string }];
}

export interface SubstitutionData {
  Minute: string;
  IdPlayerOff: string;
  IdPlayerOn: string;
}

export interface ApiTeamData {
  IdTeam: string;
  TeamName: [
    {
      Description: string;
    }
  ];
  IdCountry: string;
  PictureUrl: string;
  Goals: GoalData[];
  Players: PlayerData[];
  Substitutions: SubstitutionData[];
  Score: number;
}

export class Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  constructor(data: ApiTeamData) {
    this.id = data.IdTeam;
    this.name = data.TeamName[0].Description;
    this.shortName = data.IdCountry;
    this.flag = data.PictureUrl;
  }
}

export interface ApiMatchData {
  IdMatch: string;
  IdStage: string;
  StageName: [
    {
      Description: string;
    }
  ];
  IdGroup: string | null;
  GroupName: [{ Description: string }] | null;
  Date: string;
  Stadium: {
    IdStadium: string;
    Name: [{ Description: string }];
  };
  Home: ApiTeamData | null;
  Away: ApiTeamData | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeam: ApiTeamData | null;
  AwayTeam: ApiTeamData | null;
  MatchStatus: number;
  Winner: string | null;
  PlaceHolderA: string;
  PlaceHolderB: string;
  MatchTime: string;
}

export class Match {
  id: string;
  stageId: string;
  stage: string;
  groupId: string | null;
  group: string | null;
  date: Date;
  stadiumId: string;
  stadium: string;
  home: Team | string;
  away: Team | string;
  homeScore: number | null;
  awayScore: number | null;
  status: number;
  winner: string | null;
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
    this.home = data.Home ? new Team(data.Home) : data.PlaceHolderA;
    this.away = data.Away ? new Team(data.Away) : data.PlaceHolderB;
    this.homeScore = data.HomeTeamScore;
    this.awayScore = data.AwayTeamScore;
    this.status = data.MatchStatus;
    this.winner = data.Winner;
  }
}
