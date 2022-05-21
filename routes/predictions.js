import { Router } from 'express'
import passport from 'passport'
import { create, getAll, edit, editMany, remove, getPreviousForStage } from '../controllers/predictions.js'

const router = Router()

router.use(passport.authenticate('jwt', { session: false }))
router.post('/', create)
router.get('/', getAll)
router.put('/:id', edit)
router.post('/edit-multiple', editMany)
router.delete('/:id', remove)
router.get('/history', getPreviousForStage)

export default router