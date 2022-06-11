import Container from '../Containers/fifa.js'
import fs from 'fs'

const fakeData = fs.readFileSync(`${process.cwd()}/fakeMatches.json`, 'utf8')

class FakeFifaDAO extends Container {
    constructor() {
        super()
        this.matches = JSON.parse(fakeData)
        this.GROUP_STAGE = '111111'
    }
    async getAllMatches(lang) {
        return this.matches
    }
    async getMatchesById(ids, lang) {
        const response = this.matches.filter(match => ids.includes(match.id))
        return response
    }
    async getAllStages(lang) {
        const stages = this.groupByStage(this.matches)
        let indexGroups = stages.findIndex(stage => stage.id === this.GROUP_STAGE)
        if(indexGroups === -1) throw new CustomError(500, 'Failed to arrange stage', 'This error should not happen')
        stages[indexGroups].groups = this.groupByGroup(stages[indexGroups].matches)
        delete stages[indexGroups].matches
        return stages
    }
    async getOneStage(id, lang) {
        const response = this.matches.filter(match => match.stageId === id)
        return response
    }
    async getAllGroups(lang) {
        const response = this.matches.filter(match => match.stageId === this.GROUP_STAGE)
        return this.groupByGroup(response)
    }
    async getOneGroup(id, lang) {
        const response = this.matches.filter(match => match.groupId === id)
        return response
    }
}

export default FakeFifaDAO;