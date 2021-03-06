import config from '../config.js';
import passport from 'passport';
// import GoogleStrategy from 'passport-google-oauth20';
import JWTStrategy from 'passport-jwt';
import User from '../DAOs/User.js';

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
      secretOrKey: config.sessionSecret
    },
    async (jwtPayload, done) => {
      if (!jwtPayload) {
        return done('No token found...');
      }
 else {
        const user = await User.getOne({ email: jwtPayload.email });
        if (!user) return done(null, false);
        return done(null, jwtPayload);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await User.getById(id);
  if (user) return done(null, user);
  return done(new Error('User not found'));
});
