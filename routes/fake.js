import { Router } from 'express'
import config from '../config.js';
import { createFakeGroupMatches, createFakeResults, createFakeOctavos,
createFakeCuartos, createFakeSemis, createFakeFinals } from '../controllers/fake.js';

const router = Router();

router.use(async (req, res, next) => {
    if(req.body.password !== config.scoringPassword) {
        res.status(401).json({message: "not authorized"})
        res.end()
        return
    }
    next()
})
router.post('/generate/groups', createFakeGroupMatches)
router.post('/generate/results', createFakeResults)
router.post('/generate/octavos', createFakeOctavos)
router.post('/generate/cuartos', createFakeCuartos)
router.post('/generate/semis', createFakeSemis)
router.post('/generate/final', createFakeFinals)

export default router;