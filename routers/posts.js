const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isAuthenticated = require("../middlewares/isAuthenticated");

// 呟き投稿用API
// isAuthenticatedというファイルを挟むことによってトークンがあるかないかで下記の処理を実行するか判定する
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ messate: "投稿内容がありません" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ messate: "サーバーエラーです。" });
  }
});

// 最新呟き投稿用API
router.get("/get_latest_post", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.json(latestPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

// その閲覧しているユーザーの投稿内容だけを取得
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
    });

    return res.status(200).json(userPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

// 呟き編集用API
router.post("/edit/:postId", isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "投稿内容がありません" });
  }

  try {
    const existingPost = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!existingPost) {
      return res
        .status(404)
        .json({ message: "指定された投稿が見つかりません" });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: {
        content,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

// 投稿削除用API
router.post("/delete/:postId", isAuthenticated, async (req, res) => {
  const { postId } = req.params;

  try {
    const existingPost = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!existingPost) {
      return res
        .status(404)
        .json({ message: "指定された投稿が見つかりません" });
    }

    await prisma.post.delete({
      where: {
        id: parseInt(postId),
      },
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

module.exports = router;
