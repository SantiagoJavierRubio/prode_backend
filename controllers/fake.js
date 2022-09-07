import FakeMatchGenerator from "../DAOs/FakeData/generateFakeMatches.js";
import FakeResultGenerator from "../DAOs/FakeData/generateFakeResults.js";
import FifaRepository from "../DAOs/Repositories/FifaRepository.js";
import errorHandler from "../Errors/errorHandler.js";

const matchGenerator = new FakeMatchGenerator();
const resultGenerator = new FakeResultGenerator();
const fifa = new FifaRepository();

export const createFakeTeams = async (req, res, next) => {
  try {
    await matchGenerator.createFakeTeams();
    setTimeout(() => {
      res.send("ok");
    }, 1000);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createGroups = async (req, res, next) => {
  try {
    await matchGenerator.createFakeGroups();
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeGroupMatches = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || null;
    await matchGenerator.createFakeGroupStage(startDate);
    await matchGenerator.createFakeEmptyLaterStages();
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeOctavos = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || null;
    matchGenerator.createFakeOctavosStage(startDate);
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeCuartos = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || null;
    matchGenerator.createFakeQuartersStage(startDate);
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeSemis = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || null;
    matchGenerator.createFakeSemisStage(startDate);
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeFinals = async (req, res, next) => {
  try {
    const startDate = req.body.startDate || null;
    matchGenerator.createFakeFinalsStage(startDate);
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const createFakeResults = async (req, res, next) => {
  try {
    resultGenerator.createFakeResultsToDate();
    const matches = await fifa.getAllMatches();
    res.send(matches);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
