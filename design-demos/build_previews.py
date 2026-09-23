"""Build three self-contained design studies from existing project assets.
No external requests, model calls, package execution, or persistent user data.
These are direction prototypes; production behavior stays in the Taro app.
"""
from pathlib import Path
import base64
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "design-demos"


def asset(relative):
    path = ROOT / relative
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode()


catalog = []
source = (ROOT / "src/data/monsters.ts").read_text()
for block in re.findall(r"\{\s+id: 'M-\d+'.*?\n  \}", source, re.S):
    fields = dict(re.findall(r"(\w+): '([^']*)'", block))
    catalog.append({
        "name": fields["monsterName"], "short": fields["shortName"],
        "type": fields["monsterType"], "line": fields["catchphrase"],
        "why": fields["trueIdentity"], "action": fields["microAction"],
        "image": asset("src/assets/monsters/" + fields["slug"] + ".png")
    })
assert len(catalog) == 16, "The design must use the fixed 16-monster catalog"
brand = asset("src/assets/brand/home-wordmark.png")
guide = asset("src/assets/monsters/shelter-guide.png")
room = asset("src/assets/scenes/shelter-room-v1.png")
icons = {name: asset("src/assets/icons/nav/" + name + "-active-v2.png")
         for name in ["home", "records", "discover", "profile"]}

