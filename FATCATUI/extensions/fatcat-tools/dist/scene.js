"use strict";

exports.load = function load() {};

exports.unload = function unload() {};

exports.methods = {
    setupMainGreybox() {
        const cc = require("cc");
        const {
            Canvas,
            director,
            Layers,
            Node,
            ResolutionPolicy,
            UITransform,
            view,
        } = cc;

        const scene = director.getScene();
        if (!scene) {
            return {
                ok: false,
                reason: "No active scene. Please open or create a scene first.",
            };
        }

        const rootName = "FatCatMainGreyboxRoot";
        let root = scene.getChildByName(rootName);
        if (!root) {
            root = new Node(rootName);
            scene.addChild(root);
        }

        root.active = true;
        root.layer = Layers.Enum.UI_2D;
        root.setPosition(0, 0, 0);
        root.setScale(1, 1, 1);

        const transform = ensureComponent(root, UITransform);
        transform.setContentSize(1080, 1920);

        const canvas = ensureComponent(root, Canvas);
        canvas.alignCanvasWithScreen = false;
        try {
            view.setDesignResolutionSize(1080, 1920, ResolutionPolicy.FIXED_WIDTH);
        } catch (error) {
            console.warn("[fatcat-tools] failed to set design resolution:", error);
        }

        const added = [];
        const skipped = [];
        const gameApp = addProjectComponent(root, "GameApp");
        if (gameApp.ok) {
            added.push("GameApp");
            gameApp.component.resetSaveOnStart = false;
        } else {
            skipped.push(`GameApp: ${gameApp.reason}`);
        }

        // Removed MainGreyboxBootstrap as it was replaced by static nodes


        return {
            ok: skipped.length === 0,
            scene: scene.name,
            sceneUuid: scene.uuid || scene._id || "",
            root: rootName,
            added,
            skipped,
            hint: skipped.length === 0
                ? "Preview this scene to run the greybox."
                : "Wait for project scripts to finish importing, then run the menu command again.",
        };
    },
};

function ensureComponent(node, ComponentClass) {
    return node.getComponent(ComponentClass) || node.addComponent(ComponentClass);
}

function addProjectComponent(node, className) {
    const existing = node.getComponent(className);
    if (existing) {
        return {
            ok: true,
            component: existing,
            existed: true,
        };
    }

    tryRequireProjectScript(className);

    try {
        const component = node.addComponent(className);
        if (!component) {
            return {
                ok: false,
                reason: "addComponent returned empty component",
            };
        }
        return {
            ok: true,
            component,
            existed: false,
        };
    } catch (error) {
        return {
            ok: false,
            reason: error && error.message ? error.message : String(error),
        };
    }
}

function tryRequireProjectScript(className) {
    const scriptPaths = {
        GameApp: [
            "db://assets/scripts/core/GameApp",
            "db://assets/scripts/core/GameApp.ts",
        ],
        MainGreyboxBootstrap: [
            "db://assets/scripts/ui/debug/MainGreyboxBootstrap",
            "db://assets/scripts/ui/debug/MainGreyboxBootstrap.ts",
        ],
    };

    const candidates = scriptPaths[className] || [];
    for (const path of candidates) {
        try {
            require(path);
            return true;
        } catch (error) {
            // Cocos may already have registered the component, so requiring is best-effort only.
        }
    }
    return false;
}
