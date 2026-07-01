export const DOM_PANEL_STYLES = `
            #fatcat-dom-panel-overlay { position: fixed; z-index: 2147482990; pointer-events: none; font-family: Arial, sans-serif; color: #56351f; }
            #fatcat-dom-panel-overlay .panel-shell { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0, rgba(255,247,222,.55), transparent 34%), linear-gradient(#e6c893, #b08054 54%, #6f4d37); border: 3px solid #5a3826; box-sizing: border-box; padding: 4.1% 3.4%; border-radius: 18px; box-shadow: 0 10px 0 rgba(54,31,18,.65), inset 0 0 0 5px rgba(255,235,185,.35), inset 0 -18px 36px rgba(76,42,23,.28); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; pointer-events: auto; scrollbar-width: none; }
            #fatcat-dom-panel-overlay .panel-shell::-webkit-scrollbar { width: 0; height: 0; }
            #fatcat-dom-panel-overlay .panel-shell:before { content:""; position:absolute; left:2.4%; right:2.4%; top:1.6%; height:5.2%; border-radius:14px; background:linear-gradient(#7d5737,#503523); box-shadow:inset 0 0 0 2px rgba(255,224,157,.25); pointer-events:none; }
            #fatcat-dom-panel-overlay .panel-close { position:absolute; z-index:3; right:2.7%; top:2.1%; width:7%; min-width:42px; aspect-ratio:1; border-radius:50%; border:3px solid #6b3d1f; background:linear-gradient(#f8cd65,#d66d22); color:#fff8dd; font-size:3.1%; font-weight:900; box-shadow:0 4px 0 rgba(0,0,0,.28), inset 0 0 0 2px rgba(255,237,184,.18); cursor:pointer; pointer-events:auto; }
            #fatcat-dom-panel-overlay h2 { position:relative; z-index:1; margin: 0 0 3.1%; text-align: center; font-size: 4.25%; line-height: 1.1; color:#ffe8b1; text-shadow: 0 3px #482716; }
            #fatcat-dom-panel-overlay .tabs { position:relative; z-index:1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.1%; margin-bottom: 2%; padding:1%; border-radius:14px; background:rgba(75,48,31,.45); box-shadow: inset 0 0 0 2px rgba(255,229,180,.14); }
            #fatcat-dom-panel-overlay .tab { padding: 5.2% 2%; text-align: center; border:0; border-radius: 10px; background: linear-gradient(#836142,#5a3d2b); color: #f8dfb0; font-size: 2.25%; font-weight: 900; pointer-events:auto; cursor:pointer; font-family:inherit; box-shadow: inset 0 2px 0 rgba(255,235,190,.18), 0 3px 0 rgba(40,25,16,.35); }
            #fatcat-dom-panel-overlay .tab.active { background: linear-gradient(#fff0c9,#d8ab66); color: #4a2f1f; box-shadow: inset 0 0 0 2px #fff4c8, 0 3px 0 rgba(96,57,25,.5); }
            #fatcat-dom-panel-overlay .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2%; margin-bottom: 3%; }
            #fatcat-dom-panel-overlay .summary div, #fatcat-dom-panel-overlay .item, #fatcat-dom-panel-overlay .wide { background: linear-gradient(#fff1d3,#e2c08b); color: #4a2f1f; border: 2px solid #7c5736; border-radius: 12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.4), 0 4px 0 rgba(72,43,25,.28); box-sizing: border-box; }
            #fatcat-dom-panel-overlay .summary div { padding: 6.4%; text-align: center; font-size: 2.55%; line-height: 1.35; }
            #fatcat-dom-panel-overlay .summary.with-icons div { position:relative; display:grid; grid-template-columns:30% 1fr; align-items:center; gap:4%; text-align:left; padding:4.8% 6%; }
            #fatcat-dom-panel-overlay .summary.with-icons .summary-icon { width:100%; max-width:54px; aspect-ratio:1; border-radius:50%; background:linear-gradient(#fff8dc,#d7aa62); display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 0 2px rgba(106,70,35,.22), 0 3px 0 rgba(86,52,25,.2); }
            #fatcat-dom-panel-overlay .summary.with-icons .css-icon { width:64%; }
            #fatcat-dom-panel-overlay .list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2.2%; }
            #fatcat-dom-panel-overlay .list.shop-list { grid-template-columns: 1fr; gap: 1.7%; }
            #fatcat-dom-panel-overlay .shop-shelf-title { margin: .4% 0 1.3%; padding: 1.1% 2.4%; border-radius: 999px; background: rgba(74,47,31,.78); color:#ffe0a7; font-size:2.2%; font-weight:900; display:flex; align-items:center; justify-content:space-between; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12); }
            #fatcat-dom-panel-overlay .shop-shelf-title span:last-child { color:#ffffff; background:#d85b2a; border-radius:999px; padding:.6% 2.2%; font-size:86%; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .shop-hero { display:grid; grid-template-columns:1fr 24%; gap:2%; align-items:center; margin-bottom:1.6%; }
            #fatcat-dom-panel-overlay .shop-hero .summary { margin-bottom:0; }
            #fatcat-dom-panel-overlay .shop-mascot { min-height:104px; border-radius:14px; background:linear-gradient(#fff0ca,#cc9a5d); border:2px solid #7c5736; color:#5a361f; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 4px 0 rgba(72,43,25,.22); position:relative; overflow:hidden; }
            #fatcat-dom-panel-overlay .shop-mascot:before { content:""; width:42%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3d281d 0 6%,transparent 7%), radial-gradient(circle at 66% 45%,#3d281d 0 6%,transparent 7%), linear-gradient(#f5c482,#c97938); box-shadow:-8px -7px 0 -5px #3d3d3d, 8px -7px 0 -5px #3d3d3d, inset 7px -3px 0 rgba(255,255,255,.2); margin-bottom:5%; }
            #fatcat-dom-panel-overlay .list.bag-grid { grid-template-columns: repeat(4, 1fr); gap: 1.7%; }
            #fatcat-dom-panel-overlay .list.research-view { grid-template-columns: 58% 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay .building-view { display: grid; grid-template-columns: 58% 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay .mini-factory { min-height: 390px; border-radius: 16px; background: linear-gradient(#a9dbf4 0 24%, #80634f 24% 100%); border: 3px solid #5a3826; position: relative; overflow: hidden; box-shadow: inset 0 0 0 4px rgba(255,239,202,.22), 0 5px 0 rgba(54,31,18,.32); }
            #fatcat-dom-panel-overlay .mini-factory:after { content:""; position:absolute; inset:24% 5% 4%; background:repeating-linear-gradient(0deg, rgba(41,29,22,.45) 0 3px, transparent 3px 15.8%); pointer-events:none; }
            #fatcat-dom-panel-overlay .mini-floor { position: relative; z-index:1; width:86%; margin: 0 7%; height: 13.8%; border: 2px solid #463225; border-bottom-width:3px; background: linear-gradient(90deg,#6b5141,#b78d65 48%,#604638); color:#fff0cf; font-size:1.95%; font-weight:900; display:grid; grid-template-columns:18% 1fr 24%; align-items:center; padding:0 3%; box-sizing:border-box; text-align:left; pointer-events:auto; cursor:pointer; }
            #fatcat-dom-panel-overlay .mini-floor.active { background: linear-gradient(90deg,#a8692c,#f0c27b 48%,#8c5529); box-shadow: inset 0 0 0 3px #fff0a8, 0 0 16px rgba(255,196,90,.48); }
            #fatcat-dom-panel-overlay .mini-floor span:first-child { font-size:150%; text-align:center; }
            #fatcat-dom-panel-overlay .mini-floor b { font-size:112%; }
            #fatcat-dom-panel-overlay .mini-floor em { font-style:normal; text-align:right; color:#ffe08d; }
            #fatcat-dom-panel-overlay .floor-level-line { grid-column: 2 / 4; height: 8px; border-radius:999px; background:rgba(53,34,22,.38); overflow:hidden; box-shadow:inset 0 0 0 1px rgba(255,236,180,.12); }
            #fatcat-dom-panel-overlay .floor-level-line i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#78aa43,#f1c654); }
            #fatcat-dom-panel-overlay .mini-sign { position: absolute; z-index:2; left: 24%; top: 4.5%; width: 50%; height: 9.5%; border-radius: 12px; background: linear-gradient(#9d6631,#6e421f); color: #ffe5ad; display:flex;align-items:center;justify-content:center;font-size:2.35%;font-weight:900; box-shadow:0 4px 0 rgba(56,33,19,.42), inset 0 0 0 2px rgba(255,230,170,.2); }
            #fatcat-dom-panel-overlay .building-dashboard { display:grid; grid-template-columns:repeat(4,1fr); gap:1.3%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .building-stat-card { min-height:82px; padding:4%; border-radius:12px; background:linear-gradient(#fff0cf,#d3a66b); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 3px 0 rgba(72,43,25,.22); color:#4a2f1f; font-size:2.2%; font-weight:900; display:grid; grid-template-columns:30% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .building-stat-card b { font-size:142%; color:#6d421f; }
            #fatcat-dom-panel-overlay .building-stat-card .css-icon { width:80%; justify-self:center; }
            #fatcat-dom-panel-overlay .building-command { margin-top:2%; padding:3%; border-radius:14px; background:linear-gradient(#fff4d8,#d8b177); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.38), 0 4px 0 rgba(72,43,25,.25); }
            #fatcat-dom-panel-overlay .building-command-title { display:flex; align-items:center; justify-content:space-between; gap:2%; font-size:2.35%; font-weight:900; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .building-command-title span:last-child { padding:.8% 3%; border-radius:999px; background:#5d3821; color:#ffe2a8; box-shadow:inset 0 0 0 1px rgba(255,225,160,.18); }
            #fatcat-dom-panel-overlay .building-pipeline { display:grid; grid-template-columns:repeat(4,1fr); gap:1.4%; }
            #fatcat-dom-panel-overlay .building-pipeline span { min-height:54px; border-radius:10px; background:linear-gradient(#7a5739,#4b3122); color:#ffe5b0; display:flex; align-items:center; justify-content:center; text-align:center; font-size:1.95%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .skin-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5%; margin-top:2%; }
            #fatcat-dom-panel-overlay .skin-card { min-height: 118px; text-align:center; padding:3%; background:linear-gradient(#fff1d3,#e1be86); color:#4a2f1f; border:2px solid #7c5736; border-radius:12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.35), 0 3px 0 rgba(72,43,25,.24); font-size:2.1%; font-weight:900; }
            #fatcat-dom-panel-overlay .skin-card .thumb { position:relative; height:60%; border-radius:10px; background:linear-gradient(#abe0f5 0 35%,#80604b 36%); margin-bottom:5%; box-shadow: inset 0 0 0 2px rgba(90,60,36,.22); overflow:hidden; }
            #fatcat-dom-panel-overlay .skin-card .thumb:before { content:""; position:absolute; left:18%; right:18%; bottom:12%; height:44%; border-radius:5px; background:linear-gradient(#d7b17c,#76553d); box-shadow:inset 0 0 0 2px #4d3423; }
            #fatcat-dom-panel-overlay .skin-card .thumb:after { content:""; position:absolute; left:24%; right:24%; top:28%; height:18%; transform:rotate(45deg); background:#a96f35; box-shadow:inset 0 0 0 2px #5c371e; }
            #fatcat-dom-panel-overlay .skin-card.steam .thumb { background:linear-gradient(#c7e8f8 0 35%,#6d625b 36%); }
            #fatcat-dom-panel-overlay .skin-card.steam .thumb:before { background:linear-gradient(#8d8f8f,#4b4f50); }
            #fatcat-dom-panel-overlay .skin-card.future .thumb { background:linear-gradient(#b9ecff 0 35%,#475b7c 36%); }
            #fatcat-dom-panel-overlay .skin-card.future .thumb:before { background:linear-gradient(#7bd7ff,#30518c); }
            #fatcat-dom-panel-overlay .skin-card.classic .thumb:before { background:linear-gradient(#d9b27a,#8b5b34); }
            #fatcat-dom-panel-overlay .skin-card .tag { margin-top:2%; }
            #fatcat-dom-panel-overlay .skin-card .tag.warn:before { content:""; display:inline-block; width:10px; height:10px; margin-right:4px; border-radius:2px; background:#5e4939; box-shadow:inset 0 0 0 2px rgba(255,236,190,.16); }
            #fatcat-dom-panel-overlay .shop-row .limit { color:#7a5a3e; font-size:90%; margin-top:1%; display:inline-flex; align-items:center; gap:5px; padding:.7% 2.2%; border-radius:999px; background:rgba(91,57,31,.09); }
            #fatcat-dom-panel-overlay .shop-row:before { content:""; position:absolute; left:1.5%; top:12%; bottom:12%; width:1.2%; border-radius:999px; background:linear-gradient(#f5c15a,#c97820); opacity:.75; }
            #fatcat-dom-panel-overlay .shop-row:after { content:"推荐"; position:absolute; right:2.2%; top:8%; padding:.7% 2.2%; border-radius:999px; background:#d8542c; color:#fff4d8; font-size:78%; font-weight:900; box-shadow:0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-panel-overlay .shop-row.soldout:after { content:"售罄"; background:#756352; }
            #fatcat-dom-panel-overlay .shop-row.locked:after { content:"待开放"; background:#756352; }
            #fatcat-dom-panel-overlay .shop-row .buy-zone { text-align:center; }
            #fatcat-dom-panel-overlay .schedule-list { display:grid; gap:1.4%; margin-top:2%; }
            #fatcat-dom-panel-overlay .schedule-row { min-height:66px; display:grid; grid-template-columns:1fr 28%; align-items:center; gap:2%; padding:2.3%; background:linear-gradient(#fff1d3,#e2c08b); color:#4a2f1f; border:2px solid #7c5736; border-radius:12px; box-shadow: inset 0 0 0 2px rgba(255,250,220,.35), 0 3px 0 rgba(72,43,25,.22); font-size:2.15%; }
            #fatcat-dom-panel-overlay .schedule-row.has-cat { grid-template-columns:16% 1fr 28%; }
            #fatcat-dom-panel-overlay .mini-cat-avatar { width:100%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#f6c58a,#d98342); position:relative; box-shadow:inset 0 0 0 2px rgba(88,55,31,.22), 0 2px 0 rgba(72,43,25,.24); overflow:hidden; }
            #fatcat-dom-panel-overlay .mini-cat-avatar:before { content:""; position:absolute; left:22%; top:18%; width:56%; height:46%; border-radius:50%; background:radial-gradient(circle at 34% 45%,#3f271b 0 7%,transparent 8%), radial-gradient(circle at 66% 45%,#3f271b 0 7%,transparent 8%), linear-gradient(#ffd198,#df8c42); box-shadow:-8px -7px 0 -5px #6b4228, 8px -7px 0 -5px #6b4228; }
            #fatcat-dom-panel-overlay .schedule-row.locked { opacity:.68; filter:grayscale(.5); }
            #fatcat-dom-panel-overlay .building-upgrade-preview { margin-top:2%; padding:3%; border-radius:12px; background:rgba(91,57,31,.10); box-shadow:inset 0 0 0 2px rgba(105,72,40,.12); }
            #fatcat-dom-panel-overlay .building-effect-row { display:grid; grid-template-columns:1fr 12% 1fr; gap:2%; align-items:center; text-align:center; margin-top:2%; }
            #fatcat-dom-panel-overlay .building-effect-row span { padding:5% 3%; border-radius:10px; background:linear-gradient(#fff6dc,#d9b982); font-weight:900; box-shadow:inset 0 0 0 2px rgba(112,78,45,.14); }
            #fatcat-dom-panel-overlay .building-effect-row b { color:#7d4b22; font-size:160%; }
            #fatcat-dom-panel-overlay .bag-card.resource { background: linear-gradient(#fff1d2,#dfbf88); }
            #fatcat-dom-panel-overlay .bag-hero { display:grid; grid-template-columns:1fr 26%; gap:2%; align-items:stretch; margin-bottom:1.7%; }
            #fatcat-dom-panel-overlay .bag-hero .summary { margin-bottom:0; }
            #fatcat-dom-panel-overlay .bag-capacity { min-height:104px; border-radius:14px; background:linear-gradient(#76523a,#493124); border:2px solid #7c5736; color:#ffe3ad; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 4px 0 rgba(72,43,25,.25); }
            #fatcat-dom-panel-overlay .bag-capacity b { font-size:150%; color:#fff; }
            #fatcat-dom-panel-overlay .bag-section-title { margin: .2% 0 1.4%; padding: 1.0% 2.4%; border-radius:999px; background:rgba(74,47,31,.78); color:#ffe0a7; font-size:2.15%; font-weight:900; display:flex; align-items:center; justify-content:space-between; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12); }
            #fatcat-dom-panel-overlay .bag-section-title span:last-child { color:#ffffff; background:#5f8f3a; border-radius:999px; padding:.6% 2.2%; font-size:86%; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .task-row { min-height: 112px; display: grid; grid-template-columns: 1fr 24%; gap: 2%; align-items: center; }
            #fatcat-dom-panel-overlay .task-row.with-icon { grid-template-columns:16% 1fr 24%; }
            #fatcat-dom-panel-overlay .task-icon { width:100%; max-width:84px; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff1d3,#d8ad70); display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 0 3px rgba(118,78,43,.2), 0 4px 0 rgba(82,48,27,.25); }
            #fatcat-dom-panel-overlay .task-board { display:grid; grid-template-columns:18% 1fr 22%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff0d1,#d8b17d); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.35), 0 4px 0 rgba(72,43,25,.22); color:#4a2f1f; font-size:2.15%; line-height:1.18; }
            #fatcat-dom-panel-overlay .task-board-icon { position:relative; display:block; width:82%; max-width:72px; aspect-ratio:1; border-radius:14px; background:linear-gradient(#fff4dc,#d9b376); box-shadow:inset 0 0 0 3px #8b6034; justify-self:center; overflow:hidden; }
            #fatcat-dom-panel-overlay .task-board-icon:before { content:""; position:absolute; left:26%; top:24%; width:48%; height:7%; border-radius:99px; background:#8b6034; box-shadow:0 14px 0 #8b6034, 0 28px 0 #8b6034; }
            #fatcat-dom-panel-overlay .task-board b { font-size:160%; }
            #fatcat-dom-panel-overlay .task-board .progress-line { margin-top:2%; }
            #fatcat-dom-panel-overlay .task-stamp { justify-self:end; padding:6% 10%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .task-daily { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .task-daily-card { min-height:88px; padding:4%; border-radius:12px; background:linear-gradient(#fff1d3,#d6ad70); border:2px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 3px 0 rgba(72,43,25,.22); color:#4a2f1f; font-size:2.15%; font-weight:900; display:grid; grid-template-columns:30% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .task-daily-card .css-icon { width:80%; justify-self:center; }
            #fatcat-dom-panel-overlay .task-daily-card b { color:#6d421f; font-size:145%; }
            #fatcat-dom-panel-overlay .task-reward-strip { display:flex; gap:1.2%; margin:0 0 2%; overflow:hidden; }
            #fatcat-dom-panel-overlay .task-reward-strip span { flex:1; min-height:42px; border-radius:999px; background:linear-gradient(#775238,#4a3122); color:#ffe0a7; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:2.0%; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); }
            #fatcat-dom-panel-overlay .task-reward-strip span.ready { background:linear-gradient(#8ab84d,#4f842e); color:#fff8de; }
            #fatcat-dom-panel-overlay .task-meta { color: #7a5a3e; font-size: 90%; margin-top: 1%; }
            #fatcat-dom-panel-overlay .task-reward { color: #5f7f35; font-weight: 900; margin-top: 1%; }
            #fatcat-dom-panel-overlay .feature-hero { display:grid; grid-template-columns:16% 1fr 22%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff1d5,#d4a86e); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 4px 0 rgba(72,43,25,.24); color:#4a2f1f; font-size:2.2%; }
            #fatcat-dom-panel-overlay .feature-icon { width:100%; max-width:88px; aspect-ratio:1; border-radius:16px; background:center/contain no-repeat; justify-self:center; box-shadow:inset 0 0 0 3px rgba(98,65,35,.2), 0 3px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .feature-badge { justify-self:end; padding:6% 9%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); text-align:center; }
            #fatcat-dom-panel-overlay .feature-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; }
            #fatcat-dom-panel-overlay .feature-list { display:grid; gap:1.35%; }
            #fatcat-dom-panel-overlay .feature-card { min-height:106px; padding:3%; border-radius:14px; background:linear-gradient(#fff1d3,#d9b77e); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 3px 0 rgba(72,43,25,.22); font-size:2.15%; line-height:1.36; position:relative; }
            #fatcat-dom-panel-overlay .feature-card.with-icon { display:grid; grid-template-columns:16% 1fr 22%; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .feature-card .feature-icon { max-width:72px; }
            #fatcat-dom-panel-overlay .feature-card.ready:after { content:"!"; position:absolute; right:3%; top:8%; width:28px; height:28px; border-radius:50%; background:#d94b2d; color:#fff4d8; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 0 rgba(0,0,0,.24); }
            #fatcat-dom-panel-overlay .feature-mini { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5%; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .feature-mini span { min-height:66px; border-radius:12px; background:linear-gradient(#76523a,#493124); color:#ffe3ad; display:flex; align-items:center; justify-content:center; flex-direction:column; font-size:2.0%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 3px 0 rgba(72,43,25,.25); text-align:center; }
            #fatcat-dom-panel-overlay .feature-mini b { color:#fff; font-size:145%; }
            #fatcat-dom-panel-overlay .utility-shell {
                background:
                    repeating-linear-gradient(135deg,rgba(120,78,39,.035) 0 2px,transparent 2px 8px),
                    radial-gradient(circle at 50% 0, rgba(255,249,225,.72), transparent 35%),
                    linear-gradient(#f1dab1 0 64%,#ba8755 65%,#65442f);
            }
            #fatcat-dom-panel-overlay .utility-shell .feature-hero,
            #fatcat-dom-panel-overlay .utility-shell .task-board {
                border-radius:18px;
                background:
                    radial-gradient(circle at 10% 8%, rgba(255,255,255,.56), transparent 22%),
                    linear-gradient(#fff7dc,#d7ad72);
                border-width:3px;
            }
            #fatcat-dom-panel-overlay .utility-shell .feature-list {
                padding:1.5%;
                border-radius:16px;
                background:rgba(75,49,32,.28);
                box-shadow:inset 0 0 0 2px rgba(255,231,180,.12);
            }
            #fatcat-dom-panel-overlay .utility-shell .feature-card,
            #fatcat-dom-panel-overlay .utility-shell .task-row {
                min-height:92px;
                border-radius:12px;
                background:
                    radial-gradient(circle at 8% 8%, rgba(255,255,255,.48), transparent 24%),
                    linear-gradient(#fff4d6,#dfbd84);
            }
            #fatcat-dom-panel-overlay .utility-shell .feature-icon,
            #fatcat-dom-panel-overlay .utility-shell .task-icon {
                background-color:#f6dfad;
                background-size:128%;
                background-position:center;
            }
            #fatcat-dom-panel-overlay .utility-shell .feature-badge,
            #fatcat-dom-panel-overlay .utility-shell .task-stamp {
                border:2px solid rgba(255,225,160,.28);
                box-shadow:0 3px 0 rgba(64,37,21,.28), inset 0 0 0 2px rgba(255,225,160,.12);
            }
            #fatcat-dom-panel-overlay .task-shell .task-daily-card,
            #fatcat-dom-panel-overlay .achievement-shell .feature-mini span,
            #fatcat-dom-panel-overlay .mail-shell .feature-mini span,
            #fatcat-dom-panel-overlay .friends-shell .feature-mini span,
            #fatcat-dom-panel-overlay .settings-shell .feature-mini span {
                min-height:74px;
                background:linear-gradient(#7c573b,#4a3022);
            }
            #fatcat-dom-panel-overlay .task-shell .task-daily-card { color:#ffe6b4; }
            #fatcat-dom-panel-overlay .task-shell .task-daily-card b { color:#fff8dc; }
            #fatcat-dom-panel-overlay .task-shell .css-icon {
                width:min(52px,72%);
                max-width:52px;
                overflow:hidden;
            }
            #fatcat-dom-panel-overlay .mail-shell .feature-card.ready,
            #fatcat-dom-panel-overlay .achievement-shell .feature-card.ready {
                box-shadow:0 0 0 3px rgba(245,190,71,.36), inset 0 0 0 2px rgba(255,250,224,.34), 0 3px 0 rgba(72,43,25,.22);
            }
            #fatcat-dom-panel-overlay .friends-shell .friend-request-card,
            #fatcat-dom-panel-overlay .friends-shell .leaderboard-card,
            #fatcat-dom-panel-overlay .friends-shell .friend-activity-card,
            #fatcat-dom-panel-overlay .friends-shell .friend-search-card {
                border-radius:12px;
            }
            #fatcat-dom-panel-overlay .friends-shell .feature-mini {
                grid-template-columns:repeat(3,1fr);
            }
            #fatcat-dom-panel-overlay .friends-shell .feature-mini span {
                min-height:58px;
            }
            #fatcat-dom-panel-overlay .leaderboard-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#76523a,#493124); border:2px solid #7c5736; color:#ffe2a8; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 3px 0 rgba(72,43,25,.24); font-size:2.05%; }
            #fatcat-dom-panel-overlay .leaderboard-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5%; font-weight:900; }
            #fatcat-dom-panel-overlay .leaderboard-head span { color:#fff; }
            #fatcat-dom-panel-overlay .leaderboard-row { min-height:34px; display:grid; grid-template-columns:14% 1fr 28%; gap:2%; align-items:center; border-top:1px solid rgba(255,226,170,.16); }
            #fatcat-dom-panel-overlay .leaderboard-row span { font-weight:900; color:#ffd36d; }
            #fatcat-dom-panel-overlay .leaderboard-row b { color:#fff6d8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .leaderboard-row em { justify-self:end; font-style:normal; font-weight:900; color:#9fdb69; }
            #fatcat-dom-panel-overlay .leaderboard-row.self { background:rgba(133,184,77,.18); border-radius:8px; padding:0 2%; }
            #fatcat-dom-panel-overlay .friend-tools { display:flex; align-items:center; justify-content:space-between; gap:2%; margin:0 0 2%; padding:1.6% 2.2%; border-radius:999px; background:rgba(75,49,32,.88); color:#ffe2a8; font-size:1.95%; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,226,170,.12), 0 2px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .friend-tools span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-tools .tag { margin:0; flex:0 0 auto; }
            #fatcat-dom-panel-overlay .friend-search-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#6e4c34,#3f2a20); border:2px solid #7c5736; color:#ffe2a8; box-shadow:inset 0 0 0 2px rgba(255,226,170,.1), 0 3px 0 rgba(72,43,25,.24); font-size:2.0%; }
            #fatcat-dom-panel-overlay .friend-search-row { display:grid; grid-template-columns:1fr auto auto; gap:1.5%; align-items:center; }
            #fatcat-dom-panel-overlay .friend-search-row input { min-width:0; height:38px; border-radius:999px; border:2px solid rgba(255,226,170,.32); background:#f7e5bf; color:#4a2f1f; padding:0 14px; font:inherit; font-weight:900; outline:none; box-sizing:border-box; }
            #fatcat-dom-panel-overlay .friend-search-result { margin-top:1.5%; display:grid; grid-template-columns:1fr auto; gap:2%; align-items:center; color:#fff4d8; }
            #fatcat-dom-panel-overlay .friend-search-result b { color:#fff; }
            #fatcat-dom-panel-overlay .friend-search-result em { display:block; font-style:normal; color:#f5c978; font-weight:900; }
            #fatcat-dom-panel-overlay .feature-badge.alert { background:linear-gradient(#e55b36,#9a321f); color:#fff6d8; box-shadow:0 0 0 3px rgba(255,220,120,.45), 0 4px 0 rgba(72,43,25,.28); }
            #fatcat-dom-panel-overlay .friend-request-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#fff7dc,#e2bf83); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.42), 0 3px 0 rgba(72,43,25,.22); font-size:2.0%; }
            #fatcat-dom-panel-overlay .request-row { min-height:38px; display:grid; grid-template-columns:14% 1fr 25% auto auto; gap:1.4%; align-items:center; border-top:1px solid rgba(124,87,54,.2); }
            #fatcat-dom-panel-overlay .request-row.sent { grid-template-columns:14% 1fr 32%; }
            #fatcat-dom-panel-overlay .request-row span { color:#fff6d8; background:#9a6734; border-radius:999px; padding:1px 8px; text-align:center; font-weight:900; }
            #fatcat-dom-panel-overlay .request-row b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .request-row em { font-style:normal; color:#725137; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .request-row .tag { min-width:52px; margin:0; }
            #fatcat-dom-panel-overlay .friend-activity-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#fff1d3,#d9b77e); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.34), 0 3px 0 rgba(72,43,25,.22); font-size:2.0%; }
            #fatcat-dom-panel-overlay .friend-activity-card .leaderboard-head { color:#5f3922; }
            #fatcat-dom-panel-overlay .friend-activity-card .leaderboard-head span { color:#7d4b22; }
            #fatcat-dom-panel-overlay .activity-row { min-height:34px; display:grid; grid-template-columns:18% 1fr 24%; gap:2%; align-items:center; border-top:1px solid rgba(124,87,54,.2); }
            #fatcat-dom-panel-overlay .activity-row span { color:#fff6d8; background:#7d4b22; border-radius:999px; padding:1px 8px; text-align:center; font-weight:900; }
            #fatcat-dom-panel-overlay .activity-row b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .activity-row em { justify-self:end; font-style:normal; color:#7a5a3e; font-weight:900; }
            #fatcat-dom-panel-overlay .activity-empty { color:#7a5a3e; font-weight:900; padding-top:1%; }
            #fatcat-dom-panel-overlay .friend-card { min-height:102px; display:grid; grid-template-columns:17% 1fr 24%; gap:2%; align-items:center; padding:2.2%; }
            #fatcat-dom-panel-overlay .friend-avatar { position:relative; width:100%; aspect-ratio:1; border-radius:18px; background:radial-gradient(circle at 50% 16%, rgba(255,255,255,.5), transparent 30%), linear-gradient(#f4d79d,#a87340); box-shadow:inset 0 0 0 3px rgba(97,61,32,.18), 0 4px 0 rgba(74,45,25,.18); overflow:hidden; }
            #fatcat-dom-panel-overlay .friend-avatar:before { content:""; position:absolute; left:23%; right:23%; top:17%; height:38%; border-radius:50%; background:radial-gradient(circle at 34% 46%,#3f2819 0 7%,transparent 8%), radial-gradient(circle at 66% 46%,#3f2819 0 7%,transparent 8%), linear-gradient(#ffd29a,#d9873b); box-shadow:-11px -8px 0 -6px #6b4228, 11px -8px 0 -6px #6b4228; }
            #fatcat-dom-panel-overlay .friend-avatar:after { content:""; position:absolute; left:17%; right:17%; bottom:10%; height:34%; border-radius:44% 44% 22% 22%; background:linear-gradient(#6f8a50,#3d5f34); box-shadow:inset 0 0 0 2px rgba(255,234,184,.22); }
            #fatcat-dom-panel-overlay .friend-rank { position:absolute; z-index:2; left:5%; top:5%; min-width:26%; padding:1% 4%; border-radius:999px; background:linear-gradient(#ffe36a,#d89421); color:#653719; text-align:center; font-weight:1000; box-shadow:inset 0 0 0 1px rgba(101,58,24,.24); }
            #fatcat-dom-panel-overlay .friend-copy b { display:block; color:#3f2818; font-size:112%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-copy em { display:block; margin:.6% 0 1.5%; color:#725137; font-style:normal; font-weight:900; }
            #fatcat-dom-panel-overlay .friend-profile-meta { display:flex; flex-wrap:wrap; gap:4px; margin:1% 0; }
            #fatcat-dom-panel-overlay .friend-profile-meta span { padding:1px 6px; border-radius:999px; background:rgba(91,57,31,.12); color:#694226; font-size:68%; font-weight:900; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-profile-meta.real-player span:first-child { background:#5f923b; color:#fff8dc; }
            #fatcat-dom-panel-overlay .friend-profile-meta.system-player span:first-child { background:#806347; color:#fff0cf; }
            #fatcat-dom-panel-overlay .friend-profile-meta .presence-state.online { background:#4d913c; color:#fff; }
            #fatcat-dom-panel-overlay .friend-profile-meta .presence-state.recent { background:#c88830; color:#fff7df; }
            #fatcat-dom-panel-overlay .friend-profile-meta .presence-state.offline { background:#74695f; color:#f4eadf; }
            #fatcat-dom-panel-overlay .friend-income { height:10px; margin:1.4% 0; border-radius:999px; background:#d7bd8e; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(91,61,34,.2); }
            #fatcat-dom-panel-overlay .friend-income i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#79aa43,#f0c34e); }
            #fatcat-dom-panel-overlay .friend-states { display:flex; flex-wrap:wrap; gap:2%; }
            #fatcat-dom-panel-overlay .friend-states span { padding:.8% 4%; border-radius:999px; background:rgba(98,62,34,.12); color:#694226; font-size:78%; font-weight:900; }
            #fatcat-dom-panel-overlay .friend-actions { display:flex; flex-direction:column; gap:8px; align-items:stretch; }
            #fatcat-dom-panel-overlay .friend-actions .tag { width:100%; margin:0; min-height:28px; }
            #fatcat-dom-panel-overlay .tag.boost { background:linear-gradient(#86c951,#4e8f2f); color:#fffbe6; border-color:#365f25; }
            #fatcat-dom-panel-overlay .friend-coop-card { display:grid; grid-template-columns:11% 1fr 25%; align-items:center; gap:2%; margin:2.2% 0; padding:2.2%; min-height:68px; max-height:112px; overflow:hidden; box-sizing:border-box; border-radius:12px; border:2px solid #8b653c; background:linear-gradient(135deg,#fff1cf,#d9b783); color:#4b3020; font-size:2.05%; line-height:1.3; box-shadow:0 4px 0 rgba(52,34,22,.25); }
            #fatcat-dom-panel-overlay .friend-coop-card.ready { border-color:#6b9a36; box-shadow:0 4px 0 rgba(52,34,22,.25),inset 0 0 18px rgba(128,190,68,.2); }
            #fatcat-dom-panel-overlay .coop-icon { width:36px; height:36px; justify-self:center; flex:none; overflow:hidden; box-sizing:border-box; border-radius:50%; display:flex; align-items:center; justify-content:center; background:linear-gradient(#8ac858,#4e8d31); color:#fff9df; font-size:16px; line-height:1; font-weight:900; border:2px solid #385f25; }
            #fatcat-dom-panel-overlay .coop-copy { min-width:0; }
            #fatcat-dom-panel-overlay .coop-copy b, #fatcat-dom-panel-overlay .coop-copy em, #fatcat-dom-panel-overlay .coop-copy span { display:block; }
            #fatcat-dom-panel-overlay .coop-copy em { font-style:normal; opacity:.74; font-size:82%; margin-top:1%; }
            #fatcat-dom-panel-overlay .coop-copy span { font-size:82%; font-weight:900; margin-top:1%; }
            #fatcat-dom-panel-overlay .coop-meter { height:8px; border-radius:999px; overflow:hidden; background:rgba(82,54,32,.2); margin-top:3%; }
            #fatcat-dom-panel-overlay .coop-meter i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#6fa83e,#e5b83d); }
            #fatcat-dom-panel-overlay .coop-reward { display:flex; flex-direction:column; align-items:stretch; gap:6px; text-align:center; }
            #fatcat-dom-panel-overlay .coop-reward > b { color:#6e3da5; font-size:120%; }
            #fatcat-dom-panel-overlay .coop-reward .tag { margin:0; }
            #fatcat-dom-panel-overlay .friend-snapshot-card { margin-bottom:2%; padding:2.2%; border-radius:14px; background:linear-gradient(#fff3d3,#d9b17a); border:2px solid #7c5736; color:#4a2f1f; box-shadow:inset 0 0 0 2px rgba(255,250,224,.38), 0 3px 0 rgba(72,43,25,.22); font-size:2.0%; }
            #fatcat-dom-panel-overlay .friend-snapshot-card .snapshot-head { display:grid; grid-template-columns:16% 1fr 22%; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .friend-snapshot-card .friend-avatar { width:100%; }
            #fatcat-dom-panel-overlay .snapshot-copy b { display:block; color:#3f2818; font-size:116%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .snapshot-copy em { display:block; color:#725137; font-style:normal; font-weight:900; }
            #fatcat-dom-panel-overlay .snapshot-meter { height:12px; margin:1.4% 0; border-radius:999px; background:#d7bd8e; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(91,61,34,.2); }
            #fatcat-dom-panel-overlay .snapshot-meter i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#77aa43,#f1c34f); }
            #fatcat-dom-panel-overlay .snapshot-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2%; margin-top:2%; }
            #fatcat-dom-panel-overlay .snapshot-stats span { min-height:34px; border-radius:10px; background:rgba(87,55,31,.12); color:#6d4325; display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; text-align:center; }
            #fatcat-dom-panel-overlay .snapshot-stats b { color:#3f2818; }
            #fatcat-dom-panel-overlay .snapshot-floors { margin-top:2%; display:grid; gap:5px; }
            #fatcat-dom-panel-overlay .snapshot-floor { min-height:32px; display:grid; grid-template-columns:16% 1fr 26%; align-items:center; gap:2%; padding:1.2% 2%; border-radius:10px; background:linear-gradient(90deg,rgba(102,70,42,.18),rgba(255,244,204,.42)); box-shadow:inset 0 0 0 1px rgba(110,75,42,.18); font-weight:900; }
            #fatcat-dom-panel-overlay .snapshot-floor i { display:flex; align-items:center; justify-content:center; min-height:24px; border-radius:8px; background:#795636; color:#ffe8b8; font-style:normal; font-size:92%; }
            #fatcat-dom-panel-overlay .snapshot-floor b { color:#3f2818; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .snapshot-floor em { color:#6c472b; font-style:normal; text-align:right; }
            #fatcat-dom-panel-overlay .snapshot-action { justify-self:end; display:flex; flex-direction:column; gap:7px; width:100%; }
            #fatcat-dom-panel-overlay .snapshot-action .tag { margin:0; width:100%; min-height:28px; }
            #fatcat-dom-panel-overlay .friend-visit-report { margin-bottom:2%; padding:2.4%; border-radius:16px; background:linear-gradient(135deg,#5a3d2a,#2e221b); border:2px solid #c99b58; color:#fff4d8; box-shadow:inset 0 0 0 2px rgba(255,230,166,.14), 0 5px 0 rgba(34,24,18,.3); font-size:2.0%; }
            #fatcat-dom-panel-overlay .visit-report-head { display:grid; grid-template-columns:16% 1fr auto; align-items:center; gap:2%; }
            #fatcat-dom-panel-overlay .visit-report-badge { width:100%; aspect-ratio:1; border-radius:16px; background:linear-gradient(#f8d46f,#c26c25); color:#4a2c18; display:flex; align-items:center; justify-content:center; font-weight:1000; box-shadow:inset 0 0 0 3px rgba(255,248,214,.24); }
            #fatcat-dom-panel-overlay .visit-report-copy b { display:block; color:#fffbe7; font-size:116%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .visit-report-copy em { display:block; color:#f2c36c; font-style:normal; font-weight:900; }
            #fatcat-dom-panel-overlay .visit-report-close { min-width:34px; aspect-ratio:1; border-radius:50%; border:2px solid rgba(255,236,184,.36); background:#7b5438; color:#fff4d8; font-weight:1000; cursor:pointer; }
            #fatcat-dom-panel-overlay .visit-report-grid { margin-top:2%; display:grid; grid-template-columns:1fr 1fr; gap:1.4%; }
            #fatcat-dom-panel-overlay .visit-report-grid span { min-height:42px; border-radius:11px; background:rgba(255,238,196,.12); display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:900; text-align:center; }
            #fatcat-dom-panel-overlay .visit-report-grid b { color:#ffe08a; }
            #fatcat-dom-panel-overlay .visit-report-floors { margin-top:2%; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2%; }
            #fatcat-dom-panel-overlay .visit-report-floors span { min-height:40px; border-radius:10px; background:rgba(255,246,215,.88); color:#4a2f1f; display:flex; align-items:center; justify-content:center; flex-direction:column; font-weight:1000; box-shadow:inset 0 0 0 1px rgba(97,61,32,.22); }
            #fatcat-dom-panel-overlay .visit-report-floors em { color:#7c5432; font-style:normal; font-size:86%; }
            #fatcat-dom-panel-overlay .visit-report-actions { margin-top:2%; display:grid; grid-template-columns:1fr 1fr; gap:2%; }
            #fatcat-dom-panel-overlay .visit-report-actions .tag { margin:0; min-height:30px; }
            #fatcat-dom-panel-overlay .friend-visit-scene { margin-bottom:2%; padding:2.4%; border-radius:18px; background:linear-gradient(180deg,#2f241d,#5a3b27 56%,#2d2119); border:2px solid #c59b62; color:#fff2cf; box-shadow:inset 0 0 0 2px rgba(255,236,190,.13), 0 5px 0 rgba(42,28,18,.28); font-size:2.0%; overflow:hidden; position:relative; }
            #fatcat-dom-panel-overlay .friend-visit-scene:before { content:""; position:absolute; inset:2.4%; border-radius:14px; background:linear-gradient(rgba(34,22,15,.18),rgba(34,22,15,.52)), var(--friend-factory-art) center 38%/cover no-repeat; opacity:.42; pointer-events:none; }
            #fatcat-dom-panel-overlay .friend-scene-head,
            #fatcat-dom-panel-overlay .friend-scene-stage,
            #fatcat-dom-panel-overlay .friend-scene-actions { position:relative; z-index:1; }
            #fatcat-dom-panel-overlay .friend-scene-head { display:grid; grid-template-columns:14% 1fr auto; gap:2%; align-items:center; margin-bottom:2%; }
            #fatcat-dom-panel-overlay .friend-scene-head .friend-avatar { width:100%; }
            #fatcat-dom-panel-overlay .friend-scene-head b { display:block; color:#fffbe4; font-size:122%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-scene-head em { display:block; color:#f4c16b; font-style:normal; font-weight:900; }
            #fatcat-dom-panel-overlay .friend-scene-head .friend-profile-meta span { background:rgba(255,235,189,.14); color:#ffe2a5; }
            #fatcat-dom-panel-overlay .friend-scene-head .friend-profile-meta.real-player span:first-child { background:#64993e; color:#fff; }
            #fatcat-dom-panel-overlay .friend-scene-close { min-width:34px; aspect-ratio:1; border-radius:50%; border:2px solid rgba(255,236,184,.36); background:#765137; color:#fff4d8; font-weight:1000; cursor:pointer; }
            #fatcat-dom-panel-overlay .friend-scene-stage { min-height:246px; display:grid; grid-template-columns:1fr 27%; gap:2%; align-items:stretch; }
            #fatcat-dom-panel-overlay .friend-scene-building { display:grid; gap:5px; padding:2%; border-radius:14px; background:rgba(28,20,16,.52); box-shadow:inset 0 0 0 2px rgba(255,226,170,.12); }
            #fatcat-dom-panel-overlay .friend-scene-floor { display:grid; grid-template-columns:12% 18% 1fr 23%; gap:1.5%; align-items:center; min-height:42px; padding:1% 1.6%; border-radius:9px; background:linear-gradient(90deg,rgba(255,242,204,.94),rgba(210,156,88,.78)); color:#4a2f1f; box-shadow:inset 0 0 0 1px rgba(91,57,31,.2); font-weight:900; }
            #fatcat-dom-panel-overlay .friend-scene-floor i { min-height:24px; border-radius:7px; background:#68452d; color:#ffe6b2; font-style:normal; display:flex; align-items:center; justify-content:center; }
            #fatcat-dom-panel-overlay .friend-scene-floor .room-thumb { width:100%; aspect-ratio:1.18; border-radius:8px; background:center/118% no-repeat #6d4a31; box-shadow:inset 0 0 0 2px rgba(255,238,190,.2), 0 2px 0 rgba(76,45,24,.18); }
            #fatcat-dom-panel-overlay .friend-scene-floor b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-scene-floor small { display:block; color:#745133; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-scene-floor .room-cats { display:flex; gap:3px; margin-top:2px; }
            #fatcat-dom-panel-overlay .friend-scene-floor .room-cats span { width:13px; height:13px; border-radius:50%; background:center 22%/150% no-repeat #d99a56; box-shadow:inset 0 0 0 1px rgba(80,49,27,.22), 0 1px 0 rgba(255,255,255,.25); }
            #fatcat-dom-panel-overlay .room-decor-tags { display:flex; gap:3px; min-width:0; margin-top:2px; overflow:hidden; }
            #fatcat-dom-panel-overlay .room-decor-tags s { min-width:0; max-width:50%; padding:1px 4px; border-radius:5px; background:#a66d32; color:#fff1c7; font-size:64%; line-height:1.2; text-decoration:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .friend-scene-floor em { justify-self:end; color:#51311f; font-style:normal; }
            #fatcat-dom-panel-overlay .friend-scene-side { display:grid; gap:6px; align-content:start; }
            #fatcat-dom-panel-overlay .friend-scene-mascot { min-height:72px; border-radius:12px; background:linear-gradient(#fff1cc,#c49158); position:relative; overflow:hidden; box-shadow:inset 0 0 0 2px rgba(93,59,33,.22); }
            #fatcat-dom-panel-overlay .friend-scene-mascot i { position:absolute; left:6%; bottom:-10%; width:60%; height:110%; background:center bottom/contain no-repeat; filter:drop-shadow(0 4px 0 rgba(76,45,24,.18)); }
            #fatcat-dom-panel-overlay .friend-scene-mascot b { position:absolute; right:6%; top:16%; color:#6a3d1f; font-size:112%; }
            #fatcat-dom-panel-overlay .friend-scene-mascot small { position:absolute; right:6%; bottom:14%; color:#7a5435; font-weight:900; }
            #fatcat-dom-panel-overlay .friend-scene-side span { min-height:50px; border-radius:11px; background:rgba(255,246,216,.9); color:#4a2f1f; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-weight:900; box-shadow:inset 0 0 0 1px rgba(93,59,33,.2); }
            #fatcat-dom-panel-overlay .friend-scene-side b { color:#7a471e; }
            #fatcat-dom-panel-overlay .friend-scene-reward { position:relative; z-index:1; margin-top:1.5%; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2%; }
            #fatcat-dom-panel-overlay .friend-scene-reward span { min-height:32px; border-radius:10px; background:rgba(255,246,216,.9); color:#4a2f1f; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; font-weight:900; box-shadow:inset 0 0 0 1px rgba(93,59,33,.2); }
            #fatcat-dom-panel-overlay .friend-scene-reward b { color:#7a471e; }
            #fatcat-dom-panel-overlay .friend-scene-actions { margin-top:2%; display:grid; grid-template-columns:repeat(5, minmax(0, 1fr)); gap:1.1%; }
            #fatcat-dom-panel-overlay .friend-scene-actions .tag { margin:0; min-height:30px; }
            #fatcat-dom-panel-overlay .friend-factory-detail { margin-bottom:2%; padding:2.4%; border-radius:16px; background:linear-gradient(#6a4930,#3f2a20); border:2px solid #9a6d42; color:#ffe9bd; box-shadow:inset 0 0 0 2px rgba(255,231,180,.12), 0 4px 0 rgba(48,32,22,.24); font-size:2.0%; }
            #fatcat-dom-panel-overlay .factory-detail-head { display:grid; grid-template-columns:1fr auto; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .factory-detail-head b { display:block; color:#fff7dd; font-size:116%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .factory-detail-head em { color:#f4c774; font-style:normal; font-weight:900; }
            #fatcat-dom-panel-overlay .factory-detail-head .tag { margin:0; min-height:28px; }
            #fatcat-dom-panel-overlay .factory-detail-stats { margin-top:2%; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2%; }
            #fatcat-dom-panel-overlay .factory-detail-stats span { min-height:38px; border-radius:10px; background:rgba(255,241,205,.13); display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; font-weight:900; }
            #fatcat-dom-panel-overlay .factory-detail-stats b { color:#ffe58f; }
            #fatcat-dom-panel-overlay .factory-room-list { margin-top:2%; display:grid; gap:5px; }
            #fatcat-dom-panel-overlay .factory-room-row { min-height:38px; display:grid; grid-template-columns:14% 1fr 24%; gap:2%; align-items:center; padding:1.2% 2%; border-radius:10px; background:rgba(255,246,216,.9); color:#4a2f1f; box-shadow:inset 0 0 0 1px rgba(93,59,33,.2); font-weight:900; }
            #fatcat-dom-panel-overlay .factory-room-row i { min-height:24px; border-radius:8px; background:#7c5736; color:#ffe9bd; font-style:normal; display:flex; align-items:center; justify-content:center; }
            #fatcat-dom-panel-overlay .factory-room-row b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .factory-room-row small { display:block; color:#7b5838; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .factory-room-row .room-decor-tags s { background:#8c6037; color:#fff0c8; }
            #fatcat-dom-panel-overlay .factory-room-row em { color:#5d3920; font-style:normal; text-align:right; }
            #fatcat-dom-panel-overlay.compact .friends-shell .feature-mini { grid-template-columns:repeat(3,1fr); }
            #fatcat-dom-panel-overlay.compact .friends-shell .feature-mini span { min-height:46px; font-size:1.58%; }
            #fatcat-dom-panel-overlay.compact .friend-card { min-height:86px; grid-template-columns:15% 1fr 25%; padding:2%; }
            #fatcat-dom-panel-overlay.compact .friend-actions { gap:5px; }
            #fatcat-dom-panel-overlay.compact .friend-coop-card { grid-template-columns:12% 1fr 27%; padding:1.8%; margin:1.6% 0; }
            #fatcat-dom-panel-overlay.compact .coop-copy em { font-size:74%; }
            #fatcat-dom-panel-overlay.compact .coop-icon { width:30px; height:30px; font-size:14px; }
            #fatcat-dom-panel-overlay.compact .friend-actions .tag { min-height:24px; font-size:82%; }
            #fatcat-dom-panel-overlay.compact .friend-snapshot-card .snapshot-head { grid-template-columns:15% 1fr 25%; }
            #fatcat-dom-panel-overlay.compact .snapshot-stats span { min-height:28px; font-size:82%; }
            #fatcat-dom-panel-overlay.compact .snapshot-floor { grid-template-columns:18% 1fr 28%; min-height:28px; font-size:84%; }
            #fatcat-dom-panel-overlay.compact .visit-report-head { grid-template-columns:15% 1fr auto; }
            #fatcat-dom-panel-overlay.compact .visit-report-grid span { min-height:34px; font-size:84%; }
            #fatcat-dom-panel-overlay.compact .visit-report-floors span { min-height:34px; font-size:82%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-head { grid-template-columns:15% 1fr auto; }
            #fatcat-dom-panel-overlay.compact .friend-scene-stage { min-height:164px; grid-template-columns:1fr 28%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-building { gap:3px; padding:1.4%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-floor { min-height:33px; grid-template-columns:13% 16% 1fr 25%; font-size:78%; padding:.6% 1.2%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-floor i { min-height:20px; }
            #fatcat-dom-panel-overlay.compact .friend-scene-floor .room-cats span { width:10px; height:10px; }
            #fatcat-dom-panel-overlay.compact .friend-scene-mascot { min-height:34px; }
            #fatcat-dom-panel-overlay.compact .friend-scene-mascot small { display:none; }
            #fatcat-dom-panel-overlay.compact .friend-scene-side { gap:2px; }
            #fatcat-dom-panel-overlay.compact .friend-scene-side span { min-height:23px; font-size:72%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-reward span { min-height:21px; font-size:72%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-actions { margin-top:1.2%; }
            #fatcat-dom-panel-overlay.compact .friend-scene-actions .tag { min-height:21px; font-size:74%; }
            #fatcat-dom-panel-overlay.compact .factory-detail-stats span { min-height:31px; font-size:82%; }
            #fatcat-dom-panel-overlay.compact .factory-room-row { grid-template-columns:16% 1fr 27%; min-height:32px; font-size:82%; }
            #fatcat-dom-panel-overlay .setting-row { display:grid; grid-template-columns:1fr 24%; gap:2%; align-items:center; }
            #fatcat-dom-panel-overlay .settings-shell .feature-card { min-height:84px; padding:2.2%; }
            #fatcat-dom-panel-overlay .settings-shell .setting-row { min-height:64px; }
            #fatcat-dom-panel-overlay .settings-shell .feature-list { gap:.8%; }
            #fatcat-dom-panel-overlay .toggle-pill { justify-self:end; min-width:86px; padding:7% 10%; border-radius:999px; background:linear-gradient(#85b84d,#4f842e); color:white; font-weight:900; text-align:center; box-shadow:0 3px 0 rgba(52,88,29,.35); }
            #fatcat-dom-panel-overlay .toggle-pill.off { background:linear-gradient(#96775b,#5d412f); }
            #fatcat-dom-panel-overlay .progress-line { height: 12px; margin-top: 3%; border-radius: 999px; background: #d4bd91; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .progress-line i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #79aa43, #f0c34e); }
            #fatcat-dom-panel-overlay .mini-progress { height: 12px; margin: 3% 0; border-radius: 999px; background: #d4bd91; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .mini-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #79aa43, #f0c34e); }
            #fatcat-dom-panel-overlay .tree-line { position:absolute; height:2px; background:#d8a651; transform-origin:left center; box-shadow:0 0 10px rgba(255,190,75,.45); }
            #fatcat-dom-panel-overlay .tree-line.v { width:2px; height:18%; transform:none; }
            #fatcat-dom-panel-overlay .item { min-height: 120px; padding: 4%; font-size: 2.75%; line-height: 1.45; }
            #fatcat-dom-panel-overlay .shop-row { min-height: 94px; display: grid; grid-template-columns: 18% 1fr 27%; align-items: center; gap: 2%; }
            #fatcat-dom-panel-overlay .shop-row b { font-size:118%; }
            #fatcat-dom-panel-overlay .shop-icon, #fatcat-dom-panel-overlay .bag-icon { aspect-ratio: 1; border-radius: 14px; background: linear-gradient(#fff9e8,#d6ad70); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 3px rgba(118,78,43,.2), 0 4px 0 rgba(82,48,27,.25); position:relative; overflow:hidden; }
            #fatcat-dom-panel-overlay .shop-icon.asset, #fatcat-dom-panel-overlay .bag-icon.asset { background:center/cover no-repeat; }
            #fatcat-dom-panel-overlay .shop-icon.asset .css-icon, #fatcat-dom-panel-overlay .bag-icon.asset .css-icon { display:none; }
            #fatcat-dom-panel-overlay .bag-card { min-height: 126px; text-align: center; padding: 7% 5%; position:relative; }
            #fatcat-dom-panel-overlay .bag-card:after { content:""; position:absolute; right:7%; top:7%; width:18%; aspect-ratio:1; border-radius:50%; background:rgba(255,255,255,.26); box-shadow:0 0 0 1px rgba(113,76,42,.12); }
            #fatcat-dom-panel-overlay .bag-card.usable:after { content:"可用"; width:auto; aspect-ratio:auto; padding:1.2% 5%; border-radius:999px; background:#5f8f3a; color:#fff; font-size:72%; font-weight:900; }
            #fatcat-dom-panel-overlay .bag-card.empty { opacity:.78; filter:grayscale(.35); }
            #fatcat-dom-panel-overlay .bag-card.resource:before { content:""; position:absolute; left:6%; top:6%; width:22%; height:5%; border-radius:999px; background:linear-gradient(90deg,#f5c15a,#78aa43); box-shadow:0 1px 0 rgba(80,48,24,.28); }
            #fatcat-dom-panel-overlay .bag-count { position:absolute; right:7%; bottom:7%; min-width:28%; padding:1.5% 5%; border-radius:999px; background:#5b3923; color:#ffe2a8; font-weight:900; font-size:85%; box-shadow:inset 0 0 0 1px rgba(255,225,160,.16), 0 2px 0 rgba(0,0,0,.22); }
            #fatcat-dom-panel-overlay .css-icon { position:relative; display:block; width:62%; aspect-ratio:1; filter: drop-shadow(0 2px 0 rgba(77,43,21,.28)); }
            #fatcat-dom-panel-overlay .css-icon.coin { border-radius:50%; background:radial-gradient(circle at 35% 28%, #fff7a8 0 12%, transparent 13%), linear-gradient(#ffd75c,#d58918); box-shadow:inset 0 0 0 3px #9d6412; }
            #fatcat-dom-panel-overlay .css-icon.coin:after { content:""; position:absolute; inset:24%; border-radius:50%; border:3px solid rgba(120,72,12,.45); }
            #fatcat-dom-panel-overlay .css-icon.bean { width:54%; height:72%; border-radius:48% 52% 45% 55%; background:linear-gradient(135deg,#8a4b24,#4d2816); transform:rotate(24deg); box-shadow:inset -6px -7px 0 rgba(33,17,9,.2); }
            #fatcat-dom-panel-overlay .css-icon.bean:after { content:""; position:absolute; left:45%; top:9%; width:13%; height:82%; border-radius:99px; background:rgba(255,223,160,.35); transform:rotate(12deg); }
            #fatcat-dom-panel-overlay .css-icon.food { width:72%; height:55%; border-radius:0 0 38% 38%; background:linear-gradient(#fff0d0 0 18%, #d9e6f4 19% 45%, #b78c5a 46%); bottom:-8%; }
            #fatcat-dom-panel-overlay .css-icon.food:before { content:""; position:absolute; left:15%; right:15%; top:-28%; height:42%; border-radius:50% 50% 20% 20%; background:radial-gradient(circle at 25% 70%, #7a351b 0 12%, transparent 13%), radial-gradient(circle at 50% 30%, #9b4d24 0 12%, transparent 13%), radial-gradient(circle at 75% 70%, #6e3119 0 12%, transparent 13%), #b65d2c; }
            #fatcat-dom-panel-overlay .css-icon.diamond { width:72%; clip-path:polygon(50% 0, 95% 34%, 50% 100%, 5% 34%); background:linear-gradient(135deg,#fff3ff 0 12%,#af75ff 42%,#6432b8 100%); }
            #fatcat-dom-panel-overlay .css-icon.gift { border-radius:14%; background:linear-gradient(90deg,transparent 0 42%,#ffd36a 43% 57%,transparent 58%), linear-gradient(#d9432e 0 45%,#b92e23 46%); box-shadow:inset 0 0 0 3px #7e2118; }
            #fatcat-dom-panel-overlay .css-icon.gift:before { content:""; position:absolute; left:8%; right:8%; top:39%; height:14%; background:#ffd36a; }
            #fatcat-dom-panel-overlay .css-icon.shard { width:65%; clip-path:polygon(45% 0, 82% 25%, 68% 100%, 20% 82%, 8% 28%); background:linear-gradient(145deg,#fff0a7,#f09a2a 42%,#9a451b); }
            #fatcat-dom-panel-overlay .css-icon.equip { border-radius:50%; background:radial-gradient(circle at 50% 54%, transparent 0 35%, #617b50 36% 57%, #34442b 58%); box-shadow:inset 0 0 0 4px #8e9d79; }
            #fatcat-dom-panel-overlay .css-icon.cat { border-radius:48% 48% 42% 42%; background:linear-gradient(#f6c58a,#d98342); }
            #fatcat-dom-panel-overlay .css-icon.cat:before { content:""; position:absolute; left:7%; right:7%; top:-10%; height:38%; background:linear-gradient(135deg,#d98342 0 28%,transparent 29%), linear-gradient(225deg,#d98342 0 28%,transparent 29%); }
            #fatcat-dom-panel-overlay .css-icon.cat:after { content:""; position:absolute; left:27%; top:43%; width:10%; height:10%; border-radius:50%; background:#4b2a1d; box-shadow:26px 0 0 #4b2a1d, 13px 16px 0 -2px #7e3a25; }
            #fatcat-dom-panel-overlay .css-icon.deco { border-radius:18%; background:linear-gradient(#8ed0e8 0 46%,#4fa0be 47%); box-shadow:inset 0 0 0 4px #31687b; }
            #fatcat-dom-panel-overlay .css-icon.deco:before { content:""; position:absolute; left:33%; right:33%; top:-19%; height:30%; border-radius:50% 50% 0 0; background:#7a5a35; }
            #fatcat-dom-panel-overlay .css-icon.task { border-radius:18%; background:linear-gradient(#fff6dc,#e1b56f); box-shadow:inset 0 0 0 4px #8b6034; }
            #fatcat-dom-panel-overlay .css-icon.task:before { content:""; position:absolute; left:24%; right:24%; top:-8%; height:22%; border-radius:8px; background:#7e5430; }
            #fatcat-dom-panel-overlay .css-icon.task:after { content:""; position:absolute; left:25%; top:34%; width:50%; height:8%; border-radius:99px; background:#8b6034; box-shadow:0 14px 0 #8b6034, 0 28px 0 #8b6034; }
            #fatcat-dom-panel-overlay .price { display:inline-flex; align-items:center; justify-content:center; gap:6px; white-space:nowrap; }
            #fatcat-dom-panel-overlay .price .css-icon { width:20px; min-width:20px; }
            #fatcat-dom-panel-overlay .research-detail { display:grid; gap:2%; }
            #fatcat-dom-panel-overlay .research-hero { min-height: 146px; display:grid; grid-template-columns:24% 1fr; gap:4%; align-items:center; }
            #fatcat-dom-panel-overlay .research-hero .shop-icon { width:100%; max-width:104px; justify-self:center; }
            #fatcat-dom-panel-overlay .effect-pill { display:inline-flex; align-items:center; gap:8px; margin-top:3%; padding:2% 4%; border-radius:999px; background:rgba(91,57,31,.12); font-weight:900; }
            #fatcat-dom-panel-overlay .effect-pill .css-icon { width:22px; min-width:22px; }
            #fatcat-dom-panel-overlay .research-cost { margin-top:4%; padding:3%; border-radius:12px; background:rgba(91,57,31,.1); box-shadow:inset 0 0 0 2px rgba(95,60,30,.1); }
            #fatcat-dom-panel-overlay .research-cost-line { height:14px; margin-top:2%; border-radius:999px; background:#d4bd91; overflow:hidden; box-shadow:inset 0 0 0 1px rgba(91,64,38,.25); }
            #fatcat-dom-panel-overlay .research-cost-line i { display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,#6ea545,#f0c34e); }
            #fatcat-dom-panel-overlay .research-state { display:inline-flex; align-items:center; gap:6px; margin-top:2%; padding:1.4% 4%; border-radius:999px; background:#4f3320; color:#ffe0a7; font-weight:900; }
            #fatcat-dom-panel-overlay .research-lab { display:grid; grid-template-columns:16% 1fr 24%; gap:2%; align-items:center; margin-bottom:2%; padding:2%; border-radius:16px; background:linear-gradient(#fff1d5,#d4a86e); border:3px solid #7c5736; box-shadow:inset 0 0 0 2px rgba(255,250,224,.36), 0 4px 0 rgba(72,43,25,.24); color:#4a2f1f; font-size:2.2%; }
            #fatcat-dom-panel-overlay .research-lab-icon { width:100%; max-width:84px; aspect-ratio:1; border-radius:18px; background:linear-gradient(#9bd9e8,#4b8fa2); position:relative; justify-self:center; box-shadow:inset 0 0 0 3px #31687b, 0 3px 0 rgba(72,43,25,.22); }
            #fatcat-dom-panel-overlay .research-lab-icon:before { content:""; position:absolute; left:34%; right:34%; top:12%; height:58%; border-radius:0 0 9px 9px; background:linear-gradient(#fff7d7 0 24%,#73b957 25%); box-shadow:inset 0 0 0 2px rgba(56,76,45,.35); }
            #fatcat-dom-panel-overlay .research-lab b { font-size:155%; }
            #fatcat-dom-panel-overlay .research-lab small { display:block; color:#7a5a3e; font-size:86%; margin-top:1%; }
            #fatcat-dom-panel-overlay .research-badge { justify-self:end; padding:6% 9%; border-radius:999px; background:#5d3821; color:#ffe2a8; font-weight:900; box-shadow:inset 0 0 0 2px rgba(255,225,160,.12); text-align:center; }
            #fatcat-dom-panel-overlay .research-preview { display:grid; grid-template-columns:repeat(2,1fr); gap:2%; margin-top:3%; }
            #fatcat-dom-panel-overlay .research-preview span { padding:5% 4%; border-radius:12px; background:linear-gradient(#fff8df,#d9b980); font-weight:900; text-align:center; box-shadow:inset 0 0 0 2px rgba(112,78,45,.14); }
            #fatcat-dom-panel-overlay .tree { min-height: 480px; background: radial-gradient(circle at 50% 30%, rgba(255,197,93,.15), transparent 34%), linear-gradient(#3b2a20,#1f1510); border:3px solid #6f4a2d; border-radius:14px; position: relative; box-shadow: inset 0 0 0 3px rgba(255,224,160,.12), 0 4px 0 rgba(52,31,18,.28); }
            #fatcat-dom-panel-overlay .node { position: absolute; width: 30%; min-height: 12%; border-radius: 14px; background: linear-gradient(#82623b,#3b271b); border: 2px solid #d7a85a; color: #ffe0a0; display: grid; grid-template-columns:30% 1fr; align-items: center; justify-content: center; text-align: left; font-size: 2.0%; font-weight: 900; box-shadow: 0 0 14px rgba(255,180,70,.28), inset 0 0 0 2px rgba(255,235,180,.12); padding:1.6% 2%; box-sizing:border-box; }
            #fatcat-dom-panel-overlay .node-icon { width:82%; aspect-ratio:1; border-radius:50%; background:linear-gradient(#fff0b8,#cc8730); box-shadow:inset 0 0 0 3px #6f441f; position:relative; justify-self:center; }
            #fatcat-dom-panel-overlay .node-icon:before { content:""; position:absolute; inset:24%; border-radius:50%; background:#ffe16b; box-shadow:0 0 10px rgba(255,210,80,.5); }
            #fatcat-dom-panel-overlay .node.done .node-icon { background:linear-gradient(#91c75c,#3f7d2d); }
            #fatcat-dom-panel-overlay .node.locked .node-icon { background:linear-gradient(#9a9186,#514940); }
            #fatcat-dom-panel-overlay button.node { font-family: inherit; cursor: pointer; pointer-events: auto; }
            #fatcat-dom-panel-overlay .node.selected { box-shadow: 0 0 0 3px #ffd071 inset, 0 0 18px rgba(255,190,75,.55); }
            #fatcat-dom-panel-overlay .node.done { background: linear-gradient(#5f8f3a,#2d4e22); border-color:#b8e078; color:#f3ffe0; }
            #fatcat-dom-panel-overlay .node.done:after { content:"✓"; position:absolute; right:5%; top:8%; width:16%; aspect-ratio:1; border-radius:50%; background:#f4d05b; color:#31501f; display:flex; align-items:center; justify-content:center; font-weight:900; }
            #fatcat-dom-panel-overlay .node.locked:after { content:""; position:absolute; right:5%; top:8%; width:15%; aspect-ratio:1; border-radius:4px; background:#6f6253; box-shadow:inset 0 0 0 2px rgba(255,236,190,.16); }
            #fatcat-dom-panel-overlay .node.locked { filter: grayscale(1); opacity: .72; }
            #fatcat-dom-panel-overlay .research-detail { min-height: 480px; }
            #fatcat-dom-panel-overlay .item b { font-size: 120%; }
            #fatcat-dom-panel-overlay .tag { display: inline-block; margin-top: 3%; padding: 1.2% 4%; background: linear-gradient(#86b84c,#4d842d); color: white; border-radius: 999px; font-weight: 800; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 3px 0 rgba(52,88,29,.35); }
            #fatcat-dom-panel-overlay .tag .css-icon { display:inline-block; width:18px; min-width:18px; vertical-align:middle; margin-right:5px; }
            #fatcat-dom-panel-overlay button.tag { border: 0; cursor: pointer; pointer-events: auto; font: inherit; }
            #fatcat-dom-panel-overlay button.tag:disabled { cursor: default; opacity: .72; }
            #fatcat-dom-panel-overlay .warn { background: #8f5f3a; }
            #fatcat-dom-panel-overlay .wide { margin-top: 2.2%; padding: 3%; font-size: 2.8%; line-height: 1.45; }
            #fatcat-dom-panel-overlay .message { margin: 2% auto 0; width: 88%; min-height: 5%; padding: 1.2% 2%; border-radius: 999px; background: rgba(66, 48, 31, .88); color: #ffe7b3; text-align: center; font-size: 2.55%; font-weight: 800; box-shadow: inset 0 0 0 2px rgba(255,222,154,.12); }
            #fatcat-dom-panel-overlay .building-shell,
            #fatcat-dom-panel-overlay .shop-shell,
            #fatcat-dom-panel-overlay .inventory-shell,
            #fatcat-dom-panel-overlay .research-shell {
                background:
                    repeating-linear-gradient(135deg,rgba(102,68,38,.025) 0 2px,transparent 2px 7px),
                    linear-gradient(#f0dbb3,#bd8e5e 68%,#684a35);
            }
            #fatcat-dom-panel-overlay .building-selector {
                display:grid;
                grid-template-columns:repeat(6,1fr);
                gap:1%;
                margin-bottom:1.4%;
                padding:1%;
                border-radius:12px;
                background:rgba(62,39,25,.72);
                box-shadow:inset 0 0 0 2px rgba(255,226,169,.12);
            }
            #fatcat-dom-panel-overlay .building-chip {
                min-height:48px;
                padding:3% 2%;
                border:0;
                border-radius:9px;
                background:linear-gradient(#8b6849,#513728);
                color:#f8deb0;
                font:inherit;
                font-size:1.65%;
                font-weight:900;
                cursor:pointer;
                pointer-events:auto;
                box-shadow:0 2px 0 rgba(36,22,14,.36),inset 0 1px 0 rgba(255,239,205,.16);
            }
            #fatcat-dom-panel-overlay .building-chip b,
            #fatcat-dom-panel-overlay .building-chip span,
            #fatcat-dom-panel-overlay .building-chip small {
                display:block;
            }
            #fatcat-dom-panel-overlay .building-chip b { font-size:150%; }
            #fatcat-dom-panel-overlay .building-chip span { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            #fatcat-dom-panel-overlay .building-chip small { color:#e6bd7e; }
            #fatcat-dom-panel-overlay .building-chip.active {
                background:linear-gradient(#ffd487,#d98b2c);
                color:#5d351b;
                box-shadow:0 0 0 2px #fff0b5 inset,0 3px 0 #8a4f22;
            }
            #fatcat-dom-panel-overlay .building-detail-hero {
                position:relative;
                min-height:225px;
                border:3px solid #67452e;
                border-radius:14px;
                background-size:175% auto;
                background-position:center 54%;
                overflow:hidden;
                box-shadow:inset 0 0 0 3px rgba(255,232,185,.2),0 4px 0 rgba(58,34,20,.3);
            }
            #fatcat-dom-panel-overlay .building-detail-hero:after {
                content:"";
                position:absolute;
                inset:auto 0 0;
                height:38%;
                background:linear-gradient(transparent,rgba(31,19,13,.82));
            }
            #fatcat-dom-panel-overlay .building-floor-tag {
                position:absolute;
                z-index:3;
                left:3%;
                top:4%;
                min-width:16%;
                padding:2% 3%;
                border-radius:10px;
                background:linear-gradient(#fff0c9,#d4a363);
                color:#62401f;
                font-size:3.1%;
                font-weight:900;
                text-align:center;
                box-shadow:0 3px 0 rgba(57,34,19,.3),inset 0 0 0 2px rgba(255,255,255,.28);
            }
            #fatcat-dom-panel-overlay .building-floor-tag small {
                display:block;
                font-size:48%;
            }
            #fatcat-dom-panel-overlay .building-scene-prop {
                display:none;
            }
            #fatcat-dom-panel-overlay .building-hero-copy {
                position:absolute;
                z-index:3;
                left:3%;
                right:3%;
                bottom:4%;
                display:flex;
                align-items:center;
                gap:3%;
                color:#fff1cf;
                text-shadow:0 2px #392218;
                font-size:2.3%;
            }
            #fatcat-dom-panel-overlay .building-hero-copy b { font-size:145%; }
            #fatcat-dom-panel-overlay .building-hero-copy span,
            #fatcat-dom-panel-overlay .building-hero-copy em {
                padding:.8% 3%;
                border-radius:999px;
                background:rgba(56,36,24,.82);
                font-style:normal;
                font-weight:900;
            }
            #fatcat-dom-panel-overlay .building-description {
                margin:1.5% 0;
                padding:2.4% 3%;
                border-radius:10px;
                background:rgba(255,244,218,.72);
                color:#604027;
                font-size:2.15%;
                line-height:1.35;
                box-shadow:inset 0 0 0 1px rgba(103,67,37,.14);
            }
            #fatcat-dom-panel-overlay .building-decor-manager {
                margin:1.4% 0;
                padding:2.2%;
                border-radius:12px;
                background:linear-gradient(135deg,#6c4930,#3e2b20);
                color:#ffe9ba;
                box-shadow:inset 0 0 0 2px rgba(255,226,170,.12),0 3px 0 rgba(57,36,23,.2);
                font-size:1.9%;
            }
            #fatcat-dom-panel-overlay .building-decor-head { display:flex; align-items:center; justify-content:space-between; gap:3%; margin-bottom:1.4%; }
            #fatcat-dom-panel-overlay .building-decor-head b { color:#fff7db; font-size:115%; }
            #fatcat-dom-panel-overlay .building-decor-head span { color:#efc775; font-weight:900; }
            #fatcat-dom-panel-overlay .building-decor-list { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
            #fatcat-dom-panel-overlay .building-decor-item {
                min-height:46px;
                display:grid;
                grid-template-columns:14% 1fr auto;
                gap:3%;
                align-items:center;
                padding:2%;
                border-radius:9px;
                background:rgba(255,244,212,.92);
                color:#4e321f;
            }
            #fatcat-dom-panel-overlay .building-decor-item.stored { opacity:.76; }
            #fatcat-dom-panel-overlay .building-decor-item .decor-glyph { color:#c2762f; font-size:150%; text-align:center; }
            #fatcat-dom-panel-overlay .building-decor-item b,
            #fatcat-dom-panel-overlay .building-decor-item small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            #fatcat-dom-panel-overlay .building-decor-item small { color:#815d3b; font-weight:900; }
            #fatcat-dom-panel-overlay .building-decor-item .tag { min-height:26px; margin:0; padding:3px 7px; }
            #fatcat-dom-panel-overlay .building-decor-manager.offline p { margin:0; color:#f1d6a5; }
            #fatcat-dom-panel-overlay .building-target-effects,
            #fatcat-dom-panel-overlay .building-conditions {
                padding:2.5%;
                border-radius:12px;
                background:linear-gradient(#fff3d7,#e1bd87);
                border:2px solid rgba(105,69,38,.34);
                box-shadow:inset 0 0 0 2px rgba(255,255,255,.24),0 3px 0 rgba(62,38,22,.2);
            }
            #fatcat-dom-panel-overlay .building-target-title {
                display:flex;
                align-items:center;
                gap:3%;
                margin-bottom:1%;
                font-size:2.15%;
            }
            #fatcat-dom-panel-overlay .building-target-title b { margin-right:auto; }
            #fatcat-dom-panel-overlay .building-target-row {
                display:grid;
                grid-template-columns:1fr 20% 8% 20%;
                gap:2%;
                align-items:center;
                min-height:30px;
                border-top:1px solid rgba(107,72,40,.14);
                font-size:1.95%;
            }
            #fatcat-dom-panel-overlay .building-target-row b,
            #fatcat-dom-panel-overlay .building-target-row strong { text-align:right; }
            #fatcat-dom-panel-overlay .building-target-row em { color:#5d8d3a; text-align:center; font-style:normal; }
            #fatcat-dom-panel-overlay .building-conditions { margin-top:1.4%; }
            #fatcat-dom-panel-overlay .building-conditions > b { font-size:2.15%; }
            #fatcat-dom-panel-overlay .building-conditions > div {
                display:grid;
                grid-template-columns:1fr auto;
                align-items:center;
                min-height:31px;
                border-top:1px solid rgba(107,72,40,.14);
                font-size:1.9%;
            }
            #fatcat-dom-panel-overlay .building-conditions span {
                display:flex;
                align-items:center;
                gap:3%;
            }
            #fatcat-dom-panel-overlay .building-conditions .css-icon { width:20px; min-width:20px; }
            #fatcat-dom-panel-overlay .building-conditions strong.ok { color:#4f842e; }
            #fatcat-dom-panel-overlay .building-conditions strong.bad { color:#b13f2e; }
            #fatcat-dom-panel-overlay .building-main-upgrade {
                display:flex;
                justify-content:center;
                margin:1.6% 0 2%;
            }
            #fatcat-dom-panel-overlay .building-main-upgrade .tag {
                min-width:62%;
                margin:0;
                padding:2.4% 5%;
                border-radius:10px;
                text-align:center;
                font-size:2.3%;
            }
            #fatcat-dom-panel-overlay .building-roster {
                padding:2.5%;
                border-radius:12px;
                background:rgba(67,43,29,.72);
                color:#ffe0a7;
                font-size:2%;
            }
            #fatcat-dom-panel-overlay .building-roster .schedule-row {
                margin-top:1.3%;
            }
            #fatcat-dom-panel-overlay .shop-shell .shop-list { gap:1.2%; }
            #fatcat-dom-panel-overlay .shop-shell .shop-row {
                min-height:91px;
                padding:2.2% 3%;
                grid-template-columns:19% 1fr 24%;
                font-size:2.08%;
                border-radius:10px;
            }
            #fatcat-dom-panel-overlay .shop-shell .shop-row:before,
            #fatcat-dom-panel-overlay .shop-shell .shop-row:after { display:none; }
            #fatcat-dom-panel-overlay .shop-shell .shop-icon {
                width:82%;
                justify-self:center;
                background-size:128%;
                box-shadow:none;
            }
            #fatcat-dom-panel-overlay .shop-shell .tag {
                margin:0;
                padding:5% 7%;
                border-radius:9px;
            }
            #fatcat-dom-panel-overlay .shop-row.preview { opacity:.94; }
            #fatcat-dom-panel-overlay .shop-row.preview .preview-price {
                display:inline-flex;
                background:linear-gradient(#87b94e,#4e842f);
                color:#fff;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-grid {
                grid-template-columns:repeat(4,1fr);
                gap:1.15%;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-card {
                min-height:92px;
                padding:5% 3%;
                border-radius:9px;
                font-size:1.55%;
                display:flex;
                align-items:center;
                flex-direction:column;
                overflow:hidden;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-card.selected {
                border-color:#d98b2c;
                box-shadow:inset 0 0 0 3px #ffd77a,0 3px 0 rgba(72,43,25,.24);
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-card:after,
            #fatcat-dom-panel-overlay .inventory-shell .bag-card:before { display:none; }
            #fatcat-dom-panel-overlay .inventory-shell .bag-icon {
                width:68%;
                max-width:58px;
                margin-bottom:3%;
                border-radius:8px;
                background-size:136%;
                box-shadow:none;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-card > b {
                max-width:96%;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
                font-size:100%;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-card .tag {
                margin-top:3%;
                padding:2% 7%;
                font-size:72%;
            }
            #fatcat-dom-panel-overlay .inventory-shell .bag-count {
                position:static;
                min-width:0;
                margin-top:auto;
                padding:1% 7%;
                font-size:76%;
            }
            #fatcat-dom-panel-overlay .bag-detail-target {
                display:grid;
                grid-template-columns:18% 1fr;
                gap:3%;
                align-items:center;
                margin-top:1.5%;
                padding:2.5%;
                border-radius:12px;
                background:linear-gradient(#fff2d5,#ddb981);
                border:2px solid rgba(105,69,38,.34);
                color:#51331f;
                box-shadow:inset 0 0 0 2px rgba(255,255,255,.25),0 3px 0 rgba(62,38,22,.2);
                font-size:1.9%;
            }
            #fatcat-dom-panel-overlay .bag-detail-icon {
                width:100%;
                aspect-ratio:1;
                border-radius:12px;
                background:center/132% no-repeat;
                box-shadow:inset 0 0 0 2px rgba(104,68,37,.18);
            }
            #fatcat-dom-panel-overlay .bag-detail-target b { font-size:140%; }
            #fatcat-dom-panel-overlay .bag-detail-target strong { float:right; }
            #fatcat-dom-panel-overlay .bag-detail-target p { margin:2% 0; }
            #fatcat-dom-panel-overlay .bag-detail-target small { color:#7b573d; }
            #fatcat-dom-panel-overlay .research-point-strip {
                display:flex;
                justify-content:space-between;
                margin:-.5% 0 1.2%;
                padding:1% 2.4%;
                border-radius:999px;
                background:rgba(65,42,28,.82);
                color:#ffe1a9;
                font-size:1.85%;
                font-weight:900;
            }
            #fatcat-dom-panel-overlay .research-shell .research-view {
                grid-template-columns:59% 1fr;
                gap:1.4%;
            }
            #fatcat-dom-panel-overlay .research-shell .tree,
            #fatcat-dom-panel-overlay .research-shell .research-detail {
                min-height:570px;
            }
            #fatcat-dom-panel-overlay .research-shell .node {
                width:34%;
                min-height:11%;
                padding:1.3%;
                font-size:1.5%;
            }
            #fatcat-dom-panel-overlay .research-shell .research-detail {
                gap:1.2%;
            }
            #fatcat-dom-panel-overlay .research-shell .research-detail .item {
                min-height:0;
                padding:6%;
                font-size:1.75%;
            }
            #fatcat-dom-panel-overlay .research-shell .research-hero {
                grid-template-columns:1fr;
                text-align:center;
            }
            #fatcat-dom-panel-overlay .research-shell .research-hero .shop-icon {
                width:46%;
            }
            #fatcat-dom-panel-overlay .research-shell .research-preview {
                grid-template-columns:1fr;
            }
            #fatcat-dom-panel-overlay.compact .panel-shell { padding: 4.4% 2.6% 17.5%; }
            #fatcat-dom-panel-overlay.compact .panel-close { width:7.6%; min-width:36px; }
            #fatcat-dom-panel-overlay.compact h2 { font-size: 3.85%; margin-bottom: 2.4%; }
            #fatcat-dom-panel-overlay.compact .tab { font-size: 2.05%; padding: 4.8% 1%; }
            #fatcat-dom-panel-overlay.compact .summary div { font-size: 2.25%; padding: 4.8%; }
            #fatcat-dom-panel-overlay.compact .building-view { grid-template-columns: 1fr; gap: 2%; }
            #fatcat-dom-panel-overlay.compact .building-dashboard { grid-template-columns:repeat(2,1fr); }
            #fatcat-dom-panel-overlay.compact .building-pipeline { grid-template-columns:repeat(2,1fr); }
            #fatcat-dom-panel-overlay.compact .task-daily { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .task-reward-strip span { font-size:2.2%; min-height:36px; }
            #fatcat-dom-panel-overlay.compact .feature-grid, #fatcat-dom-panel-overlay.compact .feature-mini { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .friends-shell .feature-mini { grid-template-columns:repeat(3,1fr); }
            #fatcat-dom-panel-overlay.compact .friends-shell .feature-mini span { min-height:46px; font-size:1.58%; }
            #fatcat-dom-panel-overlay.compact .friend-card { min-height:86px; grid-template-columns:15% 1fr 25%; padding:2%; }
            #fatcat-dom-panel-overlay.compact .friend-actions { gap:5px; }
            #fatcat-dom-panel-overlay.compact .friend-actions .tag { min-height:24px; font-size:82%; }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-mini { grid-template-columns:repeat(3,1fr); }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-mini span { min-height:48px; font-size:1.75%; }
            #fatcat-dom-panel-overlay.compact .settings-shell .feature-card { min-height:62px; font-size:1.92%; }
            #fatcat-dom-panel-overlay.compact .settings-shell .toggle-pill { min-width:64px; padding:5% 8%; }
            #fatcat-dom-panel-overlay.compact .feature-card.with-icon { grid-template-columns:18% 1fr; }
            #fatcat-dom-panel-overlay.compact .feature-card.with-icon > div:last-child { grid-column:1 / 3; }
            #fatcat-dom-panel-overlay.compact .research-lab { grid-template-columns:18% 1fr; }
            #fatcat-dom-panel-overlay.compact .research-badge { grid-column:1 / 3; justify-self:stretch; padding:2.4% 4%; }
            #fatcat-dom-panel-overlay.compact .mini-factory { min-height: 430px; }
            #fatcat-dom-panel-overlay.compact .schedule-row { font-size: 2.35%; }
            #fatcat-dom-panel-overlay.compact .research-detail { min-height: 360px; }
            #fatcat-dom-panel-overlay.compact .tree { min-height: 430px; }
            #fatcat-dom-panel-overlay.compact .skin-card, #fatcat-dom-panel-overlay.compact .bag-card { min-height: 104px; }
            #fatcat-dom-panel-overlay.compact .shop-row { grid-template-columns: 16% 1fr 25%; min-height: 82px; }
            #fatcat-dom-panel-overlay.compact .shop-hero { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .shop-mascot { display:none; }
            #fatcat-dom-panel-overlay.compact .bag-hero { grid-template-columns:1fr; }
            #fatcat-dom-panel-overlay.compact .bag-capacity { display:none; }
            #fatcat-dom-panel-overlay.compact .list.bag-grid { grid-template-columns: repeat(3, 1fr); }
            #fatcat-dom-panel-overlay.compact .inventory-shell .list.bag-grid { grid-template-columns:repeat(4,1fr); }
            #fatcat-dom-panel-overlay.compact .research-shell .list.research-view { grid-template-columns:59% 1fr; gap:1.4%; }
            #fatcat-dom-panel-overlay.compact .research-shell .tree,
            #fatcat-dom-panel-overlay.compact .research-shell .research-detail { min-height:570px; }
            #fatcat-dom-panel-overlay.compact .building-detail-hero { min-height:210px; }
            #fatcat-dom-panel-overlay.compact .building-chip span { display:none; }
            #fatcat-dom-panel-overlay.compact .building-chip { min-height:42px; font-size:1.55%; }
            #fatcat-dom-panel-overlay.compact .shop-shell .shop-row { min-height:86px; }
            #fatcat-dom-panel-overlay.compact .inventory-shell .bag-card { min-height:82px; }
            #fatcat-dom-panel-overlay.tall .panel-shell { padding-top: 4.8%; padding-bottom: 18.5%; }
            #fatcat-dom-panel-overlay.wide .panel-shell { left: 8%; right: 8%; }
        `;
