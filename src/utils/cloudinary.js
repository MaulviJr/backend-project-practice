import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

export const uploadOnCloudinary = async (localFilePath)=>{
    try {
      const response =  cloudinary.uploader.upload(localFile,{
    resource_type:"auto"
})
    console.log("File Uploaded");
    console.log("response material check: ", response)
    } catch (error) {
        fs.unlinkSync(localFilePath);
        // remove the temp file in public
    }
}



