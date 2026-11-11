const cloudinary = require('cloudinary').v2;
const fs = require('fs');

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadImage = async (filePath, folder = 'techblog') => {
  // If Cloudinary configured, upload to cloud
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        use_filename: true,
        unique_filename: true,
        resource_type: 'image'
      });
      // Remove temp local file after successful cloud upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageType: 'cloudinary'
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Fallback to local file url
  const filename = filePath.split(/[\\/]/).pop();
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    storageType: 'local'
  };
};

module.exports = { uploadImage };
