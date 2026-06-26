
const lessonTitles = {
"Deutschprofis A1": {"1":"Hallo, ich bin ...","2":"Begrüßungen","3":"Das mache ich gern","4":"Meine Familie","5":"Daher komme ich","6":"Dinge beschreiben","7":"Freizeit","8":"Essen und Trinken","9":"Mein Zuhause","10":"Geschenke","11":"Meine Lieblingstiere","12":"Mein Jahr"},
"Deutschprofis A2": {"1":"Meine Erlebnisse","2":"Meine Freunde","3":"Das kann ich am besten","4":"Wie geht’s denn so?","5":"Unterwegs","6":"Einkaufen","7":"Wohnen","8":"Essen und Trinken","9":"Medien","10":"Mittelalter","11":"Reisen","12":"Schule"},
"Deutschprofis B1": {"1":"Lust auf Sport?","2":"Pop, Rock oder Klassik?","3":"Mensch, Natur, Technik","4":"Das wünsche ich mir","5":"Essen","6":"Zusammen leben","7":"Umwelt braucht Schutz","8":"Leben in 100 Jahren","9":"Wir machen Medien","10":"Du wirst gebraucht"}
};
const lessonCities = {
"Deutschprofis A1": {"1":"Freiburg","2":"Freiburg","3":"Freiburg","4":"Freiburg","5":"Freiburg","6":"Freiburg","7":"Friedenweiler","8":"Friedenweiler","9":"Friedenweiler","10":"Friedenweiler","11":"Friedenweiler","12":"Friedenweiler"},
"Deutschprofis A2": {"1":"Salzburg","2":"Salzburg","3":"Salzburg","4":"Wien","5":"Wien","6":"Wien","7":"Wien","8":"Wien","9":"Wien","10":"Wien","11":"Innsbruck","12":"Innsbruck"},
"Deutschprofis B1": {"1":"Zürich","2":"Zürich","3":"Friedenweiler","4":"Zürich","5":"Zürich","6":"Bern","7":"Bern","8":"Bern","9":"Zürich","10":"Bern"}
};
const cityImages = {
 Freiburg:"linear-gradient(120deg,rgba(255,255,255,.15),rgba(255,255,255,.1)), radial-gradient(circle at 70% 35%,#8b4a37 0 35px,transparent 36px), linear-gradient(to bottom,#8ed3ff 0%,#ccefff 42%,#7fb66b 43%,#4d8b51 72%,#e9f3e8 100%)",
 Friedenweiler:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 58% 58%,#8b4e36 0 52px,transparent 53px), linear-gradient(to bottom,#9fd4f5 0%,#d7edf8 42%,#2f5f45 43%,#183d2e 76%,#eaf2e7 100%)",
 Salzburg:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 68% 52%,#b98b5a 0 62px,transparent 63px), linear-gradient(to bottom,#94d2ff 0%,#d9efff 40%,#7a9b74 41%,#668b60 73%,#f4efe5 100%)",
 Wien:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 68% 56%,#c69250 0 70px,transparent 71px), linear-gradient(to bottom,#b8dffc 0%,#f1dfc1 42%,#c39a62 43%,#a97845 74%,#f6efe4 100%)",
 Zürich:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 68% 60%,#3d91aa 0 75px,transparent 76px), linear-gradient(to bottom,#8fd0ff 0%,#d5f0ff 38%,#99cbd5 39%,#3c93aa 74%,#edf6f4 100%)",
 Bern:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 68% 56%,#935f38 0 70px,transparent 71px), linear-gradient(to bottom,#9ed0f2 0%,#d9edf4 38%,#b98554 39%,#795033 74%,#f4efe4 100%)",
 Innsbruck:"linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.1)), radial-gradient(circle at 70% 48%,#cce0f4 0 82px,transparent 83px), linear-gradient(to bottom,#88caf5 0%,#d5ecff 34%,#b8d1e8 35%,#7fa8ca 70%,#edf4f8 100%)"
};

