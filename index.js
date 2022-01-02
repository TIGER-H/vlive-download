const pupperteer = require("puppeteer");
const axios = require("axios");
let vUrls = [];
let posts = [];

// use latest *inkey* for metadata
const getMetaData = async (url) => {
  try {
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
  } catch (e) {
    console.log(e.message);
  }
};

(async () => {
  const browser = await pupperteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", async (interceptedRequest) => {
    if (
      interceptedRequest
        .url()
        .includes("https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/")
    ) {
      const vurl = interceptedRequest.url();
      vUrls.push({ vurl });
    }
    interceptedRequest.continue();
  });

  page.on("response", async (response) => {
    if (
      response
        .url()
        .includes("https://www.vlive.tv/globalv-web/vam-web/post/v1.0/board")
    ) {
      const { paging, data } = await response.json();
      console.log(`collected ${data.length} video posts.`);
      data.forEach((post) => {
        posts.push(post);
      });
    }
  });

  // get posts
  await page.goto(`https://www.vlive.tv/channel/DB9473/board/4584`, {
    waitUntil: "networkidle2",
  });

  const postUrls = posts
    .filter((post) => post.contentType === "VIDEO")
    .map((post) => post.url);

  for (let i = 0; i < postUrls.length; i++) {
    console.log(`getting ${i} post url`);
    await page.goto(postUrls[i], { waitUntil: "networkidle2" });
  }

  console.log(vUrls);

  await browser.close();

  for (let i = 0; i < vUrls.length; i++) {
    console.log("getting metadata for", i);
    const vurl = vUrls[i].vurl;
    const src = await getMetaData(vurl);
    console.log(src);
  }

  // can only use in headless set to false
  // todo: assemble file name and download path
  // const { fileName, fileType } = await page.evaluate(async () => {
  //   const fileName = "download-link";

  //   const el = document.querySelector("video");
  //   const { src, type } = el.querySelector("source");

  //   const downloadLink = document.createElement("a");
  //   downloadLink.innerText = "Download Video";
  //   downloadLink.href = src;
  //   downloadLink.download = fileName;

  //   document.querySelector("body").appendChild(downloadLink);

  //   return { fileName, fileType: type.split("/")[1] };
  // });

  // await page.click(`[download="${fileName}"]`);
})();
