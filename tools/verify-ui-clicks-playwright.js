const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const url = "http://localhost:7456/?clickcheck=1";

async function visible(page, selector) {
    return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }, selector);
}

(async () => {
    const browser = await chromium.launch({ executablePath: edgePath });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 1 });
    const messages = [];
    const failedRequests = [];
    page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
            messages.push({ type: message.type(), text: message.text() });
        }
    });
    page.on("response", (response) => {
        if (response.status() >= 400) {
            failedRequests.push({ status: response.status(), url: response.url() });
        }
    });

    await page.goto(url, { waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(3500);

    const steps = [];
    await page.click('#fatcat-dom-nav [data-panel="cats"]');
    await page.waitForTimeout(500);
    steps.push({ step: "open-cats", ok: await visible(page, "#fatcat-dom-cat-overlay") });

    for (const tab of ["upgrade", "skill", "equip", "skin", "info"]) {
        await page.click(`#fatcat-dom-cat-overlay [data-action="tab"][data-tab="${tab}"]`);
        await page.waitForTimeout(120);
        const active = await page.evaluate((tabId) => {
            const el = document.querySelector(`#fatcat-dom-cat-overlay [data-tab="${tabId}"]`);
            return !!el && el.classList.contains("active");
        }, tab);
        steps.push({ step: `cat-tab-${tab}`, ok: active });
    }

    await page.click('#fatcat-dom-cat-overlay [data-action="skillDetails"]');
    await page.waitForTimeout(160);
    steps.push({
        step: "cat-skill-details",
        ok: await page.evaluate(() => (document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "").includes("技能详情")),
    });

    await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="equip"]');
    await page.waitForTimeout(120);
    await page.click('#fatcat-dom-cat-overlay .equipment-panel .equip-row .equip-slot[data-action="equipItem"]:not(.locked)');
    await page.waitForTimeout(160);
    steps.push({
        step: "cat-equip-action",
        ok: await page.evaluate(() => (document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "").includes("槽位已选中")),
    });
    await page.click('#fatcat-dom-cat-overlay .equip-pack[data-action="equipItem"]');
    await page.waitForTimeout(180);
    steps.push({
        step: "cat-equip-save",
        ok: await page.evaluate(() => (document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "").includes("已装备到")),
    });
    const upgradeState = await page.evaluate(() => {
        const button = document.querySelector('#fatcat-dom-cat-overlay .equip-upgrade[data-action="upgradeEquip"]');
        return {
            exists: !!button,
            disabled: !!button?.disabled,
            text: button?.textContent || "",
        };
    });
    if (upgradeState.exists && !upgradeState.disabled) {
        await page.click('#fatcat-dom-cat-overlay .equip-upgrade[data-action="upgradeEquip"]');
        await page.waitForTimeout(180);
        steps.push({
            step: "cat-equip-upgrade",
            ok: await page.evaluate(() => (document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "").includes("升级")),
        });
    } else {
        steps.push({
            step: "cat-equip-upgrade-disabled",
            ok: upgradeState.exists && (upgradeState.text.includes("已满级") || upgradeState.text.includes("金币不足")),
        });
    }

    await page.click('#fatcat-dom-cat-overlay [data-action="tab"][data-tab="skin"]');
    await page.waitForTimeout(120);
    await page.click('#fatcat-dom-cat-overlay [data-action="storyWall"]');
    await page.waitForTimeout(160);
    steps.push({
        step: "cat-story-action",
        ok: await page.evaluate(() => (document.querySelector("#fatcat-dom-cat-overlay .cat-msg")?.textContent || "").includes("故事墙")),
    });

    await page.click('#fatcat-dom-cat-overlay [data-action="nextCat"]');
    await page.waitForTimeout(160);
    await page.click('#fatcat-dom-cat-overlay [data-action="prevCat"]');
    await page.waitForTimeout(160);
    steps.push({ step: "cat-prev-next", ok: await visible(page, "#fatcat-dom-cat-overlay .portrait-cat") });

    await page.click('#fatcat-dom-cat-overlay [data-action="back"]');
    await page.waitForTimeout(300);
    steps.push({ step: "close-cats", ok: !(await visible(page, "#fatcat-dom-cat-overlay")) });

    for (const panel of ["buildings", "shop", "inventory", "research", "factory"]) {
        await page.click(`#fatcat-dom-nav [data-panel="${panel}"]`);
        await page.waitForTimeout(250);
        const current = await page.evaluate(() => document.querySelector("#fatcat-dom-nav")?.dataset.current || "");
        steps.push({ step: `nav-${panel}`, ok: current.startsWith(panel) });
    }

    await browser.close();

    const ok = steps.every((entry) => entry.ok) && messages.length === 0 && failedRequests.length === 0;
    const result = { ok, steps, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (!ok) process.exit(1);
})().catch(async (error) => {
    console.error(error);
    process.exit(1);
});
