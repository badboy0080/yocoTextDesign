import sampleTrySource from "../public/samples/sample-try.js?raw";

export type SampleTry = {
  id: string;
  title: string;
  source: string;
  html: string;
};

function readString(source: string, key: string) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`));
  if (!match) throw new Error(`sample-try.js 缺少 ${key}`);
  return JSON.parse(`"${match[1]}"`) as string;
}

export function loadSampleTry(): SampleTry {
  const sample = {
    id: readString(sampleTrySource, "id"),
    title: readString(sampleTrySource, "title"),
    source: readString(sampleTrySource, "source"),
    html: readString(sampleTrySource, "html"),
  };
  if (sample.id !== "yooco-wechat-layout") {
    throw new Error(`示例文章不是预期的 yooco-wechat-layout，而是 ${sample.id}`);
  }
  return sample;
}
