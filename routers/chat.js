const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  convertTone,
  convertTextFormat,
  convertDiaryFormat,
  convertTopic,
  convertEmotion,
  convertMe,
  convertPerson,
} = require("../utils/options");

// OpenAI API設定
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiApiUrl = "https://api.openai.com/v1/chat/completions"; // OpenAIエンドポイント

let contextText = "";
let maxToken = 150;
let frequencyPenalty = 0;
let temperature = 1;

router.post("/setting/save/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  const {
    tone,
    textFormat,
    diaryFormat,
    topic,
    emotion,
    me,
    person,
    maxToken,
    frequencyPenalty,
    temperature,
  } = req.body;

  try {
    // ユーザーと設定を検索
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        diarySettings: true,
      },
    });

    // 更新または新規作成用のオブジェクト
    const updateData = {
      userId: parseInt(userId),
      tone: tone || "",
      textFormat: textFormat || "",
      diaryFormat: diaryFormat || "",
      topic: topic || "",
      emotion: emotion || "",
      me: me || "",
      person: person || "",
      maxToken: maxToken !== undefined ? parseInt(maxToken) : 150,
      frequencyPenalty:
        frequencyPenalty !== undefined ? parseInt(frequencyPenalty) : 0,
      temperature: temperature !== undefined ? parseInt(temperature) : 1,
    };

    // 作成か更新かを判断
    if (!user.diarySettings) {
      // 初回の作成
      const createdSettings = await prisma.diarySettings.create({
        data: updateData,
      });

      res.status(200).json({ settings: createdSettings });
    } else {
      // 2回目以降の更新
      const updatedSettings = await prisma.diarySettings.update({
        where: {
          userId: parseInt(userId),
        },
        data: updateData,
      });

      res.status(200).json({ settings: updatedSettings });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
  }
});

router.post("/setting/get/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;

  try {
    // ユーザーと設定を検索
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        diarySettings: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ loginMsg: "ログインしないと設定は完了されません" });
    }

    if (!user.diarySettings) {
      return null;
    }

    // userIdに一致するdiarySettingsを検索
    const findSettings = await prisma.diarySettings.findUnique;
    findUnique({
      where: {
        userId: parseInt(userId),
      },
    });

    if (findSettings) {
      // 設定があれば返す
      return res.status(200).json({ settings: findSettings });
    } else {
      // 設定が見つからない場合はエラーレスポンスを返す
      return res.status(404).json({ noSettingMsg: "設定が見つかりません。" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ serverErrorMsg: "サーバーエラーです。" });
  }
});

router.post("/content/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  const userQuestion = req.body.message; // リクエストボディから質問を取得

  // OpenAI APIへのリクエストの設定
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    // responseType: "stream", // ストリームレスポンスを指定
  };

  try {
    // userIdに一致するdiarySettingsを検索
    const findSettings = await prisma.diarySettings.findFirst({
      where: {
        userId: parseInt(userId),
      },
    });

    if (findSettings) {
      // 設定があれば返す
      // 空文字でないプロパティのみを抽出
      const nonEmptyValues = Object.fromEntries(
        Object.entries(findSettings).filter(([key, value]) => value !== "")
      );
      // 各プロパティを変換
      const convertedValues = {};
      if (nonEmptyValues.tone) {
        convertedValues.tone = convertTone(nonEmptyValues.tone);
      }
      if (nonEmptyValues.textFormat) {
        convertedValues.textFormat = convertTextFormat(
          nonEmptyValues.textFormat
        );
      }
      if (nonEmptyValues.diaryFormat) {
        convertedValues.diaryFormat = convertDiaryFormat(
          nonEmptyValues.diaryFormat
        );
      }
      if (nonEmptyValues.topic) {
        convertedValues.topic = convertTopic(nonEmptyValues.topic);
      }
      if (nonEmptyValues.emotion) {
        convertedValues.emotion = convertEmotion(nonEmptyValues.emotion);
      }
      if (nonEmptyValues.me) {
        convertedValues.me = convertMe(nonEmptyValues.me);
      }
      if (nonEmptyValues.person) {
        convertedValues.person = convertPerson(nonEmptyValues.person);
      }
      contextText = Object.values(convertedValues).filter(Boolean).join(", ");
      maxToken = findSettings.maxToken || 150;
      frequencyPenalty = findSettings.frequencyPenalty || 0;
      temperature = findSettings.temperature || 1;
    } else {
      // 設定が見つからない場合はデフォルト値を設定
      contextText = "";
      maxToken = 150;
      frequencyPenalty = 0;
      temperature = 1;
    }

    const response = await axios.post(
      openaiApiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `userが入力したテキストを元に、
            ${contextText ? `${contextText}のスタイルで` : ""}${String(
              maxToken
            )}文字以内で綺麗に収めた日記を作成してください。`,
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