CSS = r"""
:root {
  --brand-cream:#fffaf2; --brand-ink:#2b1648; --brand-muted:#665873;
  --brand-purple:#b197fc; --brand-action:#7049cf; --brand-mint:#a5efd2;
  --brand-white:#fff; --brand-surface:color-mix(in srgb,var(--brand-purple) 10%,white);
  --brand-line:color-mix(in srgb,var(--brand-ink) 16%,white);
  --brand-soft:color-mix(in srgb,var(--brand-purple) 20%,white);
  --shadow:0 20px 65px color-mix(in srgb,var(--brand-action) 9%,transparent);
  --body:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  --display:"Songti SC",STSong,"Noto Serif CJK SC",serif;
}
*{box-sizing:border-box} [hidden]{display:none!important}
html,body{margin:0;height:100%;color:var(--brand-ink);font-family:var(--body);font-size:15px}
body{background:var(--brand-cream);overflow:hidden}
button,input,textarea{font:inherit;color:inherit}
button,a,input{touch-action:manipulation}
button{border:0;cursor:pointer;background:none}
button,a,textarea{outline-offset:4px}
button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid var(--brand-action)}
button:disabled{opacity:.45;cursor:not-allowed}
button:not(:disabled):hover{filter:brightness(.98)}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0} h1,h2,h3{text-wrap:balance}
p{line-height:1.7;text-wrap:pretty}
img{max-width:100%;object-fit:contain;display:block}
.review-bar{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:var(--brand-ink);color:var(--brand-white);font-size:12px;gap:16px}
.review-links{display:flex;gap:20px}.review-links a{opacity:.7}.review-links a[aria-current]{opacity:1;text-decoration:underline;text-underline-offset:5px}
.app{height:calc(100dvh - 34px);max-width:1600px;margin:auto;display:grid;grid-template-rows:72px minmax(0,1fr) 88px}
.topbar{padding:0 48px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.top-id{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:650;letter-spacing:.07em}
.brand-seal{width:32px;height:32px}
.top-right{display:flex;align-items:center;gap:20px;font-size:12px;color:var(--brand-muted)}
.quiet-link{border-bottom:1px solid var(--brand-line);padding:8px 0;min-height:40px}
.status-dot{display:inline-block;width:6px;height:6px;background:var(--brand-action);border-radius:100%;margin-right:7px}
main{min-height:0;position:relative;margin:0 48px}
.screen{height:100%;min-height:0}
.home{height:100%;position:relative}
.wordmark{width:220px}
.tagline{font-size:12px;color:var(--brand-muted);letter-spacing:.04em;white-space:nowrap}
.welcome p{font-size:15px;color:var(--brand-muted);max-width:250px}
.welcome h1{font-size:26px;line-height:1.55;letter-spacing:.02em;font-weight:600}
.guide{width:310px;filter:drop-shadow(0 16px 20px color-mix(in srgb,var(--brand-purple) 20%,transparent));position:relative;z-index:2}
.guide-note{border:1px solid var(--brand-line);border-radius:18px 18px 4px;background:var(--brand-white);box-shadow:var(--shadow);padding:16px 18px;max-width:210px;position:relative;z-index:3}
.guide-note b{font-size:13px;display:block;margin-bottom:6px;color:var(--brand-action)}
.guide-note p{font-size:14px;line-height:1.7}
.compose{min-width:0;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-size:12px;font-weight:650;letter-spacing:.14em;color:var(--brand-action)}
.compose h2{font-size:28px;line-height:1.5;font-weight:650;margin:12px 0 8px;letter-spacing:-.03em}
.intro-copy{font-size:14px;color:var(--brand-muted);margin-bottom:23px}
.input-wrap{position:relative}
label{display:block;font-size:13px;font-weight:600;margin-bottom:10px}
textarea{display:block;width:100%;height:122px;resize:none;background:var(--brand-white);border:1px solid var(--brand-line);border-radius:18px;padding:18px 18px 30px;line-height:1.7;box-shadow:inset 0 2px 7px color-mix(in srgb,var(--brand-ink) 3%,transparent)}
textarea::placeholder{color:var(--brand-muted);opacity:.85;font-size:14px}
textarea:focus{border-color:var(--brand-action)}
.input-count{position:absolute;right:16px;bottom:11px;color:var(--brand-muted);font-size:12px;font-variant-numeric:tabular-nums}
.chips{display:flex;gap:7px;margin:14px 0 18px;flex-wrap:wrap}
.chip{border:1px solid var(--brand-line);background:var(--brand-white);border-radius:24px;padding:10px 12px;font-size:12px;min-height:40px}
.chip:hover{background:var(--brand-surface)}
.primary{width:100%;min-height:52px;border:1px solid color-mix(in srgb,var(--brand-action) 35%,white);border-radius:28px;background:linear-gradient(160deg,var(--brand-white) -20%,var(--brand-purple) 60%,var(--brand-soft));box-shadow:inset 0 2px 3px var(--brand-white),inset 0 -3px 8px color-mix(in srgb,var(--brand-action) 18%,transparent),0 7px 18px color-mix(in srgb,var(--brand-action) 13%,transparent);font-weight:650;display:flex;align-items:center;justify-content:center;gap:26px;letter-spacing:.08em;transition:transform 150ms,box-shadow 150ms}
.primary:active{transform:translateY(1px)}
.primary .arrow{font-size:22px;font-weight:400}
.privacy{font-size:12px;color:var(--brand-muted);text-align:center;margin-top:14px}
.form-error{font-size:12px;line-height:1.5;color:var(--brand-ink);margin:4px 0}
.featured{margin-top:24px;padding-top:20px;border-top:1px solid var(--brand-line)}
.featured-title{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--brand-muted);margin-bottom:10px}
.text-button{font-size:12px;color:var(--brand-action);padding:6px 0;min-height:32px}
.residents{display:flex;gap:8px}
.resident{flex:1;display:flex;align-items:center;gap:8px;text-align:left;min-width:0;border:1px solid var(--brand-line);border-radius:14px;padding:6px 8px;background:color-mix(in srgb,var(--brand-white) 60%,transparent);font-size:12px;min-height:54px}
.resident img{height:42px;width:42px;flex-shrink:0}
.resident span{line-height:1.5}
.navigation{align-self:center;justify-self:center;display:flex;align-items:center;gap:12px;padding:8px 16px;border:1px solid var(--brand-line);border-radius:30px;background:color-mix(in srgb,var(--brand-white) 86%,transparent);box-shadow:0 6px 24px color-mix(in srgb,var(--brand-action) 6%,transparent);height:64px}
.nav-tab{height:46px;min-width:88px;padding:8px 18px;display:flex;align-items:center;gap:8px;border-radius:20px;color:var(--brand-muted);font-size:13px}
.nav-tab img{height:24px;width:24px;filter:grayscale(1);opacity:.65}
.nav-tab[aria-selected=true]{color:var(--brand-ink);background:var(--brand-surface);font-weight:600}
.nav-tab[aria-selected=true] img{filter:none;opacity:1}
.nav-capture{background:linear-gradient(135deg,var(--brand-white),var(--brand-purple));border:1px solid var(--brand-line);width:46px;height:46px;border-radius:50%;font-size:27px;box-shadow:inset 0 1px 3px white;color:var(--brand-ink)}
.nav-tabs{display:contents}.nav-tab[data-tab=home]{order:0}.nav-tab[data-tab=records]{order:1}.nav-capture{order:2}.nav-tab[data-tab=discover]{order:3}.nav-tab[data-tab=profile]{order:4}
.content-screen{padding:32px 4vw;display:flex;flex-direction:column;gap:22px;max-width:1160px;margin:auto}
.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.section-heading h1{font-size:32px;margin-top:10px}
.section-heading p{font-size:14px;color:var(--brand-muted)}
.subtabs{display:flex;gap:6px;border:1px solid var(--brand-line);padding:4px;border-radius:24px}
.subtab{padding:10px 18px;border-radius:20px;font-size:13px;min-height:40px}
.subtab[aria-pressed=true]{background:var(--brand-surface);font-weight:600}
.empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;min-height:0}
.empty img{height:160px;width:160px}
.empty h2{font-size:24px;font-weight:600}
.empty p{font-size:14px;color:var(--brand-muted);max-width:440px}
.secondary{padding:12px 20px;border:1px solid var(--brand-line);background:var(--brand-white);border-radius:24px;font-size:14px;min-height:44px}
.empty .primary{max-width:240px;margin-top:4px}
.catalog{flex:1;display:flex;flex-direction:column;min-height:0;justify-content:center;gap:20px}
.catalog-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.catalog-card{text-align:left;border:1px solid var(--brand-line);border-radius:24px;padding:18px;background:var(--brand-white);display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.catalog-card img{width:100%;height:150px}
.catalog-card b{font-size:16px}.catalog-card span{font-size:12px;color:var(--brand-muted)}
.pager{display:flex;justify-content:center;align-items:center;gap:18px;color:var(--brand-muted);font-size:13px}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;margin-top:auto;margin-bottom:auto}
.setting-card{border:1px solid var(--brand-line);border-radius:26px;padding:30px;background:var(--brand-white)}
.setting-card h2{font-size:22px;margin-bottom:14px}
.setting-card p{color:var(--brand-muted);font-size:14px;margin-bottom:16px}
.setting-row{display:flex;align-items:center;justify-content:space-between;gap:24px;border-top:1px solid var(--brand-line);padding-top:18px}
.toggle{width:48px;height:28px;padding:3px;background:var(--brand-line);border-radius:20px;border:1px solid var(--brand-muted)}
.toggle::after{content:"";display:block;width:20px;height:20px;border-radius:50%;background:var(--brand-white)}
.toggle[aria-checked=true]{background:var(--brand-action)}.toggle[aria-checked=true]::after{margin-left:auto}
dialog{border:1px solid var(--brand-line);border-radius:30px;padding:30px;width:min(520px,calc(100vw - 32px));background:var(--brand-cream);color:var(--brand-ink);box-shadow:0 30px 100px color-mix(in srgb,var(--brand-ink) 20%,transparent);max-height:calc(100dvh - 40px)}
dialog::backdrop{background:color-mix(in srgb,var(--brand-ink) 26%,transparent);backdrop-filter:blur(6px)}
.dialog-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:16px}
.dialog-top span{font-size:12px;color:var(--brand-muted)}
.close{width:36px;height:36px;border:1px solid var(--brand-line);border-radius:50%;font-size:22px;background:var(--brand-white)}
.modal-body{display:flex;flex-direction:column;gap:14px}
.modal-body h2{font-size:25px;line-height:1.4}.modal-body p{font-size:14px;color:var(--brand-muted)}
.modal-body img{height:150px;margin:auto}
.modal-actions{display:flex;gap:10px;margin-top:8px}
.modal-actions>*{flex:1}
.task-step{padding:18px;border:1px solid var(--brand-line);border-radius:16px;background:var(--brand-white);font-size:15px;line-height:1.7}
.timer{font:64px/1.2 ui-monospace,SFMono-Regular,monospace;letter-spacing:-.04em;text-align:center;padding:18px}
.toast{position:fixed;left:50%;bottom:104px;transform:translateX(-50%);background:var(--brand-ink);color:var(--brand-white);padding:13px 20px;border-radius:18px;font-size:13px;z-index:1000;max-width:90vw}
/* A: a left-side orbital character composition, right-side conversation card. */
.orbit{background:radial-gradient(ellipse at 25% 60%,var(--brand-soft),transparent 55%),var(--brand-cream)}
.orbit .home{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center;max-width:1320px;margin:auto}
.orbit-space{position:relative;height:100%;min-height:0}
.orbit .welcome{position:absolute;top:6%;left:4%;z-index:4}
.orbit .welcome .wordmark{width:230px}
.orbit .tagline{margin-top:8px}
.orbit .scene{position:absolute;inset:20% 0 2% 8%;display:flex;align-items:center;justify-content:center}
.orbit .scene::before,.orbit .scene::after{content:"";position:absolute;width:85%;height:72%;border:1px solid color-mix(in srgb,var(--brand-action) 23%,transparent);border-radius:50%;transform:rotate(-24deg)}
.orbit .scene::after{width:70%;height:96%;transform:rotate(33deg);border-style:dashed;opacity:.55}
.orbit .guide{width:min(70%,380px);margin:18% 0 0 10%}
.orbit .guide-note{position:absolute;left:-3%;bottom:9%;background:color-mix(in srgb,var(--brand-white) 85%,transparent)}
.orbit-caption{position:absolute;top:8%;right:3%;font-size:12px;color:var(--brand-muted);display:flex;align-items:center;gap:7px}
.orbit-caption::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--brand-action)}
.satellite{position:absolute;z-index:4;display:flex;align-items:center;gap:6px;padding:8px 13px 8px 5px;border:1px solid var(--brand-line);border-radius:28px;background:color-mix(in srgb,var(--brand-white) 84%,transparent);box-shadow:var(--shadow);font-size:12px}
.satellite img{width:48px;height:48px}.satellite-one{left:1%;top:24%;transform:rotate(-7deg)}.satellite-two{right:0;bottom:19%;transform:rotate(6deg)}
.journey{display:flex;gap:12px;align-items:center;font-size:12px;color:var(--brand-muted)}
.journey span{display:flex;gap:7px;align-items:center}.journey i{font-style:normal;display:grid;place-items:center;width:24px;height:24px;border:1px solid var(--brand-line);border-radius:50%;background:var(--brand-white);color:var(--brand-action)}
.orbit .journey{position:absolute;bottom:2%;left:4%}
.orbit .compose{padding:32px;background:color-mix(in srgb,var(--brand-white) 80%,transparent);border:1px solid var(--brand-line);border-radius:32px;box-shadow:var(--shadow)}
.orbit .compose h2{font-size:25px}
/* B: three distinct zones: welcome, character room, working surface. */
.studio{background:var(--brand-cream)}
.studio .app{position:relative;grid-template-rows:88px minmax(0,1fr) 32px}
.studio .topbar{border-bottom:1px solid var(--brand-line);margin-bottom:8px}
.studio .top-right>span{display:none}
.studio .top-id span{max-width:145px;font-size:11px;line-height:1.6;letter-spacing:.07em}
.studio .navigation{position:absolute;top:12px;left:50%;transform:translateX(-50%);height:54px;border-radius:18px;padding:5px 7px;gap:3px;box-shadow:0 4px 16px color-mix(in srgb,var(--brand-action) 5%,transparent)}
.studio .nav-tab{min-width:73px;padding:8px 11px;height:42px;border-radius:12px;gap:6px}
.studio .nav-tab img{width:21px;height:21px}
.studio .nav-capture{order:5;width:auto;min-width:120px;height:40px;padding:0 15px;border-radius:12px;margin-left:8px;font-size:13px;font-weight:600}
.studio .nav-tab[aria-selected=true]{background:var(--brand-soft)}
.studio .home{display:grid;grid-template-columns:.72fr 1fr 1.25fr;gap:28px;align-items:center;max-width:1350px;margin:auto}
.studio .welcome{display:flex;flex-direction:column;gap:24px;align-self:stretch;justify-content:center;padding-right:6px}
.studio .welcome .wordmark{width:225px}
.studio .welcome h1{font-size:27px;line-height:1.55}
.studio .welcome .quiet-link{align-self:flex-start;font-size:13px;color:var(--brand-action)}
.studio .scene{position:relative;height:88%;max-height:600px;border-radius:180px 180px 100px 100px;background:radial-gradient(ellipse at 50% 20%,white,var(--brand-surface) 55%,var(--brand-soft));display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--brand-purple) 24%,white)}
.studio .scene::after{content:"";width:80%;height:25px;position:absolute;bottom:23%;background:var(--brand-purple);filter:blur(22px);opacity:.5;border-radius:100%}
.room-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
.studio .scene{border-radius:160px 160px 36px 36px}
.studio .scene::after{display:none}
.studio .guide{width:103%;max-width:370px;margin-top:19%}
.studio .guide-note{position:absolute;bottom:5%;max-width:90%;text-align:center;border-radius:20px;box-shadow:none;margin-top:0;background:color-mix(in srgb,var(--brand-white) 92%,transparent)}
.studio .guide-note p{font-size:13px}
.studio .journey{flex-direction:column;align-items:start;gap:10px;padding-top:8px}
.studio .compose{padding:12px 0 12px 8px}
.studio .compose h2{font-size:26px}
.studio .featured{margin-top:22px}
.studio .residents{gap:4px}.studio .resident{padding:7px 4px;border:0;background:var(--brand-surface);border-radius:13px;gap:3px}
.studio .resident img{width:39px}
/* C: a horizontal brand/character introduction over a wide writing surface. */
.quiet{background:linear-gradient(110deg,var(--brand-white),var(--brand-cream))}
.quiet .home{display:grid;grid-template-rows:minmax(160px,.85fr) minmax(300px,1.15fr);gap:8px;max-width:1100px;margin:auto}
.quiet-welcome{display:grid;grid-template-columns:210px 1fr 245px;gap:44px;align-items:center}
.quiet .wordmark{width:190px}
.quiet .quiet-intro{border-left:1px solid var(--brand-line);padding-left:40px}
.quiet .quiet-intro h1{font-family:var(--display);font-weight:500;font-size:36px;line-height:1.55;letter-spacing:.04em}
.quiet .quiet-intro p{font-size:14px;color:var(--brand-muted);margin-top:12px}
.quiet .scene{position:relative;display:flex;align-items:center;justify-content:center}
.quiet .guide{width:205px}
.quiet .guide-note{position:absolute;right:-10px;bottom:0;max-width:156px;padding:10px 14px;box-shadow:none}
.quiet .guide-note b{display:none}.quiet .guide-note p{font-size:12px}
.quiet-desk{display:grid;grid-template-columns:1fr 240px;gap:32px;border-top:1px solid var(--brand-line);padding-top:26px;align-self:start}
.quiet .compose h2{font-size:22px;margin:0 0 18px}
.quiet .eyebrow,.quiet .intro-copy{display:none}
.quiet textarea{height:120px;background:color-mix(in srgb,var(--brand-white) 70%,transparent)}
.quiet .input-actions{display:grid;grid-template-columns:1fr 180px;gap:16px;align-items:center;margin-top:10px}
.quiet .chips{margin:0;gap:5px}
.quiet .chip{padding:10px;font-size:12px}
.quiet .primary{min-height:46px}
.quiet .privacy{text-align:left;margin-top:10px}
.quiet .featured{margin:0;border:0;padding:5px 0 0}
.quiet .featured-title{display:block;line-height:1.7;margin-bottom:13px}
.quiet .featured-title .text-button{display:block}
.quiet .residents{flex-direction:column;gap:10px}
.quiet .resident{border:0;border-bottom:1px solid var(--brand-line);border-radius:0;background:transparent;padding:8px 0}
.quiet .resident img{width:48px;height:48px;margin-right:10px}
.quiet .resident span{font-size:14px}
.quiet .navigation{box-shadow:none;border-color:transparent;background:transparent;gap:20px}
.quiet .nav-tab[aria-selected=true]{background:var(--brand-surface)}
@media(max-width:1150px){
 .topbar{padding:0 30px}main{margin:0 30px}
 .studio .home{grid-template-columns:.66fr .85fr 1.3fr;gap:20px}
 .studio .welcome{gap:18px}.studio .welcome h1{font-size:23px}
 .studio .tagline{white-space:normal}.studio .guide-note{padding:12px}
 .compose h2,.studio .compose h2{font-size:23px}
 .orbit .home{gap:24px;grid-template-columns:1fr 1fr}
 .orbit .compose{padding:24px}.orbit .compose h2{font-size:22px}.orbit .welcome .wordmark{width:200px}
 .orbit .tagline{font-size:12px;white-space:normal;max-width:200px}
 .quiet-welcome{gap:26px;grid-template-columns:180px 1fr 180px}
 .quiet .quiet-intro{padding-left:28px}.quiet .quiet-intro h1{font-size:30px}
 .quiet-desk{grid-template-columns:1fr 195px;gap:24px}
 .quiet .input-actions{grid-template-columns:1fr 160px;gap:10px}.quiet .chip{padding:10px 8px}
 .catalog-card img{height:120px}
}
@media(max-height:780px) and (min-width:901px){
 .app{grid-template-rows:58px minmax(0,1fr) 76px}
 .compose h2{margin:8px 0 6px}.intro-copy{margin-bottom:16px}
 .featured{margin-top:18px;padding-top:13px}
 textarea{height:100px}.chips{margin:10px 0 14px}
 .compose .eyebrow{font-size:12px}
 .orbit .compose{padding:18px}.orbit .welcome{top:3%}
 .orbit .featured{margin-top:12px;padding-top:10px}.orbit .privacy{margin-top:10px}.orbit .chips{margin:8px 0 12px}
 .orbit .scene{inset:17% 0 2% 8%}.orbit .guide{width:62%;margin-top:15%}
 .orbit .welcome .wordmark{width:175px}.orbit .guide-note{bottom:7%;max-width:185px;padding:12px}
.studio .scene{height:94%}.studio .guide{width:100%}
.studio .app{grid-template-rows:80px minmax(0,1fr) 24px}
 .studio .welcome .wordmark{width:190px}.studio .welcome h1{font-size:24px}
.studio .welcome{gap:17px}.studio .featured{margin-top:16px}
.studio .journey{gap:6px}.studio .journey i{width:20px;height:20px}
.orbit .satellite{padding:5px 9px 5px 3px;font-size:12px}.orbit .satellite img{width:38px;height:38px}
 .quiet .home{grid-template-rows:180px 1fr;gap:0}
 .quiet .wordmark{width:165px}.quiet .guide{width:175px}
 .quiet-desk{padding-top:20px}.quiet textarea{height:98px}
 .quiet .quiet-intro h1{font-size:30px}
 .content-screen{padding:18px 2vw;gap:18px}.catalog-card img{height:120px}
}
@media(max-width:900px){
 body{overflow:auto}.app{height:auto;min-height:calc(100dvh - 34px);display:block}
 .review-bar{padding:0 12px;font-size:11px}.review-links{gap:12px}
 .review-detail{display:none}.topbar{padding:16px 20px;height:66px}.top-right span{display:none}
 main{margin:0 20px;padding-bottom:100px}.screen{height:auto}
 .orbit .home,.studio .home,.quiet .home{display:flex;flex-direction:column;gap:24px}
 .orbit-space{height:360px;width:100%;max-width:520px}.orbit .welcome{top:0;left:0}
 .orbit .welcome .wordmark{width:170px}.orbit .scene{inset:50px 0 0 15%}.orbit .guide{width:260px;margin:0}
.orbit .compose{width:100%;padding:24px}.orbit .guide-note{bottom:20px;left:-15%}
.orbit .journey{display:none}.satellite-one{top:18%}.satellite-two{bottom:34%}
 .studio .welcome{gap:12px;align-items:center;text-align:center;width:100%}
 .studio .welcome .wordmark{width:200px}.studio .welcome h1{font-size:25px}
.studio .welcome .quiet-link,.studio .welcome>p{display:none}
.studio .journey{flex-direction:row;gap:10px}
 .studio .scene{height:220px;width:100%;max-width:500px;border-radius:120px;flex-direction:row}
.studio .guide{width:190px;margin:0}.studio .guide-note{position:relative;bottom:auto;width:170px;margin-left:-20px}
 .studio .compose{padding:0;width:100%;max-width:540px}
 .quiet-welcome{grid-template-columns:1fr 1fr;gap:20px;width:100%}
 .quiet .quiet-intro{border:0;padding:0;grid-column:1/3;grid-row:2;text-align:center}
 .quiet .wordmark{width:170px}.quiet .guide{width:170px}
 .quiet .guide-note{right:0;max-width:136px;bottom:-12px}
 .quiet-desk{display:flex;flex-direction:column;width:100%;padding-top:20px;gap:24px}
 .quiet .input-actions{display:flex;flex-direction:column;align-items:stretch}
 .quiet .residents{flex-direction:row}.quiet .resident{flex-direction:column;text-align:center}
 .quiet .resident img{margin:0}.quiet .featured-title{display:flex}
 .navigation,.quiet .navigation{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:20;width:calc(100% - 24px);max-width:550px;justify-content:space-around;gap:2px;padding:6px;background:var(--brand-white);border:1px solid var(--brand-line)}
 .nav-tab{min-width:0;padding:5px 8px;flex-direction:column;gap:3px;font-size:11px;height:49px}.nav-tab img{width:23px;height:23px}
 .content-screen{padding:16px 0;min-height:calc(100dvh - 224px);gap:24px}
 .section-heading{align-items:start;flex-direction:column;gap:16px}
 .section-heading h1{font-size:27px}.catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .catalog-card{padding:14px}.catalog-card img{height:105px}
 .catalog-card b{font-size:14px}.profile-grid{grid-template-columns:1fr;gap:16px;margin:0}
 .setting-card{padding:24px}.empty{padding:20px 0;gap:18px}
 .studio .navigation{position:fixed;top:auto;bottom:12px;height:64px;border-radius:24px;gap:2px;padding:6px;width:calc(100% - 24px);max-width:550px}
 .studio .nav-tab{min-width:0;padding:5px 7px;height:48px;font-size:12px}
 .studio .nav-capture{min-width:40px;width:40px;font-size:0;padding:0;margin:0;border-radius:50%;order:2}.studio .nav-capture::before{content:'+';font-size:25px}
 .studio .topbar{border:0}.studio .top-id span{max-width:none;font-size:11px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
"""


