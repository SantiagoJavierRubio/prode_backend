import { Router } from 'express'
import passport from 'passport'
import {createWithEmail, loginWithEmail, verifyEmail, googleVerified, logout} from '../controllers/auth.js'

const router = Router()
router.post('/email/create', createWithEmail)
router.post('/email', loginWithEmail)
router.get('/email/verify', verifyEmail)
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleVerified)
router.post('/logout', logout)

export default router