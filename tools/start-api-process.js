const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function startApiProcess(apiUrl, options = {}) {
    const root = path.resolve(__dirname, "..");
    const dllDir = path.join(root, "FATCATServer", "FatCat.Api", "bin", "Debug", "net9.0");
    const dllPath = path.join(dllDir, "FatCat.Api.dll");
    const stdio = options.captureOutput ? ["ignore", "pipe", "pipe"] : "ignore";
    const env = {
        ...process.env,
        ASPNETCORE_ENVIRONMENT: process.env.ASPNETCORE_ENVIRONMENT || "Development",
    };
    if (fs.existsSync(dllPath)) {
        return spawn("dotnet", ["FatCat.Api.dll", "--urls", apiUrl], {
            cwd: dllDir,
            windowsHide: true,
            stdio,
            env,
        });
    }

    const project = path.join(root, "FATCATServer", "FatCat.Api", "FatCat.Api.csproj");
    return spawn("dotnet", ["run", "--no-restore", "--project", project, "--urls", apiUrl], {
        cwd: root,
        windowsHide: true,
        stdio,
        env,
    });
}

module.exports = { startApiProcess };
