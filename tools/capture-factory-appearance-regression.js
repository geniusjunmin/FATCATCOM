const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-07-02-factory-appearance");
const sizes = [
  [430, 932],
  [414, 896],
  [360, 800],
  [768, 1024],
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: edgePath });
  const results = [];

  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const messages = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        messages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
    });

    await page.goto(`http://localhost:7456/?appearance=${width}x${height}-${Date.now()}`, {
      waitUntil: "load",
      timeout: 15000,
    });
    await page.waitForTimeout(3500);
    await page.click('#fatcat-dom-nav [data-panel="buildings"]');
    await page.waitForTimeout(450);
    await page.click('#fatcat-dom-panel-overlay [data-action="openFactoryAppearance"]');
    await page.waitForTimeout(250);

    const cards = page.locator("#fatcat-dom-panel-overlay .factory-appearance-card");
    const cardCount = await cards.count();
    const appearances = [];
    for (let index = 0; index < cardCount; index += 1) {
      await cards.nth(index).click();
      await page.waitForTimeout(100);
      appearances.push(await page.evaluate(() => {
        const stage = document.querySelector("#fatcat-dom-panel-overlay .factory-appearance-stage");
        const apply = document.querySelector("#fatcat-dom-panel-overlay .factory-appearance-apply");
        return {
          selected: stage?.getAttribute("data-selected-appearance") || "",
          active: stage?.getAttribute("data-active-appearance") || "",
          background: stage ? getComputedStyle(stage).backgroundImage : "",
          selectedCards: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-appearance-card.selected").length,
          activeCards: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-appearance-card.active").length,
          bonuses: document.querySelectorAll("#fatcat-dom-panel-overlay .factory-appearance-bonus-grid > span").length,
          applyDisabled: apply?.hasAttribute("disabled") === true,
        };
      }));
    }

    await cards.first().click();
    await page.waitForTimeout(120);

    const file = path.join(outDir, `factory-appearance-${width}x${height}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const state = await page.evaluate(() => {
      const overlay = document.querySelector("#fatcat-dom-panel-overlay");
      const stage = overlay?.querySelector(".factory-appearance-stage");
      const cards = Array.from(overlay?.querySelectorAll(".factory-appearance-card") || []);
      const apply = overlay?.querySelector(".factory-appearance-apply");
      const title = overlay?.querySelector(".factory-appearance-title");
      const outerClose = overlay?.querySelector(":scope > .panel-close");
      const returnButton = overlay?.querySelector('[data-action="closeFactoryAppearance"]');
      const nav = document.querySelector("#fatcat-dom-nav .nav-bar");
      const inViewport = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth + 1 && rect.top >= 0 && rect.bottom <= window.innerHeight + 1;
      };
      return {
        shell: !!overlay?.querySelector(".factory-appearance-shell"),
        appearancePage: overlay?.querySelector(".factory-appearance-shell")?.getAttribute("data-appearance-page") || "",
        appearanceZones: Array.from(overlay?.querySelectorAll("[data-appearance-zone]") || [])
          .map(element => element.getAttribute("data-appearance-zone"))
          .filter((value, index, values) => !!value && values.indexOf(value) === index)
          .sort(),
        titleCompact: (() => {
          if (!title) return false;
          const rect = title.getBoundingClientRect();
          return rect.width <= 1.5 && rect.height <= 1.5;
        })(),
        outerCloseHidden: !!outerClose && getComputedStyle(outerClose).display === "none",
        cardCount: cards.length,
        lockedCards: cards.filter((card) => card.classList.contains("locked")).length,
        selectedCards: cards.filter((card) => card.classList.contains("selected")).length,
        activeCards: cards.filter((card) => card.classList.contains("active")).length,
        selectedAppearance: stage?.getAttribute("data-selected-appearance") || "",
        activeAppearance: stage?.getAttribute("data-active-appearance") || "",
        stageAspect: stage ? Math.round((stage.getBoundingClientRect().width / stage.getBoundingClientRect().height) * 100) / 100 : 0,
        previewEmbedded: stage ? getComputedStyle(stage).backgroundImage.includes('url("data:image/jpeg;base64,') : false,
        returnInsideStage: (() => {
          if (!stage || !returnButton) return false;
          const stageRect = stage.getBoundingClientRect();
          const returnRect = returnButton.getBoundingClientRect();
          return returnRect.left >= stageRect.left && returnRect.right <= stageRect.right
            && returnRect.top >= stageRect.top && returnRect.bottom <= stageRect.bottom;
        })(),
        stageVisible: inViewport(stage),
        cardsContained: cards.every(inViewport),
        applyClearNav: !!apply && !!nav && apply.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top - 2,
      };
    });

    await page.click('#fatcat-dom-panel-overlay [data-action="closeFactoryAppearance"]');
    await page.waitForTimeout(150);
    const returnedToBuilding = await page.locator("#fatcat-dom-panel-overlay .building-detail-hero").count() === 1;
    const uniqueBackgrounds = new Set(appearances.map(item => item.background)).size;
    const embeddedBackgrounds = appearances.filter(item => item.background.includes('url("data:image/jpeg;base64,')).length;
    const appearanceStates = appearances.map(({ background, ...stateWithoutBackground }) => stateWithoutBackground);
    results.push({
      size: `${width}x${height}`,
      file,
      state,
      appearances: appearanceStates,
      uniqueAppearances: new Set(appearances.map(item => item.selected)).size,
      uniqueBackgrounds,
      embeddedBackgrounds,
      returnedToBuilding,
      messages,
      failedRequests,
    });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const failed = results.some(result =>
    !result.state.shell
    || result.state.cardCount !== 4
    || result.state.lockedCards !== 3
    || result.state.selectedCards !== 1
    || result.state.activeCards !== 1
    || result.state.appearancePage !== "factory"
    || result.state.appearanceZones.join(",") !== "bonuses,preview,return,themes,title"
    || !result.state.titleCompact
    || !result.state.outerCloseHidden
    || result.state.selectedAppearance !== "simple"
    || result.state.activeAppearance !== "simple"
    || result.state.stageAspect < 0.98
    || result.state.stageAspect > 1.02
    || !result.state.previewEmbedded
    || !result.state.returnInsideStage
    || !result.state.stageVisible
    || !result.state.cardsContained
    || !result.state.applyClearNav
    || result.uniqueAppearances !== 4
    || result.uniqueBackgrounds !== 4
    || result.embeddedBackgrounds !== 4
    || appearancesInvalid(result.appearances)
    || !result.returnedToBuilding
    || result.messages.length > 0
    || result.failedRequests.length > 0);
  if (failed) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function appearancesInvalid(appearances) {
  return appearances.some(item =>
    item.active !== "simple"
    || item.selectedCards !== 1
    || item.activeCards !== 1
    || item.bonuses !== 4
    || !item.applyDisabled);
}
