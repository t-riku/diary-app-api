const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
    }

    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!profile) {
      return res
        .statue(404)
        .json({ message: "プロフィールが見つかりませんでした。" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/profile/edit/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  const { bio, profileImageUrl, username } = req.body;

  try {
    // ユーザーとプロフィールを検索
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "指定されたユーザーが見つかりません" });
    }

    // プロフィールを更新
    const updatedProfile = await prisma.profile.update({
      where: {
        id: user.profile.id,
      },
      data: {
        bio,
        profileImageUrl,
      },
    });

    // ユーザーのユーザーネームを更新
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        username,
      },
    });

    res.status(200).json({ user: updatedUser, profile: updatedProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

module.exports = router;
