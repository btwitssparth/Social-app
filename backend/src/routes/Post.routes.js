import {Router} from "express"
import { createPost, getAllPosts, toggleLikePost, addComment } from "../controllers/post.controller.js"
import {upload} from "../middlewares/multer.js"
import { verifyJwt } from "../middlewares/Auth.js"

const router= Router()

router.route("/createPost").post(
    upload.fields([{
        name:"Image",
        maxCount:5,
    }])
,verifyJwt,createPost)

router.route("/posts").get(getAllPosts)
router.route("/like/:id").post(verifyJwt,toggleLikePost)
router.route("/comment/:id").post(verifyJwt,addComment)

export default router;