def wordmark():
    return '<img class="wordmark" src="' + brand + '" alt="心情怪兽收容所"><p class="tagline">接纳每一种心情 · 陪伴每一个你</p>'


def character():
    return '<img class="guide" src="' + guide + '" alt="紫色收容员"><div class="guide-note"><b>紫色收容员 · 在这里</b><p>不急，我们把下一步<br>变小一点就好。</p></div>'


def featured():
    entries = ""
    for i in [8, 2, 9]:
        m = catalog[i]
        entries += '<button class="resident" data-monster="' + str(i) + '"><img src="' + m["image"] + '" alt=""><span>' + m["short"] + '</span></button>'
    return '<aside class="featured"><div class="featured-title"><span>认识心情小住客</span><button class="text-button" data-catalog>查看全部 16 只 ↗</button></div><div class="residents">' + entries + '</div></aside>'


def composer(include_featured=True):
    return """<section class="compose"><div class="eyebrow">此刻，只需要一小步</div>
<h2>今天是哪只心情怪兽跑出来了？</h2><p class="intro-copy">说说现在的你，收容员陪你理出一点头绪。</p>
<form id="mood-form" novalidate><label for="mood">此刻的心情</label><div class="input-wrap">
<textarea id="mood" maxlength="200" placeholder="比如：想开始写作品集，却总觉得还没准备好……" aria-describedby="input-hint" aria-errormessage="form-error"></textarea>
<span class="input-count" aria-hidden="true">0 / 200</span></div>
<div class="form-error" id="form-error" role="alert" hidden></div><div class="input-actions"><div class="chips">
<button class="chip" type="button">我没时间</button><button class="chip" type="button">我好焦虑</button>
<button class="chip" type="button">我又拖延了</button><button class="chip" type="button">我不想干活</button></div>
<button class="primary" type="submit">开始收容 <span class="arrow" aria-hidden="true">→</span></button></div>
<p class="privacy" id="input-hint">设计演示 · 不联网，不保存输入</p></form>""" + (featured() if include_featured else "") + "</section>"


