import { Router } from 'express';
import passport from 'passport'
import {
    create,
    join
} from '../controllers/groups.js';

const router = Router();

router.use(passport.authenticate('jwt', { session: false }))
router.post('/create', create);
router.post('/join', join);

export default router