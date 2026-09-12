'use strict';
(() => {
const $ = id => document.getElementById(id);
const titles = ['1 cm³ のひみつ','直方体をつくる','分けてたす','大きくしてひく','内のりを見つける','仕上げの挑戦'];
const lessonTitles = ['1 cm³ を積んでみよう','たて・横・高さを変えてみよう','凸凹を、2つの直方体に','ないところを、引いてみよう','水が入るところは、どこ？','発見したことを使ってみよう'];
const key='dekoboko-lab-progress-v1'+(new URLSearchParams(location.search).has('qa')?'-qa':'');let done=new Set(),storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))done=new Set(saved.filter(x=>typeof x==='string'&&/^[0-5]-[01]$/.test(x)));}catch{storageOK=false;}
const s={level:0,q:0,round:0,yaw:.64,labels:true,mode:'whole',split:'horizontal',gap:0,water:100,hint:0,revealed:false,solved:false};let m;
function problem(){const {level:l,q,round:r}=s;
 if(l===0)return {type:'cube',w:(q?4:3)+r%2,d:q?3:2,h:2,unit:'cm³'};
 if(l===1)return {type:'rect',w:(q?6:4)+r%2,d:q?4:3,h:q?3:2,unit:'cm³'};
 if(l===2)return {type:'step',w:(q?10:8)+r%2,d:q?3:4,h:q?7:6,a:q?4:3,b:q?3:2,unit:'cm³'};
 if(l===3)return {type:'step',w:(q?10:9)+r%2,d:q?5:4,h:q?7:6,a:q?6:4,b:q?3:2,unit:'cm³'};
 if(l===4)return {type:'tank',w:(q?16:12)+r%3*2,d:q?12:10,h:q?10:9,t:q?2:1,unit:'cm³'};
 if(q===0)return {type:'stairs',w:9+r%3*3,d:3,h:6,a:3+r%3,b:2,unit:'cm³'};
 return {type:'tank',w:22+r%3*2,d:12,h:11,t:1,p:5,ph:4,unit:'L'};
}
function capacity(){return (m.w-2*m.t)*(m.d-2*m.t)*(m.h-m.t)-(m.p?m.p*(m.d-2*m.t)*m.ph:0);}
function answer(){if(m.type==='step')return m.w*m.d*m.b+m.a*m.d*(m.h-m.b);if(m.type==='stairs')return m.a*m.d*m.b*6;if(m.type==='tank')return capacity()/(m.unit==='L'?1000:1);return m.w*m.d*m.h;}
function progress(){
 $('stars').textContent=`発見 ${done.size} / 12`;
 $('levels').innerHTML=titles.map((t,i)=>`<button data-level="${i}" class="${i===s.level?'active':''}" aria-current="${i===s.level?'step':'false'}"><span class="step-number">STEP ${i+1}<span class="done">${[0,1].every(q=>done.has(`${i}-${q}`))?'✓':''}</span></span>${t}</button>`).join('');
 $('save-note').textContent=storageOK?'できた記録は、この端末のブラウザーに保存されます。時間制限はありません。':'このブラウザーでは記録を保存できません。この画面を開いている間は続けて学べます。';
}
function persist(){try{localStorage.setItem(key,JSON.stringify([...done]));}catch{storageOK=false;}progress();}
function resetAnswer(){s.hint=0;s.revealed=false;s.solved=false;$('answer').value='';$('answer').disabled=false;$('feedback').textContent='';$('feedback').className='';$('hint-box').innerHTML='';$('next').hidden=true;$('hint').disabled=false;$('hint').textContent='ヒントを見る';$('answer-form').querySelector('button').disabled=false;}
function start(l,q=0,r=0){Object.assign(s,{level:l,q,round:r,yaw:.64,mode:l===4||(l===5&&q===1)?'outside':'whole',split:'horizontal',gap:0,water:100});m=problem();resetAnswer();progress();renderText();controls();draw();}
function renderText(){
 $('lesson-tag').textContent=`STEP ${s.level+1} / 6`;$('lab-title').textContent=lessonTitles[s.level];$('shape-tag').textContent=m.type==='tank'?'ふたのない容器':'立体をさわる';$('question-count').textContent=`チャレンジ ${s.q+1} / 2${s.round?'・もう一度':''}`;$('unit').textContent=m.unit;
 $('answer-label').textContent=m.type==='tank'?'いっぱいに入る水の量は？':'体積はいくつかな？';$('question-title').textContent=m.type==='tank'?(m.unit==='L'?'何 L の水が入るかな？':'この容器の容積は？'):(m.type==='cube'?'1 cm³ は、全部で何個分？':'この立体の体積は？');
 let desc='',entries=[],note='';
 if(m.type==='cube'){desc='1辺が1 cmの立方体を、すき間なく積んだよ。見えない奥の立方体も数えよう。';entries=[['横',m.w],['奥行き（たて）',m.d],['高さ',m.h]];note='小さな立方体1個の体積は 1 cm³。';}
 if(m.type==='rect'){desc='長さを変えて、体積がどう変わるか試そう。今の立体の体積を答えてね。';entries=[['横',m.w],['奥行き（たて）',m.d],['高さ',m.h]];}
 if(m.type==='step'){desc=s.level===2?'2つの直方体に分けたら、体積をたせそう。「分け方」を切りかえてみよう。':'へこんだ部分を足すと、大きな直方体になるね。そこから何を引けばいいかな？';entries=[['全体の横',m.w],['奥行き（共通）',m.d],['全体の高さ',m.h],['低い部分の高さ',m.b],['高い部分の横',m.a]];note='どの部分も奥行きは同じ。辺はすべて直角に交わります。';}
 if(m.type==='stairs'){desc='今度は3段！すべての段の奥行きは同じだよ。好きな分け方で考えよう。';entries=[['全体の横',m.w],['奥行き（共通）',m.d],['1段ごとの横',m.a],['1段ごとの高さ',m.b]];}
 if(m.type==='tank'){desc='外側の長さで計算すると、板の部分まで入ってしまうよ。水が入る空間の長さを考えよう。';entries=[['外側の横',m.w],['外側の奥行き',m.d],['外側の高さ',m.h],['板の厚さ（すべて）',m.t]];note='ふたはありません。容積は、ふちまでいっぱいに入る水の体積です。'+(m.unit==='L'?' 1 L = 1000 cm³。':'');}
 if(m.p){desc='底に、水の入らない直方体の台がある容器だよ。内のりと「引く」考え方を組み合わせよう。';entries.push(['中の台の横',m.p],['中の台の高さ',m.ph]);note+=' 台はすき間なく固定され、奥行きは容器の内のりと同じです。';$('lab-title').textContent='底に段がある容器に挑戦';}
 $('question-description').textContent=desc;$('dimensions').innerHTML=`<div class="dimension-list">${entries.map(([k,v])=>`<div>${k}<b>${v} cm</b></div>`).join('')}</div>`+(note?`<div class="mini-note">${note}</div>`:'');discovery();
}
function discovery(){let t='';
 if(m.type==='cube')t=`<strong>1 cm³ は、1辺が1 cmの立方体1個分。</strong><br>1段に ${m.w} × ${m.d} = ${m.w*m.d} 個。これが ${m.h} 段あるね。`;
 if(m.type==='rect')t='<strong>体積 = 横 × 奥行き（たて）× 高さ</strong><br>下の面に並ぶ個数 × 段の数、と考えよう。';
 if(m.type==='step'&&s.level===2)t=s.mode==='whole'?'<strong>まずは「色分けする」を押してみよう。</strong><br>重なりも、すき間もない2つの直方体に分けられるかな？':s.split==='horizontal'?`<strong>横に切る：Aは下、Bは上。</strong><br><span class="legend-a">A：${m.w} × ${m.d} × ${m.b}</span>　<span class="legend-b">B：${m.a} × ${m.d} × (${m.h} − ${m.b})</span><br>上の高さは、全体から下の高さを引こう。`:`<strong>たてに切る：Aは高い側、Bは低い側。</strong><br><span class="legend-a">A：${m.a} × ${m.d} × ${m.h}</span>　<span class="legend-b">B：(${m.w} − ${m.a}) × ${m.d} × ${m.b}</span><br>低い側の横は、全体から高い側の横を引こう。`;
 if(m.type==='step'&&s.level===3)t=s.mode==='whole'?'<strong>「欠けた部分を出す」で、へこみを埋めよう。</strong><br>大きな直方体 − 欠けた直方体 = 求めたい体積。':`<strong>オレンジの枠は、もともと「ない」部分。</strong><br>欠けた横：${m.w} − ${m.a} = ${m.w-m.a} cm<br>欠けた高さ：${m.h} − ${m.b} = ${m.h-m.b} cm。奥行きは ${m.d} cm。`;
 if(m.type==='stairs')t=s.mode==='whole'?'<strong>同じ大きさの段が、3段。</strong><br>3本の柱に分けても、横に3段に切っても考えられるよ。':`<strong>A・B・Cの体積を、ぜんぶたそう。</strong><br>横はそれぞれ ${m.a} cm。高さは ${m.b*3} cm、${m.b*2} cm、${m.b} cm。`;
 if(m.type==='tank')t=s.mode==='outside'?'<strong>内のり = 容器の内側の長さ。</strong><br>横・奥行きは両側の板2枚分、高さは底の板1枚分を引くよ。':`<strong>横・奥行きは2枚分、高さは底の1枚分。</strong><br>横：${m.w} − ${m.t} × 2 = ${m.w-2*m.t} cm<br>奥行き：${m.d} − ${m.t} × 2 = ${m.d-2*m.t} cm<br>高さ：${m.h} − ${m.t} = ${m.h-m.t} cm`;
 if(m.type==='tank'&&s.water!==100)t+='<br>水位を変えても容器の容積は同じ。問題では満水の量を答えてね。';
 if(m.p)t+='<br><strong>仕上げ：中の台には水が入らない。</strong><br>台がないときの容積から、オレンジの台の体積を引こう。';
 $('discovery').innerHTML=t;
}
function slider(id,label,v,min,max,u){return `<label for="${id}">${label} <output id="${id}-value">${v}${u}</output><input id="${id}" type="range" min="${min}" max="${max}" value="${v}"></label>`;}
function controls(){let h='';
 if(m.type==='cube')h=`<div class="control-row">${slider('layers','積む高さ',m.h,1,4,' cm')}</div><p class="lab-note">1段ずつ増やすと、同じ数ずつ増えていくよ。</p>`;
 if(m.type==='rect')h=`<div class="control-row">${slider('size-w','横',m.w,2,8,' cm')}${slider('size-d','奥行き',m.d,2,6,' cm')}${slider('size-h','高さ',m.h,1,6,' cm')}</div><div class="segmented"><button data-mode="whole" class="selected">面で見る</button><button data-mode="grid">1 cm³ で見る</button></div>`;
 if(m.type==='step'&&s.level===2)h='<div class="segmented"><button data-mode="whole" class="selected">そのまま</button><button data-split="horizontal">横に色分けする</button><button data-split="vertical">たてに色分けする</button></div><div class="control-row" style="margin-top:12px">'+slider('separate','分けた部分をはなす',0,0,100,'%')+'</div>';
 if(m.type==='step'&&s.level===3)h='<div class="segmented"><button data-mode="whole" class="selected">もとの形</button><button data-mode="missing">欠けた部分を出す</button></div>';
 if(m.type==='stairs')h='<div class="segmented"><button data-mode="whole" class="selected">自分で考える</button><button data-mode="parts">3つに分けてみる</button></div>';
 if(m.type==='tank')h='<div class="segmented"><button data-mode="outside" class="selected">外側を見る</button><button data-mode="cut">壁を2枚はずす</button><button data-mode="inside">内側だけ見る</button></div><div class="control-row" style="margin-top:12px">'+slider('water','水面の高さ（満水を100%）',100,0,100,'%')+'</div><p class="lab-note">水色は水。壁をはずした図は、中を見やすくするための図です。</p>';
 $('experiment').innerHTML=h;for(const b of $('experiment').querySelectorAll('.segmented button'))b.setAttribute('aria-pressed',String(b.classList.contains('selected')));
}
const colors={teal:['#81ced0','#2798a2','#0b7987'],orange:['#ffc18b','#ed9455','#cc672d'],blue:['#a5cef7','#669fde','#3f78b4'],wall:['#e8d8ac','#d7c18f','#b59a61'],water:['#9fe0ee','#66bdde','#439dc5']};
function blocks(){const arr=[];const add=(x,y,z,w,d,h,c='teal',extra={})=>{if(w>0&&d>0&&h>0)arr.push({x,y,z,w,d,h,c,...extra});};
 if(m.type==='cube'||(m.type==='rect'&&s.mode==='grid')){for(let z=0;z<m.h;z++)for(let y=0;y<m.d;y++)for(let x=0;x<m.w;x++)add(x,y,z,1,1,1,z%2?'blue':'teal',{voxel:true});}
 else if(m.type==='rect')add(0,0,0,m.w,m.d,m.h);
 else if(m.type==='step'){const split=s.level===2&&s.mode==='parts',gap=split?s.gap/100*Math.max(m.w,m.h)*.22:0;
  if(split&&s.split==='vertical'){add(0,0,0,m.a,m.d,m.h,'teal',{label:'A'});add(m.a+gap,0,0,m.w-m.a,m.d,m.b,'orange',{label:'B'});}
  else{add(0,0,0,m.w,m.d,m.b,'teal',{label:split?'A':null});add(0,0,m.b+gap,m.a,m.d,m.h-m.b,split?'orange':'teal',{label:split?'B':null});}
  if(s.mode==='missing')add(m.a,0,m.b,m.w-m.a,m.d,m.h-m.b,'orange',{ghost:true,label:'引く部分'});
 }else if(m.type==='stairs'){for(let i=0;i<3;i++)add(i*m.a,0,0,m.a,m.d,(3-i)*m.b,s.mode==='parts'?['teal','orange','blue'][i]:'teal',{label:s.mode==='parts'?['A','B','C'][i]:null});}
 else if(m.type==='tank'){const iw=m.w-2*m.t,id=m.d-2*m.t,ih=m.h-m.t;
  if(s.mode!=='inside'){add(0,0,0,m.w,m.d,m.t,'wall');add(0,0,m.t,m.w,m.t,ih,'wall');add(0,m.t,m.t,m.t,id,ih,'wall');if(s.mode==='outside'){add(0,m.d-m.t,m.t,m.w,m.t,ih,'wall',{opacity:.42});add(m.w-m.t,m.t,m.t,m.t,id,ih,'wall',{opacity:.42});}}
  const wh=ih*s.water/100;
  if(m.p){add(m.t,m.t,m.t,m.p,id,m.ph,'orange',{label:'台'});if(wh>0)add(m.t+m.p,m.t,m.t,iw-m.p,id,wh,'water',{opacity:.58});if(wh>m.ph)add(m.t,m.t,m.t+m.ph,m.p,id,wh-m.ph,'water',{opacity:.58});}
  else if(s.water>0)add(m.t,m.t,m.t,iw,id,wh,'water',{opacity:.8});
  if(s.mode!=='outside')add(m.t,m.t,m.t,iw,id,ih,'water',{ghost:true});
 }return arr;
}
function draw(){const bs=blocks(),cs=Math.cos(s.yaw),sn=Math.sin(s.yaw);const raw=p=>[p[0]*cs-p[1]*sn,(p[0]*sn+p[1]*cs)*.42-p[2]*.92];const depth=p=>(p[0]*sn+p[1]*cs)*.92+p[2]*.42;
 const corners=[...bs.flatMap(b=>[[b.x,b.y,b.z],[b.x+b.w,b.y,b.z],[b.x,b.y+b.d,b.z],[b.x+b.w,b.y+b.d,b.z+b.h],[b.x,b.y,b.z+b.h],[b.x+b.w,b.y,b.z+b.h],[b.x,b.y+b.d,b.z+b.h],[b.x+b.w,b.y+b.d,b.z]]),[0,0,0],[m.w,m.d,m.h]];
 const pp=corners.map(raw),minx=Math.min(...pp.map(p=>p[0])),maxx=Math.max(...pp.map(p=>p[0])),miny=Math.min(...pp.map(p=>p[1])),maxy=Math.max(...pp.map(p=>p[1]));const scale=Math.min(400/(maxx-minx||1),255/(maxy-miny||1));
 const proj=p=>{const r=raw(p);return [350+(r[0]-(minx+maxx)/2)*scale,205+(r[1]-(miny+maxy)/2)*scale];};let faces=[],texts=[];
 for(const b of bs){const x=b.x,y=b.y,z=b.z,X=x+b.w,Y=y+b.d,Z=z+b.h;
  const ff=[{p:[[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],n:[0,0,1],shade:0},{p:[[X,y,z],[X,Y,z],[X,Y,Z],[X,y,Z]],n:[1,0,0],shade:2},{p:[[x,Y,z],[x,Y,Z],[X,Y,Z],[X,Y,z]],n:[0,1,0],shade:1},{p:[[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z]],n:[-1,0,0],shade:2},{p:[[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]],n:[0,-1,0],shade:1}];
  for(const f of ff){if(f.n[0]*sn+f.n[1]*cs+f.n[2]*.46<=0)continue;
   if(b.voxel){let neighbor=false;if(f.shade===0)neighbor=z+1<m.h;else if(f.n[0]===1)neighbor=x+1<m.w;else if(f.n[0]===-1)neighbor=x>0;else if(f.n[1]===1)neighbor=y+1<m.d;else neighbor=y>0;if(neighbor)continue;}
   faces.push({p:f.p,depth:f.p.reduce((a,p)=>a+depth(p),0)/4,fill:colors[b.c][f.shade],b});
  }if(b.label)texts.push({p:[x+b.w/2,y+b.d/2,Z],label:b.label,c:b.c});
 }
 faces.sort((a,b)=>a.depth-b.depth);let svg='<ellipse cx="350" cy="350" rx="190" ry="20" fill="#254554" opacity=".06"/>';
 for(const f of faces){const ghost=f.b.ghost;svg+=`<polygon points="${f.p.map(p=>proj(p).join(',')).join(' ')}" fill="${f.fill}" fill-opacity="${ghost?.10:f.b.opacity||1}" stroke="${ghost?(f.b.c==='water'?'#2784a1':'#a9521d'):'#1c6170'}" stroke-opacity="${ghost?1:.65}" stroke-width="${ghost?2:1.25}" ${ghost?'stroke-dasharray="7 5"':''}/>`;}
 for(const t of texts){const p=proj(t.p);svg+=`<text x="${p[0]}" y="${p[1]-8}" text-anchor="middle" style="font-size:${t.label.length>1?16:23}px;fill:${t.c==='orange'?'#954717':'#075860'}">${t.label}</text>`;}
 const measure=(a,b,label,dx,dy)=>{const p=proj(a),q=proj(b),P=[p[0]+dx,p[1]+dy],Q=[q[0]+dx,q[1]+dy];svg+=`<g><path d="M${p} L${P} M${q} L${Q} M${P} L${Q}" fill="none" stroke="#587a87" stroke-width="1.3"/><circle cx="${P[0]}" cy="${P[1]}" r="2.8" fill="#587a87"/><circle cx="${Q[0]}" cy="${Q[1]}" r="2.8" fill="#587a87"/><text x="${(P[0]+Q[0])/2+(dx?Math.sign(dx)*12:0)}" y="${(P[1]+Q[1])/2+(dy?Math.sign(dy)*12:5)}" text-anchor="${dx>0?'start':dx<0?'end':'middle'}">${label}</text></g>`;};
 if(s.labels&&m.type==='step'&&s.mode==='parts'&&s.gap>0)svg+='<text x="24" y="34" style="font-size:16px">はなす前の寸法は、問題欄で確認しよう</text>';
 if(s.labels&&!(m.type==='step'&&s.mode==='parts'&&s.gap>0)){if(m.type==='tank'&&s.mode!=='outside'){const t=m.t;measure([t,m.d-t,t],[m.w-t,m.d-t,t],`${m.w-2*t} cm`,0,29);measure([m.w-t,t,t],[m.w-t,m.d-t,t],`${m.d-2*t} cm`,24,16);measure([t,m.d-t,t],[t,m.d-t,m.h],`${m.h-t} cm`,-27,0);svg+='<text x="24" y="34" style="font-size:16px;fill:#007880">内のり（満水のとき）</text>';}
 else{measure([0,m.d,0],[m.w,m.d,0],`${m.w} cm`,0,31);measure([m.w,0,0],[m.w,m.d,0],`${m.d} cm`,28,14);measure([0,m.d,0],[0,m.d,m.h],`${m.h} cm`,-30,0);if(m.type==='step'){measure([0,0,m.h],[m.a,0,m.h],`${m.a} cm`,0,-28);measure([m.w,0,0],[m.w,0,m.b],`${m.b} cm`,32,0);}if(m.type==='stairs')svg+=`<text x="24" y="34" style="font-size:16px">1段の横 ${m.a} cm ／ 高さ ${m.b} cm</text>`;if(m.type==='tank')svg+=`<text x="24" y="34" style="font-size:16px">外側の寸法 ／ 板の厚さ ${m.t} cm</text>`;}}
 $('scene').innerHTML=svg;$('scene').setAttribute('aria-label',`${$('question-title').textContent} 横${m.w}センチ、奥行き${m.d}センチ、高さ${m.h}センチ。${m.type==='tank'?'外側の寸法。板の厚さ'+m.t+'センチ。ふたなし。':''}詳しい寸法と説明は図の下と問題欄にあります。`);
}
function hints(){
 if(m.p)return ['「壁を2枚はずす」を押そう。まず台がないつもりで、容器の内のりを考えよう。',`内のりは横 ${m.w-2*m.t} cm、奥行き ${m.d-2*m.t} cm、高さ ${m.h-m.t} cm。台の奥行きも ${m.d-2*m.t} cmだよ。`,`台がないときの容積 − 台の体積。式は ${m.w-2*m.t} × ${m.d-2*m.t} × ${m.h-m.t} − ${m.p} × ${m.d-2*m.t} × ${m.ph}。最後に1000で割って L にしよう。`];
 if(m.type==='cube')return ['まず1段だけ見てみよう。手前だけでなく、奥にも並んでいるね。',`1段には、横 ${m.w} 個 × 奥行き ${m.d} 個 = ${m.w*m.d} 個。それが ${m.h} 段あるよ。`,`式は ${m.w} × ${m.d} × ${m.h}。1個が 1 cm³ だから、個数と体積の数字が同じになるね。`];
 if(m.type==='rect')return ['下の面に1 cm³ の立方体が何個並ぶか、考えてみよう。',`下の面には ${m.w} × ${m.d} = ${m.w*m.d} 個分。それが高さの ${m.h} 段分あるね。`,`式は ${m.w} × ${m.d} × ${m.h}。3つの長さをかけよう。`];
 if(m.type==='step'&&s.level===2)return ['「横に色分けする」を押そう。下の直方体Aと上の直方体Bに分けられるね。',`上の部分の高さは ${m.h} − ${m.b} = ${m.h-m.b} cm。全体の高さをそのまま使うと、下の部分が重なってしまうよ。`,`Aは ${m.w} × ${m.d} × ${m.b}。Bは ${m.a} × ${m.d} × (${m.h} − ${m.b})。最後に A + B。`];
 if(m.type==='step')return ['「欠けた部分を出す」を押そう。オレンジの枠もあるつもりで、大きな直方体を考えよう。',`欠けた部分の横は ${m.w} − ${m.a} = ${m.w-m.a} cm。高さは ${m.h} − ${m.b} = ${m.h-m.b} cm。`,`大きな直方体は ${m.w} × ${m.d} × ${m.h}。欠けた部分は (${m.w} − ${m.a}) × ${m.d} × (${m.h} − ${m.b})。前から後を引こう。`];
 if(m.type==='stairs')return ['「3つに分けてみる」を押そう。3本の直方体の柱として考えられるよ。',`どの柱も横 ${m.a} cm、奥行き ${m.d} cm。高さは ${m.b*3} cm、${m.b*2} cm、${m.b} cm。`,`式は ${m.a} × ${m.d} × ${m.b*3} + ${m.a} × ${m.d} × ${m.b*2} + ${m.a} × ${m.d} × ${m.b}。`];
 return ['「壁を2枚はずす」で中を見よう。水が入るのは板に囲まれた空間だよ。',`横は ${m.w} − ${m.t} × 2。奥行きは ${m.d} − ${m.t} × 2。ふたがないので、高さは底1枚分だけ引いて ${m.h} − ${m.t}。`,`内のりは ${m.w-2*m.t} cm、${m.d-2*m.t} cm、${m.h-m.t} cm。この3つをかけよう。${m.unit==='L'?'cm³ から L へは、さらに1000で割ろう。':''}`];
}
function explanation(){const result=answer();
 if(m.type==='cube'||m.type==='rect')return `${m.w} × ${m.d} × ${m.h} = ${result} cm³<br>下の面の ${m.w*m.d} 個分を、${m.h} 段分にしたんだね。`;
 if(m.type==='step')return `足すと：${m.w} × ${m.d} × ${m.b} + ${m.a} × ${m.d} × ${m.h-m.b}<br>= ${m.w*m.d*m.b} + ${m.a*m.d*(m.h-m.b)} = ${result} cm³<br><br>引くと：${m.w} × ${m.d} × ${m.h} − ${m.w-m.a} × ${m.d} × ${m.h-m.b}<br>= ${m.w*m.d*m.h} − ${(m.w-m.a)*m.d*(m.h-m.b)} = ${result} cm³<br>分け方が違っても、同じ体積になるよ。`;
 if(m.type==='stairs')return `${m.a} × ${m.d} × ${m.b*3} + ${m.a} × ${m.d} × ${m.b*2} + ${m.a} × ${m.d} × ${m.b}<br>= ${m.a*m.d*m.b*3} + ${m.a*m.d*m.b*2} + ${m.a*m.d*m.b}<br>= ${result} cm³`;
 const v=(m.w-2*m.t)*(m.d-2*m.t)*(m.h-m.t);return `内のりの横：${m.w} − ${m.t} × 2 = ${m.w-2*m.t} cm<br>内のりの奥行き：${m.d} − ${m.t} × 2 = ${m.d-2*m.t} cm<br>内のりの高さ：${m.h} − ${m.t} = ${m.h-m.t} cm<br><br>${m.w-2*m.t} × ${m.d-2*m.t} × ${m.h-m.t} = ${v} cm³${m.p?`<br>台の体積：${m.p} × ${m.d-2*m.t} × ${m.ph} = ${m.p*(m.d-2*m.t)*m.ph} cm³<br>水が入るところ：${v} − ${m.p*(m.d-2*m.t)*m.ph} = ${capacity()} cm³`:''}${m.unit==='L'?`<br>${capacity()} ÷ 1000 = ${result} L`:''}`;
}
function feedback(text,correct=false){$('feedback').innerHTML=text;$('feedback').className='feedback'+(correct?' correct':'');}
function check(){if(s.solved)return;const value=$('answer').value.normalize('NFKC').trim();if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)){feedback('半角・全角の数字で答えてね。単位は入力しなくて大丈夫。');return;}const n=Number(value),v=answer();
 if(Math.abs(n-v)<1e-9){s.solved=true;$('answer').disabled=true;$('answer-form').querySelector('button').disabled=true;
  if(!s.revealed){done.add(`${s.level}-${s.q}`);persist();feedback(`<strong class="celebrate">できた！ ${v} ${m.unit}</strong><br>${s.hint?'ヒントを使って考えられたね。':'自分の考えでたどり着けたね。'}<div class="formula">${explanation()}</div>${done.size===12?'<div class="completion"><strong>12の発見、ぜんぶ集まった！</strong><br>「1個分」「分ける」「引く」「内のり」。好きなステップで、数字や見方を変えてまた試そう。</div>':''}`,true);}
  else feedback(`<strong>${v} ${m.unit}、たしかめられたね。</strong><br>次は数字を変えた問題で、同じ考え方を使ってみよう。`,true);
  $('next').textContent=s.revealed?'数字を変えて挑戦 →':s.q===0?'次のチャレンジへ →':s.level===5?'はじめのステップに戻る →':'次のステップへ →';$('next').hidden=false;
 }else{let msg='もう一度、形を見てみよう。ヒントを開いて、式を一つずつ確かめてもいいよ。';
  if(m.p&&(n===(m.w-2*m.t)*(m.d-2*m.t)*(m.h-m.t)||n===(m.w-2*m.t)*(m.d-2*m.t)*(m.h-m.t)/1000))msg='それは台がないときの容積だね。水が入らない台の体積を引いてみよう。単位は L で答えてね。';
  else if(m.type==='tank'&&n===m.w*m.d*m.h)msg='それは外側の長さで計算した体積かも。板の部分を除いて、水が入る内側の長さで考えよう。';
  else if(m.type==='tank'&&!m.p&&n===(m.w-2*m.t)*(m.d-2*m.t)*(m.h-2*m.t))msg='高さから板2枚分を引いたかな？この容器にふたはないので、高さは底の1枚分だけ引くよ。';
  else if(m.type==='tank'&&m.unit==='L'&&n===v*1000)msg='cm³ ではその数字！答えの単位は L だよ。1 L = 1000 cm³ だから、1000で割ろう。';
  else if(m.type==='step'&&n===m.w*m.d*m.h)msg='それは、へこんだところも含めた大きな直方体の体積だね。欠けた部分の体積を引いてみよう。';
  else if(m.type==='step'&&n===m.w*m.d*m.b+m.a*m.d*m.h)msg='上の部分に全体の高さを使っていないかな？上の高さは「全体の高さ − 下の高さ」だよ。';
  else if((m.type==='rect'||m.type==='cube')&&n===m.w*m.d)msg=`それは1段分だね。同じ段が ${m.h} 段あるので、あと何をかければいいかな？`;
  else if(n===m.w+m.d+m.h)msg='長さを足したかな？体積は「下の面に並ぶ個数 × 段の数」。3つの長さをかけてみよう。';feedback(msg);
 }
}
$('levels').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(b){const l=Number(b.dataset.level);start(l,done.has(`${l}-0`)&&!done.has(`${l}-1`)?1:0);}});
$('answer-form').addEventListener('submit',e=>{e.preventDefault();check();});
$('hint').onclick=()=>{const h=hints();s.hint=Math.min(3,s.hint+1);$('hint-box').innerHTML=h.slice(0,s.hint).map((t,i)=>`<div class="hint-card"><b>ヒント ${i+1}</b>${t}</div>`).join('');$('hint').textContent=s.hint===3?'ヒントはここまで':'次のヒントを見る';$('hint').disabled=s.hint===3;};
$('explain').onclick=()=>{if(!s.solved)s.revealed=true;$('hint-box').innerHTML=`<div class="hint-card"><b>こう考えると解けるよ</b>${explanation()}</div>`;if(!s.solved){$('next').textContent='数字を変えて挑戦 →';$('next').hidden=false;}};
$('next').onclick=()=>{if(s.revealed)start(s.level,s.q,s.round+1);else if(s.q===0)start(s.level,1);else start((s.level+1)%6,0);};
$('experiment').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.split){s.mode='parts';s.split=b.dataset.split;}else if(b.dataset.mode)s.mode=b.dataset.mode;for(const x of $('experiment').querySelectorAll('.segmented button')){x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));}discovery();draw();});
$('experiment').addEventListener('input',e=>{const t=e.target,v=Number(t.value);if(t.id==='layers'){m.h=v;$('layers-value').textContent=`${v} cm`;resetAnswer();renderText();}else if(t.id.startsWith('size-')){m[t.id.slice(-1)]=v;$(t.id+'-value').textContent=`${v} cm`;resetAnswer();renderText();}else if(t.id==='separate'){s.gap=v;s.mode='parts';$('separate-value').textContent=`${v}%`;for(const b of $('experiment').querySelectorAll('.segmented button')){const active=b.dataset.split===s.split;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}}else if(t.id==='water'){s.water=v;$('water-value').textContent=`${v}%`;}discovery();draw();});
$('rotate-left').onclick=()=>{s.yaw-=.25;draw();};$('rotate-right').onclick=()=>{s.yaw+=.25;draw();};$('reset-view').onclick=()=>{s.yaw=.64;draw();};$('labels').onclick=()=>{s.labels=!s.labels;$('labels').setAttribute('aria-pressed',String(s.labels));$('labels').textContent=s.labels?'寸法を表示':'寸法は非表示';draw();};
let drag=null;$('scene').addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,yaw:s.yaw};$('scene').setPointerCapture(e.pointerId);});$('scene').addEventListener('pointermove',e=>{if(!drag)return;s.yaw=drag.yaw+(e.clientX-drag.x)*.008;draw();});$('scene').addEventListener('pointerup',()=>drag=null);$('scene').addEventListener('pointercancel',()=>drag=null);$('guide-button').onclick=()=>$('guide').showModal();
start(0);
const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{Promise.resolve(context.registerTool({name:'open_volume_lesson',title:'体積の学習ステップを開く',description:'指定した学習ステップの最初の問題を開きます。入力中の解答をリセットします。達成記録は変更しません。',inputSchema:{type:'object',properties:{step:{type:'integer',minimum:1,maximum:6}},required:['step'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.step)||input.step<1||input.step>6||Object.keys(input).some(k=>k!=='step'))throw new Error('step must be an integer from 1 to 6');start(input.step-1);return {step:input.step,title:titles[input.step-1],question:$('question-title').textContent};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
})();