journey = '<div class="journey" aria-label="陪伴流程"><span><i>1</i>说出状态</span><span><i>2</i>一小步行动</span><span><i>3</i>留下反馈</span></div>'
satellites = ''.join('<button class="satellite satellite-' + position + '" data-monster="'+str(index)+'"><img src="'+catalog[index]['image']+'" alt=""><span>'+catalog[index]['short']+'</span></button>' for position,index in [('one',4),('two',10)])
HOMES = {
    "orbit": '<div class="home"><div class="orbit-space"><section class="welcome">' + wordmark() + '</section><section class="scene"><span class="orbit-caption">每一种心情，都有自己的位置</span>' + satellites + character() + '</section>' + journey + '</div>' + composer() + '</div>',
    "studio": '<div class="home"><section class="welcome">' + wordmark() + '<h1>今天也不用<br>一下子变好。</h1><p>把心情放在这里。<br>我们从你做得到的<br>那一小步开始。</p>' + journey + '<button class="quiet-link" data-catalog>认识这里的 16 位小住客 ↗</button></section><section class="scene"><img class="room-art" src="' + room + '" alt="" aria-hidden="true">' + character() + '</section>' + composer() + '</div>',
    "quiet": '<div class="home"><div class="quiet-welcome"><section class="welcome">' + wordmark() + '</section><section class="quiet-intro"><h1>留一点空白，<br>给现在的自己。</h1><p>不用立刻想清楚。先从一句话开始。</p></section><section class="scene">' + character() + '</section></div><div class="quiet-desk">' + composer(False) + featured() + '</div></div>',
}

