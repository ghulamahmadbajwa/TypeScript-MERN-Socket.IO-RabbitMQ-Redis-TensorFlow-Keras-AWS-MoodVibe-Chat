// Import the Cloudinary SDK for Node.js and dotenv for environment variables
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
// Load environment variables from a .env file into process.env
dotenv.config();
// Destructure necessary Cloudinary credentials from environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
// Check if all required Cloudinary environment variables are set
// If any are missing, throw an error so the app doesn't continue with invalid config
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are not set. Please check your .env file.');
}
// Configure Cloudinary with credentials from environment variables
// This is required before you can use any Cloudinary features like uploading images
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});
// DEBUG: Print some info to confirm Cloudinary config is loaded correctly
// We only show a partial API key for security reasons
console.log("Cloudinary Config Loaded:");
console.log("Cloud Name:", CLOUDINARY_CLOUD_NAME);
console.log("API Key:", CLOUDINARY_API_KEY?.slice(0, 4) + '****');
// Optional: Test connection to Cloudinary by pinging the API
// This ensures your credentials are valid and API is reachable
cloudinary.api
    .ping()
    .then(() => console.log("✅ Cloudinary API reachable"))
    .catch((err) => console.error("❌ Cloudinary API error:", err));
// Export the configured Cloudinary instance so other parts of your app can use it
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map