const { default: axios } = require("axios");

axios(
  "https://www.vlive.tv/globalv-web/vam-web/post/v1.0/board-4584/posts?appId=8c6cc7b45d2568fb668be6e05b6e5a3b&fields=attachments,author,availableActions,board%7BboardId,title,boardType,payRequired,includedCountries,excludedCountries%7D,channel%7BchannelName,channelCode%7D,totalCommentCount,contentType,createdAt,emotionCount,excludedCountries,includedCountries,isCommentEnabled,isHiddenFromStar,lastModifierMember,notice,officialVideo,plainBody,postId,postVersion,reservation,starReactions,targetMember,thumbnail,title,url,writtenIn,sharedPosts,originPost,blindType&sortType=LATEST&limit=20&gcc=JP&locale=zh_CN",
  {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      pragma: "no-cache",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-v-device-id": "ccc1c6c5-4c0e-4d83-891b-3e419846f5e5",
      Referer: "https://www.vlive.tv/channel/DB9473/board/4584",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  }
)
  .then((res) => console.log(res.data))
  .catch((e) => console.log(e));
