import FakeMatchGenerator from "../DAOs/FakeData/generateFakeMatches.js";
import FakeResultGenerator from "../DAOs/FakeData/generateFakeResults.js";
import FifaRepository from '../DAOs/Repositories/FifaRepository.js';
import errorHandler from "../Errors/errorHandler.js";

const matchGenerator = new FakeMatchGenerator();
const resultGenerator = new FakeResultGenerator();
const fifa = new FifaRepository()

export const createFakeGroupMatches = async (req, res, next) => {
    try {
        matchGenerator.createFakeGroupStage()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const createFakeOctavos = async (req, res, next) => {
    try {
        matchGenerator.createFakeOctavosStage()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const createFakeCuartos = async (req, res, next) => {
    try {
        matchGenerator.createFakeQuartersStage()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const createFakeSemis = async (req, res, next) => {
    try {
        matchGenerator.createFakeSemisStage()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const createFakeFinals = async (req, res, next) => {
    try {
        matchGenerator.createFakeFinalsStage()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const createFakeResults = async (req, res, next) => {
    try {
        resultGenerator.createFakeResultsToDate()
        const matches = await fifa.getAllMatches()
        res.send(matches)
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}