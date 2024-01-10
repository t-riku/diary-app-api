const toneOptions = [
  "指定なし",
  "お嬢様",
  "紳士",
  "俺様",
  "丁寧",
  "ゆるく",
  "ギャル",
  "関西のおばさん",
  "博多弁",
  "厨二病",
  "かっこよく",
  "可愛く",
  "JK",
  "子供っぽく",
  "赤ちゃんっぽく",
  "パワハラ上司",
  "モラハラ彼氏",
  "ツンデレ彼女",
  "冒険者っぽく",
  "先輩",
  "後輩",
  "誇らしく",
  "申し訳なさそうに",
  "ミステリーサスペンス",
  "コーヒーショップのメニュー風",
  "ホラー",
  "季節感があるように",
];

const textFormats = [
  "指定なし",
  "英語",
  "最近流行りの言葉多め",
  "絵文字たくさん",
  "ハッシュタグをたくさん",
  "おじさん構文",
  "ひらがなのみ",
  "カタカナのみ",
  "漢字のみ",
  "ひらがなとカタカナのみ",
  "赤ちゃん言葉",
  "ネットスラング",
  "絵文字のみ",
  "数字のみ",
  "小学生の作文みたいに",
  "明らかな誤字脱字",
  "感情爆発モード",
  "シェイクスピア風",
  "SFファンタジーモード",
  "秘密の手紙モード",
  "ハードボイルド探偵モード",
  "科学者のノートモード",
  "昭和レトロモード",
  "ファッションマガジンモード",
  "アクション映画モード",
  "ホラー小説モード",
  "アート詩モード",
];

const diaryFormats = [
  "指定なし",
  "「日記：〜〜〜」の形",
  "「朝：昼：夜：」の形",
  "詩の形式",
  "会話形式",
  "質問と回答形式",
  "物語形式",
  "箇条書き",
  "リスト",
  "めちゃくちゃ",
  "短文",
];

const topicOptions = [
  "指定なし",
  "今日の出来事",
  "感謝の瞬間",
  "未来の目標",
  "自己成長",
  "旅行",
  "恋愛",
  "遊び",
  "学びと発見",
];

const emotionOptions = [
  "指定なし",
  "喜び",
  "悲しみ",
  "驚き",
  "怒り",
  "成就感",
  "静か",
  "元気に",
];

const meOptions = [
  "指定なし",
  "赤ちゃん",
  "子供",
  "架空のキャラクター",
  "高校生",
  "大学生",
  "既婚者",
  "独身",
  "動物",
  "おじいちゃん・おばあちゃん",
  "社会人",
];

const personOptions = [
  "指定なし",
  "親友",
  "未来の自分",
  "架空のキャラクター",
  "家族",
  "友達",
  "彼氏・彼女",
  "夫・妻",
  "ペット",
  "知らない人",
  "上司",
  "孫",
  "おじいちゃん・おばあちゃん",
  "先生",
  "先輩",
  "後輩",
];

const convertTone = (selectedTone) => {
  return toneOptions.includes(selectedTone) ? `口調：${selectedTone}` : "";
};

const convertTextFormat = (selectedFormat) => {
  return textFormats.includes(selectedFormat)
    ? `文字の形式：${selectedFormat}`
    : "";
};

const convertDiaryFormat = (selectedFormat) => {
  return diaryFormats.includes(selectedFormat)
    ? `日記の形式：${selectedFormat}`
    : "";
};

const convertTopic = (selectedTopic) => {
  return topicOptions.includes(selectedTopic)
    ? `トピック：${selectedTopic}`
    : "";
};

const convertEmotion = (selectedEmotion) => {
  return emotionOptions.includes(selectedEmotion)
    ? `感情：${selectedEmotion}`
    : "";
};

const convertMe = (selectedMe) => {
  return meOptions.includes(selectedMe) ? `自分：${selectedMe}` : "";
};

const convertPerson = (selectedPerson) => {
  return personOptions.includes(selectedPerson)
    ? `相手：${selectedPerson}`
    : "";
};

module.exports = {
  convertTone,
  convertTextFormat,
  convertDiaryFormat,
  convertTopic,
  convertEmotion,
  convertMe,
  convertPerson,
};
