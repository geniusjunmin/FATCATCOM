export function getDomFactoryStyles(factoryCutawayDataUri: string): string {
    return `
            #fatcat-dom-factory { position: fixed; z-index: 2147482300; pointer-events: none; font-family: Arial, sans-serif; color: #fff4d8; overflow: hidden; }
            #fatcat-dom-factory .art-bg { position: absolute; inset: 0; background: radial-gradient(circle at 18% 9%, rgba(255,255,255,.82) 0 7%, transparent 8%), radial-gradient(circle at 78% 10%, rgba(255,255,255,.62) 0 9%, transparent 10%), linear-gradient(#bfe9ff 0%, #eaf8ff 38%, #88b16d 100%); filter: saturate(1.05) contrast(1.02); }
            #fatcat-dom-factory .sky { position: absolute; inset: 0; background: radial-gradient(circle at 12% 10%, rgba(255,255,255,.88) 0 8%, transparent 9%), radial-gradient(circle at 78% 7%, rgba(255,255,255,.7) 0 10%, transparent 11%), linear-gradient(#bfe9ff 0%, #eaf8ff 42%, #96c57b 100%); }
            #fatcat-dom-factory .town { position: absolute; left: 0; right: 0; bottom: 9%; height: 32%; background: linear-gradient(rgba(255,255,255,0), rgba(68,83,72,.35)), repeating-linear-gradient(135deg, transparent 0 7%, rgba(108,77,55,.25) 7% 9%, transparent 9% 15%); }
            #fatcat-dom-factory .sky, #fatcat-dom-factory .town { opacity: .14; }
            #fatcat-dom-factory .factory-illustration { position:absolute; z-index:0; left:0; right:0; top:4.8%; bottom:12.2%; background:url("${factoryCutawayDataUri}") center top / contain no-repeat; opacity:.7; filter:saturate(1.1) contrast(1.05) brightness(.97); pointer-events:none; }
            #fatcat-dom-factory .factory-illustration:after { content:""; position:absolute; inset:0; background:linear-gradient(rgba(255,255,255,0) 0 11%, rgba(50,34,24,.05) 22%, rgba(45,30,22,.1) 76%, rgba(41,27,20,.18)); }
            #fatcat-dom-factory .building { position: absolute; z-index:1; left: 8%; right: 8%; top: 11%; bottom: 24%; border: 3px solid rgba(67,50,36,.72); border-radius: 22px 22px 8px 8px; background: rgba(76,55,40,.04); box-shadow: 0 8px 0 rgba(0,0,0,.18), inset 0 0 0 4px rgba(255,255,255,.04); overflow: hidden; }
            #fatcat-dom-factory .building:before { content:""; position:absolute; z-index:5; inset:0; pointer-events:none; background:linear-gradient(90deg, rgba(40,28,22,.22), transparent 9%, transparent 91%, rgba(40,28,22,.22)), repeating-linear-gradient(0deg, transparent 0 16.35%, rgba(255,230,176,.08) 16.35% 16.72%, transparent 16.72% 16.95%), repeating-linear-gradient(90deg, rgba(255,234,190,.05) 0 1px, transparent 1px 9.4%); mix-blend-mode:screen; opacity:.64; }
            #fatcat-dom-factory .building:after { content:""; position:absolute; z-index:6; left:0; right:0; bottom:0; height:6%; pointer-events:none; background:linear-gradient(rgba(48,35,28,0), rgba(30,22,18,.46)); }
            #fatcat-dom-factory .roof-deck { position: absolute; left: 7.9%; right: 7.9%; top: 9.9%; height: 4.4%; border-radius: 13px 13px 0 0; background: repeating-linear-gradient(90deg, rgba(255,220,165,.12) 0 9%, transparent 9% 11%), linear-gradient(#9a7a61 0 32%, #6a5040 33% 66%, #3f2e25 67%); border: 3px solid #3d2c21; box-shadow: 0 6px 0 rgba(0,0,0,.25), inset 0 2px 0 rgba(255,232,180,.14); }
            #fatcat-dom-factory .roof-deck:before { content:""; position:absolute; left:-1.4%; right:-1.4%; top:-45%; height:48%; border-radius:10px 10px 0 0; background:repeating-linear-gradient(90deg, #7d6250 0 9%, #5d4536 9% 12%); border:2px solid #3f2e25; box-shadow:0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .roof-deck:after { content:""; position:absolute; left:1%; right:1%; bottom:8%; height:16%; border-radius:999px; background:linear-gradient(90deg, rgba(255,228,168,.18), transparent 26%, rgba(255,228,168,.14) 58%, transparent); }
            #fatcat-dom-factory .roof-crates { position:absolute; z-index:3; left:10.2%; top:7.9%; width:17%; height:5.6%; pointer-events:none; filter:drop-shadow(0 3px 0 rgba(37,23,15,.24)); }
            #fatcat-dom-factory .roof-crates:before { content:""; position:absolute; left:0; bottom:0; width:38%; height:56%; border-radius:6px; background:linear-gradient(#9b7a58,#6c4d39); box-shadow:17px -13px 0 -3px #7d624b, 37px -3px 0 -5px #a27b53, inset 0 0 0 2px rgba(55,37,24,.24); }
            #fatcat-dom-factory .roof-crates:after { content:""; position:absolute; right:3%; bottom:4%; width:42%; height:34%; border-radius:999px 999px 7px 7px; background:linear-gradient(#7d6249,#493529); box-shadow:-8px -11px 0 -5px #8e6b48, inset 0 0 0 2px rgba(255,225,170,.08); }
            #fatcat-dom-factory .side-pipe { position: absolute; top: 17%; bottom: 17%; width: 3.2%; border-radius: 999px; background: linear-gradient(90deg,#202829,#69716f 42%,#2c3332 74%,#141919); border: 2px solid #26302f; box-shadow: inset 0 0 0 2px rgba(255,255,255,.08), 0 3px 0 rgba(0,0,0,.25); overflow:hidden; }
            #fatcat-dom-factory .side-pipe:before { content:""; position:absolute; inset:2% 18%; background:repeating-linear-gradient(0deg, transparent 0 7%, rgba(220,200,164,.22) 7% 8.4%, transparent 8.4% 14%); border-left:1px solid rgba(255,255,255,.1); border-right:1px solid rgba(0,0,0,.22); }
            #fatcat-dom-factory .side-pipe:after { content:""; position:absolute; left:-25%; right:-25%; top:9%; height:4.2%; border-radius:999px; background:linear-gradient(#7e6851,#3d3027); box-shadow:0 13vh 0 #4a3930, 0 26vh 0 #4a3930, 0 39vh 0 #4a3930, 0 52vh 0 #4a3930; opacity:.86; }
            #fatcat-dom-factory .side-pipe.left { left: 5.2%; } #fatcat-dom-factory .side-pipe.right { right: 5.2%; }
            #fatcat-dom-factory .ladder { position: absolute; left: 2.3%; top: 36%; width: 7%; height: 39%; border-radius: 12px; background: linear-gradient(90deg, #554334 0 18%, transparent 18% 82%, #554334 82%); box-shadow: inset 0 0 0 2px rgba(255,230,180,.12); }
            #fatcat-dom-factory .ladder::before { content: ""; position: absolute; inset: 7% 20%; background: repeating-linear-gradient(0deg, transparent 0 8%, #8e775d 8% 11%, transparent 11% 20%); }
            #fatcat-dom-factory .elevator-panel { position:absolute; left:2.5%; top:43%; width:7.2%; height:27%; border-radius:18px; background:linear-gradient(#d6b386,#80624c); border:3px solid #5b4130; box-shadow:0 5px 0 rgba(0,0,0,.32), inset 0 0 0 3px rgba(255,238,196,.18); }
            #fatcat-dom-factory .elevator-panel:before { content:""; position:absolute; left:16%; right:16%; top:7%; height:26%; border-radius:10px; background:linear-gradient(#c9a578,#8a6a51); box-shadow:inset 0 0 0 3px rgba(82,55,35,.24); }
            #fatcat-dom-factory .elevator-panel:after { content:""; position:absolute; left:28%; right:28%; top:15%; height:12%; border-radius:50%; background:radial-gradient(circle at 50% 62%,#6b4a35 0 20%,transparent 21%), radial-gradient(circle at 30% 34%,#6b4a35 0 15%,transparent 16%), radial-gradient(circle at 50% 25%,#6b4a35 0 15%,transparent 16%), radial-gradient(circle at 70% 34%,#6b4a35 0 15%,transparent 16%); }
            #fatcat-dom-factory .elevator-car { position:absolute; left:18%; right:18%; bottom:7%; height:34%; border-radius:12px 12px 8px 8px; background:linear-gradient(#4c3729,#1e1713); border:2px solid #3b2a20; overflow:hidden; box-shadow:inset 0 0 0 2px rgba(255,224,160,.12); }
            #fatcat-dom-factory .elevator-car:before { content:""; position:absolute; left:18%; right:18%; bottom:0; height:68%; border-radius:50% 50% 34% 34%; background:linear-gradient(#f5c482,#c97938); }
            #fatcat-dom-factory .elevator-car:after { content:""; position:absolute; left:27%; top:18%; width:46%; height:36%; border-radius:50%; background:radial-gradient(circle at 35% 45%,#3d281d 0 8%,transparent 9%), radial-gradient(circle at 65% 45%,#3d281d 0 8%,transparent 9%), linear-gradient(#ffd198,#df8c42); box-shadow:-8px -7px 0 -5px #6b4228, 8px -7px 0 -5px #6b4228; }
            #fatcat-dom-factory .elevator-paw { position:absolute; left:22%; right:22%; top:9%; height:18%; border-radius:50%; background:radial-gradient(circle at 50% 62%,#6f4e37 0 19%,transparent 20%), radial-gradient(circle at 30% 34%,#6f4e37 0 14%,transparent 15%), radial-gradient(circle at 50% 24%,#6f4e37 0 14%,transparent 15%), radial-gradient(circle at 70% 34%,#6f4e37 0 14%,transparent 15%); opacity:.94; }
            #fatcat-dom-factory .elevator-floor-indicator { position:absolute; left:18%; right:18%; bottom:44%; height:9%; border-radius:999px; background:linear-gradient(90deg,#8a5a2d,#f0c867,#8a5a2d); box-shadow:0 2px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(92,55,27,.34); }
            #fatcat-dom-factory .elevator-floor-indicator:before { content:""; position:absolute; left:16%; top:30%; width:16%; aspect-ratio:1; border-radius:50%; background:#fff0ad; box-shadow:16px 0 0 #6f4625, 32px 0 0 #fff0ad; }
            #fatcat-dom-factory .sign { position: absolute; z-index:4; left: 22%; top: 6.8%; width: 45.5%; height: 8.4%; border-radius: 16px; background: repeating-linear-gradient(0deg, rgba(255,227,158,.1) 0 17%, transparent 17% 23%), linear-gradient(90deg, rgba(73,42,20,.22), transparent 12%, transparent 88%, rgba(73,42,20,.22)), linear-gradient(#b97937, #74401f 72%, #573018); border: 4px solid #3f2b1d; display: flex; align-items: center; justify-content: center; color: #ffe4a7; font-size: 5.0%; font-weight: 900; text-shadow:0 3px 0 #5a321b, 0 0 8px rgba(255,223,150,.34); box-shadow: 0 7px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,231,166,.18); }
            #fatcat-dom-factory .sign:before, #fatcat-dom-factory .sign:after { content:""; position:absolute; top:13%; width:6.8%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 36% 30%,#ffe29a,#b87430 62%,#5b321b 63%); box-shadow:0 3px 0 rgba(0,0,0,.28); }
            #fatcat-dom-factory .sign:before { left:4.5%; } #fatcat-dom-factory .sign:after { right:4.5%; }
            #fatcat-dom-factory .sign .paw-mark { position:absolute; right:15.5%; width:8.5%; aspect-ratio:1; border-radius:50%; filter:drop-shadow(0 2px 0 #5a321b); background:radial-gradient(circle at 50% 62%,#f4c765 0 19%,transparent 20%), radial-gradient(circle at 30% 35%,#f4c765 0 13%,transparent 14%), radial-gradient(circle at 50% 25%,#f4c765 0 13%,transparent 14%), radial-gradient(circle at 70% 35%,#f4c765 0 13%,transparent 14%); }
            #fatcat-dom-factory .sign-posts { position:absolute; z-index:3; left:26%; right:40%; top:13.5%; height:3.2%; pointer-events:none; background:linear-gradient(90deg, #3f2e25 0 5%, transparent 5% 86%, #3f2e25 86% 91%, transparent 91%); opacity:.9; }
            #fatcat-dom-factory .chimney { position:absolute; z-index:4; right:17.1%; top:5.8%; width:5.4%; height:8.2%; border-radius:8px 8px 3px 3px; background:repeating-linear-gradient(0deg, rgba(255,229,180,.14) 0 14%, transparent 14% 22%), linear-gradient(90deg,#342821,#8a705f 42%,#3e3028 78%); border:2px solid #2f2622; box-shadow:0 4px 0 rgba(0,0,0,.25), inset 0 0 0 2px rgba(255,255,255,.07); }
            #fatcat-dom-factory .chimney:before { content:""; position:absolute; left:-11%; right:-11%; top:-13%; height:18%; border-radius:8px; background:linear-gradient(#8d7768,#372b25); border:2px solid #2f2622; }
            #fatcat-dom-factory .chimney:after { content:""; position:absolute; right:-70%; top:54%; width:96%; height:16%; border-radius:999px; background:linear-gradient(#625248,#2b2420); box-shadow:38px 0 0 -6px #3a302b; }
            #fatcat-dom-factory .roof-cat { position: absolute; z-index:5; right: 20%; top: 6.6%; width: 12.3%; height: 8.8%; filter: drop-shadow(0 4px 0 rgba(0,0,0,.34)); }
            #fatcat-dom-factory .roof-cat:before { content:""; position:absolute; left:32%; top:56%; width:25%; height:25%; border-radius:4px 4px 7px 7px; background:linear-gradient(#4d6f48,#29402b); box-shadow:inset 0 0 0 2px rgba(255,236,180,.18), 0 2px 0 rgba(0,0,0,.22); z-index:3; }
            #fatcat-dom-factory .roof-cat:after { content:""; position:absolute; left:23%; right:23%; bottom:0; height:16%; border-radius:50%; background:rgba(61,36,20,.25); filter:blur(1px); }
            #fatcat-dom-factory .roof-cat .cat-sprite::before { left:8%; right:8%; height:77%; border-radius:54% 54% 40% 40%; background:radial-gradient(circle at 30% 56%,#fff5df 0 11%,transparent 12%), radial-gradient(circle at 70% 58%,#fff5df 0 10%,transparent 11%), linear-gradient(#f3c27e,#d27c37); box-shadow:inset 14px -5px 0 rgba(255,255,255,.24), inset -12px -8px 0 rgba(121,63,28,.2); }
            #fatcat-dom-factory .roof-cat .cat-sprite::after { left:24%; top:2%; width:52%; height:48%; background:radial-gradient(circle at 30% 34%,#fff1d6 0 10%,transparent 11%), linear-gradient(#f4c07d,#df8740); box-shadow:-13px -10px 0 -8px #5b4030, 13px -10px 0 -8px #5b4030, inset 7px -4px 0 rgba(255,255,255,.26); }
            #fatcat-dom-factory .roof-cat .cat-face { top:19%; }
            #fatcat-dom-factory .flag { position: absolute; z-index:4; right: 8.8%; top: 5.8%; width: 11%; height: 6.9%; background: linear-gradient(90deg,#456f4f,#638f64 72%,#4b7856); border-radius: 0 12px 12px 0; box-shadow: inset 0 0 0 2px rgba(255,255,255,.18), 0 4px 0 rgba(0,0,0,.22); display: flex; align-items: center; justify-content: center; font-size: 0; transform:skewY(-5deg); }
            #fatcat-dom-factory .flag:before { content:""; position:absolute; left:-13%; top:-62%; width:7%; height:180%; border-radius:999px; background:linear-gradient(#413632,#171311); box-shadow:0 0 0 2px rgba(255,230,170,.12); transform:skewY(5deg); }
            #fatcat-dom-factory .flag:after { content:""; width:43%; aspect-ratio:1; border-radius:50%; filter:drop-shadow(0 2px 0 rgba(49,42,22,.28)); background:radial-gradient(circle at 50% 62%,#f1c24e 0 19%,transparent 20%), radial-gradient(circle at 30% 35%,#f1c24e 0 13%,transparent 14%), radial-gradient(circle at 50% 25%,#f1c24e 0 13%,transparent 14%), radial-gradient(circle at 70% 35%,#f1c24e 0 13%,transparent 14%); }
            #fatcat-dom-factory .floor { position: relative; height: 16.66%; border-top: 3px solid #3e3027; background: linear-gradient(90deg, rgba(56,42,33,.62), rgba(130,100,75,.48) 48%, rgba(54,40,32,.64)); box-sizing: border-box; overflow:hidden; }
            #fatcat-dom-factory .floor:nth-child(odd) { background: linear-gradient(90deg, rgba(48,38,32,.62), rgba(118,91,69,.48) 48%, rgba(52,40,33,.64)); }
            #fatcat-dom-factory .floor:before { content:""; position:absolute; left:0; right:0; top:0; height:26%; background:linear-gradient(rgba(255,232,170,.23), rgba(255,231,165,0)), repeating-linear-gradient(90deg, rgba(255,236,194,.11) 0 2px, transparent 2px 11%); pointer-events:none; }
            #fatcat-dom-factory .floor:after { content:""; position:absolute; left:0; right:0; bottom:0; height:12%; background:linear-gradient(90deg,#282018,#70533d 45%,#2b211a); box-shadow:0 -2px 0 rgba(255,224,160,.12) inset, 0 -6px 0 rgba(33,24,18,.28) inset; pointer-events:none; }
            #fatcat-dom-factory .floor-glow { position:absolute; z-index:0; inset:0; pointer-events:none; background:radial-gradient(ellipse at 54% 18%, rgba(255,206,104,.18), transparent 34%), radial-gradient(ellipse at 72% 70%, rgba(255,157,64,.12), transparent 30%); mix-blend-mode:screen; opacity:.78; }
            #fatcat-dom-factory .floor-scene-tank .floor-glow { background:radial-gradient(ellipse at 58% 26%, rgba(210,234,255,.14), transparent 34%), radial-gradient(ellipse at 77% 72%, rgba(255,203,111,.12), transparent 30%); }
            #fatcat-dom-factory .floor-scene-cafe .floor-glow { background:radial-gradient(ellipse at 44% 18%, rgba(255,221,134,.24), transparent 36%), radial-gradient(ellipse at 72% 68%, rgba(255,170,80,.14), transparent 30%); }
            #fatcat-dom-factory .room-lights { position: absolute; inset: 8% 4%; background-image: radial-gradient(circle at 21% 12%, rgba(255,221,128,.85) 0 2%, transparent 3%), radial-gradient(circle at 58% 13%, rgba(255,221,128,.7) 0 1.8%, transparent 3%), radial-gradient(ellipse at 42% 46%, rgba(255,200,92,.18), transparent 36%), linear-gradient(90deg, transparent 0 31%, rgba(47,35,28,.72) 31% 32%, transparent 32% 64%, rgba(47,35,28,.72) 64% 65%, transparent 65%); border-radius: 6px; opacity: .38; }
            #fatcat-dom-factory .room-lights:before, #fatcat-dom-factory .room-lights:after { content:""; position:absolute; top:7%; width:12%; height:2px; background:#4a3325; box-shadow:0 5px 10px rgba(255,198,88,.45); }
            #fatcat-dom-factory .room-lights:before { left:15%; } #fatcat-dom-factory .room-lights:after { left:52%; }
            #fatcat-dom-factory .wall-details { position:absolute; z-index:0; left:31%; right:22%; top:5%; bottom:10%; pointer-events:none; opacity:.82; }
            #fatcat-dom-factory .wall-details:before { content:""; position:absolute; left:5%; right:3%; top:2%; height:30%; background:radial-gradient(circle at 8% 38%,#e7c17b 0 3%,transparent 4%), radial-gradient(circle at 17% 56%,#c99052 0 2.8%,transparent 3.8%), radial-gradient(circle at 84% 46%,#f2d9a6 0 3%,transparent 4%), linear-gradient(90deg, transparent 0 18%, rgba(68,49,37,.55) 18% 19%, transparent 19% 47%, rgba(68,49,37,.55) 47% 48%, transparent 48% 76%, rgba(68,49,37,.55) 76% 77%, transparent 77%); border-bottom:2px solid rgba(55,38,27,.62); }
            #fatcat-dom-factory .wall-details:after { content:""; position:absolute; left:3%; right:5%; bottom:4%; height:20%; background:radial-gradient(circle at 11% 58%,#6f4b32 0 4%,transparent 5%), radial-gradient(circle at 21% 44%,#b47a42 0 4%,transparent 5%), radial-gradient(circle at 68% 64%,#8a5a34 0 4%,transparent 5%), radial-gradient(circle at 80% 48%,#c58b4d 0 4%,transparent 5%), linear-gradient(#6b4932,#3a2a22); border-radius:999px 999px 8px 8px; box-shadow:0 3px 0 rgba(0,0,0,.22); }
            #fatcat-dom-factory .wall-details .paper { position:absolute; width:7%; height:18%; border-radius:3px; background:linear-gradient(#f4dfad,#be8d58); box-shadow:0 2px 0 rgba(44,29,18,.25); transform:rotate(-5deg); }
            #fatcat-dom-factory .wall-details .paper.a { left:23%; top:38%; } #fatcat-dom-factory .wall-details .paper.b { left:36%; top:32%; transform:rotate(6deg); } #fatcat-dom-factory .wall-details .paper.c { right:13%; top:34%; transform:rotate(-2deg); }
            #fatcat-dom-factory .wall-details .jar { position:absolute; width:7%; height:14%; border-radius:45% 45% 18% 18%; background:linear-gradient(#d6b276,#765035); box-shadow:0 2px 0 rgba(41,27,18,.24), 10px -1px 0 -2px #9a6a3d, 20px 2px 0 -4px #c28b53; }
            #fatcat-dom-factory .wall-details .jar.a { left:8%; top:48%; } #fatcat-dom-factory .wall-details .jar.b { right:26%; top:47%; }
            #fatcat-dom-factory .room-decor { position:absolute; z-index:0; left:31%; right:23%; top:15%; bottom:13%; opacity:.88; pointer-events:none; }
            #fatcat-dom-factory .decor-part { position:absolute; border-radius:6px; box-shadow:inset 0 0 0 2px rgba(255,229,170,.11), 0 3px 0 rgba(41,27,19,.22); }
            #fatcat-dom-factory .decor-board { left:31%; top:8%; width:24%; height:25%; background:linear-gradient(#425441,#202b21); box-shadow:inset 0 0 0 2px #9a7140, 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .decor-board:after { content:""; position:absolute; left:14%; right:14%; top:26%; height:5%; background:#e1bd6c; box-shadow:0 9px 0 rgba(225,189,108,.78), 18px 19px 0 rgba(225,189,108,.58); }
            #fatcat-dom-factory .decor-shelf { left:2%; bottom:10%; width:28%; height:46%; background:repeating-linear-gradient(0deg,#4b3427 0 18%,#a4774d 18% 24%); }
            #fatcat-dom-factory .decor-crates { right:3%; bottom:8%; width:25%; height:36%; background:linear-gradient(#a77742,#6c472b); }
            #fatcat-dom-factory .decor-crates:before { content:""; position:absolute; inset:18% 12%; border-top:2px solid rgba(71,45,25,.6); border-bottom:2px solid rgba(71,45,25,.6); }
            #fatcat-dom-factory .decor-pipe { right:0; top:12%; width:34%; height:30%; border-top:5px solid #4c4038; border-right:5px solid #4c4038; border-radius:0 16px 0 0; box-shadow:none; }
            #fatcat-dom-factory .decor-gauge { right:18%; top:21%; width:13%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#f2dfb8 0 44%,#5a4638 45% 58%,#27211f 59%); }
            #fatcat-dom-factory .decor-bags { left:4%; bottom:7%; width:30%; height:42%; background:linear-gradient(#d2ad71,#87633d); color:#4a2f1f; font-size:1.35%; font-weight:900; display:flex; align-items:center; justify-content:center; text-align:center; }
            #fatcat-dom-factory .decor-bags:before { content:""; position:absolute; left:18%; right:18%; top:-10%; height:22%; border-radius:50%; background:#d2ad71; }
            #fatcat-dom-factory .decor-window { right:5%; top:9%; width:22%; height:31%; background:linear-gradient(#d7efff,#86b9db); box-shadow:inset 0 0 0 3px #614735; }
            #fatcat-dom-factory .decor-window:after { content:""; position:absolute; left:47%; top:0; bottom:0; width:3px; background:#614735; box-shadow:-18px 50% 0 -1px #614735; }
            #fatcat-dom-factory .decor-table { left:15%; bottom:10%; width:42%; height:16%; background:#7a5131; box-shadow:0 12px 0 -7px #4b3020, 0 3px 0 rgba(0,0,0,.26); }
            #fatcat-dom-factory .decor-steam { left:53%; top:10%; width:9%; height:35%; background:radial-gradient(ellipse at 50% 75%, rgba(255,255,255,.42) 0 18%, transparent 19%), radial-gradient(ellipse at 45% 42%, rgba(255,255,255,.32) 0 17%, transparent 18%); box-shadow:none; }
            #fatcat-dom-factory .decor-roast .decor-steam, #fatcat-dom-factory .decor-tank .decor-steam { animation: fatcatSteam 3.4s ease-in-out infinite; }
            #fatcat-dom-factory .decor-lamp { left:47%; top:0; width:12%; height:36%; border-radius:0; background:linear-gradient(90deg, transparent 0 45%, #3a2a21 45% 55%, transparent 55%); box-shadow:none; }
            #fatcat-dom-factory .decor-lamp:before { content:""; position:absolute; left:17%; right:17%; top:30%; height:24%; border-radius:50% 50% 34% 34%; background:linear-gradient(#5b4434,#2c211b); box-shadow:0 10px 18px rgba(255,192,82,.42); }
            #fatcat-dom-factory .decor-lamp:after { content:""; position:absolute; left:-18%; right:-18%; top:49%; height:45%; border-radius:50%; background:radial-gradient(ellipse at 50% 0, rgba(255,207,92,.32), transparent 68%); }
            #fatcat-dom-factory .decor-notes { left:58%; top:34%; width:19%; height:28%; background:linear-gradient(#f1d9a0,#bd8d58); transform:rotate(-3deg); }
            #fatcat-dom-factory .decor-notes:before { content:""; position:absolute; left:-48%; top:13%; width:42%; height:70%; border-radius:4px; background:linear-gradient(#f6e5b9,#c39358); transform:rotate(7deg); box-shadow:26px 8px 0 -8px #e1bd79; }
            #fatcat-dom-factory .decor-beans { left:40%; bottom:7%; width:40%; height:12%; border-radius:999px; background:radial-gradient(circle at 8% 50%,#7a3e1f 0 9%,transparent 10%), radial-gradient(circle at 21% 55%,#935028 0 9%,transparent 10%), radial-gradient(circle at 34% 46%,#6e371c 0 9%,transparent 10%), radial-gradient(circle at 49% 56%,#935028 0 9%,transparent 10%), radial-gradient(circle at 64% 47%,#7a3e1f 0 9%,transparent 10%), radial-gradient(circle at 80% 55%,#935028 0 9%,transparent 10%); box-shadow:none; }
            #fatcat-dom-factory .decor-plant { right:2%; bottom:8%; width:16%; height:34%; background:linear-gradient(#8b5a32,#4e3424); border-radius:0 0 8px 8px; }
            #fatcat-dom-factory .decor-plant:before { content:""; position:absolute; left:-30%; right:-30%; top:-60%; height:80%; background:radial-gradient(ellipse at 30% 80%,#6fa45a 0 22%,transparent 23%), radial-gradient(ellipse at 52% 68%,#4f873e 0 25%,transparent 26%), radial-gradient(ellipse at 73% 80%,#7ab35f 0 20%,transparent 21%); }
            #fatcat-dom-factory .decor-conveyor { left:28%; right:10%; bottom:16%; height:12%; border-radius:999px; background:linear-gradient(#5a4436,#2d241f); box-shadow:inset 0 0 0 2px rgba(255,224,160,.1), 0 3px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .decor-conveyor:after { content:""; position:absolute; inset:25% 7%; background:repeating-linear-gradient(90deg,#d08a3b 0 7%, transparent 7% 13%); border-radius:999px; opacity:.78; }
            #fatcat-dom-factory .decor-roast .decor-conveyor:after, #fatcat-dom-factory .decor-mill .decor-conveyor:after { animation: fatcatBelt 2.8s linear infinite; }
            #fatcat-dom-factory .decor-clock { right:6%; top:10%; width:13%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#f2dfb8 0 52%,#7c5f45 53% 65%,#2f2723 66%); }
            #fatcat-dom-factory .decor-clock:after { content:""; position:absolute; left:49%; top:24%; width:3%; height:29%; background:#4c3424; transform-origin:50% 90%; transform:rotate(42deg); box-shadow:5px 8px 0 -1px #4c3424; }
            #fatcat-dom-factory .room-foreground { position:absolute; z-index:2; left:30%; right:24%; bottom:6%; height:34%; pointer-events:none; opacity:.9; }
            #fatcat-dom-factory .room-foreground:before, #fatcat-dom-factory .room-foreground:after { content:""; position:absolute; bottom:0; filter:drop-shadow(0 3px 0 rgba(36,22,14,.2)); }
            #fatcat-dom-factory .room-foreground:before { left:3%; width:26%; height:45%; border-radius:8px; background:linear-gradient(#aa7440,#68422a); box-shadow:20px -8px 0 -5px #c18a4f, 48px 1px 0 -8px #785134; }
            #fatcat-dom-factory .room-foreground:after { right:2%; width:32%; height:34%; border-radius:999px 999px 10px 10px; background:radial-gradient(circle at 18% 48%,#7b3d1e 0 8%,transparent 9%), radial-gradient(circle at 38% 44%,#9b5428 0 8%,transparent 9%), radial-gradient(circle at 60% 50%,#75401f 0 8%,transparent 9%), linear-gradient(#6b4a35,#2d241f); }
            #fatcat-dom-factory .room-foreground.office:before { left:3%; width:44%; height:38%; background:linear-gradient(#5e3e29 0 20%,#3a2a21 21% 72%,#241c18 73%); box-shadow:38px -10px 0 -12px #25323a, 76px 0 0 -15px #c99b56, inset 0 0 0 2px rgba(255,225,164,.12); }
            #fatcat-dom-factory .room-foreground.office:after { right:4%; width:16%; height:56%; border-radius:50% 50% 8px 8px; background:radial-gradient(ellipse at 50% 12%,#70a855 0 28%,transparent 29%), radial-gradient(ellipse at 24% 34%,#87c760 0 18%,transparent 19%), linear-gradient(#8b5a32,#4e3424); }
            #fatcat-dom-factory .room-foreground.roast:before { left:8%; width:46%; height:62%; border-radius:50% 50% 12px 12px; background:radial-gradient(circle at 46% 46%,#efb45c 0 18%,#694022 19% 27%,transparent 28%), linear-gradient(120deg,#c87b36,#5b3727); box-shadow:42px 20px 0 -18px #3b2d25, inset 0 0 0 4px rgba(70,40,24,.42); }
            #fatcat-dom-factory .room-foreground.roast:after { right:4%; width:38%; height:20%; border-radius:999px; background:repeating-radial-gradient(circle at 10% 48%,#8a4b23 0 6%, transparent 7% 15%), linear-gradient(#5a3d2e,#2e241f); }
            #fatcat-dom-factory .room-foreground.tank:before { left:0; width:19%; height:70%; border-radius:50% 50% 8px 8px; background:linear-gradient(#c9bea4,#756852); box-shadow:43px 0 0 #8f836d, 86px 0 0 #afa187, inset 0 0 0 4px rgba(55,43,32,.34); }
            #fatcat-dom-factory .room-foreground.tank:after { right:3%; width:26%; aspect-ratio:1; bottom:12%; border-radius:50%; background:radial-gradient(circle,#efe2c4 0 42%,#5a4638 43% 58%,#27211f 59%); }
            #fatcat-dom-factory .room-foreground.mill:before { left:7%; width:44%; height:55%; border-radius:14px 14px 10px 10px; background:radial-gradient(circle at 50% 48%,#e2a75a 0 16%,#513222 17% 25%,transparent 26%), linear-gradient(#b97335,#493126); box-shadow:44px 16px 0 -18px #2e2520, inset 0 0 0 4px rgba(78,47,28,.38); }
            #fatcat-dom-factory .room-foreground.mill:after { right:2%; width:31%; height:31%; border-radius:8px 8px 18px 18px; background:linear-gradient(#d4ae70,#8a653f); box-shadow:inset 0 0 0 3px rgba(73,43,24,.24); }
            #fatcat-dom-factory .room-foreground.cafe:before { left:0; width:58%; height:36%; border-radius:9px; background:linear-gradient(#9b6841,#5b3928); box-shadow:58px -10px 0 -21px #3d2e25, 105px -3px 0 -28px #f1e0bd, inset 0 0 0 2px rgba(255,228,170,.12); }
            #fatcat-dom-factory .room-foreground.cafe:after { right:2%; width:22%; height:42%; border-radius:0 0 12px 12px; background:#fff0d1; box-shadow:inset 0 0 0 3px #8e6039, 16px 3px 0 -9px transparent; }
            #fatcat-dom-factory .room-foreground.storage:before { left:2%; width:38%; height:50%; background:linear-gradient(#d2ad71,#87633d); border-radius:50% 50% 10px 10px; box-shadow:34px 8px 0 -7px #b88c58, 72px 2px 0 -10px #6c4a32; }
            #fatcat-dom-factory .room-foreground.storage:after { right:4%; width:40%; height:40%; border-radius:8px; background:repeating-linear-gradient(0deg,#4e3527 0 20%,#8d6847 21% 30%); }
            #fatcat-dom-factory .decor-office .decor-crates { display:none; }
            #fatcat-dom-factory .decor-office .decor-table { left:8%; width:42%; bottom:12%; }
            #fatcat-dom-factory .decor-office .decor-board { left:42%; width:28%; }
            #fatcat-dom-factory .decor-office .decor-plant { right:2%; }
            #fatcat-dom-factory .decor-roast .decor-gauge, #fatcat-dom-factory .decor-tank .decor-gauge { display:block; }
            #fatcat-dom-factory .decor-tank .decor-shelf { display:none; }
            #fatcat-dom-factory .decor-tank .decor-pipe { right:6%; width:42%; height:42%; }
            #fatcat-dom-factory .decor-roast .decor-conveyor, #fatcat-dom-factory .decor-tank .decor-conveyor, #fatcat-dom-factory .decor-mill .decor-conveyor { display:block; }
            #fatcat-dom-factory .decor-cafe .decor-window { display:block; }
            #fatcat-dom-factory .decor-cafe .decor-clock { display:block; }
            #fatcat-dom-factory .decor-storage .decor-board { display:none; }
            #fatcat-dom-factory .props { position: absolute; z-index:1; left: 37%; right: 12%; bottom: 9%; height: 55%; border-radius: 8px; background: linear-gradient(90deg, rgba(48,35,27,.5), rgba(255,196,100,.22), rgba(38,28,22,.5)); display: grid; grid-template-columns: 24% 1fr 24%; align-items: end; gap: 2%; padding: 1.5%; box-sizing: border-box; opacity:.86; }
            #fatcat-dom-factory .prop-asset { position:absolute; z-index:1; left:42%; right:16%; bottom:7%; height:58%; background:center bottom / contain no-repeat; filter:drop-shadow(0 4px 0 rgba(34,22,14,.25)); opacity:.96; pointer-events:none; }
            #fatcat-dom-factory .prop-roast, #fatcat-dom-factory .prop-mill { animation: fatcatMachinePulse 3.2s ease-in-out infinite; transform-origin:50% 80%; }
            #fatcat-dom-factory .prop-asset.prop-office { left:36%; right:16%; bottom:8%; height:54%; }
            #fatcat-dom-factory .prop-asset.prop-roast, #fatcat-dom-factory .prop-asset.prop-mill { left:39%; right:14%; bottom:5%; height:62%; }
            #fatcat-dom-factory .prop-asset.prop-tank { left:41%; right:15%; bottom:7%; height:63%; }
            #fatcat-dom-factory .prop-asset.prop-cafe { left:36%; right:14%; bottom:7%; height:56%; }
            #fatcat-dom-factory .prop-asset.prop-storage { left:38%; right:13%; bottom:5%; height:58%; }
            #fatcat-dom-factory .prop-asset:before, #fatcat-dom-factory .prop-asset:after { content:""; position:absolute; filter:drop-shadow(0 3px 0 rgba(43,27,18,.22)); opacity:.72; }
            #fatcat-dom-factory .prop-office:before { left:4%; bottom:8%; width:44%; height:36%; border-radius:8px; background:linear-gradient(#7a5537,#3d2a20); box-shadow:52px -18px 0 -20px #25323a, 92px -8px 0 -16px #c99955; }
            #fatcat-dom-factory .prop-office:after { right:9%; bottom:12%; width:16%; height:38%; border-radius:50% 50% 8px 8px; background:radial-gradient(ellipse at 50% 18%,#70a855 0 28%,transparent 29%), linear-gradient(#8b5a32,#4e3424); }
            #fatcat-dom-factory .prop-roast:before, #fatcat-dom-factory .prop-mill:before { left:13%; bottom:9%; width:46%; height:52%; border-radius:50% 50% 14px 14px; background:radial-gradient(circle at 42% 46%,#e0a14c 0 18%,#684025 19% 27%,transparent 28%), linear-gradient(120deg,#c67833,#5d3928); box-shadow:inset 0 0 0 4px rgba(80,45,26,.45); }
            #fatcat-dom-factory .prop-roast:after, #fatcat-dom-factory .prop-mill:after { right:9%; bottom:10%; width:28%; height:22%; border-radius:999px; background:repeating-radial-gradient(circle at 12% 48%,#8b4b24 0 7%, transparent 8% 18%), linear-gradient(#5a3d2e,#2e241f); }
            #fatcat-dom-factory .prop-tank:before { left:5%; bottom:7%; width:22%; height:64%; border-radius:50% 50% 8px 8px; background:linear-gradient(#c3b89d,#786a56); box-shadow:72px 0 0 #8d806a, 144px 0 0 #aa9c82, inset 0 0 0 4px rgba(55,43,32,.34); }
            #fatcat-dom-factory .prop-tank:after { right:11%; bottom:16%; width:20%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,#efe2c4 0 42%,#5a4638 43% 58%,#27211f 59%); }
            #fatcat-dom-factory .prop-cafe:before { left:7%; bottom:8%; width:52%; height:34%; border-radius:8px; background:linear-gradient(#9b6841,#5b3928); box-shadow:66px -8px 0 -18px #3d2e25, 116px -2px 0 -26px #f1e0bd; }
            #fatcat-dom-factory .prop-cafe:after { right:10%; bottom:17%; width:22%; height:24%; border-radius:0 0 14px 14px; background:#fff0d1; box-shadow:inset 0 0 0 3px #8e6039, 20px 4px 0 -12px transparent; }
            #fatcat-dom-factory .prop-storage:before { left:5%; bottom:6%; width:36%; height:44%; border-radius:8px; background:repeating-linear-gradient(0deg,#4e3527 0 20%,#8d6847 21% 30%); }
            #fatcat-dom-factory .prop-storage:after { right:4%; bottom:5%; width:52%; height:40%; border-radius:50% 50% 18px 18px; background:radial-gradient(ellipse at 30% 22%,#e0bc80 0 28%,transparent 29%), radial-gradient(ellipse at 72% 18%,#d0aa70 0 28%,transparent 29%), linear-gradient(#d2ad71,#87633d); }
            #fatcat-dom-factory .machine, #fatcat-dom-factory .shelf, #fatcat-dom-factory .bags { min-height: 68%; border-radius: 8px; background: linear-gradient(#8a5c35,#3f2b20); box-shadow: inset 0 0 0 2px rgba(255,225,165,.14), 0 3px 0 rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; color: #ffd88d; font-size: 3.1%; }
            #fatcat-dom-factory .machine { min-height: 88%; border-radius: 50% 50% 10px 10px; background: radial-gradient(circle at 50% 42%, #d58b3d 0 24%, #553522 26% 34%, #b66b2e 36% 55%, #3b2a21 57%); }
            #fatcat-dom-factory .shelf { align-self: stretch; background: repeating-linear-gradient(0deg,#4e3527 0 18%,#8d6847 18% 24%); }
            #fatcat-dom-factory .bags { background: linear-gradient(#d2ad71,#87633d); color: #4a2f1f; font-size: 2.7%; font-weight: 900; text-align: center; line-height: 1.1; }
            #fatcat-dom-factory .props { display: grid; }
            #fatcat-dom-factory .pipe, #fatcat-dom-factory .cat { display: block; }
            #fatcat-dom-factory .pipe { position: absolute; right: 9%; top: 13%; width: 18%; height: 16%; border-top: 6px solid #48352a; border-right: 6px solid #48352a; border-radius: 0 16px 0 0; opacity: .75; }
            #fatcat-dom-factory .cat { position: absolute; z-index:3; bottom: 8%; width: 8.7%; height: 49%; filter: drop-shadow(0 3px 0 rgba(0,0,0,.24)); }
            #fatcat-dom-factory .cat.a { left: 35%; } #fatcat-dom-factory .cat.b { left: 52%; } #fatcat-dom-factory .cat.c { left: 68%; }
            #fatcat-dom-factory .cat:after { content:""; position:absolute; left:55%; bottom:4%; width:28%; height:38%; border-radius:999px; border-right:5px solid rgba(132,75,37,.8); transform:rotate(22deg); }
            #fatcat-dom-factory .cat:before { content:""; position:absolute; z-index:3; left:43%; bottom:20%; width:34%; height:20%; border-radius:6px; opacity:.95; transform:rotate(-6deg); }
            #fatcat-dom-factory .cat.b { transform:scale(.86) translateY(7%); }
            #fatcat-dom-factory .cat.c { transform:scale(.72) translateY(18%); }
            #fatcat-dom-factory .cat.cat-office:before { width:36%; height:14%; bottom:22%; border-radius:4px; background:linear-gradient(#26333a,#15191c); box-shadow:0 -9px 0 -5px #c79652; }
            #fatcat-dom-factory .cat.cat-roast:before, #fatcat-dom-factory .cat.cat-mill:before { width:46%; height:10%; bottom:14%; left:38%; border-radius:999px; background:#7a4b27; box-shadow:18px 3px 0 -5px #d18a3d; transform:rotate(18deg); }
            #fatcat-dom-factory .cat.cat-tank:before { width:28%; height:30%; bottom:13%; left:48%; border-radius:3px 3px 8px 8px; background:linear-gradient(#dfeef5 0 24%,#c39153 25%); box-shadow:inset 0 0 0 2px rgba(94,58,32,.25); }
            #fatcat-dom-factory .cat.cat-cafe:before { width:30%; height:26%; bottom:18%; left:48%; border-radius:0 0 8px 8px; background:#fff0d1; box-shadow:inset 0 0 0 2px #8e6039, 14px 4px 0 -8px transparent; }
            #fatcat-dom-factory .cat.cat-storage:before { width:40%; height:24%; bottom:13%; left:40%; border-radius:7px; background:linear-gradient(#c39358,#765035); box-shadow:inset 0 0 0 2px rgba(67,40,23,.3); }
            #fatcat-dom-factory .cat.a .cat-sprite { animation: fatcatWorkerBob 3.6s ease-in-out infinite; }
            #fatcat-dom-factory .cat.b .cat-sprite { animation: fatcatWorkerBob 4.2s ease-in-out infinite .35s; }
            #fatcat-dom-factory .cat.c .cat-sprite { animation: fatcatWorkerBob 4.8s ease-in-out infinite .7s; }
            #fatcat-dom-factory .cat.b .cat-sprite::before { background:linear-gradient(#ece5d9,#afa396); }
            #fatcat-dom-factory .cat.b .cat-sprite::after { background:linear-gradient(#f3eee4,#b8aca1); }
            #fatcat-dom-factory .cat.c .cat-sprite::before, #fatcat-dom-factory .cat.c .cat-sprite::after { background:linear-gradient(#4e4843,#171413); }
            #fatcat-dom-factory .cat-sprite { position: relative; width: 100%; height: 100%; }
            #fatcat-dom-factory .cat-sprite::before { content: ""; position: absolute; left: 18%; right: 18%; bottom: 0; height: 70%; border-radius: 48% 48% 38% 38%; background: linear-gradient(#f6d9b0,#d9904d); box-shadow: inset -10px -8px 0 rgba(117,67,34,.18); }
            #fatcat-dom-factory .cat-sprite::after { content: ""; position: absolute; left: 24%; top: 0; width: 52%; height: 52%; border-radius: 50%; background: linear-gradient(#f8dcb5,#e29a58); box-shadow: -12px -9px 0 -8px #5b4030, 12px -9px 0 -8px #5b4030, inset 8px -4px 0 rgba(255,255,255,.28); }
            #fatcat-dom-factory .cat-face { position: absolute; left: 37%; top: 19%; width: 26%; height: 18%; z-index: 1; border-radius: 999px; background: radial-gradient(circle at 24% 38%, #4a2f1f 0 12%, transparent 13%), radial-gradient(circle at 76% 38%, #4a2f1f 0 12%, transparent 13%), radial-gradient(circle at 50% 62%, #8b4a2a 0 10%, transparent 11%); }
            #fatcat-dom-factory .worker-cats { position:absolute; z-index:2; left:38%; right:25%; bottom:8%; height:44%; pointer-events:none; }
            #fatcat-dom-factory .mini-cat { position:absolute; bottom:0; width:14%; height:54%; filter:drop-shadow(0 2px 0 rgba(0,0,0,.24)); }
            #fatcat-dom-factory .mini-cat:before { content:""; position:absolute; left:18%; right:18%; bottom:0; height:60%; border-radius:50% 50% 36% 36%; background:linear-gradient(#f5d4a7,#d98b45); box-shadow:inset -6px -4px 0 rgba(115,66,34,.16); }
            #fatcat-dom-factory .mini-cat:after { content:""; position:absolute; left:22%; top:7%; width:56%; height:46%; border-radius:50%; background:radial-gradient(circle at 35% 45%,#3d281d 0 6%,transparent 7%), radial-gradient(circle at 65% 45%,#3d281d 0 6%,transparent 7%), linear-gradient(#f6ddb8,#e09854); box-shadow:-7px -5px 0 -4px #6a4329, 7px -5px 0 -4px #6a4329; }
            #fatcat-dom-factory .mini-cat.gray:before, #fatcat-dom-factory .mini-cat.gray:after { background:linear-gradient(#ede7dc,#ada194); }
            #fatcat-dom-factory .mini-cat.black:before, #fatcat-dom-factory .mini-cat.black:after { background:linear-gradient(#55504a,#171413); }
            #fatcat-dom-factory .mini-cat.a { left:4%; transform:scale(.88); } #fatcat-dom-factory .mini-cat.b { left:42%; transform:scale(.76) translateY(11%); } #fatcat-dom-factory .mini-cat.c { right:2%; transform:scale(.66) translateY(20%); }
            #fatcat-dom-factory .worker-cats.office .mini-cat.a:before { box-shadow:inset -6px -4px 0 rgba(115,66,34,.16), 11px -1px 0 -5px #26333a; }
            #fatcat-dom-factory .worker-cats.cafe .mini-cat.c { right:12%; }
            #fatcat-dom-factory .floor-card { position: absolute; z-index:2; left: 2.4%; top: 16%; width: 26.5%; height: 60%; border-radius: 14px; background: linear-gradient(#fff6de, #ddc29a); border: 3px solid #7a6044; color: #4a2f1f; display: grid; grid-template-columns: 36% 1fr; align-items: center; box-sizing: border-box; box-shadow: 0 4px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,255,255,.38); overflow:hidden; }
            #fatcat-dom-factory .floor-card:before { content:""; position:absolute; left:0; top:0; bottom:0; width:36%; background:linear-gradient(#9a7d58,#6f573e); z-index:0; }
            #fatcat-dom-factory .floor-no, #fatcat-dom-factory .floor-name { position:relative; z-index:1; }
            #fatcat-dom-factory .floor-no { font-size: 4.8%; font-weight: 900; text-align: center; color: #fff7d7; text-shadow: 0 2px #624326; }
            #fatcat-dom-factory .floor-name { font-size: 2.0%; font-weight: 900; line-height: 1.25; padding-right:5%; white-space:nowrap; overflow:hidden; text-overflow:clip; }
            #fatcat-dom-factory .floor-name span { display: block; font-size: 82%; margin-top: 3%; white-space:nowrap; }
            #fatcat-dom-factory .floor-medal { position:absolute; z-index:2; left:2.8%; bottom:7%; width:7.2%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 38% 24%, rgba(255,255,255,.46), transparent 21%), linear-gradient(#f0c56f,#a96a2a); border:2px solid #fff0bc; color:#fff7d7; display:flex; align-items:center; justify-content:center; font-size:1.58%; font-weight:900; text-shadow:0 1px #6b3d1c; box-shadow:0 3px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(103,62,26,.22); }
            #fatcat-dom-factory .bonus { position: absolute; z-index:3; right: 2.7%; top: 21%; width: 22%; height: 52%; border-radius: 14px; background: radial-gradient(circle at 50% 0, rgba(255,221,146,.22), transparent 34%), linear-gradient(#4a4439,#20211f); border: 3px solid #a88a58; display: grid; grid-template-columns:34% 1fr; grid-template-rows:1fr 1fr; align-items:center; column-gap:3%; padding:0 5%; box-sizing:border-box; font-size: 1.75%; font-weight: 900; line-height: 1.2; box-shadow: 0 5px 0 rgba(0,0,0,.35), inset 0 0 0 2px rgba(255,223,151,.16), inset 0 14px 18px rgba(255,227,158,.06); }
            #fatcat-dom-factory .bonus-icon { position:relative; grid-row:1/3; width:100%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffd65c,#c98218); box-shadow:inset 0 0 0 3px #8e5913, 0 2px 0 rgba(0,0,0,.25); justify-self:center; }
            #fatcat-dom-factory .bonus-icon:before, #fatcat-dom-factory .bonus-icon:after { content:""; position:absolute; }
            #fatcat-dom-factory .bonus-office:before { inset:24%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#fff0b0; }
            #fatcat-dom-factory .bonus-roast, #fatcat-dom-factory .bonus-mill { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#9d5529,#4e2815); transform:rotate(25deg); }
            #fatcat-dom-factory .bonus-roast:before, #fatcat-dom-factory .bonus-mill:before { left:45%; top:13%; width:7%; height:74%; border-radius:99px; background:rgba(255,221,165,.38); transform:rotate(8deg); }
            #fatcat-dom-factory .bonus-tank:before { left:20%; right:20%; bottom:18%; height:48%; border-radius:0 0 32% 32%; background:linear-gradient(#fff3d4 0 22%,#cde0ec 23% 48%,#b78552 49%); box-shadow:inset 0 0 0 2px rgba(81,48,28,.24); }
            #fatcat-dom-factory .bonus-cafe:before { left:20%; top:32%; width:50%; height:38%; border-radius:0 0 12px 12px; background:#fff4df; box-shadow:inset 0 0 0 3px #9b6b3c; }
            #fatcat-dom-factory .bonus-cafe:after { right:16%; top:39%; width:22%; height:20%; border:3px solid #9b6b3c; border-left:0; border-radius:0 12px 12px 0; }
            #fatcat-dom-factory .bonus-storage:before { inset:24%; border-radius:6px; background:linear-gradient(#d09a53,#765035); box-shadow:0 9px 0 -2px #5a3a27, inset 0 0 0 2px #4d3423; }
            #fatcat-dom-factory .bonus span { color:#f4d49a; align-self:end; white-space:nowrap; }
            #fatcat-dom-factory .bonus b { color:#ffffff; font-size:168%; align-self:start; text-shadow:0 2px #141414; }
            #fatcat-dom-factory .floor-kpi { position:absolute; z-index:3; left:33%; top:18%; width:22.5%; height:28%; border-radius:14px; background:rgba(38,32,28,.9); border:2px solid rgba(229,190,123,.82); display:grid; grid-template-columns:28% 1fr; align-items:center; padding:0 3%; box-sizing:border-box; box-shadow:0 5px 0 rgba(0,0,0,.3), inset 0 0 0 2px rgba(255,236,184,.1), inset 0 12px 16px rgba(255,227,158,.06); }
            #fatcat-dom-factory .floor-kpi i { position:relative; width:72%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; justify-self:center; overflow:hidden; }
            #fatcat-dom-factory .floor-kpi i:before, #fatcat-dom-factory .floor-kpi i:after { content:""; position:absolute; }
            #fatcat-dom-factory .floor-kpi.kpi-coin i:after { inset:0; display:flex; align-items:center; justify-content:center; content:"$"; color:#8a5512; font-size:2.0%; font-weight:900; }
            #fatcat-dom-factory .floor-kpi.kpi-bean i { border-radius:52% 48% 50% 50%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); box-shadow:inset -5px -6px 0 rgba(33,17,9,.18); }
            #fatcat-dom-factory .floor-kpi.kpi-food i { border-radius:0 0 38% 38%; background:linear-gradient(#fff0d0 0 18%, #d9e6f4 19% 45%, #b78c5a 46%); }
            #fatcat-dom-factory .floor-kpi.kpi-food i:before { left:15%; right:15%; top:-25%; height:40%; border-radius:50% 50% 20% 20%; background:#b65d2c; }
            #fatcat-dom-factory .floor-kpi.kpi-storage i { border-radius:10px; background:linear-gradient(#c99d5d,#7b5435); box-shadow:inset 0 0 0 3px #4d3423; }
            #fatcat-dom-factory .floor-kpi.kpi-storage i:before { left:18%; right:18%; top:18%; height:14%; background:#f0d09a; box-shadow:0 14px 0 #f0d09a, 0 28px 0 #f0d09a; }
            #fatcat-dom-factory .floor-kpi.kpi-office i { background:linear-gradient(#8fc06c,#437a35); box-shadow:inset 0 0 0 3px #2f5527; }
            #fatcat-dom-factory .floor-kpi.kpi-office i:before { inset:22%; clip-path:polygon(50% 0,100% 100%,0 100%); background:#fff0b0; }
            #fatcat-dom-factory .floor-kpi strong { display:block; color:white; font-size:2.25%; line-height:1.1; }
            #fatcat-dom-factory .floor-kpi span { display:block; color:#f4d49a; font-size:1.45%; font-weight:900; margin-top:2%; }
            #fatcat-dom-factory .cat-dots { position:absolute; z-index:2; left:33%; bottom:8%; width:19%; height:16%; display:flex; gap:7%; align-items:flex-end; }
            #fatcat-dom-factory .cat-dot { position:relative; width:22%; max-width:24px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f7d4a4,#d88643); box-shadow:0 2px 0 rgba(0,0,0,.25), inset 0 0 0 2px rgba(86,54,31,.18); }
            #fatcat-dom-factory .cat-dot:before { content:""; position:absolute; left:24%; top:31%; width:52%; height:34%; border-radius:50%; background:radial-gradient(circle at 32% 45%,#3b2519 0 10%,transparent 11%), radial-gradient(circle at 68% 45%,#3b2519 0 10%,transparent 11%); box-shadow:-5px -5px 0 -3px #6b4228, 5px -5px 0 -3px #6b4228; }
            #fatcat-dom-factory .cat-dot.gray { background:linear-gradient(#e8e2d7,#a99d91); }
            #fatcat-dom-factory .cat-dot.black { background:linear-gradient(#4d4742,#171413); }
            @keyframes fatcatSteam { 0%,100% { transform:translateY(0); opacity:.45; } 50% { transform:translateY(-8%); opacity:.72; } }
            @keyframes fatcatBelt { from { background-position:0 0; } to { background-position:36px 0; } }
            @keyframes fatcatMachinePulse { 0%,100% { transform:scale(1); filter:drop-shadow(0 4px 0 rgba(34,22,14,.25)); } 50% { transform:scale(1.012); filter:drop-shadow(0 5px 0 rgba(34,22,14,.28)); } }
            @keyframes fatcatWorkerBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2.5%); } }
            #fatcat-dom-factory .left-tools, #fatcat-dom-factory .right-tools { position: absolute; width: 8.4%; display: grid; gap: 1.35%; }
            #fatcat-dom-factory .left-tools { left: .85%; top: 13.9%; } #fatcat-dom-factory .right-tools { right: .85%; top: 17.9%; }
            #fatcat-dom-factory button { font:inherit; color:inherit; cursor:pointer; pointer-events:auto; touch-action:manipulation; }
            #fatcat-dom-factory .side-btn { position:relative; height: 7.9%; min-height: 68px; border-radius: 16px; background: radial-gradient(circle at 50% 0, rgba(255,236,180,.22), transparent 34%), linear-gradient(#9a7a58, #55402f 72%, #37271e); border: 3px solid #3d2c21; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2.05%; font-weight: 900; box-shadow: 0 5px 0 rgba(0,0,0,.36), inset 0 2px 0 rgba(255,242,203,.18), inset 0 0 0 2px rgba(255,232,185,.12); padding:0; }
            #fatcat-dom-factory .side-btn:before { content:""; position:absolute; left:10%; right:10%; top:7%; height:15%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.26), rgba(255,255,255,0)); pointer-events:none; }
            #fatcat-dom-factory .side-btn.alert:after { content:attr(data-badge); position:absolute; right:-8%; top:-7%; min-width:30%; padding:0 5%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#ff7141,#d83d22); color:white; border:2px solid #ffd9a8; display:flex; align-items:center; justify-content:center; font-size:1.75%; box-shadow:0 3px 0 rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.28); box-sizing:border-box; }
            #fatcat-dom-factory .side-btn i { position:relative; font-style: normal; font-size: 0; line-height: 1; width: 48%; aspect-ratio: 1; border-radius: 11px; background: radial-gradient(circle at 50% 8%, rgba(255,255,255,.32), transparent 30%), linear-gradient(#fff0cf,#d7b174); color: #5a3c27; display: flex; align-items: center; justify-content: center; margin-bottom: 7%; box-shadow:inset 0 0 0 2px rgba(82,52,29,.22), 0 3px 0 rgba(46,29,18,.22); }
            #fatcat-dom-factory .side-btn i:before, #fatcat-dom-factory .side-btn i:after { content:""; position:absolute; }
            #fatcat-dom-factory .side-btn i.asset {
                width:58%;
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:165%;
                background-repeat:no-repeat;
                box-shadow:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.28));
            }
            #fatcat-dom-factory .side-btn i.asset:before,
            #fatcat-dom-factory .side-btn i.asset:after { display:none !important; }
            #fatcat-dom-factory .ico-task:before { left:25%; top:22%; width:50%; height:58%; border-radius:4px; background:#8b6034; box-shadow:inset 0 0 0 2px #674521; }
            #fatcat-dom-factory .ico-task:after { left:34%; top:38%; width:32%; height:5%; border-radius:99px; background:#fff0c8; box-shadow:0 10px 0 #fff0c8, 0 20px 0 #fff0c8; }
            #fatcat-dom-factory .ico-trophy:before { left:22%; top:22%; width:56%; height:42%; border-radius:8px 8px 18px 18px; background:#d89a25; box-shadow:inset 0 0 0 3px #8b5c16; }
            #fatcat-dom-factory .ico-trophy:after { left:37%; top:61%; width:26%; height:22%; background:#8b5c16; box-shadow:0 12px 0 5px #8b5c16; }
            #fatcat-dom-factory .ico-mail:before { left:17%; top:28%; width:66%; height:45%; border-radius:5px; background:#fff5df; box-shadow:inset 0 0 0 3px #9a6a3e; }
            #fatcat-dom-factory .ico-mail:after { left:21%; top:31%; width:58%; height:34%; clip-path:polygon(0 0,50% 58%,100% 0,100% 16%,50% 74%,0 16%); background:#d59c5c; }
            #fatcat-dom-factory .ico-friend:before { left:18%; top:23%; width:28%; height:28%; border-radius:50%; background:#f7d4a4; box-shadow:31px 0 0 #f7d4a4; }
            #fatcat-dom-factory .ico-friend:after { left:13%; right:13%; top:52%; height:30%; border-radius:50% 50% 18px 18px; background:#8b6034; }
            #fatcat-dom-factory .ico-gear:before { inset:18%; border-radius:50%; background:repeating-conic-gradient(#8b6034 0 12deg, transparent 12deg 30deg), radial-gradient(circle, transparent 0 29%, #8b6034 30% 58%, transparent 59%); }
            #fatcat-dom-factory .bottom-widgets { position: absolute; left: 3.0%; right: 3.0%; bottom: 16.15%; height: 8.25%; display: grid; grid-template-columns: 17% 10.5% 1fr 29%; gap: 1.75%; align-items: center; }
            #fatcat-dom-factory .order, #fatcat-dom-factory .chest, #fatcat-dom-factory .gift { position:relative; height: 100%; border-radius: 16px; background: radial-gradient(circle at 50% 0, rgba(255,255,255,.32), transparent 32%), repeating-linear-gradient(135deg, rgba(108,72,38,.045) 0 2px, transparent 2px 7px), linear-gradient(#fff4d9, #d6ad78); border: 3px solid #7a6044; color: #4a2f1f; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 2.12%; font-weight: 900; box-shadow: 0 6px 0 rgba(0,0,0,.32), inset 0 0 0 2px rgba(255,255,255,.38), inset 0 -10px 18px rgba(116,70,32,.12); box-sizing:border-box; padding:0; }
            #fatcat-dom-factory .order { display:grid; grid-template-columns:34% 1fr; grid-template-rows:1fr 22%; padding:3% 7%; gap:0 5%; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.38), transparent 34%), repeating-linear-gradient(135deg, rgba(108,72,38,.045) 0 2px, transparent 2px 7px), linear-gradient(#fff7df,#d9b17b); text-align:left; }
            #fatcat-dom-factory .order .order-icon { width:28%; aspect-ratio:1; border-radius:9px; background:linear-gradient(#fff4dc,#d9b376); box-shadow:inset 0 0 0 2px #8b6034, 0 2px 0 rgba(74,45,24,.18); position:relative; }
            #fatcat-dom-factory .order .order-icon:before { content:""; position:absolute; left:26%; top:24%; width:48%; height:7%; border-radius:99px; background:#8b6034; box-shadow:0 12px 0 #8b6034, 0 24px 0 #8b6034; }
            #fatcat-dom-factory .order .order-icon { grid-row:1/3; width:100%; align-self:center; }
            #fatcat-dom-factory .order .order-text { align-self:end; line-height:1.04; }
            #fatcat-dom-factory .order b { display:block; font-size: 150%; color:#6e3e20; }
            #fatcat-dom-factory .order .bar { width:100%; height:78%; align-self:center; border-radius:999px; background:#a77e49; overflow:hidden; box-shadow:inset 0 0 0 2px rgba(82,53,30,.22), 0 1px 0 rgba(255,250,220,.22); }
            #fatcat-dom-factory .order .bar i { display:block; width:93%; height:100%; border-radius:inherit; background:linear-gradient(90deg,#eeb335,#ffdf73); box-shadow:inset 0 2px 0 rgba(255,255,255,.28); }
            #fatcat-dom-factory .chest { font-size: 1.85%; flex-direction: column; padding-top:1%; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.28), transparent 31%), linear-gradient(#ffe29a,#bc7324); color:#fff6dc; text-shadow:0 2px #724117; white-space:nowrap; }
            #fatcat-dom-factory .chest::before { display:none; }
            #fatcat-dom-factory .chest-art {
                width:72%;
                aspect-ratio:1;
                margin-bottom:-2%;
                background-position:center;
                background-size:155%;
                background-repeat:no-repeat;
                filter:drop-shadow(0 3px 0 rgba(75,39,16,.28));
            }
            #fatcat-dom-factory .chest:after { content:"!"; position:absolute; right:9%; top:8%; width:22%; aspect-ratio:1; border-radius:50%; background:#e84e25; color:white; display:flex; align-items:center; justify-content:center; border:2px solid #ffd6a0; font-size:1.5%; }
            #fatcat-dom-factory .launch { height: 112%; align-self:center; border-radius: 999px; background: radial-gradient(circle at 50% 0, rgba(255,245,202,.76), transparent 35%), linear-gradient(#ffbd55, #df6e19 72%, #b65213); border: 5px solid #9a5721; color: #fff7d8; text-shadow: 0 3px #8c3b12; font-size: 4.75%; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 0 rgba(95,44,14,.54), inset 0 0 0 3px rgba(255,242,178,.25), inset 0 -13px 22px rgba(124,47,13,.18); }
            #fatcat-dom-factory .launch:before { content:""; position:absolute; left:8%; right:8%; top:10%; height:20%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.42), rgba(255,255,255,0)); pointer-events:none; }
            #fatcat-dom-factory .rocket-shape { position: relative; width: 18%; aspect-ratio: .72; margin-right: 4%; border-radius: 50% 50% 42% 42%; background: linear-gradient(#fff8e4 0 54%, #e54d2e 55%); transform: rotate(35deg) translateY(-4%); box-shadow: inset 0 0 0 2px rgba(112,57,25,.25), 0 3px 0 rgba(0,0,0,.25); }
            #fatcat-dom-factory .rocket-shape::before { content: ""; position: absolute; left: 32%; top: 18%; width: 36%; aspect-ratio: 1; border-radius: 50%; background: #6fb2d5; box-shadow: inset 0 0 0 2px #4e6d7a; }
            #fatcat-dom-factory .rocket-shape::after { content: ""; position: absolute; left: 22%; bottom: -18%; width: 56%; height: 24%; border-radius: 0 0 50% 50%; background: #ffd15a; }
            #fatcat-dom-factory .rocket-shape.asset {
                aspect-ratio:1;
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:200%;
                background-repeat:no-repeat;
                transform:none;
                box-shadow:none;
                filter:drop-shadow(0 3px 0 rgba(91,45,16,.3));
            }
            #fatcat-dom-factory .rocket-shape.asset:before,
            #fatcat-dom-factory .rocket-shape.asset:after { display:none; }
            #fatcat-dom-factory .gift { font-size: 2.05%; display:grid; grid-template-columns:31% 1fr; gap:4%; align-items:center; padding: 0 4% 0 2.6%; box-sizing: border-box; text-align:left; background:radial-gradient(circle at 50% 0, rgba(255,255,255,.3), transparent 31%), linear-gradient(#f4dfae,#b88748); overflow:hidden; line-height:1.12; }
            #fatcat-dom-factory .gift:after { content:""; position:absolute; right:-5%; bottom:-14%; width:32%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#f5c482,#c97938); box-shadow:-8px -7px 0 -5px #3d3d3d, 8px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.2); opacity:.95; }
            #fatcat-dom-factory .gift:before { content:""; position:relative; width:100%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#b9c2c7,#69777f); box-shadow:-9px -7px 0 -5px #3d3d3d, 9px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.22), 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .gift-cat { position:relative; width:100%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 5%,transparent 6%), radial-gradient(circle at 66% 45%,#3d281d 0 5%,transparent 6%), linear-gradient(#b9c2c7,#69777f); box-shadow:-9px -7px 0 -5px #3d3d3d, 9px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.22), 0 3px 0 rgba(0,0,0,.2); }
            #fatcat-dom-factory .gift-cat:after { content:""; position:absolute; left:24%; right:24%; bottom:-12%; height:22%; border-radius:999px; background:#6d482b; box-shadow:inset 0 0 0 2px rgba(255,225,168,.18); }
            #fatcat-dom-factory .gift:before { display:none; }
            #fatcat-dom-factory .gift-cat.asset {
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:175%;
                background-repeat:no-repeat;
                box-shadow:none;
            }
            #fatcat-dom-factory .gift-cat.asset:after { display:none; }
            #fatcat-dom-factory .gift b { color:#5f351d; font-size:100%; }
            #fatcat-dom-factory .gift em { display:inline-block; margin-top:2%; padding:1% 6%; border-radius:999px; background:#5a3924; color:#ffe0a1; font-style:normal; font-size:86%; }
            #fatcat-dom-factory .launch-count { position: absolute; left: 31.0%; right: 31.0%; bottom: 13.0%; height: 2.45%; border-radius: 999px; background: linear-gradient(#7a4d27,#4e2e18); border: 2px solid #c1863d; color: #ffd26f; display: flex; align-items: center; justify-content: center; font-size: 1.78%; font-weight: 900; box-shadow: 0 3px 0 rgba(0,0,0,.36), inset 0 0 0 1px rgba(255,225,150,.18); }
            #fatcat-dom-factory .factory-msg { position: absolute; left: 21%; top: 79%; width: 58%; min-height: 3.8%; border-radius: 999px; background: rgba(52,35,24,.9); color: #ffe6b5; display: flex; align-items: center; justify-content: center; font-size: 2.4%; font-weight: 900; box-shadow: 0 2px 0 rgba(0,0,0,.3); }
            #fatcat-dom-factory .notice-card { position:absolute; right:10.8%; top:18.2%; width:26%; min-height:18%; border-radius:18px; background:linear-gradient(#fff2d3,#d8b17a); border:3px solid #6d4b31; color:#4a2f1f; box-shadow:0 7px 0 rgba(48,29,17,.38), inset 0 0 0 3px rgba(255,250,224,.34); padding:2.2%; box-sizing:border-box; font-size:2.0%; line-height:1.32; }
            #fatcat-dom-factory .notice-card:before { content:""; position:absolute; right:-6%; top:20%; width:0; height:0; border-top:12px solid transparent; border-bottom:12px solid transparent; border-left:18px solid #6d4b31; }
            #fatcat-dom-factory .friend-boost-banner { position:absolute; z-index:8; left:50%; top:9.4%; transform:translateX(-50%); min-width:44%; max-width:72%; min-height:4.2%; padding:.55% 1.5%; box-sizing:border-box; border-radius:999px; border:2px solid #e9c66f; background:linear-gradient(90deg,rgba(42,76,31,.96),rgba(79,133,48,.96)); color:#fff7d4; box-shadow:0 4px 0 rgba(32,42,22,.35),inset 0 0 0 2px rgba(255,245,188,.12); display:flex; justify-content:center; align-items:center; gap:2.2%; pointer-events:none; }
            #fatcat-dom-factory .friend-boost-banner b { font-size:1.75%; white-space:nowrap; }
            #fatcat-dom-factory .friend-boost-banner span { font-size:1.35%; white-space:nowrap; color:#e8f6cf; }
            #fatcat-dom-factory .friend-boost-banner .boost-sources { display:flex; gap:3px; max-width:42%; overflow:hidden; }
            #fatcat-dom-factory .friend-boost-banner .boost-sources i { max-width:92px; padding:.18em .55em; border-radius:999px; background:rgba(255,248,207,.14); color:#fff8dc; font-style:normal; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-factory .friend-boost-banner em { font-style:normal; font-size:1.35%; font-weight:900; white-space:nowrap; padding:.2em .7em; border-radius:999px; background:rgba(25,48,19,.52); }
            #fatcat-dom-factory .friend-boost-banner em.ready { color:#fff3a3; box-shadow:inset 0 0 0 1px #f0cc59; }
            #fatcat-dom-factory .notice-head { display:grid; grid-template-columns:22% 1fr; gap:4%; align-items:center; margin-bottom:4%; font-weight:900; }
            #fatcat-dom-factory .notice-icon { position:relative; width:100%; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff8dc,#d8a65a); box-shadow:inset 0 0 0 2px rgba(95,60,30,.2), 0 3px 0 rgba(85,52,26,.22); }
            #fatcat-dom-factory .notice-icon.asset { background:center/cover no-repeat; }
            #fatcat-dom-factory .notice-icon.asset:before, #fatcat-dom-factory .notice-icon.asset:after { display:none; }
            #fatcat-dom-factory .notice-icon:before, #fatcat-dom-factory .notice-icon:after { content:""; position:absolute; }
            #fatcat-dom-factory .notice-icon.achievement:before { left:22%; top:22%; width:56%; height:42%; border-radius:8px 8px 18px 18px; background:#d89a25; box-shadow:inset 0 0 0 3px #8b5c16; }
            #fatcat-dom-factory .notice-icon.mail:before { left:16%; top:28%; width:68%; height:45%; border-radius:5px; background:#fff5df; box-shadow:inset 0 0 0 3px #9a6a3e; }
            #fatcat-dom-factory .notice-icon.mail:after { left:20%; top:31%; width:60%; height:34%; clip-path:polygon(0 0,50% 58%,100% 0,100% 16%,50% 74%,0 16%); background:#d59c5c; }
            #fatcat-dom-factory .notice-icon.friend:before { left:18%; top:23%; width:28%; height:28%; border-radius:50%; background:#f7d4a4; box-shadow:28px 0 0 #f7d4a4; }
            #fatcat-dom-factory .notice-icon.friend:after { left:13%; right:13%; top:52%; height:30%; border-radius:50% 50% 18px 18px; background:#8b6034; }
            #fatcat-dom-factory .notice-icon.settings:before { inset:20%; border-radius:50%; background:repeating-conic-gradient(#8b6034 0 12deg, transparent 12deg 30deg), radial-gradient(circle, transparent 0 29%, #8b6034 30% 58%, transparent 59%); }
            #fatcat-dom-factory .notice-row { display:flex; justify-content:space-between; align-items:center; padding:2.3% 0; border-top:1px solid rgba(107,73,42,.2); font-weight:900; }
            #fatcat-dom-factory .notice-row span:last-child { color:#6c8d35; }
            #fatcat-dom-factory.compact .building { left: 6.2%; right: 6.2%; top: 12.4%; bottom: 24.2%; }
            #fatcat-dom-factory.compact .factory-illustration { left:-3%; right:-3%; top:6.6%; bottom:13.6%; opacity:.58; }
            #fatcat-dom-factory.compact .floor-card { width: 30%; left: 1.6%; grid-template-columns:34% 1fr; border-width:2px; }
            #fatcat-dom-factory.compact .floor-card:before { width:34%; }
            #fatcat-dom-factory.compact .floor-no { font-size:4.25%; }
            #fatcat-dom-factory.compact .floor-name { font-size:1.64%; line-height:1.15; padding-right:3%; }
            #fatcat-dom-factory.compact .floor-name span { font-size:76%; margin-top:2%; }
            #fatcat-dom-factory.compact .floor-medal { width:6.2%; left:2.2%; bottom:8%; font-size:1.28%; border-width:1px; }
            #fatcat-dom-factory.compact .floor-kpi { left: 32.3%; width: 24%; top:18%; }
            #fatcat-dom-factory.compact .props { left: 43%; right: 15%; opacity:.56; }
            #fatcat-dom-factory.compact .prop-asset { left:44%; right:15%; opacity:.88; }
            #fatcat-dom-factory.compact .room-foreground { left:34%; right:22%; height:29%; opacity:.8; }
            #fatcat-dom-factory.compact .cat { width:7.6%; height:43%; bottom:9%; }
            #fatcat-dom-factory.compact .cat:before { transform:scale(.85) rotate(-6deg); }
            #fatcat-dom-factory.compact .cat-dots { left:32%; bottom:7%; width:18%; }
            #fatcat-dom-factory.compact .bonus { right: 2%; width: 23%; font-size: 2.0%; }
            #fatcat-dom-factory.compact .side-btn { font-size: 1.66%; min-height:56px; border-radius:12px; }
            #fatcat-dom-factory.compact .side-btn i { width:41%; border-radius:8px; margin-bottom:5%; }
            #fatcat-dom-factory.compact .side-btn.alert:after { right:-6%; top:-6%; min-width:27%; font-size:1.45%; }
            #fatcat-dom-factory.compact .left-tools, #fatcat-dom-factory.compact .right-tools { width: 8.7%; }
            #fatcat-dom-factory.compact .bottom-widgets { left: 2%; right: 2%; grid-template-columns: 18% 10.5% 1fr 27%; gap: 1.3%; }
            #fatcat-dom-factory.compact .launch { font-size: 4.25%; }
            #fatcat-dom-factory.compact .gift { font-size:1.72%; padding-right:2%; }
            #fatcat-dom-factory.compact .gift:after { width:28%; right:-8%; }
            #fatcat-dom-factory.compact .notice-card { right:10%; width:30%; font-size:1.78%; }
            #fatcat-dom-factory.compact .friend-boost-banner { top:9.2%; min-width:61%; max-width:82%; padding:.45% 1.2%; }
            #fatcat-dom-factory.compact .friend-boost-banner .boost-latest { display:none; }
            #fatcat-dom-factory.compact .friend-boost-banner .boost-sources { max-width:48%; }
            #fatcat-dom-factory.compact .friend-boost-banner .boost-sources i:nth-child(n+3) { display:none; }
            #fatcat-dom-factory.tall .building { top: 12.6%; bottom: 24.8%; }
            #fatcat-dom-factory.tall .factory-illustration { top:6.5%; bottom:13.4%; }
            #fatcat-dom-factory.tall .bottom-widgets { bottom: 17.1%; }
            #fatcat-dom-factory.wide .building { left: 13%; right: 13%; top:17.0%; bottom:23.0%; }
            #fatcat-dom-factory.wide .factory-illustration { left:8%; right:8%; top:7.9%; bottom:10.8%; opacity:.56; }
            #fatcat-dom-factory.wide .roof-deck { left:12.7%; right:12.7%; top:15.8%; height:4.0%; }
            #fatcat-dom-factory.wide .roof-crates { left:15%; top:13.8%; width:14%; }
            #fatcat-dom-factory.wide .sign { top:13.1%; height:7.0%; }
            #fatcat-dom-factory.wide .sign-posts { top:19.3%; left:29%; right:43%; }
            #fatcat-dom-factory.wide .chimney { top:11.8%; right:22%; height:7.4%; }
            #fatcat-dom-factory.wide .roof-cat { top:12.8%; right:24%; width:10.8%; }
            #fatcat-dom-factory.wide .flag { top:11.9%; right:15.2%; width:9.2%; }
            #fatcat-dom-factory.wide .side-pipe.left { left:10.2%; }
            #fatcat-dom-factory.wide .side-pipe.right { right:10.2%; }
            #fatcat-dom-factory.wide .floor-kpi { left:34%; width:20%; }
            #fatcat-dom-factory.wide .prop-asset { left:43%; right:18%; opacity:.9; }
            #fatcat-dom-factory.wide .floor-glow { opacity:.66; }
            #fatcat-dom-factory.wide .bonus { right:3.1%; width:21%; }
            #fatcat-dom-factory.wide .cat-dots { left:33%; width:17%; bottom:7%; }
            #fatcat-dom-factory.wide .bottom-widgets { left:9%; right:9%; grid-template-columns:16% 10% 1fr 28%; }
            #fatcat-dom-factory.wide .launch-count { left:34%; right:34%; bottom:12.8%; }
            #fatcat-dom-factory.wide .left-tools { left: 5%; }
            #fatcat-dom-factory.wide .right-tools { right: 5%; }

            /* Let the generated cutaway carry the room art. The controls stay
               separate so they remain sharp, responsive, and clickable. */
            #fatcat-dom-factory .art-bg { background:linear-gradient(#bfe9ff 0 44%,#a8ca8c 100%); }
            #fatcat-dom-factory .sky, #fatcat-dom-factory .town { display:none; }
            #fatcat-dom-factory .factory-illustration,
            #fatcat-dom-factory.compact .factory-illustration,
            #fatcat-dom-factory.tall .factory-illustration,
            #fatcat-dom-factory.wide .factory-illustration {
                inset:0;
                background-position:center top;
                background-size:auto 92%;
                opacity:1;
                filter:saturate(1.1) contrast(1.075) brightness(.975);
            }
            #fatcat-dom-factory .factory-illustration:after { display:none; }
            #fatcat-dom-factory .roof-deck,
            #fatcat-dom-factory .roof-crates,
            #fatcat-dom-factory .sign-posts,
            #fatcat-dom-factory .chimney,
            #fatcat-dom-factory .roof-cat,
            #fatcat-dom-factory .flag,
            #fatcat-dom-factory .side-pipe,
            #fatcat-dom-factory .ladder,
            #fatcat-dom-factory .elevator-panel { display:none; }
            #fatcat-dom-factory .sign {
                left:24%;
                top:8.2%;
                width:43%;
                height:6.7%;
                border:0;
                border-radius:0;
                background:transparent;
                box-shadow:none;
                font-size:4.25%;
                text-shadow:0 3px 0 #5a321b,0 0 5px rgba(255,223,150,.3);
            }
            #fatcat-dom-factory .sign:before,
            #fatcat-dom-factory .sign:after { display:none; }
            #fatcat-dom-factory .building,
            #fatcat-dom-factory.compact .building,
            #fatcat-dom-factory.tall .building {
                left:6.2%;
                right:6.2%;
                top:16.4%;
                bottom:14.0%;
                border:0;
                border-radius:0;
                background:transparent;
                box-shadow:none;
                overflow:visible;
            }
            #fatcat-dom-factory.wide .building {
                left:13%;
                right:13%;
                top:17%;
                bottom:13.8%;
            }
            #fatcat-dom-factory .building:before,
            #fatcat-dom-factory .building:after,
            #fatcat-dom-factory .floor:before,
            #fatcat-dom-factory .floor:after { display:none; }
            #fatcat-dom-factory .floor,
            #fatcat-dom-factory .floor:nth-child(odd) {
                border:0;
                background:transparent;
                overflow:visible;
            }
            #fatcat-dom-factory .floor-glow,
            #fatcat-dom-factory .room-lights,
            #fatcat-dom-factory .wall-details,
            #fatcat-dom-factory .room-decor,
            #fatcat-dom-factory .room-foreground,
            #fatcat-dom-factory .props,
            #fatcat-dom-factory .prop-asset,
            #fatcat-dom-factory .pipe,
            #fatcat-dom-factory .cat,
            #fatcat-dom-factory .worker-cats,
            #fatcat-dom-factory .cat-dots,
            #fatcat-dom-factory .floor-kpi { display:none; }
            #fatcat-dom-factory .floor-card,
            #fatcat-dom-factory.compact .floor-card {
                left:8.5%;
                top:27%;
                width:22.5%;
                height:46%;
                grid-template-columns:38% 1fr;
                border-radius:10px;
                border:2px solid #755438;
                background:
                    repeating-linear-gradient(92deg,rgba(104,65,35,.035) 0 1px,transparent 1px 7px),
                    linear-gradient(#fff2d5,#d8b98a);
                box-shadow:
                    0 3px 0 rgba(0,0,0,.34),
                    0 0 0 1px rgba(48,29,18,.56),
                    inset 0 0 0 2px rgba(255,255,255,.42),
                    inset 0 -7px 10px rgba(105,68,37,.1);
                cursor:pointer;
                transition:filter .12s ease,box-shadow .12s ease,transform .12s ease;
                touch-action:manipulation;
            }
            #fatcat-dom-factory .floor-card:before,
            #fatcat-dom-factory.compact .floor-card:before {
                width:38%;
                background:
                    repeating-linear-gradient(90deg,rgba(255,234,186,.07) 0 1px,transparent 1px 6px),
                    linear-gradient(#92704f,#5c432f);
                box-shadow:inset -2px 0 0 rgba(255,231,181,.16);
            }
            #fatcat-dom-factory .floor-card:after {
                content:"";
                position:absolute;
                inset:5%;
                border:1px solid rgba(100,68,39,.2);
                border-radius:7px;
                pointer-events:none;
            }
            #fatcat-dom-factory .floor-card:hover {
                filter:brightness(1.055) saturate(1.04);
            }
            #fatcat-dom-factory .floor-card:active {
                transform:translateY(2px) scale(.985);
                box-shadow:
                    0 1px 0 rgba(0,0,0,.38),
                    0 0 0 1px rgba(48,29,18,.56),
                    inset 0 0 0 2px rgba(255,255,255,.42);
            }
            #fatcat-dom-factory .floor-card:focus-visible {
                outline:3px solid #ffd66f;
                outline-offset:2px;
                filter:brightness(1.07);
            }
            #fatcat-dom-factory .floor-no,
            #fatcat-dom-factory.compact .floor-no { font-size:3.3%; }
            #fatcat-dom-factory .floor-name,
            #fatcat-dom-factory.compact .floor-name { font-size:1.45%; line-height:1.08; }
            #fatcat-dom-factory .floor-name span,
            #fatcat-dom-factory.compact .floor-name span { font-size:82%; margin-top:4%; }
            #fatcat-dom-factory .floor-medal { display:none; }
            #fatcat-dom-factory .bonus,
            #fatcat-dom-factory.compact .bonus {
                right:4%;
                top:24%;
                width:18.5%;
                height:52%;
                grid-template-columns:28% 1fr;
                grid-template-rows:42% 25% 33%;
                column-gap:5%;
                padding:0 3%;
                border-radius:10px;
                border:2px solid #a98755;
                background:
                    radial-gradient(circle at 14% 7%,rgba(255,220,146,.15),transparent 30%),
                    linear-gradient(#403c35,#181a18 76%,#111311);
                font-size:1.25%;
                box-shadow:
                    0 4px 0 rgba(0,0,0,.4),
                    0 0 0 1px rgba(46,31,19,.68),
                    inset 0 0 0 2px rgba(255,222,151,.13),
                    inset 0 12px 16px rgba(255,225,161,.045);
            }
            #fatcat-dom-factory .bonus:before {
                content:"";
                position:absolute;
                left:7%;
                right:7%;
                top:6%;
                height:2px;
                border-radius:999px;
                background:linear-gradient(90deg,transparent,rgba(255,222,153,.38),transparent);
            }
            #fatcat-dom-factory .bonus:after {
                content:"";
                position:absolute;
                right:6%;
                top:9%;
                width:5%;
                aspect-ratio:1;
                border-radius:50%;
                background:#83ad48;
                box-shadow:0 0 5px rgba(153,213,80,.66),inset 0 1px rgba(255,255,255,.35);
            }
            #fatcat-dom-factory .bonus-icon { grid-row:1/4; width:90%; }
            #fatcat-dom-factory .bonus strong {
                color:#fff;
                font-size:172%;
                line-height:1;
                align-self:end;
                white-space:nowrap;
                text-shadow:0 2px #141414;
            }
            #fatcat-dom-factory .bonus span {
                align-self:center;
                color:#f4d49a;
                font-size:88%;
                white-space:nowrap;
            }
            #fatcat-dom-factory .bonus b {
                align-self:start;
                color:#fff;
                font-size:150%;
                line-height:1;
            }
            #fatcat-dom-factory .bottom-widgets,
            #fatcat-dom-factory.compact .bottom-widgets,
            #fatcat-dom-factory.tall .bottom-widgets,
            #fatcat-dom-factory.wide .bottom-widgets {
                left:3%;
                right:3%;
                bottom:7.15%;
                height:7.2%;
                grid-template-columns:17fr 10.5fr 39fr 30.5fr;
                gap:1.3%;
            }
            #fatcat-dom-factory.wide .bottom-widgets { left:9%; right:9%; }
            #fatcat-dom-factory .launch { height:100%; font-size:4.1%; white-space:nowrap; }
            #fatcat-dom-factory.compact .launch { font-size:3.4%; }
            #fatcat-dom-factory.compact .rocket-shape { width:22%; margin-right:3%; }
            #fatcat-dom-factory.compact .rocket-shape.asset { width:32%; margin-right:0; }
            #fatcat-dom-factory.compact .side-btn i.asset { width:62%; margin-bottom:4%; }
            #fatcat-dom-factory .side-btn {
                border-color:#4b3424;
                background:
                    radial-gradient(circle at 50% 0,rgba(255,235,183,.2),transparent 34%),
                    repeating-linear-gradient(90deg,rgba(255,224,170,.035) 0 1px,transparent 1px 6px),
                    linear-gradient(#927250,#4d3828 72%,#2e2119);
                box-shadow:
                    0 5px 0 rgba(0,0,0,.4),
                    0 0 0 1px rgba(32,20,14,.52),
                    inset 0 2px 0 rgba(255,242,203,.22),
                    inset 0 0 0 2px rgba(255,232,185,.1);
            }
            #fatcat-dom-factory .launch-count,
            #fatcat-dom-factory.wide .launch-count {
                bottom:6.45%;
                height:1.9%;
            }
            #fatcat-dom-factory .order .order-text { align-self:center; line-height:1.05; }
            #fatcat-dom-factory .order .order-text b { margin-top:4%; }
            #fatcat-dom-factory .gift:after { display:none; }
            @media (max-width:390px) {
                #fatcat-dom-factory .side-btn {
                    min-height:50px;
                    font-size:1.42%;
                    white-space:nowrap;
                }
                #fatcat-dom-factory .side-btn i {
                    width:35%;
                    margin-bottom:2%;
                }
                #fatcat-dom-factory.compact .side-btn i.asset {
                    width:50%;
                    margin-bottom:2%;
                }
                #fatcat-dom-factory .bottom-widgets,
                #fatcat-dom-factory.compact .bottom-widgets,
                #fatcat-dom-factory.tall .bottom-widgets {
                    grid-template-columns:18fr 9.5fr 40fr 29fr;
                    gap:.8%;
                }
                #fatcat-dom-factory .order {
                    grid-template-columns:1fr;
                    grid-template-rows:1fr 22%;
                    gap:0;
                    padding:3% 5%;
                    text-align:center;
                }
                #fatcat-dom-factory .order .order-icon { display:none; }
                #fatcat-dom-factory .gift {
                    grid-template-columns:28% 1fr;
                    gap:2%;
                    padding:0 2%;
                    font-size:1.08%;
                    line-height:.96;
                }
                #fatcat-dom-factory .gift-cat.asset { width:116%; margin-left:-8%; }
                #fatcat-dom-factory .gift em {
                    margin-top:1%;
                    padding:1% 2%;
                    font-size:68%;
                    white-space:nowrap;
                }
                #fatcat-dom-factory.compact .launch {
                    border-width:3px;
                    font-size:2.7%;
                }
            }
        `;
}
