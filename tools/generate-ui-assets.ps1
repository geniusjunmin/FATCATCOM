Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Add-Type -AssemblyName System.Drawing

function New-Canvas {
    param([int]$Width = 256, [int]$Height = 256)
    $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $graphics.Clear([System.Drawing.Color]::Transparent)
    return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Brush($hex) {
    return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen($hex, [float]$width = 4) {
    $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($hex), $width)
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    return $pen
}

function Save-Asset($canvas, [string]$path) {
    $full = Join-Path $root $path
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $full) | Out-Null
    $canvas.Bitmap.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Graphics.Dispose()
    $canvas.Bitmap.Dispose()
}

function Draw-PanelBase($g, [string]$fill = "#d9b77f") {
    $g.FillEllipse((New-Brush "#5c3b25"), 16, 18, 224, 218)
    $g.FillEllipse((New-Brush $fill), 20, 16, 216, 216)
    $g.DrawEllipse((New-Pen "#7a4a2a" 8), 20, 16, 216, 216)
    $g.DrawArc((New-Pen "#fff0bd" 8), 42, 34, 170, 168, 205, 105)
}

function Draw-BeanIcon($path) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#ddb06d"
    $g.TranslateTransform(128, 128)
    $g.RotateTransform(25)
    $g.FillEllipse((New-Brush "#5a2d16"), -52, -70, 104, 140)
    $g.FillEllipse((New-Brush "#8c4b22"), -45, -63, 90, 126)
    $g.DrawBezier((New-Pen "#32180d" 8), -5, -60, 28, -22, -35, 24, 5, 60)
    $g.ResetTransform()
    Save-Asset $canvas $path
}

function Draw-FoodIcon($path) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#e5c17f"
    $g.FillEllipse((New-Brush "#8f4d24"), 72, 80, 112, 42)
    $g.FillRectangle((New-Brush "#e9eef3"), 74, 92, 108, 86)
    $g.FillRectangle((New-Brush "#c28a50"), 82, 125, 92, 53)
    $g.DrawRectangle((New-Pen "#6d4326" 7), 74, 92, 108, 86)
    Save-Asset $canvas $path
}

function Draw-CoinIcon($path) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#e2b965"
    $g.FillEllipse((New-Brush "#bf741b"), 58, 58, 140, 140)
    $g.FillEllipse((New-Brush "#ffd75c"), 66, 50, 124, 124)
    $font = [System.Drawing.Font]::new("Arial", 82, [System.Drawing.FontStyle]::Bold)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('$', $font, (New-Brush "#9a5a12"), [System.Drawing.RectangleF]::new(64, 50, 128, 124), $format)
    $font.Dispose()
    Save-Asset $canvas $path
}

function Draw-DiamondIcon($path) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#c9b7e8"
    $points = @(
        [System.Drawing.Point]::new(128, 42),
        [System.Drawing.Point]::new(196, 96),
        [System.Drawing.Point]::new(128, 204),
        [System.Drawing.Point]::new(60, 96)
    )
    $g.FillPolygon((New-Brush "#8b63d9"), $points)
    $g.DrawPolygon((New-Pen "#4c347d" 8), $points)
    $g.DrawLine((New-Pen "#d6c7ff" 6), 82, 96, 174, 96)
    $g.DrawLine((New-Pen "#d6c7ff" 5), 128, 42, 128, 204)
    Save-Asset $canvas $path
}

