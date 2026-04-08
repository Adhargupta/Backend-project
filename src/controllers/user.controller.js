import {asyncHandler} from '../utils/asyncHandler.js'       
import {ApiError} from '../utils/ApiError.js'
import {User} from '../model/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req,res)=>{                            // this syntax is going to repeat everywhere 

    // ***************************************************************  Roadmap for Registeration *************************************************************** //

    // 1. get user details (username. email, fullname, avtar, coverImage, password) from user.model.js
    // 2. check and validate those data (null or wrong input)
    // 3. check if user already exist or not (by email,username)
    // 4. now check images and avtar (wether the uploaded file in right format and all)
    // 5. upload those to cloudnary and convert to link

    // 6. Store that link in mongoDB by creating user object (object like as model)

    // 7. While giving response data back from mongodb to users we will remove password + refresh token
    // 8. Check user is created or not
    // 9. return response

    // ********************* taking data from frontend ********************* //

    // Step 1           (we post data in postman and get data here)
    const {fullname, email, username, password} = req.body
    // console.log("email",email);
    const avtarLocalPath = req.files?.avtar?.[0]?.path
    console.log(req.files);

    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path                            // this is more professional way to check for cover image
    }

    // Step 2           (Checking wether data is empity)
    // if(fullname.trim()===""){
    //     throw new ApiError(
    //         400,                        //This is status code as it asked in ApiError constructor
    //         "All fields are required"                   // This is message passed in ApiError Constructor
    //     )
    // }

    // or

    if([fullname,email,username,password].some(field => !field?.trim())){
        throw new ApiError(400,"All fields are required")
    }
    

    if(!avtarLocalPath){
        throw new ApiError(
            400,
            "Avtar file is required"
        )
    }

    // Step 3           (Checking if it already exist)
    const existedUser = await User.findOne({                                   // to find wether user with same name or email exist
        $or: [{username},{email}]                // $or is for multiple fields
    })
    if(existedUser){
        throw new ApiError(
            409,                                // status code passed to the contructor of api error
            "Username or email already exist"               // message passed in apierror
        )
    }

    // Step 5               (uploading to cloudinary)
    const avtar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avtar){
        throw new ApiError(
            400,
            "Avtar file is required"
        )
    }

    // Step 6                   (creating object and uploading to mongoDB)
    const user = await User.create({                                // await is cause while talking to DB it may take time
        fullname,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",                       // We ddin't check for the image so we are using ||
        email: email.toLowerCase(),
        password,
        username: username.toLowerCase()
    })

    // Step 7 + 8                          (checking user is created or not + hiding password from response)
    const createdUser = await User.findById(
        user._id                               //checks wether user is already is created or not
    ).select(
        "-password -refreshToken"               // This hides password and refresh tokens
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while user register")
    }

    // Step 9                           (returning response)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


