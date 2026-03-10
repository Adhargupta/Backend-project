import {asyncHandler} from '../utils/asyncHandler.js'       
import {ApiError} from '../utils/ApiError.js'
import {User} from '../model/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req,res)=>{                            // this syntax is going to repeat everywhere 
    // *********************  Roadmap  ********************* //
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
    console.log("email",email);
    const avtarLocalPath = req.files?.avtar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

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
    const coverImage = await uploadOnCloudinary(avtarLocalPath)

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

export default registerUser