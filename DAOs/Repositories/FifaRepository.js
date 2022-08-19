import { getFifaDao } from '../DAO_Factories/FifaFactory.js'

class FifaRepository {
    constructor() {
        this.dao = getFifaDao()
    }
    async getAllMatches(lang='es') {
        const data = await this.dao.getAllMatches(lang)
        return data
    }
    async getMatchesById(ids, lang='es') {
        const data = await this.dao.getMatchesById(ids, lang)
        return data
    }
    async getAllStages(lang='es') {
        const data = await this.dao.getAllStages(lang)
        return data
    }
    async getOneStage(id, lang='es') {
        const data = await this.dao.getOneStage(id, lang)
        return data
    }
    async getAllGroups(lang='es') {
        const data = await this.dao.getAllGroups(lang)
        return data
    }
    async getOneGroup(id, lang='es') {
        const data = await this.dao.getOneGroup(id, lang)
        return data
    }
}

export default FifaRepository;