import { Router } from 'express';
import {
  getFixture,
  getGroups,
  getLocaleLanguage,
  getFixtureStatus,
  getNextMatches,
} from '../controllers/fifa.js';

const router = Router();

router.use(getLocaleLanguage);
router.get('/', (req, res) => {
  res.send('Welcome to the API!');
});
router.get('/fixture', getFixture);
router.get('/fixture/groups', getGroups);
router.get('/fixture-status', getFixtureStatus);
router.get('/next-matches', getNextMatches);

export default router;
