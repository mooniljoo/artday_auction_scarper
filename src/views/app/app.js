const { ipcRenderer } = require("electron");
const puppeteer = require("puppeteer");
// // const shell = require("electron").shell;
// const Store = require("electron-store");
const fs = require("fs");

// store = new Store();

let toggleCancel = true;

function setLoading() {
  document.querySelector("nav").classList.add("loading");
  document.getElementById("btnRunning").classList.add("disabled");
  document.getElementById("btnCancel").classList.remove("disabled");
  document.getElementById("input_dirName").setAttribute("disabled", "disabled");
  document.getElementById("input_dirName").classList.add("disabled");
  // document.getElementById("btnOpenfile").classList.add("disabled");
}
function unsetLoading() {
  document.querySelector("nav").classList.remove("loading");
  document.getElementById("btnRunning").classList.remove("disabled");
  document.getElementById("btnCancel").classList.add("disabled");
  document.getElementById("input_dirName").removeAttribute("disabled");
  document.getElementById("input_dirName").classList.remove("disabled");
  // document.getElementById("btnOpenfile").classList.remove("disabled");
}
function openDialogMsg(msg) {
  ipcRenderer.sendSync("openDialogMsg", msg);
}
function openDialogError(msg) {
  ipcRenderer.sendSync("openDialogError", msg);
}

function cancel(el) {
  if (el.classList.contains("disabled")) {
    console.log("This button is disabled.");
  } else {
    console.log("Press the Cancel");
    toggleCancel = false;
    openDialogMsg("취소되었습니다.");
  }
}
function createFolder(dirName) {
  !fs.existsSync(dirName) && fs.mkdirSync(dirName);
}
async function parsing(page) {
  console.log("parsing start");
  let description = await page.evaluate(() => {
    let q = [];
    let ls = document.querySelectorAll(".auction-table > tbody > tr");
    let source = document.querySelector("title")?.innerText;
    let auctionTitle = document.querySelector(".auc-top-title")?.innerText;
    let transactDate = document
      .querySelector(".auction-info > p:nth-child(2)")
      ?.innerText.split("부터")[0]
      .split("경매마감")[1];
    ls.forEach((item) => {
      const number = item?.querySelectorAll("td")[0]?.innerText;
      const artist = item
        ?.querySelectorAll("td")[2]
        ?.querySelectorAll("p")[0]?.innerText;
      const title = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[0]?.innerText;
      const size = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[1]?.innerText;
      const materialEdition = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[2]?.innerText;
      const material = materialEdition?.split("(")[0];
      const edition = materialEdition?.split("(")[1]
        ? " (" + materialEdition?.split("(")[1]
        : "";
      const sizeEdition = size + edition;
      const year = item
        ?.querySelectorAll("td")[3]
        ?.querySelectorAll("p")[3]?.innerText;
      const estimate = item
        ?.querySelectorAll("td")[5]
        ?.querySelectorAll("p")[0]
        ?.innerText.replace(/\s/g, "");

      let estimateMin = estimate?.split("~")[0];
      let estimateMax = estimate?.split("~")[1];

      let artistKr = artist?.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "").trim();
      let artistEn = artist?.replace(/[^a-zA-z\s]/g, "").trim();

      let titleKr = title?.replace(/[a-zA-z\s]/g, "").trim();
      let titleEn = title?.replace(/[^a-zA-z\s]/g, "").trim();

      let materialKr = material?.replace(/[a-zA-z\s]/g, "").trim();
      let materialEn = material?.replace(/[^a-zA-z\s]/g, "").trim();

      let certi = "";
      let signPosition = "";
      let winningBidUnit = "";
      let winningBid = "";
      let estimateUnit = "";

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
        winningBidUnit,
        winningBid,
        estimateUnit,
        estimateMin,
        estimateMax,
      });
    });
    return q;
  });
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
            <td>${item.source}</td>
            <td>${item.auctionTitle}</td>
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
async function configureBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=1280,1080"],
  });
  return browser;
}
async function scraper(url) {
  setLoading();
  while (1) {
    //ready for browser
    const result = [];
    const browser = await configureBrowser();
    const page = await browser.newPage();
    //access the website
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // DEPTH 1 : pagination
    let pageIndex = 1;
    while (1) {
      await page.waitForTimeout(1000);
      await page.waitForSelector(".auction-table", { timeout: 9000 });

      let paginateButton = await page.$$("ul.pagination > li > a");
      let bool_isNextButtonDisabled = await page.$eval(
        "ul.pagination > li.active",
        (el) => {
          return el.nextElementSibling.classList.contains("disabled");
        }
      );
      //check if paginate button is disabled
      console.log(`bool_isNextButtonDisabled is ${bool_isNextButtonDisabled}`);
      if (bool_isNextButtonDisabled) break;

      //parsing
      let description = await parsing(page);
      display_table(description);
      result.push(...description);
      console.log(`Page ${pageIndex} has completed.`);

      //access to new paginate page
      console.log(pageIndex);
      paginateButton[pageIndex].click();

      if (pageIndex == paginateButton.length - 1) pageIndex = 0;
      console.log(11, toggleCancel);
      if (!toggleCancel) {
        browser.close();
        unsetLoading();
        return;
      }
      pageIndex++;
    }
    console.log(22, toggleCancel);
    console.log(`All Loops are over.`);
    browser.close();
    unsetLoading();
    return result;
  }
}
function onSubmit(el) {
  if (el.classList.contains("disabled")) return false;

  console.log(toggleCancel);
  let url = "http://www.artday.co.kr/pages/auction/online-auction.php";
  dirName = document.getElementById("input_dirName").value;
  if (dirName) createFolder(dirName);
  scraper(url).then((res) => {
    if (toggleCancel) {
      let resp = String(ipcRenderer.sendSync("create_xlsx", res, dirName));
      console.log(resp);
    }
  });
  // .catch((error) => {
  //   console.error(error);
  //   // openDialogError(error);
  // });
  toggleCancel = true;
  console.log(toggleCancel);
}
