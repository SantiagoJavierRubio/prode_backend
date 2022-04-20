import { Router } from 'express'
import passport from 'passport'
import User from '../DAOs/User.js'
import { generateJwtToken } from '../authentication/jwt.js'

const router = Router()
router.post('/email', async (req, res) => {
    try {
        const user = await User.checkCredentials(req.body.email, req.body.password)
        if(user) {
            const token = generateJwtToken(user)
            res.cookie('jwt', token)
            res.redirect('/')
        }
    } catch(err) {
        console.log(err)
    }
})
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), 
    (req, res) => {
        const token = generateJwtToken(req.user)
        res.cookie('jwt', token)
        res.redirect('/')
    }
)
router.post('/logout', (req, res) => {
    res.clearCookie('jwt')
    res.redirect('/')
})

export default router