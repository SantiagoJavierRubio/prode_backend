import FifaRepository from '../DAOs/Repositories/FifaRepository.js';

const fifa = new FifaRepository();

export const randomUnpredictedMatch = async (predictions, timeLimit) => {
    const predictionMatchIds = predictions.map(prediction => prediction.matchId)
    const matches = await fifa.getAllMatches();
    const now = Date.now()
    const validFutureMatches = matches.filter(match => {
        const matchDate = Date.parse(match.date)
        return (match.home.name && 
        match.away.name && 
        ((now + parseInt(timeLimit || 0)) < matchDate) &&
        !predictionMatchIds.includes(match.id))
    })
    console.log(validFutureMatches.length)
    if (validFutureMatches.length === 0) return null
    return validFutureMatches[Math.floor(Math.random()*validFutureMatches.length)]
}