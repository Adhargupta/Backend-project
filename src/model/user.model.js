import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";                                                                // this for dealing with pasword problem like comparisions and all
import jwt from "jsonwebtoken";                                                             // this is used for creating token and all

const userSchema = new Schema(
    {
    usename: {
        type: String,
        required:true,
        unique: true,
        lowercase:true,
        trim:true,
        index:true,                     // helps in faster search and retrieval of data
    },
    email: {
        type: String,
        required:true,
        unique: true,
        lowercase:true,
        trim:true,
    },
    fullname: {
        type: String,
        required:true,
        trim:true,
        index:true,
    },
    avtar: {
        type: String,                   // we will store url from "cloudinary"
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory: [{
        ref:"Video",
        type: mongoose.Schema.Types.ObjectId
    }],
    password:{
        type:String,
        required:[true, "Password is required"],
    },
    
    refreshToken:{
        type:String,
    }

},{timestamps:true})

userSchema.pre("save",async function (next){                                
// pre is middleware used performing action before saving data in database
// async is used cause this is a time taking process and we dont want to block the main thread
// function is used cause we need to access "this" keyword which is not possible in arrow function
// next is used to move next middleware
    if(this.isModified("password")){                                              // this is used to check if password is modified (modified is in built) or not
        this.password = await bcrypt.hash(this.password, 10)              // firstly we are encrypting the password before saving to db and 10 is the rounds of hashing
        next()                                                          // this is used to move to next middleware
    }
})

userSchema.method.isPasswordCorrect = async function(password){                 // this is used to compare the password entered by user with the password stored in database and return true pr false
    return await bcrypt.compare(password, this.password)                                     // here password is the password entered by user and this.password is the password stored in database
}

userSchema.methods.generateAccessTokens = function(){                  // This is used to generate access token for user which is a passkey for user
    jwt.sign(                                                           // Generate tokens using jsonwebtoken library carying user id and secret key and expiry time as payload
        {
            _id: this._id,                      // this._id is the id imported from mongoose which is unique for each user
            email: this.email,
            usename: this.usename,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,              // this is the secret key which is used to sign the token and should be kept secret and should be long and complex
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshTokens = function(){                  // This is used to generate refresh token for user i.e., when access token expires then we can use refresh token to generate new access token without asking user to login again
    jwt.sign(                                                           // Generate tokens using jsonwebtoken library carying user id and secret key and expiry time as payload
        {
            _id: this._id,                      // this._id is the id imported from mongoose which is unique for each user
        },
        process.env.REFRESH_TOKEN_SECRET,              // this is the secret key which is used to sign the token and should be kept secret and should be long and complex
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)
