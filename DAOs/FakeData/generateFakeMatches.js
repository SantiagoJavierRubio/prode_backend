// import fs from 'fs'
import FakeMatch from "./FakeModels/fakeMatch.js";
import FakeTeam from "./FakeModels/fakeTeams.js";

const FAKE_STADIUMS = [
    { id: '151515', name: 'Estadio Santiago Bernabeu'},
    { id: '101010', name: 'Estadio Libertadores de América'},
    { id: '202020', name: 'Estadio Monumental'},
    { id: '303030', name: 'Estadio de la Liga'},
    { id: '505050', name: 'Estadio de la Primera División'}
]

const TEAMS = ['Argentina', 'Brasil', 'Denmark', 'France', 'Germany', 'Egypt', 'Qatar', 'Senegal',
'Ecuador', 'Colombia', 'Mexico', 'Polonia', 'Tunez', 'Belgica', 'England', 'Croatia', 'Canada', 'Iran',
'Japan', 'Uruguay', 'Portugal', 'Russia', 'Nigeria', 'Korea', 'Ghana', 'Marruecos', 'Australia', 'Italia',
'España', 'Wales', 'USA', 'Nederlands']

class TeamDTO {
    constructor(data) {
        this.id = data.id || `${data._id}`;
        this.name = data.name;
        this.shortName = data.shortName;
        this.flag = data.flag;
    }
}

async function createTeamData() {
    await TEAMS.forEach(async teamName => {
        let shortName
        switch(teamName) {
            case 'Japan':
                shortName = 'JPN'
                break;
            case 'Iran':
                shortName = 'IRN'
                break;
            case 'Nigeria':
                shortName = 'NGA'
                break;
            default:
                shortName = teamName.substring(0, 3).toUpperCase()
        }
        const team = new FakeTeam({
            name: teamName,
            shortName: shortName,
            flag: `https://api.fifa.com/api/v1/picture/flags-{format}-{size}/${shortName}`
        })
        await team.save()
    })
}

class FakeMatchGenerator {
    constructor() {
        this.fakeMatches = []
        this.lastId = 100000
        this.lastDate = Date.now()
        this.fakeStadiums = FAKE_STADIUMS
        this.groups = []
    }

    async generateFakeMatch(stage, stageId, groupName=null, groupId=null, teamA, teamB) {
        const stadium = this.fakeStadiums[Math.floor(Math.random() * this.fakeStadiums.length)]
        const A = new TeamDTO(teamA);
        const B = new TeamDTO(teamB);
        const date = new Date(this.lastDate += 1000 * 60 * 60)
        const isAHome = Math.random() > 0.5
        const match = new FakeMatch({
            stage,
            stageId: `${stageId}`,
            group: groupName,
            groupId: `${groupId}`,
            home: isAHome ? A : B,
            away: isAHome ? B : A,
            stadiumId: stadium.id,
            stadium: stadium.name,
            date: date.toISOString(),
            status: 1
        })
        this.lastDate = date.getTime();
        await match.save();
        
    }

    async createFakeTeams() {
        await FakeTeam.collection.drop();
        await createTeamData();
    }

    async createFakeGroups() {
        const fakeTeams = await FakeTeam.find().lean();
        if (fakeTeams.length < 32) throw new Error('Missing teams');
        const groupNames = 'ABCDEFGH'
        let id = 100001
        for (let g = 0; this.groups.length < groupNames.length; g++) {
            const teams = []
            for(let i = 0; i < 4; i++) {
                const index = Math.floor(Math.random() * fakeTeams.length)
                teams.push(fakeTeams[index])
                fakeTeams.splice(index, 1)
            }
            const group = {
                id: id++,
                name: `Grupo ${groupNames[g]}`,
                teams: teams
            }
            this.groups.push(group)
        }
    }

    async createFakeGroupStage(startDate) {
        await FakeMatch.collection.drop();
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.groups.forEach(group => {
            for(let i=1; i<4; i++) {
                this.generateFakeMatch('Fase de grupos', '111111', group.name, group.id, group.teams[0], group.teams[i])
            }
            for(let i=2; i<4; i++) {
                this.generateFakeMatch('Fase de grupos', '111111', group.name, group.id, group.teams[1], group.teams[i])
            }
            this.generateFakeMatch('Fase de grupos', '111111', group.name, group.id, group.teams[2], group.teams[3])
        })
    }

