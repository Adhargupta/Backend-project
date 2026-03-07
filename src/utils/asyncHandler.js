// Here we are creating functions that can be used in various files

// Mathod 1 (using Promise)

const asyncHandler = (requestHander)=>{
    (req,res,next)=>{
        Promise.resolve(requestHander(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}

// Method 2 (using try catch block)

// const asyncHandler = (requestHander)=>async (req,res,next)=>{
//     try{
//         await requestHandler(req,res,next)
//     }catch (error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }