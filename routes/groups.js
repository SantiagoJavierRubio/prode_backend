import { Router } from 'express';
import passport from 'passport'
import {
    create,
    join,
    getScores,
    leaveGroup,
    getGroupData
} from '../controllers/groups.js';

const router = Router();

router.use(passport.authenticate('jwt', { session: false }))
router.post('/create', create);
router.post('/join', join);
router.get('/score', getScores);
router.post('/leave', leaveGroup);
router.get('/', getGroupData);

export default router