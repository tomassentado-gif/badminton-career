const $ = id => document.getElementById(id);
const STORAGE_KEY = "badmintonCareerSaveV1";
const tournaments = [
 {id:"local-open",name:"National Junior Open",country:"Portugal",city:"Lisbon",week:3,tier:"National",level:"Junior",points:80,prize:100,energy:24,difficulty:42},
 {id:"iberian",name:"Iberian Junior Challenge",country:"Spain",city:"Oviedo",week:7,tier:"International",level:"Junior",points:160,prize:220,energy:28,difficulty:49},
 {id:"european",name:"European Junior Circuit",country:"Denmark",city:"Odense",week:12,tier:"International",level:"Junior",points:260,prize:400,energy:32,difficulty:57},
 {id:"national-champ",name:"National Championships",country:"Portugal",city:"Porto",week:19,tier:"National",level:"Senior",points:220,prize:350,energy:30,difficulty:55},
 {id:"future-series",name:"Future Series",country:"France",city:"Paris",week:27,tier:"International",level:"Senior",points:420,prize:700,energy:35,difficulty:66},
 {id:"world-tour",name:"International Challenge",country:"Malaysia",city:"Kuala Lumpur",week:36,tier:"International",level:"Senior",points:650,prize:1200,energy:38,difficulty:75},
 {id:"finals",name:"Season Finals",country:"Portugal",city:"Caldas da Rainha",week:48,tier:"National",level:"Senior",points:300,prize:500,energy:30,difficulty:62}
];
const sessionTypes = [
 {id:"technical",name:"Technical court session",desc:"Shot quality, consistency and control",icon:"⌁",energy:10,attrs:{Technique:2,Tactics:1},type:"Court"},
 {id:"physical",name:"Physical development",desc:"Speed, power and athletic capacity",icon:"↗",energy:16,attrs:{Speed:2,Power:2,Stamina:1},type:"Gym"},
 {id:"tactical",name:"Tactical preparation",desc:"Patterns, decisions and match plans",icon:"◎",energy:8,attrs:{Tactics:2,Mental:1},type:"Court"},
 {id:"match",name:"Match practice",desc:"Pressure, consistency and competition rhythm",icon:"♜",energy:14,attrs:{Technique:1,Mental:2,Tactics:1},type:"Court"},
 {id:"recovery",name:"Recovery & mobility",desc:"Restore energy and protect your condition",icon:"＋",energy:-30,attrs:{Stamina:1},type:"Recovery"}
];
const freshState = () => ({player:null,week:1,year:2026,energy:85,fitness:70,form:50,morale:70,wins:0,losses:0,money:0,points:0,ranking:1240,trainingPlan:["technical","physical","tactical","match","recovery"],completedWeeks:0,attributes:{Technique:48,Speed:45,Power:43,Stamina:46,Tactics:42,Mental:44},activity:[],entered:[],results:[],lastFocus:"Build your foundations"});
let state = loadState() || freshState();
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(e){return null}}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$("save-indicator").textContent="● SAVED"}catch(e){$("save-indicator").textContent="● SAVE ERROR"}}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function initials(name){return name.split(" ").filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join("")}
function currentLevel(){const avg=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;return avg<48?"Academy prospect":avg<58?"National talent":avg<68?"International hopeful":avg<80?"Elite player":"World-class"}
function log(title,detail){state.activity.unshift({title,detail,week:state.week,year:state.year});state.activity=state.activity.slice(0,8)}
function dateForWeek(week){const d=new Date(state.year,0,1);d.setDate(d.getDate()+(week-1)*7);return d}
function shortDate(week){return dateForWeek(week).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}).toUpperCase()}
function eventById(id){return tournaments.find(t=>t.id===id)}
function nextEvent(){return tournaments.find(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id))||null}
function goTo(page){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$("page-"+page).classList.add("active");document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));renderPage(page);window.scrollTo({top:0,behavior:"smooth"})}
function renderActivity(){$("activity-list").innerHTML=state.activity.length?state.activity.slice(0,5).map(a=>'<div class="activity-item"><i class="activity-dot"></i><div><b>'+a.title+'</b><small>'+a.detail+'</small></div></div>').join(""):'<p class="muted">Your career story will appear here. Start training to make your mark.</p>'}
function renderAttributes(){const names={Technique:"Technique",Speed:"Speed",Power:"Power",Stamina:"Stamina",Tactics:"Tactics",Mental:"Mental"};$("attributes-list").innerHTML=Object.entries(state.attributes).map(([key,value])=>'<div class="attribute"><span>'+names[key]+'</span><div class="attribute-meter"><i style="width:'+value+'%"></i></div><b>'+value+'</b></div>').join("")}
function renderOverview(){
 $("season-label").textContent="SEASON "+state.year;$("date-line").textContent="SEASON "+state.year+" · WEEK "+String(state.week).padStart(2,"0");
 $("welcome-title").textContent="Welcome, "+state.player.name+".";$("player-subtitle").textContent=state.player.country+" · "+state.player.discipline+" · "+currentLevel();
 $("season-number").textContent=state.year;$("ranking").textContent="#"+state.ranking.toLocaleString("en-US");$("points").textContent=state.points+" ranking points";
 $("level").textContent=state.player.age<19?"Junior":state.player.age<23?"U23":"Senior";$("age-stat").textContent="Age "+state.player.age;
 $("record").textContent=state.wins+"–"+state.losses;const played=state.wins+state.losses;$("win-rate").textContent=played?Math.round(state.wins/played*100)+"% win rate": "No matches played";
 $("money").textContent="€"+state.money.toLocaleString("en-US");$("week-label").textContent="WEEK "+String(state.week).padStart(2,"0");
 $("energy-meter").style.width=state.energy+"%";$("energy-value").textContent=state.energy+"%";$("fitness-value").textContent=state.fitness;$("form-value").textContent=state.form;$("morale-value").textContent=state.morale;
 const count=state.trainingPlan.length;$("sessions-count").textContent=count+" / 5 sessions planned";$("week-progress").style.width=(count/5*100)+"%";
 const event=nextEvent();$("next-event-content").innerHTML=event?'<div class="event-preview"><div class="event-date"><b>'+String(event.week).padStart(2,"0")+'</b><span>'+shortDate(event.week).split(" ")[1]+'</span></div><div class="event-info"><b>'+event.name+'</b><small>'+event.city+', '+event.country+' · '+event.tier+'</small></div><span class="event-level">'+event.points+' PTS</span></div>':'<p class="muted">All scheduled tournaments have been completed. Advance to the next season.</p>';
 $("focus-title").textContent=state.lastFocus;$("focus-copy").textContent=count+" sessions planned this week. Complete your programme to improve your game.";
 $("side-name").textContent=state.player.name;$("side-discipline").textContent=state.player.discipline;$("avatar-initials").textContent=initials(state.player.name);$("profile-avatar").textContent=initials(state.player.name);
 renderActivity();
}
function renderTraining(){
 $("training-week").textContent="WEEK "+String(state.week).padStart(2,"0");$("training-energy-meter").style.width=state.energy+"%";$("training-energy-value").textContent=state.energy+"%";
 $("session-list").innerHTML=sessionTypes.map(s=>{const selected=state.trainingPlan.includes(s.id);return '<button class="session-option '+(selected?"selected":"")+'" data-session="'+s.id+'"><span class="session-icon">'+s.icon+'</span><span><b>'+s.name+'</b><small>'+s.desc+'</small></span><span class="session-meta">'+s.type+'<br>'+(s.energy<0?"+"+Math.abs(s.energy):"-"+s.energy)+"% energy</span></button>"}).join("");
 $("training-summary").textContent=state.trainingPlan.length+" of 5 sessions planned";
 document.querySelectorAll(".session-option").forEach(btn=>btn.addEventListener("click",()=>{const id=btn.dataset.session;const index=state.trainingPlan.indexOf(id);if(index>=0)state.trainingPlan.splice(index,1);else if(state.trainingPlan.length<5)state.trainingPlan.push(id);else{toast("Your week is full. Remove a session first.");return}save();renderTraining();renderOverview()}));
}
function renderCalendar(){
 const upcoming=tournaments.filter(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id)).length,played=state.results.length;
 $("calendar-summary").innerHTML='<div class="summary-tile"><span>EVENTS THIS SEASON</span><b>'+tournaments.length+'</b></div><div class="summary-tile"><span>COMPLETED</span><b>'+played+'</b></div><div class="summary-tile"><span>UPCOMING</span><b>'+upcoming+'</b></div>';
 $("calendar-year").textContent=state.year;
 $("calendar-list").innerHTML=tournaments.map(t=>{const result=state.results.find(r=>r.id===t.id);const past=t.week<state.week&&!result;return '<div class="calendar-event"><div class="calendar-date"><b>'+String(t.week).padStart(2,"0")+'</b><span>'+shortDate(t.week).split(" ")[1]+'</span></div><div class="calendar-event-info"><b>'+t.name+'</b><small>'+t.city+', '+t.country+' · '+t.tier+' · '+t.points+' ranking points</small></div><span class="event-status '+(result||past?"completed":"")+'">'+(result?result.outcome:past?"MISSED":"UPCOMING")+'</span></div>'}).join("");
}
function renderTournaments(){
 const available=tournaments.filter(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id));$("events-count").textContent=available.length+" EVENTS";
 $("tournament-list").innerHTML=tournaments.map(t=>{const result=state.results.find(r=>r.id===t.id);const missed=t.week<state.week&&!result;const disabled=!!result||missed||state.energy<25;return '<article class="tournament-card"><div class="tournament-card-top"><span class="tier-tag">'+t.tier.toUpperCase()+' · '+t.level.toUpperCase()+'</span><span class="week-label">WEEK '+String(t.week).padStart(2,"0")+'</span></div><h2>'+t.name+'</h2><p>'+t.city+', '+t.country+' · '+shortDate(t.week)+'</p><div class="tournament-facts"><span><b>'+t.points+'</b> pts</span><span><b>€'+t.prize+'</b> prize</span><span><b>'+t.energy+'%</b> energy</span></div>'+(result?'<div class="event-status">'+result.outcome+' · '+result.stage+'</div>':missed?'<div class="event-status completed">EVENT MISSED</div>':'<button class="secondary-btn enter-event" data-event="'+t.id+'" '+(disabled?'disabled':'')+'>ENTER TOURNAMENT <span>↗</span></button>')+'</article>'}).join("");
 document.querySelectorAll(".enter-event").forEach(btn=>btn.addEventListener("click",()=>enterTournament(btn.dataset.event)));
}
function renderProfile(){
 $("profile-name").textContent=state.player.name;$("profile-subtitle").textContent=state.player.age+" years old · "+state.player.country;$("profile-country").textContent=state.player.country;$("profile-discipline").textContent=state.player.discipline;$("profile-level").textContent=currentLevel();
 const played=state.wins+state.losses,stats=[["Matches played",played],["Matches won",state.wins],["Win rate",played?Math.round(state.wins/played*100)+"%":"—"],["Ranking points",state.points],["Tournaments played",state.results.length],["Prize money","€"+state.money.toLocaleString("en-US")]];
 $("career-stats").innerHTML=stats.map(s=>'<div class="career-stat"><span>'+s[0].toUpperCase()+'</span><b>'+s[1]+'</b></div>').join("");
}
function renderPage(page){if(page==="overview")renderOverview();if(page==="training")renderTraining();if(page==="calendar")renderCalendar();if(page==="tournaments")renderTournaments();if(page==="profile")renderProfile()}
function completeTraining(){
 if(state.trainingPlan.length===0){toast("Plan at least one session first.");return}
 let gained={};let energyChange=0;state.trainingPlan.forEach(id=>{const s=sessionTypes.find(x=>x.id===id);Object.entries(s.attrs).forEach(([k,v])=>gained[k]=(gained[k]||0)+v);energyChange-=s.energy});
 Object.entries(gained).forEach(([k,v])=>state.attributes[k]=Math.min(100,state.attributes[k]+v));
 state.energy=Math.max(15,Math.min(100,state.energy+energyChange));state.fitness=Math.min(100,state.fitness+(state.trainingPlan.some(x=>x==="physical")?3:1));state.form=Math.max(20,Math.min(100,state.form+2));state.morale=Math.min(100,state.morale+1);
 const n=state.trainingPlan.length;state.lastFocus=n>=4?"Consistent work builds champions":n>=2?"A productive week of development":"A lighter week to stay sharp";
 log("Training week completed",n+" sessions · "+Object.keys(gained).join(", ")+" improved");state.completedWeeks++;state.week++;if(state.week>52){state.week=1;state.year++;state.player.age++;state.results=[];state.entered=[];log("New season begins","Welcome to season "+state.year)}
 state.trainingPlan=["technical","physical","tactical","match","recovery"];save();renderAll();goTo("overview");toast("Training complete. Your attributes have improved.");
}
function enterTournament(id){
 const t=eventById(id);if(!t)return;if(state.energy<t.energy){toast("Not enough energy for this event. Recover before competing.");return}
 if(t.week>state.week){toast("This tournament is not open yet. Advance your training weeks first.");return}
 const avg=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;
 const readiness=avg+(state.form-50)*.12+(state.fitness-70)*.08+(state.morale-70)*.08;
 const chance=Math.max(.12,Math.min(.82,.48+(readiness-t.difficulty)*.018));
 const roll=Math.random();let outcome,stage,won;
 if(roll<chance*.22){won=true;stage="Winner";outcome="CHAMPION";}else if(roll<chance*.48){won=true;stage="Final";outcome="FINALIST";}else if(roll<chance*.72){won=true;stage="Semi-final";outcome="SEMI-FINAL";}else if(roll<chance){won=true;stage="Quarter-final";outcome="QUARTER-FINAL";}else{won=false;stage="Early rounds";outcome="EARLY EXIT";}
 const earned=won?Math.round(t.points*(stage==="Winner"?1:stage==="Final"? .72:stage==="Semi-final"? .48:.25)):Math.round(t.points*.05);
 const prize=won?Math.round(t.prize*(stage==="Winner"?1:stage==="Final"? .6:stage==="Semi-final"? .3:.12)):0;
 state.energy=Math.max(8,state.energy-t.energy);state.form=Math.max(20,Math.min(100,state.form+(won?5:-5)));state.morale=Math.max(15,Math.min(100,state.morale+(won?6:-7)));state.points+=earned;state.money+=prize;
 if(won){state.wins++;state.ranking=Math.max(1,state.ranking-Math.max(2,Math.round(earned/4)));state.attributes.Mental=Math.min(100,state.attributes.Mental+1)}else{state.losses++;state.ranking+=Math.max(1,Math.round(t.points/100))}
 state.results.push({id:t.id,outcome,stage,earned,prize});state.entered.push(id);log(t.name+": "+outcome,stage+" · +"+earned+" points · €"+prize);save();renderAll();goTo("tournaments");toast(t.name+": "+outcome+"!");
}
function renderAll(){if(!state.player)return;renderOverview();renderAttributes();renderTraining();renderCalendar();renderTournaments();renderProfile()}
$("create-form").addEventListener("submit",e=>{e.preventDefault();const name=$("player-name").value.trim();if(!name)return;const level=$("start-level").value;state=freshState();state.player={name,age:Number($("player-age").value),country:$("player-country").value,discipline:$("player-discipline").value};if(level==="talent"){Object.keys(state.attributes).forEach(k=>state.attributes[k]+=5);state.ranking=650;state.energy=90}else if(level==="challenger"){Object.keys(state.attributes).forEach(k=>state.attributes[k]+=9);state.ranking=320;state.energy=95;state.points=80}log("Career started",""+state.player.country+" · "+state.player.discipline);save();$("start-screen").classList.add("hidden");$("career-screen").classList.remove("hidden");renderAll();goTo("overview")});
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.goto)));
$("complete-training").addEventListener("click",completeTraining);
$("reset-career").addEventListener("click",()=>{if(!confirm("Delete this career and all saved progress on this browser?"))return;localStorage.removeItem(STORAGE_KEY);location.reload()});
function boot(){if(state.player){$("start-screen").classList.add("hidden");$("career-screen").classList.remove("hidden");renderAll();goTo("overview")}else{$("career-screen").classList.add("hidden");$("start-screen").classList.remove("hidden")}}
boot();
