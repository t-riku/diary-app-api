const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateIdenticon");

const prisma = new PrismaClient();

//新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res
      .status(401)
      .json({ emailError: "そのEmailアドレスは既に使用されています。" });
  }

  const defaultIconImage = generateIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            bio: "はじめまして",
            profileImageUrl: defaultIconImage,
          },
        },
        diarySettings: {
          create: {
            tone: "",
            textFormat: "",
            diaryFormat: "",
            topic: "",
            emotion: "",
            me: "",
            person: "",
            maxToken: 150,
            frequencyPenalty: 0,
            temperature: 1,
          },
        },
      },
      include: {
        profile: true,
        diarySettings: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    console.error("ユーザーの登録中にエラーが発生しました:", error);
    return res
      .status(500)
      .json({ error: "ユーザーの登録中にエラーが発生しました。" });
  }
});

//ユーザーログインAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "そのユーザーは存在しません。" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "そのパスワードは間違っています" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.json({ token });
  } catch (error) {
    console.error("ログイン中にエラーが発生しました:", error);
    return res
      .status(500)
      .json({ error: "ログイン中にエラーが発生しました。" });
  }
});

module.exports = router;