function Draw-FactoryProp($path, [string]$kind) {
    $canvas = New-Canvas 360 240
    $g = $canvas.Graphics
    $g.FillEllipse((New-Brush "#3a2a20"), 36, 172, 288, 42)
    if ($kind -eq "office") {
        $g.FillRectangle((New-Brush "#6f4b33"), 48, 118, 184, 52)
        $g.FillRectangle((New-Brush "#4b3327"), 66, 74, 86, 48)
        $g.FillRectangle((New-Brush "#222a31"), 78, 82, 62, 32)
        $g.FillRectangle((New-Brush "#d4a45e"), 172, 82, 82, 74)
        $g.FillRectangle((New-Brush "#6d4930"), 182, 94, 62, 10)
        $g.FillRectangle((New-Brush "#6d4930"), 182, 122, 62, 10)
        $g.FillEllipse((New-Brush "#5c8a4a"), 270, 94, 50, 54)
        $g.FillRectangle((New-Brush "#7d5635"), 282, 136, 28, 42)
        $g.DrawRectangle((New-Pen "#3b2a21" 5), 48, 118, 184, 52)
    } elseif ($kind -eq "roaster") {
        $g.FillEllipse((New-Brush "#3b2a21"), 70, 84, 168, 116)
        $g.FillEllipse((New-Brush "#b86d2e"), 62, 60, 168, 116)
        $g.DrawEllipse((New-Pen "#5a321d" 8), 62, 60, 168, 116)
        $g.FillRectangle((New-Brush "#734225"), 216, 126, 70, 52)
        $g.FillEllipse((New-Brush "#d99535"), 92, 92, 78, 46)
    } elseif ($kind -eq "silo") {
        foreach ($x in 62, 150, 238) {
            $g.FillRectangle((New-Brush "#8c7f69"), $x, 64, 58, 122)
            $g.FillEllipse((New-Brush "#c7b99c"), $x, 44, 58, 42)
            $g.DrawRectangle((New-Pen "#514437" 5), $x, 64, 58, 122)
        }
    } elseif ($kind -eq "mill") {
        $g.FillRectangle((New-Brush "#6c4b34"), 42, 136, 250, 30)
        $g.FillEllipse((New-Brush "#453329"), 106, 72, 132, 112)
        $g.FillEllipse((New-Brush "#b87333"), 94, 56, 132, 112)
        $g.DrawEllipse((New-Pen "#56331f" 7), 94, 56, 132, 112)
        $g.FillEllipse((New-Brush "#e3a24a"), 132, 96, 56, 42)
        $g.FillRectangle((New-Brush "#3f3028"), 228, 98, 74, 76)
        $g.FillEllipse((New-Brush "#8a4b24"), 52, 148, 228, 26)
        $g.DrawLine((New-Pen "#d39240" 6), 66, 162, 270, 162)
    } elseif ($kind -eq "cafe") {
        $g.FillRectangle((New-Brush "#704b31"), 42, 126, 232, 50)
        $g.FillRectangle((New-Brush "#9b6940"), 58, 82, 92, 54)
        $g.FillRectangle((New-Brush "#3d2e25"), 166, 74, 86, 78)
        $g.FillEllipse((New-Brush "#f4e3c3"), 78, 94, 34, 24)
        $g.DrawEllipse((New-Pen "#8e6039" 6), 78, 94, 34, 24)
        $g.FillRectangle((New-Brush "#e9d1a6"), 176, 86, 44, 42)
        $g.DrawEllipse((New-Pen "#8e6039" 5), 214, 98, 24, 20)
        $g.FillRectangle((New-Brush "#3a2a21"), 262, 94, 38, 74)
        $g.FillEllipse((New-Brush "#d28b35"), 248, 150, 64, 24)
    } else {
        $g.FillRectangle((New-Brush "#8d6847"), 42, 82, 132, 102)
        $g.FillRectangle((New-Brush "#4e3527"), 52, 96, 112, 18)
        $g.FillRectangle((New-Brush "#4e3527"), 52, 130, 112, 18)
        $g.FillEllipse((New-Brush "#d2ad71"), 216, 104, 72, 92)
        $g.FillEllipse((New-Brush "#d2ad71"), 262, 92, 62, 104)
    }
    Save-Asset $canvas $path
}

