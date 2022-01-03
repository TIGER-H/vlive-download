const puppeteer = require("puppeteer-core");
const axios = require("axios").default;
let vUrls = [];
let posts = [];

let postIter = {};

// use latest *inkey* for metadata
const getMetaData = async (url) => {
  try {
    const { data } = await axios.get(url);
    const { meta, videos } = await data;

    // get highest quality video info
    const { list } = videos;
    const bestVideo = list.reduce((prev, curr) => {
      if (curr.size > prev.size) {
        return curr;
      }
      return prev;
    });
    // todo: assemble meta data
    const { subject: title, cover } = meta;

    return { title, cover, bestVideo };
  } catch (e) {
    console.log(e.message);
  }
};

const getAllNextPosts = async (nextParams) => {
  let next = nextParams;
  while (true) {
    try {
      const { data } = await axios.get(postIter.url, {
        params: {
          after: next.after,
        },
        headers: postIter.headers,
        timeout: 10000,
        timeoutErrorMessage: "timeout",
      });

      const { data: postsData, paging } = data;
      posts.push(...postsData);

      if (paging.nextParams === undefined) {
        console.log("reached the end.");
        break;
      }

      next = paging.nextParams;

      console.log(next);
    } catch (e) {
      console.log(e.message);
    }
  }
  console.log(posts.length);
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
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

    if (
      interceptedRequest
        .url()
        .includes("https://www.vlive.tv/globalv-web/vam-web/post/v1.0/board")
    ) {
      postIter = {
        headers: interceptedRequest.headers(),
        url: interceptedRequest.url(),
      };
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

      posts.push(...data);

      if (paging.nextParams) {
        await getAllNextPosts(paging.nextParams);
      }
    }
  });

  // get posts
  await page.goto(`https://www.vlive.tv/channel/DB9473/board/4584`, {
    waitUntil: "networkidle2",
  });

  const postUrls = posts
    .filter((post) => post.contentType === "VIDEO")
    .map((post) => post.url);

  console.log(postUrls.length);

  for (let i = 0; i < postUrls.length; i++) {
    console.log(`getting ${i}/${postUrls.length} post url`);
    try {
      await page.goto(postUrls[i], { waitUntil: "networkidle2" });
    } catch (e) {
      console.log(e.message);
    }
  }

  console.log(vUrls);

  await browser.close();

  for (let i = 0; i < vUrls.length; i++) {
    console.log("getting metadata for", i + 1);
    const vurl = vUrls[i].vurl;
    const src = await getMetaData(vurl);
    console.log(src);
  }
})();
