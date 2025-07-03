const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://example.com");
  console.log("typeof page.$x =", typeof page.$x);
  await browser.close();
})();
