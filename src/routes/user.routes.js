import {Router} from 'express';
import registerUser from '../controllers/user.controller.js'
import {upload} from '../middleware/multer.middleware.js'                           // For files like images and avtar

const router = Router()

router.route("/register").post(

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
export default router