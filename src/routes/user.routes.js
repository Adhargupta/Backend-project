import {Router} from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/user.controller.js'                                
import {upload} from '../middleware/multer.middleware.js'                           // For files like images and avtar
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router()

router.route("/register").post(                                 // When user visits at register he can send post request only

    upload.fields([                              // This is the middleware we are talking about and cause it takes many inputs so it must have many fields and those fields stored as array
        {
            name: "avtar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),

    registerUser                // so what it does is if url goes to https://localhost:8000/users then it activates register to https://localhost:8000/users/register
)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)             // Cause verifyJWT has next() it will run on it's own

router.route("/refresh-token").post(refreshAccessToken)
export default router