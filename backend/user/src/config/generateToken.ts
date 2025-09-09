//JWT is like a tamper-proof digital passport.
//When you log in, the server gives you a passport (the JWT). This passport contains a small amount of your info (like your user ID) and is signed with a secret key only the server knows.The passport is not encrypted (the information inside is readable), but it's tamper-proof. If anyone tries to change the data inside, the signature becomes invalid.ou then present this passport with every request to access protected areas. The server quickly checks the signature to ensure the passport is authentic and hasn't been altered.This means the server doesn't have to keep a "session" or hit a database to verify who you are on every single request, making the application faster and more scalable.
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET as string

export const generateToken = (user: any) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: "7d" });
}

 