const books = ["Deutschprofis A1","Deutschprofis A2","Deutschprofis B1"];
let vocab = [];
let activeBook="Deutschprofis A1", activeLesson=1, mode="mc", selected=[], queue=[], current=null;
let xp=Number(localStorage.getItem("dq_xp_pwa")||0), right=0, done=0;
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').classList.remove('hidden');
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('installBtn').classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

async function loadData(){
  const res = await fetch('./data/vocab.json');
  vocab = await res.json();
  init();
}

function lessonKey(n){return "Lektion "+n}
function maxLessons(b){return b==="Deutschprofis B1"?10:12}
function getWords(b=activeBook,l=activeLesson){return vocab.filter(w=>w.book===b && w.lesson===lessonKey(l))}
function getTitle(b=activeBook,l=activeLesson){return (lessonTitles[b]&&lessonTitles[b][String(l)])||lessonKey(l)}
function getCity(b=activeBook,l=activeLesson){return (lessonCities[b]&&lessonCities[b][String(l)])||"Freiburg"}
function init(){document.getElementById("totalWords").textContent=vocab.length; updateStats(); renderBooks(); renderLessons(); renderWords();}
function renderBooks(){
 document.getElementById("bookButtons").innerHTML=books.map(b=>{
  const c=b.replace("Deutschprofis ","").toLowerCase();
  return `<button class="${c} ${b===activeBook?'active':''}" onclick="setBook('${b}')">${b.replace("Deutschprofis ","")}</button>`
 }).join("");
}
function setBook(b){activeBook=b; activeLesson=1; renderBooks(); renderLessons(); renderWords();}
function renderLessons(){
 let h="";
 for(let i=1;i<=maxLessons(activeBook);i++){
  const count=getWords(activeBook,i).length, title=getTitle(activeBook,i);
  h+=`<button class="lesson ${i===activeLesson?'active':''} ${count?'':'empty'}" onclick="setLesson(${i})"><b>Lektion ${i}<br><span>${title}</span></b><span>${count?count+' Wörter':'leer'}</span></button>`;
 }
 document.getElementById("lessonList").innerHTML=h;
}
function setLesson(n){activeLesson=n; renderLessons(); renderWords();}
function renderWords(){
 const words=getWords(), city=getCity(), title=getTitle();
 document.getElementById("hero").style.setProperty("--cityBg", cityImages[city] || cityImages.Freiburg);
 document.getElementById("heroTitle").textContent=city;
 document.getElementById("heroLesson").textContent=`${activeBook.replace("Deutschprofis ","")} · Lektion ${activeLesson}: ${title}`;
 document.getElementById("heroText").textContent= words.length ? `Heute übst du ${words.length} Wörter. Stadt: ${city}.` : "Diese Lektion ist angelegt, aber noch ohne Wortschatz.";
 selected=words.map(w=>w.de);
 document.getElementById("wordList").innerHTML= words.length ? words.map(w=>`<label class="word"><input type="checkbox" checked data-word="${esc(w.de)}" onchange="updateSelected()"><span><b>${esc(w.de)}</b><br><small>${esc(w.es)}</small></span><small>${esc(w.city||city)}</small><button class="secondary" onclick="event.preventDefault(); speak('${attr(w.de)}')">🔊</button></label>`).join("") : `<div style="padding:14px;color:#7a5520">Noch kein Wortschatz geladen.</div>`;
 updateSelected();
}
function updateSelected(){selected=[...document.querySelectorAll("#wordList input:checked")].map(i=>i.dataset.word); document.getElementById("countBadge").textContent=`(${selected.length})`; document.getElementById("selStat").textContent=selected.length;}
function selectAll(v){document.querySelectorAll("#wordList input").forEach(i=>i.checked=v); updateSelected();}
function randomTen(){let boxes=[...document.querySelectorAll("#wordList input")]; boxes.forEach(b=>b.checked=false); shuffle(boxes).slice(0,10).forEach(b=>b.checked=true); updateSelected();}
function setMode(m,btn){mode=m; document.querySelectorAll(".modeRow button").forEach(b=>b.classList.remove("active")); btn.classList.add("active");}
function startSelected(){updateSelected(); const words=getWords().filter(w=>selected.includes(w.de)); if(!words.length){alert("Bitte Wörter auswählen."); return;} queue=shuffle(words); right=0; done=0; updateStats(); nextQuestion();}
function nextQuestion(){if(!queue.length){finish();return;} current=queue.shift(); if(mode==="flash") flash(); else if(mode==="write") write(); else mc();}
function mc(){
 let pool=vocab.filter(w=>w.book===current.book);
 let opts=shuffle([current.es,...shuffle(pool.filter(w=>w.es!==current.es).map(w=>w.es)).slice(0,3)]);
 document.getElementById("practice").innerHTML=`<div style="width:100%"><div class="small">Frage ${done+1}</div><h3>Was bedeutet das?</h3><div class="big">${esc(current.de)} <button class="secondary" onclick="speak('${attr(current.de)}')">🔊</button></div><div class="options">${opts.map(o=>`<button class="option" onclick="checkMC(this,'${attr(o)}')">${esc(o)}</button>`).join("")}</div><div id="feedback" class="feedback"></div><button id="nextBtn" class="hidden" onclick="nextQuestion()">Nächste Frage</button></div>`;
}
function flash(){document.getElementById("practice").innerHTML=`<div class="flash"><div class="small">${current.lesson}</div><div class="big">${esc(current.de)}</div><button class="secondary" onclick="speak('${attr(current.de)}')">🔊 Hören</button> <button class="secondary" onclick="document.getElementById('tr').classList.toggle('hidden')">Übersetzung zeigen</button><p id="tr" class="hidden"><b>${esc(current.es)}</b></p><button onclick="mark(true)">Ich kann das</button> <button class="secondary" onclick="mark(false)">Noch üben</button></div>`;}
function write(){document.getElementById("practice").innerHTML=`<div style="width:100%"><h3>Schreibe auf Deutsch:</h3><p><b>${esc(current.es)}</b></p><input class="answer" id="answer" onkeydown="if(event.key==='Enter')checkWrite()" placeholder="Antwort..."><br><br><button onclick="checkWrite()">Prüfen</button><div id="feedback" class="feedback"></div><button id="nextBtn" class="hidden" onclick="nextQuestion()">Nächste Frage</button></div>`;}
function checkMC(btn,ans){let ok=ans===current.es; document.querySelectorAll(".option").forEach(b=>b.disabled=true); btn.classList.add(ok?"correct":"wrong"); document.querySelectorAll(".option").forEach(b=>{if(b.textContent===current.es)b.classList.add("correct")}); mark(ok,false);}
function checkWrite(){let val=document.getElementById("answer").value; let ok=norm(val)===norm(current.de); mark(ok,false, ok?"✅ Richtig!":"💡 Lösung: "+current.de);}
function mark(ok,advance=true,msg=null){done++; if(ok){right++;xp+=10;tone(660,.12)}else{xp+=2;tone(180,.18)} localStorage.setItem("dq_xp_pwa",xp); updateStats(); let fb=document.getElementById("feedback"); if(fb){fb.textContent=msg||(ok?"✅ Richtig!":"💡 Weiter üben."); fb.className="feedback "+(ok?"":"bad")} let n=document.getElementById("nextBtn"); if(n)n.classList.remove("hidden"); if(advance)setTimeout(nextQuestion,250);}
function finish(){tone(880,.15);document.getElementById("practice").innerHTML=`<div><div style="font-size:50px">🎉</div><h2>Mission geschafft!</h2><p>${done} Wörter geübt · ${right} richtig · ${xp} XP</p><button onclick="startSelected()">Noch einmal üben</button></div>`;}
function updateStats(){document.getElementById("xp").textContent=xp;document.getElementById("xpTop").textContent=xp;document.getElementById("sideXP").textContent=xp;document.getElementById("right").textContent=right;document.getElementById("done").textContent=done;}
function tone(freq,dur){try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=freq;g.gain.value=.045;o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+dur);o.stop(ctx.currentTime+dur)}catch(e){}}
function speak(text){try{const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function norm(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,!?…]/g,"").toLowerCase().trim()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function attr(s){return esc(s).replace(/'/g,"&#39;")}
loadData();