    async getPreviousStageMatches(prevStageId) {
        return await FakeMatch.find({stageId: prevStageId})
    }

    async calculateGroupClassifications() {
        const groupPhaseMatches = await this.getPreviousStageMatches('111111')
        const groupScores = {}
        groupPhaseMatches.forEach(match => {
            if(match.status && match.status !== 0) {
                throw new Error('Fase no finalizada')
            } 
            if(match.winner) {
                if (!groupScores[match.group]) {
                    groupScores[match.group] = {}
                    groupScores[match.group][match.winner] = { score: 3 }
                } 
                else if (!groupScores[match.group][match.winner]) {
                    groupScores[match.group][match.winner] = { score: 3 }
                }
                else groupScores[match.group][match.winner].score += 3
            }
            else {
                if (!groupScores[match.group]) {
                    groupScores[match.group] = {}
                    groupScores[match.group][match.away.id] = { score: 1 }
                    groupScores[match.group][match.home.id] = { score: 1 }
                } 
                else {
                    if (!groupScores[match.group][match.away.id]) {
                        groupScores[match.group][match.away.id] = { score: 1 }
                    }
                    else groupScores[match.group][match.away.id].score += 1
                    if (!groupScores[match.group][match.home.id]) {
                        groupScores[match.group][match.home.id] = { score: 1 }
                    }
                    else groupScores[match.group][match.home.id].score += 1
                }
            }
        })
        const clasifications = {}
        for(let [key, value] of Object.entries(groupScores)) {
            clasifications[key] = Object.keys(value).sort((a,b) => b.score - a.score)
        }
        for(let [key, value] of Object.entries(clasifications)) {
            clasifications[key] = [ await FakeTeam.findById(value[0]), await FakeTeam.findById(value[1])]
        }
        return clasifications
    }

    async createFakeOctavosStage(startDate) {
        const clasifications = await this.calculateGroupClassifications()
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo B'][0], clasifications['Grupo A'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo A'][0], clasifications['Grupo B'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo D'][0], clasifications['Grupo C'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo C'][0], clasifications['Grupo D'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo H'][0], clasifications['Grupo G'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo G'][0], clasifications['Grupo H'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo F'][0], clasifications['Grupo E'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo E'][0], clasifications['Grupo F'][1]);
    }
    async createFakeQuartersStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        const matchesOctavos = await this.getPreviousStageMatches('222222')
        const clasified = matchesOctavos.map(match => {
            if(!match.winner) throw new Error('Fase no finalizada')
            if(match.winner === match.home.id) return match.home
            else return match.away
        })
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[0], clasified[2])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[6], clasified[4])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[1], clasified[3])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[7], clasified[5])
    }
    async createFakeSemisStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        const matchesCuartos = await this.getPreviousStageMatches('333333')
        const clasified = matchesCuartos.map(match => {
            if(!match.winner) throw new Error('Fase no finalizada')
            if(match.winner === match.home.id) return match.home
            else return match.away
        })
        this.generateFakeMatch('Semifinales', '444444', null, null, clasified[0], clasified[2])
        this.generateFakeMatch('Semifinales', '444444', null, null, clasified[1], clasified[3])
    }
    async createFakeFinalsStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        const matchesSemis = await this.getPreviousStageMatches('444444')
        const clasified = []
        matchesSemis.forEach((match, index) => {
            if(!match.winner) throw new Error('Fase no finalizada')
            if(match.winner === match.home.id) {
                clasified[index] = match.home;
                clasified[index+2] = match.away;
            }
            else {
                clasified[index] = match.away;
                clasified[index+2] = match.home;
            }
        })
        this.generateFakeMatch('Final', '555555', null, null, clasified[0], clasified[1])
        this.generateFakeMatch('Tercer puesto', '666666', null, null, clasified[2], clasified[3])
    }
}

export default FakeMatchGenerator;