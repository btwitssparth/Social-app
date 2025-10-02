import { Router } from "express";
import {
  registeruser,
  loginuser,
  logoutuser,
  getcurrentuser,
  refreshAccessToken,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/Auth.js";

const router = Router();

// Public routes
router.route("/register").post(
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  registeruser
);

router.route("/login").post(loginuser);

router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJwt, logoutuser);

router.route("/profile").get(verifyJwt, getcurrentuser);

router.route("/update-profile").patch(
  verifyJwt,
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  updateProfile
);

router.route("/change-password").post(verifyJwt, changePassword);

export default router;