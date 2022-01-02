const pupperteer = require("puppeteer");
const axios = require("axios");
const urls = require("./urls.json");

const testUrl = urls.reverse()[3].url;

// use latest *inkey* for metadata
const getMetaData = async (url) => {

  const { data } = await axios.get(url);
  const { meta, videos } = await data;

  // get highest quality video
  const { list } = videos;
  const bestVideo = list.reduce((prev, curr) => {
    if (curr.size > prev.size) {
      return curr;
    }
    return prev;
  });

  // todo: assemble meta data
  return bestVideo.source;
};

(async () => {
  const source = await getMetaData(testUrl);

  const browser = await pupperteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(source, {
    waitUntil: "networkidle0",
  });

  // can only use in headless set to false
  // todo: assemble file name and download path
  const { fileName, fileType } = await page.evaluate(async () => {
    const fileName = "download-link";

    const el = document.querySelector("video");
    const { src, type } = el.querySelector("source");

    const downloadLink = document.createElement("a");
    downloadLink.innerText = "Download Video";
    downloadLink.href = src;
    downloadLink.download = fileName;

    document.querySelector("body").appendChild(downloadLink);

    return { fileName, fileType: type.split("/")[1] };
  });

  await page.click(`[download="${fileName}"]`);
})();
