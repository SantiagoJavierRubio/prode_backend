import User from '../DAOs/User.js';
import CustomError from '../Errors/CustomError.js';
import errorHandler from '../Errors/errorHandler.js';
import getAvatars from '../utils/userAvatars.js';

export const getUserProfile = async (req, res, next) => {
    try {
      const userName =  req.params.name || req.user.name;
      if(!userName) throw new CustomError(400, 'User id is required');
      const profile = await User.getOne({name: userName}, 'name avatar');
      if (!profile) throw new CustomError(406, 'User not found');
      res.json({ profile: profile })
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const editProfile = async (req, res, next) => {
    try {
        const userInput = req.body;
        const user = req.user;
        const updated = await User.editProfile(user._id, userInput);
        if (!updated) throw new CustomError(403, 'User not updated');
        res.json({ message: 'Profile updated' });
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}

export const listAvatars = async (req, res, next) => {
    try {
        const avatars = await getAvatars();
        res.json(avatars);
    }
    catch(err) {
        errorHandler(err, req, res, next)
    }
}