/* ════════════ SAFE UI HELPERS ════════════ */
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function safeUrl(v){v=String(v||'').trim();return /^\/mosque\/uploads\//.test(v)||/^https:\/\/mnassat\.com\/mosque\/uploads\//.test(v)?v:'';}
function fileIconByName(name){var n=String(name||'').toLowerCase();return /\.(jpg|jpeg|png|gif|webp)$/.test(n)?'🖼':'📄';}
function parseMaybeJson(v){if(typeof v==='string'){try{return JSON.parse(v);}catch(e){return v;}}return v;}
function renderFileValue(v){
  v=parseMaybeJson(v);
  if(Array.isArray(v)) return v.map(renderFileValue).join('');
  if(v&&typeof v==='object'){
    var url=safeUrl(v.url||v.path||'');var name=esc(v.name||'مرفق');var size=v.size?'<span style="color:#6b7280;font-size:11px;"> · '+esc(v.size)+'</span>':'';
    if(url) return '<a href="'+esc(url)+'" target="_blank" rel="noopener" class="entry-file-link">'+fileIconByName(name)+' '+name+size+'</a>';
    return '<span class="entry-file-missing">'+fileIconByName(name)+' '+name+'</span>';
  }
  var s=String(v==null?'':v);
  var url=safeUrl(s);
  if(url) return '<a href="'+esc(url)+'" target="_blank" rel="noopener" class="entry-file-link">📎 '+esc(s.split('/').pop())+'</a>';
  return esc(s);
}
function renderEntryValue(v){
  var parsed=parseMaybeJson(v);
  if(parsed&&typeof parsed==='object') return renderFileValue(parsed);
  return esc(v);
}
function uploadEntryFile(file){
  var fd=new FormData();fd.append('file',file);fd.append('scope','entry');
  return fetch('/mosque/api/upload_file.php',{method:'POST',body:fd}).then(function(r){return r.json();}).then(function(res){
    if(res&&res.success&&res.url){return {name:file.name,size:(file.size/1024/1024).toFixed(1)+' MB',url:res.url,mime:res.mime||''};}
    throw new Error(res&&res.error||'upload failed');
  });
}
function newsDateValue(n){
  var s=String((n&&n.date)||'');var months={'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'ابريل':4,'مايو':5,'يونيو':6,'يوليو':7,'أغسطس':8,'اغسطس':8,'سبتمبر':9,'أكتوبر':10,'اكتوبر':10,'نوفمبر':11,'ديسمبر':12};
  var m=s.match(/(\d{1,2})\s+([^\s]+)\s+(\d{4})/);if(m){return new Date(parseInt(m[3],10), (months[m[2]]||1)-1, parseInt(m[1],10)).getTime();}
  var d=Date.parse(s);return isNaN(d)?0:d;
}
function sortedNewsItems(){return (S.news||[]).map(function(n,i){return {n:n,idx:i,t:newsDateValue(n)};}).sort(function(a,b){return (b.t-a.t)||(b.idx-a.idx);});}

/* ════════════ RENDER ════════════ */
function renderAll(){
  renderNav(); renderHeroStats(); renderHeroCard();
  renderAchiev(); renderStats(); renderProjects();
  renderPartners(); renderNews(); renderEvents();
  renderTestimonials(); renderSurveyList();
  renderSurveyResults(); renderAnalysis(); renderBoard();
  renderFooter();
}

function renderNav(){
  const el=document.getElementById('p-nav-links');if(!el)return;
  el.innerHTML=S.nav.items.map(item=>{
    if(item.hasDrop&&item.dropItems.length){
      return`<div class="nav-link has-dd" style="position:relative;display:inline-flex;align-items:center;gap:4px;">
        ${item.label} <span style="font-size:10px;opacity:.7;">▾</span>
        <div class="dropdown">
          ${item.dropItems.map(di=>`<div class="dd-item" onclick="event.stopPropagation();${di.svTab?`showSvTab('${di.svTab}',null);scrollSec('surveys-sec')`:di.page?`showPage('${di.page}')`:''};toast('${di.label}')">
            <span class="dd-icon">${di.icon}</span>${di.label}
            <span class="dd-badge">${{text:'نص',image:'صورة',pdf:'PDF',pdfgroup:'مج.PDF'}[di.type]||''}</span>
          </div>`).join('')}
        </div>
      </div>`;
    } else {
      return`<button class="nav-link" onclick="scrollSec('${item.url}')">${item.label}</button>`;
    }
  }).join('')+
  `<a class="nav-link nav-don" href="${S.nav.donUrl||'#'}" ${S.nav.donUrl&&S.nav.donUrl!=='#'?'target="_blank"':''} style="text-decoration:none;">${S.nav.donBtn}</a>`;
  document.getElementById('p-org-name').textContent=S.nav.orgName;
  document.getElementById('p-org-sub').textContent=S.nav.orgSub;
}

function renderHeroStats(){
  const h=document.getElementById('p-hero-stats');if(!h)return;
  const stats=[{v:'1,240',l:'مسجد تمت خدمته'},{v:'18,500+',l:'متبرع كريم'},{v:'340',l:'مشروع مكتمل'},{v:'15',l:'منطقة مغطاة'}];
  h.innerHTML=stats.map(s=>`<div class="hero-stat"><div class="hero-stat-val" style="position:relative;z-index:1;">${s.v}</div><div class="hero-stat-sep"></div><div class="hero-stat-lbl" style="position:relative;z-index:1;">${s.l}</div></div>`).join('');
}
function renderHeroCard(){
  const h=document.getElementById('p-hero-card-prj');if(!h)return;
  h.innerHTML=S.projects.map(p=>`<div class="prog-item"><div class="prog-meta"><span class="prog-name">${p.name}</span><span class="prog-pct">${p.pct}%</span></div><div class="prog-bar"><div class="prog-fill" style="width:${p.pct}%"></div></div></div>`).join('');
}
function renderAchiev(){
  const g=document.getElementById('p-achiev-grid');if(!g)return;
  g.innerHTML=S.achiev.map(a=>`<div class="achiev-item"><div class="achiev-icon">${a.icon}</div><div class="achiev-val">${a.val}</div><div class="achiev-lbl">${a.label}</div><div class="achiev-unit">${a.unit}</div></div>`).join('');
}
function renderStats(){
  const el=document.getElementById('p-stats-inner');if(!el)return;
  el.innerHTML=S.stats.map(s=>`<div class="stat-item"><div class="stat-val" style="color:var(--P)">${s.val}</div><div class="stat-lbl">${s.label}</div></div>`).join('');
}
function renderProjects(){
  const g=document.getElementById('p-prj-grid');if(!g)return;
  g.innerHTML=S.projects.map(p=>{
    /* حساب النسبة تلقائياً من الهدف والمجمّع */
    const goal = parseFloat(p.goal)||0;
    const cur  = parseFloat(p.cur)||0;
    const pct  = goal>0 ? Math.min(100, Math.round(cur/goal*100)) : (parseInt(p.pct)||0);
    return`<div class="proj-card">
    <div class="proj-img" style="background:${p.bg}">${p.icon}</div>
    <div class="proj-body">
      <div class="proj-title">${p.name}</div>
      <div class="proj-desc">${p.desc}</div>
      <div class="proj-bar-wrap">
        <div class="proj-bar-track"><div class="proj-bar-fill" style="width:${pct}%"></div></div>
        <div class="proj-bar-meta"><span>الإنجاز</span><span style="color:var(--P);font-weight:700">${pct}%</span></div>
      </div>
      ${goal>0?`<div class="proj-amounts">
        <span>المُجمَّع: <span class="proj-amt" dir="ltr">${cur.toLocaleString('ar-SA')}</span> ريال</span>
        <span>الهدف: <span class="proj-amt" dir="ltr">${goal.toLocaleString('ar-SA')}</span> ريال</span>
      </div>`:''}
      ${p.url?`<a href="${p.url}" target="_blank" class="proj-link-btn">🔗 انتقل للمشروع</a>`:''}
    </div>
  </div>`;}).join('');
}
function renderPartners(){
  const g=document.getElementById('p-par-grid');if(!g)return;
  const h=getComputedStyle(document.documentElement).getPropertyValue('--partner-logo-h').trim()||'40px';
  g.innerHTML=S.partners.map(p=>`<div class="partner-item">
    ${p.img?`<img src="${p.img}" style="height:${h};max-width:110px;object-fit:contain;border-radius:4px;" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">`:''}
    <div class="partner-icon" ${p.img?'style="display:none"':''}>${p.icon}</div>
    <div class="partner-name" style="color:${p.color}">${p.name}</div>
  </div>`).join('');
}
function renderNews(){
  const g=document.getElementById('p-nws-grid');if(!g)return;
  /* عرض أحدث 4 أخبار في الصفحة الرئيسية */
  const displayed = sortedNewsItems().slice(0,4);
  g.innerHTML = displayed.map(item => newsCardHTML(item.n,item.idx)).join('');
}

function newsCardHTML(n, idx){
  const catObj = newsCats.find(c=>c.label===n.cat)||{icon:'📌'};
  const icon = n.catIcon||catObj.icon||'📌';
  return `<div class="news-card-v2" onclick="openNewsDetail(${idx})">
    <div class="news-img-v2" style="background:${n.bg}">
      ${n.imgUrl ? `<img src="${n.imgUrl}" alt="${n.title}" onerror="this.style.display='none'">` : `<div class="news-img-placeholder">${icon}</div>`}
    </div>
    <div class="news-body-v2">
      <div class="news-cat-wrap"><span class="news-cat-tag" style="background:${n.cBg||'#c9a227'};color:${n.cTx||'#0f3d26'};">${icon} ${n.cat}</span></div>
      <div class="news-date-v2">📅 ${n.date}</div>
      <div class="news-title-v2">${n.title}</div>
      <div class="news-excerpt-v2">${n.excerpt||''}</div>
      <button class="news-more-btn" onclick="event.stopPropagation();openNewsDetail(${idx})">عرض المزيد ←</button>
        <button onclick="event.stopPropagation();copyNewsLink(${idx})" style="padding:5px 10px;background:transparent;border:1px solid var(--BD);border-radius:6px;font-size:11px;cursor:pointer;color:var(--TXM);font-family:inherit;">🔗 مشاركة</button>
    </div>
  </div>`;
}

function openAllNews(){
  const page = document.getElementById('all-news-page');
  const grid = document.getElementById('all-news-grid');
  if(!page||!grid) return;
  grid.innerHTML = sortedNewsItems().map(item => newsCardHTML(item.n,item.idx)).join('');
  page.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAllNews(){
  document.getElementById('all-news-page').classList.remove('open');
  document.body.style.overflow='';
}

function openNewsDetail(idx){
  const n = S.news[idx];
  if(!n) return;
  /* تحديث URL للمشاركة */
  history.pushState({newsIdx:idx},'','#news-'+idx);
  const catObj = newsCats.find(c=>c.label===n.cat)||{icon:'📌'};
  const icon = n.catIcon||catObj.icon||'📌';
  const inner = document.getElementById('news-detail-inner');
  const page  = document.getElementById('news-detail-page');
  if(!inner||!page) return;

  inner.innerHTML = `
    ${n.imgUrl ? `<img src="${n.imgUrl}" class="news-detail-hero" alt="${n.title}" onerror="this.style.display='none'">` : ''}
    <div>
      <span class="news-detail-cat" style="background:${n.cBg||'#c9a227'};color:${n.cTx||'#0f3d26'}">${icon} ${n.cat}</span>
    </div>
    <div class="news-detail-title">${n.title}</div>
    <div class="news-detail-date">📅 ${n.date}</div>
    <div class="news-detail-body">${n.content||n.excerpt||''}</div>
    ${(n.images&&n.images.length) ? `<div class="news-detail-gallery">${n.images.map(img=>`<img src="${img}" alt="صورة">`).join('')}</div>` : ''}
  `;
  page.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeNewsDetail(){
  history.pushState({},'',window.location.pathname+window.location.search);
  document.getElementById('news-detail-page').classList.remove('open');
  document.body.style.overflow='';
}
function renderEvents(){
  const g=document.getElementById('p-evn-list');if(!g)return;
  g.innerHTML=S.events.map(e=>`<div class="event-item">
    <div class="event-date"><div class="event-day">${e.day}</div><div class="event-month">${e.month}</div></div>
    <div class="event-body">
      <span class="event-status ${e.status==='live'?'st-live':'st-upcoming'}">${e.status==='live'?'🟢 جارٍ الآن':'🔵 قادم'}</span>
      <div class="event-title">${e.title}</div>
      <div class="event-meta">📍 ${e.meta}</div>
    </div>
  </div>`).join('');
}
var _tstIdx=0, _tstTimer=null;

function renderTestimonials(){
  var g=document.getElementById('p-tst-track');
  var dotsEl=document.getElementById('p-tst-dots');
  if(!g||!S.testimonials||!S.testimonials.length) return;
  _tstIdx=0;

  /* بناء الشرائح كـ display:none/block */
  var h='';
  for(var i=0;i<S.testimonials.length;i++){
    var t=S.testimonials[i];
    h+='<div class="tst-slide'+(i===0?' on':'')+'">'
     +'<div class="tst-quote-mark">“</div>'
     +'<div class="tst-quote-text">'+(t.quote||'')+'</div>'
     +'<div class="tst-author-row">'
     +'<div class="tst-av" style="background:'+(t.color||'#1a5c3a')+'">'+(t.initials||'')+'</div>'
     +'<div><div class="tst-name">'+(t.name||'')+'</div>'
     +'<div class="tst-role">'+(t.role||'')+'</div></div>'
     +'</div></div>';
  }
  g.innerHTML=h;

  /* نقاط التنقل */
  if(dotsEl){
    var dh='';
    for(var j=0;j<S.testimonials.length;j++)
      dh+='<button class="tst-dot'+(j===0?' on':'')+'" onclick="tstGoTo('+j+')"></button>';
    dotsEl.innerHTML=dh;
  }

  tstStartAuto();
}

function tstGoTo(idx){
  var total=S.testimonials?S.testimonials.length:0;
  if(!total) return;
  _tstIdx=(idx+total)%total;
  /* إخفاء الكل — إظهار الحالي */
  var slides=document.querySelectorAll('#p-tst-track .tst-slide');
  for(var i=0;i<slides.length;i++)
    slides[i].className='tst-slide'+(i===_tstIdx?' on':'');
  var dots=document.querySelectorAll('#p-tst-dots .tst-dot');
  for(var j=0;j<dots.length;j++)
    dots[j].className='tst-dot'+(j===_tstIdx?' on':'');
}

function tstSlide(dir){
  tstGoTo(_tstIdx+dir);
  tstStartAuto();
}

function tstStartAuto(){
  if(_tstTimer) clearInterval(_tstTimer);
  var spd=(parseInt(S.scrollSpeed)||5)*1000;
  _tstTimer=setInterval(function(){ tstGoTo(_tstIdx+1); },spd);
}
function renderSurveyList(){
  const g=document.getElementById('sv-tab-list');if(!g)return;
  g.innerHTML=`<div class="survey-list-wrap">${S.surveys.map(s=>`<div class="survey-card-pub" onclick="openSurvey('${s.id}')">
    <div class="sv-icon-wrap" style="background:${s.iconBg}">${s.icon}</div>
    <div class="sv-body">
      <div class="sv-title">${s.title}</div>
      <div class="sv-desc">${s.desc}</div>
      <div class="sv-meta">
        <span><span class="sv-status ${(s.status==='open'||s.status==='active')?'st-open':'st-closed'}">${(s.status==='open'||s.status==='active')?'نشط':'مغلق'}</span></span>
        <span>👥 ${(s.responses||0).toLocaleString('ar')} مشارك</span>
        <span>📝 ${(s.questions||[]).length} أسئلة</span>
        <span>🏷 ${s.cat}</span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.06);" onclick="event.stopPropagation()">
      <button onclick="event.stopPropagation();var url=location.origin+'/mosque/?survey='+encodeURIComponent('${s.id}');navigator.clipboard.writeText(url).then(function(){toast('تم نسخ رابط الاستطلاع ✓');}).catch(function(){toast('الرابط: '+url);});" style="background:transparent;border:1px solid #c9a227;color:#7a5500;border-radius:6px;padding:4px 10px;font-size:10px;cursor:pointer;font-family:Tajawal,sans-serif;">🔗 نسخ الرابط</button>
      <div class="sv-arrow">${s.status==='open'?'←':'🔒'}</div>
    </div>
  </div>`).join('')}</div>`;
}

/* ════════════ SURVEY MODAL ════════════ */
function openSurvey(id){
  window._currentSurveyId=id;
  const s=(S.surveys||[]).find(x=>String(x.id)===String(id));if(!s)return;
  if(s.status==='closed'){toast('هذا الاستطلاع مغلق حالياً');return;}
  document.getElementById('m-tag').textContent=s.cat||'';
  document.getElementById('m-title').textContent=s.title||'';
  document.getElementById('m-desc').textContent=(s.desc||'')+' · '+((s.questions||[]).length)+' أسئلة';
  document.getElementById('m-body').innerHTML=
    (s.questions||[]).map((q,i)=>`<div class="q-block">
      <div class="q-lbl">سؤال ${i+1}${q.required?' <span class="q-req">*</span>':''}</div>
      <div class="q-txt">${esc(q.text)}</div>
      ${renderQInput(q)}
    </div>`).join('')+
    `<button class="submit-btn" onclick="submitSurvey()">إرسال الاستطلاع ✓</button>`;
  document.getElementById('modal-ov').classList.add('open');
  document.body.style.overflow='hidden';
}
function renderQInput(q){
  var opts=q.opts||[];
  if(q.type==='likert'||q.type==='radio'||q.type==='choice'){
    var cls=q.type==='likert'?'lik-opt':'rad-opt';
    var row=q.type==='likert'?'lik-row':'rad-row';
    return'<div class="'+row+'">'+opts.map(function(o){return'<div class="'+cls+'" onclick="selOpt(this,\''+q.type+'\')">'+esc(o)+'</div>';}).join('')+'</div>';
  }
  if(q.type==='checkbox'){return'<div class="chk-row">'+opts.map(function(o){return'<label class="chk-opt"><input type="checkbox" class="chk-inp" value="'+esc(o)+'" style="margin-left:6px;accent-color:var(--P);width:16px;height:16px;">'+esc(o)+'</label>';}).join('')+'</div>';}
  if(q.type==='dropdown'){return'<select class="q-select"><option>اختر...</option>'+opts.map(function(o){return'<option>'+esc(o)+'</option>';}).join('')+'</select>';}
  if(q.type==='text'){return'<textarea class="q-textarea" placeholder="اكتب إجابتك هنا..."></textarea>';}
  if(q.type==='file'){return'<div class="file-upload-area" style="border:2px dashed var(--A);border-radius:10px;padding:20px;text-align:center;background:#fffef8;position:relative;overflow:hidden;"><input type="file" accept=".pdf,image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;" onchange="this.parentElement.querySelector(\'.file-name\').textContent=this.files.length?this.files[0].name:\'لم يتم اختيار ملف\'"><div style="font-size:24px;margin-bottom:6px;">📎</div><div class="file-name" style="font-size:12px;color:var(--TXM);">اضغط لاختيار مرفق PDF أو صورة</div></div>';}
  return '';
}
function selOpt(el,t){el.parentElement.querySelectorAll('.lik-opt,.rad-opt').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');}
async function submitSurvey(){
  var svId=window._currentSurveyId||'';
  var svObj=(S.surveys||[]).find(function(x){return String(x.id)===String(svId);})||{};
  var svTitle=svObj.title||'استطلاع';
  var answers={};
  var missing=[];
  var qBlocks=document.querySelectorAll('#m-body .q-block');
  qBlocks.forEach(function(block){block.classList.remove('q-error');var old=block.querySelector('.q-error-msg');if(old)old.remove();});
  var submitBtn=document.querySelector('#m-body .submit-btn');
  if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='جارٍ الإرسال...';}
  try{
    for(var idx=0;idx<qBlocks.length;idx++){
      var block=qBlocks[idx];
      var q=svObj.questions&&svObj.questions[idx];
      var qText=q?q.text:('سؤال '+(idx+1));
      var qType=q?q.type:'text';
      var ans='';
      if(qType==='text'){var ta=block.querySelector('.q-textarea');if(ta)ans=ta.value;}
      else if(qType==='radio'||qType==='likert'){var s1=block.querySelector('.rad-opt.sel,.lik-opt.sel');if(s1)ans=s1.textContent;}
      else if(qType==='checkbox'){var checked=block.querySelectorAll('.chk-inp:checked');ans=Array.from(checked).map(function(c){return c.value;}).join(' | ');}
      else if(qType==='dropdown'){var s2=block.querySelector('.q-select');if(s2&&s2.value!=='اختر...')ans=s2.value;}
      else if(qType==='file'){
        var fi=block.querySelector('input[type=file]');
        if(fi&&fi.files.length) ans=await uploadEntryFile(fi.files[0]);
      }
      var isEmpty = (ans==='' || ans==null || (typeof ans==='string' && ans.trim()===''));
      if(q && q.required && isEmpty){
        missing.push(block);
      } else {
        answers[qText]=ans;
      }
    }
    if(missing.length){
      missing.forEach(function(block){
        block.classList.add('q-error');
        var msg=document.createElement('div');msg.className='q-error-msg';msg.textContent='هذا السؤال إلزامي';block.appendChild(msg);
      });
      toast('نأمل إكمال الاستبيان');
      var first=missing[0]; if(first&&first.scrollIntoView) first.scrollIntoView({behavior:'smooth',block:'center'});
      if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='إرسال الاستطلاع ✓';}
      return;
    }
    await fetch('/mosque/api/registration_entry.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form_key:'survey_'+svId,form_label:svTitle,data:answers})});
    if(S.surveyResults){S.surveyResults.total=(S.surveyResults.total||0)+1;}
    document.getElementById('m-body').innerHTML=`<div class="success-box">
      <div class="success-icon">✅</div>
      <div class="success-title">تم استلام إجاباتك بنجاح!</div>
      <div class="success-sub">شكراً لمشاركتك — رأيك يُحدث فرقاً حقيقياً في تطوير خدماتنا.</div>
      <button class="btn-primary" style="margin-top:20px;" onclick="closeModal();showSvTab('results',null);scrollSec('surveys-sec')">عرض النتائج ←</button>
    </div>`;
  }catch(e){
    toast('تعذر إرسال المرفق أو الاستطلاع، حاول مرة أخرى');
    if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='إرسال الاستطلاع ✓';}
  }
}
function closeModal(e){if(e&&e.target!==document.getElementById('modal-ov'))return;document.getElementById('modal-ov').classList.remove('open');document.body.style.overflow='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

function renderSurveyResults(){
  var el=document.getElementById('sv-tab-results');if(!el)return;
  var surveys=S.surveys||[];
  if(!surveys.length){el.innerHTML='<div style="text-align:center;padding:32px;color:#888;">لا توجد استطلاعات حتى الآن</div>';return;}
  var opts=surveys.map(function(s){return '<option value="'+s.id+'">'+s.title+'</option>';}).join('');
  el.innerHTML='<div style="margin-bottom:16px;"><select id="sv-res-select" style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--BD);font-family:Tajawal,sans-serif;font-size:14px;background:var(--W);" onchange="loadSurveyResults(this.value)">'+opts+'</select></div><div id="sv-res-body"></div>';
  loadSurveyResults(surveys[0].id);
}
function loadSurveyResults(svId){
  var body=document.getElementById('sv-res-body');if(!body)return;
  var svObj=(S.surveys||[]).find(function(x){return String(x.id)===String(svId);})||{};
  body.innerHTML='<div style="text-align:center;padding:24px;color:#888;">⏳ جارٍ تحميل...</div>';
  var headers={}; var tok=getCmsToken(); if(tok) headers['X-CMS-Token']=tok;
  fetch('/mosque/api/registration_entry.php?form_key='+encodeURIComponent('survey_'+svId)+'&per_page=9999',{headers:headers})
  .then(function(r){return r.json();})
  .then(function(res){
    var entries=res.entries||[];var total=res.total||0;var questions=svObj.questions||[];
    if(total===0){body.innerHTML='<div style="text-align:center;padding:32px;background:#f9fafb;border-radius:12px;color:#888;"><div style="font-size:40px;margin-bottom:12px;">📭</div><div style="font-size:16px;font-weight:700;">لا توجد إجابات بعد</div></div>';return;}
    var qStats={}; questions.forEach(function(q){qStats[q.text]={opts:{},total:0,type:q.type,optsOrder:q.opts||[]};});
    entries.forEach(function(e){var d=e.entry_data||{};Object.keys(d).forEach(function(qt){if(!qStats[qt])qStats[qt]={opts:{},total:0,type:'text',optsOrder:[]};var a=parseMaybeJson(d[qt]);if(a!==''&&a!=null){qStats[qt].total++;if(qStats[qt].type!=='text'&&qStats[qt].type!=='file'){var key=String(a);qStats[qt].opts[key]=(qStats[qt].opts[key]||0)+1;}}});});
    var h='<div class="kpi-row"><div class="kpi"><div class="kpi-lbl">إجمالي المشاركين</div><div class="kpi-val" style="color:var(--P)">'+total+'</div><div class="kpi-sub">إجابة</div></div>';
    h+='<div class="kpi a"><div class="kpi-lbl">عدد الأسئلة</div><div class="kpi-val" style="color:var(--A)">'+questions.length+'</div><div class="kpi-sub">سؤال</div></div>';
    h+='<div class="kpi b"><div class="kpi-lbl">آخر استجابة</div><div class="kpi-val" style="color:#378ADD;font-size:13px;">'+(entries.length?esc(String(entries[0].submitted_at||'').substring(0,10)):'—')+'</div><div class="kpi-sub"> </div></div></div>';
    Object.keys(qStats).forEach(function(qt){
      var st=qStats[qt];var so=st.optsOrder.length?st.optsOrder:Object.keys(st.opts);
      h+='<div class="res-card"><div class="res-q">📊 '+esc(qt)+'</div>';
      if(st.type==='file'){
        var fileCount=0;entries.forEach(function(e){var a=(e.entry_data||{})[qt];if(a)fileCount++;});
        h+='<div class="privacy-note">🔒 تم استلام '+fileCount+' مرفق/مرفقات لهذا السؤال. حفاظًا على الخصوصية لا تظهر للزوار، ويمكن استعراضها من لوحة التحكم > الاستطلاعات > المرفقات.</div>';
      } else if(st.type==='text'){
        h+='<div style="background:#f9fafb;border-radius:8px;padding:12px;max-height:260px;overflow-y:auto;">';
        entries.forEach(function(e){var a=(e.entry_data||{})[qt];if(a){h+='<div style="padding:8px;border-bottom:1px solid #e5e7eb;display:flex;gap:8px;align-items:flex-start;"><div style="flex:1;color:#374151;line-height:1.7;">'+renderEntryValue(a)+'</div>'+((typeof IS_ADMIN!=='undefined'&&IS_ADMIN)||getCmsToken()?'<button class="delbtn" title="حذف هذه الإجابة" onclick="deleteSurveyAnswer('+e.id+',\''+encodeURIComponent(qt)+'\',\''+svId+'\')">🗑</button>':'')+'</div>';}});
        h+='</div>';
      } else {
        var colors=['#0f3d26','#c9a227','#22c55e','#3b82f6','#f97316','#e24b4a','#8b5cf6','#14b8a6'];
        so.forEach(function(o,i){var c=st.opts[o]||0;var p=st.total>0?Math.round(c/st.total*100):0;var col=colors[i%colors.length];h+='<div class="bar-row"><div class="bar-lbl">'+esc(o)+'</div><div class="bar-track"><div class="bar-fill" style="width:'+p+'%;background:'+col+'"></div></div><div class="bar-pct" style="color:'+col+'">'+p+'%</div></div>';});
        if(st.total>0){var top=Object.keys(st.opts).sort(function(a,b){return st.opts[b]-st.opts[a];})[0];var tp=Math.round((st.opts[top]||0)/st.total*100);h+='<div class="insight"><div class="insight-title">💡 التحليل</div><div class="insight-txt">الخيار الأعلى: '+esc(top)+' بنسبة '+tp+'%</div></div>';}
      }
      h+='</div>';
    });
    body.innerHTML=h;
  }).catch(function(){body.innerHTML='<div style="color:#dc2626;padding:16px;">❌ تعذّر تحميل النتائج</div>';});
}
function deleteSurveyAnswer(entryId, encodedQuestion, svId){
  var question=decodeURIComponent(encodedQuestion||'');
  if(!entryId||!question) return;
  if(!confirm('حذف هذه الإجابة من النتائج؟')) return;
  fetch('/mosque/api/registration_entry.php',{method:'DELETE',headers:cmsAuthHeaders({'Content-Type':'application/json'}),body:JSON.stringify({id:entryId,field:question})})
  .then(function(r){return r.json();}).then(function(res){toast(res&&res.success?'تم الحذف ✓':'تعذر الحذف');loadSurveyResults(svId);}).catch(function(){toast('تعذر الحذف');});
}

function renderAnalysis(){
  const el=document.getElementById('sv-tab-analysis');if(!el)return;
  var reports=S.analysisReports||[];
  if(!reports.length){el.innerHTML='<div style="text-align:center;padding:28px;color:#888;background:#f9fafb;border-radius:12px;">لا توجد تقارير تحليل منشورة حالياً</div>';return;}
  el.innerHTML=reports.map(function(r){
    var files=(r.files||r.pdfs||[]);
    return '<div class="analysis-card">'
      +'<div class="ac-title">'+esc(r.title||'تقرير تحليل')+'</div>'
      +'<div class="ac-meta">📅 '+esc(r.date||'')+(r.survey?' · استطلاع: '+esc(r.survey):'')+'</div>'
      +(r.text?'<div class="ac-text">'+esc(r.text)+'</div>':'')
      +files.map(function(f){return '<div class="pdf-row"><div class="pdf-icon">'+fileIconByName(f.name||f.url)+'</div><div class="pdf-info"><div class="pdf-name">'+esc(f.name||'مرفق')+'</div><div class="pdf-size">'+esc(f.size||'')+'</div></div><div class="pdf-btns"><a class="pdf-open" href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">فتح</a></div></div>';}).join('')
      +'</div>';
  }).join('');
}

function renderBoard(){
  const typeL={rec:'توصية',dec:'قرار',act:'إجراء'};
  const el=document.getElementById('sv-tab-board');if(!el)return;
  var rows=S.boardDecisions||[];
  if(!rows.length){el.innerHTML='<div style="text-align:center;padding:28px;color:#888;background:#f9fafb;border-radius:12px;">لا توجد توصيات منشورة حالياً</div>';return;}
  el.innerHTML=rows.map(function(d){
    var files=d.files||[];
    return '<div class="dec-card '+esc(d.type||'rec')+'">'
      +'<span class="dec-type '+esc(d.type||'rec')+'">'+esc(typeL[d.type]||'توصية')+'</span>'
      +'<div class="dec-title">'+esc(d.title||'توصية')+'</div>'
      +'<div class="dec-meta">'+(d.survey?'📋 الاستطلاع: '+esc(d.survey)+' · ':'')+'📅 '+esc(d.date||'')+(d.resp?' · المسؤول: '+esc(d.resp):'')+(d.deadline?' · الموعد: '+esc(d.deadline):'')+'</div>'
      +(d.body?'<div class="dec-body">'+esc(d.body)+'</div>':'')
      +files.map(function(f){return '<div class="pdf-row" style="margin-top:10px;"><div class="pdf-icon">📄</div><div class="pdf-info"><div class="pdf-name">'+esc(f.name||'ملف توصية')+'</div><div class="pdf-size">'+esc(f.size||'')+'</div></div><a class="pdf-open" href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">فتح</a></div>';}).join('')
      +'</div>';
  }).join('');
}

function showSvTab(tab,btn){
  ['list','results','analysis','board'].forEach(t=>{
    const el=document.getElementById('sv-tab-'+t);
    if(el)el.style.display=t===tab?'block':'none';
  });
  document.querySelectorAll('.survey-tab').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  else document.querySelectorAll('.survey-tab').forEach(b=>{if(b.getAttribute('onclick')&&b.getAttribute('onclick').includes("'"+tab+"'"))b.classList.add('on');});
  if(tab==='results'&&typeof renderSurveyResults==='function')renderSurveyResults();
  if(tab==='analysis'&&typeof renderSurveyAnalysis==='function')renderSurveyAnalysis();
  if(tab==='board'&&typeof renderSurveyBoard==='function')renderSurveyBoard();
}

/* ════════════ HELPERS ════════════ */
function scrollSec(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
function tx(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function sv(n,v){document.documentElement.style.setProperty(n,v);}
function toast(m){const t=document.getElementById('T');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}

/* ════════════ PAGES (docs / complaints / register) ════════════ */
function showPage(page){
  if(!page) return;
  if(page.indexOf('cp:')===0){ openCustomPage(page.replace('cp:','')); return; }
  if(page==='register'){
    history.pushState({},'','#page-register');
    openRegPage(); return;
  }
  history.pushState({},'','#page-'+encodeURIComponent(page));
  // Remove existing page overlay if any
  const existing=document.getElementById('page-overlay');if(existing)existing.remove();
  const pages={
    docs: buildDocsPage(),
    complaints: buildComplaintsPage(),
    register: buildRegisterPage(),
  };
  const content=pages[page];
  if(!content)return;
  const overlay=document.createElement('div');
  overlay.id='page-overlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:1500;background:var(--BG);overflow-y:auto;';
  overlay.innerHTML=`
    <div style="max-width:820px;margin:0 auto;padding:80px 20px 60px;">
      <button onclick="document.getElementById('page-overlay').remove()" style="position:fixed;top:80px;left:20px;z-index:10;display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1px solid var(--BD);background:var(--W);color:var(--TX);font-size:13px;cursor:pointer;font-family:'Tajawal',sans-serif;box-shadow:var(--SH);">← رجوع للموقع</button>
      ${content}
    </div>`;
  document.getElementById('site-panel').appendChild(overlay);
  overlay.scrollTop=0;
}

function buildDocsPage(){
  const docs=S.pages.docs.pdfs||[];
  return `
  <div class="section-hd" style="margin-bottom:32px;">
    <div class="section-tag">الحوكمة والشفافية</div>
    <div class="section-title">الوثائق والتقارير الرسمية</div>
    <div class="section-sub">جميع الوثائق والتقارير الرسمية للجمعية متاحة للعموم بشكل مجاني</div>
  </div>
  ${docs.length===0?`<div style="text-align:center;padding:60px;color:var(--TXM);">لا توجد وثائق — أضفها من لوحة التحكم > الفوتر > محتوى الصفحات</div>`:
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
    ${docs.map(d=>`
    <div style="background:var(--W);border:1px solid var(--BD);border-radius:16px;overflow:hidden;box-shadow:var(--SH);">
      <div style="height:90px;background:${d.bg||'#e8f2ec'};display:flex;align-items:center;justify-content:center;font-size:40px;">${d.icon||'📄'}</div>
      <div style="padding:18px;">
        <div style="font-size:16px;font-weight:700;color:var(--P);margin-bottom:6px;">${d.title}</div>
        <div style="font-size:13px;color:var(--TXM);line-height:1.6;margin-bottom:12px;">${d.desc||''}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--TXL);margin-bottom:14px;">
          <span>📅 ${d.date||''}</span><span>📦 ${d.size||''}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="${d.fileUrl?`window.open('${d.fileUrl}','_blank')`:'toast(\'جارٍ فتح المعاينة...\')'}" style="flex:1;padding:10px;border-radius:8px;border:none;background:var(--PL);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Tajawal',sans-serif;">👁 معاينة</button>
          <button onclick="${d.fileUrl?`const a=document.createElement('a');a.href='${d.fileUrl}';a.download='${d.file||d.title}';a.click()`:'toast(\'جارٍ التحميل...\')'}" style="padding:10px 14px;border-radius:8px;border:1px solid var(--BD);background:var(--W);color:var(--TX);font-size:13px;cursor:pointer;font-family:'Tajawal',sans-serif;">⬇ تحميل</button>
        </div>
      </div>
    </div>`).join('')}
  </div>`}`;
}


function buildComplaintsPage(){
  return `
  <div class="section-hd" style="margin-bottom:32px;">
    <div class="section-tag">الحوكمة والمساءلة</div>
    <div class="section-title">الشكاوى والمقترحات</div>
    <div class="section-sub">مساهمتك تساعدنا على التطوير المستمر — نحن نسمعك ونتجاوب</div>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:24px;">
    <button class="comp-active" onclick="switchComp(this,'comp-suggest','comp-complaint')" style="flex:1;padding:12px;border-radius:10px;border:2px solid var(--PL);background:var(--PL);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:'Tajawal',sans-serif;">💡 تقديم مقترح</button>
    <button onclick="switchComp(this,'comp-complaint','comp-suggest')" style="flex:1;padding:12px;border-radius:10px;border:2px solid var(--BD);background:var(--W);color:var(--TXM);font-size:14px;font-weight:600;cursor:pointer;font-family:'Tajawal',sans-serif;">⚠ تقديم شكوى</button>
  </div>
  <div id="comp-suggest" style="background:var(--W);border:1px solid var(--BD);border-radius:16px;padding:28px;">
    <div style="font-size:16px;font-weight:700;color:var(--PL);margin-bottom:20px;display:flex;align-items:center;gap:8px;">💡 نموذج تقديم مقترح</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">الاسم الكامل <span style="color:#e24b4a">*</span></label><input style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;" placeholder="أدخل اسمك الكريم"></div>
      <div><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">وسيلة التواصل <span style="color:#e24b4a">*</span></label><input style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;" placeholder="هاتف أو بريد إلكتروني"></div>
    </div>
    <div style="margin-bottom:14px;"><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">نص المقترح <span style="color:#e24b4a">*</span></label><textarea style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;min-height:120px;resize:vertical;" placeholder="اكتب مقترحك هنا بالتفصيل..."></textarea></div>
    <button onclick="toast('✓ تم إرسال مقترحك بنجاح — شكراً لمساهمتك')" style="width:100%;padding:14px;border-radius:10px;background:linear-gradient(135deg,var(--P),var(--PL));color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;">إرسال المقترح</button>
  </div>
  <div id="comp-complaint" style="display:none;background:var(--W);border:1px solid var(--BD);border-radius:16px;padding:28px;">
    <div style="font-size:16px;font-weight:700;color:#e24b4a;margin-bottom:20px;display:flex;align-items:center;gap:8px;">⚠ نموذج تقديم شكوى</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">الاسم الكامل <span style="color:#e24b4a">*</span></label><input style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;" placeholder="أدخل اسمك الكريم"></div>
      <div><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">وسيلة التواصل <span style="color:#e24b4a">*</span></label><input style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;" placeholder="هاتف أو بريد إلكتروني"></div>
    </div>
    <div style="margin-bottom:14px;"><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">نوع الشكوى</label><select style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;"><option>جودة العمل المنجز</option><option>الالتزام بالمواعيد</option><option>سلوك الموظفين</option><option>أخرى</option></select></div>
    <div style="margin-bottom:14px;"><label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">تفاصيل الشكوى <span style="color:#e24b4a">*</span></label><textarea style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;min-height:120px;resize:vertical;" placeholder="اكتب تفاصيل شكواك..."></textarea></div>
    <button onclick="toast('✓ تم استلام شكواك — سنتواصل معك خلال 48 ساعة')" style="width:100%;padding:14px;border-radius:10px;background:#e24b4a;color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;">إرسال الشكوى</button>
  </div>`;
}

function switchComp(btn,showId,hideId){
  document.getElementById(showId).style.display='block';
  document.getElementById(hideId).style.display='none';
  btn.style.background='var(--PL)';btn.style.color='#fff';btn.style.borderColor='var(--PL)';btn.style.fontWeight='600';
  const other=btn.nextElementSibling||btn.previousElementSibling;
  if(other){other.style.background='var(--W)';other.style.color='var(--TXM)';other.style.borderColor='var(--BD)';}
}

function buildRegisterPage(){
  const reg=S.pages.register;
  const forms=reg.forms||[];
  if(!forms.length)return`<div style="text-align:center;padding:60px;color:var(--TXM);">لا توجد نماذج تسجيل — أضف نماذج من لوحة التحكم > الفوتر > محتوى الصفحات</div>`;
  return`
  <div class="section-hd" style="margin-bottom:32px;">
    <div class="section-tag">المشاركة المجتمعية</div>
    <div class="section-title">${reg.title||'نماذج التسجيل'}</div>
    <div class="section-sub">انضم إلى عائلة جمعية رفد المساجد للعناية بالمساجد — اختر النوع المناسب لك</div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:24px;background:var(--BG2);padding:6px;border-radius:14px;flex-wrap:wrap;">
    ${forms.map((f,i)=>`<button id="rt-${i}-btn" onclick="switchRegDyn(${i},${forms.length})" style="flex:1;min-width:100px;padding:12px;border-radius:10px;border:none;${i===0?'background:var(--PL);color:#fff;font-weight:700;':'background:none;color:var(--TXM);'}font-size:13px;cursor:pointer;font-family:'Tajawal',sans-serif;">${f.icon||'📋'} ${f.label}</button>`).join('')}
  </div>
  ${forms.map((frm,i)=>`<div id="rt-${i}" style="${i!==0?'display:none;':''}background:var(--W);border:1px solid var(--BD);border-radius:16px;padding:28px;">
    <div style="font-size:16px;font-weight:700;color:var(--P);margin-bottom:6px;">${frm.icon||'📋'} ${frm.label}</div>
    <div style="font-size:13px;color:var(--TXM);margin-bottom:20px;">${frm.desc||''}</div>
    ${(frm.fields||[]).map(fld=>`<div style="margin-bottom:14px;">
      <label style="font-size:12px;color:var(--TXM);display:block;margin-bottom:4px;">${fld.label}${fld.required?' <span style=color:#e24b4a>*</span>':''}</label>
      ${fld.type==='select'?`<select style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;"><option>اختر...</option></select>`:
        fld.type==='file'?`<div onclick="toast('اختيار الملف')" style="border:2px dashed #c9a227;border-radius:10px;padding:16px;text-align:center;cursor:pointer;background:#fffef8;"><div style="font-size:24px;margin-bottom:4px;">📎</div><div style="font-size:12px;color:var(--TXM);">اسحب الملف أو انقر للاختيار · الحد الأقصى 5 MB</div></div>`:
        fld.type==='date'?`<input type="date" style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;">`:
        `<input type="${fld.type||'text'}" style="width:100%;padding:10px 13px;border-radius:9px;border:1.5px solid var(--BD);font-size:13px;font-family:'Tajawal',sans-serif;" placeholder="${fld.label}">`}
    </div>`).join('')}
    <button onclick="toast('✓ تم استلام طلب التسجيل — سيتم التواصل معك قريباً')" style="width:100%;padding:14px;border-radius:10px;background:linear-gradient(135deg,var(--P),var(--PL));color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;">إرسال الطلب</button>
  </div>`).join('')}`;
}

function switchRegDyn(idx,total){
  for(let i=0;i<total;i++){
    const el=document.getElementById('rt-'+i);
    const btn=document.getElementById('rt-'+i+'-btn');
    if(el)el.style.display=i===idx?'block':'none';
    if(btn){btn.style.background=i===idx?'var(--PL)':'none';btn.style.color=i===idx?'#fff':'var(--TXM)';btn.style.fontWeight=i===idx?'700':'400';}
  }
}

function switchReg(type){
  ['member','volunteer','trainee'].forEach(t=>{
    const el=document.getElementById('rt-'+t);
    const btn=document.getElementById('rt-'+t+'-btn');
    if(el) el.style.display=t===type?'block':'none';
    if(btn){
      btn.style.background=t===type?'var(--PL)':'none';
      btn.style.color=t===type?'#fff':'var(--TXM)';
      btn.style.fontWeight=t===type?'700':'400';
    }
  });
}
function toggleCMS(){
  var p=document.getElementById('cms-panel');
  var btn=document.getElementById('cms-toggle');
  var isOpen=p.classList.contains('open');
  if(isOpen){
    p.classList.remove('open');
    p.classList.add('collapsed');
    btn.classList.add('collapsed');
    btn.style.left='0px';
  } else {
    p.classList.add('open');
    p.classList.remove('collapsed');
    btn.classList.remove('collapsed');
    btn.style.left=(window.innerWidth<=1100?'280':'420')+'px';
  }
  isOpen=!isOpen;
  setCookie('cms_open', isOpen?'1':'0');
  setCookie('cms_tab', getCookie('cms_tab')||'global');
}

function initCMSState(){
  try{
    var isOpen=getCookie('cms_open')==='1';
    var tab=getCookie('cms_tab')||'global';
    var p=document.getElementById('cms-panel');
    var btn=document.getElementById('cms-toggle');
    if(!p) return;
    if(isOpen){
      p.classList.remove('collapsed'); p.style.width='';
      if(btn){btn.classList.remove('collapsed');btn.style.left=(window.innerWidth<=1100?'280':'320')+'px';}
      G(tab);
      if(typeof activatePnlCards==='function') setTimeout(activatePnlCards,200);
    } else {
      p.classList.add('collapsed'); p.style.width='0';
      if(btn){btn.classList.add('collapsed');btn.style.left='0px';}
    }
  }catch(e){}
}

/* ════════════ CMS PANELS ════════════ */
let heroDir='145deg';
function rHero(){const b1=getComputedStyle(document.documentElement).getPropertyValue('--hbg1').trim()||S.hero.bg1;const b2=getComputedStyle(document.documentElement).getPropertyValue('--hbg2').trim()||S.hero.bg2;document.getElementById('home').style.background=`linear-gradient(${heroDir},${b1},${b2})`;}
function applyPreset(k){
  const P={green:['#082918','#1a5c3a','#c9a227','#f5f1ea'],blue:['#1a237e','#283593','#f57f17','#f0f2ff'],gray:['#1a1a1a','#37474f','#90a4ae','#f5f6f7'],purple:['#4a148c','#6a1f5e','#e91e63','#fdf0f9']}[k];if(!P)return;
  sv('--P',P[0]);sv('--PL',P[1]);sv('--A',P[2]);sv('--AL',P[2]);sv('--BG',P[3]);
  S.hero.bg1=P[0];S.hero.bg2=P[1];rHero();
  renderAll();toast('تم تطبيق النمط ✓');
}
function toggleSec(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const h=el.style.display==='none';
  el.style.display=h?'':'none';
  btn.classList.toggle('on',h);
  toast(h?'تم إظهار القسم':'تم إخفاء القسم');
}

function G(tab){
  document.querySelectorAll('.cms-tab').forEach(t=>t.classList.toggle('on',t.getAttribute('onclick')===`G('${tab}')`));
  document.getElementById('CB').innerHTML=buildPanel(tab);
  setCookie('cms_tab', tab);
  setCookie('cms_open', '1');
  /* ── تحديث cms-standalone إذا كانت مفتوحة ── */
  var _st=document.getElementById('cms-standalone');
  if(_st && _st.classList.contains('open')){
    _cmsTab=tab;
    if(typeof _renderSt==='function') _renderSt(tab);
  }
}


function toggleIbox(el){
  var ibox=el;
  while(ibox&&!ibox.classList.contains('ibox')){ ibox=ibox.parentElement; }
  if(!ibox) return;
  var isOpen=ibox.classList.contains('open');
  var parent=ibox.parentElement;
  if(parent){
    var all=parent.children;
    for(var k=0;k<all.length;k++){
      if(all[k]!==ibox&&all[k].classList.contains('ibox')) all[k].classList.remove('open');
    }
  }
  if(isOpen) ibox.classList.remove('open');
  else ibox.classList.add('open');
}

function buildPanel(t){
  if(t==='achiev' && typeof pAchievV2==='function') return pAchievV2();
  if(t==='surveys' && typeof pSurveysV2==='function') return pSurveysV2();
  const panels={global:pGlobal,navbar:pNavbar,hero:pHero,achiev:pAchiev,stats:pStats,projects:pProjects,partners:pPartners,news:pNews,events:pEvents,testimonials:pTest,surveys:pSurveys,footer:pFooter,sections:pSections,regforms:pRegForms,users:pCmsUsers,maintenance:pMaintenance};
  return (panels[t]||pGlobal)();
}

/* ─ GLOBAL ─ */
function pGlobal(){return`
<div class="sh">🎨 نمط لوني جاهز</div>
<div class="prs">
  <div class="pr" style="background:linear-gradient(135deg,#082918,#c9a227)" onclick="applyPreset('green')" title="أخضر إسلامي"></div>
  <div class="pr" style="background:linear-gradient(135deg,#1a237e,#f57f17)" onclick="applyPreset('blue')" title="أزرق ملكي"></div>
  <div class="pr" style="background:linear-gradient(135deg,#1a1a1a,#90a4ae)" onclick="applyPreset('gray')" title="رمادي رسمي"></div>
  <div class="pr" style="background:linear-gradient(135deg,#4a148c,#e91e63)" onclick="applyPreset('purple')" title="بنفسجي"></div>
</div>
<div class="sh">🎨 ألوان الهوية</div>
<div class="fg"><label>اللون الأساسي</label><div class="cr"><input type="color" value="#0f3d26" oninput="sv('--P',this.value);sv('--PL',this.value);S.hero.bg1=this.value;rHero()"><span>#0f3d26</span></div></div>
<div class="fg"><label>اللون الثانوي</label><div class="cr"><input type="color" value="#1a5c3a" oninput="sv('--PL',this.value);S.hero.bg2=this.value;rHero()"><span>#1a5c3a</span></div></div>
<div class="fg"><label>لون التمييز (الذهبي)</label><div class="cr"><input type="color" value="#c9a227" oninput="sv('--A',this.value);sv('--AL',this.value);renderAll()"><span>#c9a227</span></div></div>
<div class="fg"><label>خلفية الموقع</label><div class="cr"><input type="color" value="#f5f1ea" oninput="sv('--BG',this.value)"><span>#f5f1ea</span></div></div>
<div class="dv"></div>
<div class="sh">☰ إخفاء / إظهار الأقسام</div>
${[['p-achiev-sec','الإنجازات','📊'],['p-stats-sec','الأرقام','🔢'],['projects','المشاريع','🏗'],['p-par-sec','الشركاء','🤝'],['news','الأخبار','📰'],['p-evn-sec','الفعاليات','📅'],['p-tst-sec','الآراء','💬'],['surveys-sec','الاستطلاعات','📋'],['p-ft-sec','الفوتر','📍']].map(([id,nm,ic])=>`
<div class="tr"><span class="tl">${ic} ${nm}</span><div class="tog on" onclick="toggleSec('${id}',this)"></div></div>`).join('')}
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ NAVBAR ─ */
function pNavbar(){
  if(!S.nav) return '';
  var h='';
  h+='<div class="pnl-notice">💡 القوائم المنسدلة تدعم: صفحات ثابتة - صفحات مخصصة - روابط مباشرة</div>';

  /* إعدادات الشعار والتبرع */
  h+='<div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:14px;margin-bottom:14px;">';
  h+='<div class="pnl-section-title">الشعار والتبرع</div>';
  h+='<div class="pnl-grid2">';
  h+='<div class="pnl-field"><label>اسم الجمعية</label><input class="is" value="'+S.nav.orgName+'" oninput="S.nav.orgName=this.value;renderNav();autoSave()"></div>';
  h+='<div class="pnl-field"><label>الاسم الفرعي</label><input class="is" value="'+(S.nav.orgSub||'')+'" oninput="S.nav.orgSub=this.value;renderNav();autoSave()"></div>';
  h+='<div class="pnl-field"><label>نص زر التبرع</label><input class="is" value="'+(S.nav.donBtn||'')+'" oninput="S.nav.donBtn=this.value;renderNav();autoSave()"></div>';
  h+='<div class="pnl-field"><label>رابط التبرع</label><input class="is" value="'+(S.nav.donUrl||'')+'" oninput="S.nav.donUrl=this.value;renderNav();autoSave()"></div>';
  h+='</div></div>';

  /* عناصر القائمة */
  h+='<div class="pnl-section-title">عناصر القائمة ('+S.nav.items.length+')</div>';

  for(var i=0;i<S.nav.items.length;i++){
    var item=S.nav.items[i];
    var drops=item.dropItems||[];
    h+='<div class="pnl-card">';
    h+='<div class="pnl-card-hdr">';
    h+='<div class="pnl-card-icon" style="background:'+(item.hasDrop?'#e8f2ec':'#f3f4f6')+'">'+(item.hasDrop?'📂':'🔗')+'</div>';
    h+='<div class="pnl-card-info">';
    h+='<div class="pnl-card-title">'+(item.label||'قائمة')+'</div>';
    h+='<div class="pnl-card-sub">'+(item.hasDrop?'منسدلة · '+drops.length+' عناصر':'رابط مباشر → '+(item.url||'#'))+'</div>';
    h+='</div>';
    h+='<div class="pnl-card-actions"><span class="pnl-arrow">▼</span>';
    h+='<button class="delbtn" data-i="'+i+'" onclick="event.stopPropagation();navDelItem(parseInt(this.dataset.i))">🗑</button>';
    h+='</div></div>';

    h+='<div class="pnl-card-body">';
    h+='<div class="pnl-grid2">';
    h+='<div class="pnl-field"><label>اسم القائمة</label><input class="is" value="'+(item.label||'')+'" data-i="'+i+'" oninput="S.nav.items[parseInt(this.dataset.i)].label=this.value;renderNav();autoSave()"></div>';
    h+='<div class="pnl-field"><label>الرابط المباشر</label><input class="is" value="'+(item.url||'#')+'" data-i="'+i+'" oninput="S.nav.items[parseInt(this.dataset.i)].url=this.value;renderNav();autoSave()"></div>';
    h+='</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">';
    h+='<input type="checkbox" id="hd_'+i+'" '+(item.hasDrop?'checked':'')+' data-i="'+i+'" onchange="S.nav.items[parseInt(this.dataset.i)].hasDrop=this.checked;if(!S.nav.items[parseInt(this.dataset.i)].dropItems)S.nav.items[parseInt(this.dataset.i)].dropItems=[];renderNav();autoSave();_renderSt(\'navbar\')">';
    h+='<label for="hd_'+i+'" style="font-size:13px;cursor:pointer;font-weight:500;">قائمة منسدلة</label></div>';

    if(item.hasDrop){
      if(drops.length){
        h+='<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:10px;">';
        h+='<div class="pnl-section-title">العناصر الفرعية ('+drops.length+')</div>';
        for(var j=0;j<drops.length;j++){
          var di=drops[j];
          var diPage=di.page||'';
          h+='<div style="background:#fff;border:1px solid #e5e7eb;border-radius:7px;padding:10px;margin-bottom:7px;">';
          h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
          h+='<span style="font-size:13px;font-weight:600;color:#0f3d26;">'+(di.icon||'◈')+' '+(di.label||'عنصر')+'</span>';
          h+='<button data-i="'+i+'" data-j="'+j+'" onclick="navDelDropItem(parseInt(this.dataset.i),parseInt(this.dataset.j))" style="background:#fee2e2;color:#dc2626;border:none;border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit;">حذف</button>';
          h+='</div>';
          h+='<div class="pnl-grid2">';
          h+='<div class="pnl-field"><label>الاسم</label><input class="is" value="'+(di.label||'')+'" data-i="'+i+'" data-j="'+j+'" oninput="S.nav.items[parseInt(this.dataset.i)].dropItems[parseInt(this.dataset.j)].label=this.value;renderNav();autoSave()"></div>';
          h+='<div class="pnl-field"><label>الأيقونة</label><input class="is" value="'+(di.icon||'')+'" maxlength="4" placeholder="◈" data-i="'+i+'" data-j="'+j+'" oninput="S.nav.items[parseInt(this.dataset.i)].dropItems[parseInt(this.dataset.j)].icon=this.value;renderNav();autoSave()"></div>';
          h+='</div>';
          h+='<div class="pnl-field"><label>الوجهة</label>';
          h+='<select data-i="'+i+'" data-j="'+j+'" onchange="S.nav.items[parseInt(this.dataset.i)].dropItems[parseInt(this.dataset.j)].page=(this.value===\'direct\'?\'\':(this.value));S.nav.items[parseInt(this.dataset.i)].dropItems[parseInt(this.dataset.j)].url=\'\';renderNav();autoSave()">';
          h+='<option value="direct" '+(!diPage?'selected':'')+'>🔗 رابط مباشر</option>';
          h+='<option value="docs" '+(diPage==='docs'?'selected':'')+'>📄 وثائق وتقارير</option>';
          h+='<option value="complaints" '+(diPage==='complaints'?'selected':'')+'>💬 شكاوى ومقترحات</option>';
          h+='<option value="register" '+(diPage==='register'?'selected':'')+'>📋 نماذج التسجيل</option>';
          var cpages=S.customPages||[];
          for(var k=0;k<cpages.length;k++){
            h+='<option value="cp:'+cpages[k].id+'" '+(diPage==='cp:'+cpages[k].id?'selected':'')+'>📄 '+cpages[k].title+'</option>';
          }
          h+='</select></div>';
          if(!diPage){
            h+='<div class="pnl-field"><label>الرابط</label><input class="is" value="'+(di.url||'')+'" placeholder="#section أو https://..." data-i="'+i+'" data-j="'+j+'" oninput="S.nav.items[parseInt(this.dataset.i)].dropItems[parseInt(this.dataset.j)].url=this.value;renderNav();autoSave()"></div>';
          }
          h+='</div>';
        }
        h+='</div>';
      }
      h+='<button class="pnl-add-btn" data-i="'+i+'" onclick="event.stopPropagation();navAddDropItem(parseInt(this.dataset.i))">+ إضافة عنصر فرعي</button>';
    }
    h+='<div class="pnl-save-bar"><button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="renderNav();autoSave();toast(\'✓\')">تطبيق</button></div>';
    h+='</div></div>';
  }

  h+='<div style="margin-top:10px;"><button class="pnl-add-btn" onclick="S.nav.items.push({label:\'قائمة\',url:\'#\',hasDrop:false,dropItems:[]});renderNav();autoSave();_renderSt(\'navbar\')">+ إضافة قائمة</button></div>';
  h+='<div class="pnl-save-bar"><button class="adm-btn adm-btn-primary" onclick="saveState(true)">💾 حفظ</button></div>';
  return h;
}


function navDelItem(i){S.nav.items.splice(i,1);renderNav();G('navbar');}
function navDelDropItem(i,j){S.nav.items[i].dropItems.splice(j,1);renderNav();G('navbar');}
function navAddDropItem(i){
  S.nav.items[i].dropItems.push({label:'عنصر جديد',icon:'🔗',type:'text',file:'',files:[],page:''});
  renderNav();G('navbar');
}
function navUploadFile(i,j){
  const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,image/*';
  inp.onchange=e=>{
    if(e.target.files[0]){
      S.nav.items[i].dropItems[j].file=e.target.files[0].name;
      S.nav.items[i].dropItems[j].fileUrl=URL.createObjectURL(e.target.files[0]);
      G('navbar');toast('تم رفع الملف ✓');
    }
  };inp.click();
}
function navAddPdfToGroup(i,j){
  const inp=document.createElement('input');inp.type='file';inp.accept='.pdf';
  inp.onchange=e=>{
    if(e.target.files[0]){
      if(!S.nav.items[i].dropItems[j].files)S.nav.items[i].dropItems[j].files=[];
      S.nav.items[i].dropItems[j].files.push(e.target.files[0].name);
      G('navbar');toast('تمت إضافة الملف ✓');
    }
  };inp.click();
}

/* ─ HERO ─ */
function pHero(){return`
<div class="sh">📝 نصوص الهيرو</div>
<div class="fg"><label>الشارة</label><input type="text" value="${S.hero.badge}" oninput="S.hero.badge=this.value;tx('p-badge',this.value)"></div>
<div class="fg"><label>الكلمة المميّزة</label><input type="text" value="${S.hero.em}" id="i-em" oninput="S.hero.em=this.value;tx('p-em',this.value)"></div>
<div class="fg"><label>باقي العنوان</label><input type="text" value="${S.hero.rest}" oninput="S.hero.rest=this.value;document.getElementById('p-h1').innerHTML='نحن نعتني بـ <em id=p-em>'+S.hero.em+'</em><br>'+this.value;document.getElementById('p-em').style.color='var(--AL)'"></div>
<div class="fg"><label>النص التعريفي</label><textarea oninput="S.hero.sub=this.value;tx('p-sub',this.value)">${S.hero.sub}</textarea></div>
<div class="fg"><label>نص الزر الأول</label><input type="text" value="${S.hero.btn1}" oninput="S.hero.btn1=this.value;tx('p-btn1',this.value)"></div>
<div class="fg"><label>نص الزر الثاني</label><input type="text" value="${S.hero.btn2}" oninput="S.hero.btn2=this.value;tx('p-btn2',this.value)"></div>
<div class="dv"></div>
<div class="sh">🎨 ألوان الهيرو</div>
<div class="fg"><label>لون البداية</label><div class="cr"><input type="color" value="${S.hero.bg1}" oninput="S.hero.bg1=this.value;rHero()"><span>${S.hero.bg1}</span></div></div>
<div class="fg"><label>لون النهاية</label><div class="cr"><input type="color" value="${S.hero.bg2}" oninput="S.hero.bg2=this.value;rHero()"><span>${S.hero.bg2}</span></div></div>
<div class="fg"><label>اتجاه التدرج</label><select onchange="heroDir=this.value;rHero()"><option value="145deg">قطري</option><option value="180deg">رأسي</option><option value="90deg">أفقي</option></select></div>
<div class="dv"></div>
<div class="sh">📐 حجم العنوان</div>
<div class="fg"><div class="rr"><input type="range" min="20" max="50" value="38" oninput="document.getElementById('p-h1').style.fontSize=this.value+'px';this.nextElementSibling.textContent=this.value+'px'"><span class="rv">38px</span></div></div>
<div class="dv"></div>
<div class="sh">💬 زر واتساب العائم</div>
<div class="tr"><span class="tl">إظهار زر واتساب</span>
<div class="tog ${S.wa&&S.wa.show?'on':''}" onclick="S.wa.show=!S.wa.show;renderWA();G('hero')"></div></div>
<div class="fg"><label>رقم الواتساب (مع رمز الدولة بدون +)</label>
<input type="text" value="${S.wa&&S.wa.phone?S.wa.phone:'966500000000'}" placeholder="966500000000"
oninput="S.wa.phone=this.value" style="direction:ltr;text-align:left;"></div>
<div class="fg"><label>نص الزر</label>
<input type="text" value="${S.wa&&S.wa.label?S.wa.label:'تواصل معنا'}"
oninput="S.wa.label=this.value;renderWA()"></div>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ ACHIEV ─ */
function pAchiev(){return`
<div class="sh">📊 الإنجازات (${S.achiev.length})</div>
<div class="fg"><label>العنوان</label><input type="text" value="${S.achiev.length?'إنجازاتنا في أرقام':''}" oninput="tx('p-ach-title',this.value)"></div>
<div class="fg"><label>النص الفرعي</label><input type="text" value="تعرّف على ما حققناه منذ التأسيس" oninput="tx('p-ach-sub',this.value)"></div>
<div class="fg"><label>خلفية القسم</label><div class="cr"><input type="color" value="#0f3d26" oninput="document.getElementById('p-achiev-sec').style.background='linear-gradient(135deg,'+this.value+',#1a5c3a)'"><span>#0f3d26</span></div></div>
<div class="dv"></div>
${S.achiev.map((a,i)=>`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${a.icon} ${a.label}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.achiev.splice(${i},1);renderAchiev();G('achiev');autoSave()">🗑</button>
<div class="ibox-body">
<div class="g3"><div><label style="font-size:9px;color:var(--TXM)">أيقونة</label><select class="is" style="margin:0" onchange="S.achiev[${i}].icon=this.value;renderAchiev()">${['🕌','💧','❄️','👥','🏗','📍','💡','📚','⭐','🏆'].map(ic=>`<option ${ic===a.icon?'selected':''}>${ic}</option>`).join('')}</select></div><div><label style="font-size:9px;color:var(--TXM)">القيمة</label><input class="is" style="margin:0" value="${a.val}" oninput="S.achiev[${i}].val=this.value;renderAchiev()"></div><div><label style="font-size:9px;color:var(--TXM)">الوحدة</label><input class="is" style="margin:0" value="${a.unit}" oninput="S.achiev[${i}].unit=this.value;renderAchiev()"></div></div>
<input class="is" value="${a.label}" placeholder="المسمى" oninput="S.achiev[${i}].label=this.value;renderAchiev()"></div>`).join('')}
<button class="abtn" onclick="S.achiev.push({icon:'⭐',label:'إنجاز جديد',val:'0',unit:'وحدة'});renderAchiev();G('achiev');autoSave();">+ إضافة إنجاز</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ STATS ─ */
function pStats(){return`
<div class="sh">🔢 الأرقام (${S.stats.length})</div>
<div class="fg"><label>لون الخط العلوي</label><div class="cr"><input type="color" value="#c9a227" oninput="document.getElementById('p-stats-sec').style.borderTopColor=this.value"><span>#c9a227</span></div></div>
<div class="fg"><label>لون الأرقام</label><div class="cr"><input type="color" value="#0f3d26" oninput="document.querySelectorAll('.stat-val').forEach(e=>e.style.color=this.value)"><span>#0f3d26</span></div></div>
<div class="dv"></div>
<div id="stats-items-list">
${S.stats.map((s,i)=>`<div class="ibox" id="stat-item-${i}">
  <div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${s.val} · ${s.label}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();delStat(${i})">🗑</button></div></div>
<div class="ibox-body">
  <div class="g2">
    <input class="is" value="${s.val}" placeholder="القيمة مثل 1,240" oninput="S.stats[${i}].val=this.value;renderStats()">
    <input class="is" value="${s.label}" placeholder="الوصف" oninput="S.stats[${i}].label=this.value;renderStats()">
  </div>
</div>`).join('')}
</div>
<button class="abtn" onclick="addStat()">+ إضافة رقم جديد</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

function addStat(){
  S.stats.push({val:'0',label:'جديد'});
  renderStats();
  G('stats');
  autoSave();
  toast('تمت الإضافة ✓');
}
function delStat(i){
  S.stats.splice(i,1);
  renderStats();
  G('stats');
  autoSave();
  toast('تم الحذف');
}
/* ─ PROJECTS ─ */
function pProjects(){return`
<div class="note">جميع المشاريع تظهر في سطر واحد بتوزيع متساوٍ تلقائياً</div>
<div class="sh">🏗 المشاريع (${S.projects.length})</div>
<div class="fg"><label>الوسم</label><input type="text" value="مشاريعنا الحالية" oninput="tx('p-prj-tag',this.value)"></div>
<div class="fg"><label>العنوان</label><input type="text" value="ساهم في بناء الأجر الجاري" oninput="tx('p-prj-title',this.value)"></div>
<div class="fg"><label>لون الخلفية</label><div class="cr"><input type="color" value="#f5f1ea" oninput="document.getElementById('projects').style.background=this.value"><span>#f5f1ea</span></div></div>
<div class="dv"></div>
${S.projects.map((p,i)=>`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${p.icon} ${p.name}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.projects.splice(${i},1);renderProjects();renderHeroCard();G('projects');autoSave()">🗑</button></div></div>
<div class="ibox-body">
<div class="g2" style="margin-bottom:5px;"><div><label style="font-size:9px;color:var(--TXM)">أيقونة</label><select class="is" style="margin:0" onchange="S.projects[${i}].icon=this.value;renderProjects()">${['💡','💧','📚','🔧','🌿','❄️','🕌','⭐'].map(ic=>`<option ${ic===p.icon?'selected':''}>${ic}</option>`).join('')}</select></div>
<div><label style="font-size:9px;color:var(--TXM)">خلفية</label><input type="color" value="${p.bg}" style="width:100%;height:28px;border-radius:5px;border:1px solid var(--BD);cursor:pointer;margin:0;" oninput="S.projects[${i}].bg=this.value;renderProjects()"></div></div>
<input class="is" value="${p.name}" placeholder="الاسم" oninput="S.projects[${i}].name=this.value;renderProjects()">
<input class="is" value="${p.desc}" placeholder="الوصف" oninput="S.projects[${i}].desc=this.value;renderProjects()">
<div class="g2" style="margin-bottom:4px;">
  <div><label style="font-size:9px;color:var(--TXM)">الهدف (ريال)</label>
  <input class="is" style="margin:0" type="number" value="${p.goal||0}" placeholder="مثال: 100000"
  oninput="S.projects[${i}].goal=parseFloat(this.value)||0;renderProjects();renderHeroCard()"></div>
  <div><label style="font-size:9px;color:var(--TXM)">المُجمَّع (ريال)</label>
  <input class="is" style="margin:0" type="number" value="${p.cur||0}" placeholder="مثال: 82000"
  oninput="S.projects[${i}].cur=parseFloat(this.value)||0;renderProjects();renderHeroCard()"></div>
</div>
<div style="background:#e8f2ec;border-radius:6px;padding:6px 10px;font-size:11px;color:var(--PL);margin-bottom:5px;">
  📊 النسبة المحسوبة تلقائياً: <strong>${p.goal>0?Math.min(100,Math.round((p.cur||0)/(p.goal||1)*100)):p.pct||0}%</strong>
</div>
<div class="fg"><label>رابط المشروع (اختياري)</label>
<input class="is" type="url" value="${p.url||''}" placeholder="https://..."
oninput="S.projects[${i}].url=this.value;renderProjects()"></div>
</div>`).join('')}
<button class="abtn" onclick="S.projects.push({icon:'💡',bg:'#e8f5e9',name:'مشروع جديد',desc:'الوصف',pct:0,goal:100000,cur:0,url:''});renderProjects();renderHeroCard();G('projects');autoSave();">+ إضافة مشروع</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ PARTNERS ─ */
function pPartners(){return`
<div class="sh">🤝 الشركاء (${S.partners.length})</div>
<div class="fg"><label>الوسم</label><input type="text" value="شركاؤنا في النجاح" oninput="tx('p-par-tag',this.value)"></div>
<div class="fg"><label>العنوان</label><input type="text" value="نفخر بدعم هذه المؤسسات" oninput="tx('p-par-title',this.value)"></div>
<div class="fg"><label>حجم شعار الشريك (ارتفاع الصورة)</label>
<div class="rr"><input type="range" min="24" max="80" value="40" oninput="sv('--partner-logo-h',this.value+'px');renderPartners();this.nextElementSibling.textContent=this.value+'px'"><span class="rv">40px</span></div></div>
<div class="dv"></div>
${S.partners.map((p,i)=>`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${p.icon} ${p.name}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.partners.splice(${i},1);renderPartners();G('partners');autoSave()">🗑</button></div></div>
<div class="ibox-body">
<div class="fg"><label>الاسم</label><input class="is" value="${p.name}" oninput="S.partners[${i}].name=this.value;renderPartners()"></div>
<div class="fg"><label>رفع شعار الشريك (صورة)</label>
<div style="border:1.5px dashed var(--A);border-radius:7px;padding:8px;text-align:center;cursor:pointer;background:#fffef8;position:relative;">
  <input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" onchange="uploadPartnerImg(${i},this)">
  <div style="font-size:16px;pointer-events:none;">${p.img?'🖼':'📤'}</div>
  <div style="font-size:10px;color:var(--TXM);pointer-events:none;">${p.img?'شعار مرفوع ✓ — انقر لتغييره':'اسحب الشعار أو انقر'}</div>
</div></div>
<div class="g2"><div><label style="font-size:9px;color:var(--TXM)">أيقونة بديلة</label><select class="is" style="margin:0" onchange="S.partners[${i}].icon=this.value;renderPartners()">${['🏛','🏠','💼','🏥','🏦','🎓','⭐','🕌'].map(ic=>`<option ${ic===p.icon?'selected':''}>${ic}</option>`).join('')}</select></div>
<div><label style="font-size:9px;color:var(--TXM)">لون الاسم</label><div class="cr"><input type="color" value="${p.color}" oninput="S.partners[${i}].color=this.value;renderPartners()"><span></span></div></div></div>
</div>`).join('')}
<button class="abtn" onclick="S.partners.push({icon:'⭐',name:'شريك جديد',img:'',color:'#1a5c3a'});renderPartners();G('partners');autoSave();">+ إضافة شريك</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

function uploadPartnerImg(i,input){
  if(!input.files.length)return;
  const url=URL.createObjectURL(input.files[0]);
  S.partners[i].img=url;renderPartners();G('partners');
  toast('تم رفع شعار الشريك ✓');
}
/* ─ NEWS ─ */
const newsCats=[
  {label:'إنجاز',icon:'🏆'},{label:'شراكة',icon:'🤝'},{label:'مبادرة',icon:'💡'},
  {label:'خبر',icon:'📰'},{label:'إعلان',icon:'📣'},{label:'تقرير',icon:'📊'},
  {label:'مناسبة',icon:'🎉'},{label:'تطوير',icon:'🔧'},{label:'توعية',icon:'📚'},
];
function pNews(){return`
<div class="note">تظهر 4 أخبار في الصفحة الرئيسية — الكل متاح في "كافة الأخبار"</div>
<div class="sh">📰 الأخبار (${S.news.length})</div>
<div class="fg"><label>الوسم</label><input type="text" value="أخبار الجمعية" oninput="tx('p-nws-tag',this.value)"></div>
<div class="fg"><label>العنوان</label><input type="text" value="آخر المستجدات" oninput="tx('p-nws-title',this.value)"></div>
<div class="dv"></div>
${S.news.map((n,i)=>{
  const catObj=newsCats.find(c=>c.label===n.cat)||{label:n.cat,icon:'📌'};
  return`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)">
    <span class="ibox-t">${catObj.icon} ${n.title.substring(0,22)}</span>
    <div style="display:flex;gap:4px;align-items:center;">
      <span class="ibox-arrow">▼</span>
      <button class="delbtn" onclick="event.stopPropagation();S.news.splice(${i},1);renderNews();G('news');autoSave()">🗑</button>
    </div>
  </div>
  <div class="ibox-body">
  <!-- التصنيف -->
  <div class="fg"><label>التصنيف</label>
  <select class="is" onchange="S.news[${i}].cat=this.options[this.selectedIndex].dataset.label;S.news[${i}].catIcon=this.options[this.selectedIndex].dataset.icon;renderNews()">
    ${newsCats.map(c=>`<option data-label="${c.label}" data-icon="${c.icon}" ${c.label===n.cat?'selected':''}>${c.icon} ${c.label}</option>`).join('')}
  </select></div>
  <div class="g2">
    <div class="fg"><label>لون التصنيف</label><div class="cr"><input type="color" value="${n.cBg||'#c9a227'}" oninput="S.news[${i}].cBg=this.value;renderNews()"><span></span></div></div>
    <div class="fg"><label>لون نص التصنيف</label><div class="cr"><input type="color" value="${n.cTx||'#0f3d26'}" oninput="S.news[${i}].cTx=this.value;renderNews()"><span></span></div></div>
  </div>
  <!-- العنوان والتاريخ -->
  <input class="is" value="${n.title}" placeholder="عنوان الخبر" oninput="S.news[${i}].title=this.value;renderNews()">
  <input class="is" value="${n.date}" placeholder="التاريخ مثل: 15 أبريل 2026" oninput="S.news[${i}].date=this.value;renderNews()">
  <!-- المقتطف -->
  <textarea class="is" style="min-height:40px" placeholder="المقتطف (يظهر في القائمة)" oninput="S.news[${i}].excerpt=this.value;renderNews()">${n.excerpt||''}</textarea>
  <!-- المحتوى الكامل -->
  <label style="font-size:10px;color:var(--TXM);display:block;margin:6px 0 2px;">المحتوى الكامل للخبر (يظهر في صفحة التفاصيل)</label>
  <textarea class="is" style="min-height:80px" placeholder="اكتب النص الكامل للخبر هنا..." oninput="S.news[${i}].content=this.value">${n.content||''}</textarea>
  <!-- الصورة الرئيسية -->
  <label style="font-size:10px;color:var(--TXM);display:block;margin:6px 0 2px;">📷 الصورة الرئيسية للخبر</label>
  <div style="border:1.5px dashed var(--A);border-radius:7px;padding:10px;text-align:center;cursor:pointer;background:#fffef8;position:relative;overflow:hidden;">
    <input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" onchange="uploadNewsImg(${i},this)">
    ${n.imgUrl ? `<img src="${n.imgUrl}" style="height:70px;object-fit:cover;border-radius:5px;pointer-events:none;"><div style="font-size:9px;color:var(--PL);margin-top:3px;pointer-events:none;">✓ صورة مرفوعة — انقر لتغييرها</div>` : `<div style="font-size:18px;pointer-events:none;">🖼</div><div style="font-size:10px;color:var(--TXM);pointer-events:none;">اسحب الصورة أو انقر للرفع</div>`}
  </div>
  <!-- صور إضافية -->
  <label style="font-size:10px;color:var(--TXM);display:block;margin:6px 0 2px;">📷 صور إضافية (تظهر بعد نص الخبر)</label>
  <div style="border:1.5px dashed var(--BD);border-radius:7px;padding:8px;text-align:center;cursor:pointer;background:#fafaf8;position:relative;">
    <input type="file" accept="image/*" multiple style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;" onchange="addNewsImages(${i},this)">
    ${(n.images&&n.images.filter(x=>x&&x!==n.imgUrl).length)?
      `<div style="display:flex;flex-wrap:wrap;gap:4px;pointer-events:none;">
        ${n.images.filter(x=>x&&x!==n.imgUrl).map(img=>`<img src="${img}" style="height:50px;width:50px;object-fit:cover;border-radius:4px;">`).join('')}
        <div style="font-size:9px;color:var(--PL);margin-top:4px;width:100%;">✓ انقر لإضافة المزيد</div>
      </div>`:
      `<div style="font-size:14px;pointer-events:none;">🖼+</div><div style="font-size:10px;color:var(--TXM);pointer-events:none;">إضافة صور متعددة (اختياري)</div>`}
  </div>
  <!-- لون خلفية بديل -->
  <div class="fg" style="margin-top:6px;"><label>لون الخلفية (إذا لم تكن صورة)</label><div class="cr"><input type="color" value="${n.bg}" oninput="S.news[${i}].bg=this.value;renderNews()"><span>${n.bg}</span></div></div>
  </div><!-- /ibox-body -->
</div>`;}).join('')}
<button class="abtn" onclick="S.news.push({cat:'خبر',catIcon:'📰',cBg:'#c9a227',cTx:'#0f3d26',bg:'#1a5c3a',title:'خبر جديد',date:'2026',excerpt:'المقتطف.',content:'',imgUrl:'',images:[]});renderNews();G('news');autoSave();">+ إضافة خبر</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

function addNewsImages(i, input){
  if(!input.files.length) return;
  if(!S.news[i].images) S.news[i].images=[];
  Array.from(input.files).forEach(function(file){
    S.news[i].images.push(URL.createObjectURL(file));
  });
  G('news');
  toast('تم إضافة '+input.files.length+' صورة ✓');
}

function uploadNewsImg(i, input){
  if(!input.files.length) return;
  const url = URL.createObjectURL(input.files[0]);
  S.news[i].imgUrl = url;
  if(!S.news[i].images) S.news[i].images = [];
  S.news[i].images.push(url);
  renderNews();
  G('news');
  toast('تم رفع الصورة ✓');
}

/* ─ EVENTS ─ */
function pEvents(){return`
<div class="sh">📅 الفعاليات (${S.events.length})</div>
<div class="fg"><label>الوسم</label><input type="text" value="فعاليات الجمعية" oninput="tx('p-evn-tag',this.value)"></div>
<div class="fg"><label>العنوان</label><input type="text" value="الفعاليات الحالية والقادمة" oninput="tx('p-evn-title',this.value)"></div>
<div class="fg"><label>لون شريط التاريخ</label><div class="cr"><input type="color" value="#0f3d26" oninput="document.querySelectorAll('.event-date').forEach(e=>e.style.background=this.value)"><span>#0f3d26</span></div></div>
<div class="dv"></div>
${S.events.map((e,i)=>`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${e.day} ${e.month} · ${e.title.substring(0,14)}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.events.splice(${i},1);renderEvents();G('events');autoSave()">🗑</button></div></div>
<div class="ibox-body">
<div class="g2" style="margin-bottom:4px;"><input class="is" value="${e.day}" placeholder="اليوم" oninput="S.events[${i}].day=this.value;renderEvents()"><input class="is" value="${e.month}" placeholder="الشهر" oninput="S.events[${i}].month=this.value;renderEvents()"></div>
<select class="is" onchange="S.events[${i}].status=this.value;renderEvents()"><option value="live" ${e.status==='live'?'selected':''}>🟢 جارٍ الآن</option><option value="upcoming" ${e.status==='upcoming'?'selected':''}>🔵 قادم</option><option value="done" ${e.status==='done'?'selected':''}>⚫ منتهي</option></select>
<input class="is" value="${e.title}" placeholder="العنوان" oninput="S.events[${i}].title=this.value;renderEvents()">
<input class="is" value="${e.meta}" placeholder="المكان والوقت" oninput="S.events[${i}].meta=this.value;renderEvents()">
</div>`).join('')}
<button class="abtn" onclick="S.events.push({day:'1',month:'مايو',title:'فعالية جديدة',meta:'المكان · الوقت',status:'upcoming'});renderEvents();G('events');autoSave();">+ إضافة فعالية</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ TESTIMONIALS ─ */
function pTest(){return`
<div class="sh">💬 الآراء (${S.testimonials.length})</div>
<div class="fg"><label>الوسم</label><input type="text" value="آراء المستفيدين" oninput="tx('p-tst-tag',this.value)"></div>
<div class="fg"><label>العنوان</label><input type="text" value="ماذا يقولون عنّا" oninput="tx('p-tst-title',this.value)"></div>
<div class="dv"></div>
<div class="sh">⏱ مدة عرض كل رأي (ثانية)</div>
<div class="fg"><div class="rr"><input type="range" min="1" max="10" value="${Math.min(10,Math.max(1,parseInt(S.scrollSpeed)||5))}" oninput="S.scrollSpeed=parseInt(this.value);tstStartAuto();this.nextElementSibling.textContent=this.value+'ث'"><span class="rv">${Math.min(10,Math.max(1,parseInt(S.scrollSpeed)||5))}ث</span></div>
<div style="font-size:9.5px;color:var(--TXM)">المدة بالثواني قبل الانتقال للرأي التالي</div></div>
<div class="dv"></div>
${S.testimonials.map((t,i)=>`<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">${t.name}</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.testimonials.splice(${i},1);renderTestimonials();G('testimonials');autoSave()">🗑</button></div></div>
<div class="ibox-body">
<textarea class="is" style="min-height:38px" oninput="S.testimonials[${i}].quote=this.value;renderTestimonials()">${t.quote}</textarea>
<div class="g2"><input class="is" value="${t.name}" placeholder="الاسم" oninput="S.testimonials[${i}].name=this.value;renderTestimonials()"><input class="is" value="${t.role}" placeholder="الدور والمدينة" oninput="S.testimonials[${i}].role=this.value;renderTestimonials()"></div>
<div class="g2"><input class="is" value="${t.initials}" placeholder="الأحرف الأولى" oninput="S.testimonials[${i}].initials=this.value;renderTestimonials()"><div class="cr"><input type="color" value="${t.color}" oninput="S.testimonials[${i}].color=this.value;renderTestimonials()"><span style="font-size:9px">لون الدائرة</span></div></div>
</div>`).join('')}
<button class="abtn" onclick="S.testimonials.push({name:'اسم جديد',role:'الدور · المدينة',quote:'رأي المستفيد.',color:'#1a5c3a',initials:'جد'});renderTestimonials();G('testimonials');autoSave();">+ إضافة رأي</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ─ SURVEYS ─ */
/* ── تصنيفات الاستطلاعات ── */
const survCats=[
  'جودة الخدمة','رضا المستفيدين','تقييم المشاريع','التعليم والتوعية',
  'الصيانة الوقائية','الطاقة والاستدامة','التطوع والمشاركة','عام','أخرى'
];
const qTypes=[
  {v:'likert',l:'مقياس ليكرت'},
  {v:'radio',l:'اختيار واحد'},
  {v:'checkbox',l:'اختيار متعدد'},
  {v:'dropdown',l:'قائمة منسدلة'},
  {v:'text',l:'نص حر'},
  {v:'file',l:'رفع مرفق'},
];

function pSurveys(){return`
<div class="sh">📋 إدارة الاستطلاعات (${S.surveys.length})</div>
<div class="note">انقر على أي استطلاع في الموقع لفتح نموذج التعبئة التفاعلي</div>
<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px;color:#856404;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
  <span>⚠️ إذا ظهرت بيانات قديمة في الموقع:</span>
  <button onclick="clearOldDBData()" style="background:#dc3545;color:#fff;border:none;border-radius:5px;padding:5px 12px;font-size:11px;cursor:pointer;font-family:Tajawal,sans-serif;">🗑 مسح البيانات القديمة من DB</button>
</div>
${S.surveys.map((sv,i)=>`
<div class="ibox">
  <div class="ibox-hd" onclick="toggleIbox(this)">
    <span class="ibox-t">${sv.icon} ${sv.title.substring(0,22)}...</span>
    <div style="display:flex;gap:4px;align-items:center;">
      <span class="ibox-arrow">▼</span>
      <button class="delbtn" onclick="event.stopPropagation();svDel(${i})">🗑</button>
    </div>
  </div>
  <div class="ibox-body">
  <div class="g2" style="margin-bottom:4px;">
    <div class="fg"><label>العنوان</label><input class="is" value="${sv.title}" oninput="S.surveys[${i}].title=this.value;renderSurveyList()"></div>
    <div class="fg"><label>الوصف</label><input class="is" value="${sv.desc||''}" oninput="S.surveys[${i}].desc=this.value;renderSurveyList()"></div>
  </div>
  <div class="g2" style="margin-bottom:4px;">
    <div class="fg"><label>الحالة</label>
      <select class="is" style="margin:0" onchange="S.surveys[${i}].status=this.value;renderSurveyList()">
        <option value="open" ${sv.status==='open'?'selected':''}>✅ مفتوح</option>
        <option value="closed" ${sv.status==='closed'?'selected':''}>🔒 مغلق</option>
      </select>
    </div>
    <div class="fg"><label>التصنيف</label>
      <select class="is" style="margin:0" onchange="S.surveys[${i}].cat=this.value;renderSurveyList()">
        ${survCats.map(c=>`<option ${sv.cat===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
  </div>
  <!-- بناء الأسئلة -->
  <div style="background:#f0f8f4;border-radius:7px;padding:8px;margin-bottom:5px;">
    <div style="font-size:10px;font-weight:600;color:var(--PL);margin-bottom:5px;">📝 الأسئلة (${sv.questions.length})</div>
    ${sv.questions.map((q,j)=>`
    <div style="background:var(--W);border-radius:6px;padding:8px;margin-bottom:5px;border:.5px solid var(--BD);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-size:10px;font-weight:600;color:var(--PL);">سؤال ${j+1}</span>
        <button class="delbtn" onclick="svDelQ(${i},${j})">🗑</button>
      </div>
      <input class="is" value="${q.text}" placeholder="نص السؤال" oninput="S.surveys[${i}].questions[${j}].text=this.value">
      <div class="g2" style="margin-top:4px;">
        <div>
          <label style="font-size:9px;color:var(--TXM);">نوع السؤال</label>
          <select class="is" style="margin:0;" onchange="svChangeQType(${i},${j},this.value)">
            ${qTypes.map(t=>`<option value="${t.v}" ${q.type===t.v?'selected':''}>${t.l}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;gap:6px;padding-bottom:2px;">
          <label style="font-size:9px;color:var(--TXM);display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" ${q.required?'checked':''} onchange="S.surveys[${i}].questions[${j}].required=this.checked"> إلزامي
          </label>
        </div>
      </div>
      <div id="sv-opts-${i}-${j}" style="margin-top:5px;${(q.type==='text'||q.type==='file')?'display:none;':''}">
        <label style="font-size:9px;color:var(--TXM);">الخيارات</label>
        <div class="sv-opts-inner">
        ${(q.opts||[]).map((opt,k)=>`<div style="display:flex;gap:3px;margin-bottom:3px;">
          <input class="is" style="flex:1;margin:0;" value="${opt}" oninput="S.surveys[${i}].questions[${j}].opts[${k}]=this.value">
          <button class="delbtn" onclick="svDelOpt(${i},${j},${k})">✕</button>
        </div>`).join('')}
        <button class="abtn" style="padding:4px;" onclick="svAddOpt(${i},${j})">+ إضافة خيار</button>
        </div>
      </div>
    </div>`).join('')}
    <button class="abtn" onclick="svAddQ(${i})">+ إضافة سؤال</button>
  </div>
</div>`).join('')}
<button class="abtn" onclick="svAdd()">+ إنشاء استطلاع جديد</button>

<div class="dv"></div>
<div class="sh">🔬 تقارير التحليل التحريري</div>
${S.analysisReports.map((r,i)=>`
<div class="ibox">
  <div class="ibox-hd">
    <span class="ibox-t" style="font-size:10px;">📊 ${r.title.substring(0,24)}...</span>
    <button class="delbtn" onclick="S.analysisReports.splice(${i},1);renderAnalysis();G('surveys')">🗑</button>
  </div>
  <input class="is" value="${r.title}" placeholder="عنوان التقرير" oninput="S.analysisReports[${i}].title=this.value">
  <div class="g2" style="margin-top:4px;">
    <input class="is" value="${r.date||''}" placeholder="التاريخ" oninput="S.analysisReports[${i}].date=this.value">
    <select class="is" onchange="S.analysisReports[${i}].survey=this.value;renderAnalysis();">
      <option value="">— اختر الاستطلاع المرتبط —</option>
      ${(S.surveys||[]).map(sv=>`<option value="${sv.title}" ${r.survey===sv.title?'selected':''}>${sv.title}</option>`).join('')}
    </select>
  </div>
  <textarea class="is" style="min-height:50px;margin-top:4px;" placeholder="نص التحليل..." oninput="S.analysisReports[${i}].text=this.value">${r.text||''}</textarea>
  <div style="margin-top:5px;">
    <label style="font-size:9px;color:var(--TXM);">مرفقات PDF</label>
    ${(r.pdfs||[]).map((p,k)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px;background:var(--BG);border-radius:5px;margin-bottom:3px;">
      <span style="font-size:10px;flex:1;">📄 ${p.name||p}</span>
      <button class="delbtn" onclick="S.analysisReports[${i}].pdfs.splice(${k},1);G('surveys')">✕</button>
    </div>`).join('')}
    <div style="border:1.5px dashed var(--A);border-radius:6px;padding:8px;text-align:center;cursor:pointer;font-size:10.5px;color:var(--TXM);" onclick="arUploadPdf(${i})">
      📎 انقر لرفع ملف PDF أو صورة — سيظهر في قسم التقارير بالموقع
    </div>
  </div>
</div>`).join('')}
<button class="abtn" onclick="arAdd()">+ إضافة تقرير تحليل</button>

<div class="dv"></div>
<div class="sh">🏛 توصيات مجلس الإدارة</div>
${S.boardDecisions.map((d,i)=>`
<div class="ibox">
  <div class="ibox-hd">
    <span class="ibox-t" style="font-size:10px;">${{rec:'توصية',dec:'قرار',act:'إجراء'}[d.type]||'توصية'}: ${d.title.substring(0,20)}...</span>
    <button class="delbtn" onclick="S.boardDecisions.splice(${i},1);renderBoard();G('surveys')">🗑</button>
  </div>
  <div class="fg" style="margin-bottom:6px;">
    <label style="font-size:9px;color:var(--TXM);font-weight:700;">📋 الاستطلاع المرتبط بهذه التوصية</label>
    <select class="is" style="margin:0;border-color:var(--A);" onchange="S.boardDecisions[${i}].survey=this.value;saveState();">
      <option value="">— اختر استطلاعاً —</option>
      ${(S.surveys||[]).map(sv=>`<option value="${sv.title}" ${d.survey===sv.title?'selected':''}>${sv.title}</option>`).join('')}
    </select>
    <div style="font-size:9px;color:var(--TXM);margin-top:2px;">ستظهر التوصية تحت اسم الاستطلاع في الموقع</div>
  </div>
  <div class="g2" style="margin-bottom:4px;">
    <div>
      <label style="font-size:9px;color:var(--TXM);">النوع</label>
      <select class="is" style="margin:0;" onchange="S.boardDecisions[${i}].type=this.value;renderBoard()">
        <option value="rec" ${d.type==='rec'?'selected':''}>توصية</option>
        <option value="dec" ${d.type==='dec'?'selected':''}>قرار</option>
        <option value="act" ${d.type==='act'?'selected':''}>إجراء</option>
      </select>
    </div>
    <div><label style="font-size:9px;color:var(--TXM);">التاريخ</label><input class="is" style="margin:0;" value="${d.date||''}" oninput="S.boardDecisions[${i}].date=this.value;renderBoard()"></div>
  </div>
  <input class="is" value="${d.title}" placeholder="عنوان التوصية" oninput="S.boardDecisions[${i}].title=this.value;renderBoard()">
  <div class="g2" style="margin-top:4px;">
    <input class="is" value="${d.resp||''}" placeholder="المسؤول" oninput="S.boardDecisions[${i}].resp=this.value;renderBoard()">
    <input class="is" value="${d.deadline||''}" placeholder="الموعد النهائي" oninput="S.boardDecisions[${i}].deadline=this.value;renderBoard()">
  </div>
  <textarea class="is" style="min-height:45px;margin-top:4px;" placeholder="نص التوصية..." oninput="S.boardDecisions[${i}].body=this.value;renderBoard()">${d.body||''}</textarea>
  <div style="margin-top:5px;">
    <label style="font-size:9px;color:var(--TXM);">مرفق التوصية (PDF)</label>
    ${(d.files||[]).map((f,k)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px;background:var(--BG);border-radius:5px;margin-bottom:3px;">
      <span style="font-size:10px;flex:1;">📄 ${f.name||f}</span>
      <button class="delbtn" onclick="S.boardDecisions[${i}].files.splice(${k},1);G('surveys')">✕</button>
    </div>`).join('')}
    <div style="border:1.5px dashed var(--A);border-radius:6px;padding:8px;text-align:center;cursor:pointer;font-size:10.5px;color:var(--TXM);" onclick="bdUploadFile(${i})">
      📎 انقر لرفع ملف PDF — سيظهر مع التوصية في الموقع
    </div>
  </div>
</div>`).join('')}
<button class="abtn" onclick="bdAdd()">+ إضافة توصية جديدة</button>
<button class="sbtn" onclick="saveState(true)">✓ حفظ الكل</button>`;}

/* دوال الاستطلاعات */
function clearOldDBData(){
  if(!confirm('سيتم مسح تقارير التحليل وتوصيات المجلس من DB. متأكد؟')) return;
  S.analysisReports=[];
  S.boardDecisions=[];
  fetch('/mosque/api/state.php',{method:'POST',headers:cmsAuthHeaders({'Content-Type':'application/json'}),body:JSON.stringify({S:S})})
  .then(function(){toast('✅ تم مسح البيانات القديمة من DB');G('surveys');})
  .catch(function(){toast('❌ خطأ في الحفظ');});
}
function svAdd(){S.surveys.push({id:Date.now(),icon:'📋',iconBg:'#e8f2ec',title:'استطلاع جديد',desc:'أضف وصفاً للاستطلاع',cat:'عام',status:'open',responses:0,questions:[]});renderSurveyList();G('surveys');toast('تمت إضافة الاستطلاع ✓');}
function svDel(i){S.surveys.splice(i,1);renderSurveyList();G('surveys');}
function svChangeQType(i,j,val){
  var q=S.surveys[i].questions[j];
  q.type=val;
  if(val!=='text'&&val!=='file'&&(!q.opts||q.opts.length===0)){
    if(val==='likert') q.opts=['ضعيف','مقبول','جيد','جيد جداً','ممتاز'];
    else q.opts=['خيار 1','خيار 2','خيار 3'];
  }
  if(val==='text'||val==='file') q.opts=[];
  var optsDiv=document.getElementById('sv-opts-'+i+'-'+j);
  if(optsDiv){
    optsDiv.style.display=(val==='text'||val==='file')?'none':'block';
    var inner=optsDiv.querySelector('.sv-opts-inner');
    if(inner&&val!=='text'&&val!=='file'){
      inner.innerHTML=(q.opts||[]).map(function(opt,k){
        return '<div style="display:flex;gap:3px;margin-bottom:3px;"><input class="is" style="flex:1;margin:0;" value="'+opt+'" oninput="S.surveys['+i+'].questions['+j+'].opts['+k+']=this.value"><button class="delbtn" onclick="svDelOpt('+i+','+j+','+k+')">✕</button></div>';
      }).join('')+'<button class="abtn" style="padding:4px;" onclick="svAddOpt('+i+','+j+')">إضافة خيار</button>';
    }
  } else {
    var qDiv=document.getElementById('sv-q-'+i+'-'+j);
    if(qDiv){
      var ex=qDiv.querySelector('[id^="sv-opts-"]');
      if(val==='text'||val==='file'){if(ex)ex.style.display='none';}
      else{
        var nh='<div id="sv-opts-'+i+'-'+j+'" style="margin-top:5px;"><label style="font-size:9px;">الخيارات</label><div class="sv-opts-inner">'+(q.opts||[]).map(function(opt,k){return'<div style="display:flex;gap:3px;margin-bottom:3px;"><input class="is" style="flex:1;margin:0;" value="'+opt+'" oninput="S.surveys['+i+'].questions['+j+'].opts['+k+']=this.value"><button class="delbtn" onclick="svDelOpt('+i+','+j+','+k+')">✕</button></div>';}).join('')+'<button class="abtn" style="padding:4px;" onclick="svAddOpt('+i+','+j+')">إضافة خيار</button></div></div>';
        if(ex)ex.outerHTML=nh;else qDiv.insertAdjacentHTML('beforeend',nh);
      }
    }
  }
}
function svAddQ(i){S.surveys[i].questions.push({text:'نص السؤال',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','ممتاز']});G('surveys');setTimeout(function(){var x=document.querySelectorAll('#pnl-surveys .ibox');if(x[i]){x[i].classList.add('open');x[i].scrollIntoView({behavior:'smooth',block:'nearest'});}},80);toast('تمت إضافة السؤال ✓');}
function svDelQ(i,j){S.surveys[i].questions.splice(j,1);G('surveys');setTimeout(function(){var x=document.querySelectorAll('#pnl-surveys .ibox');if(x[i])x[i].classList.add('open');},80);}
function svAddOpt(i,j){if(!S.surveys[i].questions[j].opts)S.surveys[i].questions[j].opts=[];S.surveys[i].questions[j].opts.push('خيار جديد');G('surveys');}
function svDelOpt(i,j,k){S.surveys[i].questions[j].opts.splice(k,1);G('surveys');}
/* دوال التقارير */
function arAdd(){if(!S.analysisReports)S.analysisReports=[];S.analysisReports.push({title:'تقرير تحليل جديد',date:'',survey:'',text:'',pdfs:[],files:[]});G('surveys');setTimeout(function(){var x=document.querySelectorAll('#pnl-surveys .ibox');var L=null;x.forEach(function(b){L=b;});if(L){L.classList.add('open');L.scrollIntoView({behavior:'smooth',block:'nearest'});}},80);saveState();toast('تمت إضافة التقرير ✓');}
function arUploadPdf(i){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='.pdf,image/*';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    if(!S.analysisReports[i].pdfs)S.analysisReports[i].pdfs=[];
    toast('جارٍ رفع الملف...');
    var fd=new FormData();fd.append('file',f);fd.append('type','pdf');
    fetch('/mosque/api/upload_file.php',{method:'POST',headers:cmsAuthHeaders(),body:fd})
    .then(function(r){return r.json();})
    .then(function(res){
      if(res.success&&res.url){
        var item={name:f.name,size:(f.size/1024/1024).toFixed(1)+' MB',url:res.url,mime:res.mime||''};
        S.analysisReports[i].pdfs.push(item);
        if(!S.analysisReports[i].files)S.analysisReports[i].files=[];
        S.analysisReports[i].files.push(item);
        saveState();
        toast('تم رفع الملف ✓');
        G('surveys');
      } else {
        toast('فشل رفع الملف: '+(res.error||'خطأ'));
      }
    }).catch(function(){toast('خطأ في رفع الملف');});
  };
  inp.click();
}
/* دوال التوصيات */
function bdAdd(){if(!S.boardDecisions)S.boardDecisions=[];S.boardDecisions.push({type:'rec',title:'توصية جديدة',date:'',survey:'',resp:'',deadline:'',body:'',files:[]});G('surveys');setTimeout(function(){var x=document.querySelectorAll('#pnl-surveys .ibox');var L=null;x.forEach(function(b){L=b;});if(L){L.classList.add('open');L.scrollIntoView({behavior:'smooth',block:'nearest'});}},80);saveState();toast('تمت إضافة التوصية ✓');}
function bdUploadFile(i){
  const inp=document.createElement('input');inp.type='file';inp.accept='.pdf';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    if(!S.boardDecisions[i].files)S.boardDecisions[i].files=[];
    var fd=new FormData();fd.append('file',f);fd.append('type','pdf');
    toast('جارٍ رفع ملف التوصية...');
    fetch('/mosque/api/upload_file.php',{method:'POST',headers:cmsAuthHeaders(),body:fd})
    .then(function(r){return r.json();}).then(function(res){
      if(res.success&&res.url){S.boardDecisions[i].files.push({name:f.name,size:(f.size/1024).toFixed(0)+' KB',url:res.url});renderBoard();G('surveys');toast('تم رفع المرفق ✓');}
      else toast('فشل رفع المرفق: '+(res.error||'خطأ'));
    }).catch(function(){toast('خطأ في رفع المرفق');});
  };
  inp.click();
}

/* ─ FOOTER ─ */
function pFooter(){
  const ftTabs=[
    {id:'ft-info',label:'معلومات'},
    {id:'ft-links',label:'روابط سريعة'},
    {id:'ft-pages',label:'محتوى الصفحات'},
    {id:'ft-social',label:'التواصل'},
  ];
  const active=window._ftTab||'ft-info';
  return`
<div class="sh">📍 الفوتر</div>
<div style="display:flex;gap:3px;margin-bottom:10px;background:var(--BG2);padding:3px;border-radius:8px;">
  ${ftTabs.map(t=>`<button onclick="window._ftTab='${t.id}';_renderSt('footer')" style="flex:1;padding:6px 3px;border-radius:6px;border:none;font-size:10px;cursor:pointer;font-family:'Tajawal',sans-serif;${active===t.id?'background:var(--PL);color:#fff;font-weight:600;':'background:none;color:var(--TXM);'}">${t.label}</button>`).join('')}
</div>

${active==='ft-info'?`
<div class="fg"><label>خلفية الفوتر</label><div class="cr"><input type="color" value="#082918" oninput="document.getElementById('p-ft-sec').style.background='linear-gradient(160deg,'+this.value+',#0f3d26)'"><span>#082918</span></div></div>
<div class="fg"><label>نص التعريف</label><textarea oninput="S.footer.about=this.value;tx('p-ft-about',this.value)">${S.footer.about}</textarea></div>
<div class="g2"><div class="fg"><label>رقم الهاتف</label><input type="text" value="${S.footer.phone}" oninput="S.footer.phone=this.value;renderFooter()"></div><div class="fg"><label>البريد الإلكتروني</label><input type="text" value="${S.footer.email}" oninput="S.footer.email=this.value;tx('p-ft-email',this.value)"></div></div>
<div class="fg"><label>العنوان</label><input type="text" value="${S.footer.address}" oninput="S.footer.address=this.value;renderFooter()"></div>
<div class="sh">🗺 رابط الخريطة</div>
<div class="fg"><label>رابط Google Maps</label><input type="url" value="${S.footer.mapUrl}" placeholder="https://maps.google.com/?q=..." oninput="S.footer.mapUrl=this.value"></div>
<div class="fg"><label>وصف الموقع</label><input type="text" value="${S.footer.mapLabel}" oninput="S.footer.mapLabel=this.value;tx('p-ft-map-lbl',this.value)"></div>
`:''}

${active==='ft-links'?`
<div class="note">كل رابط يمكن ربطه بقسم في الصفحة أو بصفحة حوكمة داخلية (وثائق، شكاوى، تسجيل)</div>
${S.footer.links.map((l,i)=>`<div class="ibox">
  <div class="ibox-hd"><span class="ibox-t">${l.label}</span><button class="delbtn" onclick="S.footer.links.splice(${i},1);renderFooter();_renderSt('footer')">🗑</button></div>
  <div class="fg"><label>نص الرابط</label><input class="is" value="${l.label}" placeholder="النص" oninput="S.footer.links[${i}].label=this.value;renderFooter()"></div>
  <div class="fg"><label>نوع الوجهة</label>
    <select class="is" onchange="S.footer.links[${i}].page=this.value;renderFooter()==='none'?null:this.value;S.footer.links[${i}].url=this.value==='none'?S.footer.links[${i}].url||'#':'#';renderFooter();_renderSt('footer')">
      <option value="none" ${!l.page?'selected':''}>🔗 رابط/قسم داخلي</option>
      <option value="docs" ${l.page==='docs'?'selected':''}>📄 صفحة الوثائق والتقارير</option>
      <option value="complaints" ${l.page==='complaints'?'selected':''}>💬 صفحة الشكاوى والمقترحات</option>
      <option value="register" ${l.page==='register'?'selected':''}>📋 صفحة نماذج التسجيل</option>
      ${(S.customPages||[]).map(p=>`<option value="cp:${p.id}" ${l.page===('cp:'+p.id)?'selected':''}>📄 ${p.title}</option>`).join('')}
    </select>
  </div>
  ${!l.page?`<div class="fg"><label>رابط القسم (id القسم في الصفحة)</label><input class="is" value="${l.url||'#'}" placeholder="مثال: projects أو surveys-sec" oninput="S.footer.links[${i}].url=this.value;renderFooter()"></div>`:'<div class="note" style="font-size:10px">سيفتح الصفحة الداخلية تلقائياً</div>'}
</div>`).join('')}
<button class="abtn" onclick="S.footer.links.push({label:'رابط جديد',url:'home'});renderFooter();_renderSt('footer')">+ إضافة رابط</button>
`:''}

${active==='ft-pages'?`
<div class="note">هنا تتحكم في محتوى صفحات الحوكمة الداخلية المرتبطة بالروابط السريعة</div>

<div class="sh">📄 صفحة الوثائق والتقارير</div>
${(S.pages.docs.pdfs||[]).map((p,i)=>`<div class="ibox"><div class="ibox-hd">
  <span class="ibox-t">📄 ${p.title}</span>
  <button class="delbtn" onclick="S.pages.docs.pdfs.splice(${i},1);_renderSt('footer')">🗑</button>
</div>
<input class="is" value="${p.title}" placeholder="اسم الوثيقة" oninput="S.pages.docs.pdfs[${i}].title=this.value">
<input class="is" value="${p.desc||''}" placeholder="الوصف" oninput="S.pages.docs.pdfs[${i}].desc=this.value">
<div class="g2" style="margin-top:4px;">
  <input class="is" value="${p.date||''}" placeholder="التاريخ" oninput="S.pages.docs.pdfs[${i}].date=this.value">
  <input class="is" value="${p.size||''}" placeholder="الحجم مثل 2.4 MB" oninput="S.pages.docs.pdfs[${i}].size=this.value">
</div>
<div style="margin-top:4px;border:1.5px dashed var(--A);border-radius:5px;padding:6px;text-align:center;cursor:pointer;font-size:10px;color:var(--TXM);" onclick="docsUploadPdf(${i})">📎 ${p.file?'✓ '+p.file+' — انقر لتغيير':'انقر لرفع ملف PDF'}</div>
</div>`).join('')}
<button class="abtn" onclick="S.pages.docs.pdfs.push({title:'وثيقة جديدة',desc:'',date:'2026',size:'',file:'',bg:'#e8f2ec',icon:'📄'});_renderSt('footer')">+ إضافة وثيقة</button>

<div class="sh">💬 صفحة الشكاوى والمقترحات</div>
<div class="fg"><label>عنوان الصفحة</label><input type="text" value="${S.pages.complaints.title||'الشكاوى والمقترحات'}" oninput="S.pages.complaints.title=this.value"></div>
<div class="fg"><label>نص توضيحي</label><textarea oninput="S.pages.complaints.sub=this.value" placeholder="نص يوضح هدف الصفحة">${S.pages.complaints.sub||''}</textarea></div>

<div class="sh">📋 صفحة نماذج التسجيل</div>
<div class="fg"><label>عنوان الصفحة</label><input type="text" value="${S.pages.register.title||'نماذج التسجيل'}" oninput="S.pages.register.title=this.value"></div>
${(S.pages.register.forms||[]).map((frm,i)=>`<div class="ibox"><div class="ibox-hd">
  <span class="ibox-t">${frm.label}</span>
  <button class="delbtn" onclick="S.pages.register.forms.splice(${i},1);_renderSt('footer')">🗑</button>
</div>
<div class="g2">
  <div class="fg"><label>اسم النموذج</label><input class="is" value="${frm.label}" oninput="S.pages.register.forms[${i}].label=this.value"></div>
  <div class="fg"><label>الأيقونة</label><input class="is" value="${frm.icon||'📋'}" oninput="S.pages.register.forms[${i}].icon=this.value"></div>
</div>
<div class="fg"><label>وصف النموذج</label><textarea class="is" style="min-height:36px;" oninput="S.pages.register.forms[${i}].desc=this.value">${frm.desc||''}</textarea></div>
<div style="font-size:9px;color:var(--PL);font-weight:600;margin-bottom:3px;">الحقول (${(frm.fields||[]).length})</div>
${(frm.fields||[]).map((fld,j)=>`<div style="display:flex;gap:3px;margin-bottom:3px;align-items:center;">
  <input class="is" style="flex:1;margin:0;" value="${fld.label}" placeholder="اسم الحقل" oninput="S.pages.register.forms[${i}].fields[${j}].label=this.value">
  <select style="font-size:10px;padding:5px;border-radius:5px;border:.5px solid var(--BD);font-family:'Tajawal',sans-serif;" onchange="S.pages.register.forms[${i}].fields[${j}].type=this.value">
    <option value="text" ${fld.type==='text'?'selected':''}>نص</option>
    <option value="number" ${fld.type==='number'?'selected':''}>رقم</option>
    <option value="select" ${fld.type==='select'?'selected':''}>قائمة</option>
    <option value="file" ${fld.type==='file'?'selected':''}>ملف</option>
    <option value="date" ${fld.type==='date'?'selected':''}>تاريخ</option>
    <option value="email" ${fld.type==='email'?'selected':''}>بريد</option>
    <option value="tel" ${fld.type==='tel'?'selected':''}>هاتف</option>
  </select>
  <label style="font-size:9px;color:var(--TXM);display:flex;align-items:center;gap:2px;cursor:pointer;white-space:nowrap;"><input type="checkbox" ${fld.required?'checked':''} onchange="S.pages.register.forms[${i}].fields[${j}].required=this.checked"> *</label>
  <button class="delbtn" onclick="S.pages.register.forms[${i}].fields.splice(${j},1);_renderSt('footer')">✕</button>
</div>`).join('')}
<button class="abtn" style="padding:4px;" onclick="S.pages.register.forms[${i}].fields.push({label:'حقل جديد',type:'text',required:false});_renderSt('footer')">+ حقل</button>
</div>`).join('')}
<button class="abtn" onclick="S.pages.register.forms.push({label:'نموذج جديد',icon:'📋',desc:'',fields:[{label:'الاسم الكامل',type:'text',required:true},{label:'رقم الهاتف',type:'tel',required:true}]});_renderSt('footer')">+ إضافة نموذج تسجيل</button>
`:''}

${active==='ft-social'?`
<div class="sh">🌐 وسائل التواصل الاجتماعي</div>
${S.footer.socials.map((s,i)=>`<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
<select style="width:36px;font-size:13px;border:none;background:#f8f6f2;border-radius:4px;padding:2px;" onchange="S.footer.socials[${i}].icon=this.value;renderFooter()">${['𝕏','📷','▶','💬','✉','📘','💼','📌'].map(ic=>`<option ${ic===s.icon?'selected':''}>${ic}</option>`).join('')}</select>
<input style="flex:1;padding:5px 7px;border-radius:5px;border:1px solid var(--BD);font-size:10.5px;font-family:'Tajawal',sans-serif;background:#fafaf8;" value="${s.url}" placeholder="الرابط" oninput="S.footer.socials[${i}].url=this.value">
<button class="delbtn" onclick="S.footer.socials.splice(${i},1);renderFooter();_renderSt('footer')">🗑</button>
</div>`).join('')}
<button class="abtn" onclick="S.footer.socials.push({icon:'📌',label:'جديد',url:'https://'});renderFooter();_renderSt('footer')">+ إضافة وسيلة</button>
`:''}

<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

function docsUploadPdf(i){
  const inp=document.createElement('input');inp.type='file';inp.accept='.pdf';
  inp.onchange=e=>{if(e.target.files[0]){
    const f=e.target.files[0];
    S.pages.docs.pdfs[i].file=f.name;
    S.pages.docs.pdfs[i].fileUrl=URL.createObjectURL(f);
    S.pages.docs.pdfs[i].size=(f.size/1024/1024).toFixed(1)+' MB';
    _renderSt('footer');toast('تم رفع الملف ✓');
  }};inp.click();
}

/* ─ SECTIONS ─ */
function pSections(){return`
<div class="sh">☰ إخفاء / إظهار الأقسام</div>
${[['p-achiev-sec','الإنجازات','📊'],['p-stats-sec','الأرقام','🔢'],['projects','المشاريع','🏗'],['p-par-sec','الشركاء','🤝'],['news','الأخبار','📰'],['p-evn-sec','الفعاليات','📅'],['p-tst-sec','الآراء','💬'],['surveys-sec','الاستطلاعات','📋'],['p-ft-sec','الفوتر','📍']].map(([id,nm,ic])=>`
<div class="tr"><span class="tl">${ic} ${nm}</span><div class="tog on" onclick="toggleSec('${id}',this)"></div></div>`).join('')}
<div class="dv"></div>
<div class="sh">📐 مسافة الأقسام</div>
<div class="fg"><div class="rr"><input type="range" min="24" max="80" value="64" oninput="document.querySelectorAll('.section').forEach(e=>{e.style.paddingTop=this.value+'px';e.style.paddingBottom=this.value+'px'});this.nextElementSibling.textContent=this.value+'px'"><span class="rv">64px</span></div></div>
<button class="sbtn" onclick="saveState(true)">✓ حفظ</button>`;}

/* ════════════ UTIL ════════════ */
function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`${r},${g},${b}`;}

/* ════════════ Registration Forms Panel ════════════ */
function pRegForms(){
  if(!S.pages) S.pages={};
  if(!S.pages.register) S.pages.register={forms:[]};
  var forms = S.pages.register.forms || [];
  var h = '';
  h += '<div class="pnl-notice">💡 كل نموذج يظهر كبطاقة في صفحة النماذج — يمكن للزوار تعبئتها وإرسالها</div>';
  h += '<div class="pnl-section-title">النماذج (' + forms.length + ')</div>';
  for(var i=0;i<forms.length;i++){
    var f=forms[i];
    var fields=f.fields||[];
    var fUrl='/mosque/?form='+encodeURIComponent(f.label||'');
    h+='<div class="pnl-card">';
    /* رأس */
    h+='<div class="pnl-card-hdr">';
    h+='<div class="pnl-card-icon">'+(f.icon||'📋')+'</div>';
    h+='<div class="pnl-card-info">';
    h+='<div class="pnl-card-title">'+(f.label||'نموذج')+'</div>';
    h+='<div class="pnl-card-sub">'+fields.length+' حقل'+(f.desc?' — '+f.desc:'')+'</div>';
    h+='</div>';
    h+='<div class="pnl-card-actions"><span class="pnl-arrow">▼</span>';
    h+='<button class="delbtn" data-i="'+i+'" onclick="event.stopPropagation();S.pages.register.forms.splice(parseInt(this.dataset.i),1);saveState(true);_renderSt(\'regforms\')">🗑</button>';
    h+='</div></div>';
    /* جسم */
    h+='<div class="pnl-card-body">';
    /* رابط النموذج مع زر نسخ */
    h+='<div style="background:#e8f2ec;border-radius:8px;padding:10px 12px;margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
    h+='<span style="font-size:12px;color:#0f3d26;flex:1;font-family:monospace;word-break:break-all;">'+fUrl+'</span>';
    h+='<button data-url="'+fUrl+'" onclick="event.stopPropagation();var u=this.dataset.url;if(navigator.clipboard){navigator.clipboard.writeText(location.origin+u).then(function(){toast(\'✅ تم نسخ الرابط\');});}else{var inp=document.createElement(\'input\');inp.value=location.origin+u;document.body.appendChild(inp);inp.select();document.execCommand(\'copy\');document.body.removeChild(inp);toast(\'✅ تم نسخ الرابط\');}" style="background:#0f3d26;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:Tajawal,sans-serif;white-space:nowrap;">📋 نسخ الرابط</button>';
    h+='</div>';
    /* إعدادات النموذج */
    h+='<div class="pnl-grid2">';
    h+='<div class="pnl-field"><label>الأيقونة</label><select class="is" data-i="'+i+'" onchange="S.pages.register.forms[parseInt(this.dataset.i)].icon=this.value;_renderSt(\'regforms\');autoSave()">';
    var ics=['📋','👤','🙋','🎓','📝','📊','🏛','💼'];
    for(var ic=0;ic<ics.length;ic++) h+='<option '+(ics[ic]===(f.icon||'📋')?'selected':'')+'>'+ics[ic]+'</option>';
    h+='</select></div>';
    h+='<div class="pnl-field"><label>اسم النموذج</label><input class="is" value="'+(f.label||'')+'" data-i="'+i+'" oninput="S.pages.register.forms[parseInt(this.dataset.i)].label=this.value;autoSave()"></div>';
    h+='</div>';
    h+='<div class="pnl-field"><label>وصف النموذج</label><input class="is" value="'+(f.desc||'')+'" placeholder="وصف مختصر..." data-i="'+i+'" oninput="S.pages.register.forms[parseInt(this.dataset.i)].desc=this.value;autoSave()"></div>';
    /* الحقول */
    h+='<div class="pnl-section-title" style="margin-top:14px;">الحقول ('+fields.length+')</div>';
    for(var j=0;j<fields.length;j++){
      var fld=fields[j];
      h+='<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px;margin-bottom:8px;">';
      h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
      h+='<span style="font-size:13px;font-weight:600;color:#0f3d26;">'+(fld.label||'حقل')+'</span>';
      h+='<button data-i="'+i+'" data-j="'+j+'" onclick="S.pages.register.forms[parseInt(this.dataset.i)].fields.splice(parseInt(this.dataset.j),1);saveState(true);_renderSt(\'regforms\')" style="background:#fee2e2;color:#dc2626;border:none;border-radius:5px;padding:2px 8px;font-size:11px;cursor:pointer;font-family:inherit;">حذف</button>';
      h+='</div>';
      h+='<div class="pnl-grid2">';
      h+='<div class="pnl-field"><label>اسم الحقل</label><input class="is" value="'+(fld.label||'')+'" data-i="'+i+'" data-j="'+j+'" oninput="S.pages.register.forms[parseInt(this.dataset.i)].fields[parseInt(this.dataset.j)].label=this.value;autoSave()"></div>';
      h+='<div class="pnl-field"><label>النوع</label><select class="is" data-i="'+i+'" data-j="'+j+'" onchange="S.pages.register.forms[parseInt(this.dataset.i)].fields[parseInt(this.dataset.j)].type=this.value;_renderSt(\'regforms\');autoSave()">';
      var typs=[['text','نص'],['email','بريد'],['tel','هاتف'],['number','رقم'],['date','تاريخ'],['select','قائمة'],['textarea','نص طويل'],['checkbox','موافقة'],['file','ملف']];
      for(var t=0;t<typs.length;t++) h+='<option value="'+typs[t][0]+'" '+(fld.type===typs[t][0]?'selected':'')+'>'+typs[t][1]+'</option>';
      h+='</select></div>';
      h+='</div>';
      h+='<div class="pnl-grid2">';
      h+='<div class="pnl-field"><label>التلميح</label><input class="is" value="'+(fld.placeholder||'')+'" data-i="'+i+'" data-j="'+j+'" oninput="S.pages.register.forms[parseInt(this.dataset.i)].fields[parseInt(this.dataset.j)].placeholder=this.value;autoSave()"></div>';
      h+='<div class="pnl-field" style="display:flex;align-items:center;gap:8px;padding-top:18px;">';
      h+='<input type="checkbox" id="rq_'+i+'_'+j+'" '+(fld.required?'checked':'')+' data-i="'+i+'" data-j="'+j+'" onchange="S.pages.register.forms[parseInt(this.dataset.i)].fields[parseInt(this.dataset.j)].required=this.checked;autoSave()">';
      h+='<label for="rq_'+i+'_'+j+'" style="font-size:13px;cursor:pointer;">إلزامي</label></div>';
      h+='</div>';
      if(fld.type==='select'){
        var optsVal=Array.isArray(fld.options)?fld.options.join('\n'):(fld.options||'');
        h+='<div class="pnl-field"><label>خيارات (سطر لكل خيار)</label><textarea class="is" rows="3" data-i="'+i+'" data-j="'+j+'" oninput="S.pages.register.forms[parseInt(this.dataset.i)].fields[parseInt(this.dataset.j)].options=this.value.split(\'\\n\').filter(function(x){return x.trim();});autoSave()" style="resize:vertical">'+optsVal+'</textarea></div>';
      }
      h+='</div>';
    }
    h+='<button class="pnl-add-btn" data-i="'+i+'" onclick="event.stopPropagation();S.pages.register.forms[parseInt(this.dataset.i)].fields.push({label:\'حقل جديد\',type:\'text\',required:false,placeholder:\'\'});saveState(true);_renderSt(\'regforms\')">+ إضافة حقل</button>';
    h+='<div class="pnl-save-bar"><button class="adm-btn adm-btn-ghost adm-btn-sm" onclick="saveState(true);toast(\'✓ تم الحفظ\')">💾 حفظ الآن</button></div>';
    h+='</div></div>';
  }
  h+='<div style="margin-top:10px;"><button class="pnl-add-btn" onclick="S.pages.register.forms.push({icon:\'📋\',label:\'نموذج جديد\',desc:\'\',fields:[]});saveState(true);_renderSt(\'regforms\')">+ إضافة نموذج</button></div>';
  /* قسم عرض البيانات */
  h+='<div style="margin-top:16px;background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:14px;">';
  h+='<div class="pnl-section-title">📊 بيانات المسجلين</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">';
  h+='<button onclick="loadFormEntries(String())" style="padding:7px 14px;background:#0f3d26;color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:Tajawal,sans-serif;font-size:13px;">📋 الكل</button>';
  var fms=S.pages&&S.pages.register?S.pages.register.forms||[]:[];
  for(var fi=0;fi<fms.length;fi++){
    h+='<button data-fkey="'+fms[fi].label+'" onclick="loadFormEntries(this.dataset.fkey)" style="padding:7px 14px;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;border-radius:7px;cursor:pointer;font-family:Tajawal,sans-serif;font-size:13px;">'+fms[fi].label+'</button>';
  }
  h+='</div>';
  h+='<div id="form-entries-container"><p style="color:#6b7280;font-size:13px;">اضغط على نموذج لعرض بياناته</p></div>';
  h+='</div>';
  return h;
}

/* ════════════ WhatsApp ════════════ */
/* ══════════ نماذج التسجيل ══════════ */
function openRegPage(){
  const page = document.getElementById('reg-form-page');
  const body = document.getElementById('reg-page-body');
  const title = document.getElementById('reg-page-title');
  if(!page||!body) return;
  title.textContent = '📋 نماذج التسجيل';
  if(!S.pages||!S.pages.register||!S.pages.register.forms||!S.pages.register.forms.length){
    body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--TXM)">لا توجد نماذج مضافة بعد</div>';
  } else {
    body.innerHTML = `<div class="reg-forms-list">${S.pages.register.forms.map((f,i)=>{
      const slug = (f.label||'form').replace(/\s+/g,'-');
      const base = window.location.href.split('#')[0];
      const link = base + '?form=' + slug;
      return `<div class="reg-form-card">
        <div class="reg-form-icon">${f.icon||'📋'}</div>
        <div class="reg-form-title">${f.label}</div>
        <div class="reg-form-desc">${f.desc||''}</div>
        <button class="reg-form-open-btn" onclick="openRegFormByLabel('${f.label}')">تقديم طلب ←</button>
        <button onclick="copyFormLink('${f.label}')" style="margin-top:8px;width:100%;padding:7px;background:transparent;border:1.5px solid var(--P);color:var(--P);border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">🔗 نسخ رابط النموذج</button>
      </div>`;
    }).join('')}</div>`;
  }
  page.classList.add('open');
  document.body.style.overflow='hidden';
}

function copyFormLink(label){
  var slug = (label||'form').replace(/\s+/g,'-');
  var base = window.location.href.split('#')[0].split('?')[0];
  var link = base + '?form=' + slug;
  if(navigator&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){ toast('تم نسخ الرابط ✓'); });
  } else {
    var ta=document.createElement('textarea');
    ta.value=link; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast('تم نسخ الرابط ✓');
  }
}

function openRegFormByLabel(labelParam){
  var forms=(S.pages&&S.pages.register&&S.pages.register.forms)||[];
  if(!forms.length){setTimeout(function(){openRegFormByLabel(labelParam);},600);return;}
  /* محاولة مطابقة مع decode وencode */
  var decoded=''; try{decoded=decodeURIComponent(labelParam);}catch(e){decoded=labelParam;}
  var idx=-1;
  for(var i=0;i<forms.length;i++){
    var fl=forms[i].label||'';
    if(fl===labelParam||fl===decoded||encodeURIComponent(fl)===encodeURIComponent(labelParam)){idx=i;break;}
  }
  if(idx>=0) openRegForm(idx);
  else if(forms.length>0) openRegPage();
}

function openRegForm(idx){
  const f = (S.pages&&S.pages.register&&S.pages.register.forms) ? S.pages.register.forms[idx] : null;
  if(!f) return;
  const body = document.getElementById('reg-page-body');
  const title = document.getElementById('reg-page-title');
  title.textContent = `📋 ${f.label}`;

  const fields = (f.fields||[]).map((field,fi)=>`
    <div class="reg-field">
      <label>${field.required?'<span class="req">*</span>':''}${field.label||field.name||'حقل'}</label>
      ${field.type==='file'
        ? `<input type="file" ${field.required?'required':''} style="padding:6px">`
        : field.type==='select'
          ? `<select ${field.required?'required':''}>${(field.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`
          : field.type==='textarea'
            ? `<textarea rows="3" placeholder="${field.placeholder||''}" ${field.required?'required':''}></textarea>`
            : `<input type="${field.type||'text'}" placeholder="${field.placeholder||''}" ${field.required?'required':''}>`}
    </div>`).join('');

  var fSlug = (f.label||'form').replace(/\s+/g,'-');
  var fBase = window.location.href.split('#')[0];
  var fLink = fBase.split('?')[0] + '?form=' + fSlug;
  body.innerHTML = `
    <div class="reg-form-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <button onclick="openRegPage()" style="background:none;border:none;color:var(--P);cursor:pointer;font-size:13px;font-family:inherit;">← جميع النماذج</button>
        <button onclick="copyFormLink('${f.label}')" style="padding:5px 12px;background:transparent;border:1.5px solid var(--P);color:var(--P);border-radius:7px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit;">🔗 نسخ رابط النموذج</button>
      </div>
      <h2>${f.icon||'📋'} ${f.label}</h2>
      ${f.desc?`<p style="color:var(--TXM);font-size:13px;margin-bottom:20px;">${f.desc}</p>`:''}
      <div style="background:#e8f2ec;border-radius:8px;padding:10px 12px;margin-bottom:16px;font-size:11.5px;color:var(--PL);">
        🔗 رابط مباشر لهذا النموذج:<br>
        <span style="font-family:monospace;font-size:10px;word-break:break-all;color:var(--P);">${fLink}</span>
      </div>
      <form onsubmit="submitRegForm(event,${idx})">
        ${fields}
        <button type="submit" class="reg-submit-btn">📨 إرسال الطلب</button>
      </form>
    </div>`;
}


function loadFormEntries(formKey){
  var ctr=document.getElementById('form-entries-container');
  if(!ctr) return;
  ctr.innerHTML='<p style="color:#6b7280;font-size:13px;">جارٍ التحميل...</p>';
  var url='/mosque/api/registration_entry.php'+(formKey?'?form_key='+encodeURIComponent(formKey):'');
  fetch(url,{headers:cmsAuthHeaders()}).then(function(r){return r.json();}).then(function(res){
    if(!res.success){ctr.innerHTML='<p style="color:#dc2626">❌ '+res.error+'</p>';return;}
    var entries=res.entries||[];
    if(!entries.length){
      ctr.innerHTML='<p style="color:#6b7280;font-size:13px;text-align:center;padding:20px;">لا توجد بيانات مسجلة بعد</p>';
      return;
    }

    var h='';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    h+='<span style="font-size:13px;color:#6b7280;">الإجمالي: <strong>'+res.total+'</strong> تسجيل</span>';
    h+='</div>';

    /* جدول مع كل الحقول */
    /* أولاً: نجمع كل مفاتيح الحقول من جميع الصفوف */
    var allKeys={};
    for(var i=0;i<entries.length;i++){
      var d=entries[i].entry_data||{};
      var ks=Object.keys(d);
      for(var k=0;k<ks.length;k++) allKeys[ks[k]]=true;
    }
    var cols=Object.keys(allKeys);

    if(cols.length>0){
      /* جدول */
      h+='<div style="overflow-x:auto;border-radius:8px;border:1px solid #e5e7eb;">';
      h+='<table style="width:100%;border-collapse:collapse;font-size:12px;">';

      /* رأس الجدول */
      h+='<tr style="background:#0f3d26;color:#fff;">';
      h+='<th style="padding:9px 12px;text-align:right;white-space:nowrap">#</th>';
      h+='<th style="padding:9px 12px;text-align:right;white-space:nowrap">النموذج</th>';
      for(var c=0;c<cols.length;c++){
        h+='<th style="padding:9px 12px;text-align:right;white-space:nowrap">'+cols[c]+'</th>';
      }
      h+='<th style="padding:9px 12px;text-align:right;white-space:nowrap">تاريخ التسجيل</th>';
      h+='</tr>';

      /* صفوف البيانات */
      for(var i=0;i<entries.length;i++){
        var e2=entries[i];
        var d2=e2.entry_data||{};
        var bg=i%2===0?'#fff':'#f8faf9';
        h+='<tr style="background:'+bg+';border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background=\'#e8f2ec\'" onmouseout="this.style.background=\''+bg+'\'">';
        h+='<td style="padding:8px 12px;color:#6b7280;font-weight:600;">'+(res.total-i)+'</td>';
        h+='<td style="padding:8px 12px;font-weight:700;color:#0f3d26;">'+e2.form_label+'</td>';
        for(var c2=0;c2<cols.length;c2++){
          var val=d2[cols[c2]]||'';
          var rendered=val?renderEntryValue(val):'<span style="color:#d1d5db">—</span>';
          h+='<td style="padding:8px 12px;color:#374151;max-width:240px;">'+rendered+'</td>';
        }
        /* تنسيق التاريخ */
        var dt=e2.submitted_at||'';
        h+='<td style="padding:8px 12px;color:#6b7280;font-size:11px;white-space:nowrap;">'+dt+'</td>';
        h+='</tr>';
      }
      h+='</table></div>';

    } else {
      /* البيانات موجودة لكن بدون حقول مُعرَّفة - عرض كبطاقات */
      h+='<div style="display:flex;flex-direction:column;gap:8px;">';
      for(var i=0;i<entries.length;i++){
        var e3=entries[i];
        h+='<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">';
        h+='<div style="display:flex;justify-content:space-between;margin-bottom:6px;">';
        h+='<span style="font-weight:700;color:#0f3d26;">'+e3.form_label+'</span>';
        h+='<span style="font-size:11px;color:#6b7280;">'+e3.submitted_at+'</span>';
        h+='</div>';
        var obj=e3.entry_data||{};Object.keys(obj).forEach(function(k){h+='<div style="font-size:12px;padding:4px 0;border-bottom:1px solid #f3f4f6;"><strong>'+esc(k)+':</strong> '+renderEntryValue(obj[k])+'</div>';});
        h+='</div>';
      }
      h+='</div>';
    }

    ctr.innerHTML=h;
  }).catch(function(err){
    ctr.innerHTML='<p style="color:#dc2626">❌ خطأ في الاتصال</p>';
  });
}

async function submitRegForm(e, idx){
  e.preventDefault();
  var form = e.target;
  var f = (S.pages&&S.pages.register&&S.pages.register.forms) ? S.pages.register.forms[idx] : null;
  var formLabel = f ? f.label : 'نموذج';
  var btn=form.querySelector('button[type=submit]');
  if(btn){btn.disabled=true;btn.textContent='جارٍ الإرسال...';}

  try{
    var entry = { form: formLabel, time: new Date().toLocaleString('ar-SA'), data: {} };
    var inputs = form.querySelectorAll('input:not([type=submit]),select,textarea');
    var fields = (f&&f.fields) ? f.fields : [];
    for(var i=0;i<inputs.length;i++){
      var label = (fields[i]&&fields[i].label) ? fields[i].label : ('حقل '+(i+1));
      if(inputs[i].type==='file'){
        entry.data[label] = inputs[i].files.length ? await uploadEntryFile(inputs[i].files[0]) : '';
      } else {
        entry.data[label] = inputs[i].value;
      }
    }

    var stKey = 'reg_entries_local';
    var stExist = [];
    try{ stExist = JSON.parse(localStorage.getItem(stKey)||'[]'); }catch(ex){}
    stExist.unshift(entry);
    localStorage.setItem(stKey, JSON.stringify(stExist.slice(0,500)));

    await fetch('/mosque/api/registration_entry.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({form_key: formLabel, form_label: formLabel, data: entry.data, submitted_at: entry.time})
    });

    toast('تم إرسال طلبك بنجاح — سيتم التواصل معك قريباً ✓');
    setTimeout(function(){ closeRegPage(); }, 1500);
  }catch(err){
    toast('تعذر إرسال النموذج أو المرفق، حاول مرة أخرى');
    if(btn){btn.disabled=false;btn.textContent='📨 إرسال الطلب';}
  }
}

function closeRegPage(){
  var page = document.getElementById('reg-form-page');
  if(page){
    page.classList.remove('open');
    page.style.zIndex = '';
  }
  document.body.style.overflow='';
  if(window.location.hash && window.location.hash.indexOf('#form-')===0){
    history.pushState({},'',window.location.pathname+window.location.search);
  }
}

function openWhatsApp(){
  if(!S.wa||!S.wa.show){return;}
  const phone=(S.wa.phone||'').replace(/[^0-9]/g,'');
  const url='https://wa.me/'+phone+'?text='+encodeURIComponent('السلام عليكم، أود التواصل مع جمعية رفد المساجد للعناية بالمساجد');
  window.open(url,'_blank');
}
function renderWA(){
  const el=document.getElementById('wa-float');
  const lbl=document.getElementById('wa-label');
  if(!el)return;
  el.style.display=(S.wa&&S.wa.show)?'flex':'none';
  if(lbl&&S.wa)lbl.textContent=S.wa.label||'تواصل معنا';
}


/* ════ الصفحات المخصصة ════ */
function openCustomPage(pageId){
  if(!S.customPages||S.customPages.length===0){setTimeout(function(){openCustomPage(pageId);},700);return;}
  var pid=String(pageId);
  var page=null;
  for(var i=0;i<S.customPages.length;i++){if(String(S.customPages[i].id)===pid){page=S.customPages[i];break;}}
  if(!page) return;
  var ov=document.getElementById('custom-page-overlay');
  var bd=document.getElementById('custom-page-body');
  var hd=document.getElementById('custom-page-hdr-title');
  if(!ov||!bd) return;
  if(hd) hd.textContent=page.title||'';
  var h='<div class="custom-page-title">'+(page.title||'')+'</div>';
  if(page.intro) h+='<p class="custom-page-intro">'+(page.intro||'')+'</p>';
  var blocks=page.blocks||[];
  for(var j=0;j<blocks.length;j++){
    var b=blocks[j];
    h+='<div class="cp-block">';
    if(b.type==='heading') h+='<h3 style="font-size:20px;font-weight:700;color:var(--P);">'+(b.content||'')+'</h3>';
    else if(b.type==='text') h+='<div class="cp-block-text">'+(b.content||'')+'</div>';
    else if(b.type==='image'&&b.url){ h+='<img src="'+b.url+'" class="cp-block-img" alt="">'; if(b.caption) h+='<div style="font-size:11.5px;color:var(--TXM);text-align:center;margin-top:5px;">'+(b.caption||'')+'</div>'; }
    else if(b.type==='pdf'){
      h+='<div class="cp-block-pdf-item" id="pdf-'+j+'">';
      h+='<div style="font-size:28px;">📄</div>';
      h+='<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--P);">'+(b.name||'ملف PDF')+'</div><div style="font-size:11.5px;color:var(--TXM);">'+(b.desc||'')+'</div></div>';
      h+='<button style="padding:6px 14px;background:var(--P);color:#fff;border-radius:6px;font-size:12px;border:none;cursor:pointer;font-family:inherit;">تحميل</button>';
      h+='</div>';
    } else if(b.type==='images'){
      var imgs=[]; try{imgs=JSON.parse(b.url||'[]');}catch(e){imgs=[];}
      if(b.caption) h+='<div style="font-weight:700;color:var(--P);margin-bottom:8px;">'+b.caption+'</div>';
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:8px;">';
      for(var gi=0;gi<imgs.length;gi++) h+='<img src="'+imgs[gi]+'" style="width:100%;height:130px;object-fit:cover;border-radius:8px;cursor:pointer;" alt="" onclick="var u=this.src;window.open(u,String.fromCharCode(95,98,108,97,110,107))">';
      h+='</div>';
    } else if(b.type==='pdfs'){
      var pdfs=[]; try{pdfs=JSON.parse(b.url||'[]');}catch(e){pdfs=[];}
      if(b.desc) h+='<div style="font-weight:700;color:var(--P);margin-bottom:8px;">'+b.desc+'</div>';
      var _b5=['#f0f7ff','#fff7ed','#f0fdf4','#fdf4ff','#fffbeb','#f0fdfa'];
        var _i5=['&#128203;','&#128202;','&#128200;','&#128196;','&#128450;','&#128240;'];
        h+='<div class="cp-pdf-grid">';
        for(var pj=0;pj<pdfs.length;pj++){
          var _pf=pdfs[pj],_pu=_pf.url||_pf.data||'',_pn=_pf.name||'PDF';
          h+='<div class="cp-pdf-card">';
          h+='<div class="cp-pdf-icon-area" style="background:'+_b5[pj%_b5.length]+'">';
          h+='<span style="font-size:88px;opacity:.12;position:absolute;">&#128196;</span>';
          h+='<span style="font-size:50px;position:relative;">'+_i5[pj%_i5.length]+'</span>';
          h+='</div>';
          h+='<div class="cp-pdf-body">';
          h+='<div class="cp-pdf-name">'+_pn+'</div>';
          h+='<div class="cp-pdf-meta">&#128196; PDF</div>';
          h+='<div class="cp-pdf-actions">';
          h+='<a href="'+_pu+'" target="_blank" class="cp-pdf-view">&#128065; &#1605;&#1593;&#1575;&#1610;&#1606;&#1577;</a>';
          h+='<a href="'+_pu+'" download="'+_pn+'" class="cp-pdf-dl">&#11015; &#1578;&#1581;&#1605;&#1610;&#1604;</a>';
          h+='</div></div></div>';
        }
        h+='</div>';
    }
    h+='</div>';
  }
  bd.innerHTML=h;
  /* ربط أحداث PDF بعد إدراج HTML */
  for(var k=0;k<blocks.length;k++){
    if(blocks[k].type==='pdf'&&blocks[k].url){
      (function(url){ var el=document.getElementById('pdf-'+k); if(el) el.onclick=function(){window.open(url,'_blank');}; })(blocks[k].url);
    }
  }
  ov.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCustomPage(){
  var el=document.getElementById('custom-page-overlay');
  if(el) el.classList.remove('open');
  document.body.style.overflow='';
}

/* ════ لوحة التحكم المنفصلة ════ */
var _cmsTab='global';
function openCMSStandalone(){
  var el=document.getElementById('cms-standalone');
  if(!el) return;
  el.classList.add('open');
  document.body.style.overflow='hidden';
  _cmsTab=_cmsTab||'overview'; _cmsTab=_cmsTab||'overview'; setTimeout(function(){ _renderSt(_cmsTab); },30);
}
function closeCMSStandalone(){
  var el=document.getElementById('cms-standalone');
  if(el) el.classList.remove('open');
  document.body.style.overflow='';
}
function _renderSt(tab){
  _cmsTab=tab||_cmsTab;
  var sb=document.getElementById('cms-st-sidebar');
  var ct=document.getElementById('cms-st-content');
  var badge=document.getElementById('adm-cur-section');
  if(!sb||!ct) return;

  var menus=[
    {sec:'الرئيسية',items:[{id:'overview',icon:'📊',label:'لوحة المعلومات'},{id:'global',icon:'⚙',label:'إعدادات عامة'},{id:'hero',icon:'🏠',label:'الشاشة الرئيسية'}]},
    {sec:'المحتوى',items:[{id:'news',icon:'📰',label:'الأخبار'},{id:'projects',icon:'🏗',label:'المشاريع'},{id:'events',icon:'📅',label:'الفعاليات'},{id:'testimonials',icon:'💬',label:'الآراء'},{id:'partners',icon:'🤝',label:'الشركاء'}]},
    {sec:'الأرقام',items:[{id:'achiev',icon:'🏆',label:'الإنجازات'},{id:'stats',icon:'🔢',label:'الأرقام'}]},
    {sec:'التفاعل',items:[{id:'surveys',icon:'📋',label:'الاستطلاعات'},{id:'regforms',icon:'📝',label:'النماذج'}]},
    {sec:'الموقع',items:[{id:'navbar',icon:'🔝',label:'القوائم'},{id:'footer',icon:'📍',label:'الفوتر'},{id:'custompages',icon:'📄',label:'الصفحات'},{id:'sections',icon:'☰',label:'الأقسام'}]},
    {sec:'الإدارة',items:[{id:'users',icon:'👥',label:'المستخدمون'},{id:'maintenance',icon:'🔒',label:'الصيانة'}]},
  ];

  var sh='';
  for(var g=0;g<menus.length;g++){
    sh+='<div class="adm-menu-section">'+menus[g].sec+'</div>';
    for(var i=0;i<menus[g].items.length;i++){
      var itm=menus[g].items[i];
      sh+='<button class="adm-menu-item'+(itm.id===_cmsTab?' on':'')+'" onclick="_renderSt(\''+itm.id+'\')">'
        +'<div class="adm-menu-icon">'+itm.icon+'</div>'
        +'<span class="adm-menu-label">'+itm.label+'</span></button>';
    }
    if(g<menus.length-1) sh+='<div class="adm-menu-divider"></div>';
  }
  sb.innerHTML=sh;

  var allI=menus.reduce(function(a,g){return a.concat(g.items);},[]);
  var cur=allI.filter(function(x){return x.id===_cmsTab;})[0];
  if(badge) badge.textContent=cur?cur.icon+' '+cur.label:'';

  if(_cmsTab==='overview'){
    var av=S.achiev&&S.achiev[0]?S.achiev[0].val:'0';
    ct.innerHTML='<div class="adm-page-hdr"><div><div class="adm-page-title">📊 لوحة المعلومات</div><div class="adm-page-sub">جمعية رفد المساجد للعناية بالمساجد</div></div></div>'
      +'<div class="adm-stats-row">'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">🕌</div><div class="adm-stat-val">'+av+'</div><div class="adm-stat-lbl">مساجد</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">📰</div><div class="adm-stat-val">'+(S.news?S.news.length:0)+'</div><div class="adm-stat-lbl">أخبار</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">🏗</div><div class="adm-stat-val">'+(S.projects?S.projects.length:0)+'</div><div class="adm-stat-lbl">مشاريع</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">📋</div><div class="adm-stat-val">'+(S.surveys?S.surveys.length:0)+'</div><div class="adm-stat-lbl">استطلاعات</div></div>'
      +'</div>'
      +'<div class="adm-card"><div class="adm-card-title"><span>⚡</span> وصول سريع</div>'
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'
      +['📰 أخبار:news','🏗 مشاريع:projects','📅 فعاليات:events','💬 آراء:testimonials','📋 استطلاعات:surveys','📝 نماذج:regforms'].map(function(x){var p=x.split(':');return'<button class="adm-btn adm-btn-ghost" style="justify-content:center" onclick="_renderSt(\''+p[1]+'\')">'+p[0]+'</button>';}).join('')
      +'</div></div>'
      +'<div class="adm-notice">💡 التغييرات تظهر فوراً في الموقع</div>';
  } else if(_cmsTab==='custompages'){
    ct.innerHTML=pCustPages();
  } else {
    ct.innerHTML=buildPanel(_cmsTab);
  }

  /* تفعيل البطاقات بعد بناء المحتوى */
  (function activateCards(){
    var hdrs=ct.querySelectorAll('.pnl-card-hdr');
    for(var i=0;i<hdrs.length;i++){
      (function(h){
        h.onclick=function(){
          var body=h.nextElementSibling;
          if(!body) return;
          var open=(body.style.display==='block');
          var all=ct.querySelectorAll('.pnl-card-body');
          for(var s=0;s<all.length;s++) all[s].style.display='none';
          var arrows=ct.querySelectorAll('.pnl-arrow');
          for(var a=0;a<arrows.length;a++) arrows[a].style.transform='';
          if(!open){
            body.style.display='block';
            var arr=h.querySelector('.pnl-arrow');
            if(arr) arr.style.transform='rotate(180deg)';
          }
        };
      })(hdrs[i]);
    }
  })();
}

function pCustPages(){
  if(!S.customPages) S.customPages=[];
  var p=S.customPages, h='';
  h+='<div class="sh">📄 صفحاتي ('+p.length+')</div>';
  h+='<div class="note">أنشئ صفحات بمحتوى حر وارتبطها بالفوتر</div><div class="dv"></div>';
  for(var pi=0;pi<p.length;pi++){
    var pg=p[pi];
    var pgId=(pg.id||('pg-'+pi));
    var pgLink=window.location.href.split('#')[0].split('?')[0]+'#page-'+pgId;
    h+='<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)">';
    h+='<span class="ibox-t">📄 '+(pg.title||'صفحة')+'</span>';
    h+='<div style="display:flex;gap:4px;align-items:center;">';
    h+='<button onclick="event.stopPropagation();openCustomPage(\''+pi+'\')" style="background:var(--P);color:#fff;border:none;border-radius:4px;padding:2px 7px;font-size:10px;cursor:pointer;">معاينة</button>';
    h+='<span class="ibox-arrow">▼</span>';
    h+='<button class="delbtn" onclick="event.stopPropagation();S.customPages.splice('+pi+',1);_renderSt(\'custompages\')">🗑</button>';
    h+='</div></div><div class="ibox-body">';
    h+='<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 14px;margin-bottom:12px;">';
    h+='<div style="font-size:11.5px;font-weight:600;color:#15803d;margin-bottom:6px;">🔗 رابط الصفحة</div>';
    h+='<div style="font-size:11px;color:#166534;word-break:break-all;margin-bottom:8px;font-family:monospace;">'+pgLink+'</div>';
    h+='<button data-id="'+pgId+'" onclick="event.stopPropagation();cpCopyLink(this.getAttribute(\'data-id\'))" style="width:100%;background:#c9a227;color:#0f3d26;border:none;border-radius:6px;padding:7px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">📋 نسخ الرابط</button>';
    h+='</div>';
    h+='<div class="fg"><label>العنوان</label><input class="is" value="'+(pg.title||'')+'" placeholder="مثال: تصاريح" oninput="S.customPages['+pi+'].title=this.value;saveCustomPages()"></div>';
    h+='<div class="fg"><label>المعرّف (للرابط)</label><input class="is" value="'+(pg.id||'')+'" placeholder="مثال: tasareeH" style="direction:ltr;text-align:left;" oninput="S.customPages['+pi+'].id=this.value;saveCustomPages()"></div>';
    h+='<div class="fg"><label>نص تعريفي</label><textarea class="is" style="min-height:36px;" oninput="S.customPages['+pi+'].intro=this.value;saveCustomPages()">'+(pg.intro||'')+'</textarea></div>';
    h+='<div class="dv"></div>';
    var blks=pg.blocks||[];
    h+='<div style="font-size:10px;font-weight:600;color:var(--PL);margin-bottom:5px;">المحتوى ('+blks.length+' عنصر)</div>';
    for(var bi=0;bi<blks.length;bi++){
        var bk=blks[bi];
        var bkLabels={text:'📝 نص',heading:'🔤 عنوان',image:'🖼 صورة',pdf:'📄 PDF',files:'📁 ملفات'};
        var bkLabel=bkLabels[bk.type]||bk.type;
        h+='<div class="blk-card">';
        h+='<div class="blk-hdr"><span class="blk-type-badge">'+bkLabel+'</span>';
        h+='<button class="delbtn" data-pi="'+pi+'" data-bi="'+bi+'" onclick="event.stopPropagation();S.customPages[parseInt(this.dataset.pi)].blocks.splice(parseInt(this.dataset.bi),1);saveCustomPages();_renderSt(\'custompages\')">🗑</button></div>';
        if(bk.type==='text'||bk.type==='heading'){
          h+=buildRichEditor(pi,bi,bk.content||'');
        } else if(bk.type==='image'){
          h+='<div class="pnl-upload-zone"><input type="file" accept="image/*" data-pi="'+pi+'" data-bi="'+bi+'" onchange="cpImg(parseInt(this.dataset.pi),parseInt(this.dataset.bi),this)">';
          if(bk.url) h+='<img src="'+bk.url+'" style="max-height:70px;object-fit:contain;pointer-events:none;margin-bottom:4px;"><div style="font-size:11px;color:#6b7280;pointer-events:none;">✓ انقر لتغيير</div>';
          else h+='<div class="pnl-upload-icon">🖼</div><div class="pnl-upload-text">انقر لرفع صورة</div>';
          h+='</div>';
          h+='<div class="pnl-field" style="margin-top:6px;"><label>تعليق الصورة</label><input class="is" value="'+(bk.caption||'')+'" data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].caption=this.value;saveCustomPages()"></div>';
        } else if(bk.type==='pdf'){
          h+='<div class="pnl-upload-zone"><input type="file" accept="application/pdf" data-pi="'+pi+'" data-bi="'+bi+'" onchange="cpPdf(parseInt(this.dataset.pi),parseInt(this.dataset.bi),this)">';
          if(bk.url) h+='<div style="font-size:24px;pointer-events:none;">📄</div><div style="font-size:11px;color:#6b7280;pointer-events:none;">✓ '+(bk.name||'PDF مرفوع')+'</div>';
          else h+='<div class="pnl-upload-icon">📄</div><div class="pnl-upload-text">انقر لرفع PDF</div>';
          h+='</div>';
          h+='<div class="pnl-field" style="margin-top:6px;"><label>اسم الملف</label><input class="is" value="'+(bk.name||'')+'" data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].name=this.value;saveCustomPages()"></div>';
        } else if(bk.type==='files'){
          h+='<div class="pnl-field"><label>رابط مجموعة الملفات (Google Drive أو غيره)</label><input class="is" value="'+(bk.url||'')+'" placeholder="https://drive.google.com/..." data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].url=this.value;saveCustomPages()"></div>';
          h+='<div class="pnl-field"><label>الوصف</label><input class="is" value="'+(bk.desc||'')+'" data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].desc=this.value;saveCustomPages()"></div>';
        } else if(bk.type==='images'){
          var imgArr=[];try{imgArr=JSON.parse(bk.url||'[]');}catch(e){imgArr=[];}
          h+='<div style="background:#e8f2ec;border-radius:6px;padding:5px 9px;font-size:12px;color:#0f3d26;margin-bottom:6px;">🖼 معرض صور ('+imgArr.length+')</div>';
          h+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;">';
          for(var gi=0;gi<imgArr.length;gi++) h+='<div style="position:relative;width:68px;height:68px;"><img src="'+imgArr[gi]+'" style="width:68px;height:68px;object-fit:cover;border-radius:6px;"><button class="delbtn" style="position:absolute;top:1px;right:1px;width:16px;height:16px;padding:0;font-size:9px;border-radius:50%;" data-pi="'+pi+'" data-bi="'+bi+'" data-gi="'+gi+'" onclick="event.stopPropagation();cpDelImg(parseInt(this.dataset.pi),parseInt(this.dataset.bi),parseInt(this.dataset.gi))">✕</button></div>';
          h+='</div>';
          h+='<button type="button" onclick="event.stopPropagation();cpImgsBtn('+pi+','+bi+')" style="width:100%;padding:12px;border:2px dashed #c9a227;border-radius:8px;background:#fffbeb;cursor:pointer;font-family:Tajawal,sans-serif;font-size:14px;color:#0f3d26;font-weight:700;">🖼 انقر هنا لرفع صور</button>';
          h+='<div id="cp-progress-\'+pi+\'_\'+bi+\'" style="display:none;margin-top:8px;"></div>';
          h+='<div class="fg" style="margin-top:6px;"><label>عنوان</label><input class="is" value="'+(bk.caption||'')+'" data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].caption=this.value;saveCustomPages()"></div>';
        } else if(bk.type==='pdfs'){
          var pdfArr=[];try{pdfArr=JSON.parse(bk.url||'[]');}catch(e){pdfArr=[];}
          h+='<div style="background:#e8f2ec;border-radius:6px;padding:5px 9px;font-size:12px;color:#0f3d26;margin-bottom:6px;">📄 مجموعة PDF ('+pdfArr.length+')</div>';
          for(var pj=0;pj<pdfArr.length;pj++) h+='<div style="display:flex;align-items:center;gap:8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:7px;padding:8px;margin-bottom:5px;"><span>📄</span><span style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;">'+(pdfArr[pj].name||'PDF')+'</span><button class="delbtn" data-pi="'+pi+'" data-bi="'+bi+'" data-pj="'+pj+'" onclick="event.stopPropagation();cpDelPdf(parseInt(this.dataset.pi),parseInt(this.dataset.bi),parseInt(this.dataset.pj))">حذف</button></div>';
          h+='<button type="button" onclick="event.stopPropagation();cpPdfsBtn('+pi+','+bi+')" style="width:100%;padding:12px;border:2px dashed #c9a227;border-radius:8px;background:#fffbeb;cursor:pointer;font-family:Tajawal,sans-serif;font-size:14px;color:#0f3d26;font-weight:700;">📄 انقر هنا لرفع PDF</button>';
          h+='<div id="cp-progress-\'+pi+\'_\'+bi+\'" style="display:none;margin-top:8px;"></div>';
          h+='<div class="fg" style="margin-top:6px;"><label>عنوان</label><input class="is" value="'+(bk.desc||'')+'" data-pi="'+pi+'" data-bi="'+bi+'" oninput="S.customPages[parseInt(this.dataset.pi)].blocks[parseInt(this.dataset.bi)].desc=this.value;saveCustomPages()"></div>';
        }
        h+='</div>';
      }
        h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'text\',content:\'\',url:\'\',name:\'\',desc:\'\',caption:\'\'});_renderSt(\'custompages\')">+ نص</button>';
    h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'heading\',content:\'\',url:\'\',name:\'\',desc:\'\',caption:\'\'});_renderSt(\'custompages\')">+ عنوان</button>';
    h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'image\',content:\'\',url:\'\',name:\'\',desc:\'\',caption:\'\'});_renderSt(\'custompages\')">+ صورة</button>';
    h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'pdf\',content:\'\',url:\'\',name:\'\',desc:\'\',caption:\'\'});saveCustomPages();_renderSt(\'custompages\')">+ PDF</button>';
    h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'images\',content:\'\',url:\'[]\',name:\'\',desc:\'\',caption:\'\'});saveCustomPages();_renderSt(\'custompages\')">🖼 معرض صور</button>';
    h+='<button class="abtn" onclick="S.customPages['+pi+'].blocks.push({type:\'pdfs\',content:\'\',url:\'[]\',name:\'\',desc:\'\',caption:\'\'});saveCustomPages();_renderSt(\'custompages\')">📄 مجموعة PDF</button>';
    h+='</div></div></div>';
  }
  h+='<div class="dv"></div>';
  h+='<button class="abtn" onclick="if(!S.customPages)S.customPages=[];S.customPages.push({id:\'pg\'+Date.now(),title:\'صفحة جديدة\',intro:\'\',blocks:[]});_renderSt(\'custompages\')">+ إنشاء صفحة</button>';
  return h;
}
function cpCopyLink(slug){
  var base=window.location.href.split('#')[0].split('?')[0];
  var link=base+'#page-'+slug;
  if(navigator&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){toast('تم نسخ رابط الصفحة ✓');});
  } else {
    var ta=document.createElement('textarea');
    ta.value=link;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');document.body.removeChild(ta);
    toast('تم نسخ رابط الصفحة ✓');
  }
}

function cpDelImg(pi,bi,gi){var a=[];try{a=JSON.parse(S.customPages[pi].blocks[bi].url||'[]');}catch(e){}a.splice(gi,1);S.customPages[pi].blocks[bi].url=JSON.stringify(a);saveCustomPages();_renderSt('custompages');}
function cpDelPdf(pi,bi,pj){var a=[];try{a=JSON.parse(S.customPages[pi].blocks[bi].url||'[]');}catch(e){}a.splice(pj,1);S.customPages[pi].blocks[bi].url=JSON.stringify(a);saveCustomPages();_renderSt('custompages');}
function cpImgsMulti(pi,bi,inp){
  if(!inp.files||!inp.files.length) return;
  var ex=[];
  try{ex=JSON.parse(S.customPages[pi].blocks[bi].url||'[]');}catch(e){}
  var files=Array.from?Array.from(inp.files):inp.files;
  var total=files.length, done=0;
  toast('⏳ جارٍ تحميل '+total+' صورة...');
  for(var i=0;i<total;i++){
    (function(f){
      var r=new FileReader();
      r.onload=function(e){
        ex.push(e.target.result);
        done++;
        if(done===total){
          S.customPages[pi].blocks[bi].url=JSON.stringify(ex);
          saveState(true);
          setTimeout(function(){_renderSt('custompages');},500);
        }
      };
      r.readAsDataURL(f);
    })(files[i]);
  }
}
function cpPdfsMulti(pi,bi,inp){
  if(!inp.files||!inp.files.length) return;
  var ex=[];
  try{ex=JSON.parse(S.customPages[pi].blocks[bi].url||'[]');}catch(e){}
  var files=Array.from?Array.from(inp.files):inp.files;
  var total=files.length, done=0;
  toast('⏳ جارٍ تحميل '+total+' ملف...');
  for(var i=0;i<total;i++){
    (function(f){
      var r=new FileReader();
      r.onload=function(e){
        ex.push({name:f.name,data:e.target.result});
        done++;
        toast('⏳ '+(done)+'/'+total+' ملف...');
        if(done===total){
          S.customPages[pi].blocks[bi].url=JSON.stringify(ex);
          /* حفظ فوري بدون delay */
          saveState(true);
          setTimeout(function(){_renderSt('custompages');},500);
        }
      };
      r.onerror=function(){
        done++;
        toast('⚠️ فشل تحميل: '+f.name);
        if(done===total && ex.length>0){
          S.customPages[pi].blocks[bi].url=JSON.stringify(ex);
          saveState(true);
        }
      };
      r.readAsDataURL(f);
    })(files[i]);
  }
}
function cpImg(pi,bi,inp){ if(!inp.files.length)return; S.customPages[pi].blocks[bi].url=URL.createObjectURL(inp.files[0]); _renderSt('custompages'); toast('تم رفع الصورة ✓'); }
function cpPdf(pi,bi,inp){ if(!inp.files.length)return; var f=inp.files[0]; S.customPages[pi].blocks[bi].url=URL.createObjectURL(f); S.customPages[pi].blocks[bi].name=f.name; _renderSt('custompages'); toast('تم رفع الملف ✓'); }

/* showPage unified — no override needed */


/* ════ قائمة الجوال ════ */
function openMobNav(){
  var ov=document.getElementById('mob-overlay');
  var dr=document.getElementById('mob-drawer');
  var it=document.getElementById('mob-nav-items');
  if(!dr||!it) return;
  var navItems=(S.nav&&S.nav.items)?S.nav.items:[];
  var h='';
  for(var i=0;i<navItems.length;i++){
    var item=navItems[i];
    h+='<div class="mob-nav-item" data-i="'+i+'" onclick="mobClick(this)">';
    h+='<span>'+item.label+'</span>';
    if(item.hasDrop&&item.dropItems&&item.dropItems.length) h+='<span>▾</span>';
    h+='</div>';
    if(item.hasDrop&&item.dropItems&&item.dropItems.length){
      h+='<div class="mob-nav-sub" id="msub-'+i+'">';
      for(var j=0;j<item.dropItems.length;j++){
        var di=item.dropItems[j];
        h+='<div class="mob-nav-subitem" data-svtab="'+(di.svTab||'')+'" data-page="'+(di.page||'')+'" onclick="mobSubEl(this)">'+(di.icon||'🔗')+' '+di.label+'</div>';
      }
      h+='</div>';
    }
  }
  var donUrl=(S.nav&&S.nav.donUrl)?S.nav.donUrl:'#';
  var donBtn=(S.nav&&S.nav.donBtn)?S.nav.donBtn:'تبرّع';
  h+='<a href="'+donUrl+'" class="mob-don-btn" onclick="closeMobNav()">'+donBtn+'</a>';
  it.innerHTML=h;
  if(ov) ov.style.display='block';
  setTimeout(function(){dr.classList.add('open');},10);
  document.body.style.overflow='hidden';
}
function mobClick(el){
  var i=parseInt(el.getAttribute('data-i'));
  var item=(S.nav&&S.nav.items)?S.nav.items[i]:null;
  if(!item) return;
  if(item.hasDrop&&item.dropItems&&item.dropItems.length){
    var sub=document.getElementById('msub-'+i);
    if(sub) sub.classList.toggle('open');
  } else { closeMobNav(); if(item.url) scrollSec(item.url.replace('#','')); }
}
function mobSubEl(el){
  var svTab=el.getAttribute('data-svtab');
  var page=el.getAttribute('data-page');
  closeMobNav();
  if(svTab){showSvTab(svTab,null);scrollSec('surveys-sec');}
  else if(page){showPage(page);}
}
function closeMobNav(){
  var d=document.getElementById('mob-drawer');
  var o=document.getElementById('mob-overlay');
  if(d) d.classList.remove('open');
  if(o) o.style.display='none';
  document.body.style.overflow='';
}

/* ════ مشاركة الأخبار ════ */
function copyNewsLink(idx){
  var base=window.location.href.split('#')[0].split('?')[0];
  var link=base+'#news-'+idx;
  if(navigator&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){toast('تم نسخ رابط الخبر ✓');});
  } else {
    var ta=document.createElement('textarea');
    ta.value=link; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast('تم نسخ رابط الخبر ✓');
  }
}


/* ════ بيانات نماذج التسجيل ════ */
function viewRegEntries(){
  var page  = document.getElementById('reg-form-page');
  var body  = document.getElementById('reg-page-body');
  var title = document.getElementById('reg-page-title');
  if(!page||!body) return;
  title.textContent = '📊 البيانات المسجلة';
  /* رفع z-index فوق لوحة التحكم المنفصلة */
  page.style.zIndex = '10000';
  page.classList.add('open');
  document.body.style.overflow='hidden';

  /* عرض المحلي فوراً */
  var local = [];
  try{ local = JSON.parse(localStorage.getItem('reg_entries_local')||'[]'); }catch(e){}
  
  if(local.length){
    renderRegEntries(local);
    body.innerHTML += '<div style="font-size:10px;color:var(--TXL);text-align:center;padding:8px;">⏳ جارٍ مزامنة البيانات من الخادم...</div>';
  } else {
    body.innerHTML = '<div style="text-align:center;padding:30px;color:var(--TXM);">⏳ جارٍ التحميل...</div>';
  }

  /* ثم جلب من API */
  fetch('/mosque/api/registration-entries')
    .then(function(r){return r.json();})
    .then(function(res){
      var server=(res&&res.data)?res.data:[];
      /* دمج المحلي مع الخادم */
      var combined = server.concat(local.filter(function(l){
        return !server.find(function(s){ return s.form_label===l.form && s.submitted_at===l.time; });
      }));
      if(combined.length) renderRegEntries(combined);
      else if(!local.length) renderRegEntries([]);
    })
    .catch(function(){
      if(!local.length) renderRegEntries([]);
    });
}

function renderRegEntries(entries){
  var body=document.getElementById('reg-page-body');
  if(!body) return;
  if(!entries||!entries.length){
    body.innerHTML='<div style="text-align:center;padding:60px;color:var(--TXM)">لا توجد بيانات مسجلة بعد</div>';
    return;
  }
  var h='<div style="padding:16px;max-width:800px;margin:0 auto;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">';
  h+='<button onclick="openRegPage()" style="background:none;border:none;color:var(--P);cursor:pointer;font-size:13px;font-family:inherit;">← رجوع</button>';
  h+='<span style="font-size:13px;color:var(--TXM);">إجمالي: <strong>'+entries.length+'</strong></span></div>';
  for(var i=0;i<entries.length;i++){
    var e=entries[i];
    var data=typeof e.data==='string'?JSON.parse(e.data||'{}'):(e.data||{});
    h+='<div style="background:var(--W);border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:var(--SH);">';
    h+='<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
    h+='<span style="font-weight:700;color:var(--P);">'+(e.form_label||e.form||'نموذج')+'</span>';
    h+='<span style="font-size:11px;color:var(--TXL);">'+(e.submitted_at||e.time||'')+'</span></div>';
    var keys=Object.keys(data);
    for(var j=0;j<keys.length;j++){
      if(data[keys[j]]){
        h+='<div style="display:flex;gap:8px;font-size:12px;padding:4px 0;border-bottom:1px solid var(--BG2);">';
        h+='<span style="color:var(--TXM);min-width:110px;flex-shrink:0;">'+keys[j]+':</span>';
        h+='<span style="color:var(--TX);font-weight:500;">'+data[keys[j]]+'</span></div>';
      }
    }
    h+='</div>';
  }
  h+='</div>';
  body.innerHTML=h;
}



/* saveCustomPages moved */
function loadCustomPages(){
  try{
    var saved = localStorage.getItem('mosque_customPages');
    if(saved){ var arr=JSON.parse(saved); if(arr&&arr.length) S.customPages=arr; }
  }catch(e){}
}


/* ════ لوحة التحكم الاحترافية ════ */
var _cmsTab='overview';

function openCMSStandalone(){
  var el=document.getElementById('cms-standalone');
  if(!el) return;
  el.classList.add('open');
  document.body.style.overflow='hidden';
  _cmsTab=_cmsTab||'overview';
  _cmsTab=_cmsTab||'overview'; setTimeout(function(){ _renderSt(_cmsTab); },30);
}

function closeCMSStandalone(){
  var el=document.getElementById('cms-standalone');
  if(el) el.classList.remove('open');
  document.body.style.overflow='';
}

function _renderSt(tab){
  _cmsTab=tab||_cmsTab;
  var sb=document.getElementById('cms-st-sidebar');
  var ct=document.getElementById('cms-st-content');
  var badge=document.getElementById('adm-cur-section');
  if(!sb||!ct) return;

  var menus=[
    {sec:'الرئيسية',items:[{id:'overview',icon:'📊',label:'لوحة المعلومات'},{id:'global',icon:'⚙',label:'إعدادات عامة'},{id:'hero',icon:'🏠',label:'الشاشة الرئيسية'}]},
    {sec:'المحتوى',items:[{id:'news',icon:'📰',label:'الأخبار'},{id:'projects',icon:'🏗',label:'المشاريع'},{id:'events',icon:'📅',label:'الفعاليات'},{id:'testimonials',icon:'💬',label:'الآراء'},{id:'partners',icon:'🤝',label:'الشركاء'}]},
    {sec:'الأرقام',items:[{id:'achiev',icon:'🏆',label:'الإنجازات'},{id:'stats',icon:'🔢',label:'الأرقام'}]},
    {sec:'التفاعل',items:[{id:'surveys',icon:'📋',label:'الاستطلاعات'},{id:'regforms',icon:'📝',label:'النماذج'}]},
    {sec:'الموقع',items:[{id:'navbar',icon:'🔝',label:'القوائم'},{id:'footer',icon:'📍',label:'الفوتر'},{id:'custompages',icon:'📄',label:'الصفحات'},{id:'sections',icon:'☰',label:'الأقسام'}]},
    {sec:'الإدارة',items:[{id:'users',icon:'👥',label:'المستخدمون'},{id:'maintenance',icon:'🔒',label:'الصيانة'}]},
  ];

  var sh='';
  for(var g=0;g<menus.length;g++){
    sh+='<div class="adm-menu-section">'+menus[g].sec+'</div>';
    for(var i=0;i<menus[g].items.length;i++){
      var itm=menus[g].items[i];
      sh+='<button class="adm-menu-item'+(itm.id===_cmsTab?' on':'')+'" onclick="_renderSt(\''+itm.id+'\')">'
        +'<div class="adm-menu-icon">'+itm.icon+'</div>'
        +'<span class="adm-menu-label">'+itm.label+'</span></button>';
    }
    if(g<menus.length-1) sh+='<div class="adm-menu-divider"></div>';
  }
  sb.innerHTML=sh;

  var allI=menus.reduce(function(a,g){return a.concat(g.items);},[]);
  var cur=allI.filter(function(x){return x.id===_cmsTab;})[0];
  if(badge) badge.textContent=cur?cur.icon+' '+cur.label:'';

  if(_cmsTab==='overview'){
    var av=S.achiev&&S.achiev[0]?S.achiev[0].val:'0';
    ct.innerHTML='<div class="adm-page-hdr"><div><div class="adm-page-title">📊 لوحة المعلومات</div></div></div>'
      +'<div class="adm-stats-row">'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">🕌</div><div class="adm-stat-val">'+av+'</div><div class="adm-stat-lbl">مساجد</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">📰</div><div class="adm-stat-val">'+(S.news?S.news.length:0)+'</div><div class="adm-stat-lbl">أخبار</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">🏗</div><div class="adm-stat-val">'+(S.projects?S.projects.length:0)+'</div><div class="adm-stat-lbl">مشاريع</div></div>'
      +'<div class="adm-stat-card"><div class="adm-stat-icon">📋</div><div class="adm-stat-val">'+(S.surveys?S.surveys.length:0)+'</div><div class="adm-stat-lbl">استطلاعات</div></div>'
      +'</div>'
      +'<div class="adm-card"><div class="adm-card-title"><span>⚡</span> وصول سريع</div>'
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'
      +['📰 أخبار:news','🏗 مشاريع:projects','📅 فعاليات:events','💬 آراء:testimonials','📋 استطلاعات:surveys','📝 نماذج:regforms'].map(function(x){var p=x.split(':');return'<button class="adm-btn adm-btn-ghost" style="justify-content:center" onclick="_renderSt(\''+p[1]+'\')">'+p[0]+'</button>';}).join('')
      +'</div></div>'
      +'<div class="adm-notice">💡 التغييرات تظهر فوراً في الموقع</div>';
  } else if(_cmsTab==='custompages'){
    ct.innerHTML=pCustPages();
  } else if(_cmsTab==='surveys'){
    ct.innerHTML=(typeof pSurveysV2==='function'?pSurveysV2():pSurveysNew());
  } else if(_cmsTab==='users'){
    ct.innerHTML=pCmsUsers();
  } else {
    ct.innerHTML=buildPanel(_cmsTab);
  }

  (function(){
    var hdrs=ct.querySelectorAll('.pnl-card-hdr');
    for(var i=0;i<hdrs.length;i++){
      (function(h){
        h.onclick=function(e){
          var t=e.target||e.srcElement;
          while(t&&t!==h){if(/^(INPUT|SELECT|TEXTAREA|BUTTON|LABEL)$/.test((t.tagName||'').toUpperCase()))return;t=t.parentElement;}
          var body=h.nextElementSibling;
          if(!body||!body.classList.contains('pnl-card-body'))return;
          var isOpen=(body.style.display==='block');
          var all=ct.querySelectorAll('.pnl-card-body');
          var arrows=ct.querySelectorAll('.pnl-arrow');
          for(var s=0;s<all.length;s++) all[s].style.display='none';
          for(var a=0;a<arrows.length;a++) arrows[a].style.transform='';
          if(!isOpen){body.style.display='block';var arr=h.querySelector('.pnl-arrow');if(arr)arr.style.transform='rotate(180deg)';}
        };
      })(hdrs[i]);
    }
    var bodies=ct.querySelectorAll('.pnl-card-body');
    for(var b=0;b<bodies.length;b++) bodies[b].onclick=function(e){e.stopPropagation();};
  })();
}

/* ════ نظام الحفظ ════ */
var _saveTimer=null;
function saveState(showToast){
  if(showToast) toast('⏳ جارٍ الحفظ...');
  fetch('/mosque/api/state.php',{method:'POST',headers:cmsAuthHeaders({'Content-Type':'application/json'}),body:JSON.stringify({S:S})})
  .then(function(r){return r.json();})
  .then(function(res){if(showToast) toast(res&&res.success?'✅ تم الحفظ للجميع':'⚠️ '+(res&&res.error||'خطأ'));}).catch(function(){if(showToast) toast('⚠️ تعذّر الحفظ');});
}
function autoSave(){if(_saveTimer)clearTimeout(_saveTimer);_saveTimer=setTimeout(function(){saveState(false);},1000);}
function saveCustomPages(){
  /* حفظ فوري في DB */
  if(_saveTimer) clearTimeout(_saveTimer);
  _saveTimer=setTimeout(function(){
    saveState(false);
  }, 800);
}
/* saveCustomPages moved */
function loadCustomPages(){try{var s=localStorage.getItem('mosque_customPages');if(s){var a=JSON.parse(s);if(a&&a.length)S.customPages=a;}}catch(e){}}
function loadStateFromServer(){
  fetch('/mosque/api/state.php')
  .then(function(r){return r.json();})
  .then(function(res){
    if(res&&res.success&&res.data){var d=res.data,k=Object.keys(d);for(var i=0;i<k.length;i++) if(d[k[i]]!=null) S[k[i]]=d[k[i]];}
    if(typeof renderAll==='function') renderAll();
    if(typeof renderWA==='function') renderWA();
    if(typeof renderSurveyList==='function') renderSurveyList();
    if(typeof renderFooter==='function') renderFooter();
    initCMSState();
  }).catch(function(){
    if(typeof renderAll==='function') renderAll();
    if(typeof renderWA==='function') renderWA();
    initCMSState();
  });
}

/* ════ الاستطلاعات - النسخة الجديدة ════ */
function pSurveysNew(){
  var at=window._svTab||'surveys';
  var tabs=[{id:'surveys',icon:'📋',label:'إدارة الاستطلاعات'},{id:'reports',icon:'🔬',label:'تقارير التحليل'},{id:'board',icon:'📌',label:'توصيات مجلس الإدارة'}];
  var h='<div style="display:flex;gap:6px;margin-bottom:18px;background:#f3f4f6;padding:4px;border-radius:10px;">';
  for(var t=0;t<tabs.length;t++){
    var tb=tabs[t];var on=(tb.id===at);
    h+='<button data-svtab="'+tb.id+'" onclick="window._svTab=this.dataset.svtab;_renderSt(\'surveys\')" style="flex:1;padding:9px 4px;border-radius:7px;border:none;font-size:13px;cursor:pointer;font-family:\'Tajawal\',sans-serif;font-weight:600;'+(on?'background:#fff;color:#0f3d26;box-shadow:0 1px 3px rgba(0,0,0,.1);':'background:none;color:#6b7280;')+'">'+tb.icon+' '+tb.label+'</button>';
  }
  h+='</div>';
  if(at==='surveys'){
    h+='<div class="pnl-notice">💡 اضغط على الاستطلاع لتعديله</div>';
    for(var i=0;i<S.surveys.length;i++){
      var sv=S.surveys[i];
      var stc=sv.status==='active'?'🟢 نشط':sv.status==='closed'?'🔴 مغلق':'🟡 معلق';
      var svLink=window.location.href.split('#')[0].split('?')[0]+'#survey-'+sv.id;
      h+='<div class="pnl-card"><div class="pnl-card-hdr">'
        +'<div class="pnl-card-icon" style="background:'+(sv.iconBg||'#e8f2ec')+'">'+sv.icon+'</div>'
        +'<div class="pnl-card-info"><div class="pnl-card-title">'+sv.title+'</div><div class="pnl-card-sub">'+stc+' · '+(sv.questions?sv.questions.length:0)+' أسئلة</div></div>'
        +'<div class="pnl-card-actions"><span class="pnl-arrow">▼</span>'
        +'<button class="delbtn" data-i="'+i+'" onclick="event.stopPropagation();svDelNew(parseInt(this.dataset.i))">🗑</button>'
        +'</div></div>'
        +'<div class="pnl-card-body">'
        +'<div class="pnl-grid2"><div class="pnl-field"><label>العنوان</label><input class="is" value="'+sv.title+'" data-i="'+i+'" oninput="S.surveys[parseInt(this.dataset.i)].title=this.value;autoSave()"></div>'
        +'<div class="pnl-field"><label>الحالة</label><select data-i="'+i+'" onchange="S.surveys[parseInt(this.dataset.i)].status=this.value;renderSurveyList();autoSave()">'
        +'<option value="active" '+(sv.status==='active'?'selected':'')+'>🟢 نشط</option>'
        +'<option value="closed" '+(sv.status==='closed'?'selected':'')+'>🔴 مغلق</option>'
        +'<option value="pending"'+(sv.status==='pending'?'selected':'')+'>🟡 معلق</option>'
        +'</select></div></div>'
        +'<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px;margin-bottom:12px;">'
        +'<div style="font-size:11.5px;font-weight:600;color:#15803d;margin-bottom:5px;">🔗 الرابط المستقل</div>'
        +'<div style="font-size:11px;color:#166534;word-break:break-all;margin-bottom:7px;font-family:monospace;">'+svLink+'</div>'
        +'<button data-svid="'+sv.id+'" onclick="event.stopPropagation();copySurveyLink(this.dataset.svid)" style="width:100%;background:#c9a227;color:#0f3d26;border:none;border-radius:6px;padding:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">📋 نسخ الرابط</button>'
        +'</div>'
        +'<div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:8px;">الأسئلة ('+(sv.questions?sv.questions.length:0)+')</div>';
          h+='<div id="sv-questions-'+i+'">';
      if(sv.questions){
        for(var j=0;j<sv.questions.length;j++){
          var q=sv.questions[j];
          var qType=q.type||'likert';
          var qOpts=(q.opts||['ضعيف','مقبول','جيد','ممتاز']).join('،');
          var qDiv='<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;">';
          qDiv+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
          qDiv+='<span style="font-size:13px;font-weight:700;color:#0f3d26;">'+(j+1)+'. '+(q.text||'سؤال')+'</span>';
          qDiv+='<button data-i="'+i+'" data-j="'+j+'" onclick="event.stopPropagation();svDelQNew(parseInt(this.dataset.i),parseInt(this.dataset.j))" style="background:#fee2e2;color:#dc2626;border:none;border-radius:5px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:inherit;">🗑</button>';
          qDiv+='</div>';
          qDiv+='<div class="pnl-field"><label>نص السؤال</label>';
          qDiv+='<input class="is" value="'+(q.text||'')+'" data-i="'+i+'" data-j="'+j+'" oninput="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].text=this.value;autoSave()">';
          qDiv+='</div>';
          qDiv+='<div class="pnl-field"><label>نوع السؤال</label><select data-i="'+i+'" data-j="'+j+'" onchange="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].type=this.value;autoSave();_doRenderSurveys()">';
          qDiv+='<option value="likert" '+(qType==='likert'?'selected':'')+'>⭐ مقياس ليكرت</option>';
          qDiv+='<option value="choice" '+(qType==='choice'?'selected':'')+'>☑ اختيار متعدد</option>';
          qDiv+='<option value="rating" '+(qType==='rating'?'selected':'')+'>🌟 تقييم بالنجوم</option>';
          qDiv+='<option value="text"   '+(qType==='text'  ?'selected':'')+'>✏ نص حر</option>';
          qDiv+='<option value="file"   '+(qType==='file'  ?'selected':'')+'>📎 رفع مستند</option>';
          qDiv+='</select></div>';
          if(qType==='likert'||qType==='choice'||qType==='rating'){
            qDiv+='<div class="pnl-field"><label>عبارات الإجابة (مفصولة بفاصلة ،)</label>';
            qDiv+='<input class="is" value="'+qOpts+'" data-i="'+i+'" data-j="'+j+'" placeholder="ضعيف،مقبول،جيد،ممتاز" oninput="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].opts=this.value.split(String.fromCharCode(1548)).map(function(x){return x.trim();}).filter(Boolean);autoSave()">';
            qDiv+='</div>';
          }
          if(qType==='file') qDiv+='<div style="background:#eff6ff;border-radius:6px;padding:8px;font-size:12px;color:#1d4ed8;margin-bottom:6px;">📎 سيظهر للمستجيب زر لرفع ملف</div>';
          if(qType==='text') qDiv+='<div style="background:#f0fdf4;border-radius:6px;padding:8px;font-size:12px;color:#15803d;margin-bottom:6px;">✏ سيظهر للمستجيب حقل نص حر</div>';
          qDiv+='<div style="display:flex;align-items:center;gap:7px;margin-top:6px;">';
          qDiv+='<input type="checkbox" '+(q.required?'checked':'')+' data-i="'+i+'" data-j="'+j+'" onchange="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].required=this.checked;autoSave()">';
          qDiv+='<span style="font-size:12.5px;cursor:pointer;">السؤال إجباري</span></div>';
          qDiv+='</div>';
          h+=qDiv;
        }
      }
      h+='</div>';
          h+='<button class="pnl-add-btn" data-i="'+i+'" onclick="event.stopPropagation();svAddQNew(parseInt(this.dataset.i))">+ إضافة سؤال</button>'
        +'</div></div>';
    }
    h+='<div style="margin-top:10px;"><button class="pnl-add-btn" onclick="svAddNew()">+ إضافة استطلاع</button></div>';
  }
  else if(at==='reports'){
    h+='<div class="pnl-notice">🔬 ملخص نتائج الاستطلاعات</div>';
    var any=false;
    for(var i=0;i<S.surveys.length;i++){
      var sv=S.surveys[i];
      if(!sv.responses||sv.responses<1) continue; any=true;
      var pct=Math.min(100,(sv.responses||0)*10);
      h+='<div class="pnl-card" style="display:block;margin-bottom:10px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div class="pnl-card-icon">'+sv.icon+'</div><div><div class="pnl-card-title">'+sv.title+'</div><div class="pnl-card-sub">'+sv.responses+' استجابة</div></div></div>'
        +'<div class="pnl-pct-bar"><div class="pnl-pct-fill" style="width:'+pct+'%"></div></div>'
        +'<div style="text-align:left;font-size:11px;color:#0f3d26;font-weight:600;margin-top:3px;">'+pct+'%</div></div>';
    }
    if(!any) h+='<div class="adm-empty"><div class="adm-empty-icon">📊</div><div class="adm-empty-text">لا توجد استجابات بعد</div></div>';
  }
  else if(at==='board'){
    h+='<div class="pnl-notice">📌 التوصيات المستخلصة من نتائج الاستطلاعات</div>';
    if(!S.boardRecommendations) S.boardRecommendations=[];
    for(var i=0;i<S.boardRecommendations.length;i++){
      var rec=S.boardRecommendations[i];
      h+='<div class="pnl-card" style="display:block;margin-bottom:8px;"><div style="display:flex;gap:8px;align-items:flex-start;"><div style="flex:1;">'
        +'<div class="pnl-field"><label>نص التوصية</label><textarea class="is" style="min-height:60px" data-i="'+i+'" oninput="S.boardRecommendations[parseInt(this.dataset.i)].text=this.value;autoSave()">'+rec.text+'</textarea></div>'
        +'<div class="pnl-grid2"><div class="pnl-field"><label>الأولوية</label><select data-i="'+i+'" onchange="S.boardRecommendations[parseInt(this.dataset.i)].priority=this.value;autoSave()">'
        +'<option value="high" '+(rec.priority==='high'?'selected':'')+'>🔴 عالية</option><option value="mid" '+(rec.priority==='mid'?'selected':'')+'>🟡 متوسطة</option><option value="low" '+(rec.priority==='low'?'selected':'')+'>🟢 منخفضة</option></select></div>'
        +'<div class="pnl-field"><label>الحالة</label><select data-i="'+i+'" onchange="S.boardRecommendations[parseInt(this.dataset.i)].status=this.value;autoSave()">'
        +'<option value="pending" '+(rec.status==='pending'?'selected':'')+'>⏳ قيد الدراسة</option><option value="done" '+(rec.status==='done'?'selected':'')+'>✅ منجزة</option><option value="rejected" '+(rec.status==='rejected'?'selected':'')+'>❌ مرفوضة</option></select></div></div>'
        +'</div><button data-i="'+i+'" onclick="S.boardRecommendations.splice(parseInt(this.dataset.i),1);autoSave();_renderSt(\'surveys\')" style="background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px;flex-shrink:0;">🗑</button></div></div>';
    }
    h+='<button class="pnl-add-btn" onclick="if(!S.boardRecommendations)S.boardRecommendations=[];S.boardRecommendations.push({text:\'\',priority:\'mid\',status:\'pending\'});autoSave();_renderSt(\'surveys\')">+ إضافة توصية</button>';
  }
  h+='<div class="pnl-save-bar"><button class="adm-btn adm-btn-primary" onclick="saveState(true)">💾 حفظ</button></div>';
  return h;
}
function _doRenderSurveys(){ _renderSt('surveys'); renderSurveyList(); }
function svAddNew(){
  if(!S.surveys) S.surveys=[];
  S.surveys.push({
    id:'sv'+Date.now(),
    icon:'📋',iconBg:'#e8f2ec',
    title:'استطلاع جديد',
    desc:'',cat:'عام',
    status:'active',
    responses:0,
    questions:[{text:'السؤال الأول',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','ممتاز']}]
  });
  renderSurveyList();  /* تحديث الموقع فوراً */
  saveState(false);    /* حفظ في DB */
  _renderSt('surveys');
  toast('✓ تم إضافة الاستطلاع — اضغط حفظ لتأكيده');
}
function svDelNew(i){if(!confirm('هل تريد حذف هذا الاستطلاع؟'))return;S.surveys.splice(i,1);renderSurveyList();autoSave();_renderSt('surveys');}
function svAddQNew(i){
  if(!S.surveys[i].questions) S.surveys[i].questions=[];
  S.surveys[i].questions.push({text:'سؤال جديد',type:'likert',required:true,opts:['ضعيف','مقبول','جيد','ممتاز']});
  autoSave();
  /* تحديث قسم الأسئلة فقط دون إغلاق البطاقة */
  var qContainer = document.getElementById('sv-questions-'+i);
  if(qContainer){
    var q = S.surveys[i].questions;
    var lastQ = q[q.length-1];
    var j = q.length-1;
    var qOpts = (lastQ.opts||['ضعيف','مقبول','جيد','ممتاز']).join('،');
    var div = document.createElement('div');
    div.style.cssText = 'background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;';
    div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<span style="font-size:13px;font-weight:700;color:#0f3d26;">'+(j+1)+'. سؤال جديد</span>'
      +'<button data-i="'+i+'" data-j="'+j+'" onclick="svDelQNew(parseInt(this.dataset.i),parseInt(this.dataset.j))" style="background:#fee2e2;color:#dc2626;border:none;border-radius:5px;padding:3px 9px;font-size:11px;cursor:pointer;font-family:inherit;">🗑</button>'
      +'</div>'
      +'<div class="pnl-field"><label>نص السؤال</label>'
      +'<input class="is" value="سؤال جديد" data-i="'+i+'" data-j="'+j+'" oninput="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].text=this.value;autoSave()">'
      +'</div>'
      +'<div class="pnl-field"><label>عبارات الإجابة (مفصولة بفاصلة ،)</label>'
      +'<input class="is" value="'+qOpts+'" data-i="'+i+'" data-j="'+j+'" placeholder="ضعيف،مقبول،جيد،ممتاز" oninput="S.surveys[parseInt(this.dataset.i)].questions[parseInt(this.dataset.j)].opts=this.value.split(String.fromCharCode(1548)).map(function(x){return x.trim();}).filter(Boolean);autoSave()">'
      +'</div>';
    qContainer.appendChild(div);
    /* تحديث العداد */
    var counter = document.getElementById('sv-qcount-'+i);
    if(counter) counter.textContent = q.length+' أسئلة';
    toast('✓ تمت إضافة السؤال');
  } else {
    _doRenderSurveys();
    toast('✓ تمت إضافة السؤال');
  }
}
function svDelQNew(i,j){S.surveys[i].questions.splice(j,1);autoSave();_renderSt('surveys');}

/* ════ رابط الاستطلاع ════ */
function copySurveyLink(id){
  var base=window.location.href.split('#')[0].split('?')[0];
  var link=base+'#survey-'+id;
  if(navigator&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){toast('تم نسخ الرابط ✓');});
  } else {
    var ta=document.createElement('textarea');ta.value=link;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('تم نسخ الرابط ✓');
  }
}


function richCmd(cmd,val){document.execCommand(cmd,false,val||null);}
function richFontSz(sel){
  var sz=sel.value; if(!sz) return;
  document.execCommand('fontSize',false,'7');
  var els=document.querySelectorAll('[size="7"]');
  for(var i=0;i<els.length;i++){els[i].removeAttribute('size');els[i].style.fontSize=sz;}
  sel.selectedIndex=0;
}
function richLink(){var u=prompt('الرابط:','https://');if(u)document.execCommand('createLink',false,u);}
function buildRichEditor(pi,bi,content){
  var id='rich_'+pi+'_'+bi;
  return '<div class="rich-toolbar">'
    +'<button class="rich-btn" onclick="richCmd(\'bold\')" title="عريض"><b>B</b></button>'
    +'<button class="rich-btn" onclick="richCmd(\'italic\')" title="مائل"><i>I</i></button>'
    +'<button class="rich-btn" onclick="richCmd(\'underline\')" title="تسطير"><u>U</u></button>'
    +'<div class="rich-sep"></div>'
    +'<select class="rich-sel" onchange="richCmd(\'formatBlock\',this.value);this.selectedIndex=0">'
    +'<option value="">نص</option><option value="h2">عنوان 1</option><option value="h3">عنوان 2</option>'
    +'<option value="h4">عنوان 3</option><option value="blockquote">اقتباس</option></select>'
    +'<select class="rich-sel" onchange="richFontSz(this)">'
    +'<option value="">حجم</option><option value="12px">صغير</option><option value="15px">عادي</option>'
    +'<option value="18px">كبير</option><option value="22px">أكبر</option><option value="28px">ضخم</option></select>'
    +'<div class="rich-sep"></div>'
    +'<input type="color" class="rich-color" title="لون النص" onchange="richCmd(\'foreColor\',this.value)">'
    +'<input type="color" class="rich-color" title="تظليل" onchange="richCmd(\'hiliteColor\',this.value)">'
    +'<div class="rich-sep"></div>'
    +'<button class="rich-btn" onclick="richCmd(\'justifyRight\')">⇥</button>'
    +'<button class="rich-btn" onclick="richCmd(\'justifyCenter\')">⇔</button>'
    +'<button class="rich-btn" onclick="richCmd(\'justifyLeft\')">⇤</button>'
    +'<div class="rich-sep"></div>'
    +'<button class="rich-btn" onclick="richCmd(\'insertUnorderedList\')">•≡</button>'
    +'<button class="rich-btn" onclick="richCmd(\'insertOrderedList\')">1≡</button>'
    +'<button class="rich-btn" onclick="richLink()">🔗</button>'
    +'</div>'
    +'<div class="rich-editor" id="'+id+'" contenteditable="true" dir="rtl" '
    +'onblur="if(S.customPages['+pi+']&&S.customPages['+pi+'].blocks['+bi+']){S.customPages['+pi+'].blocks['+bi+'].content=this.innerHTML;saveCustomPages();}">'
    +content
    +'</div>';
}


/* ════ إدارة القوائم المنسدلة ════ */
(function(){
  var _ddT=null;
  function ddShow(el){if(_ddT){clearTimeout(_ddT);_ddT=null;}el.classList.add('dd-open');}
  function ddHide(el){_ddT=setTimeout(function(){el.classList.remove('dd-open');_ddT=null;},200);}
  document.addEventListener('DOMContentLoaded',function(){
    var items=document.querySelectorAll('.nav-link.has-dd');
    for(var i=0;i<items.length;i++){
      (function(el){
        el.addEventListener('mouseenter',function(){ddShow(el);});
        el.addEventListener('mouseleave',function(){ddHide(el);});
        var dd=el.querySelector('.dropdown');
        if(dd){
          dd.addEventListener('mouseenter',function(){ddShow(el);});
          dd.addEventListener('mouseleave',function(){ddHide(el);});
        }
      })(items[i]);
    }
  });
})();


/* ════ نظام رفع الملفات — رفع للاستضافة ════ */
var _cpPi=-1, _cpBi=-1;

function cpShowProgress(container, files) {
  var div = document.getElementById(container);
  if(!div) return;
  div.innerHTML = '';
  for(var i=0;i<files.length;i++){
    div.innerHTML += '<div id="prog_'+i+'" style="margin:4px 0;padding:6px 10px;background:#f3f4f6;border-radius:6px;font-size:13px;display:flex;align-items:center;gap:8px;">'
      +'<span id="prog_ico_'+i+'">⏳</span>'
      +'<span style="flex:1">'+files[i].name+'</span>'
      +'<span id="prog_sz_'+i+'" style="color:#6b7280;font-size:11px;">'+Math.round(files[i].size/1024)+' KB</span>'
      +'</div>';
  }
  div.style.display='block';
}

function cpUpdateProgress(idx, ok, msg) {
  var ico = document.getElementById('prog_ico_'+idx);
  var sz  = document.getElementById('prog_sz_'+idx);
  var row = document.getElementById('prog_'+idx);
  if(ico) ico.textContent = ok ? '✅' : '❌';
  if(sz)  sz.textContent  = msg || '';
  if(row && !ok) row.style.background='#fee2e2';
}

function cpUploadFiles(pi, bi, files, isPdf, progressContainerId) {
  var ex=[];
  try{ex=JSON.parse(S.customPages[pi].blocks[bi].url||'[]');}catch(e){}
  var total=files.length, done=0;
  /* استخدام overlay ثابت بدلاً من container داخل البطاقة */
  var overlay=document.getElementById('cp-upload-overlay');
  var ctr=document.getElementById('cp-upload-list');
  if(overlay) overlay.style.display='block';
  if(ctr){
    var h3='';
    for(var k=0;k<files.length;k++){
      h3+='<div class="cp-prog-item" id="cpr_'+k+'">'
        +'<div class="cp-prog-top"><span style="font-weight:600">'+files[k].name+'</span>'
        +'<span id="cpr_p_'+k+'" style="color:#6b7280;font-size:12px;font-weight:600">0%</span></div>'
        +'<div class="cp-prog-bar-bg"><div class="cp-prog-bar" id="cpr_b_'+k+'"></div></div>'
        +'</div>';
    }
    ctr.innerHTML=h3;
  }
  for(var i=0;i<total;i++){
    (function(f,idx){
      var fd=new FormData(); fd.append('file',f);
      var xhr=new XMLHttpRequest();
      xhr.open('POST','/mosque/api/upload_file.php');
      var _cmsTok=getCmsToken(); if(_cmsTok) xhr.setRequestHeader('X-CMS-Token', _cmsTok);
      xhr.upload.onprogress=function(e){
        if(e.lengthComputable){
          var pct=Math.round(e.loaded/e.total*100);
          var b2=document.getElementById('cpr_b_'+idx);
          var l2=document.getElementById('cpr_p_'+idx);
          if(b2) b2.style.width=pct+'%';
          if(l2) l2.textContent=pct+'%';
        }
      };
      xhr.onload=function(){
        var res; try{res=JSON.parse(xhr.responseText);}catch(e){res={success:false};}
        var b2=document.getElementById('cpr_b_'+idx);
        var l2=document.getElementById('cpr_p_'+idx);
        if(res.success){
          if(isPdf) ex.push({name:f.name,url:res.url});
          else ex.push({url:res.url,caption:''});
          if(b2){b2.style.width='100%';b2.style.background='#16a34a';}
          if(l2){l2.textContent='100%';l2.style.color='#16a34a';}
        } else {
          if(b2){b2.style.width='100%';b2.style.background='#dc2626';}
          if(l2){l2.textContent='\u0641\u0634\u0644';l2.style.color='#dc2626';}
        }
        done++;
        if(done===total){
          S.customPages[pi].blocks[bi].url=JSON.stringify(ex);
          saveState(true);
          setTimeout(function(){
            var ov=document.getElementById('cp-upload-overlay');
            if(ov) ov.style.display='none';
            _renderSt('custompages');
          },2000);
        }
      };
      xhr.onerror=function(){done++;if(done===total){S.customPages[pi].blocks[bi].url=JSON.stringify(ex);saveState(false);}};
      xhr.send(fd);
    })(files[i],i);
  }
}


/* ════ دوال رفع الملفات ════ */
function cpOpenFilePicker(pi, bi, accept, isMulti, onDone) {
  var old = document.getElementById('_cpfp');
  if(old && old.parentNode) old.parentNode.removeChild(old);
  var inp = document.createElement('input');
  inp.type = 'file'; inp.id = '_cpfp';
  inp.accept = accept; inp.multiple = isMulti;
  inp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;';
  document.body.appendChild(inp);
  inp.addEventListener('change', function() {
    if(inp.files && inp.files.length > 0) onDone(pi, bi, inp.files);
    setTimeout(function(){ if(inp.parentNode) inp.parentNode.removeChild(inp); }, 3000);
  });
  inp.click();
}

function cpReadFiles(pi, bi, files, asObj, onComplete) {
  var ex = [];
  try { ex = JSON.parse(S.customPages[pi].blocks[bi].url || '[]'); } catch(e) {}
  var total = files.length, done = 0;
  toast('\u29b3 \u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 ' + total + ' \u0645\u0644\u0641...');
  for(var i = 0; i < total; i++) {
    (function(f) {
      var r = new FileReader();
      r.onload = function(e) {
        ex.push(asObj ? {name: f.name, data: e.target.result} : e.target.result);
        done++;
        if(done === total) {
          S.customPages[pi].blocks[bi].url = JSON.stringify(ex);
          onComplete();
        }
      };
      r.onerror = function() { done++; if(done === total) onComplete(); };
      r.readAsDataURL(f);
    })(files[i]);
  }
}

function cpPdfsBtn(pi, bi) {
  _cpPi = pi; _cpBi = bi;
  var inp = document.getElementById('cp-pdf-input');
  if(inp){ inp.value = ''; inp.click(); }
}

function cpImgsBtn(pi, bi) {
  _cpPi = pi; _cpBi = bi;
  var inp = document.getElementById('cp-img-input');
  if(inp){ inp.value = ''; inp.click(); }
}

function cpHandlePdfs(inp) {
  if(!inp.files||!inp.files.length||_cpPi<0) return;
  cpUploadFiles(_cpPi, _cpBi, inp.files, true, 'cp-progress-'+_cpPi+'_'+_cpBi);
}

function cpHandleImgs(inp) {
  if(!inp.files||!inp.files.length||_cpPi<0) return;
  cpUploadFiles(_cpPi, _cpBi, inp.files, false, 'cp-progress-'+_cpPi+'_'+_cpBi);
}


function getCookie(name){
  var v='; '+document.cookie;
  var p=v.split('; '+name+'=');
  if(p.length===2) return p.pop().split(';').shift();
  return null;
}
function setCookie(name,val){
  var exp=new Date();exp.setTime(exp.getTime()+7*86400000);
  document.cookie=name+'='+val+';expires='+exp.toUTCString()+';path=/mosque/';
}


function renderSurveyAnalysis(){
  var el=document.getElementById('sv-tab-analysis');if(!el)return;
  var reports=S.analysisReports||[];

  if(!reports.length){
    el.innerHTML='<div style="text-align:center;padding:40px;background:#f9fafb;border-radius:14px;color:#888;">'
      +'<div style="font-size:44px;margin-bottom:14px;">📊</div>'
      +'<div style="font-size:17px;font-weight:700;color:#444;margin-bottom:8px;">لا توجد تقارير تحليل بعد</div>'
      +'<div style="font-size:13px;line-height:1.8;">يمكن إضافة تقارير التحليل من<br><strong>لوحة التحكم → الاستطلاعات → تقارير التحليل</strong></div></div>';
    return;
  }

  var h='<div style="font-size:13px;font-weight:700;color:#0f3d26;margin-bottom:14px;padding:8px 12px;background:#f0fdf4;border-radius:8px;border-right:3px solid #0f3d26;">📊 تقارير التحليل ('+reports.length+')</div>';

  reports.forEach(function(r){
    h+='<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:14px;">';
    /* رأس التقرير */
    h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">';
    h+='<div>';
    h+='<div style="font-weight:700;color:#0f3d26;font-size:15px;">'+r.title+'</div>';
    if(r.date||r.survey){
      h+='<div style="font-size:11px;color:#888;margin-top:4px;">';
      if(r.date) h+='📅 '+r.date;
      if(r.survey) h+=' · 📋 '+r.survey;
      h+='</div>';
    }
    h+='</div></div>';
    /* نص التحليل */
    if(r.text){
      h+='<div style="background:#f9fafb;border-radius:10px;padding:16px;font-size:13px;color:#333;line-height:2;margin-bottom:14px;white-space:pre-wrap;border-right:3px solid #c9a227;">'+r.text+'</div>';
    }
    /* PDFs */
    var pdfs=r.pdfs||[];
    if(pdfs.length){
      h+='<div><div style="font-size:11px;font-weight:700;color:#555;margin-bottom:8px;">📎 الملفات المرفقة ('+pdfs.length+'):</div>';
      pdfs.forEach(function(p){
        var url=typeof p==='string'?p:(p.url||'');
        var name=typeof p==='string'?p.split('/').pop():(p.name||'ملف PDF');
        var size=typeof p==='object'&&p.size?p.size:'';
        h+='<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:8px;">';
        h+='<span style="font-size:24px;">📄</span>';
        h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:#0f3d26;">'+name+'</div>';
        if(size) h+='<div style="font-size:10px;color:#888;">'+size+'</div>';
        h+='</div>';
        if(url) h+='<a href="'+url+'" target="_blank" style="background:#0f3d26;color:#fff;border-radius:8px;padding:7px 14px;font-size:12px;font-family:Tajawal,sans-serif;text-decoration:none;white-space:nowrap;">📖 عرض</a>';
        h+='</div>';
      });
      h+='</div>';
    }
    h+='</div>';
  });

  el.innerHTML=h;
}
function renderSurveyBoard(){
  var el=document.getElementById('sv-tab-board');if(!el)return;
  var decisions=S.boardDecisions||[];
  var typeMap={rec:'توصية',dec:'قرار',act:'إجراء'};
  var typeColor={rec:'#0f3d26',dec:'#c9a227',act:'#2563eb'};
  var typeBg={rec:'#f0fdf4',dec:'#fffbeb',act:'#eff6ff'};
  var typeIcon={rec:'📌',dec:'⚖️',act:'⚡'};

  if(!decisions.length){
    el.innerHTML='<div style="text-align:center;padding:32px;background:#f9fafb;border-radius:12px;color:#888;">'
      +'<div style="font-size:40px;margin-bottom:12px;">🏛</div>'
      +'<div style="font-size:16px;font-weight:700;color:#444;margin-bottom:6px;">لا توجد توصيات أو قرارات بعد</div>'
      +'<div style="font-size:13px;">يمكن إضافة توصيات المجلس من لوحة التحكم ← تبويب الاستطلاعات</div></div>';
    return;
  }

  /* تجميع التوصيات حسب الاستطلاع المرتبط */
  var grouped={};
  var ungrouped=[];
  decisions.forEach(function(d){
    var svKey=d.survey||'';
    if(svKey){
      if(!grouped[svKey]) grouped[svKey]=[];
      grouped[svKey].push(d);
    } else {
      ungrouped.push(d);
    }
  });

  var h='<div style="font-size:13px;font-weight:700;color:#0f3d26;margin-bottom:14px;padding:8px 12px;background:#f0fdf4;border-radius:8px;border-right:3px solid #0f3d26;">🏛 توصيات وقرارات مجلس الإدارة</div>';

  function renderDecision(d){
    var typ=d.type||'rec';
    var col=typeColor[typ]||'#0f3d26';
    var bg=typeBg[typ]||'#f0fdf4';
    var label=typeMap[typ]||'توصية';
    var icon=typeIcon[typ]||'📌';
    var s='<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:10px;">';
    s+='<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">';
    s+='<div style="min-width:34px;height:34px;background:'+bg+';border:2px solid '+col+';border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;">'+icon+'</div>';
    s+='<div style="flex:1;"><div style="font-weight:700;color:#0f3d26;font-size:14px;">'+d.title+'</div>';
    s+='<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:4px;">';
    s+='<span style="background:'+bg+';color:'+col+';border:1px solid '+col+';padding:1px 8px;border-radius:10px;font-size:10px;font-weight:700;">'+label+'</span>';
    if(d.date) s+='<span style="font-size:10px;color:#888;">📅 '+d.date+'</span>';
    if(d.resp) s+='<span style="font-size:10px;color:#888;">👤 '+d.resp+'</span>';
    if(d.deadline) s+='<span style="font-size:10px;color:#888;">⏰ '+d.deadline+'</span>';
    s+='</div></div></div>';
    if(d.text||d.body){
      s+='<div style="background:#f9fafb;border-radius:8px;padding:12px;font-size:13px;color:#333;line-height:1.8;margin-bottom:8px;white-space:pre-wrap;">'+(d.text||d.body)+'</div>';
    }
    var pdfs=d.pdfs||[];
    if(pdfs.length){
      s+='<div>';
      pdfs.forEach(function(p){
        var url=typeof p==='string'?p:(p.url||'');
        var name=typeof p==='string'?p.split('/').pop():(p.name||'وثيقة');
        s+='<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:'+bg+';border-radius:7px;margin-bottom:5px;">';
        s+='<span>📄</span><div style="flex:1;font-size:12px;font-weight:600;color:'+col+';">'+name+'</div>';
        if(url) s+='<a href="'+url+'" target="_blank" style="background:'+col+';color:#fff;border-radius:6px;padding:4px 10px;font-size:11px;font-family:Tajawal,sans-serif;text-decoration:none;">عرض ←</a>';
        s+='</div>';
      });
      s+='</div>';
    }
    s+='</div>';
    return s;
  }

  /* التوصيات المرتبطة باستطلاع */
  Object.keys(grouped).forEach(function(svKey){
    h+='<div style="margin-bottom:20px;">';
    h+='<div style="background:linear-gradient(135deg,#0f3d26,#1a5c38);border-radius:12px;padding:14px 18px;margin-bottom:12px;display:flex;align-items:center;gap:10px;">';
    h+='<span style="font-size:20px;">📋</span>';
    h+='<div><div style="font-weight:700;color:#fff;font-size:14px;">'+svKey+'</div>';
    h+='<div style="font-size:11px;color:rgba(255,255,255,.7);">'+grouped[svKey].length+' توصية/قرار</div></div></div>';
    grouped[svKey].forEach(function(d){ h+=renderDecision(d); });
    h+='</div>';
  });

  /* التوصيات غير المرتبطة */
  if(ungrouped.length){
    h+='<div style="margin-bottom:20px;">';
    h+='<div style="background:#f3f4f6;border-radius:10px;padding:12px 16px;margin-bottom:12px;font-weight:700;color:#444;font-size:13px;">🏛 توصيات عامة</div>';
    ungrouped.forEach(function(d){ h+=renderDecision(d); });
    h+='</div>';
  }

  el.innerHTML=h;
}


/* ════════════ CMS AUTH ════════════ */

/* ── تبويبات لوحة التحكم ── */
var CMS_ALL_TABS = ['global','navbar','hero','achiev','stats','projects','partners','news','events','testimonials','surveys','sections','regforms','footer','users','maintenance'];
var CMS_TAB_LABELS = {
  global:'الإعدادات العامة',navbar:'القائمة العلوية',hero:'الهيرو',
  achiev:'الإنجازات',stats:'الأرقام',projects:'المشاريع',
  partners:'الشركاء',news:'الأخبار',events:'الفعاليات',
  testimonials:'الآراء',surveys:'الاستطلاعات',sections:'الأقسام',
  regforms:'النماذج',footer:'الفوتر',users:'المستخدمون',maintenance:'الصيانة'
};

/* ── الجلسة الحالية ── */
var _cmsSession = null;

function getCmsSession(){
  try{ return JSON.parse(localStorage.getItem('cms_session')||'null'); }catch(e){return null;}
}
function getCmsToken(){
  var session = getCmsSession();
  return session && session.token ? session.token : '';
}
function cmsAuthHeaders(base){
  var headers = base || {};
  var token = getCmsToken();
  if(token) headers['X-CMS-Token'] = token;
  return headers;
}
function setCmsSession(data){
  localStorage.setItem('cms_session', JSON.stringify(data));
  _cmsSession = data;
  /* حفظ الـ token في Cookie حتى يستطيع PHP التحقق منه */
  if(data && data.token){
    var exp = new Date(Date.now() + 30*24*3600*1000).toUTCString();
    document.cookie = 'cms_token=' + encodeURIComponent(data.token) + '; expires=' + exp + '; path=/mosque; SameSite=Strict' + (location.protocol==='https:'?'; Secure':'');
  }
}
function clearCmsSession(){
  localStorage.removeItem('cms_session');
  document.cookie = 'cms_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/mosque; SameSite=Strict' + (location.protocol==='https:'?'; Secure':'');
  _cmsSession = null;
}

/* ── تسجيل الدخول ── */
function doLogin(){
  var email = document.getElementById('login-email').value.trim();
  var pass  = document.getElementById('login-pass').value;
  var errEl = document.getElementById('login-error');
  var btn   = document.getElementById('login-btn');
  if(!email||!pass){errEl.style.display='block';errEl.textContent='أدخل البريد وكلمة المرور';return;}
  btn.disabled=true; btn.textContent='جارٍ التحقق...';
  errEl.style.display='none';
  fetch('/mosque/api/cms_auth.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'login',email:email,password:pass})
  }).then(function(r){return r.json();})
  .then(function(res){
    btn.disabled=false; btn.textContent='دخول ←';
    if(res.success){
      setCmsSession(res.user);
      document.getElementById('cms-login-overlay').classList.add('hidden');
      applyUserPermissions(res.user);
      toast('أهلاً '+res.user.name+' ✓');
    } else {
      errEl.style.display='block';
      errEl.textContent = res.error||'بيانات الدخول غير صحيحة';
    }
  }).catch(function(){
    btn.disabled=false; btn.textContent='دخول ←';
    errEl.style.display='block';
    errEl.textContent='خطأ في الاتصال — تحقق من الشبكة';
  });
}

/* ── نسيت كلمة المرور ── */
function showForgotPassword(){
  var email = document.getElementById('login-email').value.trim();
  var entered = prompt('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:', email);
  if(!entered) return;
  fetch('/mosque/api/cms_auth.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'forgot',email:entered})
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success){
      alert('تم إرسال رابط إعادة التعيين لبريدك الإلكتروني ✓\nافحص صندوق الوارد أو مجلد Spam');
    } else {
      alert('خطأ: '+(res.error||'البريد غير مسجل'));
    }
  }).catch(function(){ alert('خطأ في الاتصال'); });
}

/* ── تطبيق الصلاحيات ── */
function applyUserPermissions(user){
  if(!user) return;
  /* التبويبات الحصرية للمشرف العام دائماً */
  var adminOnlyTabs = ['users','maintenance'];
  /* للمشرف: كل التبويبات. للمحدود: فقط المسموح بها */
  var allowedTabs = user.role==='admin' ? CMS_ALL_TABS : (user.tabs||[]);

  document.querySelectorAll('.cms-tab').forEach(function(btn){
    /* استخرج اسم التبويب من onclick */
    var onclickVal = btn.getAttribute('onclick')||'';
    var match = onclickVal.match(/G\('([^']+)'\)/);
    var tab = btn.getAttribute('data-tab') || (match ? match[1] : null);
    if(!tab) return;

    if(user.role==='admin'){
      /* المشرف يرى كل شيء */
      btn.style.display='';
    } else if(adminOnlyTabs.indexOf(tab)!==-1){
      /* تبويبات المستخدمين والصيانة للمشرف فقط */
      btn.style.display='none';
    } else if(allowedTabs.indexOf(tab)===-1){
      btn.style.display='none';
    } else {
      btn.style.display='';
    }
  });

  /* إضافة اسم المستخدم */
  var nameEl = document.getElementById('cms-user-name');
  if(nameEl) nameEl.textContent = user.name;
}

/* ── تسجيل الخروج ── */
function cmsLogout(){
  clearCmsSession();
  location.reload();
}

/* ── فحص الجلسة عند التحميل ── */
function checkCmsAuth(){
  var session = getCmsSession();
  if(!session||!session.token) return false;
  /* التحقق من صلاحية التوكن مع الخادم */
  fetch('/mosque/api/cms_auth.php',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'verify',token:session.token})
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success){
      _cmsSession=res.user;
      applyUserPermissions(res.user);
    } else {
      clearCmsSession();
    }
  }).catch(function(){});
  return true;
}

/* ── Override toggleCMS ── */
var _originalToggleCMS = toggleCMS;
toggleCMS = function(){
  var session = getCmsSession();
  if(!session||!session.token){
    /* أعد التحقق من الخادم */
    var overlay = document.getElementById('cms-login-overlay');
    if(overlay) overlay.classList.remove('hidden');
    setTimeout(function(){
      var emailInput = document.getElementById('login-email');
      if(emailInput) emailInput.focus();
    },100);
    return;
  }
  _originalToggleCMS();
};

/* ════════════ MAINTENANCE ════════════ */
var _maintInterval = null;

function initMaintenance(){
  var m = S.maintenance||{};
  if(!m.enabled) return;
  /* ── استثناء 1: مسارات /admin لا تُحجب أبداً ── */
  if(window.location.pathname.indexOf('/admin') !== -1) return;
  /* ── استثناء 2: IS_ADMIN محقون من PHP (مشرف مسجّل من الخادم) ── */
  if(typeof IS_ADMIN !== 'undefined' && IS_ADMIN === true) return;
  /* لا نعتمد على localStorage وحده لتجاوز الصيانة؛ الصلاحية الحقيقية تأتي من PHP. */
  /* ── إذا انتهى الوقت → أوقف آلياً ── */
  if(m.until){
    var remaining = new Date(m.until) - new Date();
    if(remaining <= 0){
      S.maintenance.enabled = false;
      saveState(false);
      return;
    }
  }
  var overlay = document.getElementById('maintenance-overlay');
  var msgEl   = document.getElementById('maint-msg');
  var cdEl    = document.getElementById('maint-countdown');
  if(overlay){
    overlay.classList.remove('hidden');
    if(msgEl) msgEl.textContent = m.message||'الموقع قيد التطوير';
    if(m.until && cdEl){
      startCountdown(new Date(m.until), cdEl, overlay);
    } else if(cdEl){
      cdEl.innerHTML = '';
    }
  }
}

function startCountdown(targetDate, el, overlay){
  function tick(){
    var now  = new Date();
    var diff = targetDate - now;
    if(diff <= 0){
      /* ── انتهى الوقت: أوقف الصيانة وأخفِ الشاشة آلياً ── */
      clearInterval(_maintInterval);
      if(overlay) overlay.classList.add('hidden');
      if(S.maintenance) S.maintenance.enabled = false;
      autoSave();
      return;
    }
    var months= Math.floor(diff/(30*86400000));
    var days  = Math.floor((diff%(30*86400000))/86400000);
    var hours = Math.floor((diff%86400000)/3600000);
    var mins  = Math.floor((diff%3600000)/60000);
    var secs  = Math.floor((diff%60000)/1000);
    el.innerHTML =
      '<div class="maint-unit"><div class="maint-num">'+pad(months)+'</div><div class="maint-label">شهر</div></div>'+
      '<div class="maint-unit"><div class="maint-num">'+pad(days)+'</div><div class="maint-label">يوم</div></div>'+
      '<div class="maint-unit"><div class="maint-num">'+pad(hours)+'</div><div class="maint-label">ساعة</div></div>'+
      '<div class="maint-unit"><div class="maint-num">'+pad(mins)+'</div><div class="maint-label">دقيقة</div></div>'+
      '<div class="maint-unit"><div class="maint-num">'+pad(secs)+'</div><div class="maint-label">ثانية</div></div>';
  }
  function pad(n){return n<10?'0'+n:n;}
  tick();
  _maintInterval = setInterval(tick,1000);
}

/* ════════════ CMS USERS PANEL ════════════ */
/* ══════════════════════════════════════════════════════
   تبويب المستخدمين — النسخة الاحترافية
══════════════════════════════════════════════════════ */
function pCmsUsers(){
  var users = S.cmsUsers||[];
  var session = getCmsSession();
  var currentEmail = session ? session.email : '';

  var h = '';

  /* ── بطاقة المستخدم الرئيسي ── */
  h += '<div class="sh">👤 المستخدم الرئيسي</div>';
  h += '<div class="pnl-card" style="display:block;margin-bottom:16px;">';
  h += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">';
  h += '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#0f3d26,#1a5c38);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">👑</div>';
  h += '<div><div style="font-weight:700;font-size:15px;color:#0f3d26;">'+(session?session.name:'المدير العام')+'</div>';
  h += '<div style="font-size:12px;color:#888;margin-top:2px;">'+(currentEmail||'admin@mosqueksa.org')+'</div>';
  h += '<span style="background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-top:4px;display:inline-block;">مدير عام</span></div></div>';

  /* تغيير الاسم */
  h += '<div class="pnl-grid2">';
  h += '<div class="pnl-field"><label>الاسم الكامل</label>';
  h += '<input class="is" id="edit-main-name" type="text" value="'+(session?session.name:'')+'" placeholder="أدخل الاسم"></div>';
  h += '<div class="pnl-field"><label>البريد الإلكتروني</label>';
  h += '<input class="is" id="edit-main-email" type="email" value="'+currentEmail+'" placeholder="أدخل البريد"></div>';
  h += '</div>';

  /* تغيير كلمة المرور */
  h += '<div style="background:#f8fdf9;border:1px solid #d1fae5;border-radius:8px;padding:12px;margin:10px 0;">';
  h += '<div style="font-weight:600;font-size:12px;color:#0f3d26;margin-bottom:8px;">🔑 تغيير كلمة المرور</div>';
  h += '<div class="pnl-grid2">';
  h += '<div class="pnl-field"><label>كلمة المرور الجديدة</label><input class="is" id="edit-main-pass" type="password" placeholder="اتركه فارغاً للإبقاء على الحالي"></div>';
  h += '<div class="pnl-field"><label>تأكيد كلمة المرور</label><input class="is" id="edit-main-pass2" type="password" placeholder="أعد إدخال كلمة المرور"></div>';
  h += '</div></div>';

  h += '<button class="sbtn" style="background:#0f3d26;color:#fff;border-color:#0f3d26;" onclick="saveMainUser()">💾 حفظ التغييرات</button>';
  h += '</div>';

  /* ── المستخدمون الآخرون ── */
  h += '<div class="sh" style="margin-top:8px;">👥 المستخدمون الآخرون';
  h += '<button class="sbtn" style="float:left;margin-top:-2px;" onclick="showAddUserForm()">+ إضافة مستخدم</button></div>';

  /* فورم إضافة مستخدم */
  h += '<div id="add-user-form" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:12px;">';
  h += '<div style="font-weight:700;font-size:13px;color:#0f3d26;margin-bottom:10px;">إضافة مستخدم جديد</div>';
  h += '<div class="pnl-grid2">';
  h += '<div class="pnl-field"><label>الاسم</label><input class="is" id="new-user-name" placeholder="اسم المستخدم"></div>';
  h += '<div class="pnl-field"><label>البريد الإلكتروني</label><input class="is" id="new-user-email" type="email" placeholder="example@domain.com"></div>';
  h += '</div>';
  h += '<div class="pnl-grid2">';
  h += '<div class="pnl-field"><label>كلمة المرور المؤقتة</label><input class="is" id="new-user-pass" placeholder="ستُرسل للبريد تلقائياً"></div>';
  h += '<div class="pnl-field"><label>الصلاحية</label>';
  h += '<select class="is" id="new-user-role" onchange="toggleNewUserTabs(this.value)">';
  h += '<option value="limited">مستخدم محدود</option>';
  h += '<option value="admin">مدير عام</option>';
  h += '</select></div>';
  h += '</div>';
  h += '<div id="new-user-tabs-wrap" style="margin-bottom:10px;">';
  h += '<div style="font-size:12px;font-weight:600;color:#555;margin-bottom:6px;">التبويبات المسموح بها:</div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
  for(var t=0;t<CMS_ALL_TABS.length;t++){
    var tab=CMS_ALL_TABS[t];
    if(tab==='users'||tab==='maintenance') continue;
    h += '<label style="display:flex;align-items:center;gap:4px;font-size:11px;background:#fff;border:1px solid #d1fae5;padding:4px 8px;border-radius:6px;cursor:pointer;">';
    h += '<input type="checkbox" class="new-user-tab-cb" value="'+tab+'"> '+(CMS_TAB_LABELS[tab]||tab)+'</label>';
  }
  h += '</div></div>';
  h += '<div style="display:flex;gap:8px;">';
  h += '<button class="sbtn" style="background:#0f3d26;color:#fff;border-color:#0f3d26;" onclick="submitAddUser()">✅ إضافة</button>';
  h += '<button class="sbtn" onclick="document.getElementById(\'add-user-form\').style.display=\'none\'">إلغاء</button>';
  h += '</div></div>';

  if(!users.length){
    h += '<div style="text-align:center;padding:30px;color:#aaa;background:#fafafa;border-radius:10px;border:2px dashed #e5e0d8;">';
    h += '<div style="font-size:36px;margin-bottom:8px;">👤</div>';
    h += '<div style="font-size:13px;">لا يوجد مستخدمون إضافيون</div></div>';
  }

  /* قائمة المستخدمين */
  for(var i=0;i<users.length;i++){
    var u=users[i];
    var isMainUser = (u.email === currentEmail);
    var roleColor = u.role==='admin' ? {bg:'#d1fae5',fg:'#065f46',lbl:'مدير عام'} : {bg:'#fef3c7',fg:'#92400e',lbl:'محدود'};
    var statusColor = u.is_active!==false ? {bg:'#dcfce7',fg:'#16a34a',lbl:'نشط'} : {bg:'#fee2e2',fg:'#dc2626',lbl:'موقوف'};

    h += '<div class="pnl-card" style="display:block;margin-bottom:10px;padding:0;overflow:hidden;" id="ucard-'+i+'">';
    /* رأس البطاقة */
    h += '<div style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid #f0ede7;background:#fafdf9;">';
    h += '<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1a5c38,#2d8653);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">👤</div>';
    h += '<div style="flex:1;">';
    h += '<div style="font-weight:700;font-size:14px;color:#0f3d26;">'+u.name+'</div>';
    h += '<div style="font-size:11px;color:#888;">'+u.email+'</div>';
    h += '<div style="display:flex;gap:6px;margin-top:4px;">';
    h += '<span style="background:'+roleColor.bg+';color:'+roleColor.fg+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">'+roleColor.lbl+'</span>';
    h += '<span style="background:'+statusColor.bg+';color:'+statusColor.fg+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">'+statusColor.lbl+'</span>';
    h += '</div></div>';
    h += '<div style="display:flex;gap:6px;">';
    h += '<button class="sbtn" style="padding:5px 10px;font-size:11px;" onclick="toggleUserCard('+i+')">✏ تعديل</button>';
    if(!isMainUser) h += '<button class="delbtn" onclick="delCmsUser('+i+')">🗑</button>';
    h += '</div></div>';

    /* تفاصيل قابلة للطي */
    h += '<div id="udetail-'+i+'" style="display:none;padding:14px;">';
    h += '<div class="pnl-grid2">';
    h += '<div class="pnl-field"><label>الاسم</label><input class="is" value="'+u.name+'" data-i="'+i+'" oninput="S.cmsUsers[parseInt(this.dataset.i)].name=this.value;autoSave()"></div>';
    h += '<div class="pnl-field"><label>البريد الإلكتروني</label><input class="is" type="email" value="'+u.email+'" data-i="'+i+'" oninput="S.cmsUsers[parseInt(this.dataset.i)].email=this.value;autoSave()"></div>';
    h += '</div>';
    h += '<div class="pnl-field"><label>الصلاحية</label>';
    h += '<select class="is" data-i="'+i+'" onchange="changeCmsUserRole(parseInt(this.dataset.i),this.value)">';
    h += '<option value="admin" '+(u.role==='admin'?'selected':'')+'>مدير عام (كل الصلاحيات)</option>';
    h += '<option value="limited" '+(u.role==='limited'?'selected':'')+'>مستخدم محدود</option>';
    h += '</select></div>';

    if(u.role==='limited'){
      h += '<div class="pnl-field"><label>التبويبات المسموح بها</label>';
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">';
      var allowedTabs=u.tabs||[];
      for(var t2=0;t2<CMS_ALL_TABS.length;t2++){
        var tab2=CMS_ALL_TABS[t2];
        if(tab2==='users'||tab2==='maintenance') continue;
        var checked=allowedTabs.indexOf(tab2)>-1;
        h += '<label style="display:flex;align-items:center;gap:4px;font-size:11px;background:#f3f4f6;padding:4px 8px;border-radius:6px;cursor:pointer;">';
        h += '<input type="checkbox" '+(checked?'checked':'')+' data-i="'+i+'" data-tab="'+tab2+'" onchange="toggleCmsUserTab(parseInt(this.dataset.i),this.dataset.tab,this.checked)"> ';
        h += (CMS_TAB_LABELS[tab2]||tab2)+'</label>';
      }
      h += '</div></div>';
    }

    h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
    h += '<button class="sbtn" onclick="resetCmsUserPassword('+i+')">🔑 إرسال رابط إعادة تعيين كلمة المرور</button>';
    h += '<button class="sbtn" style="background:'+(u.is_active!==false?'#fef3c7':'#d1fae5')+';color:'+(u.is_active!==false?'#92400e':'#065f46')+';border-color:currentColor;" onclick="toggleUserActive('+i+')">';
    h += (u.is_active!==false?'⏸ إيقاف الحساب مؤقتاً':'▶ تفعيل الحساب')+'</button>';
    h += '</div></div></div>';
  }

  return h;
}

/* ══════════════════════════════════════════════════════
   تبويب الصيانة — مستقل واحترافي
══════════════════════════════════════════════════════ */
function pMaintenance(){
  var m = S.maintenance||{};
  var isOn = !!m.enabled;
  var until = m.until||'';
  var remaining = until ? (new Date(until) - new Date()) : 0;
  var timeLeft = '';
  if(remaining > 0){
    var d=Math.floor(remaining/86400000), hh=Math.floor((remaining%86400000)/3600000), mm=Math.floor((remaining%3600000)/60000);
    timeLeft = (d?d+' يوم ':'')+( hh?hh+' ساعة ':'')+mm+' دقيقة';
  }

  var h = '';

  /* بطاقة الحالة الحالية */
  h += '<div class="sh">🔒 حالة الموقع</div>';
  h += '<div class="pnl-card" style="display:block;margin-bottom:16px;'+(isOn?'border-right:4px solid #dc2626;':'border-right:4px solid #16a34a;')+'">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">';
  h += '<div style="display:flex;align-items:center;gap:14px;">';
  h += '<div style="width:52px;height:52px;border-radius:50%;background:'+(isOn?'#fee2e2':'#dcfce7')+';display:flex;align-items:center;justify-content:center;font-size:24px;">'+(isOn?'🔴':'🟢')+'</div>';
  h += '<div>';
  h += '<div style="font-size:17px;font-weight:700;color:'+(isOn?'#dc2626':'#16a34a')+'">'+(isOn?'الموقع مغلق للصيانة':'الموقع يعمل بشكل طبيعي')+'</div>';
  if(isOn && until) h += '<div style="font-size:12px;color:#888;margin-top:3px;">ينتهي: '+until.replace('T',' ')+(timeLeft?' — المتبقي: '+timeLeft:'')+'</div>';
  h += '</div></div>';

  /* مفتاح التشغيل */
  h += '<div style="display:flex;align-items:center;gap:10px;">';
  h += '<span style="font-size:13px;color:#555;">'+(isOn?'إيقاف الصيانة':'تفعيل الصيانة')+'</span>';
  h += '<label style="position:relative;width:52px;height:28px;cursor:pointer;">';
  h += '<input type="checkbox" '+(isOn?'checked':'')+' style="opacity:0;width:0;height:0;" onchange="toggleMaintenance(this.checked)">';
  h += '<span style="position:absolute;inset:0;background:'+(isOn?'#dc2626':'#cbd5e1')+';border-radius:28px;transition:.3s;"></span>';
  h += '<span style="position:absolute;top:4px;'+(isOn?'right:4px':'left:4px')+';width:20px;height:20px;background:#fff;border-radius:50%;transition:.3s;"></span>';
  h += '</label></div>';
  h += '</div></div>';

  /* إعدادات الصيانة */
  h += '<div class="sh" style="margin-top:4px;">⚙ إعدادات الصيانة</div>';
  h += '<div class="pnl-card" style="display:block;margin-bottom:16px;">';

  /* رسالة الصيانة */
  h += '<div class="pnl-field"><label>📢 رسالة تظهر للزوار</label>';
  h += '<textarea class="is" id="maint-msg-input" style="min-height:80px;resize:vertical;" oninput="if(!S.maintenance)S.maintenance={};S.maintenance.message=this.value;">'+( m.message||'الموقع قيد التطوير — سنعود قريباً')+'</textarea></div>';

  /* التاريخ */
  h += '<div class="pnl-grid2">';
  h += '<div class="pnl-field"><label>📅 موعد انتهاء الصيانة</label>';
  h += '<input class="is" id="maint-until-input" type="datetime-local" value="'+until+'" oninput="if(!S.maintenance)S.maintenance={};S.maintenance.until=this.value;">';
  h += '<div style="font-size:11px;color:#888;margin-top:4px;">عند انتهاء الموعد يعود الموقع آلياً</div></div>';
  h += '<div class="pnl-field" style="align-self:end;">';
  h += '<button class="sbtn" style="width:100%;background:#0f3d26;color:#fff;border-color:#0f3d26;padding:11px;" onclick="applyMaintenanceNow()">💾 حفظ الإعدادات وتطبيقها</button>';
  h += '</div></div>';
  h += '</div>';

  /* معاينة شاشة الصيانة */
  h += '<div class="sh" style="margin-top:4px;">👁 معاينة شاشة الصيانة</div>';
  h += '<div style="background:linear-gradient(135deg,#0f3d26,#1a5c38);border-radius:12px;padding:36px 20px;text-align:center;color:#fff;">';
  h += '<div style="font-size:48px;margin-bottom:12px;">🔧</div>';
  h += '<div style="font-size:20px;font-weight:700;margin-bottom:8px;">الموقع قيد التطوير</div>';
  h += '<div style="font-size:14px;color:rgba(255,255,255,.8);margin-bottom:20px;">'+(m.message||'الموقع قيد التطوير — سنعود قريباً')+'</div>';
  h += '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">';
  var labels=['شهر','يوم','ساعة','دقيقة','ثانية'];
  for(var li=0;li<5;li++){
    h += '<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:14px 18px;min-width:70px;">';
    h += '<div style="font-size:26px;font-weight:700;">00</div>';
    h += '<div style="font-size:11px;color:rgba(255,255,255,.7);margin-top:3px;">'+labels[li]+'</div></div>';
  }
  h += '</div></div>';

  /* نصائح */
  h += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-top:16px;">';
  h += '<div style="font-weight:700;font-size:12px;color:#92400e;margin-bottom:8px;">💡 ملاحظات مهمة</div>';
  h += '<ul style="font-size:12px;color:#78350f;padding-right:16px;line-height:2;">';
  h += '<li>لوحة التحكم متاحة دائماً حتى أثناء الصيانة عبر رابط: <code style="background:#fff;padding:1px 5px;border-radius:4px;">/mosque/admin/login</code></li>';
  h += '<li>عند انتهاء موعد الصيانة يعود الموقع للعمل آلياً بدون أي تدخل</li>';
  h += '<li>إذا لم يظهر الغلق للزوار انتظر دقيقة أو حدّث الصفحة</li>';
  h += '</ul></div>';

  return h;
}

/* ── دوال المستخدمين ── */
function addCmsUser(){
  if(!S.cmsUsers) S.cmsUsers=[];
  var email = prompt('أدخل البريد الإلكتروني للمستخدم الجديد:');
  if(!email||!email.includes('@')){toast('بريد إلكتروني غير صحيح');return;}
  var name = prompt('أدخل اسم المستخدم:');
  if(!name){return;}
  var tempPass = Math.random().toString(36).slice(-8);
  fetch('/mosque/api/cms_auth.php',{
    method:'POST',
    headers:cmsAuthHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify({action:'create_user',email:email,name:name,password:tempPass,role:'limited',tabs:[]})
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success){
      S.cmsUsers.push({name:name,email:email,role:'limited',tabs:[]});
      autoSave();
      _renderSt('users');
      toast('تم إنشاء المستخدم ✓\nكلمة المرور المؤقتة: '+tempPass+'\n(تم إرسالها للبريد)');
      alert('تم إنشاء المستخدم ✓\nالبريد: '+email+'\nكلمة المرور المؤقتة: '+tempPass+'\n\nتم إرسال البيانات للبريد الإلكتروني.');
    } else {
      toast('خطأ: '+(res.error||''));
    }
  }).catch(function(){toast('خطأ في الاتصال');});
}

function delCmsUser(i){
  if(!confirm('حذف المستخدم؟')) return;
  var email = (S.cmsUsers[i]||{}).email;
  S.cmsUsers.splice(i,1);
  autoSave();
  if(email) fetch('/mosque/api/cms_auth.php',{method:'POST',headers:cmsAuthHeaders({'Content-Type':'application/json'}),body:JSON.stringify({action:'delete_user',email:email})});
  _renderSt('users');
}

function changeCmsUserRole(i,role){
  S.cmsUsers[i].role=role;
  if(role==='admin') S.cmsUsers[i].tabs=CMS_ALL_TABS.slice();
  autoSave();
  _renderSt('users');
}

function toggleCmsUserTab(i,tab,checked){
  if(!S.cmsUsers[i].tabs) S.cmsUsers[i].tabs=[];
  var idx=S.cmsUsers[i].tabs.indexOf(tab);
  if(checked&&idx===-1) S.cmsUsers[i].tabs.push(tab);
  if(!checked&&idx>-1) S.cmsUsers[i].tabs.splice(idx,1);
  autoSave();
  /* تحديث صلاحيات المستخدم في الخادم */
  fetch('/mosque/api/cms_auth.php',{method:'POST',headers:cmsAuthHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify({action:'update_tabs',email:S.cmsUsers[i].email,tabs:S.cmsUsers[i].tabs})});
}

function resetCmsUserPassword(i){
  var email = (S.cmsUsers[i]||{}).email;
  if(!email){toast('لا يوجد بريد إلكتروني');return;}
  if(!confirm('إرسال رابط إعادة تعيين كلمة المرور لـ '+email+'؟')) return;
  fetch('/mosque/api/cms_auth.php',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'forgot',email:email})
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success) toast('تم إرسال رابط إعادة التعيين ✓');
    else toast('خطأ: '+(res.error||''));
  }).catch(function(){toast('خطأ في الاتصال');});
}

function toggleMaintenance(enabled){
  if(!S.maintenance) S.maintenance={};
  /* اقرأ الرسالة والموعد من الحقول إن كانت مفتوحة */
  var msgEl   = document.getElementById('maint-msg-input');
  var untilEl = document.getElementById('maint-until-input');
  if(msgEl)   S.maintenance.message = msgEl.value;
  if(untilEl) S.maintenance.until   = untilEl.value;
  S.maintenance.enabled = enabled;
  saveState(false);
  _renderSt('maintenance');
}

function applyMaintenanceNow(){
  if(!S.maintenance) S.maintenance={};
  var msgEl   = document.getElementById('maint-msg-input');
  var untilEl = document.getElementById('maint-until-input');
  if(msgEl)   S.maintenance.message = msgEl.value;
  if(untilEl) S.maintenance.until   = untilEl.value;
  saveState(false);
  toast('تم حفظ إعدادات الصيانة وتطبيقها ✓');
  _renderSt('maintenance');
  if(S.maintenance.enabled) initMaintenance();
}

/* ── دوال المستخدم الرئيسي ── */
function saveMainUser(){
  var name  = (document.getElementById('edit-main-name')||{}).value||'';
  var email = (document.getElementById('edit-main-email')||{}).value||'';
  var pass  = (document.getElementById('edit-main-pass')||{}).value||'';
  var pass2 = (document.getElementById('edit-main-pass2')||{}).value||'';
  if(pass && pass !== pass2){ toast('كلمات المرور غير متطابقة ✗'); return; }
  var payload = {action:'update_main_user', name:name, email:email};
  if(pass) payload.password = pass;
  fetch('/mosque/api/cms_auth.php',{
    method:'POST', headers:cmsAuthHeaders({'Content-Type':'application/json'}), body:JSON.stringify(payload)
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success){
      toast('تم حفظ البيانات ✓');
      var s = getCmsSession();
      if(s){ s.name=name; s.email=email; setCmsSession(s); }
    } else { toast('خطأ: '+(res.error||'')); }
  }).catch(function(){ toast('خطأ في الاتصال'); });
}

/* ── إظهار/إخفاء تفاصيل بطاقة المستخدم ── */
function toggleUserCard(i){
  var d = document.getElementById('udetail-'+i);
  if(d) d.style.display = d.style.display==='none' ? 'block' : 'none';
}

/* ── إيقاف/تفعيل حساب مستخدم ── */
function toggleUserActive(i){
  if(!S.cmsUsers[i]) return;
  S.cmsUsers[i].is_active = S.cmsUsers[i].is_active === false ? true : false;
  autoSave();
  _renderSt('users');
}

/* ── إظهار فورم إضافة مستخدم ── */
function showAddUserForm(){
  var f = document.getElementById('add-user-form');
  if(f) f.style.display = f.style.display==='none' ? 'block' : 'none';
}

/* ── تبديل التبويبات في فورم الإضافة ── */
function toggleNewUserTabs(role){
  var w = document.getElementById('new-user-tabs-wrap');
  if(w) w.style.display = role==='limited' ? 'block' : 'none';
}

/* ── إرسال فورم إضافة مستخدم ── */
function submitAddUser(){
  var name  = (document.getElementById('new-user-name')||{}).value||'';
  var email = (document.getElementById('new-user-email')||{}).value||'';
  var pass  = (document.getElementById('new-user-pass')||{}).value||'';
  var role  = (document.getElementById('new-user-role')||{}).value||'limited';
  if(!name||!email||!email.includes('@')){ toast('أدخل الاسم والبريد الإلكتروني بشكل صحيح'); return; }
  var tempPass = pass || Math.random().toString(36).slice(-8)+'A1';
  var tabs = [];
  document.querySelectorAll('.new-user-tab-cb:checked').forEach(function(cb){ tabs.push(cb.value); });
  if(role==='admin') tabs = CMS_ALL_TABS.slice();
  fetch('/mosque/api/cms_auth.php',{
    method:'POST', headers:cmsAuthHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify({action:'create_user', email:email, name:name, password:tempPass, role:role, tabs:tabs})
  }).then(function(r){return r.json();})
  .then(function(res){
    if(res.success){
      if(!S.cmsUsers) S.cmsUsers=[];
      S.cmsUsers.push({name:name, email:email, role:role, tabs:tabs, is_active:true});
      autoSave();
      _renderSt('users');
      alert('تم إنشاء المستخدم ✓\nالبريد: '+email+'\nكلمة المرور المؤقتة: '+tempPass+'\n\nاحفظ هذه البيانات وشاركها مع المستخدم.');
    } else { toast('خطأ: '+(res.error||'')); }
  }).catch(function(){ toast('خطأ في الاتصال'); });
}


/* ════════════ CMS SURVEYS PANEL OVERRIDE ════════════ */
function pSurveys(){
  if(!S.surveys) S.surveys=[];
  if(!S.analysisReports) S.analysisReports=[];
  if(!S.boardDecisions) S.boardDecisions=[];
  var surveyOptions='<option value="">— اختر الاستطلاع —</option>'+(S.surveys||[]).map(function(sv){return '<option value="'+esc(sv.title)+'">'+esc(sv.title)+'</option>';}).join('');
  var h='';
  h+='<div class="sh">📋 إدارة الاستطلاعات</div>';
  h+='<div class="note">من هنا تنشئ الاستطلاعات وأسئلتها، ثم تضيف تقارير التحليل وتوصيات المجلس المرتبطة بكل استطلاع.</div>';

  h+='<div class="cms-work-grid">';
  h+='<div class="cms-work-card"><div class="cms-work-title">📋 الاستطلاعات والأسئلة</div>';
  h+=(S.surveys||[]).map(function(sv,i){
    return '<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">'+esc(sv.icon||'📋')+' '+esc((sv.title||'استطلاع').substring(0,28))+'</span><div style="display:flex;gap:4px;align-items:center;"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();svDel('+i+')">🗑</button></div></div>'+
    '<div class="ibox-body"><div class="g2"><div class="fg"><label>عنوان الاستطلاع</label><input class="is" value="'+esc(sv.title||'')+'" oninput="S.surveys['+i+'].title=this.value;renderSurveyList()"></div><div class="fg"><label>الحالة</label><select class="is" onchange="S.surveys['+i+'].status=this.value;renderSurveyList()"><option value="open" '+(sv.status==='open'?'selected':'')+'>مفتوح</option><option value="closed" '+(sv.status==='closed'?'selected':'')+'>مغلق</option></select></div></div>'+
    '<div class="fg"><label>وصف الاستطلاع</label><input class="is" value="'+esc(sv.desc||'')+'" oninput="S.surveys['+i+'].desc=this.value;renderSurveyList()"></div>'+
    '<div class="pnl-section-title">الأسئلة ('+((sv.questions||[]).length)+')</div>'+
    (sv.questions||[]).map(function(q,j){return '<div class="cms-q-row"><input class="is" value="'+esc(q.text||'')+'" oninput="S.surveys['+i+'].questions['+j+'].text=this.value"><select class="is" onchange="svChangeQType('+i+','+j+',this.value)">'+qTypes.map(function(t){return '<option value="'+t.v+'" '+(q.type===t.v?'selected':'')+'>'+t.l+'</option>';}).join('')+'</select><button class="delbtn" onclick="S.surveys['+i+'].questions.splice('+j+',1);G(\'surveys\')">🗑</button></div>'+
      ((q.type!=='text'&&q.type!=='file')?'<textarea class="is" rows="2" placeholder="خيارات السؤال - كل خيار في سطر" oninput="S.surveys['+i+'].questions['+j+'].opts=this.value.split(/\\n/).filter(Boolean)">'+esc((q.opts||[]).join('\n'))+'</textarea>':'');}).join('')+
    '<button class="abtn" onclick="svAddQ('+i+')">+ إضافة سؤال</button></div></div>';
  }).join('');
  h+='<button class="abtn" onclick="svAdd()">+ إنشاء استطلاع جديد</button></div>';

  h+='<div class="cms-work-card"><div class="cms-work-title">🔬 تقارير التحليل</div><div class="note">اختر الاستطلاع ثم أضف نص التحليل أو مرفقات PDF/صور لتظهر في تبويب تقارير التحليل بالموقع.</div>';
  h+=(S.analysisReports||[]).map(function(r,i){var files=r.files||r.pdfs||[];return '<div class="ibox open"><div class="ibox-hd"><span class="ibox-t">🔬 '+esc(r.title||'تقرير تحليل')+'</span><button class="delbtn" onclick="S.analysisReports.splice('+i+',1);renderAnalysis();G(\'surveys\')">🗑</button></div><div class="ibox-body" style="display:block">'+
    '<div class="g2"><div class="fg"><label>الاستطلاع المرتبط</label><select class="is" onchange="S.analysisReports['+i+'].survey=this.value;renderAnalysis()">'+surveyOptions.replace('value="'+esc(r.survey||'')+'"','value="'+esc(r.survey||'')+'" selected')+'</select></div><div class="fg"><label>التاريخ</label><input class="is" value="'+esc(r.date||'')+'" oninput="S.analysisReports['+i+'].date=this.value;renderAnalysis()"></div></div>'+
    '<div class="fg"><label>عنوان التقرير</label><input class="is" value="'+esc(r.title||'')+'" oninput="S.analysisReports['+i+'].title=this.value;renderAnalysis()"></div>'+
    '<div class="fg"><label>نص التحليل</label><textarea class="is" rows="4" oninput="S.analysisReports['+i+'].text=this.value;renderAnalysis()">'+esc(r.text||'')+'</textarea></div>'+
    files.map(function(f,k){return '<div class="cms-file-row"><a href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">'+fileIconByName(f.name)+' '+esc(f.name||'مرفق')+'</a><button class="delbtn" onclick="(S.analysisReports['+i+'].files||S.analysisReports['+i+'].pdfs).splice('+k+',1);G(\'surveys\');renderAnalysis()">✕</button></div>';}).join('')+
    '<button class="abtn" onclick="arUploadPdf('+i+')">📎 رفع PDF أو صورة</button></div></div>';}).join('');
  h+='<button class="abtn" onclick="arAdd()">+ إضافة تقرير تحليل</button></div>';

  h+='<div class="cms-work-card"><div class="cms-work-title">🏛 توصيات مجلس الإدارة</div><div class="note">كل توصية يجب ربطها باستطلاع حتى يعرف الزائر لأي استطلاع تتبع.</div>';
  h+=(S.boardDecisions||[]).map(function(d,i){return '<div class="ibox open"><div class="ibox-hd"><span class="ibox-t">🏛 '+esc(d.title||'توصية')+'</span><button class="delbtn" onclick="S.boardDecisions.splice('+i+',1);renderBoard();G(\'surveys\')">🗑</button></div><div class="ibox-body" style="display:block">'+
    '<div class="g2"><div class="fg"><label>الاستطلاع المرتبط</label><select class="is" onchange="S.boardDecisions['+i+'].survey=this.value;renderBoard()">'+surveyOptions.replace('value="'+esc(d.survey||'')+'"','value="'+esc(d.survey||'')+'" selected')+'</select></div><div class="fg"><label>التاريخ</label><input class="is" value="'+esc(d.date||'')+'" oninput="S.boardDecisions['+i+'].date=this.value;renderBoard()"></div></div>'+
    '<div class="fg"><label>عنوان التوصية</label><input class="is" value="'+esc(d.title||'')+'" oninput="S.boardDecisions['+i+'].title=this.value;renderBoard()"></div>'+
    '<div class="fg"><label>نص التوصية</label><textarea class="is" rows="4" oninput="S.boardDecisions['+i+'].body=this.value;renderBoard()">'+esc(d.body||'')+'</textarea></div>'+
    (d.files||[]).map(function(f,k){return '<div class="cms-file-row"><a href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">📄 '+esc(f.name||'ملف توصية')+'</a><button class="delbtn" onclick="S.boardDecisions['+i+'].files.splice('+k+',1);G(\'surveys\');renderBoard()">✕</button></div>';}).join('')+
    '<button class="abtn" onclick="bdUploadFile('+i+')">📎 رفع PDF للتوصية</button></div></div>';}).join('');
  h+='<button class="abtn" onclick="bdAdd()">+ إضافة توصية</button></div>';
  h+='</div>';
  h+='<button class="sbtn" onclick="saveState(true)">✓ حفظ كل تغييرات الاستطلاعات</button>';
  return h;
}


/* ════════════ CMS PANEL V2 ROUTES ════════════ */
function cmsSurveySelect(current, onchange){
  current=String(current||'');
  var h='<select class="is" onchange="'+onchange+'"><option value="">— اختر الاستطلاع —</option>';
  (S.surveys||[]).forEach(function(sv){var title=String(sv.title||'');h+='<option value="'+esc(title)+'" '+(title===current?'selected':'')+'>'+esc(title)+'</option>';});
  return h+'</select>';
}
function cmsIconChoices(){
  return ['🕌','💧','❄️','👥','🏗','📍','💡','📚','🤝','📊','🏆','⭐','✅','🌿','🔧','🧹','🎯','📈','📝','🚰','🧊','🛠','📦','🕋'];
}
function pAchievV2(){
  if(!S.achiev) S.achiev=[];
  var icons=cmsIconChoices();
  var h='';
  h+='<div class="sh">🏆 الإنجازات ('+S.achiev.length+')</div>';
  h+='<div class="note">كل منجز في قائمة مستقلة. اضغط على القائمة لفتح التفاصيل، واختر الأيقونة المناسبة من الخيارات.</div>';
  h+='<div class="cms-ach-list">';
  S.achiev.forEach(function(a,i){
    h+='<div class="pnl-card">';
    h+='<div class="pnl-card-hdr">';
    h+='<div class="pnl-card-icon" style="background:#e8f2ec">'+esc(a.icon||'🏆')+'</div>';
    h+='<div class="pnl-card-info"><div class="pnl-card-title">'+esc(a.label||'منجز')+'</div><div class="pnl-card-sub">'+esc(a.val||'0')+' '+esc(a.unit||'')+'</div></div>';
    h+='<div class="pnl-card-actions"><span class="pnl-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.achiev.splice('+i+',1);renderAchiev();_renderSt(\'achiev\')">🗑</button></div>';
    h+='</div>';
    h+='<div class="pnl-card-body">';
    h+='<div class="pnl-field"><label>اختر الأيقونة</label><div class="cms-icon-grid">';
    icons.forEach(function(ic){h+='<button type="button" class="cms-icon-choice '+(ic===(a.icon||'')?'on':'')+'" onclick="S.achiev['+i+'].icon=\''+ic+'\';renderAchiev();_renderSt(\'achiev\')">'+ic+'</button>';});
    h+='</div></div>';
    h+='<div class="pnl-grid2">';
    h+='<div class="pnl-field"><label>اسم المنجز</label><input class="is" value="'+esc(a.label||'')+'" oninput="S.achiev['+i+'].label=this.value;renderAchiev()"></div>';
    h+='<div class="pnl-field"><label>الرقم</label><input class="is" value="'+esc(a.val||'')+'" oninput="S.achiev['+i+'].val=this.value;renderAchiev()"></div>';
    h+='</div>';
    h+='<div class="pnl-field"><label>الوحدة أو الوصف المختصر</label><input class="is" value="'+esc(a.unit||'')+'" oninput="S.achiev['+i+'].unit=this.value;renderAchiev()"></div>';
    h+='</div></div>';
  });
  h+='</div>';
  h+='<button class="abtn" onclick="S.achiev.push({icon:\'🏆\',label:\'منجز جديد\',val:\'0\',unit:\'\'});renderAchiev();_renderSt(\'achiev\')">+ إضافة منجز</button>';
  h+='<button class="sbtn" onclick="saveState(true)">💾 حفظ الإنجازات</button>';
  return h;
}

function collectEntryFiles(value, field, entry, survey){
  var out=[];
  var v=parseMaybeJson(value);
  if(Array.isArray(v)){v.forEach(function(x){out=out.concat(collectEntryFiles(x,field,entry,survey));});return out;}
  if(v&&typeof v==='object'){
    var url=safeUrl(v.url||v.path||'');
    if(url){out.push({entryId:entry.id,field:field,survey:survey,title:entry.form_label||survey,name:v.name||url.split('/').pop(),url:url,size:v.size||'',submitted_at:entry.submitted_at||''});}
  }
  return out;
}
function loadSurveyAttachmentsPanel(){
  var box=document.getElementById('cms-survey-attachments-body');
  if(!box) return;
  var surveys=S.surveys||[];
  if(!surveys.length){box.innerHTML='<div class="empty-state">لا توجد استطلاعات.</div>';return;}
  box.innerHTML='<div class="empty-state">جارٍ تحميل المرفقات...</div>';
  Promise.all(surveys.map(function(sv){
    return fetch('/mosque/api/registration_entry.php?form_key='+encodeURIComponent('survey_'+sv.id)+'&per_page=9999',{headers:cmsAuthHeaders(),credentials:'same-origin'})
      .then(function(r){return r.json();}).then(function(res){return {sv:sv,entries:res.entries||[]};}).catch(function(){return {sv:sv,entries:[]};});
  })).then(function(groups){
    var h=''; var total=0;
    groups.forEach(function(g){
      var files=[];
      g.entries.forEach(function(e){var d=e.entry_data||{};Object.keys(d).forEach(function(k){files=files.concat(collectEntryFiles(d[k],k,e,g.sv.title||('استطلاع '+g.sv.id)));});});
      if(files.length){
        total+=files.length;
        h+='<div class="ibox open"><div class="ibox-hd"><span class="ibox-t">📎 '+esc(g.sv.title||'استطلاع')+' ('+files.length+')</span></div><div class="ibox-body" style="display:block">';
        files.forEach(function(f){h+='<div class="cms-file-row"><div style="flex:1"><a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+fileIconByName(f.name)+' '+esc(f.name)+'</a><div style="font-size:11px;color:#6b7280;margin-top:3px">السؤال: '+esc(f.field)+' · '+esc(f.submitted_at||'')+'</div></div><button class="delbtn" onclick="deleteSurveyAnswer('+f.entryId+',\''+encodeURIComponent(f.field)+'\',\''+g.sv.id+'\');setTimeout(loadSurveyAttachmentsPanel,600)">🗑</button></div>';});
        h+='</div></div>';
      }
    });
    box.innerHTML=total?h:'<div class="empty-state">لا توجد مرفقات زوار حتى الآن.</div>';
  });
}
function pSurveysV2(){
  if(!S.surveys) S.surveys=[];
  if(!S.analysisReports) S.analysisReports=[];
  if(!S.boardDecisions) S.boardDecisions=[];
  var tab=window._surveyCmsTab||'surveys';
  var tabs=[
    {id:'surveys',icon:'📋',label:'الاستطلاعات'},
    {id:'reports',icon:'🔬',label:'التقارير'},
    {id:'board',icon:'🏛',label:'التوصيات'},
    {id:'attachments',icon:'📎',label:'المرفقات'}
  ];
  var h='';
  h+='<div class="sh">📋 الاستطلاعات والتحليل والتوصيات</div>';
  h+='<div class="note">اختر القسم المطلوب من التبويبات العلوية. مرفقات الزوار لا تظهر للزوار وتعرض فقط داخل تبويب المرفقات هنا.</div>';
  h+='<div class="cms-survey-tabs">';
  tabs.forEach(function(t){h+='<button class="cms-survey-tab '+(tab===t.id?'on':'')+'" onclick="window._surveyCmsTab=\''+t.id+'\';_renderSt(\'surveys\')">'+t.icon+' '+t.label+'</button>';});
  h+='</div>';
  if(tab==='surveys'){
    h+='<div class="cms-work-card"><div class="cms-work-title">📋 إدارة الاستطلاعات والأسئلة</div>';
    h+='<div class="note">هنا تنشئ الاستطلاعات وأسئلتها وتحدد هل السؤال إلزامي أو اختياري.</div>';
    if(!S.surveys.length){h+='<div class="empty-state">لا توجد استطلاعات بعد</div>';}
    (S.surveys||[]).forEach(function(sv,i){
      h+='<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">'+esc(sv.icon||'📋')+' '+esc(sv.title||'استطلاع')+'</span><div style="display:flex;gap:6px;align-items:center"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();svDel('+i+')">🗑</button></div></div><div class="ibox-body">';
      h+='<div class="pnl-grid2"><div class="pnl-field"><label>عنوان الاستطلاع</label><input class="is" value="'+esc(sv.title||'')+'" oninput="S.surveys['+i+'].title=this.value;renderSurveyList()"></div><div class="pnl-field"><label>الحالة</label><select class="is" onchange="S.surveys['+i+'].status=this.value;renderSurveyList()"><option value="open" '+((sv.status==='open'||sv.status==='active')?'selected':'')+'>مفتوح</option><option value="closed" '+(sv.status==='closed'?'selected':'')+'>مغلق</option></select></div></div>';
      h+='<div class="pnl-field"><label>وصف الاستطلاع</label><input class="is" value="'+esc(sv.desc||'')+'" oninput="S.surveys['+i+'].desc=this.value;renderSurveyList()"></div>';
      h+='<div class="pnl-section-title">الأسئلة ('+((sv.questions||[]).length)+')</div>';
      (sv.questions||[]).forEach(function(q,j){
        h+='<div class="cms-q-editor"><div class="cms-q-row"><input class="is" value="'+esc(q.text||'')+'" placeholder="نص السؤال" oninput="S.surveys['+i+'].questions['+j+'].text=this.value"><select class="is" onchange="svChangeQType('+i+','+j+',this.value)">'+qTypes.map(function(t){return '<option value="'+t.v+'" '+(q.type===t.v?'selected':'')+'>'+t.l+'</option>';}).join('')+'</select><button class="delbtn" onclick="S.surveys['+i+'].questions.splice('+j+',1);_renderSt(\'surveys\');renderSurveyList()">🗑</button></div>';
        h+='<label class="cms-required-row"><input type="checkbox" '+(q.required?'checked':'')+' onchange="S.surveys['+i+'].questions['+j+'].required=this.checked;renderSurveyList()"> سؤال إلزامي الإجابة</label>';
        if(q.type!=='text'&&q.type!=='file') h+='<textarea class="is" rows="2" placeholder="خيارات السؤال - كل خيار في سطر" oninput="S.surveys['+i+'].questions['+j+'].opts=this.value.split(/\\n/).filter(Boolean)">'+esc((q.opts||[]).join('\n'))+'</textarea>';
        if(q.type==='file') h+='<div class="note" style="margin-top:6px">مرفقات الزوار لهذا السؤال تظهر فقط في تبويب المرفقات داخل لوحة التحكم.</div>';
        h+='</div>';
      });
      h+='<button class="abtn" onclick="svAddQ('+i+')">+ إضافة سؤال</button></div></div>';
    });
    h+='<button class="abtn" onclick="svAdd()">+ إنشاء استطلاع جديد</button></div>';
  }
  if(tab==='reports'){
    h+='<div class="cms-work-card"><div class="cms-work-title">🔬 تقارير التحليل</div><div class="note">أضف تقريرًا نصيًا أو مرفق PDF/صورة، واختر الاستطلاع المرتبط به. اترك الاختيار فارغًا إذا كان التقرير عامًا لكل الاستطلاعات.</div>';
    if(!S.analysisReports.length){h+='<div class="empty-state">لا توجد تقارير تحليل بعد</div>';}
    (S.analysisReports||[]).forEach(function(r,i){var files=r.files||r.pdfs||[];h+='<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">🔬 '+esc(r.title||'تقرير تحليل')+'</span><div style="display:flex;gap:6px;align-items:center"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.analysisReports.splice('+i+',1);renderAnalysis();_renderSt(\'surveys\')">🗑</button></div></div><div class="ibox-body">';
      h+='<div class="pnl-grid2"><div class="pnl-field"><label>الاستطلاع المرتبط</label>'+cmsSurveySelect(r.survey,'S.analysisReports['+i+'].survey=this.value;renderAnalysis()')+'</div><div class="pnl-field"><label>التاريخ</label><input class="is" value="'+esc(r.date||'')+'" oninput="S.analysisReports['+i+'].date=this.value;renderAnalysis()"></div></div>';
      h+='<div class="pnl-field"><label>عنوان التقرير</label><input class="is" value="'+esc(r.title||'')+'" oninput="S.analysisReports['+i+'].title=this.value;renderAnalysis()"></div><div class="pnl-field"><label>التحليل النصي الذي سيظهر في الموقع</label><textarea class="is" rows="5" placeholder="اكتب التحليل هنا..." oninput="S.analysisReports['+i+'].text=this.value;renderAnalysis()">'+esc(r.text||'')+'</textarea></div>';
      files.forEach(function(f,k){h+='<div class="cms-file-row"><a href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">'+fileIconByName(f.name)+' '+esc(f.name||'مرفق')+'</a><button class="delbtn" onclick="(S.analysisReports['+i+'].files||S.analysisReports['+i+'].pdfs).splice('+k+',1);_renderSt(\'surveys\');renderAnalysis()">✕</button></div>';});
      h+='<button class="abtn" onclick="arUploadPdf('+i+')">📎 رفع مرفق تحليل PDF أو صورة</button></div></div>';});
    h+='<button class="abtn" onclick="arAdd();window._surveyCmsTab=\'reports\';_renderSt(\'surveys\')">+ إضافة تقرير تحليل</button></div>';
  }
  if(tab==='board'){
    h+='<div class="cms-work-card"><div class="cms-work-title">🏛 توصيات مجلس الإدارة</div><div class="note">كل توصية يمكن ربطها باستطلاع محدد حتى تظهر للزائر واضحة مع اسم الاستطلاع المرتبط.</div>';
    if(!S.boardDecisions.length){h+='<div class="empty-state">لا توجد توصيات بعد</div>';}
    (S.boardDecisions||[]).forEach(function(d,i){h+='<div class="ibox"><div class="ibox-hd" onclick="toggleIbox(this)"><span class="ibox-t">🏛 '+esc(d.title||'توصية')+'</span><div style="display:flex;gap:6px;align-items:center"><span class="ibox-arrow">▼</span><button class="delbtn" onclick="event.stopPropagation();S.boardDecisions.splice('+i+',1);renderBoard();_renderSt(\'surveys\')">🗑</button></div></div><div class="ibox-body">';
      h+='<div class="pnl-grid2"><div class="pnl-field"><label>الاستطلاع المرتبط بالتوصية</label>'+cmsSurveySelect(d.survey,'S.boardDecisions['+i+'].survey=this.value;renderBoard()')+'</div><div class="pnl-field"><label>التاريخ</label><input class="is" value="'+esc(d.date||'')+'" oninput="S.boardDecisions['+i+'].date=this.value;renderBoard()"></div></div>';
      h+='<div class="pnl-field"><label>عنوان التوصية</label><input class="is" value="'+esc(d.title||'')+'" oninput="S.boardDecisions['+i+'].title=this.value;renderBoard()"></div><div class="pnl-field"><label>نص التوصية الذي سيظهر في الموقع</label><textarea class="is" rows="5" placeholder="اكتب نص التوصية هنا..." oninput="S.boardDecisions['+i+'].body=this.value;renderBoard()">'+esc(d.body||'')+'</textarea></div>';
      (d.files||[]).forEach(function(f,k){h+='<div class="cms-file-row"><a href="'+esc(safeUrl(f.url))+'" target="_blank" rel="noopener">📄 '+esc(f.name||'ملف توصية')+'</a><button class="delbtn" onclick="S.boardDecisions['+i+'].files.splice('+k+',1);_renderSt(\'surveys\');renderBoard()">✕</button></div>';});
      h+='<button class="abtn" onclick="bdUploadFile('+i+')">📎 رفع ملف PDF للتوصية</button></div></div>';});
    h+='<button class="abtn" onclick="bdAdd();window._surveyCmsTab=\'board\';_renderSt(\'surveys\')">+ إضافة توصية</button></div>';
  }
  if(tab==='attachments'){
    h+='<div class="cms-work-card"><div class="cms-work-title">📎 مرفقات الزوار</div><div class="note">هذا القسم خاص بلوحة التحكم فقط. لا تظهر هذه المرفقات للزوار في تبويب النتائج والتحليل حفاظًا على الخصوصية.</div><div id="cms-survey-attachments-body"></div></div>';
    setTimeout(loadSurveyAttachmentsPanel,50);
  }
  h+='<button class="sbtn" onclick="saveState(true)">💾 حفظ التغييرات</button>';
  return h;
}

/* ════════════ INIT ════════════ */
/* إغلاق اللوحة فوراً إذا لم تكن مفتوحة */
(function(){
  try{
    if(sessionStorage.getItem('cms_open')!=='1'){
      var p=document.getElementById('cms-panel');
      var btn=document.getElementById('cms-toggle');
      if(p){p.classList.add('collapsed');}
      if(btn){btn.classList.add('collapsed');btn.style.left='0px';}
    }
  }catch(e){}
})();
renderWA();
loadStateFromServer();
checkCmsAuth();
/* تطبيق الصلاحيات مرة ثانية بعد اكتمال تحميل الصفحة */
setTimeout(function(){
  var s = getCmsSession();
  if(s) applyUserPermissions(s);
}, 800);
setTimeout(initMaintenance,1500);

/* فتح من URL hash/query عند التحميل */
(function(){
  var hash=window.location.hash||'';
  var formParam='';
  var surveyParam='';
  try{
    var params=new URLSearchParams(window.location.search);
    formParam=decodeURIComponent(params.get('form')||'');
    surveyParam=decodeURIComponent(params.get('survey')||'');
  }catch(e){}
  if(!hash&&!formParam&&!surveyParam) return;

  function doOpen(){
    /* تجاهل #admin - خاص بلوحة التحكم */
    if(hash.indexOf('#admin-')===0) return;
    /* فتح استطلاع عبر query parameter ?survey=ID */
    if(surveyParam){
      if(!S.surveys||S.surveys.length===0){setTimeout(doOpen,500);return;}
      scrollSec('surveys-sec');
      setTimeout(function(){openSurvey(surveyParam);},600);
      return;
    }
    if(formParam){
      var forms=(S.pages&&S.pages.register&&S.pages.register.forms)||[];
      var idx=forms.findIndex(function(f){var l=f.label||'';return l===formParam||encodeURIComponent(l)===encodeURIComponent(formParam);});
      if(idx>=0){var pg=document.getElementById('reg-form-page');if(pg){pg.classList.add('open');document.body.style.overflow='hidden';}openRegForm(idx);return;}
      if(forms.length===0){setTimeout(doOpen,500);return;}
    }
    if(hash.indexOf('#news-')===0){var ni=parseInt(hash.replace('#news-',''));if(!isNaN(ni))openNewsDetail(ni);return;}
    if(hash.indexOf('#survey-')===0){
      var svId=hash.replace('#survey-','');
      if(!S.surveys||S.surveys.length===0){setTimeout(doOpen,500);return;}
      openSurvey(svId);return;
    }
    if(hash.indexOf('#page-')===0){
      var pid=decodeURIComponent(hash.replace('#page-',''));
      var staticPages=['docs','complaints','register'];
      if(staticPages.indexOf(pid)>=0){showPage(pid);return;}
      var cp=S.customPages||[];
      var found=null;
      for(var i=0;i<cp.length;i++) if(String(cp[i].id)===String(pid)){found=cp[i];break;}
      if(found){openCustomPage(pid);return;}
      if(cp.length===0){setTimeout(doOpen,600);return;}
      openCustomPage(pid);
    }
  }
  setTimeout(doOpen,1500);
})();
