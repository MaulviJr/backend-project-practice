import { Router } from "express";
import { loginUser, registerUser,logoutUser,refreshAccessToken, changeUserPassword, updateUserDetails, updateAvatar, updateCoverImage, getCurrentUser, getWatchHistory,getChannelDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1,
    },
    {
        name: "coverImage",
        maxCount: 2,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
    
]) ,registerUser)

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeUserPassword);
router.route("/update-details").patch(verifyJWT,updateUserDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)
router.route("/update-cover").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route("/get-user").get(verifyJWT,getCurrentUser);
router.route("/c/:username").get(verifyJWT,getChannelDetails);
router.route("/get-history").get(verifyJWT,getWatchHistory)

export default router;