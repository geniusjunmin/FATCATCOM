/*
 * Browser-console verification helper for http://localhost:7456/.
 * Paste into DevTools console while the Cocos preview is open, or run through
 * any browser automation tool that can evaluate JavaScript in the page.
 */
(async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("This verifier must run inside the preview page, not in Node.js. Paste it into the browser console or evaluate it through a browser automation tool.");
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const result = {
    url: location.href,
    steps: [],
    errors: [],
  };

  const visibleButtons = () => [...document.querySelectorAll("button")]
    .filter((button) => {
      const style = getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });

  const findButton = (text) => visibleButtons().find((button) => (button.textContent || "").includes(text));
  const clickButton = async (label, fallbackSelector) => {
    const button = findButton(label) || (fallbackSelector ? document.querySelector(fallbackSelector) : null);
    if (!button) {
      result.errors.push(`Missing button: ${label}`);
      return false;
    }
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    button.click();
    await wait(200);
    result.steps.push(`Clicked ${label}`);
    return true;
  };

  await clickButton("猫咪");
  const overlay = document.querySelector("#fatcat-dom-cat-overlay");
  result.catOverlayVisible = !!overlay && getComputedStyle(overlay).display !== "none";
  result.catTitle = overlay?.querySelector(".cat-modal-title")?.textContent?.trim() || "";

  for (const tab of ["信息", "升级", "技能", "装备", "皮肤"]) {
    await clickButton(tab, `#fatcat-dom-cat-overlay [data-tab="${tab}"]`);
  }

  await clickButton("›", "#fatcat-dom-cat-overlay [data-action=\"nextCat\"]");
  await clickButton("‹", "#fatcat-dom-cat-overlay [data-action=\"prevCat\"]");

  result.currentCatName = overlay?.querySelector(".portrait-name")?.textContent?.trim() || "";
  result.catIndex = overlay?.querySelector(".cat-index")?.textContent?.trim() || "";
  result.summary = overlay?.querySelector(".cat-overview-head")?.textContent?.replace(/\s+/g, " ").trim() || "";
  result.ok = result.errors.length === 0 && result.catOverlayVisible && result.catTitle.includes("猫咪图鉴");

  console.table(result.steps.map((step, index) => ({ index: index + 1, step })));
  console.log("[fatcat-ui-verify]", result);
  return result;
})();
