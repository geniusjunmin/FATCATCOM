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
  if (!source.includes(pattern)) {
    fail("DOM asset resolver contract check failed.", { label, pattern });
  }
}

function assertNotContains(label, source, pattern) {
  if (source.includes(pattern)) {
    fail("DOM asset resolver contract check failed.", { label, forbidden: pattern });
  }
}

const resolver = read("FATCATUI/assets/scripts/ui/DomAssetResolver.ts");
const bottomNav = read("FATCATUI/assets/scripts/ui/BottomNavUI.ts");

assertContains("resolver imports data uri bridge", resolver, "DomAssetDataUris");
assertContains("resolver imports factory props", resolver, "FactoryPropDataUris");
assertContains("resolver imports generated registry", resolver, "GeneratedCatFullArtAssets");
assertContains("resolver feature helper", resolver, "getFeatureIconAsset");
assertContains("resolver factory helper", resolver, "getFactoryPropDataUri");
assertContains("resolver item helper", resolver, "getGeneratedIconAsset");
assertContains("resolver cat helper", resolver, "getCatFullArtAsset");
assertContains("resolver equipment helper", resolver, "getEquipIconAsset");
assertContains("resolver skill helper", resolver, "getSkillIconAsset");

assertContains("bottom nav imports resolver", bottomNav, "from \"./DomAssetResolver\"");
assertContains("bottom nav feature wrapper", bottomNav, "return getFeatureIconAsset(kind);");
assertContains("bottom nav factory wrapper", bottomNav, "return getFactoryPropDataUri(scene);");
assertContains("bottom nav data uri wrapper", bottomNav, "return getDomAssetDataUri(assetPath);");
assertContains("bottom nav item wrapper", bottomNav, "return getGeneratedIconAsset(iconClass);");
assertContains("bottom nav cat wrapper", bottomNav, "return getCatFullArtAsset(catId, portrait);");
assertContains("bottom nav equipment wrapper", bottomNav, "return getEquipIconAsset(kind);");
assertContains("bottom nav skill wrapper", bottomNav, "return getSkillIconAsset(role);");
assertNotContains("bottom nav no direct dom data uri import", bottomNav, "import { DomAssetDataUris }");
assertNotContains("bottom nav no direct factory data import", bottomNav, "import { FactoryPropDataUris }");
assertNotContains("bottom nav no direct generated cat import", bottomNav, "GeneratedCatFullArtAssets,");
assertNotContains("bottom nav no direct item registry import", bottomNav, "GeneratedItemIconAssets");
assertNotContains("bottom nav no direct skill registry import", bottomNav, "GeneratedSkillIconAssets");

console.log(JSON.stringify({
  ok: true,
  checked: [
    "DOM asset resolver module",
    "feature/factory/item/cat/equipment/skill helpers",
    "BottomNavUI resolver delegation",
    "removed direct large DataURI/registry imports from BottomNavUI",
  ],
}, null, 2));
