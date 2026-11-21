/* 首页样稿。每篇都是维基文库上的公版选段，不自编正文。
 * 红楼梦/第001回、桃花源記、故鄉、前赤壁賦、西遊記/第001回、水滸傳 (100回本)/第001回：zh.wikisource.org
 * Pride and Prejudice (1817) 第 1 章页图、Shakespeare's Sonnets (1883) Sonnet 18、
 * Hans Andersen's Fairy Tales (1888) The Little Match-seller：en.wikisource.org
 * 校勘注「一作」已从阅读文本里拿掉，句子仍是该页正文。
 */

const SANS = "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";
const SERIF = "'Songti SC','STSong','SimSun',serif";

export type Plate = {
  src: string;
  alt: string;
  credit: string;
  position: string;
  /* 大于 1 时从底部放大，把空绢裁掉，留下村落和山。 */
  zoom?: number;
};

export type SpecimenTheme = {
  id: string;
  label: string;
  pageColor: string;
  textColor: string;
  style: string;
  dataset: Record<string, string>;
};

export type Specimen = {
  id: string;
  theme: SpecimenTheme;
  work: string;
  author: string;
  credit: string;
  source: string;
  html: string;
  plate?: Plate;
  note: string;
};

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mark(text: string, phrase: string) {
  const safe = esc(text);
  const hit = esc(phrase);
  return safe.includes(hit) ? safe.replace(hit, `<mark class="inline-highlight">${hit}</mark>`) : safe;
}

function page(parts: Array<{ heading?: string; text?: string; phrase?: string; quote?: string }>, credit: string) {
  const body = parts.map((part) => {
    if (part.heading) return `<h3 class="section-title level-2">${esc(part.heading)}</h3>`;
    if (part.quote) return `<blockquote class="quote-card">${mark(part.quote, part.phrase || "")}</blockquote>`;
    return `<p>${mark(part.text || "", part.phrase || "")}</p>`;
  }).join("");
  return `${body}<p class="specimen-byline">${esc(credit)}</p>`;
}

function theme(input: {
  id: string;
  label: string;
  page: string;
  text: string;
  accent: string;
  highlight: string;
  highlightText: string;
  card: string;
  quote: string;
  title: string;
  border: string;
  divider: string;
  muted: string;
  variant: string;
  heading: "sans" | "serif";
  fontSize: number;
  lineHeight: number;
  gap: number;
  headingSize: number;
  weight: number;
  radius: number;
  headingStyle: string;
  cardStyle: string;
  listStyle: string;
  highlightStyle: string;
  align: string;
}): SpecimenTheme {
  const headingFont = input.heading === "serif" ? SERIF : SANS;
  const style = [
    `--text-color:${input.text}`,
    `--accent-color:${input.accent}`,
    `--highlight-color:${input.highlight}`,
    `--highlight-text-color:${input.highlightText}`,
    `--card-color:${input.card}`,
    `--quote-color:${input.quote}`,
    `--card-title-color:${input.accent}`,
    `--page-color:${input.page}`,
    `--link-color:${input.accent}`,
    `--muted-color:${input.muted}`,
    `--title-color:${input.title}`,
    `--border-color:${input.border}`,
    `--divider-color:${input.divider}`,
    `--body-font:${SANS}`,
    `--heading-font:${headingFont}`,
    `--font-size:${input.fontSize}px`,
    `--line-height:${input.lineHeight}`,
    `--paragraph-spacing:${input.gap}px`,
    `--title-size:${input.headingSize + 2}px`,
    `--heading-size:${input.headingSize}px`,
    `--heading-weight:${input.weight}`,
    `--card-radius:${input.radius}px`,
    `--card-padding:14px`,
    `--highlight-radius:3px`,
    `--highlight-padding:2px`,
    `--text-align:${input.align}`,
  ].join(";");
  return {
    id: input.id,
    label: input.label,
    pageColor: input.page,
    textColor: input.text,
    style,
    dataset: {
      theme: input.id,
      style: input.variant,
      highlightStyle: input.highlightStyle,
      headingStyle: input.headingStyle,
      cardStyle: input.cardStyle,
      listStyle: input.listStyle,
    },
  };
}

const fresh = theme({
  id: "fresh", label: "清氧绿", page: "#ffffff", text: "#374151", accent: "#0a9d75",
  highlight: "#d6f5ea", highlightText: "#0b5f49", card: "#effbf6", quote: "#f4fdf9",
  title: "#111827", border: "#e5e7eb", divider: "#d1d5db", muted: "#9ca3af",
  variant: "standard", heading: "sans", fontSize: 13, lineHeight: 1.85, gap: 12,
  headingSize: 20, weight: 850, radius: 16, headingStyle: "index", cardStyle: "soft",
  listStyle: "circle", highlightStyle: "marker", align: "justify",
});

