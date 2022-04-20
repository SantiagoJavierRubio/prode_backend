import config from '../config.js'
import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import JWTStrategy from 'passport-jwt'
import User from '../DAOs/User.js'

passport.use(
    new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: '/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findByEmail(profile.emails[0].value)
            if(user) {
                return done(null, user)
            } else {
                const newUser = await User.createWithGoogle(profile)
                if(newUser) return done(null, newUser)
            }
        } catch (err) {
            return done(err)
        }
    })
)

passport.use(
    new JWTStrategy.Strategy(
      {
        jwtFromRequest: (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies.jwt;
          }
          return token;
        },
        secretOrKey: config.sessionSecret,
      },
      async (jwtPayload, done) => {
        if (!jwtPayload) {
          return done('No token found...');
        } else {
            const user = await User.getOne({ email: jwtPayload.email })
            if(!user) return done(null, false)
            return done(null, jwtPayload);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
    done(null, user._id)
})
passport.deserializeUser(async (id, done) => {
    const user = await User.getById(id)
    if(user) return done(null, user)
    return done(new Error('User not found'))
})