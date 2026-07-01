const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outDir = path.resolve("docs/verification/screenshots/2026-07-01-friend-visit-regression");
const sizes = [
  [360, 800],
  [414, 896],
  [430, 932],
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
    page.on("console", message => {
      if (message.type() === "error" || message.type() === "warning") {
        messages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("response", response => {
      if (response.status() >= 400) failedRequests.push({ status: response.status(), url: response.url() });
    });

    await page.goto(`http://localhost:7456/?friendvisit=${width}x${height}`, {
      waitUntil: "load",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);
    await page.click('button[title="friends"]');
    await page.waitForTimeout(400);
    await page.click("#fatcat-dom-panel-overlay .friend-actions .tag");
    await page.waitForTimeout(400);

    const scene = page.locator("#fatcat-dom-panel-overlay .friend-visit-scene");
    await scene.scrollIntoViewIfNeeded();
    const file = path.join(outDir, `friend-visit-${width}x${height}.png`);
    await scene.screenshot({ path: file });
    const state = await scene.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const floors = Array.from(element.querySelectorAll(".friend-scene-floor"));
      const actions = Array.from(element.querySelectorAll(".friend-scene-actions .tag"));
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        floors: floors.length,
        actions: actions.length,
        sign: !!element.querySelector(".friend-scene-sign"),
        backdrop: getComputedStyle(element).getPropertyValue("--friend-factory-art"),
        floorContained: floors.every(floor => {
          const floorRect = floor.getBoundingClientRect();
          return floorRect.left >= rect.left - 1 && floorRect.right <= rect.right + 1;
        }),
        actionContained: actions.every(action => {
          const actionRect = action.getBoundingClientRect();
          return actionRect.left >= rect.left - 1 && actionRect.right <= rect.right + 1;
        }),
      };
    });
    const screenshotBytes = fs.statSync(file).size;
    results.push({ size: `${width}x${height}`, file, screenshotBytes, state, messages, failedRequests });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  const failed = results.some(result =>
    result.messages.length > 0 ||
    result.failedRequests.length > 0 ||
    result.screenshotBytes < 70000 ||
    result.state.width < 300 ||
    result.state.floors < 3 ||
    result.state.actions !== 5 ||
    !result.state.sign ||
    !result.state.backdrop.includes("data:image/jpeg") ||
    !result.state.floorContained ||
    !result.state.actionContained
  );
  if (failed) process.exit(1);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
