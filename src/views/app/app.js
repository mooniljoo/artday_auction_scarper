const { ipcRenderer } = require("electron");
const rootPath = require("electron-root-path").rootPath;
const shell = require("electron").shell;
const puppeteer = require("puppeteer");

let boolRunning = true;

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Scraper DOM fully loaded");
  document.getElementById("input_dirPath").value = rootPath;
});

function onCancel(el) {
  //check this element is disabled or not
  if (el.classList.contains("disabled")) return;
  // show msg to screen for user
  document.getElementById("stateMsg").innerText = "취소중입니다...";
  boolRunning = false;
}
function setLoading() {
  document.getElementById("stateMsg").innerText = "불러오는 중입니다...";
  document.querySelector(".state").classList.add("on");
  document.getElementById("btnRunning").classList.add("disabled");
  document.getElementById("btnSelectDirPath").classList.add("disabled");
  document.getElementById("btnOpenDir").classList.add("disabled");
  document.getElementById("btnCancel").classList.remove("disabled");
  document.getElementById("btnCancel").classList.remove("disabled");
  let = allCheckbox = document.querySelectorAll(
    "#wrapper_checkbox input[type=checkbox]"
  );
  for (let i = 0; i < allCheckbox.length; i++) {
    allCheckbox[i].setAttribute("disabled", "disabled");
  }
}
function unsetLoading() {
  document.querySelector(".state").classList.remove("on");
  document.getElementById("btnRunning").classList.remove("disabled");
  document.getElementById("btnSelectDirPath").classList.remove("disabled");
  document.getElementById("btnOpenDir").classList.remove("disabled");
  document.getElementById("btnCancel").classList.add("disabled");
  let = allCheckbox = document.querySelectorAll(
    "#wrapper_checkbox input[type=checkbox]"
  );
  for (let i = 0; i < allCheckbox.length; i++) {
    allCheckbox[i].removeAttribute("disabled");
  }
}

function openDialogMsg(msg) {
  ipcRenderer.sendSync("openDialogMsg", msg);
}
function openDialogError(msg) {
  ipcRenderer.sendSync("openDialogError", msg);
}
function openDir(el) {
  //check this element is disabled or not
  if (el.classList.contains("disabled")) return;
  let dirPath = document.getElementById("input_dirPath").value;
  console.log("open the folder", dirPath);
  shell.openExternal(dirPath);
}

function openDialogFile(el) {
  //check this element is disabled or not
  if (el.classList.contains("disabled")) return;
  // send to Main Process
  let resp = ipcRenderer.sendSync("openDialogFile", rootPath);
  // recv to Main Process
  if (resp.filePaths[0] != undefined)
    document.getElementById("input_dirPath").value = resp.filePaths[0];
}
async function configureBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--window-size=1280,1080"],
    // executablePath:
    //   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  return browser;
}

async function createPage(browser) {
  const page = await browser.newPage();
  return page;
}
async function goPage(page, url) {
  //access the website
  await page.goto(url, { waitUntil: "networkidle0" });
  return page;
}

