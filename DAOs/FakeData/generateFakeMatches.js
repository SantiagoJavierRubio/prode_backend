import fs from 'fs'

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

function createTeamData() {
    const teams = []
    let id = 123456
    TEAMS.forEach(teamName => {
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
        const team = {
            id: `${id++}`,
            name: teamName,
            shortName: shortName,
            flag: `https://api.fifa.com/api/v1/picture/flags-{format}-{size}/${shortName}`
        }
        teams.push(team)
    })
    return teams
}

class FakeMatchGenerator {
    constructor() {
        this.fakeMatches = []
        this.lastId = 100000
        this.lastDate = Date.now()
        this.fakeStadiums = FAKE_STADIUMS
        this.fakeTeams = createTeamData()
        this.groups = []
    }
    generateFakeMatch(stage, stageId, groupName=null, groupId=null, teamA, teamB) {
        const stadium = this.fakeStadiums[Math.floor(Math.random() * this.fakeStadiums.length)]
        const date = new Date(this.lastDate += 1000 * 60 * 60)
        const isAHome = Math.random() > 0.5
        const match = {
            id: `${this.lastId++}`,
            stage,
            stageId: `${stageId}`,
            group: groupName,
            groupId: `${groupId}`,
            home: isAHome ? teamA : teamB,
            away: isAHome ? teamB : teamA,
            homeScore: null,
            awayScore: null,
            stadiumId: stadium.id,
            stadium: stadium.name,
            date: date.toISOString(),
            status: 1,
            winner: null
        }
        this.lastDate = date.getTime();
        this.fakeMatches.push(match)
    }
    createFakeGroups() {
        const groups = []
        const groupNames = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
        let id = 987654
        groupNames.forEach(groupName => {
            const teams = []
            for(let i = 0; i < 4; i++) {
                const index = Math.floor(Math.random() * this.fakeTeams.length)
                teams.push(this.fakeTeams[index])
                this.fakeTeams.splice(index, 1)
            }
            const group = {
                id: id--,
                name: `Grupo ${groupName}`,
                teams: teams
            }
            groups.push(group)
        })
        this.groups = groups
        fs.writeFileSync('fakeGroups.json', JSON.stringify(this.groups))
    }
    saveData() {
        fs.writeFileSync('fakeMatches.json', JSON.stringify(this.fakeMatches))
    }
    createFakeGroupStage(startDate) {
        this.createFakeGroups()
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
        this.saveData()
    }
    getMatchData() {
        const data = fs.readFileSync(`${process.cwd()}/fakeMatches.json`, 'utf-8')
        return JSON.parse(data)
    }
    getGroupsData() {
        const data = fs.readFileSync(`${process.cwd()}/fakeGroups.json`, 'utf-8')
        return JSON.parse(data)
    }
    getPreviousStageMatches(prevStageId) {
        const allMatches = this.getMatchData();
        return allMatches.filter(match => match.stageId === prevStageId)
    }
    calculateGroupClassifications() {
        const groupPhaseMatches = this.getPreviousStageMatches('111111')
        const groups = this.getGroupsData()
        const groupScores = {}
        groups.forEach(group => {
            groupScores[group.name] = {}
            group.teams.forEach(team => {
                groupScores[group.name][team.id] = { ...team, score: 0 }
            })
        })
        groupPhaseMatches.forEach(match => {
            if(match.status !== 0) throw new Error('Fase no finalizada')
            if(match.winner) {
                groupScores[match.group][match.winner].score += 3
            }
            else {
                groupScores[match.group][match.away.id].score += 1
                groupScores[match.group][match.home.id].score += 1
            }
        })
        const clasifications = {}
        groups.forEach(group => {
            clasifications[group.name] = Object.keys(groupScores[group.name]).map(team => groupScores[group.name][team]).sort((a,b) => b.score - a.score)
        })
        return clasifications
    }
    createFakeOctavosStage(startDate) {
        const clasifications = this.calculateGroupClassifications()
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.fakeMatches = this.getMatchData()
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo B'][0], clasifications['Grupo A'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo A'][0], clasifications['Grupo B'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo D'][0], clasifications['Grupo C'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo C'][0], clasifications['Grupo D'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo H'][0], clasifications['Grupo G'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo G'][0], clasifications['Grupo H'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo F'][0], clasifications['Grupo E'][1]);
        this.generateFakeMatch('Octavos', '222222', null, null, clasifications['Grupo E'][0], clasifications['Grupo F'][1]);
        this.saveData()
    }
    createFakeQuartersStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.fakeMatches = this.getMatchData()
        const matchesOctavos = this.getPreviousStageMatches('222222')
        const clasified = matchesOctavos.map(match => {
            if(!match.winner) throw new Error('Fase no finalizada')
            if(match.winner === match.home.id) return match.home
            else return match.away
        })
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[0], clasified[2])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[6], clasified[4])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[1], clasified[3])
        this.generateFakeMatch('Cuartos', '333333', null, null, clasified[7], clasified[5])
        this.saveData()
    }
    createFakeSemisStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.fakeMatches = this.getMatchData()
        const matchesCuartos = this.getPreviousStageMatches('333333')
        const clasified = matchesCuartos.map(match => {
            if(!match.winner) throw new Error('Fase no finalizada')
            if(match.winner === match.home.id) return match.home
            else return match.away
        })
        this.generateFakeMatch('Semifinales', '444444', null, null, clasified[0], clasified[2])
        this.generateFakeMatch('Semifinales', '444444', null, null, clasified[1], clasified[3])
        this.saveData()
    }
    createFakeFinalsStage(startDate) {
        this.lastDate = startDate ? new Date(startDate) : Date.now()
        this.fakeMatches = this.getMatchData()
        const matchesSemis = this.getPreviousStageMatches('444444')
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
        this.saveData()
    }
}

export default FakeMatchGenerator;