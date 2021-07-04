import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default  async (req, res) => {
    const { email, password } = req.body;
  
    try {

      // Find email address
      const user = await prisma.user.findUnique ({ where: { email: email } });
      if (!user) {
        return res.status(400).json({ error: true, msg: "Invalid credentials." });
      }

      //Match Password
      const isMatched = await bcrypt.compare(password, user.password);
      if (!isMatched) {
        return res.status(400).json({ error: true, msg: "Invalid credentials." });
      }
  

      const payload = {
        user: {
         id: user.id,
         email: user.email,
      
        },
      };
  
      //console.log("payload data", payload);
  
      jwt.sign(
        payload,
        "JWTKEY",
        { expiresIn: "24h" },
        (err, token) => {
          if (err) {
            throw err;
          }
  
          return res.status(200).json({
            error: false,
            token: token,
            user_info: payload.user,
          });
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, msg: "Server error." });
    }
  };