function Draw-FeatureIcon($path, [string]$kind) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#d8bd91"
    if ($kind -eq "mail") {
        $g.FillRectangle((New-Brush "#fff3dc"), 58, 82, 140, 96)
        $g.DrawRectangle((New-Pen "#7a4a2a" 8), 58, 82, 140, 96)
        $g.DrawLine((New-Pen "#c98946" 8), 62, 86, 128, 142)
        $g.DrawLine((New-Pen "#c98946" 8), 194, 86, 128, 142)
    } elseif ($kind -eq "friend") {
        $g.FillEllipse((New-Brush "#f0c28b"), 62, 70, 62, 62)
        $g.FillEllipse((New-Brush "#f0c28b"), 132, 70, 62, 62)
        $g.FillEllipse((New-Brush "#7a4a2a"), 48, 124, 86, 70)
        $g.FillEllipse((New-Brush "#7a4a2a"), 120, 124, 86, 70)
    } elseif ($kind -eq "achievement") {
        $g.FillRectangle((New-Brush "#d99628"), 76, 72, 104, 86)
        $g.FillRectangle((New-Brush "#865817"), 116, 152, 24, 42)
        $g.FillRectangle((New-Brush "#865817"), 88, 188, 80, 18)
        $g.DrawRectangle((New-Pen "#865817" 8), 76, 72, 104, 86)
    } else {
        $g.FillEllipse((New-Brush "#7a4a2a"), 72, 72, 112, 112)
        $g.FillEllipse((New-Brush "#d8bd91"), 104, 104, 48, 48)
        for ($i = 0; $i -lt 8; $i++) {
            $angle = $i * 45
            $g.TranslateTransform(128, 128)
            $g.RotateTransform($angle)
            $g.FillRectangle((New-Brush "#7a4a2a"), -9, -86, 18, 34)
            $g.ResetTransform()
        }
    }
    Save-Asset $canvas $path
}

function Draw-CatPortrait($path, [string]$coat, [string]$accent, [string]$prop) {
    $canvas = New-Canvas 512 512
    $g = $canvas.Graphics
    $g.FillEllipse((New-Brush "#3b2a21"), 122, 390, 270, 42)
    $g.FillEllipse((New-Brush "#fff0cf"), 82, 62, 348, 396)
    $g.FillEllipse((New-Brush $coat), 104, 74, 304, 358)
    $g.DrawEllipse((New-Pen "#6b432b" 10), 104, 74, 304, 358)
    $g.FillPie((New-Brush $coat), 132, 48, 92, 104, 205, 126)
    $g.FillPie((New-Brush $coat), 288, 48, 92, 104, 210, 126)
    $g.FillPie((New-Brush "#f3b88e"), 150, 72, 52, 58, 220, 100)
    $g.FillPie((New-Brush "#f3b88e"), 310, 72, 52, 58, 220, 100)
    $g.FillEllipse((New-Brush "#fff7df"), 150, 206, 212, 166)
    $g.FillEllipse((New-Brush $accent), 138, 112, 86, 84)
    $g.FillEllipse((New-Brush $accent), 288, 126, 78, 72)
    $g.FillEllipse((New-Brush "#3c271b"), 194, 186, 24, 26)
    $g.FillEllipse((New-Brush "#3c271b"), 294, 186, 24, 26)
    $g.FillEllipse((New-Brush "#8b4b30"), 248, 222, 26, 18)
    $g.DrawArc((New-Pen "#6d3b24" 5), 220, 226, 44, 36, 8, 150)
    $g.DrawArc((New-Pen "#6d3b24" 5), 260, 226, 44, 36, 22, 150)
    $g.DrawLine((New-Pen "#8c5a38" 4), 178, 232, 112, 216)
    $g.DrawLine((New-Pen "#8c5a38" 4), 178, 252, 108, 254)
    $g.DrawLine((New-Pen "#8c5a38" 4), 334, 232, 400, 216)
    $g.DrawLine((New-Pen "#8c5a38" 4), 334, 252, 404, 254)
    $g.FillEllipse((New-Brush "#fff7df"), 156, 364, 72, 64)
    $g.FillEllipse((New-Brush "#fff7df"), 284, 364, 72, 64)
    if ($prop -eq "cup") {
        $g.FillRectangle((New-Brush "#3f7357"), 214, 306, 84, 70)
        $g.DrawRectangle((New-Pen "#284a38" 7), 214, 306, 84, 70)
        $g.DrawEllipse((New-Pen "#284a38" 7), 288, 322, 34, 32)
        $g.FillEllipse((New-Brush "#e7c07c"), 242, 326, 28, 22)
    } elseif ($prop -eq "goggles") {
        $g.DrawEllipse((New-Pen "#4f3b2b" 8), 170, 172, 64, 44)
        $g.DrawEllipse((New-Pen "#4f3b2b" 8), 278, 172, 64, 44)
        $g.DrawLine((New-Pen "#4f3b2b" 7), 234, 194, 278, 194)
        $g.FillRectangle((New-Brush "#7e553b"), 208, 326, 96, 32)
    } elseif ($prop -eq "jar") {
        $g.FillRectangle((New-Brush "#d8e8ee"), 216, 306, 80, 78)
        $g.FillRectangle((New-Brush "#d49b4d"), 224, 344, 64, 40)
        $g.DrawRectangle((New-Pen "#6a4a34" 7), 216, 306, 80, 78)
    } else {
        $g.FillRectangle((New-Brush "#54724f"), 182, 300, 148, 38)
        $g.FillEllipse((New-Brush "#d99a34"), 242, 328, 28, 28)
    }
    Save-Asset $canvas $path
}

