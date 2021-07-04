import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const jwt = require("jsonwebtoken");

export const authenticated = (fn) => async (req, res) => {
  // Auth Middleware

  if (!req.headers.authorization)
    return res
      .status(501)
      .json({ msg: "Authorization Failed.No token Provided" });

   jwt.verify(
    req.headers.authorization,
    "JWTKEY",
    async function (err, decoded) {
      if (!err && decoded) {
        return await fn(req, res);
      }

      else if (err) {
        if (err.name === "TokenExpiredError") {
          const payload = jwt.verify(token, process.env.JWTSECRET, {
            ignoreExpiration: true,
          });
          return res.status(401).json({ error: true, msg: "Expired token." });
        }

        return res.status(401).json({ error: true, msg: "Token Invalid." });
      }

      

       res.status(401).json({ error: true, message: "Sorry you are not authenticated" });
    }
  );
};

export default authenticated(async (req, res) => {
  try {
    console.log(req.body);
    let { name, email, password,  } = req.body;

    // Validation

    if (email == "" || email == null || email == undefined) {
      return res.status(400).json({ error: true, msg: "email is requrired." });
    }

    if (password == "" || password == null || password == undefined) {
      return res
        .status(400)
        .json({ error: true, msg: "password is requrired." });
    }

    //Check unique email
    const userFind = await prisma.user.findUnique({ where: { email: email } });
    if (userFind) {
      return res.status(400).json({ error: true, msg: "E-mail already taken" });
    }

    // Hashing Password
    let user_password = bcrypt.hashSync(password, 12, (err, hash) => {
      if (err) {
        throw err;
      }
      return hash;
    });
    


    //Create User
    const createUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: user_password,
        profile: {
          create: { bio: 'Learning Prisma' },
        },
         
      }
    });
    res.status(201).json({ error: false, msg: "User Create Successfuly" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, msg: "Server error." });
  }
});
