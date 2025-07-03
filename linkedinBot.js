require("dotenv").config();
const puppeteer = require("puppeteer");

const EMAIL = process.env.EMAIL;
const SENHA = process.env.SENHA;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  // Login
  await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded" });
  await page.type("#username", EMAIL, { delay: 100 });
  await page.type("#password", SENHA, { delay: 100 });
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {
      console.log("⏳ Timeout após login. Continuando...");
    }),
  ]);

  console.log("✅ Login realizado.");

  // Ir para feed
  await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const MAX_CURTIDAS = 5;
  let curtidas = 0;

  while (curtidas < MAX_CURTIDAS) {
    // Busca botões com aria-label que começa com "Reagir com gostei" e que ainda não foram clicados
    const botoesCurtir = await page.$$(
      'button[aria-pressed="false"][aria-label^="Reagir com gostei"]'
    );

    if (botoesCurtir.length === 0) {
      console.log("❌ Não encontrei botões para curtir visíveis. Rolando a página...");
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(3000);
      continue;
    }

    for (const botao of botoesCurtir) {
      if (curtidas >= MAX_CURTIDAS) break;

      try {
        await botao.click();
        curtidas++;
        console.log(`👍 Curtida ${curtidas}`);
        await page.waitForTimeout(2000 + Math.random() * 1000);
      } catch (error) {
        console.log("⚠️ Erro ao clicar no botão de curtir, pulando...");
      }
    }

    if (curtidas < MAX_CURTIDAS) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(3000);
    }
  }

  console.log("✅ Curtidas finalizadas.");
  await browser.close();
})();