async function parsing(page) {
  console.log("PARSING...");
  let description = await page.evaluate(() => {
    let q = [];
    let ls = document.querySelectorAll(".auction-table > tbody > tr");
    ls.forEach((item) => {
      let number = "";
      let artistKr = "";
      let artistEn = "";
      let titleKr = "";
      let titleEn = "";
      let year = "";
      let certi = "";
      let sizeEdition = "";
      let materialKr = "";
      let materialEn = "";
      let signPosition = "";
      let auctionTitle = "";
      let transactDate = "";
      let estimateUnit = "";
      let estimateMin = "";
      let estimateMax = "";
      let winningBid = "";
      let winningBidUnit = "";

      number = item?.querySelectorAll("td")[0]?.innerText;
      let artist = item
        ?.querySelectorAll("td")[2]
        ?.querySelectorAll("p")[0]?.innerText;
      birth = item
        ?.querySelectorAll("td")[2]
        ?.querySelectorAll("p")[2]?.innerText;
      let title = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[0]?.innerText;
      size = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[1]?.innerText;
      materialEdition = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[2]?.innerText;
      let material = materialEdition?.split("(")[0];
      edition = materialEdition?.split("(")[1]
        ? " (" + materialEdition?.split("(")[1]
        : "";
      sizeEdition = size + edition;
      year = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[3]?.innerText;
      let estimate = item
        ?.querySelectorAll("td")[5]
        ?.querySelectorAll("p")[0]
        ?.innerText.replaceAll("\n", " ");

      estimateUnit = "KRW";
      estimateMin = estimate
        ?.split("~")[0]
        .replace(/[a-zA-z\s]/g, "")
        .trim();
      estimateMax = estimate?.split("~")[1];

      auctionTitle = document.querySelector(".auc-top-title")?.innerText;
      source = document.querySelector("title")?.innerText;
      transactDate = item
        ?.querySelectorAll("td")[6]
        ?.querySelectorAll("p")[0]
        ?.innerText.replaceAll("\n", " ");

      artistKr = artist?.replace(/[^ㄱ-ㅎ|가-힣|\s]/g, "").trim();
      artistEn = artist?.replace(/[ㄱ-ㅎ|가-힣]/g, "").trim();

      titleKr = title?.replace(/[^ㄱ-ㅎ|가-힣|\s]/g, "").trim();
      titleEn = title?.replace(/[ㄱ-ㅎ|가-힣]/g, "").trim();

      materialKr = material?.replace(/[^ㄱ-ㅎ|가-힣|\s]/g, "").trim();
      materialEn = material?.replace(/[ㄱ-ㅎ|가-힣]/g, "").trim();

      certi = "";
      number = number == undefined ? "" : number;
      artistKr = artistKr == undefined ? "" : artistKr;
      artistEn = artistEn == undefined ? "" : artistEn;
      titleKr = titleKr == undefined ? "" : titleKr;
      titleEn = titleEn == undefined ? "" : titleEn;
      year = year == undefined ? "" : year;
      certi = certi == undefined ? "" : certi;
      sizeEdition = sizeEdition == undefined ? "" : sizeEdition;
      materialKr = materialKr == undefined ? "" : materialKr;
      materialEn = materialEn == undefined ? "" : materialEn;
      signPosition = signPosition == undefined ? "" : signPosition;
      source = source == undefined ? "" : source;
      auctionTitle = auctionTitle == undefined ? "" : auctionTitle;
      transactDate = transactDate == undefined ? "" : transactDate;
      estimateUnit = estimateUnit == undefined ? "" : estimateUnit;
      estimateMin = estimateMin == undefined ? "" : estimateMin;
      estimateMax = estimateMax == undefined ? "" : estimateMax;
      winningBid = winningBid == undefined ? "" : winningBid;
      winningBidUnit = winningBidUnit == undefined ? "" : winningBidUnit;
      q.push({
        number,
        artistKr,
        artistEn,
        titleKr,
        titleEn,
        year,
        certi,
        sizeEdition,
        materialKr,
        materialEn,
        signPosition,
        source,
        auctionTitle,
        transactDate,
        estimateUnit,
        estimateMin,
        estimateMax,
        winningBid,
        winningBidUnit,
      });
    });
    return q;
  });
  console.log(description);
  return description;
}

function display_table(arr) {
  const tbody = document.getElementById("tbody");
  arr.forEach((item) => {
    tbody.innerHTML += `
        <tr>
            <td>${item.number}</td>
            <td>${item.artistKr}</td>
            <td>${item.artistEn}</td>
            <td>${item.titleKr}</td>
            <td>${item.titleEn}</td>
            <td>${item.year}</td>
            <td>${item.certi}</td>
            <td>${item.sizeEdition}</td>
            <td>${item.materialKr}</td>
            <td>${item.materialEn}</td>
            <td>${item.signPosition}</td>
            <td>${item.auctionTitle}</td>
            <td>${item.source}</td>
            <td>${item.transactDate}</td>
            <td>${item.winningBidUnit}</td>
            <td>${item.winningBid}</td>
            <td>${item.estimateUnit}</td>
            <td>${item.estimateMin}</td>
            <td>${item.estimateMax}</td>
        </tr>
`;
  });
}

