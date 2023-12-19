const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");
const isAuthenticated = require("../middlewares/isAuthenticated");

// OpenAI API設定
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiApiUrl = "https://api.openai.com/v1/chat/completions"; // OpenAIエンドポイント

let contextText = "";
let maxToken = 150;
let frequencyPenalty = 0;
let temperature = 1;

router.post("/setting", isAuthenticated, async (req, res) => {
  try {
    contextText = req.body.contextText;
    maxToken = req.body.maxToken;
    frequencyPenalty = req.body.frequencyPenalty;
    temperature = req.body.temperature;
  } catch (error) {
    console.error("設定項目の更新に失敗しました。", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/content", isAuthenticated, async (req, res) => {
  try {
    const userQuestion = req.body.message; // リクエストボディから質問を取得

    // OpenAI APIへのリクエストの設定
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      // responseType: "stream", // ストリームレスポンスを指定
    };

    const response = await axios.post(
      openaiApiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `userが入力したテキストを${contextText}のスタイルで日記を作ってください`,
          },
          {
            role: "user",
            content: userQuestion,
          },
        ],
        max_tokens: maxToken,
        frequency_penalty: frequencyPenalty,
        temperature: temperature,
      },
      axiosConfig
    );

    const answer = response.data.choices[0].message.content; // OpenAIからの応答を取得

    res.json({ answer });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/diary", isAuthenticated, async (req, res) => {
  try {
    const opennAiAnswer = req.body.diaryText; // リクエストボディから質問を取得

    await prisma.content.create({
      data: {
        question: "test",
        answer: opennAiAnswer,
      },
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
