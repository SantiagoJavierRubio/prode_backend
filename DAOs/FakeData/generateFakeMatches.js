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
        this.lastDate = Date.now() + 1000 * 60 * 60 * 24
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
            status: 1
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
    }
    createFakeGroupStage() {
        this.createFakeGroups()
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
    saveData() {
        fs.writeFileSync('fakeMatches.json', JSON.stringify(this.fakeMatches))
    }
}

const generateFakeData = () => {
    const generator = new FakeMatchGenerator()
    generator.createFakeGroupStage()
    generator.saveData()
    // console.log(generator.fakeMatches)
}

generateFakeData()