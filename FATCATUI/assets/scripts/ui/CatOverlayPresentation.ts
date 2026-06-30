export function getDomCatStyles(catWorkshopDataUri: string): string {
    return `
            #fatcat-dom-cat-overlay { position: fixed; z-index: 2147483300; display: none; pointer-events: none; color: #fff3d8; font-family: Arial, sans-serif; overflow: visible; }
            #fatcat-dom-cat-overlay:before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 18%, rgba(255,205,122,.1), transparent 34%), rgba(20,13,10,.82); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-bg { position: absolute; inset: 0; background: linear-gradient(rgba(38,27,20,.08), rgba(38,27,20,.18)), linear-gradient(135deg,#7b5234,#2a1d15); border: 0; box-sizing: border-box; padding: 8.9% 2.7% 16.2% 11.5%; border-radius: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; pointer-events: auto; scrollbar-width: none; box-shadow: inset 0 0 0 3px rgba(255,231,181,.12), inset 0 -30px 56px rgba(28,18,13,.28); }
            #fatcat-dom-cat-overlay .cat-bg::-webkit-scrollbar { width: 0; height: 0; }
            #fatcat-dom-cat-overlay .cat-art-bg { position: absolute; inset: 0; background-color:#3b261b; background-image: radial-gradient(circle at 52% 22%, rgba(255,199,107,.24), transparent 24%), radial-gradient(circle at 80% 17%, rgba(120,184,220,.16), transparent 18%), linear-gradient(rgba(28,18,13,.18),rgba(28,18,13,.52)); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; filter: saturate(1.05) contrast(1.02) brightness(.9); opacity:.82; }
            #fatcat-dom-cat-overlay .cat-art-bg:before { content:""; position:absolute; left:11%; right:4%; top:9%; height:21%; border-radius:18px; background:radial-gradient(circle at 20% 18%, rgba(255,218,128,.22), transparent 12%), radial-gradient(circle at 62% 18%, rgba(255,218,128,.18), transparent 13%), linear-gradient(90deg, transparent 0 24%, rgba(45,30,21,.28) 24% 25%, transparent 25% 50%, rgba(45,30,21,.28) 50% 51%, transparent 51% 76%, rgba(45,30,21,.28) 76% 77%, transparent 77%); box-shadow:inset 0 -10px 18px rgba(24,15,10,.18); }
            #fatcat-dom-cat-overlay .cat-art-bg:after { content:""; position:absolute; right:5%; top:10%; width:16%; height:23%; border-radius:12px; background:linear-gradient(rgba(191,233,255,.48),rgba(127,176,209,.38)); box-shadow:inset 0 0 0 3px rgba(62,40,25,.38); opacity:.45; }
            #fatcat-dom-cat-overlay .cat-bg::before { content: ""; position: absolute; left: 9%; right: 0; top: 0; height: 34%; background: radial-gradient(ellipse at 48% 4%, rgba(255,221,136,.32), transparent 34%), linear-gradient(rgba(255,224,150,.16), rgba(255,202,115,0)); opacity: .82; }
            #fatcat-dom-cat-overlay .cat-bg::after { content: ""; position: absolute; left: 10%; right: 2%; top: 13%; height: 25%; border-radius: 12px; background: radial-gradient(circle at 50% 48%, rgba(237,158,77,.18) 0 10%, transparent 11%); box-shadow: inset 0 -6px 0 rgba(44,29,22,.12); }
            #fatcat-dom-cat-overlay .cat-bg:has(.cat-side)::selection { background: rgba(236,171,73,.35); }
            #fatcat-dom-cat-overlay .cat-bg > * { position: relative; z-index: 1; }
            #fatcat-dom-cat-overlay .cat-page-hud { position:absolute; z-index:6; left:1.6%; right:1.6%; top:.8%; height:7.0%; display:grid; grid-template-columns:26% repeat(4,1fr); gap:1.1%; align-items:stretch; pointer-events:none; font-size:2%; }
            #fatcat-dom-cat-overlay .cat-page-hud .player { position:relative; height:100%; min-height:0; box-sizing:border-box; border-radius:18px; background:linear-gradient(#e9d0a5,#8a6a4b); border:3px solid #5a402b; color:#3d281c; font-size:.96em; line-height:1; font-weight:900; display:grid; grid-template-columns:34% 1fr; align-items:center; padding:4px 10px; box-shadow:0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,248,220,.36); }
            #fatcat-dom-cat-overlay .cat-page-hud .player span { display:flex; min-width:0; flex-direction:column; justify-content:center; gap:5px; white-space:nowrap; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-page-hud .avatar { width:min(42px,88%); aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 6%,transparent 7%), radial-gradient(circle at 66% 45%,#3d281d 0 6%,transparent 7%), linear-gradient(#f3c27e,#d27c37); box-shadow:0 0 0 3px #7a5131 inset, 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-cat-overlay .cat-page-hud .level { position:absolute; left:2%; bottom:-10%; width:min(30px,24%); aspect-ratio:1; border-radius:50%; background:linear-gradient(#f0b04a,#9c5a1b); color:white; display:flex; align-items:center; justify-content:center; border:3px solid #5c351d; font-size:.88em; }
            #fatcat-dom-cat-overlay .cat-page-hud .exp { height:7px; border-radius:999px; background:#3f2a1c; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(0,0,0,.3); }
            #fatcat-dom-cat-overlay .cat-page-hud .exp i { display:block; width:80%; height:100%; background:linear-gradient(#ffd65c,#d98d1f); }
            #fatcat-dom-cat-overlay .cat-page-hud .res { position:relative; height:100%; min-height:0; box-sizing:border-box; border-radius:999px; background:linear-gradient(rgba(71,50,35,.96),rgba(31,23,18,.96)); border:3px solid #8a6a48; display:flex; align-items:center; justify-content:center; gap:6%; color:#fff5dd; font-size:1.08em; line-height:1; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.32), inset 0 0 0 2px rgba(255,232,184,.1); }
            #fatcat-dom-cat-overlay .cat-page-hud .res i { width:min(28px,24%); aspect-ratio:1; flex:0 0 auto; border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px rgba(98,61,17,.35); }
            #fatcat-dom-cat-overlay .cat-page-hud .bean i { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); }
            #fatcat-dom-cat-overlay .cat-page-hud .food i { border-radius:0 0 38% 38%; background:linear-gradient(#f4ead7 0 35%,#9f5a22 36%); }
            #fatcat-dom-cat-overlay .cat-page-hud .gem i { border-radius:28%; background:linear-gradient(135deg,#e4b7ff,#7938c9); transform:rotate(45deg); }
            #fatcat-dom-cat-overlay .cat-page-hud .plus { position:absolute; right:-2%; width:min(28px,24%); aspect-ratio:1; border-radius:8px; background:linear-gradient(#ffbd4f,#d46f1f); color:white; display:flex; align-items:center; justify-content:center; border:2px solid #683919; font-size:1.1em; }
            #fatcat-dom-cat-overlay .cat-modal-title { display:none; }
            #fatcat-dom-cat-overlay .close-x { position:absolute; z-index:5; right:1.7%; top:1.1%; width:6.4%; min-width:46px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f7ce71,#d48626); color:white; border:3px solid #5b351d; font-size:3.4%; font-weight:900; line-height:1; box-shadow:0 4px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,238,193,.2); }
            #fatcat-dom-cat-overlay .cat-side { position: absolute; left: 1.65%; top: 10.1%; width: 8.4%; display: grid; gap: 1.15%; padding:.8% .55%; border-radius:18px; background:linear-gradient(rgba(82,58,42,.78),rgba(45,32,25,.82)); border:2px solid rgba(238,198,126,.22); box-shadow:0 6px 0 rgba(22,14,10,.24), inset 0 0 0 2px rgba(255,239,201,.06); }
            #fatcat-dom-cat-overlay .cat-side:before { content:""; position:absolute; left:12%; right:12%; top:1%; height:7%; border-radius:999px; background:linear-gradient(90deg, rgba(255,243,205,.28), rgba(255,243,205,0)); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-overview-head { display:none; grid-template-columns:repeat(4,1fr); gap:1.1%; margin:0 0 1.1%; }
            #fatcat-dom-cat-overlay .cat-overview-head div { min-height:58px; border-radius:14px; background:linear-gradient(rgba(91,65,45,.94),rgba(49,34,25,.94)); border:3px solid rgba(233,188,112,.36); color:#fff5d8; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:1.75%; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.25), inset 0 0 0 2px rgba(255,236,190,.08); }
            #fatcat-dom-cat-overlay .cat-overview-head b { color:#ffffff; font-size:142%; line-height:1; text-shadow:0 2px rgba(0,0,0,.28); }
            #fatcat-dom-cat-overlay .cat-overview-head span { margin-top:4px; color:#f4d6a5; font-size:82%; }
            #fatcat-dom-cat-overlay button { border: 0; font: inherit; cursor: pointer; pointer-events: auto; }
            #fatcat-dom-cat-overlay .back, #fatcat-dom-cat-overlay .side-tab { min-height: 60px; border-radius: 14px; background: linear-gradient(#927657,#50392a); border: 3px solid #3b2b20; color:#fff3d8; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 1.9%; font-weight: 900; box-shadow: 0 4px 0 rgba(0,0,0,.32), inset 0 0 0 2px rgba(255,235,190,.1); transition:transform .12s ease, filter .12s ease; }
            #fatcat-dom-cat-overlay .back:active, #fatcat-dom-cat-overlay .side-tab:active { transform:translateY(2px); filter:brightness(.96); }
            #fatcat-dom-cat-overlay .back { font-size: 6%; }
            #fatcat-dom-cat-overlay .side-tab { flex-direction:column; gap:5%; }
            #fatcat-dom-cat-overlay .side-tab i { position:relative; width:44%; aspect-ratio:1; border-radius:10px; background:#f2ddb7; box-shadow:inset 0 0 0 2px rgba(88,58,32,.2); }
            #fatcat-dom-cat-overlay .side-tab i:before, #fatcat-dom-cat-overlay .side-tab i:after { content:""; position:absolute; }
            #fatcat-dom-cat-overlay .side-tab.active { background: linear-gradient(#ffd47a,#d68b29); color: #fff; box-shadow:0 0 18px rgba(242,168,45,.42), 0 4px 0 rgba(105,59,18,.42), inset 0 0 0 2px rgba(255,249,224,.24); }
            #fatcat-dom-cat-overlay .side-tab.active:after { content:""; position:absolute; right:-9%; top:34%; width:0; height:0; border-top:9px solid transparent; border-bottom:9px solid transparent; border-left:10px solid #d68b29; filter:drop-shadow(2px 1px 0 rgba(57,34,18,.26)); }
            #fatcat-dom-cat-overlay .tab-info i:before { left:21%; top:19%; width:58%; height:58%; border-radius:50%; background:#d9904d; box-shadow:inset 0 0 0 3px #75472a; }
            #fatcat-dom-cat-overlay .tab-info i:after { left:36%; top:39%; width:28%; height:22%; border-radius:50%; background:radial-gradient(circle at 25% 45%,#3d281d 0 18%,transparent 19%), radial-gradient(circle at 75% 45%,#3d281d 0 18%,transparent 19%); }
            #fatcat-dom-cat-overlay .tab-upgrade i:before { left:40%; top:18%; width:20%; height:62%; background:#77a94a; }
            #fatcat-dom-cat-overlay .tab-upgrade i:after { left:26%; top:16%; width:48%; height:34%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#77a94a; }
            #fatcat-dom-cat-overlay .tab-skill i:before { inset:18%; border-radius:50%; background:radial-gradient(circle,#ffe66a 0 18%,#d8871e 19% 55%,transparent 56%); box-shadow:0 0 9px #ffc857; }
            #fatcat-dom-cat-overlay .tab-equip i:before { inset:20%; border-radius:50%; background:radial-gradient(circle at 50% 54%, transparent 0 35%, #617b50 36% 57%, #34442b 58%); box-shadow:inset 0 0 0 4px #8e9d79; }
            #fatcat-dom-cat-overlay .tab-skin i:before { left:22%; right:22%; top:18%; height:58%; border-radius:46% 46% 28% 28%; background:#f0c188; box-shadow:inset 0 0 0 3px #875430; }
            #fatcat-dom-cat-overlay .cat-hero { display: grid; grid-template-columns: 23% 1fr 22%; gap: 2%; align-items: start; margin-top:0; }
            #fatcat-dom-cat-overlay .cat-card, #fatcat-dom-cat-overlay .cat-portrait, #fatcat-dom-cat-overlay .cat-power, #fatcat-dom-cat-overlay .cat-stats, #fatcat-dom-cat-overlay .cat-weight, #fatcat-dom-cat-overlay .cat-grid > div, #fatcat-dom-cat-overlay .cat-list, #fatcat-dom-cat-overlay .cat-story { background: radial-gradient(circle at 18% 14%, rgba(255,255,255,.34), transparent 16%), repeating-linear-gradient(135deg, rgba(120,82,45,.045) 0 2px, transparent 2px 7px), linear-gradient(rgba(255,248,230,.94), rgba(225,192,140,.94)); color: #4a2f1f; border: 3px solid #7b5636; border-radius: 14px; box-shadow: inset 0 0 0 2px rgba(255,250,224,.45), inset 0 -12px 22px rgba(143,91,42,.1), 0 5px 0 rgba(0,0,0,.25); box-sizing: border-box; }
            #fatcat-dom-cat-overlay .cat-card { position:relative; padding: 7%; font-size: 2.4%; line-height: 1.45; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-card:after { content:""; position:absolute; left:7%; right:7%; top:7%; height:2px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-card.info { min-height:168px; background:radial-gradient(circle at 18% 12%, rgba(255,255,255,.42), transparent 18%), repeating-linear-gradient(135deg, rgba(120,82,45,.05) 0 2px, transparent 2px 8px), linear-gradient(#fff7df,#e7c18d); }
            #fatcat-dom-cat-overlay .cat-card.info:before { content:""; position:absolute; right:-12%; top:-18%; width:54%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(240,165,28,.22),rgba(240,165,28,0) 68%); }
            #fatcat-dom-cat-overlay .cat-card.info strong { display:inline-flex; align-items:center; max-width:100%; box-sizing:border-box; min-height:34px; padding:0 12%; border-radius:999px; background:rgba(255,252,232,.72); white-space:nowrap; word-break:keep-all; box-shadow:inset 0 0 0 2px rgba(121,82,45,.16), 0 2px 0 rgba(92,56,28,.12); }
            #fatcat-dom-cat-overlay .cat-card.info strong:after { content:""; flex:0 0 auto; width:18px; height:18px; margin-left:8px; border-radius:4px; background:linear-gradient(135deg, transparent 0 42%, #8a623d 43% 57%, transparent 58%), linear-gradient(#f6d28b,#c58b42); box-shadow:inset 0 0 0 2px rgba(112,70,32,.18); }
            #fatcat-dom-cat-overlay .cat-card strong { font-size: 140%; }
            #fatcat-dom-cat-overlay .rank { font-size: 250%; color: #f3a51c; font-weight: 900; }
            #fatcat-dom-cat-overlay .type { background: #68a84a; color: white; padding: 1% 5%; border-radius: 999px; font-weight: 900; }
            #fatcat-dom-cat-overlay .cat-portrait { position: relative; height: 34%; min-height: 342px; display: flex; align-items: center; justify-content: center; flex-direction: column; font-size: 7%; font-weight: 900; background: radial-gradient(circle at 50% 76%, rgba(246,194,123,.66) 0 26%, transparent 27%), linear-gradient(rgba(250,225,184,.32),rgba(230,192,136,.68)); overflow: hidden; }
            #fatcat-dom-cat-overlay .cat-portrait:before { content:""; position:absolute; inset:3%; border-radius:12px; background-image:linear-gradient(rgba(39,25,17,.12),rgba(39,25,17,.32)), url("${catWorkshopDataUri}"); background-size:cover; background-position:center 42%; opacity:.74; filter:saturate(1.08) brightness(1.02); }
            #fatcat-dom-cat-overlay .cat-portrait:after { content:""; position:absolute; left:13%; right:13%; bottom:9%; height:24%; border-radius:50%; background:radial-gradient(ellipse,rgba(77,45,24,.38),rgba(77,45,24,0) 70%); box-shadow:0 -18px 48px rgba(255,198,96,.1); }
            #fatcat-dom-cat-overlay .portrait-cat { position: relative; z-index:2; width: 34%; min-width: 108px; aspect-ratio: .92; margin-top: 1%; filter: drop-shadow(0 7px 0 rgba(72,45,28,.24)); }
            #fatcat-dom-cat-overlay .portrait-cat::before { content: ""; position: absolute; left: 17%; right: 17%; bottom: 2%; height: 64%; border-radius: 48% 48% 38% 38%; background: radial-gradient(circle at 34% 28%, #fff2d5 0 13%, transparent 14%), radial-gradient(circle at 67% 28%, #fff2d5 0 13%, transparent 14%), linear-gradient(#f1a14b,#d17b35); box-shadow: inset -13px -9px 0 rgba(111,62,30,.14); }
            #fatcat-dom-cat-overlay .portrait-cat::after { content: ""; position: absolute; left: 23%; top: 2%; width: 54%; height: 50%; border-radius: 50%; background: radial-gradient(circle at 35% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 65% 45%, #3f271b 0 5%, transparent 6%), radial-gradient(circle at 50% 59%, #8b4a2a 0 6%, transparent 7%), linear-gradient(#ffd198,#df8c42); box-shadow: -16px -11px 0 -8px #6b4228, 16px -11px 0 -8px #6b4228, inset 10px -4px 0 rgba(255,255,255,.3); }
            #fatcat-dom-cat-overlay .portrait-cat.img { width: 72%; min-width: 232px; background: center/contain no-repeat; aspect-ratio: 1; }
            #fatcat-dom-cat-overlay .portrait-cat.img::before, #fatcat-dom-cat-overlay .portrait-cat.img::after { display: none; }
            #fatcat-dom-cat-overlay .portrait-name { position:relative; z-index:2; margin-top: -1%; font-size: 68%; color: #4a2f1f; text-shadow: 0 2px #fff0cd; }
            #fatcat-dom-cat-overlay .cat-portrait span { position:relative; z-index:2; margin-top: 1%; padding: 1.5% 4%; border-radius: 12px; background: #fff2d5; border:2px solid rgba(117,82,47,.25); font-size: 28%; font-weight: 700; }
            #fatcat-dom-cat-overlay .cat-portrait .cat-talk { position:absolute; z-index:3; right:7%; top:9%; max-width:40%; text-align:left; box-shadow:0 3px 0 rgba(91,59,31,.12); background:linear-gradient(#fff8e8,#f2d5a5); }
            #fatcat-dom-cat-overlay .cat-portrait .cat-talk:after { content:""; position:absolute; left:14%; bottom:-12px; width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:14px solid #fff2d5; filter:drop-shadow(0 2px 0 rgba(91,59,31,.12)); }
            #fatcat-dom-cat-overlay .cat-profile-row { position:absolute; left:9%; right:9%; bottom:4%; display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; font-size:24%; }
            #fatcat-dom-cat-overlay .cat-profile-row em { padding:2.2% 3%; border-radius:999px; background:rgba(67,43,29,.82); color:#fff0c4; border:2px solid rgba(255,229,166,.22); font-style:normal; text-align:center; text-shadow:none; }
            #fatcat-dom-cat-overlay .cat-index { position:absolute; left:4%; top:5%; padding:1.2% 3.2%; border-radius:999px; background:rgba(66,42,28,.84); color:#ffe2a6; border:2px solid rgba(255,228,168,.26); font-size:24%; font-weight:900; }
            #fatcat-dom-cat-overlay .cat-switch { position:absolute; z-index:3; top:43%; width:8.5%; min-width:42px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffe1a0,#d98c2b); color:#72411e; border:3px solid #7c4d2b; font-size:4.6%; font-weight:900; box-shadow:0 4px 0 rgba(82,49,25,.28), inset 0 0 0 2px rgba(255,247,214,.26); }
            #fatcat-dom-cat-overlay .cat-switch.prev { left:3.5%; }
            #fatcat-dom-cat-overlay .cat-switch.next { right:3.5%; }
            #fatcat-dom-cat-overlay .mood, #fatcat-dom-cat-overlay .feed { position:relative; margin-bottom: 6%; text-align: center; background:linear-gradient(#6b4b34,#3c2a20); color:#fff4d8; border-color:#9b744d; padding-top:22%; }
            #fatcat-dom-cat-overlay .mood:before, #fatcat-dom-cat-overlay .feed:before { content:""; position:absolute; left:50%; top:10%; width:25%; aspect-ratio:1; transform:translateX(-50%); border-radius:50%; background:linear-gradient(#ffd86f,#cc8322); box-shadow:inset 0 0 0 3px rgba(92,55,22,.26), 0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .mood:after { content:""; position:absolute; left:42%; top:17%; width:16%; height:9%; border-radius:0 0 999px 999px; border-bottom:3px solid #7b411c; box-shadow:-8px -5px 0 -5px #7b411c, 8px -5px 0 -5px #7b411c; }
            #fatcat-dom-cat-overlay .feed:before { border-radius:18% 18% 42% 42%; background:linear-gradient(#f5e6c8 0 30%,#c8843d 31%); }
            #fatcat-dom-cat-overlay .feed:after { content:""; position:absolute; left:43%; top:18%; width:14%; height:8%; border-radius:999px; background:#7b411c; box-shadow:9px 2px 0 -2px #7b411c, -9px 2px 0 -2px #7b411c; }
            #fatcat-dom-cat-overlay .mood strong, #fatcat-dom-cat-overlay .feed strong { color:#fff; font-size:155%; text-shadow:0 2px rgba(0,0,0,.32); }
            #fatcat-dom-cat-overlay .feed button, #fatcat-dom-cat-overlay .action-btn { margin-top: 6%; padding: 4% 12%; border-radius: 999px; background: linear-gradient(#82b94d,#4f8e32); color:white; font-weight:900; box-shadow:0 3px 0 rgba(39,74,24,.45); }
            #fatcat-dom-cat-overlay .feed button:disabled, #fatcat-dom-cat-overlay .action-btn:disabled { background:#8f8068; box-shadow:none; }
            #fatcat-dom-cat-overlay .cat-power { margin: 1.0% auto 1.0%; width: 42%; padding: .95%; text-align: center; background: linear-gradient(#6a482c,#372419); color: white; font-size: 3.1%; font-weight: 900; border-color:#9b744d; }
            #fatcat-dom-cat-overlay .cat-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: .75%; padding: .95%; margin-top: .85%; font-size: 1.72%; text-align: center; }
            #fatcat-dom-cat-overlay .cat-stats div { min-height:54px; border-right:1px solid rgba(121,84,48,.18); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:3%; border-radius:10px; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.34), transparent 30%), linear-gradient(rgba(255,252,235,.46),rgba(215,177,117,.18)); box-shadow:inset 0 0 0 1px rgba(124,87,50,.1), 0 2px 0 rgba(82,51,27,.08); }
            #fatcat-dom-cat-overlay .cat-stats div:last-child { border-right:0; }
            #fatcat-dom-cat-overlay .cat-stats b { color:#3f281a; font-size:112%; }
            #fatcat-dom-cat-overlay .stat-icon { position:relative; display:block; width:23%; max-width:30px; aspect-ratio:1; margin-bottom:1%; filter:drop-shadow(0 2px 0 rgba(91,54,26,.22)); }
            #fatcat-dom-cat-overlay .stat-icon.bean { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); }
            #fatcat-dom-cat-overlay .stat-icon.food { border-radius:0 0 36% 36%; background:linear-gradient(#e8f1f8 0 42%,#b78c5a 43%); }
            #fatcat-dom-cat-overlay .stat-icon.coin { border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; }
            #fatcat-dom-cat-overlay .stat-icon.weight { border-radius:50% 50% 42% 42%; background:linear-gradient(#94b6c5,#4d7a8c); }
            #fatcat-dom-cat-overlay .stat-icon.paw { border-radius:50%; background:radial-gradient(circle at 50% 62%,#6b4a35 0 18%,transparent 19%), radial-gradient(circle at 28% 34%,#6b4a35 0 14%,transparent 15%), radial-gradient(circle at 50% 25%,#6b4a35 0 14%,transparent 15%), radial-gradient(circle at 72% 34%,#6b4a35 0 14%,transparent 15%); }
            #fatcat-dom-cat-overlay .cat-weight { padding: 1.25% 1.55%; margin-top: .85%; font-size: 2.05%; }
            #fatcat-dom-cat-overlay .weight-row { display: grid; grid-template-columns: 15% 15% 15% 1fr 12%; gap: 1.1%; align-items: center; margin-top: 1.0%; }
            #fatcat-dom-cat-overlay .weight-row span { text-align: center; padding: 5% 0; border-radius: 999px; background: rgba(111,84,51,.2); font-weight: 900; box-shadow:inset 0 0 0 2px rgba(104,72,41,.12); }
            #fatcat-dom-cat-overlay .weight-row .selected { background: linear-gradient(#f0b84c,#ce8522); color: white; box-shadow:0 3px 0 rgba(112,63,18,.28); }
            #fatcat-dom-cat-overlay .bar { height: 28%; border-radius: 999px; background: #d8c49c; overflow: hidden; box-shadow:inset 0 0 0 2px rgba(91,64,38,.18); } #fatcat-dom-cat-overlay .bar i { display:block; height:100%; background:linear-gradient(90deg,#75aa42,#f0c34e); }
            #fatcat-dom-cat-overlay .cat-grid { position:relative; z-index:4; display: grid; grid-template-columns: 34% 1fr; gap: 1.2%; margin-top: .9%; }
            #fatcat-dom-cat-overlay .cat-grid > div { padding: 1.55%; font-size: 1.86%; line-height: 1.28; min-height: 126px; position:relative; overflow:hidden; }
            #fatcat-dom-cat-overlay .cat-grid > div:after { content:""; position:absolute; left:5%; right:5%; top:5%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.66),transparent); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-grid > div > b { display:inline-flex; align-items:center; min-height:22px; padding:.75% 4.2%; margin-bottom:1.3%; border-radius:999px; background:linear-gradient(#7b573f,#4b3326); color:#ffe4ad; box-shadow:0 2px 0 rgba(70,42,22,.22); }
            #fatcat-dom-cat-overlay .upgrade { display:inline-block; margin-top:4%; padding:3% 12%; border-radius:999px; background:#70a845; color:white; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-tag { display:inline-block; margin:2% 2% 0 0; padding:1.8% 6%; border-radius:999px; background:rgba(91,57,31,.12); color:#6a3e22; font-weight:900; }
            #fatcat-dom-cat-overlay .focus-card { display:grid; grid-template-columns:27% 1fr; gap:4%; align-items:center; padding:1.5%; border-radius:12px; background:rgba(255,248,226,.34); box-shadow:inset 0 0 0 1px rgba(111,78,45,.12); }
            #fatcat-dom-cat-overlay .focus-icon { width:100%; aspect-ratio:1; border-radius:14px; background:center/118% no-repeat; box-shadow:inset 0 0 0 2px rgba(106,72,40,.18), 0 3px 0 rgba(78,47,26,.18); }
            #fatcat-dom-cat-overlay .focus-actions { display:flex; flex-wrap:wrap; gap:2%; margin-top:2.7%; }
            #fatcat-dom-cat-overlay .mini-action { padding:1.9% 7%; border-radius:999px; background:linear-gradient(#f2c66a,#d88b2b); color:#5a351d; font-weight:900; box-shadow:0 3px 0 rgba(111,64,24,.28), inset 0 0 0 2px rgba(255,244,202,.22); }
            #fatcat-dom-cat-overlay .mini-action.green { background:linear-gradient(#8ac05a,#4e8c34); color:#fff; text-shadow:0 1px rgba(53,85,29,.55); }
            #fatcat-dom-cat-overlay .mini-action:disabled { filter:grayscale(.8); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .mini-progress { height:12px; margin:4% 0 2%; border-radius:999px; background:#d6bd8d; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(92,62,34,.2); }
            #fatcat-dom-cat-overlay .mini-progress i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#74a846,#efc251); }
            #fatcat-dom-cat-overlay .skin-wardrobe { display:grid; grid-template-columns:30% 1fr; gap:2%; min-height:106px; }
            #fatcat-dom-cat-overlay .skin-preview-card { position:relative; min-height:104px; padding:4% 5%; border-radius:13px; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.5), transparent 30%), linear-gradient(#fff0c7,#dfad66); box-shadow:inset 0 0 0 2px rgba(112,74,38,.18), 0 4px 0 rgba(78,47,25,.18); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-preview-art { display:block; width:66%; aspect-ratio:1; margin:0 auto 1%; background:center/contain no-repeat; filter:drop-shadow(0 5px 0 rgba(76,48,28,.2)); }
            #fatcat-dom-cat-overlay .skin-preview-card strong { display:block; color:#513019; font-size:118%; text-align:center; }
            #fatcat-dom-cat-overlay .skin-preview-card small { display:block; color:#7a5638; text-align:center; font-weight:900; }
            #fatcat-dom-cat-overlay .skin-list-target { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; }
            #fatcat-dom-cat-overlay .skin-card-target { position:relative; display:grid; grid-template-columns:30% 1fr; align-items:center; gap:3%; min-height:49px; padding:2.2%; border-radius:12px; background:linear-gradient(#fff6dc,#dfbd83); color:#4a2f1f; border:2px solid rgba(111,78,45,.24); box-shadow:inset 0 0 0 2px rgba(255,250,224,.26), 0 3px 0 rgba(76,45,24,.13); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-card-target:after { content:""; position:absolute; left:7%; right:7%; top:7%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.62),transparent); }
            #fatcat-dom-cat-overlay .skin-card-target.selected { background:linear-gradient(#ffe69a,#df9c34); box-shadow:inset 0 0 0 3px rgba(255,250,190,.55), 0 0 12px rgba(237,169,44,.42); }
            #fatcat-dom-cat-overlay .skin-card-target.locked { filter:grayscale(.45); opacity:.76; }
            #fatcat-dom-cat-overlay .skin-card-target i { position:relative; width:100%; aspect-ratio:1; border-radius:10px; background:center/contain no-repeat, linear-gradient(#f8deb1,#b88956); box-shadow:inset 0 0 0 2px rgba(92,60,34,.18); overflow:hidden; }
            #fatcat-dom-cat-overlay .skin-card-target i:before { content:""; position:absolute; left:18%; right:18%; bottom:8%; height:28%; border-radius:42% 42% 18% 18%; background:linear-gradient(135deg,var(--skin-a,#557448),var(--skin-b,#31482f)); box-shadow:inset 0 0 0 2px rgba(255,237,188,.28), 0 2px 0 rgba(65,39,22,.18); opacity:.92; }
            #fatcat-dom-cat-overlay .skin-card-target i:after { content:""; position:absolute; right:8%; top:8%; width:28%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffe06c,#d18b1e); box-shadow:inset 0 0 0 2px rgba(92,54,20,.28), 0 2px 0 rgba(65,39,22,.18); }
            #fatcat-dom-cat-overlay .skin-card-target.apron i:before { left:24%; right:24%; bottom:6%; height:34%; border-radius:7px 7px 14px 14px; background:linear-gradient(#fff3d7 0 34%,var(--skin-a,#b75c31) 35%); }
            #fatcat-dom-cat-overlay .skin-card-target.apron i:after { border-radius:0 0 42% 42%; background:linear-gradient(#fff6df 0 42%,#c77a35 43%); }
            #fatcat-dom-cat-overlay .skin-card-target.manager i:before { left:14%; right:14%; bottom:9%; height:30%; border-radius:999px 999px 16px 16px; background:linear-gradient(90deg,var(--skin-a,#2f6f69),var(--skin-b,#173d44)); }
            #fatcat-dom-cat-overlay .skin-card-target.manager i:after { border-radius:5px; transform:rotate(12deg); background:linear-gradient(#d9b06a,#8d5c2d); }
            #fatcat-dom-cat-overlay .skin-card-target.festival i:before { left:12%; right:12%; bottom:8%; height:36%; border-radius:50% 50% 18px 18px; background:radial-gradient(circle at 35% 35%,#fff3b2 0 9%,transparent 10%), linear-gradient(135deg,var(--skin-a,#7b4bc0),var(--skin-b,#cf6a9a)); }
            #fatcat-dom-cat-overlay .skin-card-target.festival i:after { background:radial-gradient(circle,#fff2a0 0 28%,#e35f65 30% 60%,transparent 61%); box-shadow:none; }
            #fatcat-dom-cat-overlay .skin-card-target b { display:block; color:#442915; line-height:1.08; }
            #fatcat-dom-cat-overlay .skin-card-target span { display:block; color:#735034; font-size:82%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .skin-card-target em { display:inline-flex; width:max-content; margin-top:2%; padding:1.2% 8%; border-radius:999px; background:rgba(76,48,27,.82); color:#fff1c7; font-size:78%; font-style:normal; }
            #fatcat-dom-cat-overlay .skin-card-target.selected em { background:#5d8f38; color:#fff; }
            #fatcat-dom-cat-overlay .skin-style-badge { display:inline-flex; width:max-content; margin:1.5% 0 0; padding:.9% 6%; border-radius:999px; background:linear-gradient(#72513a,#4c3324); color:#ffe5ad; font-size:72%; font-weight:1000; box-shadow:0 2px 0 rgba(62,39,22,.16); }
            #fatcat-dom-cat-overlay .skin-swatches { display:flex; gap:4%; margin-top:2%; }
            #fatcat-dom-cat-overlay .skin-swatches s { width:16%; max-width:16px; aspect-ratio:1; border-radius:50%; background:var(--swatch,#8f6a44); box-shadow:inset 0 0 0 2px rgba(255,240,200,.34), 0 1px 0 rgba(71,45,25,.22); text-decoration:none; }
            #fatcat-dom-cat-overlay .equip-row { display:grid; grid-template-columns: repeat(4,1fr); gap:1.4%; margin-top:2%; text-align:center; }
            #fatcat-dom-cat-overlay .equip-slot { position:relative; min-height: 88px; border-radius:12px; background:radial-gradient(circle at 50% 12%, rgba(255,255,255,.34), transparent 28%), linear-gradient(#f5dfbc,#d4a86f); border:2px solid rgba(111,78,45,.28); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.28), 0 4px 0 rgba(73,44,24,.16); overflow:hidden; }
            #fatcat-dom-cat-overlay .equip-slot:after { content:""; position:absolute; left:11%; right:11%; bottom:7%; height:10%; border-radius:999px; background:rgba(83,54,29,.12); }
            #fatcat-dom-cat-overlay .equip-slot.selected { background:linear-gradient(#fff1bd,#e0a33e); box-shadow:0 0 0 3px rgba(241,173,48,.52) inset, 0 0 12px rgba(241,173,48,.34); }
            #fatcat-dom-cat-overlay .equip-slot small { font-size:76%; color:#725139; }
            #fatcat-dom-cat-overlay .equip-slot em { font-style:normal; color:#6d4728; }
            #fatcat-dom-cat-overlay .equip-name {
                display:block;
                max-width:96%;
                white-space:nowrap;
                font-size:92%;
                line-height:1.05;
            }
            #fatcat-dom-cat-overlay .equip-row .locked { filter: grayscale(1); opacity:.65; }
            #fatcat-dom-cat-overlay .equip-bag { margin-top:1.2%; padding:1.0%; border-radius:12px; background:rgba(255,246,224,.48); box-shadow:inset 0 0 0 1px rgba(112,78,44,.13); }
            #fatcat-dom-cat-overlay .equip-bag strong { display:block; margin-bottom:1%; color:#6a4328; }
            #fatcat-dom-cat-overlay .equip-bag > div { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; }
            #fatcat-dom-cat-overlay .equip-pack { min-height:52px; border-radius:10px; background:linear-gradient(#fff4d6,#d9b47b); color:#4a2f1f; display:grid; grid-template-columns:26% 1fr; grid-template-rows:1fr .85fr .75fr .72fr; align-items:center; column-gap:3%; padding:2.4%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,250,224,.24), 0 2px 0 rgba(75,45,24,.14); }
            #fatcat-dom-cat-overlay .equip-pack .equip-icon { grid-row:1 / 5; width:100%; margin:0; }
            #fatcat-dom-cat-overlay .equip-pack span, #fatcat-dom-cat-overlay .equip-pack em, #fatcat-dom-cat-overlay .equip-pack small { text-align:left; }
            #fatcat-dom-cat-overlay .equip-pack em { font-style:normal; color:#7a583c; font-size:82%; }
            #fatcat-dom-cat-overlay .equip-pack small { color:#8b6647; font-size:72%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-pack.ready { background:linear-gradient(#e6f4c6,#8fc45a); color:#314b1d; }
            #fatcat-dom-cat-overlay .equip-pack.equipped { box-shadow:inset 0 0 0 3px rgba(255,218,101,.58), 0 2px 0 rgba(75,45,24,.14); }
            #fatcat-dom-cat-overlay .equip-pack.disabled { filter:grayscale(.9); opacity:.58; cursor:not-allowed; }
            #fatcat-dom-cat-overlay .equip-upgrade-info { margin-top:1.4%; display:grid; grid-template-columns:repeat(3,1fr); gap:1%; }
            #fatcat-dom-cat-overlay .equip-upgrade-info span { min-height:30px; border-radius:9px; background:rgba(255,247,221,.72); color:#6e4a2e; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:900; font-size:78%; box-shadow:inset 0 0 0 1px rgba(117,80,45,.14); }
            #fatcat-dom-cat-overlay .equip-upgrade-info b { color:#3f2c1f; font-size:110%; }
            #fatcat-dom-cat-overlay .equip-effect-info { margin-top:1%; display:grid; grid-template-columns:1fr 1fr; gap:1%; }
            #fatcat-dom-cat-overlay .equip-effect-info span { min-height:30px; border-radius:9px; background:linear-gradient(#fff7df,#ead09f); color:#704927; display:flex; flex-direction:column; justify-content:center; align-items:center; font-weight:1000; font-size:78%; box-shadow:inset 0 0 0 1px rgba(117,80,45,.15); }
            #fatcat-dom-cat-overlay .equip-effect-info b { max-width:96%; color:#3e2a1a; font-size:108%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-upgrade { width:100%; margin-top:1.4%; min-height:34px; border:0; border-radius:999px; background:linear-gradient(#f6bf50,#b86f1e); color:#fff8e4; font-weight:1000; box-shadow:inset 0 0 0 2px rgba(255,232,151,.32), 0 3px 0 rgba(83,49,21,.24); text-shadow:0 1px 0 rgba(74,45,20,.36); }
            #fatcat-dom-cat-overlay .equip-upgrade b { color:#fff0a8; }
            #fatcat-dom-cat-overlay .equip-upgrade.disabled { background:linear-gradient(#b7aa96,#806b55); color:#f5ead6; box-shadow:inset 0 0 0 2px rgba(255,255,255,.14); cursor:not-allowed; }
            #fatcat-dom-cat-overlay .equip-icon { position:relative; width:45%; aspect-ratio:1; margin-bottom:6%; border-radius:12px; background:linear-gradient(#fff3d4,#d6af77); box-shadow:inset 0 0 0 2px rgba(101,70,40,.18), 0 2px 0 rgba(81,50,26,.2); }
            #fatcat-dom-cat-overlay .equip-icon.asset { background:center/contain no-repeat; }
            #fatcat-dom-cat-overlay .equip-icon.asset:before, #fatcat-dom-cat-overlay .equip-icon.asset:after { display:none; }
            #fatcat-dom-cat-overlay .equip-icon:before, #fatcat-dom-cat-overlay .equip-icon:after { content:""; position:absolute; }
            #fatcat-dom-cat-overlay .equip-icon.collar:before { inset:22%; border-radius:50%; background:radial-gradient(circle at 50% 52%, transparent 0 38%, #667a53 39% 62%, #34442b 63%); box-shadow:inset 0 0 0 3px #9fab84; }
            #fatcat-dom-cat-overlay .equip-icon.collar:after { left:43%; bottom:14%; width:14%; height:20%; border-radius:999px; background:#c99635; }
            #fatcat-dom-cat-overlay .equip-icon.cup:before { left:22%; top:28%; width:46%; height:44%; border-radius:0 0 12px 12px; background:linear-gradient(#f1f5ec,#4f8b6a); box-shadow:inset 0 0 0 3px #315840; }
            #fatcat-dom-cat-overlay .equip-icon.cup:after { right:16%; top:35%; width:20%; height:25%; border-radius:50%; border:4px solid #315840; border-left:0; }
            #fatcat-dom-cat-overlay .equip-icon.cushion:before { left:18%; right:18%; top:30%; height:42%; border-radius:50%; background:radial-gradient(circle at 50% 40%,#8b7a65 0 18%, transparent 19%), linear-gradient(#9b8a75,#655544); box-shadow:inset 0 0 0 3px #4d4136; }
            #fatcat-dom-cat-overlay .equip-icon.lock:before { left:25%; right:25%; bottom:24%; height:38%; border-radius:8px; background:#8b765c; box-shadow:inset 0 0 0 3px #5c4b38; }
            #fatcat-dom-cat-overlay .equip-icon.lock:after { left:34%; right:34%; top:20%; height:32%; border-radius:999px 999px 0 0; border:5px solid #5c4b38; border-bottom:0; }
            #fatcat-dom-cat-overlay .equip-rarity { position:absolute; z-index:3; left:7%; top:6%; min-width:22%; padding:.8% 2%; border-radius:999px; background:linear-gradient(#ffe266,#d89421); color:#673719; font-weight:1000; font-size:84%; box-shadow:inset 0 0 0 1px rgba(92,55,22,.28), 0 2px 0 rgba(73,43,21,.18); }
            #fatcat-dom-cat-overlay .equip-rarity.s-rarity { background:linear-gradient(#ffe47a,#db9624); color:#603314; }
            #fatcat-dom-cat-overlay .equip-rarity.a-rarity { background:linear-gradient(#e9d6ff,#a974d5); color:#50306f; }
            #fatcat-dom-cat-overlay .equip-slot-tag { position:absolute; z-index:3; right:7%; top:6%; padding:.8% 5%; border-radius:999px; background:rgba(69,43,27,.78); color:#fff0c5; font-size:72%; box-shadow:inset 0 0 0 1px rgba(255,229,172,.2); }
            #fatcat-dom-cat-overlay .equip-bonus-pill { display:inline-flex; align-items:center; justify-content:center; width:86%; min-height:19px; margin-top:4%; border-radius:999px; background:rgba(86,54,31,.12); color:#694223; font-size:70%; font-weight:1000; box-shadow:inset 0 0 0 1px rgba(106,70,38,.12); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-cat-overlay .equip-pack .equip-rarity { left:4%; top:6%; min-width:18%; font-size:72%; }
            #fatcat-dom-cat-overlay .equip-pack .equip-bonus-pill { grid-column:2; width:auto; min-height:18px; margin:0; padding:0 5%; justify-self:start; font-size:68%; }
            #fatcat-dom-cat-overlay .cat-story { margin-top:.8%; padding:1.15%; font-size:1.68%; line-height:1.25; }
            #fatcat-dom-cat-overlay .cat-story { display:grid; grid-template-columns:1fr 17% 17%; gap:1.5%; align-items:center; }
            #fatcat-dom-cat-overlay .story-copy { position:relative; min-height:58px; padding:1.0% 1.2% 1.0% 2.2%; border-radius:11px; background:linear-gradient(90deg,rgba(255,249,231,.54),rgba(231,198,145,.22)); box-shadow:inset 4px 0 0 rgba(126,83,43,.42), inset 0 0 0 1px rgba(126,83,43,.09); }
            #fatcat-dom-cat-overlay .story-copy b { display:inline-flex; align-items:center; padding:.7% 3.2%; border-radius:999px; background:linear-gradient(#7b573f,#4d3323); color:#ffe4ad; box-shadow:0 2px 0 rgba(71,44,24,.18); }
            #fatcat-dom-cat-overlay .story-tags { display:flex; flex-wrap:wrap; gap:1.4%; margin-top:1.4%; }
            #fatcat-dom-cat-overlay .story-tags span { padding:.6% 3.2%; border-radius:999px; background:rgba(111,72,39,.14); color:#724724; font-size:82%; font-weight:900; }
            #fatcat-dom-cat-overlay .story-photo { min-height:76px; border-radius:8px; background:linear-gradient(rgba(70,48,34,.08),rgba(70,48,34,.16)), center/cover no-repeat; box-shadow:0 0 0 6px #fff1d1, 0 0 0 8px rgba(123,86,49,.46), 0 5px 0 rgba(74,45,25,.22), inset 0 -16px 18px rgba(74,45,25,.2); position:relative; transform:rotate(3deg); overflow:visible; }
            #fatcat-dom-cat-overlay .story-photo:before { content:""; position:absolute; z-index:3; left:35%; top:-12%; width:28%; height:18%; border-radius:4px; background:linear-gradient(#ca5d42,#8d3329); box-shadow:0 2px 0 rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,238,194,.22); }
            #fatcat-dom-cat-overlay .story-photo:after { content:"工作照"; position:absolute; left:8%; right:8%; bottom:4%; min-height:18%; border-radius:999px; background:rgba(58,38,27,.72); color:#fff2c8; display:flex; align-items:center; justify-content:center; font-size:76%; font-weight:900; box-shadow:inset 0 0 0 1px rgba(255,232,174,.18); }
            #fatcat-dom-cat-overlay .story-button { position:relative; display:inline-flex; align-items:center; justify-content:center; flex-direction:column; margin-top:3%; padding:2.6% 8%; min-height:70px; border-radius:16px; background:radial-gradient(circle at 50% 10%, rgba(255,255,255,.42), transparent 28%), linear-gradient(#f6cf70,#d8942a); color:#5c351e; font-weight:900; box-shadow:0 4px 0 rgba(115,66,22,.32), inset 0 0 0 3px rgba(255,244,205,.26); }
            #fatcat-dom-cat-overlay .story-button:after { content:"章节 1"; margin-top:4%; padding:2% 12%; border-radius:999px; background:rgba(83,49,24,.16); font-size:72%; color:#74451f; }
            #fatcat-dom-cat-overlay .cat-actions { position:absolute; z-index:3; left:11.5%; right:2.7%; bottom:14.1%; height:4.2%; display:grid; grid-template-columns:1fr 1fr 1.4fr; gap:1.2%; }
            #fatcat-dom-cat-overlay .cat-actions button { border-radius:999px; color:#fff7de; font-size:2.05%; font-weight:900; text-shadow:0 2px rgba(80,43,18,.5); border:3px solid rgba(80,50,26,.42); box-shadow:0 4px 0 rgba(0,0,0,.26), inset 0 0 0 2px rgba(255,240,192,.14); }
            #fatcat-dom-cat-overlay .cat-actions .dismiss { background:linear-gradient(#a77a56,#74482e); }
            #fatcat-dom-cat-overlay .cat-actions .change { background:linear-gradient(#e0ae54,#b86a25); }
            #fatcat-dom-cat-overlay .cat-actions .level { background:linear-gradient(#8fbd55,#4f8c35); }
            #fatcat-dom-cat-overlay .cat-actions button:disabled { filter:grayscale(.75); opacity:.62; box-shadow:none; }
            #fatcat-dom-cat-overlay .cat-roster-label { position:absolute; left:11.8%; bottom:12.65%; padding:.55% 2.2%; border-radius:999px; background:linear-gradient(#7b573f,#493126); color:#ffe5ad; border:2px solid rgba(255,224,166,.24); font-size:1.55%; font-weight:900; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-list { position:absolute; z-index:8; left:11.5%; right:2.7%; bottom:.35%; height:12.2%; padding: 1.0%; font-size: 1.9%; background: radial-gradient(circle at 50% 0, rgba(255,219,137,.14), transparent 36%), linear-gradient(#624838,#3e2d24); color: #fff3d8; display:grid; grid-template-columns: repeat(6,1fr); gap:1.1%; text-align:center; box-sizing:border-box; border-color:#7d5a3c; box-shadow:0 -3px 0 rgba(255,226,160,.08) inset, 0 5px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,235,190,.08); }
            #fatcat-dom-cat-overlay .cat-list button { position:relative; min-height:0; border-radius:11px; background:radial-gradient(circle at 50% 10%, rgba(255,255,255,.32), transparent 25%), linear-gradient(#fff1d3,#d8af76); color:#4a2f1f; border:2px solid rgba(104,71,40,.32); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; gap:2%; overflow:hidden; box-shadow:0 4px 0 rgba(38,24,16,.26), inset 0 0 0 2px rgba(255,250,224,.28); transition:transform .12s ease, filter .12s ease; }
            #fatcat-dom-cat-overlay .cat-list button:active { transform:translateY(2px); filter:brightness(.96); }
            #fatcat-dom-cat-overlay .cat-list button:before { content:""; position:absolute; inset:3px; border-radius:8px; box-shadow:inset 0 0 0 1px rgba(255,250,224,.36); pointer-events:none; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge { position:absolute; left:6%; top:5%; min-width:22%; border-radius:999px; background:linear-gradient(#ffe36a,#d99522); color:#6a3618; font-size:86%; box-shadow:inset 0 0 0 1px rgba(93,58,28,.25); }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.s-rarity { background:linear-gradient(#ffe16b,#d68e18); color:#5f3214; }
            #fatcat-dom-cat-overlay .cat-list .rarity-badge.a-rarity { background:linear-gradient(#e8d8ff,#9f6bd5); color:#54316f; }
            #fatcat-dom-cat-overlay .cat-list .cat-status { margin-top:1%; padding:.8% 8%; border-radius:999px; background:#5f8f3a; color:white; font-size:78%; }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-status { background:#8f5f3a; }
            #fatcat-dom-cat-overlay .cat-stars { color:#f0a51c; line-height:1; font-size:78%; text-shadow:0 1px #6e421f; }
            #fatcat-dom-cat-overlay .cat-thumb { width:48%; aspect-ratio:1; border-radius:50%; background: rgba(255,244,220,.9) center/contain no-repeat; box-shadow:0 0 0 3px rgba(111,73,39,.12), inset 0 0 0 2px rgba(112,77,45,.22), 0 2px 0 rgba(76,45,24,.18); }
            #fatcat-dom-cat-overlay .cat-role-dot { position:absolute; right:7%; top:6%; width:13%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#95c965,#4e8d34); box-shadow:inset 0 0 0 2px rgba(255,242,204,.28), 0 2px 0 rgba(64,42,20,.22); }
            #fatcat-dom-cat-overlay .cat-role-dot.launcher { background:linear-gradient(#f0b35c,#c86b2c); }
            #fatcat-dom-cat-overlay .cat-role-dot.saver { background:linear-gradient(#8fc5d8,#4e879d); }
            #fatcat-dom-cat-overlay .cat-role-dot.support { background:linear-gradient(#d7b2f2,#8a5cbe); }
            #fatcat-dom-cat-overlay .cat-list .locked .cat-thumb { filter: grayscale(.85); opacity:.62; }
            #fatcat-dom-cat-overlay .cat-list .locked { filter: grayscale(.75); opacity:.72; }
            #fatcat-dom-cat-overlay .cat-list .active { transform:translateY(-4%); box-shadow:0 0 0 4px #f0a51c inset, 0 0 16px rgba(240,165,28,.45), 0 6px 0 rgba(63,36,17,.26); } #fatcat-dom-cat-overlay .cat-list .recruit { background:linear-gradient(#ffc84c,#ee991d); color:white; text-shadow:0 2px #9c5815; border-color:#ffe2a5; }
            #fatcat-dom-cat-overlay .cat-msg { position:absolute; left: 18%; right: 6%; bottom: 20.4%; min-height:3.1%; border-radius:999px; background:rgba(48,34,24,.9); color:#ffe6b5; display:flex;align-items:center;justify-content:center; font-size:2.0%; font-weight:900; pointer-events:none; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-cat-overlay .cat-msg.empty { display:none; }
            #fatcat-dom-cat-overlay.compact .cat-bg { padding: 16.0% 2.0% 16.8% 13.2%; border-radius:0; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud { left:1%; right:1%; top:.75%; height:7.2%; gap:.7%; grid-template-columns:25% repeat(4,1fr); font-size:1.55%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player { border-radius:14px; padding:2% 3%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res { font-size:.78em; border-width:2px; gap:3%; padding-right:8%; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res i { width:min(22px,20%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .plus { width:min(22px,20%); font-size:.9em; }
            #fatcat-dom-cat-overlay.compact .cat-modal-title { left:31%; right:31%; min-height:42px; font-size:2.42%; }
            #fatcat-dom-cat-overlay.compact .close-x { width:6.9%; min-width:38px; font-size:3.0%; }
            #fatcat-dom-cat-overlay.compact .cat-side { left: 1.8%; top:10.0%; width: 9.4%; }
            #fatcat-dom-cat-overlay.compact .cat-overview-head div { min-height:48px; font-size:1.48%; }
            #fatcat-dom-cat-overlay.compact .back, #fatcat-dom-cat-overlay.compact .side-tab { min-height: 52px; font-size: 1.65%; border-radius: 12px; }
            #fatcat-dom-cat-overlay.compact .cat-hero { grid-template-columns: 27% 1fr 18%; gap: 1.1%; }
            #fatcat-dom-cat-overlay.compact .cat-card { font-size: 2.08%; padding: 5.5%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info { padding:4.6%; line-height:1.34; }
            #fatcat-dom-cat-overlay.compact .cat-card.info strong { min-height:28px; padding:0 8%; font-size:118%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info strong:after { width:14px; height:14px; margin-left:5px; }
            #fatcat-dom-cat-overlay.compact .cat-card.info .rank { font-size:212%; line-height:1; }
            #fatcat-dom-cat-overlay.compact .cat-card.info .type { display:inline-flex; align-items:center; min-height:18px; padding:0 7%; font-size:88%; }
            #fatcat-dom-cat-overlay.compact .cat-portrait { min-height: 238px; }
            #fatcat-dom-cat-overlay.compact .portrait-cat.img { width:58%; min-width:164px; }
            #fatcat-dom-cat-overlay.compact .cat-portrait .cat-talk { right:5%; top:8%; max-width:42%; font-size:24%; }
            #fatcat-dom-cat-overlay.compact .cat-profile-row { font-size:20%; left:6%; right:6%; }
            #fatcat-dom-cat-overlay.compact .cat-power { width: 48%; font-size: 2.72%; }
            #fatcat-dom-cat-overlay.compact .cat-stats { font-size: 1.72%; padding: 1.25%; }
            #fatcat-dom-cat-overlay.compact .cat-weight { font-size: 2.05%; padding: 1.8%; }
            #fatcat-dom-cat-overlay.compact .cat-grid { grid-template-columns: 36% 1fr; gap: 1.0%; }
            #fatcat-dom-cat-overlay.compact .cat-grid > div { min-height: 106px; font-size: 1.58%; padding: 1.35%; line-height:1.18; }
            #fatcat-dom-cat-overlay.compact .focus-card { grid-template-columns:31% 1fr; gap:2.6%; padding:1.1%; }
            #fatcat-dom-cat-overlay.compact .focus-tag { padding:1.2% 4.2%; margin-top:1.4%; }
            #fatcat-dom-cat-overlay.compact .mini-action { padding:1.4% 5.5%; }
            #fatcat-dom-cat-overlay.compact .skin-wardrobe { grid-template-columns:29% 1fr; gap:1.4%; min-height:90px; }
            #fatcat-dom-cat-overlay.compact .skin-preview-card { min-height:88px; padding:3%; }
            #fatcat-dom-cat-overlay.compact .skin-preview-art { width:60%; margin-bottom:0; }
            #fatcat-dom-cat-overlay.compact .skin-card-target { min-height:40px; padding:1.8%; font-size:88%; border-radius:9px; }
            #fatcat-dom-cat-overlay.compact .skin-card-target span { font-size:74%; }
            #fatcat-dom-cat-overlay.compact .skin-card-target em { font-size:70%; }
            #fatcat-dom-cat-overlay.compact .equip-row { gap:.8%; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-slot { min-height: 58px; border-radius:9px; font-size:86%; }
            #fatcat-dom-cat-overlay.compact .equip-slot small { font-size:64%; }
            #fatcat-dom-cat-overlay.compact .equip-icon { width:48%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.compact .equip-bag { margin-top:.8%; padding:.8%; }
            #fatcat-dom-cat-overlay.compact .equip-pack { min-height:44px; padding:1.8%; font-size:82%; }
            #fatcat-dom-cat-overlay.compact .equip-pack small { font-size:68%; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade-info, #fatcat-dom-cat-overlay.compact .equip-effect-info { display:none; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade { min-height:30px; margin-top:.8%; }
            #fatcat-dom-cat-overlay.compact .cat-story { font-size: 1.62%; grid-template-columns:1fr 18%; }
            #fatcat-dom-cat-overlay.compact .story-photo { min-height:72px; }
            #fatcat-dom-cat-overlay.compact .cat-actions { left:2%; right:2%; bottom:14.25%; height:4.4%; }
            #fatcat-dom-cat-overlay.compact .cat-actions button { font-size:1.68%; }
            #fatcat-dom-cat-overlay.compact .cat-roster-label { left:2%; bottom:12.7%; font-size:1.32%; }
            #fatcat-dom-cat-overlay.compact .cat-list { left: 2%; right: 2%; bottom:.3%; height: 12.35%; font-size: 1.58%; gap: .7%; }
            #fatcat-dom-cat-overlay.tall .cat-bg { padding-bottom: 16.8%; }
            #fatcat-dom-cat-overlay.wide .cat-bg { left: 0; right: 0; padding-top:8.2%; }
            #fatcat-dom-cat-overlay.wide .cat-page-hud { left:2%; right:2%; height:6.4%; font-size:1.55%; }
            #fatcat-dom-cat-overlay.wide .cat-page-hud .res { font-size:.92em; }
            #fatcat-dom-cat-overlay.wide .cat-overview-head div { min-height:42px; font-size:1.25%; }
            #fatcat-dom-cat-overlay.wide .cat-hero { margin-top:.55%; grid-template-columns:22% 1fr 20%; gap:1.4%; }
            #fatcat-dom-cat-overlay.wide .cat-card.info { min-height:142px; padding:4.8%; font-size:2.05%; }
            #fatcat-dom-cat-overlay.wide .cat-portrait { min-height:214px; }
            #fatcat-dom-cat-overlay.wide .portrait-cat.img { min-width:150px; width:52%; }
            #fatcat-dom-cat-overlay.wide .portrait-name { font-size:58%; }
            #fatcat-dom-cat-overlay.wide .cat-profile-row { display:none; }
            #fatcat-dom-cat-overlay.wide .cat-power { margin:.7% auto; padding:.65%; font-size:2.6%; }
            #fatcat-dom-cat-overlay.wide .cat-stats { margin-top:.7%; padding:.9%; font-size:1.55%; }
            #fatcat-dom-cat-overlay.wide .cat-stats div { min-height:48px; gap:3%; }
            #fatcat-dom-cat-overlay.wide .stat-icon { width:20%; max-width:24px; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.wide .cat-weight { padding:1.05%; margin-top:.75%; font-size:1.82%; }
            #fatcat-dom-cat-overlay.wide .weight-row { margin-top:.8%; }
            #fatcat-dom-cat-overlay.wide .cat-grid { grid-template-columns:35% 1fr; gap:1%; margin-top:.75%; }
            #fatcat-dom-cat-overlay.wide .cat-grid > div { min-height:66px; padding:1.15%; font-size:1.48%; line-height:1.18; }
            #fatcat-dom-cat-overlay.wide .equip-row { gap:1%; margin-top:1%; }
            #fatcat-dom-cat-overlay.wide .equip-slot { min-height:46px; }
            #fatcat-dom-cat-overlay.wide .equip-bag { display:none; }
            #fatcat-dom-cat-overlay.wide .equip-icon { width:42%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.wide .cat-story { display:none; }
            #fatcat-dom-cat-overlay.wide .cat-msg { bottom:16.1%; }
            #fatcat-dom-cat-overlay.wide .cat-roster-label { display:none; }

            #fatcat-dom-cat-overlay .cat-art-bg {
                background-color:#3b261b;
                background-image:linear-gradient(rgba(37,24,16,.12),rgba(37,24,16,.56)),url("${catWorkshopDataUri}");
                background-size:100% auto;
                background-position:center top;
                background-repeat:no-repeat;
                opacity:.62;
                filter:saturate(1.04) contrast(1.03) brightness(.86);
            }
            #fatcat-dom-cat-overlay .portrait-name,
            #fatcat-dom-cat-overlay .cat-profile-row,
            #fatcat-dom-cat-overlay .cat-index,
            #fatcat-dom-cat-overlay .cat-actions,
            #fatcat-dom-cat-overlay .cat-roster-label { display:none; }
            #fatcat-dom-cat-overlay .cat-page-hud .avatar.asset {
                background-color:#e5b269;
                background-position:center 20%;
                background-size:155%;
                background-repeat:no-repeat;
            }
            #fatcat-dom-cat-overlay .cat-page-hud .res i.asset {
                border-radius:0;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:none;
                transform:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.28));
            }
            #fatcat-dom-cat-overlay .side-tab i.asset {
                width:60%;
                flex:0 0 auto;
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:125%;
                background-repeat:no-repeat;
                box-shadow:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.24));
            }
            #fatcat-dom-cat-overlay .side-tab i.asset:before,
            #fatcat-dom-cat-overlay .side-tab i.asset:after { display:none !important; }
            #fatcat-dom-cat-overlay .tab-info i.asset,
            #fatcat-dom-cat-overlay .tab-skin i.asset {
                background-position:center 28%;
                background-size:155%;
            }
            #fatcat-dom-cat-overlay .stat-icon.asset {
                border-radius:0;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:none;
                transform:none;
            }
            #fatcat-dom-cat-overlay .cat-thumb.hero-art {
                width:82%;
                margin-top:1%;
                border-radius:0;
                background-color:transparent;
                background-position:center 32%;
                background-size:142%;
                background-repeat:no-repeat;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay .cat-role-dot.asset {
                width:18%;
                border-radius:6px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:0 2px 0 rgba(64,42,20,.22);
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art {
                position:relative;
                min-height:62px;
                box-sizing:border-box;
                display:flex;
                align-items:flex-end;
                justify-content:center;
                padding:39px 0 5px;
                border-radius:12px;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art:before {
                content:"";
                position:absolute !important;
                left:10% !important;
                right:10% !important;
                top:2px !important;
                height:48px !important;
                border-radius:0 !important;
                background-color:transparent !important;
                background-image:var(--stage-art) !important;
                background-position:center bottom !important;
                background-size:contain !important;
                background-repeat:no-repeat !important;
                box-shadow:none !important;
                transform:scale(.82) !important;
                transform-origin:center bottom !important;
                z-index:1;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art.fat:before { transform:scale(.98) !important; }
            #fatcat-dom-cat-overlay .weight-row span.stage-art.super:before {
                filter:grayscale(.9) sepia(.12) !important;
                transform:scale(1.12) !important;
            }
            #fatcat-dom-cat-overlay .weight-row span.stage-art:after { display:none !important; }
            #fatcat-dom-cat-overlay .weight-row span.stage-art b { position:relative; z-index:2; }
            #fatcat-dom-cat-overlay.tablet .weight-row span.stage-art {
                min-height:44px;
                padding:27px 0 3px;
            }
            #fatcat-dom-cat-overlay.tablet .weight-row span.stage-art:before {
                top:0 !important;
                height:34px !important;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud {
                left:1.2%;
                right:1.2%;
                top:1.0%;
                height:5.25%;
                grid-template-columns:27% repeat(4,1fr);
                gap:.65%;
                font-size:1.58%;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player {
                grid-template-columns:30% 1fr;
                padding:2px 6px;
                border-radius:13px;
                border-width:2px;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .player span { gap:3px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .avatar { width:min(38px,90%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .level { width:min(25px,23%); border-width:2px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .exp { height:5px; }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res {
                border-radius:999px 10px 10px 999px;
                font-size:.82em;
                gap:2%;
                padding-right:15%;
            }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .res i { width:min(22px,25%); }
            #fatcat-dom-cat-overlay.compact .cat-page-hud .plus { width:min(22px,24%); border-radius:6px; }
            #fatcat-dom-cat-overlay.compact .cat-hero {
                position:relative;
                grid-template-columns:24% 1fr 25%;
                gap:.25%;
            }
            #fatcat-dom-cat-overlay.compact .cat-side { top:6.55%; }
            #fatcat-dom-cat-overlay.compact .cat-card.info {
                min-height:116px;
                margin-top:15px;
                padding:3.2%;
                font-size:1.9%;
                line-height:1.02;
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait {
                min-height:232px;
                border-radius:12px;
                overflow:visible;
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait:before {
                inset:1.5%;
                opacity:.88;
                background-position:center 36%;
            }
            #fatcat-dom-cat-overlay.compact .portrait-cat.img {
                width:70%;
                min-width:180px;
                margin-top:5%;
                filter:drop-shadow(0 7px 0 rgba(72,45,28,.2));
            }
            #fatcat-dom-cat-overlay.compact .cat-portrait .cat-talk {
                right:3%;
                top:7%;
                max-width:43%;
                font-size:22%;
            }
            #fatcat-dom-cat-overlay.compact .cat-hero > div:last-child {
                position:absolute;
                right:0;
                top:0;
                width:25%;
                box-sizing:border-box;
                padding-top:6.4vh;
            }
            #fatcat-dom-cat-overlay.compact .mood,
            #fatcat-dom-cat-overlay.compact .feed {
                margin-bottom:14px;
                padding:22% 3% 8%;
                font-size:1.7%;
                line-height:1.18;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.compact .mood { margin-bottom:30px; }
            #fatcat-dom-cat-overlay.compact .feed button {
                margin-top:5%;
                padding:4% 10%;
            }
            #fatcat-dom-cat-overlay.compact .cat-switch {
                z-index:7;
                top:55%;
                width:32px;
                min-width:32px;
                border:0;
                border-radius:0;
                background:transparent;
                color:#f4ad36;
                font-size:46px;
                line-height:1;
                text-shadow:0 2px 0 #5f3218;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-switch.prev { left:-35%; }
            #fatcat-dom-cat-overlay.compact .cat-switch.next { right:-36%; }
            #fatcat-dom-cat-overlay.compact .cat-power {
                position:relative;
                z-index:5;
                width:76%;
                margin:-5.4% 0 .45% 3%;
                padding:.62%;
                font-size:2.45%;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.compact .cat-stats {
                margin-top:.35%;
                padding:1.05%;
                font-size:1.62%;
            }
            #fatcat-dom-cat-overlay.compact .cat-stats div { min-height:64px; }
            #fatcat-dom-cat-overlay.compact .cat-weight {
                min-height:105px;
                margin-top:.55%;
                padding:1.45% 1.7%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row {
                grid-template-columns:15% 15% 15% 1fr 12%;
                gap:.8%;
                margin-top:.55%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span {
                position:relative;
                min-height:72px;
                box-sizing:border-box;
                display:flex;
                align-items:flex-end;
                justify-content:center;
                padding:44px 0 7px;
                border-radius:12px;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:before {
                content:"";
                position:absolute;
                left:21%;
                right:21%;
                top:7px;
                aspect-ratio:1;
                border-radius:48% 48% 42% 42%;
                background:
                    radial-gradient(circle at 35% 42%,#3d281d 0 5%,transparent 6%),
                    radial-gradient(circle at 65% 42%,#3d281d 0 5%,transparent 6%),
                    linear-gradient(#f3c27e,#d27c37);
                box-shadow:-6px -5px 0 -4px #6b4228,6px -5px 0 -4px #6b4228,inset -6px -5px 0 rgba(116,65,32,.13),0 2px 0 rgba(75,45,24,.18);
                z-index:2;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:after {
                content:"";
                position:absolute;
                left:27%;
                right:27%;
                top:31px;
                height:28px;
                border-radius:50% 50% 38% 38%;
                background:linear-gradient(#f3c27e,#d27c37);
                box-shadow:inset -5px -4px 0 rgba(116,65,32,.13);
                z-index:1;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(2):before {
                left:14%;
                right:14%;
                top:3px;
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(3):before {
                left:7%;
                right:7%;
                top:0;
                background:
                    radial-gradient(circle at 35% 42%,#3d281d 0 5%,transparent 6%),
                    radial-gradient(circle at 65% 42%,#3d281d 0 5%,transparent 6%),
                    linear-gradient(#a99c8e,#6f665e);
            }
            #fatcat-dom-cat-overlay.compact .weight-row span:nth-child(3):after {
                left:17%;
                right:17%;
                background:linear-gradient(#a99c8e,#6f665e);
            }
            #fatcat-dom-cat-overlay.compact .weight-row span b {
                position:relative;
                z-index:3;
                font-size:100%;
                color:inherit;
            }
            #fatcat-dom-cat-overlay.compact .cat-grid { margin-top:.65%; }
            #fatcat-dom-cat-overlay.compact .cat-grid,
            #fatcat-dom-cat-overlay.compact .cat-story {
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
            }
            #fatcat-dom-cat-overlay.compact .equip-slot { min-height:52px; }
            #fatcat-dom-cat-overlay.compact .equip-pack { min-height:40px; }
            #fatcat-dom-cat-overlay.compact .equip-upgrade { min-height:27px; }
            #fatcat-dom-cat-overlay.compact .cat-story {
                min-height:88px;
                margin-top:.65%;
                grid-template-columns:1fr 18% 18%;
            }
            #fatcat-dom-cat-overlay.compact .story-photo {
                min-height:78px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                background-color:#d2a875;
            }
            #fatcat-dom-cat-overlay.compact .story-copy { min-height:70px; padding:1.3% 1.5% 1.3% 2.8%; }
            #fatcat-dom-cat-overlay.compact .story-tags span { padding:.5% 2.4%; font-size:74%; }
            #fatcat-dom-cat-overlay.compact .story-photo:after { font-size:68%; }
            #fatcat-dom-cat-overlay.compact .story-button {
                margin:0;
                padding:7% 4%;
                min-height:76px;
                border:0;
                font-size:86%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list { height:10.3%; bottom:2.2%; }
            #fatcat-dom-cat-overlay.tablet .cat-bg {
                padding:7.2% 2.4% 13.2% 13.2%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud {
                left:2%;
                right:2%;
                top:.8%;
                height:5.55%;
                grid-template-columns:25% repeat(4,1fr);
                gap:.75%;
                font-size:1.42%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .player {
                grid-template-columns:29% 1fr;
                padding:3px 7px;
                font-size:.84em;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .player span { gap:3px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .avatar { width:min(38px,88%); }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .level { width:min(25px,23%); border-width:2px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .exp { height:5px; }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .res {
                border-radius:999px 11px 11px 999px;
                border-width:2px;
                font-size:.9em;
                gap:3%;
                padding-right:13%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .res i { width:min(28px,26%); }
            #fatcat-dom-cat-overlay.tablet .cat-page-hud .plus { width:min(26px,24%); border-radius:6px; }
            #fatcat-dom-cat-overlay.tablet .cat-side { left:1.8%; top:7.3%; width:9.4%; }
            #fatcat-dom-cat-overlay.tablet .back,
            #fatcat-dom-cat-overlay.tablet .side-tab {
                min-height:52px;
                font-size:1.55%;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.tablet .cat-hero {
                grid-template-columns:23% 1fr 19%;
                gap:1.4%;
                align-items:start;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info {
                min-height:154px;
                margin-top:6px;
                padding:4%;
                font-size:1.65%;
                line-height:1.12;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info strong {
                min-height:28px;
                padding:0 8%;
                font-size:118%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info .rank {
                font-size:190%;
                line-height:1;
            }
            #fatcat-dom-cat-overlay.tablet .cat-card.info .type {
                display:inline-flex;
                align-items:center;
                min-height:20px;
                padding:0 6%;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait {
                height:auto;
                min-height:250px;
                overflow:visible;
            }
            #fatcat-dom-cat-overlay.tablet .portrait-cat.img {
                width:66%;
                min-width:180px;
                margin-top:2%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait .cat-talk {
                right:4%;
                top:7%;
                max-width:42%;
                font-size:23%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-hero > div:last-child {
                padding-top:32px;
            }
            #fatcat-dom-cat-overlay.tablet .mood,
            #fatcat-dom-cat-overlay.tablet .feed {
                margin-bottom:5%;
                padding:24% 4% 8%;
                font-size:1.55%;
                line-height:1.18;
                border-radius:11px;
            }
            #fatcat-dom-cat-overlay.tablet .mood:before,
            #fatcat-dom-cat-overlay.tablet .feed:before {
                top:4%;
                width:17%;
            }
            #fatcat-dom-cat-overlay.tablet .mood:after {
                left:46%;
                top:9%;
                width:8%;
                height:6%;
            }
            #fatcat-dom-cat-overlay.tablet .feed:after {
                left:46%;
                top:10%;
                width:8%;
                height:6%;
            }
            #fatcat-dom-cat-overlay.tablet .feed button {
                margin-top:5%;
                padding:4% 10%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-switch {
                z-index:7;
                top:51%;
                width:32px;
                min-width:32px;
                border:0;
                border-radius:0;
                background:transparent;
                color:#f4ad36;
                font-size:46px;
                line-height:1;
                text-shadow:0 2px 0 #5f3218;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.tablet .cat-switch.prev { left:-9%; }
            #fatcat-dom-cat-overlay.tablet .cat-switch.next { right:-9%; }
            #fatcat-dom-cat-overlay.tablet .cat-power {
                width:78%;
                margin:.45% 0 .45% 2%;
                padding:.55%;
                font-size:2.35%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-stats {
                margin-top:.45%;
                padding:.72%;
                font-size:1.34%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-stats div { min-height:46px; }
            #fatcat-dom-cat-overlay.tablet .cat-weight {
                min-height:64px;
                margin-top:.45%;
                padding:.8% 1.1%;
                font-size:1.55%;
            }
            #fatcat-dom-cat-overlay.tablet .weight-row { margin-top:.45%; }
            #fatcat-dom-cat-overlay.tablet .cat-grid {
                grid-template-columns:36% 1fr;
                gap:1%;
                margin-top:.5%;
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
            }
            #fatcat-dom-cat-overlay.tablet .cat-grid > div {
                min-height:180px;
                padding:1%;
                font-size:1.25%;
                line-height:1.14;
            }
            #fatcat-dom-cat-overlay.tablet .focus-card {
                grid-template-columns:22% 1fr;
                gap:2%;
                padding:1%;
            }
            #fatcat-dom-cat-overlay.tablet .focus-actions { margin-top:1.5%; }
            #fatcat-dom-cat-overlay.tablet .mini-action { padding:1.2% 4%; }
            #fatcat-dom-cat-overlay.tablet .equip-row {
                gap:.8%;
                margin-top:.6%;
                align-items:start;
            }
            #fatcat-dom-cat-overlay.tablet .equip-slot {
                min-height:0;
                height:98px;
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.tablet .equip-icon { width:48%; margin-bottom:1%; }
            #fatcat-dom-cat-overlay.tablet .equip-upgrade { min-height:28px; margin-top:.7%; }
            #fatcat-dom-cat-overlay.tablet .cat-story {
                display:grid;
                min-height:78px;
                margin-top:.5%;
                margin-left:-12.8%;
                width:112.8%;
                box-sizing:border-box;
                padding:.8%;
                grid-template-columns:1fr 16% 16%;
                font-size:1.28%;
            }
            #fatcat-dom-cat-overlay.tablet .story-photo {
                min-height:66px;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                background-color:#d2a875;
            }
            #fatcat-dom-cat-overlay.tablet .story-copy { min-height:64px; }
            #fatcat-dom-cat-overlay.tablet .story-tags span { font-size:76%; }
            #fatcat-dom-cat-overlay.tablet .story-button {
                margin:0;
                padding:7% 3%;
                min-height:66px;
                border:0;
                font-size:90%;
            }
            #fatcat-dom-cat-overlay .focus-panel,
            #fatcat-dom-cat-overlay .equipment-panel {
                background:
                    radial-gradient(circle at 14% 8%, rgba(255,255,255,.42), transparent 22%),
                    repeating-linear-gradient(0deg, rgba(113,74,38,.035) 0 1px, transparent 1px 5px),
                    linear-gradient(#fff7df,#e8c794);
            }
            #fatcat-dom-cat-overlay .focus-panel > b,
            #fatcat-dom-cat-overlay .equipment-panel > b {
                position:relative;
                z-index:2;
                padding:0;
                margin:0 0 2.2%;
                border-radius:0;
                background:none;
                color:#65401f;
                box-shadow:none;
                font-size:116%;
            }
            #fatcat-dom-cat-overlay .focus-card.target-skill {
                position:relative;
                min-height:0;
                height:calc(100% - 28px);
                box-sizing:border-box;
                grid-template-columns:34% 1fr;
                grid-template-rows:auto 1fr auto;
                gap:3% 4%;
                align-items:start;
                padding:3%;
                background:rgba(255,251,233,.55);
                border:1px solid rgba(117,76,38,.16);
                box-shadow:inset 0 0 0 2px rgba(255,255,255,.22);
            }
            #fatcat-dom-cat-overlay .target-skill .focus-icon {
                grid-row:1 / 3;
                width:100%;
                background-size:142%;
                border:3px solid #a36a22;
                box-shadow:inset 0 0 0 3px rgba(255,224,113,.5),0 3px 0 rgba(79,45,18,.24),0 0 12px rgba(234,166,40,.24);
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current {
                min-width:0;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current strong {
                display:block;
                color:#4b2d19;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-current > b {
                display:block;
                margin-top:1%;
                color:#5d3b23;
            }
            #fatcat-dom-cat-overlay .target-skill p {
                margin:3% 0 0;
                color:#6f4a2c;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next {
                grid-column:1 / 3;
                display:grid;
                grid-template-columns:1fr auto;
                align-items:center;
                padding:3% 2% 1%;
                border-top:1px solid rgba(109,72,39,.16);
                color:#7a4d29;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next b {
                color:#4a2c1a;
            }
            #fatcat-dom-cat-overlay .target-skill .focus-next small {
                grid-column:1 / 3;
                margin-top:1%;
            }
            #fatcat-dom-cat-overlay .target-skill-actions {
                grid-column:1 / 3;
                display:grid;
                grid-template-columns:30% 1fr;
                gap:4%;
                width:88%;
                justify-self:center;
            }
            #fatcat-dom-cat-overlay .target-skill-actions .mini-action {
                width:100%;
                min-width:0;
                padding:4% 2%;
            }
            #fatcat-dom-cat-overlay .target-skill .skill-details {
                border-radius:10px;
                background:linear-gradient(#f0d391,#bf8a42);
                color:#5b351d;
            }
            #fatcat-dom-cat-overlay .target-skill .skill-upgrade {
                border-radius:10px;
                color:#fff;
                box-shadow:0 3px 0 #385e24,inset 0 0 0 2px rgba(255,245,199,.24);
            }
            #fatcat-dom-cat-overlay .target-skill .skill-upgrade em {
                margin-left:4%;
                color:#fff3a5;
                font-style:normal;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-bag {
                display:none;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-row {
                height:calc(100% - 2px);
                margin-top:0;
                align-items:stretch;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-slot {
                min-height:0;
                height:100%;
                justify-content:flex-start;
                padding:8% 3% 6%;
                box-sizing:border-box;
                background:linear-gradient(#fff4da 0 58%,#e0be89 59%);
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-icon {
                width:76%;
                margin:0 auto 5%;
                background-color:#ead5af;
                background-size:128%;
                border-radius:10px;
            }
            #fatcat-dom-cat-overlay .equip-layout.overview-mode .equip-slot small {
                margin-top:5%;
                min-height:2.2em;
                line-height:1.1;
            }
            #fatcat-dom-cat-overlay .equip-cta {
                position:relative;
                z-index:2;
                display:inline-flex;
                align-items:center;
                justify-content:center;
                width:78%;
                min-height:22px;
                margin-top:auto;
                border-radius:8px;
                background:linear-gradient(#8bbb56,#4e8732);
                color:white;
                font-size:86%;
                box-shadow:0 2px 0 rgba(50,81,29,.38);
            }
            #fatcat-dom-cat-overlay .equip-slot.locked .equip-cta {
                background:linear-gradient(#aa9b86,#776854);
            }
            #fatcat-dom-cat-overlay .equip-layout.detail-mode .equip-cta {
                display:none;
            }
            #fatcat-dom-cat-overlay .story-copy p {
                margin:3% 0 0;
                color:#664329;
            }
            #fatcat-dom-cat-overlay .story-photo {
                background-image:
                    var(--story-cat),
                    linear-gradient(rgba(57,34,22,.08),rgba(57,34,22,.24)),
                    url("${catWorkshopDataUri}");
                background-size:contain,cover,cover;
                background-position:center 58%,center,center;
                background-repeat:no-repeat;
            }
            #fatcat-dom-cat-overlay .story-book {
                display:block;
                margin:0 0 5%;
                color:#7d4c1f;
                transform:rotate(90deg);
            }
            #fatcat-dom-cat-overlay .cat-list .cat-name {
                max-width:88%;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }
            #fatcat-dom-cat-overlay .cat-list .cat-level {
                font-style:normal;
                font-weight:900;
            }
            #fatcat-dom-cat-overlay .cat-list .recruit {
                gap:1%;
            }
            #fatcat-dom-cat-overlay .recruit-art {
                width:54%;
                aspect-ratio:1;
                margin-top:-7%;
                background:center/contain no-repeat;
                filter:drop-shadow(0 2px 0 rgba(93,48,13,.24));
            }
            #fatcat-dom-cat-overlay .cat-list .recruit small {
                font-size:76%;
            }
            #fatcat-dom-cat-overlay.compact .cat-grid > div {
                min-height:clamp(166px,46vw,198px);
            }
            #fatcat-dom-cat-overlay.compact .focus-card.target-skill {
                font-size:94%;
            }
            #fatcat-dom-cat-overlay.compact .target-skill .focus-icon {
                border-width:2px;
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode {
                height:calc(100% - 28px);
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode .equip-slot {
                font-size:82%;
            }
            #fatcat-dom-cat-overlay.compact .equip-layout.overview-mode .equip-icon {
                width:80%;
            }
            #fatcat-dom-cat-overlay.compact .cat-story {
                min-height:92px;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-name,
            #fatcat-dom-cat-overlay.compact .cat-list .cat-role-dot {
                display:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-thumb {
                width:72%;
                margin-top:3%;
                border-radius:12px;
                background-color:transparent;
                background-size:185%;
                background-position:center 35%;
                box-shadow:none;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-stars {
                position:absolute;
                left:8%;
                bottom:24%;
                font-size:68%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-level {
                position:absolute;
                right:8%;
                bottom:22%;
                font-size:76%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .cat-status {
                position:absolute;
                left:8%;
                right:8%;
                bottom:4%;
                margin:0;
                padding:1.2% 2%;
                font-size:68%;
            }
            #fatcat-dom-cat-overlay.compact .cat-list .rarity-badge {
                z-index:2;
                min-width:25%;
                font-size:88%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-grid > div {
                min-height:205px;
            }
            #fatcat-dom-cat-overlay.tablet .equip-layout.overview-mode {
                height:170px;
            }
            #fatcat-dom-cat-overlay.tablet .cat-list .cat-name {
                display:none;
            }
            #fatcat-dom-cat-overlay.tablet .cat-list .cat-thumb {
                width:62%;
                background-size:138%;
                background-position:center 34%;
            }
            #fatcat-dom-cat-overlay.tablet .cat-portrait { min-height:280px; }
            #fatcat-dom-cat-overlay.tablet .cat-stats div { min-height:56px; }
            #fatcat-dom-cat-overlay.tablet .cat-weight { min-height:90px; }
            #fatcat-dom-cat-overlay.tablet .cat-story { min-height:90px; }
            #fatcat-dom-cat-overlay.tablet .cat-list {
                left:2.4%;
                right:2.4%;
                height:10.4%;
                bottom:.7%;
                font-size:1.42%;
                gap:.75%;
            }
            @media (max-width:390px) {
                #fatcat-dom-cat-overlay.compact .equip-bag { display:none; }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) {
                    grid-template-columns:1fr;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) .focus-panel {
                    display:none;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) .equipment-panel {
                    min-height:250px;
                }
                #fatcat-dom-cat-overlay.compact .equip-layout.detail-mode .equip-bag {
                    display:block;
                }
                #fatcat-dom-cat-overlay.compact .cat-grid:has(.equip-layout.detail-mode) + .cat-story {
                    display:none;
                }
                #fatcat-dom-cat-overlay.compact .cat-portrait {
                    min-height:clamp(194px,54vw,211px);
                }
                #fatcat-dom-cat-overlay.compact .portrait-cat.img {
                    min-width:clamp(150px,42vw,164px);
                }
                #fatcat-dom-cat-overlay.compact .cat-stats div {
                    min-height:clamp(54px,15vw,59px);
                }
                #fatcat-dom-cat-overlay.compact .cat-weight {
                    min-height:clamp(84px,24vw,94px);
                }
                #fatcat-dom-cat-overlay.compact .weight-row span {
                    min-height:clamp(58px,16.5vw,64px);
                    padding-top:clamp(35px,10vw,39px);
                }
                #fatcat-dom-cat-overlay.compact .cat-story {
                    min-height:90px;
                    font-size:1.35%;
                    grid-template-columns:1fr 17% 18%;
                }
                #fatcat-dom-cat-overlay.compact .story-photo { min-height:76px; }
                #fatcat-dom-cat-overlay.compact .cat-list { height:10.6%; bottom:.5%; }
            }
        `;
}