OTHER = r"""
<section class="screen content-screen" id="records" role="tabpanel" aria-labelledby="tab-records" hidden>
 <div class="section-heading"><div><div class="eyebrow">每一步，都算数</div><h1>我的收容记录</h1></div>
 <div class="subtabs" aria-label="记录视图"><button class="subtab" id="history-button" aria-pressed="true">行动记录</button><button class="subtab" id="catalog-button" aria-pressed="false">怪兽图鉴</button></div></div>
 <div class="empty" id="record-empty"><img src="__GUIDE__" alt=""><h2>第一步，留给今天的你。</h2><p>这里还没有收容记录。<br>设计预览不会读取或写入你原项目里的数据。</p><button class="primary" data-home>去说说心情 <span aria-hidden="true">→</span></button></div>
 <div class="catalog" id="catalog-panel" hidden><div class="catalog-grid" id="catalog-grid"></div><div class="pager"><button class="secondary" id="prev-page">上一页</button><span id="page-label" aria-live="polite"></span><button class="secondary" id="next-page">下一页</button></div></div>
</section>
<section class="screen content-screen" id="discover" role="tabpanel" aria-labelledby="tab-discover" hidden>
 <div class="section-heading"><div><div class="eyebrow">从小小的行动里，认识自己</div><h1>慢慢发现你的节奏</h1></div></div>
 <div class="empty"><img src="__DISCOVER__" alt=""><h2>先经历，再发现。</h2><p>完成 3 次收容后，正式产品会根据本地记录，<br>整理本周常出现的怪兽和对你有效的小行动。</p><p>当前是设计预览，还没有可展示的真实洞察。</p><button class="secondary" data-home>从此刻开始 →</button></div>
</section>
<section class="screen content-screen" id="profile" role="tabpanel" aria-labelledby="tab-profile" hidden>
 <div class="section-heading"><div><div class="eyebrow">由你决定，记住多少</div><h1>我的小空间</h1></div><p>设计演示 · 设置不写入正式项目</p></div>
 <div class="profile-grid"><section class="setting-card"><h2>本地记忆</h2><p>正式产品会先征求你的同意。完整对话只在本机保留 14 天，之后仅留下不含原话的行动摘要。</p><div class="setting-row"><span>演示记忆开关</span><button class="toggle" id="memory-toggle" role="switch" aria-label="演示本地记忆" aria-checked="false"></button></div></section>
 <section class="setting-card"><h2>这是一处轻量陪伴空间</h2><p>帮助你观察心情、迈出一小步。它不提供医疗或心理诊断，也不能替代专业帮助。</p><button class="secondary" id="privacy-details">查看预览的数据说明</button></section></div>
</section>
"""