const loginUser = asyncHandler(async (req,res)=>{

    // ***************************************************************  Roadmap for LogIn *************************************************************** //

    // 1. Taking data from req.body
    // 2. Check wether username or email already exist
    // 3. Checks the password
    // 3. generate Access and Refresh tokens
    // 4. Send them as cookies

    // Step 1                                   (taking data from req.body)
    const {email, username, password} = req.body

    if(!email && !username){
        throw new ApiError(400,"username or email is required")
    }

    // Step 2                                   (Check wether username or email already existed )
    const user = await User.findOne({
        $or: [{email}, {username}]
    })
    if(!user){
        throw new ApiError(404, "User doesn't exist")
    }

    // Step 3                                   ( Check Password )
    // if(password!=user.password){                                 // This will not work cause the password is bcrypted and always gonna mismatch
    //     throw new ApiError(400, "Incorrect Password")
    // }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Enter correct password")
    }

    // Step 4                                       (Generating accessTokens and refreshTokens)
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // Optional
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Step 5                                      (Sending it in Cookies)
    const options = {
        httpOnly: true,
        secure: true,                           // By this the Cookies only be modified in server side not in client side
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedIn Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{

// ***************************************************************  Roadmap for LogIn *************************************************************** //

    // 1. Getting user from access token                    (By making middleware -> auth.middlewware.js)
    // 2. Passing user to logoutUser function by    ->       next()                             (then go to user.routes.js)
    // 3. Finding the user
    // 4. Getting user data (user._id)                              (As we defined in user.mmodel.js)
    // 5. Setting  ->  user._id to undefined + clearing cookies (access and refresh tokems)
    // 6. Sending back Successful meassage with empty data as cookie


    // Step - 3
    await User.findByIdAndUpdate(                                           // we are using findByUpdate instead of findBy because we only want to update refresh token to undefined and we don't care about the response of findByIdAndUpdate

        // Step - 4 + 5
        req.user._id,                                                       // This will update
        {
            $set: {
                refreshToken: undefined                                     // By this
            }
        },
        {
            new: true                                                       // By this we will get the updated user in response but we don't care about it so we can ignore it
        },

    )
    // Step - 6                              Cookies 
    const options = {
        httpOnly: true,
        secure: true,                           // By this the Cookies only be modified in server side not in client side
    }

    return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {

            },
            "User loggedOut Successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    
// ************************************** Refreshing Access Token *************************************************************** //

    // Step 1 -> Store the refresh token of current user
    // Step 2 -> verify the refresh token
    // Step 3 -> encode the refresh token and take user info
    // Step 4 -> Match user refresh token with db stored refresh token
    // Step 5 -> if not matched generate new Access and refresh token

    try {
        // Step 1
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken              // second one is for mobile user 
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized request")
        }
        
        // Step 2
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)                    // This is give user data from the token by encodeding + Varifies it
    
        // Step 3
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        // Step 4
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        // Step 5
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(
            400,
            error?.message,
            "Invaid refresh token"
        )
    }
})

// Token → decoded → get _id → fetch user → attach to req.user → controller uses it
const changeCurrentPassword = asyncHandler(async (req, res)=>{

    // *************************************************************** To change password *************************************************************** //

    // Step - 1     Get the old and new password inserted by user
    // Step - 2     Get the old user password from DB
    // Step - 3     Check the old password of user from DB with the password inserted by user
    // Step - 4     Update the old password with new
    // Step - 5     Saving the password

    // Step - 1                                 (Get the old password)
    const {oldPassword, newPassword} = req.body

    // Step - 2                                 (Get the old password of the user from Db)
    const user = await User.findById(req.user?._id)

    // Step - 3                                 (checking it with old password from Db)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)                 // method created by us in user.model.js
    if(!isPasswordCorrect){
        throw new ApiError(400, "Enter Correct password")
    }

    // Step - 4                                 (Updating/ seting new Password)
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password updated successfully"
    ))
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
// ******************************** To update Account detail ********************************************** //

    // Step 1  ->  Getting new full name or email from the user 
    // Step 2  ->  Checking wether full name or email not be empty
    // Step 3  ->  Getting old user
    // Step 4  ->  Replacing / Updating old data with new
    // Step 5  ->  Sned response and message

    // Step - 1                     (Getting fullname or email from user)
    const {fullname,email} = req.body

    // Step - 2
    if(!fullname && !email){
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    // Step - 3 + 4
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new:true}                              // To know whether is is updated?
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Account details updated successfully"
    ))
})