async function scraper(url) {
  //init variables
  let arrClosedAuction = [];
  let arrOpenAuction = [];
  let auctionResult = [];
  let pageResult;
  let browser;
  let page;

  //init browser
  while (boolRunning) {
    browser = await configureBrowser();
    page = await createPage(browser);
    break;
  }

  await goPage(
    page,
    url +
      "pages/auction/online-auction.php?page=1&oacode=O2106003&ss_info=A_n_t&ss_text=&order_desc="
  );

  let pageIndex = parseInt(
    await page.url().split("php?page=")[1].split("&oacode")[0]
  );

  console.log("TRY TO get element of auctionList");
  const auctionList = await page.$(".auction-table.text-center");
  if (auctionList == null) {
    arrClosedAuction.push("online");
    return;
  }
  arrOpenAuction.push("online");

  while (boolRunning) {
    // get pageIndex on current page
    console.log("get pageIndex on current page");
    console.log("current url", await page.url());
    console.log("current pageIndex", pageIndex);
    // create url of next page
    console.log("create url of next page");
    auctionUrl =
      url +
      "pages/auction/online-auction.php?page=" +
      pageIndex +
      "&oacode=O2106003&ss_info=A_n_t&ss_text=&order_desc=";

    console.log("auctionUrl", auctionUrl);

    console.log("TRY TO go next Page");
    // go next Page
    await Promise.all([
      goPage(page, auctionUrl),
      page.waitForNavigation({
        waitUntil: "networkidle0",
        // Remove the timeout
        timeout: 0,
      }),
    ]);

    console.log("TRY TO get element of auctionList");
    const auctionList = await page.$(".auction-table.text-center");
    if (auctionList == null) break;

    //return array of parsed description
    console.log("TRY TO PARSING");
    pageResult = await parsing(page);
    console.log("type pageResult ", typeof pageResult);
    console.log("pageResult.length ", pageResult.length);
    display_table(pageResult);

    console.log("TRY TO ADD pageResult to auctionResult");
    auctionResult.push(...pageResult);
    console.log("type auctionResult ", typeof auctionResult);

    // Break on current page if next page isn't exist.
    console.log("Break on current page if next page isn't exist");
    boolisLast = await page.$eval("ul.pagination > li.active", (el) => {
      return el.nextElementSibling.classList.contains("disabled");
    });
    console.log("boolisLast ", boolisLast);
    if (boolisLast) break;
    pageIndex++;
  }
  console.log("auctionResult.length ", auctionResult.length);
  browser.close();
  return { arrOpenAuction, arrClosedAuction, auctionResult };
}

async function run(url) {
  let arrSuccessfulAuctionsSaved = [];
  let arrFailedAuctionsSaved = [];
  let arrOpenAuction;
  let arrClosedAuction;
  setLoading();
  await scraper(url).then((res) => {
    console.log("res.arrOpenAuction ", res.arrOpenAuction);
    console.log("res.arrClosedAuction ", res.arrClosedAuction);
    console.log("auctionResult.length ", res.auctionResult.length);
    //////////////createXlsx;

    // save to xlsx
    let openedAuctionIndex = 0;
    while (boolRunning) {
      if (res.arrOpenAuction.length == openedAuctionIndex) break;
      // get directory path to save
      let dirPath = document.getElementById("input_dirPath").value;
      console.log("TRY TO save to xlsx");
      let resp = String(
        ipcRenderer.sendSync(
          "create_xlsx",
          res.auctionResult,
          dirPath,
          res.arrOpenAuction[openedAuctionIndex]
        )
      );
      if (!resp.includes("Error")) {
        arrSuccessfulAuctionsSaved.push(resp);
      } else {
        arrFailedAuctionsSaved.push(resp);
      }
      openedAuctionIndex++;
    }
    arrOpenAuction = res.arrOpenAuction;
    arrClosedAuction = res.arrClosedAuction;
  });
  unsetLoading();
  return {
    arrOpenAuction,
    arrClosedAuction,
    arrSuccessfulAuctionsSaved,
    arrFailedAuctionsSaved,
  };
}
function onSubmit(el) {
  //check this element is disabled or not
  if (el.classList.contains("disabled")) return;
  let url = "http://www.artday.co.kr/";
  run(url)
    .then((res) => {
      console.log("↓ SCRAPER RESULT ↓\n", res);
      if (boolRunning) {
        let msg = "";
        if (res.arrOpenAuction.length == 0) msg += "열려있는 경매가 없습니다.";
        if (res.arrSuccessfulAuctionsSaved.length > 0)
          msg += `${res.arrSuccessfulAuctionsSaved} 경매를 저장했습니다.`;
        if (res.arrFailedAuctionsSaved.length > 0)
          msg += `${res.arrFailedAuctionsSaved} 경매는 저장에 실패했습니다.`;
        openDialogMsg(msg);
      } else {
        boolRunning = true;
      }
    })
    .catch((err) => {
      console.error(err);
      openDialogError(err);
    });
}

// function onSubmit(el) {
//   //check this element is disabled or not
//   if (el.classList.contains("disabled")) return;
//   let url = "http://www.artday.co.kr/";
//   run(url)
//     .then((res) => {
//       console.log("↓ SCRAPER RESULT ↓\n", res);
//       if (boolRunning) {
//         let msg = "";
//         if (res.arrOpenAuction.length == 0) msg += "열려있는 경매가 없습니다.";
//         if (res.arrSuccessfulAuctionsSaved.length > 0)
//           msg += `${res.arrSuccessfulAuctionsSaved} 경매를 저장했습니다.`;
//         if (res.arrFailedAuctionsSaved.length > 0)
//           msg += `${res.arrFailedAuctionsSaved} 경매는 저장에 실패했습니다.`;
//         // openDialogMsg(msg);
//       } else {
//         boolRunning = true;
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       // openDialogError(err);
//     });
// }
