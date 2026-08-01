export type HudResourceKind = "coin" | "bean" | "food" | "diamond";

export interface HudResourceItem {
    kind: HudResourceKind;
    label: string;
    resourceKey: "coin" | "bean" | "catFood" | "diamond";
}

export const HUD_COMPANY_NAME = "肥猫咖啡公司";
export const HUD_PLAYER_LEVEL = 28;
export const HUD_EXP_TEXT = "2560/3200";
export const HUD_EXP_PERCENT = 80;

export const HUD_RESOURCE_ITEMS: HudResourceItem[] = [
    { kind: "coin", label: "金币", resourceKey: "coin" },
    { kind: "bean", label: "咖啡豆", resourceKey: "bean" },
    { kind: "food", label: "猫粮", resourceKey: "catFood" },
    { kind: "diamond", label: "钻石", resourceKey: "diamond" },
];

export const DOM_HUD_STYLES = `            #fatcat-dom-hud { position: fixed; z-index: 2147482500; pointer-events: none; font-family: Arial, sans-serif; color: #fff3d8; }
            #fatcat-dom-hud .hud-inner { position: absolute; inset: 0; }
            #fatcat-dom-hud .player { position: absolute; left: 2.1%; top: 2.2%; width: 25.8%; height: 7.35%; border-radius: 19px; background: radial-gradient(circle at 23% 16%, rgba(255,247,216,.52), transparent 22%), linear-gradient(#b28d66, #6a5038 70%, #38291f); border: 3px solid #e0bd7c; box-shadow: 0 5px 0 rgba(0,0,0,.38), inset 0 2px 0 rgba(255,250,222,.32), inset 0 -10px 18px rgba(42,27,18,.22), inset 0 0 0 2px rgba(255,242,199,.14); display: grid; grid-template-columns: 27% 1fr; align-items: center; box-sizing: border-box; overflow: visible; }
            #fatcat-dom-hud .player:before { content:""; position:absolute; left:6%; right:6%; top:7%; height:18%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.38), rgba(255,255,255,.05)); pointer-events:none; }
            #fatcat-dom-hud .player:after { content:""; position:absolute; left:30%; right:8%; bottom:8%; height:16%; border-radius:999px; background:linear-gradient(#1f160f,#3a2618); border:1px solid rgba(255,239,186,.16); pointer-events:none; }
            #fatcat-dom-hud .avatar { position: relative; width: 82%; aspect-ratio: 1; margin-left: 8%; border-radius: 50%; background: radial-gradient(circle at 38% 24%, rgba(255,255,255,.5), transparent 20%), linear-gradient(#f6d491,#c98542); color: #fff3d8; display: flex; align-items: end; justify-content: center; padding-bottom: 4%; box-sizing: border-box; font-size: 0; font-weight: 900; box-shadow:0 0 0 4px rgba(77,48,28,.55), 0 4px 0 rgba(0,0,0,.34), inset 0 0 0 3px #ffe0a4, inset 0 -7px 0 rgba(103,57,26,.18); }
            #fatcat-dom-hud .avatar::before { content:""; position:absolute; left:24%; top:18%; width:52%; height:42%; border-radius:50%; background: radial-gradient(circle at 34% 48%, #3d281d 0 8%, transparent 9%), radial-gradient(circle at 66% 48%, #3d281d 0 8%, transparent 9%), radial-gradient(circle at 50% 66%,#8a4c2a 0 6%,transparent 7%), linear-gradient(#f0a458,#d98943); box-shadow:-8px -8px 0 -5px #5b3824, 8px -8px 0 -5px #5b3824, inset 8px -3px 0 rgba(255,238,205,.24); }
            #fatcat-dom-hud .avatar::after { content:""; position:absolute; left:25%; right:25%; bottom:15%; height:15%; border-radius:50%; background:radial-gradient(ellipse at 50% 0,#fff4d8 0 44%,transparent 45%); opacity:.72; }
            #fatcat-dom-hud .level { position:absolute; left:-5.8%; bottom:-10%; width:29%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle at 38% 22%, rgba(255,248,204,.45), transparent 24%), linear-gradient(#f2b657,#9c5a1b); border:2px solid #ffe8b1; color:#fff5d2; display:flex; align-items:center; justify-content:center; font-size:2.05%; font-weight:900; text-shadow:0 2px #6f3814; box-shadow:0 4px 0 rgba(0,0,0,.36), inset 0 0 0 2px rgba(120,68,25,.22); }
            #fatcat-dom-hud .company { font-size: 2.05%; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top:1%; color:#2d2018; text-shadow:0 1px rgba(255,235,190,.5); }
            #fatcat-dom-hud .exp { margin-top: 3%; width: 88%; height: 24%; border-radius: 999px; background: linear-gradient(#2b1c12,#140d09); overflow: hidden; box-shadow: inset 0 0 0 2px rgba(255,238,188,.16), 0 1px 0 rgba(255,239,188,.14); }
            #fatcat-dom-hud .exp span { display: block; height: 100%; background: linear-gradient(90deg, #e99918, #ffe373); box-shadow:inset 0 2px 0 rgba(255,255,255,.28); }
            #fatcat-dom-hud .exp-text { position: absolute; left: 32%; top: 55%; width: 50%; text-align: center; color: #fff3c5; font-size: 1.55%; font-weight: 900; text-shadow:0 1px #3a2517; }
            #fatcat-dom-hud .resources { position: absolute; left: 29.2%; top: 2.95%; right: 1.5%; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .9%; }
            #fatcat-dom-hud .res { position:relative; height: 5.45%; min-height: 44px; border-radius: 999px 13px 13px 999px; background: radial-gradient(circle at 7% 20%, rgba(255,241,184,.42), transparent 19%), linear-gradient(#80644d, #463325 70%, #2b1f18); border: 3px solid #c79a5e; box-shadow: 0 5px 0 rgba(0,0,0,.36), inset 0 2px 0 rgba(255,247,208,.25), inset 0 -8px 14px rgba(38,24,16,.22), inset 0 0 0 2px rgba(255,229,173,.12); display: grid; grid-template-columns: 25% minmax(0, 1fr) 19%; align-items: center; box-sizing: border-box; overflow: visible; }
            #fatcat-dom-hud .res:before { content:""; position:absolute; left:10%; right:15%; top:9%; height:18%; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,.32), rgba(255,255,255,0)); pointer-events:none; }
            #fatcat-dom-hud .res:after { content:""; position:absolute; right:18.5%; top:18%; bottom:18%; width:1px; background:rgba(255,226,164,.2); box-shadow:-1px 0 rgba(48,31,20,.38); pointer-events:none; }
            #fatcat-dom-hud .icon { position: relative; z-index:1; width: 108%; aspect-ratio: 1; margin-left: -16%; border-radius:50%; background:radial-gradient(circle at 36% 25%, rgba(255,255,255,.6), transparent 19%), linear-gradient(#ffe8a6,#b8792d); border:2px solid #5f3a1c; font-size: inherit; color: transparent; display: block; overflow: hidden; filter: drop-shadow(0 2px 0 rgba(0,0,0,.28)); box-sizing:border-box; box-shadow:0 0 0 4px rgba(255,231,165,.2), 0 2px 0 rgba(0,0,0,.25), inset 0 -5px 0 rgba(80,45,20,.16); }
            #fatcat-dom-hud .icon:after { content:""; position:absolute; inset:9%; border-radius:inherit; pointer-events:none; box-shadow:inset 0 3px 0 rgba(255,255,255,.22), inset 0 -4px 0 rgba(80,45,20,.18); }
            #fatcat-dom-hud .coin .icon::before { content:""; position:absolute; inset:7%; border-radius:50%; background: radial-gradient(circle at 36% 30%, #fff2a4 0 12%, transparent 13%), linear-gradient(#ffd454,#d48a17); box-shadow: inset 0 0 0 3px #9a6216, inset 0 -5px 0 rgba(111,64,12,.16); }
            #fatcat-dom-hud .coin .icon::after { content:"$"; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#8a5512; font-size:2.0%; font-weight:900; }
            #fatcat-dom-hud .bean .icon::before { content:""; position:absolute; left:18%; top:10%; width:62%; height:78%; border-radius:54% 46% 52% 48%; background: linear-gradient(125deg,#5b321d,#a96737 54%,#4a2818); transform: rotate(30deg); box-shadow: inset 7px 0 0 rgba(255,214,158,.22), inset -4px -7px 0 rgba(28,13,6,.22); }
            #fatcat-dom-hud .bean .icon::after { content:""; position:absolute; left:47%; top:19%; width:7%; height:62%; border-radius:999px; background:rgba(255,221,171,.32); transform:rotate(38deg); }
            #fatcat-dom-hud .food .icon::before { content:""; position:absolute; left:10%; right:10%; bottom:12%; height:46%; border-radius:14px 14px 20px 20px; background: linear-gradient(#f6e9d2,#cf8e4a); box-shadow: inset 0 0 0 2px #7d4f2b, inset 0 -6px 0 rgba(105,58,28,.15); }
            #fatcat-dom-hud .food .icon::after { content:""; position:absolute; left:24%; right:24%; top:14%; height:38%; border-radius:50% 50% 45% 45%; background: radial-gradient(circle at 28% 35%, #7f3d1c 0 16%, transparent 17%), radial-gradient(circle at 70% 38%, #7f3d1c 0 15%, transparent 16%), #b7622d; }
            #fatcat-dom-hud .diamond .icon { background:radial-gradient(circle at 35% 24%, rgba(255,255,255,.72), transparent 18%), linear-gradient(#7c5bc5,#37235e); }
            #fatcat-dom-hud .diamond .icon::before { content:""; position:absolute; left:10%; right:10%; top:16%; height:66%; clip-path: polygon(50% 0, 92% 30%, 50% 100%, 8% 30%); background: linear-gradient(135deg,#f7e8ff 0 16%,#b981ff 17% 42%,#6c48d8 43% 72%,#3f2a9a 73%); box-shadow: inset 0 0 0 3px rgba(255,255,255,.32); }
            #fatcat-dom-hud .diamond .icon::after { content:""; position:absolute; left:31%; top:23%; width:17%; height:24%; clip-path:polygon(0 0,100% 0,42% 100%); background:rgba(255,255,255,.62); }
            #fatcat-dom-hud .value { position:relative; z-index:1; font-size: 2.18%; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: clip; text-shadow:0 2px 0 rgba(0,0,0,.38); padding-left:0; letter-spacing:0; transform:translateY(1%); }
            #fatcat-dom-hud .res-name { display:none; }
            #fatcat-dom-hud .res .value { padding-top:0; }
            #fatcat-dom-hud .plus { position:relative; z-index:1; width: 76%; aspect-ratio: 1; border-radius: 8px; background: radial-gradient(circle at 38% 20%, rgba(255,236,164,.64), transparent 28%), linear-gradient(#ffc14d,#e48114 70%,#a84d12); color: #fff4d8; display: flex; align-items: center; justify-content: center; font-size: 2.52%; font-weight: 900; box-shadow:0 3px 0 rgba(94,48,12,.45), inset 0 1px 0 rgba(255,235,190,.32), inset 0 -2px 0 rgba(109,50,13,.2); }
            #fatcat-dom-hud .plus:before { content:""; position:absolute; left:17%; right:17%; top:17%; height:18%; border-radius:999px; background:rgba(255,246,202,.42); }
            #fatcat-dom-hud .factory-msg { position: absolute; left: 21%; top: 80%; width: 58%; min-height: 3.8%; border-radius: 999px; background: rgba(52,35,24,.88); color: #ffe6b5; display: flex; align-items: center; justify-content: center; font-size: 2.4%; font-weight: 900; box-shadow: 0 2px 0 rgba(0,0,0,.3); }
            #fatcat-dom-hud.compact .player { width: 27.2%; left: .8%; }
            #fatcat-dom-hud.compact .company { font-size: 1.64%; }
            #fatcat-dom-hud.compact .resources { left: 29.3%; right: .7%; gap: .28%; }
            #fatcat-dom-hud.compact .res { grid-template-columns: 22% minmax(0, 1fr) 15.5%; min-height: 34px; border-width: 2px; }
            #fatcat-dom-hud.compact .icon { width:90%; margin-left:-4%; border-width:1px; box-shadow:0 0 0 2px rgba(255,231,165,.2), 0 2px 0 rgba(0,0,0,.22), inset 0 -4px 0 rgba(80,45,20,.14); }
            #fatcat-dom-hud.compact .value { font-size: 1.7%; }
            #fatcat-dom-hud.compact .plus { width: 58%; font-size: 1.9%; border-radius:6px; }
            #fatcat-dom-hud.compact.tall .player { left:.7%; width:28.5%; height:6.35%; border-radius:15px; }
            #fatcat-dom-hud.compact.tall .company { font-size:1.42%; }
            #fatcat-dom-hud.compact.tall .exp { height:19%; margin-top:2.3%; }
            #fatcat-dom-hud.compact.tall .exp-text { font-size:1.18%; top:53%; }
            #fatcat-dom-hud.compact.tall .resources { left:29.7%; right:.55%; top:3.0%; gap:.22%; }
            #fatcat-dom-hud.compact.tall .res { min-height:29px; height:4.08%; grid-template-columns:20.5% minmax(0,1fr) 14.5%; border-radius:999px 9px 9px 999px; }
            #fatcat-dom-hud.compact.tall .res .value { font-size:1.38%; padding-left:0; }
            #fatcat-dom-hud.compact.tall .icon { width:75%; margin-left:2%; border-width:1px; }
            #fatcat-dom-hud.compact.tall .plus { width:46%; border-radius:6px; font-size:1.5%; }
            #fatcat-dom-hud.wide .player { left: 9%; top:2.0%; width: 20.8%; height:6.85%; border-radius:18px; }
            #fatcat-dom-hud.wide .company { font-size:1.75%; }
            #fatcat-dom-hud.wide .exp-text { font-size:1.28%; }
            #fatcat-dom-hud.wide .resources { left: 31.4%; right: 9%; top:2.55%; gap:.82%; }
            #fatcat-dom-hud.wide .res { min-height:39px; height:4.75%; grid-template-columns:24% minmax(0,1fr) 18%; }
            #fatcat-dom-hud.wide .value { font-size:1.86%; }
            #fatcat-dom-hud.wide .plus { width:64%; font-size:2.08%; }
            #fatcat-dom-hud .avatar.asset {
                background-color:#e5b269;
                background-position:center 24%;
                background-size:175%;
                background-repeat:no-repeat;
            }
            #fatcat-dom-hud .avatar.asset:before,
            #fatcat-dom-hud .avatar.asset:after { display:none !important; }
            #fatcat-dom-hud .icon.asset {
                border:0;
                border-radius:0;
                background-color:transparent;
                background-position:center;
                background-size:contain;
                background-repeat:no-repeat;
                box-shadow:none;
                filter:drop-shadow(0 2px 0 rgba(0,0,0,.3));
            }
            #fatcat-dom-hud .icon.asset:before,
            #fatcat-dom-hud .icon.asset:after { display:none !important; }
            #fatcat-dom-hud .player {
                grid-template-columns:31% 1fr;
                padding:0 3.0% 0 1.2%;
                background:
                    repeating-linear-gradient(92deg,rgba(113,72,36,.035) 0 1px,transparent 1px 7px),
                    radial-gradient(circle at 21% 15%, rgba(255,255,255,.72), transparent 23%),
                    linear-gradient(#f2dfb8 0 54%, #c49b66 55%, #7e5b3e);
                border-color:#8b6848;
                box-shadow:
                    0 5px 0 rgba(0,0,0,.34),
                    0 0 0 1px rgba(62,39,23,.5),
                    inset 0 0 0 3px rgba(255,248,220,.42),
                    inset 0 -10px 16px rgba(82,49,25,.2);
            }
            #fatcat-dom-hud .player span {
                position:relative;
                z-index:1;
                min-width:0;
                padding-left:2%;
            }
            #fatcat-dom-hud .avatar {
                width:92%;
                margin-left:2%;
            }
            #fatcat-dom-hud .level {
                left:-7.8%;
                bottom:-12%;
                width:32%;
                border-width:3px;
                font-size:2.25%;
            }
            #fatcat-dom-hud .company {
                padding-top:0;
                font-size:2.22%;
                line-height:1.0;
                color:#352316;
                text-shadow:0 1px rgba(255,244,210,.72);
            }
            #fatcat-dom-hud .exp {
                position:relative;
                z-index:1;
                margin-top:4%;
                width:93%;
                height:18%;
            }
            #fatcat-dom-hud .exp-text {
                left:41%;
                top:58%;
                width:42%;
                font-size:1.46%;
            }
            #fatcat-dom-hud .resources {
                left:30.5%;
                right:1.2%;
                top:2.85%;
                gap:.72%;
            }
            #fatcat-dom-hud .res {
                grid-template-columns:24% minmax(0,1fr) 18.5%;
                background:
                    radial-gradient(circle at 8% 18%,rgba(255,233,169,.28),transparent 18%),
                    linear-gradient(#5a493b 0 12%,#302720 13% 72%,#201914 73%);
                border-color:#9b7042;
                box-shadow:
                    0 4px 0 rgba(28,17,10,.42),
                    0 0 0 1px rgba(55,34,20,.74),
                    inset 0 2px 0 rgba(255,230,176,.28),
                    inset 0 0 0 2px rgba(232,181,111,.1),
                    inset 0 -7px 10px rgba(9,7,5,.22);
            }
            #fatcat-dom-hud .res:before {
                left:24%;
                right:20%;
                top:10%;
                height:13%;
                background:linear-gradient(90deg,rgba(255,240,201,.22),rgba(255,255,255,0));
            }
            #fatcat-dom-hud .res:after {
                right:18.5%;
                top:15%;
                bottom:15%;
                background:rgba(237,191,122,.23);
                box-shadow:-1px 0 rgba(18,11,7,.58);
            }
            #fatcat-dom-hud .icon.asset {
                filter:
                    drop-shadow(0 3px 0 rgba(30,17,8,.48))
                    drop-shadow(0 0 2px rgba(255,222,155,.3));
            }
            #fatcat-dom-hud .value {
                color:#fff7e6;
                text-shadow:0 2px 0 #1a100b,0 0 3px rgba(255,232,185,.18);
            }
            #fatcat-dom-hud .plus {
                border:1px solid rgba(255,223,157,.5);
                background:
                    radial-gradient(circle at 38% 18%,rgba(255,244,198,.58),transparent 26%),
                    linear-gradient(#f5aa33,#d66c11 72%,#9f3e0d);
                box-shadow:
                    0 3px 0 rgba(61,30,9,.7),
                    inset 0 1px 0 rgba(255,245,208,.38),
                    inset 0 -3px 0 rgba(100,39,10,.2);
            }
            #fatcat-dom-hud.compact .player {
                width:28.2%;
                grid-template-columns:32% 1fr;
                padding-right:2.2%;
            }
            #fatcat-dom-hud.compact .company { font-size:1.54%; }
            #fatcat-dom-hud.compact .level { left:-2.5%; width:31%; font-size:1.82%; }
            #fatcat-dom-hud.compact .exp-text { left:40%; width:43%; font-size:1.12%; }
            #fatcat-dom-hud.compact .resources { left:30.0%; right:.6%; gap:.24%; }
            #fatcat-dom-hud.compact.tall .player {
                left:.8%;
                width:28.6%;
                height:6.7%;
                border-radius:15px;
            }
            #fatcat-dom-hud.compact.tall .company { font-size:1.68%; }
            #fatcat-dom-hud.compact.tall .level { left:-1.2%; bottom:-8%; width:29%; }
            #fatcat-dom-hud.compact.tall .exp { height:17%; margin-top:3%; width:92%; }
            #fatcat-dom-hud.compact.tall .exp-text { top:55%; font-size:1.05%; }
            #fatcat-dom-hud.compact.tall .resources { left:30.2%; right:.45%; top:3.02%; gap:.42%; }
            #fatcat-dom-hud.compact.tall .res {
                grid-template-columns:26% minmax(0,1fr) 22%;
            }
            #fatcat-dom-hud.compact.tall .icon.asset {
                width:108%;
                margin-left:-8%;
            }
            #fatcat-dom-hud.compact.tall .plus {
                width:82%;
                font-size:1.8%;
            }
            @media (max-width:390px) {
                #fatcat-dom-hud.compact.tall .player {
                    left:.55%;
                    width:30.4%;
                    grid-template-columns:31% 1fr;
                    padding-left:.6%;
                    padding-right:1.4%;
                }
                #fatcat-dom-hud.compact.tall .avatar.asset {
                    width:98%;
                    margin-left:-2%;
                    background-size:168%;
                }
                #fatcat-dom-hud.compact.tall .company {
                    font-size:1.32%;
                    line-height:1.02;
                }
                #fatcat-dom-hud.compact.tall .level {
                    width:27%;
                    left:-.5%;
                    bottom:-6%;
                    font-size:1.45%;
                    border-width:2px;
                }
                #fatcat-dom-hud.compact.tall .exp {
                    height:15%;
                    margin-top:2.6%;
                    width:91%;
                }
                #fatcat-dom-hud.compact.tall .exp-text {
                    top:55%;
                    left:38%;
                    width:45%;
                    font-size:.86%;
                }
                #fatcat-dom-hud.compact.tall .resources {
                    left:31.6%;
                    right:.45%;
                    gap:.16%;
                }
                #fatcat-dom-hud.compact.tall .res {
                    grid-template-columns:22% minmax(0,1fr) 18%;
                }
                #fatcat-dom-hud.compact.tall .res .value { font-size:1.22%; }
                #fatcat-dom-hud.compact.tall .icon.asset {
                    width:96%;
                    margin-left:0;
                }
                #fatcat-dom-hud.compact.tall .plus {
                    width:72%;
                    font-size:1.45%;
                }
            }

            /* Final target pass: use viewport-aware type instead of tiny
               inherited percentage sizes while preserving measured geometry. */
            #fatcat-dom-hud .company {
                font-size:clamp(12px,3.35vw,18px);
                line-height:1.05;
                letter-spacing:0;
            }
            #fatcat-dom-hud .value {
                font-size:clamp(12px,3.05vw,17px);
                line-height:1;
            }
            #fatcat-dom-hud .level {
                font-size:clamp(12px,3.1vw,17px);
            }
            #fatcat-dom-hud .exp-text {
                font-size:clamp(8px,2.2vw,12px);
                line-height:1;
            }
            #fatcat-dom-hud .plus {
                font-size:clamp(15px,4vw,22px);
                line-height:1;
            }
            #fatcat-dom-hud.compact .company,
            #fatcat-dom-hud.compact.tall .company {
                font-size:clamp(9px,2.55vw,13px);
            }
            #fatcat-dom-hud.compact .value,
            #fatcat-dom-hud.compact.tall .res .value {
                font-size:clamp(7px,1.9vw,8px);
            }
            #fatcat-dom-hud.compact .level,
            #fatcat-dom-hud.compact.tall .level {
                font-size:clamp(9px,2.4vw,12px);
            }
            #fatcat-dom-hud.compact .exp-text,
            #fatcat-dom-hud.compact.tall .exp-text {
                font-size:clamp(7px,1.75vw,9px);
            }
            #fatcat-dom-hud.compact .plus,
            #fatcat-dom-hud.compact.tall .plus {
                font-size:clamp(12px,3vw,16px);
            }
            #fatcat-dom-hud .res {
                border-width:2px;
            }
            #fatcat-dom-hud .icon.asset {
                transform:scale(1.08);
                transform-origin:center;
            }
            @media (max-width:390px) {
                #fatcat-dom-hud.compact.tall .company {
                    font-size:clamp(8px,2.35vw,10px);
                }
                #fatcat-dom-hud.compact.tall .res .value {
                    font-size:clamp(7px,1.85vw,8px);
                }
            }
            #fatcat-dom-hud.wide .company { font-size:10px; }
            #fatcat-dom-hud.wide .value { font-size:8px; }
            #fatcat-dom-hud.wide .level { font-size:11px; }
            #fatcat-dom-hud.wide .exp-text { font-size:8px; }
            #fatcat-dom-hud.wide .plus { font-size:14px; }

            /* Final first-screen hierarchy: preserve the measured HUD bands
               while making the brand and live balances read at phone scale. */
            #fatcat-dom-hud .player[data-main-zone="identity"] .level {
                box-shadow:0 3px 0 rgba(66,38,19,.38),inset 0 0 0 2px rgba(255,239,190,.28),0 0 0 1px rgba(73,44,24,.35);
            }
            #fatcat-dom-hud .resources[data-main-zone="resources"] .res {
                min-width:0;
            }
            #fatcat-dom-hud.compact .company,
            #fatcat-dom-hud.compact.tall .company {
                font-size:clamp(10px,2.65vw,13px);
            }
            #fatcat-dom-hud.compact .value,
            #fatcat-dom-hud.compact.tall .res .value {
                font-size:clamp(8px,2.15vw,9px);
            }
            #fatcat-dom-hud .res.coin .value,
            #fatcat-dom-hud.compact .res.coin .value,
            #fatcat-dom-hud.compact.tall .res.coin .value { font-size:8px; }
            #fatcat-dom-hud.compact .exp-text,
            #fatcat-dom-hud.compact.tall .exp-text {
                color:#fff0bf;
                text-shadow:0 1px 0 rgba(43,25,14,.64);
            }
            @media (max-width:390px) {
                #fatcat-dom-hud.compact.tall .company { font-size:clamp(9px,2.55vw,10px); }
                #fatcat-dom-hud.compact.tall .res .value { font-size:8px; }
            }
            #fatcat-dom-hud.wide .company { font-size:10px; }
            #fatcat-dom-hud.wide .value { font-size:8px; }`;
