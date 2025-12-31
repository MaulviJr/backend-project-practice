import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
  try {
    
      if(!localFilePath) return null;
      const response = await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
})
 fs.unlinkSync(localFilePath);
    return response;
    } catch (error) {
      console.log("Couldn't upload for some reasons: ", error);
      if(localFilePath) {
        fs.unlinkSync(localFilePath);
      }
        return null
        // remove the temp file in public
    }
}

const deleteOnCloudinary = async (oldFileUrl) => {
    try {
        if (!oldFileUrl) return null;

        // 1. Extract public ID from the URL
        // Example: https://res.cloudinary.com/demo/image/upload/v163/sample.jpg -> 'sample'
        const publicId = oldFileUrl.split("/").pop().split(".")[0];
        
        // 2. Determine the resource type (optional, defaults to 'image')
        // If your URL contains '/video/', you should pass resource_type: "video"
        const resourceType = oldFileUrl.includes("/video/") ? "video" : "image";
        
        // 3. Delete from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }
};


export {uploadOnCloudinary,deleteOnCloudinary}
