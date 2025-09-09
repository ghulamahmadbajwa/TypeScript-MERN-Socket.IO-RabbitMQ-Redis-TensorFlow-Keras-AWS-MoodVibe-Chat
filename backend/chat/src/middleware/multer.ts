//sing a combination of Multer, Cloudinary, and multer-storage-cloudinary in a chat application allows you to efficiently and scalably handle file uploads. Instead of saving files directly to your server's local disk, this setup offloads the heavy work of file storage and delivery to a specialized cloud service. The process is straightforward: a user uploads a file, which Multer intercepts as a request stream. The multer-storage-cloudinary package then acts as a bridge, streaming the file directly to Cloudinary's cloud storage. This is a highly efficient approach because the file never has to be temporarily saved to your server, conserving disk space and improving performance. Once the upload is complete, your application saves the unique public URL provided by Cloudinary to your database, and this URL can then be used by other chat participants to access the file from Cloudinary's fast and reliable CDN. This architecture ensures your chat server remains lightweight and focused on its primary task of real-time communication.

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../confiq/cloudinary.js';


const storage = new CloudinaryStorage({

    cloudinary: cloudinary,
    params: {
        folder: "chat_images", // Optional: specify a folder in your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'], // Specify allowed file formats
        transformation: [{ width: 800, height: 800, crop: 'limit' }, { quality: "auto" }],
    } as any,
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5mb
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
