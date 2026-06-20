const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const url = "http://localhost:7456/?cattext=1";

const expectedText = [
    "猫咪图鉴",
    "信息",
    "升级",
    "技能",
    "装备",
    "皮肤",
    "生产力",
    "咖啡豆消耗",
    "原料产量",
    "体重阶段",
    "猫咪故事",
    "猫咪队伍",
    "技能详情",
    "装备背包",
    "已装备",
    "持有 x",
    "升级装备",
    "新手任务",
    "当前等级",
    "下级预览",
    "升级消耗",
    "当前加成",
    "下级加成",
];

const mojibakePatterns = [
    "鐚",
    "鍜",
    "绉",
    "瑁",
    "鎷",
    "宸",
    "鈥",
    "脳",
    "鍠",
    "蹇",
    "鑳",
    "浣",
    "褰",
    "闃",
    "閰",
];

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
    await page.click('#fatcat-dom-nav [data-panel="cats"]');
    await page.waitForTimeout(800);

    const text = await page.evaluate(() => document.querySelector("#fatcat-dom-cat-overlay")?.innerText ?? "");
    const missing = expectedText.filter((entry) => !text.includes(entry));
    const mojibake = mojibakePatterns.filter((entry) => text.includes(entry));

    await browser.close();

    const result = { ok: missing.length === 0 && mojibake.length === 0 && messages.length === 0 && failedRequests.length === 0, missing, mojibake, messages, failedRequests };
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
