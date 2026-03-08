import {Router} from 'express';
import registerUser from '../controllers/user.controller.js'                    // can only give when export is default

const router = Router()

router.route("/register").post(registerUser)                // so what it does is if url goes to https://localhost:8000/users then it activates register to https://localhost:8000/users/register
export default router