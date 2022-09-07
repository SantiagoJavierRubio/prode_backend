import { Router } from "express";
import passport from "passport";
import {
  getUserProfile,
  editProfile,
  listAvatars,
} from "../controllers/user.js";

const router = Router();

router.use(passport.authenticate("jwt", { session: false }));
router.get("/profile/:name?", getUserProfile);
router.post("/edit", editProfile);
router.get("/avatars", listAvatars);

export default router;