const updateAvatar = asyncHandler(async(req,res)=>{
// ******************************** To update Avatar ********************************************** //

    // Step - 1     Get the avtar from user
    // Step - 2     Upload it in cloudinary
    // Step - 3     take the user and current avtar
    // Step - 4     Update the current avtar with new one
    // Step - 5     Send reponse and message

    // Step 1
    const newAvtarLocalPath = req.file?.path                                // This give us the path of the uploaded file in our local storage (multer) and we will upload this file to cloudinary
    if(!newAvtarLocalPath){
        throw new ApiError(
            400,
            "Avtar file is not uploaded"
        )
    }

    // Step 2
    const avtar = await uploadOnCloudinary(newAvtarLocalPath)                   // this give object with url and path uploaded in cloudinary
    if(!avtar.url){
        throw new ApiError(400,"Error while uploading avtar")
    }

    // Step 3 + 4
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avtar: avtar.path
            }
            
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Avtar is updated successfully"
    ))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
// ******************************** To update Avatar ********************************************** //

    // Step - 1     Get the coverImage from user
    // Step - 2     Upload it in cloudinary
    // Step - 3     take the user and current coverImage
    // Step - 4     Update the current coverImage with new one
    // Step - 5     Send reponse and message

    // Step 1
    const newCoverImageLocalPath = req.fie?.path
    if(!newCoverImageLocalPath){
        throw new ApiError(
            400,
            "Cover Image is not uploaded"
        )
    }

    // Step 2
    const coverImage = await uploadOnCloudinary(newCoverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(
            400,
            "Error while uploading cover image"
        )
    }

    // Step 3 + 4
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    // Step 5
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Cover Image changed Successfuly"
    ))
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
// ******************************** To get Channel profile info ********************************************** //

    // Get info like :-  username, number of subscribers, number of subscribed, Cover Image

    // Step - 1     Getting username from params           (params means URL) {user search by url}
    // Step - 2     Find user by username
    // Step - 3     Getting users details from user  





    // Step 1                               (Getting users details from params)
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")
    }

// ************************************************************************************************************************************ //
    // // Step 2 + 3
    // const user = await User.findOne(                                                // This expect object not string
    //     {username}
    // ).select("-password")

    // const coverImageLocalPath = user?.coverImage
// ************************************************************************************************************************************ //

    const channel = await User.aggregate([                                // This is more professional way to do it and also we can get more details like number of subscribers and all by using aggregate function of mongoose also it returns arrays

        // Pipeline -1 
        {
            $match: {                                                       // match is used to find the document which match the condition and it expect object
                username: username?.toLowerCase()                               // same as User.findOne({ username })
            }
        },

        // For subscribers
        {
            $lookup: {                                                      // lookup is used to join two collections (subscribers and user) and it expect object
                from: "subscriptions",
                localField: "_id",                                      // feild from user
                foreignField: "channel",                                // feild from subscription
                as: "subscriber"                                       // this is the name of the new field which will be created in user collection and it will contain the array of subscribers
            }
        },

        // For subscribed
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        // Adding those fields together
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscriber"                       // We are using $ with subscribers as it is a field
                },

                subscriberedToCount: {
                    $size: "$subscribedTo"
                },

                isSubscribed: {                                 // For the red coloured button "Subscribe"
                    $cond: {                                     // condition have if then and else
                        if: {$in: [req.user?._id, "$subscriber.subscriber"]},                      // $if :- Checks in document wether you are there or not   +   $in :- to go inside array or object  +  $subscribers.subscriber :- this is the path to go inside subscribers array and get subscriber field which is the user id of subscriber and check it with req.user._id
                        then:true,
                        else: false
                    }
                }
            }
        },

        {
            $project: {                                     // Select which values are to be shown in profile
                fullname: 1,                // 1:- Selected
                username: 1,
                avtar: 1,
                subscribersCount: 1,
                subscriberedToCount: 1,
                isSubscribed: 1,
                coverImage: 1,
                email: 1,
            }
        }

    ])                                                                    // This gives arrays of objects (which contains matched value) {Since, we have only one matched value (_id)}

    if(!channel?.length){                                   // If user is not found then channel will be empty array and length will be 0
        throw new ApiError(404, "Channel doesn't exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")                // As we have only one matched value so we are taking first value of array which is channel[0] that have value 
    )
})

export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,

} 