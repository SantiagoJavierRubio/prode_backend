import axios from 'axios'
import Container from '../Containers/fifa.js'
import 'dotenv/config'

const SEASON_ID = process.env.MODO_PRUEBA ? '254645' : '255711'
const GROUP_STAGE = process.env.MODO_PRUEBA ? '275073' : '285063'

class Fifa extends Container {
    constructor() {
        super()
        this.apiUrl = 'https://api.fifa.com/api/v1/'
    }
    async getAllMatches(lang='es') {
        try {
            const data = await axios.get(`${this.apiUrl}/calendar/matches?idSeason=${SEASON_ID}&count=100&language=${lang}`)
            if(!data.data?.Results) throw new Error('Failed to obtain fixture')
            return this.normalizeMatches(data.data.Results)
        }
        catch(err) {
            return { error: err.message }
        }
    }
    async getMatchesById(ids, lang='es') {
        try {
            const idList = ids[0] ? ids : [ids]
            const matches = await this.getAllMatches(lang)
            if(matches.error) throw new Error(matches.error)
            return matches.filter(match => idList.includes(match.id))
        }
        catch(err) {
            return { error: err.message }
        }
    }
    async getAllStages(lang='es') {
        try {
            const matches = await this.getAllMatches(lang)
            if(matches.error) throw new Error(matches.error)
            const stages = this.groupByStage(matches)
            let indexGroups = stages.findIndex(stage => stage.id === GROUP_STAGE)
            if(indexGroups === -1) throw new Error('Failed to group stage')
            stages[indexGroups].groups = this.groupByGroup(stages[indexGroups].matches)
            delete stages[indexGroups].matches
            return stages
        } 
        catch(err) {
            return { error: err.message }
        }
    }
    async getOneStage(id, lang='es') {
        try {
            const data = await axios.get(`${this.apiUrl}calendar/matches?idSeason=${SEASON_ID}&idStage=${id}&count=100&language=${lang}`)
            if(!data.data?.Results) throw new Error('Failed to obtain fixture')
            return this.normalizeMatches(data.data.Results)
        }
        catch(err) {
            return { error: err.message }
        }
    }
    async getAllGroups(lang='es') {
        try {
            const matches = await this.getOneStage(GROUP_STAGE, lang)
            if(matches.error) throw new Error(matches.error)
            return this.groupByGroup(matches)
        } 
        catch(err) {
            return { error: err.message }
        }
    }
    async getOneGroup(id, lang='es') {
        try {
            const data = await axios.get(`${this.apiUrl}calendar/matches?idSeason=${SEASON_ID}&idStage=285063&idGroup=${id}&count=100&language=${lang}`)
            if(!data.data?.Results) throw new Error('Failed to obtain fixture')
            return this.normalizeMatches(data.data.Results)
        }
        catch(err) {
            return { error: err.message }
        }
    }
}

const FifaDAO = new Fifa()
export default FifaDAO