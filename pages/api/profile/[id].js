import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async (req, res) => {
  let { bio, userId } = req.body;

  try {
    const id = parseInt(req.query.id);
    console.log(id);

    // Find By ID
    const findProfile = await prisma.profile.findUnique({ where: { id: id } });
    if (!findProfile) {
      return res.status(400).json({ error: true, msg: "Profile not Found" });
    }
    // Update Profile
    const profile = await prisma.profile.update({
      where: { id: id },
      data: { bio: bio, userId: userId },
    });

    return res.status(200).json({
      error: false,
      data: profile,
      msg: "Update Successfuly",
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, msg: "Server error." });
  }
};
