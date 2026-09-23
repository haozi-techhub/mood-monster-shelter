// Run only through ego-browser nodejs. These are DESIGN STUDY checks, not Taro release tests.
await useOrCreateTaskSpace(2)
const fs = await import('node:fs/promises')
const root = '/Users/haozi/Desktop/mood-monster-shelter/design-demos/'
const layout = [], interactions = []
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const inspect = async (label) => {
  const state = await js(String.raw`(() => ({
    dialog:document.querySelector('dialog').open,
    title:document.getElementById('modal-title')?.textContent,
    text:document.getElementById('modal-body').innerText,
    active:document.activeElement?.id,
    tab:document.querySelector('.nav-tab[aria-selected=true]').dataset.tab,
    errors:window.__designErrors
  }))()`)
  interactions.push({label,...state})
  return state
}
const key = async (key, code, n) => {
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:n})
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n})
}
for (const file of ['a-orbit.html','b-studio.html','c-quiet.html']) {
  const url = 'http://127.0.0.1:10087/'+file
  await openOrReuseTab(url,{wait:true,timeout:20})
  await gotoAndWait(url,{timeout:20})
  for (const [width,height] of [[1440,900],[1280,720],[1024,768]]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
    for (const panel of ['home','records','discover','profile','catalog']) {
      await js(`(() => {selectTab('${panel==='catalog'?'records':panel}');showCatalog(${panel==='catalog'});})()`)
      await js('Promise.all([...document.images].map(i => i.decode().catch(() => null)))')
      const report = await js(String.raw`(() => {
        const content=document.querySelector('main').getBoundingClientRect();
        const visible=[...document.querySelectorAll('main h1,main h2,main p,main button,main textarea,main label,main .wordmark,main .guide')].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().width>0);
        return {
          size:[innerWidth,innerHeight],page:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],
          outside:visible.filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1 || r.top<content.top-1 || r.bottom>content.bottom+1}).map(e=>({tag:e.tagName,label:(e.innerText||e.alt||e.id).slice(0,45)})),
          brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,errors:window.__designErrors
        };
      })()`)
      layout.push({file,panel,...report})
      assert(!report.outside.length&&!report.brokenImages&&!report.errors.length,JSON.stringify(layout.at(-1)))
    }
  }
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
  await click('#tab-home')
  await click('#mood-form button[type=submit]')
  assert(await js("document.getElementById('mood').getAttribute('aria-invalid')==='true'"),file+' empty input')
  await click('.chip')
  assert(await js("document.getElementById('mood').value==='我没时间'"),file+' chip input')
  await click('#mood-form button[type=submit]')
  assert((await inspect(file+' fixed task')).text.includes('固定示例'),file+' honest task label')
  await click('#smaller')
  assert((await inspect(file+' smaller')).text.includes('30 秒'),file+' downgrade')
  await click('#start-timer')
  const initial=await js("document.getElementById('timer-clock').textContent")
  await new Promise(r=>setTimeout(r,1200))
  const ticked=await js("document.getElementById('timer-clock').textContent")
  assert(initial!==ticked,file+' real timer tick')
  interactions.push({label:file+' timer',initial,ticked})
  await click('#finish-timer')
  assert((await inspect(file+' finish')).text.includes('未产生真实收容记录'),file+' explicit demo completion')
  await click('#done')
  assert(!(await inspect(file+' close')).dialog,file+' close')
  await click('#tab-records')
  await click('#catalog-button')
  const names=[]
  for(let page=0;page<4;page++) {
    names.push(...await js("[...document.querySelectorAll('.catalog-card b')].map(e=>e.textContent)"))
    if(page<3) await click('#next-page')
  }
  assert(new Set(names).size===16,file+' fixed 16 monsters')
  assert(await js("document.getElementById('next-page').disabled"),file+' final page bound')
  await click('.catalog-card')
  assert((await inspect(file+' monster detail')).dialog,file+' detail')
  await key('Escape','Escape',27)
  assert(!(await inspect(file+' escape close')).dialog,file+' Escape')
  assert(await js("document.activeElement.classList.contains('catalog-card')"),file+' focus return')
  await click('#tab-discover')
  assert((await inspect(file+' discover')).tab==='discover',file+' discover tab')
  await click('#tab-profile')
  await click('#memory-toggle')
  assert(await js("document.getElementById('memory-toggle').getAttribute('aria-checked')==='true'"),file+' memory toggle')
  await click('#privacy-details')
  assert((await inspect(file+' privacy')).dialog,file+' privacy')
  await key('Escape','Escape',27)
  await click('#tab-home')
  await key('ArrowRight','ArrowRight',39)
  assert((await inspect(file+' keyboard tab')).tab==='records',file+' keyboard tab')
  await click('.nav-capture')
  await fillInput('#mood','我不想活了')
  await click('#mood-form button[type=submit]')
  const safety=await inspect(file+' safety')
  assert(safety.title==='先照顾好此刻的安全'&&!safety.text.includes('固定示例'),file+' safety override')
  await key('Escape','Escape',27)
  await fillInput('#mood','')
  await gotoAndWait(url,{timeout:20})
  await js('Promise.all([...document.images].map(i => i.decode().catch(() => null)))')
  const shot=await cdp('Page.captureScreenshot',{format:'jpeg',quality:85,captureBeyondViewport:false})
  await fs.writeFile(root+'screenshots/'+file.replace('.html','-1440.jpg'),Buffer.from(shot.data,'base64'))
  cliLog({file,layout:'15/15 passed',interaction:'passed',timer:[initial,ticked]})
  await cdp('Emulation.clearDeviceMetricsOverride')
}
await fs.writeFile(root+'layout-results.json',JSON.stringify(layout,null,2))
await fs.writeFile(root+'interaction-results.json',JSON.stringify(interactions,null,2))
cliLog({passed:true,layouts:layout.length,interactionStates:interactions.length})
