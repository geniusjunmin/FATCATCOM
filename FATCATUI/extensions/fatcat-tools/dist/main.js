"use strict";

const packageJSON = require("../package.json");

exports.load = function load() {
    console.log("[fatcat-tools] loaded");
};

exports.unload = function unload() {
    console.log("[fatcat-tools] unloaded");
};

exports.methods = {
    async setupMainGreybox() {
        try {
            const result = await Editor.Message.request("scene", "execute-scene-script", {
                name: packageJSON.name,
                method: "setupMainGreybox",
                args: [],
            });
            console.log("[fatcat-tools] setup result:", result);
            await syncPreviewStartScene(result && result.sceneUuid);

            try {
                await Editor.Message.request("scene", "save-scene");
                console.log("[fatcat-tools] current scene saved");
            } catch (saveError) {
                console.warn("[fatcat-tools] scene setup finished, but save-scene message failed. Please save manually.", saveError);
            }

            return result;
        } catch (error) {
            console.error("[fatcat-tools] failed to setup main greybox:", error);
            throw error;
        }
    },

    printGuide() {
        console.log([
            "",
            "肥猫咖啡公司灰盒搭建说明",
            "1. 打开或新建一个场景，例如 assets/scene/Main.scene。",
            "2. 等待新增 TypeScript 脚本和 JSON 完成导入。",
            "3. 点击顶部菜单：肥猫工具 -> 搭建当前场景灰盒。",
            "4. 预览当前场景，应该能看到顶栏资源、六层工厂、发射按钮、底部导航、金币增减测试按钮。",
            "5. 如果控制台提示找不到 GameApp 或 MainGreyboxBootstrap，请先等脚本编译完成后再点一次。",
            "",
        ].join("\n"));
    },
};

async function syncPreviewStartScene(sceneUuid) {
    if (!sceneUuid || !Editor.Profile) {
        return;
    }

    const attempts = [
        () => Editor.Profile.setProject("preview", "general.start_scene", sceneUuid),
        () => Editor.Profile.setConfig("preview", "general.start_scene", sceneUuid, "project"),
    ];

    for (const attempt of attempts) {
        try {
            await attempt();
            console.log("[fatcat-tools] preview start_scene synced:", sceneUuid);
            return;
        } catch (error) {
            // Creator versions differ in Profile APIs; try the next known shape.
        }
    }

    console.warn("[fatcat-tools] preview start_scene sync was skipped; please restart Preview if it still shows the Cocos logo.");
}