function Draw-EquipIcon($path, [string]$kind) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#e3c18d"
    if ($kind -eq "collar") {
        $g.FillEllipse((New-Brush "#536f4b"), 62, 58, 132, 132)
        $g.FillEllipse((New-Brush "#e3c18d"), 86, 82, 84, 84)
        $g.DrawEllipse((New-Pen "#2f472d" 9), 62, 58, 132, 132)
        $g.FillEllipse((New-Brush "#d79a33"), 112, 154, 32, 42)
    } elseif ($kind -eq "cup") {
        $g.FillRectangle((New-Brush "#4f8b6a"), 72, 82, 102, 92)
        $g.FillRectangle((New-Brush "#eaf4ec"), 72, 82, 102, 24)
        $g.DrawRectangle((New-Pen "#315840" 8), 72, 82, 102, 92)
        $g.DrawEllipse((New-Pen "#315840" 8), 166, 104, 36, 46)
    } elseif ($kind -eq "cushion") {
        $g.FillEllipse((New-Brush "#5d5144"), 58, 92, 140, 92)
        $g.FillEllipse((New-Brush "#9b8a75"), 72, 82, 112, 76)
        $g.DrawEllipse((New-Pen "#4d4136" 8), 58, 92, 140, 92)
    } else {
        $g.FillRectangle((New-Brush "#8b765c"), 74, 104, 108, 86)
        $g.DrawRectangle((New-Pen "#5c4b38" 8), 74, 104, 108, 86)
        $g.DrawArc((New-Pen "#5c4b38" 10), 94, 54, 68, 82, 185, 170)
    }
    Save-Asset $canvas $path
}

function Draw-SkillIcon($path, [string]$kind) {
    $canvas = New-Canvas
    $g = $canvas.Graphics
    Draw-PanelBase $g "#f0cb7d"
    if ($kind -eq "producer") {
        $g.FillEllipse((New-Brush "#5a2d16"), 78, 82, 78, 112)
        $g.FillEllipse((New-Brush "#8c4b22"), 86, 72, 82, 116)
        $g.DrawBezier((New-Pen "#32180d" 7), 124, 82, 158, 118, 92, 146, 130, 184)
        $g.FillEllipse((New-Brush "#ffd75c"), 132, 116, 62, 62)
    } elseif ($kind -eq "launcher") {
        $g.FillPolygon((New-Brush "#d9492f"), @(
            [System.Drawing.Point]::new(134, 48),
            [System.Drawing.Point]::new(182, 178),
            [System.Drawing.Point]::new(82, 178)
        ))
        $g.FillRectangle((New-Brush "#f3efe1"), 104, 130, 58, 48)
        $g.FillEllipse((New-Brush "#6aa7c8"), 116, 96, 34, 34)
        $g.FillEllipse((New-Brush "#f0a51c"), 112, 174, 44, 38)
    } elseif ($kind -eq "saver") {
        $g.FillRectangle((New-Brush "#d8e8ee"), 82, 72, 96, 118)
        $g.FillRectangle((New-Brush "#d49b4d"), 92, 128, 76, 62)
        $g.DrawRectangle((New-Pen "#6a4a34" 8), 82, 72, 96, 118)
    } else {
        $g.FillEllipse((New-Brush "#7f5b98"), 74, 80, 108, 108)
        $g.FillEllipse((New-Brush "#fff2d5"), 104, 110, 48, 48)
        $g.DrawLine((New-Pen "#ffd75c" 9), 128, 46, 128, 206)
        $g.DrawLine((New-Pen "#ffd75c" 9), 50, 128, 206, 128)
    }
    Save-Asset $canvas $path
}

