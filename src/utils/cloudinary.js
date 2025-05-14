// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs'; // to manage file system


// // Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
// });


// const uploadOnCloudinary = async (localFilePath) => {

//     try {

//         if (!localFilePath) return null;
//         // upload the file to cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto" // to detect the type of file automatically
//         })

//         // file has been uploaded successfully
//         console.log('File uploaded successfully to Cloudinary', response.url);

//         return response;

//     }

//     catch (error) {

//         fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed 

//         return null;

//     }
// }


// export default uploadOnCloudinary;

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // console.log('File uploaded successfully to Cloudinary', response.url);
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got successful

        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Fix: prevent crash if file doesn't exist
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        } else {
            console.warn("Temp file not found for deletion:", localFilePath);
        }

        return null;
    }
};


const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) {
            throw new Error("Missing Cloudinary file URL.");
        }

        // Extract the public ID from the URL (filename without extension)
        const parts = fileUrl.split('/');
        const fileWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
        const publicId = fileWithExtension.split('.')[0];  // e.g., abc123

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            console.warn('Cloudinary deletion returned non-ok status:', result);
        }

        return result;

    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return null;
    }
};

export default uploadOnCloudinary;
export { deleteFromCloudinary };











// Upload an image
// const uploadResult = await cloudinary.uploader
//     .upload(
//         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
//     )
//     .catch((error) => {
//         console.log(error);
//     });