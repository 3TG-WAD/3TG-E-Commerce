const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

class S3Service {
  async uploadFile(file, folder = 'avatars') {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      
      // Tạo signed URL để truy cập file
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName
      });
      
      const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }); // URL hết hạn sau 7 ngày
      return url;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
}

module.exports = new S3Service();