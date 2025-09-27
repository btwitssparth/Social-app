import {Router} from "express"
import { registeruser,loginuser,logoutuser,getcurrentuser } from "../controllers/auth.controller.js"
import {upload} from "../middlewares/multer.js"
import { verifyJwt } from "../middlewares/Auth.js"

const router= Router()
router.route("/register").post(
    upload.fields([{
        name:"profilePic",
        maxCount:1,
    }])
,registeruser)

router.route("/login").post(loginuser)
router.route("/logout").post(verifyJwt,logoutuser)
router.route("/profile").get(verifyJwt,getcurrentuser)

export default router;