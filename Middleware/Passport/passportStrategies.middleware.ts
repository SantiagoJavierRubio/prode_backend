import passport from "passport";
import JWTStrategy, { ExtractJwt } from "passport-jwt";
import { UserDAO } from "../../Persistence/DAOS/User.dao";
import config from "../../config";
import { LeanDocument } from "mongoose";
import { UserDocument } from "../../Persistence/Models/User.model";
import { CustomError } from "../../Middleware/Errors/CustomError";

declare global {
    namespace Express {
        interface User extends LeanDocument<UserDocument> {}
    }
}

const users = new UserDAO()

passport.use(
    new JWTStrategy.Strategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.sessionSecret,
        },
        async (jwtPayload, done): Promise<void> => {
            if (!jwtPayload) return done("No token found")
            const user = await users.getOne({ email: jwtPayload.email });
            if (!user) return done(null, false);
            return done(null, jwtPayload)
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async(id: string, done) => {
    const user = await users.getById(id);
    if (user) return done(null, user);
    return done(new CustomError(401, "User not found"))
})