Draw-BeanIcon "FATCATUI/assets/resources/textures/generated/items/icon_coffee_bean.png"
Draw-FoodIcon "FATCATUI/assets/resources/textures/generated/items/icon_cat_food.png"
Draw-CoinIcon "FATCATUI/assets/resources/textures/generated/items/icon_coin_pack.png"
Draw-DiamondIcon "FATCATUI/assets/resources/textures/generated/items/icon_diamond.png"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_office.png" "office"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_roaster.png" "roaster"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_silos.png" "silo"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_mill.png" "mill"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_cafe.png" "cafe"
Draw-FactoryProp "FATCATUI/assets/resources/textures/generated/factory/prop_storage.png" "storage"
Draw-FeatureIcon "FATCATUI/assets/resources/textures/generated/ui/icon_mail.png" "mail"
Draw-FeatureIcon "FATCATUI/assets/resources/textures/generated/ui/icon_friend.png" "friend"
Draw-FeatureIcon "FATCATUI/assets/resources/textures/generated/ui/icon_achievement.png" "achievement"
Draw-FeatureIcon "FATCATUI/assets/resources/textures/generated/ui/icon_settings.png" "settings"
Draw-CatPortrait "FATCATUI/assets/resources/textures/generated/cats/cat_full_orange.png" "#df8c42" "#f5bd72" "cup"
Draw-CatPortrait "FATCATUI/assets/resources/textures/generated/cats/cat_full_black.png" "#34302c" "#f0d0a0" "goggles"
Draw-CatPortrait "FATCATUI/assets/resources/textures/generated/cats/cat_full_white.png" "#f2eadc" "#c9b29b" "jar"
Draw-CatPortrait "FATCATUI/assets/resources/textures/generated/cats/cat_full_calico.png" "#e4a05b" "#3b3029" "scarf"
Draw-CatPortrait "FATCATUI/assets/resources/textures/generated/cats/cat_full_tuxedo.png" "#2f2f31" "#ffffff" "scarf"
Draw-EquipIcon "FATCATUI/assets/resources/textures/generated/items/equip_collar.png" "collar"
Draw-EquipIcon "FATCATUI/assets/resources/textures/generated/items/equip_cup.png" "cup"
Draw-EquipIcon "FATCATUI/assets/resources/textures/generated/items/equip_cushion.png" "cushion"
Draw-EquipIcon "FATCATUI/assets/resources/textures/generated/items/equip_locked.png" "lock"
Draw-SkillIcon "FATCATUI/assets/resources/textures/generated/ui/skill_producer.png" "producer"
Draw-SkillIcon "FATCATUI/assets/resources/textures/generated/ui/skill_launcher.png" "launcher"
Draw-SkillIcon "FATCATUI/assets/resources/textures/generated/ui/skill_saver.png" "saver"
Draw-SkillIcon "FATCATUI/assets/resources/textures/generated/ui/skill_support.png" "support"

& (Join-Path $PSScriptRoot "generate-factory-prop-data-uris.ps1")
& (Join-Path $PSScriptRoot "generate-dom-asset-data-uris.ps1")

Write-Host "Generated local UI assets."
