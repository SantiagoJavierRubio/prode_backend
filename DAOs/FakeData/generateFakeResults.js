import fs from 'fs'

class FakeResultGenerator {
    constructor() {
        this.data_file = `${process.cwd()}/fakeMatches.json`
        this.matches = []
    }
    update() {
        const data = fs.readFileSync(this.data_file, 'utf8')
        this.matches = JSON.parse(data)
    }
    createOneScore() {
        return Math.floor(Math.random() * 4)
    }
    createOneResult(match) {
        const fakeHomeScore = this.createOneScore()
        const fakeAwayScore = this.createOneScore()
        let winner = null
        if(fakeHomeScore > fakeAwayScore) winner = match.home.id;
        if(fakeAwayScore > fakeHomeScore) winner = match.away.id;
        if(!winner && match.stageId != '111111') {
            winner = (Math.random() > 0.5) ? match.away.id : match.home.id
        }
        return { ...match, homeScore: fakeHomeScore, awayScore: fakeAwayScore, winner, status: 0 }
    }
    rewriteData() {
        fs.writeFileSync('fakeMatches.json', JSON.stringify(this.matches))
    }
    createFakeResultsToDate() {
        this.update();
        const fakeResults = this.matches.map(match => {
            let matchDate = new Date(match.date).getTime()
            if(Date.now() > matchDate && match.status !== 0) {
                return this.createOneResult(match)
            }
            else return match
        })
        this.matches = [...fakeResults]
        this.rewriteData()
    }
}

export default FakeResultGenerator;