SCRIPT = r"""
'use strict';
const monsters = __CATALOG__;
const screens = ['home', 'records', 'discover', 'profile'];
let catalogPage = 0;
let taskSeconds = 120;
let timerId = null;
let toastId = null;
const dialog = document.querySelector('dialog');
const dialogBody = document.getElementById('modal-body');
const input = document.getElementById('mood');
window.__designErrors = [];
window.addEventListener('error', e => window.__designErrors.push(e.message));
function toast(text) {
 const el=document.getElementById('toast'); el.textContent=text; el.hidden=false;
 clearTimeout(toastId); toastId=setTimeout(()=>{el.hidden=true},3000);
}
function selectTab(id, focus=false) {
 screens.forEach(name=>{
  document.getElementById(name).hidden=name!==id;
  const tab=document.getElementById('tab-'+name);
  tab.setAttribute('aria-selected',String(name===id));
  tab.tabIndex=name===id?0:-1;
 });
 if(focus) document.getElementById('tab-'+id).focus();
}
document.querySelectorAll('.nav-tab').forEach((tab,index)=>{
 tab.addEventListener('click',()=>selectTab(tab.dataset.tab));
 tab.addEventListener('keydown',e=>{
  let next;
  if(e.key==='ArrowRight') next=(index+1)%screens.length;
  if(e.key==='ArrowLeft') next=(index+screens.length-1)%screens.length;
  if(e.key==='Home') next=0;
  if(e.key==='End') next=screens.length-1;
  if(next!==undefined){e.preventDefault();selectTab(screens[next],true)}
 });
});
function goHome(){selectTab('home'); input.focus()}
document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',goHome));
function openModal(markup,label='设计预览') {
 document.getElementById('dialog-context').textContent=label;
 dialogBody.innerHTML=markup;
 if(!dialog.open) dialog.showModal();
 else (dialogBody.querySelector('button') || document.getElementById('close-modal')).focus();
}
document.getElementById('close-modal').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{clearInterval(timerId);timerId=null});
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{
 input.value=b.textContent; input.dispatchEvent(new Event('input')); input.focus();
}));
input.addEventListener('input',()=>{
 document.querySelector('.input-count').textContent=input.value.length+' / 200';
 document.getElementById('form-error').hidden=true;
 input.removeAttribute('aria-invalid');
});
document.getElementById('mood-form').addEventListener('submit',e=>{
 e.preventDefault();
 if(!input.value.trim()){
  const error=document.getElementById('form-error');error.textContent='先写下一点此刻的状态，几个字也可以。';error.hidden=false;
  input.setAttribute('aria-invalid','true');input.focus();return;
 }
 if(/自杀|自残|自伤|不想活|想死|活不下去|结束生命|伤害自己/.test(input.value)){
  openModal('<h2 id="modal-title">先照顾好此刻的安全</h2><p>听起来你正在承受很大的痛苦。请先联系身边可信任的人，让对方陪着你。</p><p>如果你可能马上伤害自己，请联系当地紧急服务，或请身边的人协助寻求专业帮助。</p><p>这里暂时停止怪兽和行动演示。</p>','安全提醒');return;
 }
 taskSeconds=120;showTask();
});
function showTask() {
 openModal('<h2 id="modal-title">先留下一个不完美的标题</h2><p>固定示例 · 写作品集 · '+(taskSeconds===30?'30 秒':'2 分钟')+'</p><div class="task-step"><strong>第一步</strong><br>打开文档，只写一个标题。</div><p>完成标准：文档里留下了一个看得见的标题。</p><p>这张卡只演示布局与计时，不分析你的输入，也不会保存为真实记录。</p><button class="primary" id="start-timer">开始示例计时 →</button><div class="modal-actions"><button class="secondary" id="smaller">再小一点</button><button class="secondary" id="exit-task">先不开始</button></div>','行动样式预览 · 非 AI 结果');
 document.getElementById('start-timer').onclick=startTimer;
 document.getElementById('smaller').onclick=()=>{taskSeconds=30;showTask()};
 document.getElementById('exit-task').onclick=()=>dialog.close();
}
function startTimer() {
 const end=Date.now()+taskSeconds*1000;
 dialogBody.innerHTML='<h2 id="modal-title">现在，只做这一小步。</h2><p>示例任务：打开文档，写下标题。</p><div class="timer" id="timer-clock" role="timer"></div><p>时间由浏览器真实计时。关闭弹窗将结束本次演示。</p><button class="primary" id="finish-timer">我做完了 →</button>';
 const tick=()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));document.getElementById('timer-clock').textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');if(left===0){clearInterval(timerId);showFinished()}};
 clearInterval(timerId);tick();timerId=setInterval(tick,1000);
 document.getElementById('finish-timer').onclick=()=>{clearInterval(timerId);showFinished()};
 document.getElementById('finish-timer').focus();
}
function showFinished(){
 dialogBody.innerHTML='<h2 id="modal-title">一点点，也算往前。</h2><p>你已看完这次行动样式演示。正式版本会在你确认完成标准后，按授权记录这一步。</p><div class="task-step">本次为设计示例，未产生真实收容记录。</div><button class="primary" id="done">回到我的小空间 →</button>';
 document.getElementById('done').onclick=()=>dialog.close();document.getElementById('done').focus();
}
function showMonster(index) {
 const m=monsters[index];
 openModal('<img src="'+m.image+'" alt=""><h2 id="modal-title">'+m.name+'</h2><p>'+m.type+' ·「'+m.line+'」</p><div class="task-step">'+m.why+'</div><p><strong>可以试试</strong><br>'+m.action+'</p>','固定怪兽图鉴 · 非个人分析');
}
document.querySelectorAll('[data-monster]').forEach(b=>b.addEventListener('click',()=>showMonster(Number(b.dataset.monster))));
function renderCatalog(){
 const grid=document.getElementById('catalog-grid');grid.replaceChildren();
 monsters.slice(catalogPage*4,catalogPage*4+4).forEach((m,i)=>{
  const b=document.createElement('button');b.className='catalog-card';
  b.innerHTML='<img src="'+m.image+'" alt=""><b>'+m.name+'</b><span>'+m.type+' · 查看档案 ↗</span>';
  b.onclick=()=>showMonster(catalogPage*4+i);grid.appendChild(b);
 });
 document.getElementById('page-label').textContent='第 '+(catalogPage+1)+' / 4 页 · 共 16 只';
 document.getElementById('prev-page').disabled=catalogPage===0;
 document.getElementById('next-page').disabled=catalogPage===3;
}
function showCatalog(show=true){
 document.getElementById('record-empty').hidden=show;
 document.getElementById('catalog-panel').hidden=!show;
 document.getElementById('history-button').setAttribute('aria-pressed',String(!show));
 document.getElementById('catalog-button').setAttribute('aria-pressed',String(show));
 if(show)renderCatalog();
}
document.getElementById('catalog-button').onclick=()=>showCatalog();
document.getElementById('history-button').onclick=()=>showCatalog(false);
document.getElementById('prev-page').onclick=()=>{catalogPage--;renderCatalog()};
document.getElementById('next-page').onclick=()=>{catalogPage++;renderCatalog()};
document.querySelectorAll('[data-catalog]').forEach(b=>b.addEventListener('click',()=>{selectTab('records');showCatalog()}));
document.getElementById('memory-toggle').onclick=e=>{
 const b=e.currentTarget;const next=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(next));
 toast(next?'演示已开启；未更改正式项目设置。':'演示已关闭；未更改正式项目设置。');
};
document.getElementById('privacy-details').onclick=()=>openModal('<h2 id="modal-title">只看设计，不留下数据。</h2><p>本页不调用网络或模型，不读取其他页面的记录，也不会把输入写入本地存储。</p><p>关闭或刷新页面后，演示中的输入、开关和计时状态都会消失。</p>','预览数据说明');
document.getElementById('about-preview').onclick=()=>openModal('<h2 id="modal-title">先感受，再选定。</h2><p>这是一份单屏设计初稿。你可以切换 Tab、浏览 16 只怪兽、填写状态并查看明确标注的行动样式示例。</p><p>这还不是正式 Web 交付。选定方向后，现有 Taro 项目的真实规则流程、记录和分享会按该方向实现并重新验收。</p>','设计方向 · 待你选择');
selectTab('home');
"""