const mono = theme({
  id: "mono", label: "素墨", page: "#ffffff", text: "#52525b", accent: "#52525b",
  highlight: "#f4f4f5", highlightText: "#27272a", card: "#fafafa", quote: "#fafafa",
  title: "#27272a", border: "#e4e4e7", divider: "#e4e4e7", muted: "#a1a1aa",
  variant: "standard", heading: "sans", fontSize: 14, lineHeight: 1.8, gap: 14,
  headingSize: 22, weight: 800, radius: 4, headingStyle: "line", cardStyle: "outline",
  listStyle: "dot", highlightStyle: "underline", align: "left",
});

const nocturne = theme({
  id: "nocturne", label: "深空青", page: "#1a1a1a", text: "#d1d5db", accent: "#3ddc97",
  highlight: "#f6d35a", highlightText: "#1a1a1a", card: "#242424", quote: "#1f1f1f",
  title: "#f3f4f6", border: "#333333", divider: "#333333", muted: "#9ca3af",
  variant: "deep-night", heading: "sans", fontSize: 13, lineHeight: 1.75, gap: 12,
  headingSize: 20, weight: 750, radius: 12, headingStyle: "index", cardStyle: "soft",
  listStyle: "circle", highlightStyle: "marker", align: "left",
});

const texture = theme({
  id: "texture", label: "质感", page: "#ffffff", text: "#3F3F46", accent: "#184731",
  highlight: "#F3E0B0", highlightText: "#111827", card: "#F5F8F6", quote: "#F5F8F6",
  title: "#111827", border: "#E0EAE2", divider: "#184731", muted: "#94A3B8",
  variant: "standard", heading: "serif", fontSize: 14, lineHeight: 1.85, gap: 14,
  headingSize: 22, weight: 700, radius: 18, headingStyle: "line", cardStyle: "soft",
  listStyle: "dot", highlightStyle: "marker", align: "justify",
});

const editorial = theme({
  id: "editorial", label: "手札橙", page: "#fdfdf8", text: "#4d4f46", accent: "#e07b2c",
  highlight: "#e7e8e1", highlightText: "#23251d", card: "#eff0ea", quote: "#fdfdf8",
  title: "#23251d", border: "#bfc1b7", divider: "#bfc1b7", muted: "#9ea096",
  variant: "standard", heading: "sans", fontSize: 13, lineHeight: 1.85, gap: 12,
  headingSize: 20, weight: 800, radius: 6, headingStyle: "bar", cardStyle: "border",
  listStyle: "circle", highlightStyle: "underline", align: "left",
});

const serene = theme({
  id: "serene", label: "静山", page: "#ffffff", text: "#4f5550", accent: "#476055",
  highlight: "#edf2ef", highlightText: "#385045", card: "#ffffff", quote: "#ffffff",
  title: "#2b2b2b", border: "#e9eae6", divider: "#e9eae6", muted: "#a3a3a3",
  variant: "standard", heading: "serif", fontSize: 14, lineHeight: 1.7, gap: 10,
  headingSize: 22, weight: 700, radius: 0, headingStyle: "line", cardStyle: "outline",
  listStyle: "dot", highlightStyle: "underline", align: "left",
});

const emoji = theme({
  id: "emoji", label: "表情", page: "#FBF7F2", text: "#3E3832", accent: "#8C7355",
  highlight: "#F3E4C4", highlightText: "#3E3832", card: "#F7F1E8", quote: "#F7F1E8",
  title: "#2C2824", border: "#E6DCCA", divider: "#E6DCCA", muted: "#9A9084",
  variant: "standard", heading: "sans", fontSize: 14, lineHeight: 1.75, gap: 12,
  headingSize: 20, weight: 700, radius: 12, headingStyle: "line", cardStyle: "soft",
  listStyle: "dot", highlightStyle: "marker", align: "left",
});

export const HERO_SPECIMEN: Specimen = {
  id: "honglou",
  theme: fresh,
  work: "红楼梦",
  author: "曹雪芹",
  credit: "红楼梦 · 曹雪芹",
  source: "https://zh.wikisource.org/wiki/紅樓夢/第001回",
  plate: {
    src: "/art/zhou-fang-court-ladies.jpg",
    alt: "周昉《簪花仕女图》",
    credit: "周昉 《簪花仕女图》，公版",
    position: "36% 48%",
  },
  note: "第一回开篇。清氧绿只改版式，句子来自维基文库。",
  html: page([
    { heading: "甄士隐梦幻识通灵" },
    { text: "作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借通靈之說，撰此《石頭記》一書也。故曰「甄士隱夢幻識通靈」。但書中所記何事，又因何而撰是書哉？", phrase: "真事隱去" },
    { text: "自又云：今風塵碌碌，一事無成，忽念及當日所有之女子，一一細推了去，覺其行止見識，皆出於我之上。何我堂堂之鬚眉，曾不若彼裙釵哉！" },
    { quote: "浮生着甚苦奔忙？盛席華筵終散場。悲喜千般同幻渺，古今一夢盡荒唐。字字看來皆是血，十年辛苦不尋常！" },
  ], "红楼梦 · 曹雪芹"),
};

