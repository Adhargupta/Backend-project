import {asyncHandler} from '../utils/asyncHandler.js'                   

const registerUser = asyncHandler(async (req,res)=>{                            // this syntax is going to repeat everywhere 
    res.status(200).json({
        message: "ok"
    })
})

export default registerUser