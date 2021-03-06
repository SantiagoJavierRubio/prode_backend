import { Router } from 'express'
import passport from 'passport'
import {
    getUserData,
    createWithEmail,
    loginWithEmail,
    verifyEmail,
    googleVerified,
    logout,
    grantTemporaryVerification,
    requirePasswordChange,
    changePassword} from '../controllers/auth.js'

const router = Router()
router.get('/', passport.authenticate('jwt', { session: false }), getUserData)
router.post('/email/create', createWithEmail)
router.post('/email', loginWithEmail)
router.get('/email/verify', verifyEmail)
router.post('/google', googleVerified)
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleVerified)
router.post('/logout', passport.authenticate('jwt', { session: false }), logout)
router.post('/new-password', requirePasswordChange)
router.get('/change-password', grantTemporaryVerification)
router.post('/change-password', passport.authenticate('jwt', { session: false }), changePassword)

export default router