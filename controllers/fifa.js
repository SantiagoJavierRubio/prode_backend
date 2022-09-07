import i18n from "i18n";
import FifaRepository from "../DAOs/Repositories/FifaRepository.js";
import { getGroupCode, getStageCode } from "../utils/traslateNamesToCodes.js";
import { checkFixtureStatus } from "../utils/fixtureStatus.js";
import errorHandler from "../Errors/errorHandler.js";

const fifa = new FifaRepository();

export const getLocaleLanguage = (req, res, next) => {
  const lang = i18n.getLocale(req);
  res.locals.lang = lang;
  next();
};

export const getFixture = async (req, res, next) => {
  try {
    const payload = {};
    const groupId = req.query.groupId || null;
    const stageId = req.query.stageId || null;
    if (groupId) {
      const groupCode = getGroupCode(groupId);
      payload.fixture = await fifa.getOneGroup(groupCode, res.locals.lang);
    } else if (stageId) {
      const stageCode = getStageCode(stageId);
      payload.fixture = await fifa.getOneStage(stageCode, res.locals.lang);
    } else payload.fixture = await fifa.getAllStages(res.locals.lang);
    res.json(payload);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const payload = { fixture: await fifa.getAllGroups(res.locals.lang) };
    res.json(payload);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const getFixtureStatus = async (req, res, next) => {
  try {
    const payload = await checkFixtureStatus();
    res.json(payload);
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};

export const getNextMatches = async (req, res, next) => {
  try {
    const quantity = parseInt(req.query.quantity) || 5;
    const allMatches = await fifa.getAllMatches();
    const now = Date.now();
    const nextMatches = allMatches
      .filter(
        (match) =>
          match?.home?.name &&
          match?.away?.name &&
          now < Date.parse(match?.date)
      )
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
      .slice(0, quantity);
    res.json({ fixture: nextMatches });
  } catch (err) {
    errorHandler(err, req, res, next);
  }
};