export const SECTION_SPECIMENS: Specimen[] = [
  {
    id: "taohua",
    theme: mono,
    work: "桃花源记",
    author: "陶渊明",
    credit: "桃花源记 · 陶渊明",
    source: "https://zh.wikisource.org/wiki/桃花源記",
    note: "晋太元中的那一段。素墨。",
    html: page([
      { heading: "桃花源" },
      { text: "晉太元中，武陵人捕魚爲業。緣溪行，忘路之遠近。忽逢桃花林，夾岸數百步，中無雜樹，芳草鮮美，落英繽紛。漁人甚異之。復前行，欲窮其林。", phrase: "落英繽紛" },
      { text: "林盡水源，便得一山，山有小口，髣髴若有光。便捨船，從口入。初極狹，纔通人。復行數十步，豁然開朗。土地平曠，屋舍儼然。有良田、美池、桑竹之屬。阡陌交通，鷄犬相聞。", phrase: "豁然開朗" },
      { text: "其中往來種作，男女衣著，悉如外人。黃髮垂髫，並怡然自樂。" },
    ], "桃花源记 · 陶渊明"),
  },
  {
    id: "pride",
    theme: nocturne,
    work: "Pride and Prejudice",
    author: "Jane Austen",
    credit: "Pride and Prejudice · Jane Austen",
    source: "https://en.wikisource.org/wiki/Page:Austen_-_Pride_and_Prejudice,_third_edition,_1817.djvu/11",
    note: "1817 年英文第三版第一章。深空青。正文不翻译。",
    html: page([
      { heading: "Chapter I" },
      { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.", phrase: "a single man in possession of a good fortune" },
      { text: "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters." },
      { quote: "My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?" },
      { text: "Mr. Bennet replied that he had not." },
    ], "Pride and Prejudice · Jane Austen"),
  },
  {
    id: "guxiang",
    theme: texture,
    work: "故乡",
    author: "鲁迅",
    credit: "故乡 · 鲁迅",
    source: "https://zh.wikisource.org/wiki/故鄉",
    note: "开篇回乡。质感。",
    html: page([
      { heading: "故乡" },
      { text: "我冒了嚴寒，回到相隔二千餘里，別了二十餘年的故鄕去。", phrase: "故鄕" },
      { text: "時候既然是深冬；漸近故鄕時，天氣又陰晦了，冷風吹進船艙中，嗚嗚的響，從篷隙向外一望，蒼黃的天底下，遠近橫着幾個蕭索的荒村，沒有一些活氣。我的心禁不住悲涼起來了。" },
      { quote: "阿！這不是我二十年來時時記得的故鄕？" },
      { text: "我所記得的故鄕全不如此。我的故鄕好得多了。但要我記起他的美麗，說出他的佳處來，卻又沒有影像，沒有言辭了。" },
    ], "故乡 · 鲁迅"),
  },
  {
    id: "chibi",
    theme: editorial,
    work: "前赤壁赋",
    author: "苏轼",
    credit: "前赤壁赋 · 苏轼",
    source: "https://zh.wikisource.org/wiki/前赤壁賦",
    plate: {
      src: "/art/guo-xi-early-spring.jpg",
      alt: "郭熙《早春图》",
      credit: "郭熙 《早春图》，公版",
      position: "center center",
    },
    note: "壬戌之秋。手札橙。左页是郭熙《早春图》。",
    html: page([
      { heading: "前赤壁赋" },
      { text: "壬戌之秋，七月既望，蘇子与客泛舟游于赤壁之下。清風徐來，水波不興。舉酒属客，誦《明月》之詩，歌《窈窕》之章。少焉，月出於東山之上，徘徊於斗、牛之間。白露橫江，水光接天。縱一葦之所如，凌万頃之茫然。浩浩乎如馮虛御風，而不知其所止；飄飄乎如遺世獨立，羽化而登僊。", phrase: "羽化而登僊" },
      { quote: "桂棹兮蘭槳，擊空明兮泝流光。渺渺兮予懷，望美人兮天一方。" },
    ], "前赤壁赋 · 苏轼"),
  },
];

export const SHELF_SPECIMENS: Specimen[] = [
  {
    id: "xiyou",
    theme: mono,
    work: "西游记",
    author: "吴承恩",
    credit: "西游记 · 吴承恩",
    source: "https://zh.wikisource.org/wiki/西遊記/第001回",
    plate: {
      src: "/art/fan-kuan-travelers.jpg",
      alt: "范宽《溪山行旅图》",
      credit: "范宽 《溪山行旅图》，公版",
      position: "center top",
    },
    note: "花果山。素墨。",
    html: page([
      { heading: "花果山" },
      { text: "海外有一國土，名曰傲來國。國近大海，海中有一座名山，喚為花果山。此山乃十洲之祖脈，三島之來龍，自開清濁而立，鴻濛判後而成。真個好山！", phrase: "花果山" },
      { text: "那座山正當頂上，有一塊仙石。其石有三丈六尺五寸高，有二丈四尺圍圓。四面更無樹木遮陰，左右倒有芝蘭相襯。蓋自開闢以來，每受天真地秀，日精月華，感之既久，遂有靈通之意。" },
      { text: "內育仙胞，一日迸裂，產一石卵，似圓毬樣大。因見風，化作一個石猴，五官俱備，四肢皆全。便就學爬學走，拜了四方。" },
    ], "西游记 · 吴承恩"),
  },
  {
    id: "shuihu",
    theme: serene,
    work: "水浒传",
    author: "施耐庵",
    credit: "水浒传 · 施耐庵",
    source: "https://zh.wikisource.org/wiki/水滸傳_(100回本)/第001回",
    plate: {
      src: "/art/song-renzong-portrait.jpg",
      alt: "宋人《宋仁宗御容》",
      credit: "宋人 《宋仁宗御容》，公版",
      position: "center center",
    },
    note: "百回本第一回朝会。静山。",
    html: page([
      { heading: "张天师祈禳瘟疫" },
      { text: "話說大宋仁宗天子在位，嘉祐三年三月三日五更三點，天子駕坐紫宸殿，受百官朝賀。", phrase: "紫宸殿" },
      { text: "當有殿頭官喝道：「有事出班早奏，無事捲簾退朝。」只見班部叢中，宰相趙哲，參政文彥博，出班奏曰：「目今京師瘟疫盛行，民不聊生，傷損軍民多矣。」" },
      { quote: "伏望陛下釋罪寬恩，省刑薄稅，以禳天災，救濟萬民。" },
    ], "水浒传 · 施耐庵"),
  },
  {
    id: "sonnet",
    theme: serene,
    work: "Sonnet 18",
    author: "William Shakespeare",
    credit: "Sonnet 18 · William Shakespeare",
    source: "https://en.wikisource.org/wiki/Page:Shakespeare%27s_Sonnets.djvu/62",
    plate: {
      src: "/art/van-gogh-almond-blossom.jpg",
      alt: "梵高《盛开的杏花》",
      credit: "梵高 《盛开的杏花》，公版",
      position: "center 38%",
    },
    note: "1883 年罗尔夫编本第 18 首。静山。",
    html: page([
      { heading: "Sonnet 18" },
      { text: "Shall I compare thee to a summer's day? Thou art more lovely and more temperate: Rough winds do shake the darling buds of May, And summer's lease hath all too short a date;", phrase: "a summer's day" },
      { text: "Sometime too hot the eye of heaven shines, And often is his gold complexion dimm'd; And every fair from fair sometime declines, By chance or nature's changing course untrimm'd;" },
      { quote: "So long as men can breathe, or eyes can see, So long lives this and this gives life to thee." },
    ], "Sonnet 18 · William Shakespeare"),
  },
  {
    id: "match",
    theme: emoji,
    work: "卖火柴的小女孩",
    author: "安徒生",
    credit: "The Little Match-seller · Andersen / Paull",
    source: "https://en.wikisource.org/wiki/Page:Hans_Andersen%27s_Fairy_Tales_(1888).djvu/260",
    plate: {
      src: "/art/bruegel-hunters-in-the-snow.jpg",
      alt: "勃鲁盖尔《雪中猎人》",
      credit: "勃鲁盖尔 《雪中猎人》，公版",
      position: "36% 58%",
    },
    note: "1888 年 Paull 英译开篇。表情。",
    html: page([
      { heading: "The Little Match-seller" },
      { text: "It was terribly cold and nearly dark on the last evening of the old year, and the snow was falling fast. In the cold and the darkness, a poor little girl, with bare head and naked feet, roamed through the streets.", phrase: "terribly cold" },
      { text: "It is true she had on a pair of slippers when she left home, but they were not of much use. They were very large, so large, indeed, that they had belonged to her mother, and the poor little creature had lost them in running across the street to avoid two carriages that were rolling along at a terrible rate." },
      { text: "So the little girl went on with her little naked feet, which were quite red and blue with the cold. In an old apron she carried a number of matches, and had a bundle of them in her hands. No one had bought anything of her the whole day, nor had any one given her even a penny." },
    ], "卖火柴的小女孩 · 安徒生"),
  },
];
