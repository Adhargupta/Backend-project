import {v2 as cloudinary} from 'cloudinary'         // this is used for uploading file to cloudinary (that is used for storing images and videos in cloud)
import fs from 'fs'                         // To read or open file


// ********************************************** for uploading to cloudinary **********************************************//

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null                       // if there is no file path then return null
        const response = await cloudinary.uploader.upload(localFilePath,{                      // Uploads file
            resource_type: "auto"
        })
        // console.log(response);
        fs.unlinkSync(localFilePath)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath)                // removes locally saved temporary files when upload fails
        return null;
    }
}

export {uploadOnCloudinary}