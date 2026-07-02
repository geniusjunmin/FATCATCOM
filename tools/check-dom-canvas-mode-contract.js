const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function fail(message, details = undefined) {
  console.error(JSON.stringify({ ok: false, message, details }, null, 2));
  process.exit(1);
}

function assertContains(label, source, pattern) {
  if (!source.includes(pattern)) fail("DOM canvas mode contract failed.", { label, pattern });
}

const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");
const mainCapture = read("tools/capture-main-regression.js");
const catCapture = read("tools/capture-cat-regression.js");
const featureCapture = read("tools/capture-feature-regression.js");
const utilityCapture = read("tools/capture-utility-regression.js");
const quickVerify = read("tools/quick-verify.ps1");

assertContains("DOM canvas helper", bottomNav, "hideCocosCanvasForDomUi");
assertContains("canvas hidden on start", bottomNav, "this.hideCocosCanvasForDomUi();");
assertContains("canvas opacity set", bottomNav, 'canvas.style.opacity = "0";');
assertContains("canvas opacity restored", bottomNav, "canvas.style.opacity = this._cocosCanvasOpacity;");
assertContains("native shop panel retained outside web", bottomNav, "this.shopPanel.active = !useDomPanels");
assertContains("native inventory panel retained outside web", bottomNav, "this.inventoryPanel.active = !useDomPanels");
assertContains("native research panel retained outside web", bottomNav, "this.researchPanel.active = !useDomPanels");
assertContains("main screenshot canvas guard", mainCapture, "domCanvasHidden");
assertContains("cat screenshot canvas guard", catCapture, "domCanvasHidden");
assertContains("feature screenshot canvas guard", featureCapture, "domCanvasHidden");
assertContains("utility screenshot canvas guard", utilityCapture, "domCanvasHidden");
assertContains("quick verify registration", quickVerify, "check-dom-canvas-mode-contract.js");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "web DOM mode hides and restores the Cocos canvas",
    "native Cocos feature panels remain available outside web",
    "main, cat, feature, and utility screenshot guards",
  ],
}, null, 2));