studies = [
    ("orbit", "A · 心情轨道", "a-orbit.html"),
    ("studio", "B · 陪伴工作室", "b-studio.html"),
    ("quiet", "C · 一页留白", "c-quiet.html"),
]
for variant, label, filename in studies:
    links = "".join('<a href="'+f+'"'+(' aria-current="page"' if v==variant else '')+'>'+l+'</a>' for v,l,f in studies)
    nav = ""
    for i,(key,name,icon) in enumerate([("home","首页","home"),("records","记录","records"),("discover","发现","discover"),("profile","我的","profile")]):
        if variant=="studio" and key=="home": name="收容室"
        nav += '<button class="nav-tab" id="tab-'+key+'" role="tab" aria-controls="'+key+'" aria-selected="false" data-tab="'+key+'"><img src="'+icons[icon]+'" alt=""><span>'+name+'</span></button>'
    nav='<div class="nav-tabs" role="tablist" aria-label="页面切换">'+nav+'</div><button class="nav-capture" data-home aria-label="收容新的心情">'+('＋ 说说心情' if variant=='studio' else '+')+'</button>'
    page = """<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>__LABEL__ · 心情怪兽设计初稿</title><style>__CSS__</style></head>
<!-- Assumptions: direction study, not the production app. Existing assets are embedded unchanged.
Reasoning: single-screen desktop layout; secondary content uses tabs, pagination and dialogs.
Placeholders: no fabricated user records; action card is explicitly a fixed design example.
Brand context: ../brand-spec.md. Requirements: design-brief.md. -->
<body class="__VARIANT__"><div class="review-bar"><span>设计初稿 <span class="review-detail">· 非正式产品 · 不联网、不保存</span></span><nav class="review-links" aria-label="设计方向">__LINKS__</nav></div>
<div class="app"><header class="topbar"><div class="top-id"><img class="brand-seal" src="__GUIDE__" alt=""><span>MOOD MONSTER SHELTER</span></div><div class="top-right"><span><i class="status-dot"></i>一个可以慢一点的地方</span><button class="quiet-link" id="about-preview">关于这个预览 ↗</button></div></header>
<main><section class="screen" id="home" role="tabpanel" aria-labelledby="tab-home">__HOME__</section>__OTHER__</main>
<nav class="navigation" aria-label="主要导航">__NAV__</nav></div>
<dialog aria-labelledby="modal-title"><div class="dialog-top"><span id="dialog-context"></span><button class="close" id="close-modal" aria-label="关闭弹窗">×</button></div><div class="modal-body" id="modal-body"></div></dialog>
<div id="toast" class="toast" role="status" hidden></div><script>__SCRIPT__</script></body></html>"""
    replacements={"__LABEL__":label,"__VARIANT__":variant,"__CSS__":CSS,"__LINKS__":links,"__HOME__":HOMES[variant],"__OTHER__":OTHER.replace("__GUIDE__",guide).replace("__DISCOVER__",catalog[4]["image"]),"__GUIDE__":guide,"__NAV__":nav,"__SCRIPT__":SCRIPT.replace("__CATALOG__",json.dumps(catalog,ensure_ascii=False))}
    for token,value in replacements.items(): page=page.replace(token,value)
    (OUT/filename).write_text(page)
    print(filename, len(page.encode()), "bytes", "sha256", hashlib.sha256(page.encode()).hexdigest())
