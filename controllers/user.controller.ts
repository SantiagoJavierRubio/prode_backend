import { UserDAO } from "../Persistence/DAOS/User.dao";
import { CustomError } from "../Errors/CustomError";
import{ Request, Response, NextFunction} from "express-serve-static-core"
import { User } from "../Persistence/Models/User.model";

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export class UserController {
    users = new UserDAO();

    async getUserProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userName = req.params.name || req.user?.name;
            
        }
        catch(err) {

        }
    }
}