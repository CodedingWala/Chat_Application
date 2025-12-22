import dotenv from "dotenv"
dotenv.config()

export const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    CLIENT_URL: process.env.CLIENT_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ARCJET_KEY:process.env.ARCJET_KEY,
    ARCJET_ENV:process.env.ARCJET_ENV
}


// PORT=3000
// MONGO_URI=mongodb+srv://ansarijaved092004_db_user:aj74ZUDolxUUA1wk@cluster0.rjeijdb.mongodb.net/Chat_Application?appName=Cluster0
// NODE_ENV=development
// JWT_SECRET=12bdmsoxnewmm
// API_KEY=re_McMLFQvW_2wG1ZN7ojQLGciTFnoahwzC7
// EMAIL_FROM="onboarding@resend.dev"
// EMAIL_FROM_NAME="Javed Moinuddin Ansari"
// CLIENT_URL=http://localhost:3000