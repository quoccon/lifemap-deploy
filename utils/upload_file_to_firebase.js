const { bucket } = require('../services/firebase_service');

const uploadImage = async (file) => {
  try {
    const filename = `media_url/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(filename);

    // Upload file
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
      public: true,
    });

    // Lấy public URL (ngắn hơn signed URL)
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Upload failed");
  }
};

module.exports = { uploadImage };