const $ = id => document.getElementById(id);
const STORAGE_KEY = "badmintonCareerSaveV1";
const tournaments = [
 {id:"regional-1",name:"Regional Circuit — North",country:"Portugal",city:"Porto",week:2,tier:"Regional",level:"Junior",points:25,prize:35,energy:15,difficulty:35},
 {id:"local-open",name:"National Junior Open",country:"Portugal",city:"Lisbon",week:4,tier:"National",level:"Junior",points:80,prize:100,energy:24,difficulty:42},
 {id:"regional-2",name:"Regional Circuit — Centre",country:"Portugal",city:"Coimbra",week:7,tier:"Regional",level:"Junior",points:30,prize:40,energy:16,difficulty:38},
 {id:"iberian",name:"Iberian Junior Challenge",country:"Spain",city:"Oviedo",week:9,tier:"International",level:"Junior",points:160,prize:220,energy:28,difficulty:49},
 {id:"regional-3",name:"Regional Circuit — South",country:"Portugal",city:"Setúbal",week:12,tier:"Regional",level:"Junior",points:35,prize:45,energy:17,difficulty:40},
 {id:"european",name:"European Junior Circuit",country:"Denmark",city:"Odense",week:16,tier:"International",level:"Junior",points:260,prize:400,energy:32,difficulty:57},
 {id:"national-champ",name:"National Championships",country:"Portugal",city:"Porto",week:20,tier:"National",level:"Senior",points:220,prize:350,energy:30,difficulty:55},
 {id:"regional-4",name:"Regional Circuit — North II",country:"Portugal",city:"Braga",week:24,tier:"Regional",level:"Senior",points:40,prize:55,energy:18,difficulty:44},
 {id:"future-series",name:"Future Series",country:"France",city:"Paris",week:28,tier:"International",level:"Senior",points:420,prize:700,energy:35,difficulty:66},
 {id:"regional-5",name:"Regional Circuit — National Qualifier",country:"Portugal",city:"Aveiro",week:33,tier:"Regional",level:"Senior",points:45,prize:60,energy:18,difficulty:47},
 {id:"world-tour",name:"International Challenge",country:"Malaysia",city:"Kuala Lumpur",week:38,tier:"International",level:"Senior",points:650,prize:1200,energy:38,difficulty:75},
 {id:"finals",name:"National Season Finals",country:"Portugal",city:"Caldas da Rainha",week:48,tier:"National",level:"Senior",points:300,prize:500,energy:30,difficulty:62}
];
const sessionTypes = [
 {id:"technical",name:"Technical court session",desc:"Shot quality, consistency and control",icon:"⌁",energy:10,attrs:{Technique:2,Tactics:1},type:"Court"},
 {id:"physical",name:"Physical development",desc:"Speed, power and athletic capacity",icon:"↗",energy:16,attrs:{Speed:2,Power:2,Stamina:1},type:"Gym"},
 {id:"tactical",name:"Tactical preparation",desc:"Patterns, decisions and match plans",icon:"◎",energy:8,attrs:{Tactics:2,Mental:1},type:"Court"},
 {id:"match",name:"Match practice",desc:"Pressure, consistency and competition rhythm",icon:"♜",energy:14,attrs:{Technique:1,Mental:2,Tactics:1},type:"Court"},
 {id:"recovery",name:"Recovery & mobility",desc:"Restore energy and protect your condition",icon:"＋",energy:-30,attrs:{Stamina:1},type:"Recovery"}
];
const freshState = () => ({player:null,week:1,year:2026,energy:85,fitness:70,form:50,morale:70,wins:0,losses:0,money:1500,points:0,ranking:1240,trainingPlan:["technical","physical","tactical","match","recovery"],completedWeeks:0,trainingDone:false,developmentXP:{Technique:0,Speed:0,Power:0,Stamina:0,Tactics:0,Mental:0},club:"independent",coach:"none",weeklyIncome:0,weeklyCosts:0,prizeTotal:0,callups:[],ledger:[],teamBudget:0,staff:{},sponsorOffers:[],sponsorContracts:[],attributes:{Technique:48,Speed:45,Power:43,Stamina:46,Tactics:42,Mental:44},activity:[],entered:[],results:[],activeTournament:null,lastFocus:"Build your foundations"});
let state = loadState() || freshState();
state=Object.assign(freshState(),state,{attributes:Object.assign(freshState().attributes,state.attributes||{})});
state.callups=state.callups||[];state.ledger=state.ledger||[];state.trainingDone=!!state.trainingDone;state.club=state.club||"independent";state.coach=state.coach||"none";state.weeklyIncome=state.weeklyIncome||0;state.weeklyCosts=state.weeklyCosts||0;state.prizeTotal=state.prizeTotal||0;state.activeTournament=state.activeTournament||null;state.developmentXP=Object.assign({Technique:0,Speed:0,Power:0,Stamina:0,Tactics:0,Mental:0},state.developmentXP||{});state.teamBudget=Number(state.teamBudget)||0;state.staff=state.staff||{};state.sponsorOffers=state.sponsorOffers||[];state.sponsorContracts=state.sponsorContracts||[];
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(e){return null}}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$("save-indicator").textContent="● SAVED"}catch(e){$("save-indicator").textContent="● SAVE ERROR"}}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function initials(name){return name.split(" ").filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join("")}
function currentLevel(){const avg=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;return avg<48?"Academy prospect":avg<58?"National talent":avg<68?"International hopeful":avg<80?"Elite player":"World-class"}
function log(title,detail){state.activity.unshift({title,detail,week:state.week,year:state.year});state.activity=state.activity.slice(0,8)}
function dateForWeek(week){const d=new Date(state.year,0,1);d.setDate(d.getDate()+(week-1)*7);return d}
function shortDate(week){return dateForWeek(week).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}).toUpperCase()}
function eventById(id){return tournaments.find(t=>t.id===id)}
function visibleTournaments(){return tournaments.filter(t=>state.callups.length||t.tier!=="International")}
function nextEvent(){return visibleTournaments().find(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id))||null}
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
 const count=state.trainingPlan.length;$("sessions-count").textContent=state.trainingDone?"Training completed · ready to advance":count+" / 5 sessions planned";$("week-progress").style.width=(state.trainingDone?100:count/5*100)+"%";
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
 const upcoming=visibleTournaments().filter(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id)).length,played=state.results.length;
 $("calendar-summary").innerHTML='<div class="summary-tile"><span>EVENTS THIS SEASON</span><b>'+tournaments.length+'</b></div><div class="summary-tile"><span>COMPLETED</span><b>'+played+'</b></div><div class="summary-tile"><span>UPCOMING</span><b>'+upcoming+'</b></div>';
 $("calendar-year").textContent=state.year;
 $("calendar-list").innerHTML=visibleTournaments().map(t=>{const result=state.results.find(r=>r.id===t.id);const past=t.week<state.week&&!result;return '<div class="calendar-event"><div class="calendar-date"><b>'+String(t.week).padStart(2,"0")+'</b><span>'+shortDate(t.week).split(" ")[1]+'</span></div><div class="calendar-event-info"><b>'+t.name+'</b><small>'+t.city+', '+t.country+' · '+t.tier+' · '+t.points+' ranking points</small></div><span class="event-status '+(result||past?"completed":"")+'">'+(result?result.outcome:past?"MISSED":"UPCOMING")+'</span></div>'}).join("");
}
function renderTournaments(){
 const available=visibleTournaments().filter(t=>t.week>=state.week&&!state.results.some(r=>r.id===t.id));$("events-count").textContent=available.length+" EVENTS";
 renderLiveTournament();
 $("tournament-list").innerHTML=visibleTournaments().map(t=>{const result=state.results.find(r=>r.id===t.id);const missed=t.week<state.week&&!result;const due=t.week===state.week;const disabled=!!result||missed||!due||state.energy<15||!!state.activeTournament;return '<article class="tournament-card"><div class="tournament-card-top"><span class="tier-tag">'+t.tier.toUpperCase()+' · '+t.level.toUpperCase()+'</span><span class="week-label">WEEK '+String(t.week).padStart(2,"0")+'</span></div><h2>'+t.name+'</h2><p>'+t.city+', '+t.country+' · '+shortDate(t.week)+'</p><div class="tournament-facts"><span><b>'+t.points+'</b> pts</span><span><b>€'+t.prize+'</b> prize</span><span><b>'+t.energy+'%</b> energy</span></div>'+(result?'<div class="event-status">'+result.outcome+' · '+result.stage+'</div>':missed?'<div class="event-status completed">EVENT MISSED</div>':state.activeTournament&&state.activeTournament.id===t.id?'<div class="event-status">TOURNAMENT IN PROGRESS</div>':'<button class="secondary-btn enter-event" data-event="'+t.id+'" '+(disabled?'disabled':'')+'>'+(due?'START TOURNAMENT':'AVAILABLE IN WEEK '+t.week)+' <span>↗</span></button>')+'</article>'}).join("");
 document.querySelectorAll(".enter-event").forEach(btn=>btn.addEventListener("click",()=>enterTournament(btn.dataset.event)));
}
const tournamentOpponents=[
 {name:"Luca Moretti",country:"Italy",rating:72},{name:"Emil Sørensen",country:"Denmark",rating:68},{name:"Hugo Martin",country:"France",rating:65},{name:"Daniel Kim",country:"South Korea",rating:62},{name:"Rafael Costa",country:"Brazil",rating:59},{name:"Milan Novak",country:"Czechia",rating:56},{name:"Arjun Patel",country:"India",rating:54},{name:"Noah Williams",country:"England",rating:61},{name:"Mateo García",country:"Spain",rating:58},{name:"Kenji Sato",country:"Japan",rating:70},{name:"Tiago Almeida",country:"Portugal",rating:52},{name:"Jonas Berg",country:"Sweden",rating:64}
];
function opponentForRound(round){const avg=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;const pool=tournamentOpponents.filter(o=>Math.abs(o.rating-(avg+(round-1)*2))<18);const choices=pool.length?pool:tournamentOpponents;return {...choices[Math.floor(Math.random()*choices.length)]}}
function enterTournament(id){
 const t=eventById(id);if(!t||state.activeTournament)return;
 if(t.week!==state.week){toast("You can only start this tournament during its scheduled week.");return}
 if(state.energy<15){toast("Recover some energy before entering this tournament.");return}
 state.energy=Math.max(5,state.energy-t.energy);
 state.activeTournament={id:t.id,round:0,opponent:opponentForRound(1),playerGames:0,opponentGames:0,gamePlayer:0,gameOpponent:0,games:[],rallies:[],completedMatches:[]};
 log("Tournament started",t.name+" · Draw confirmed");save();renderAll();goTo("tournaments");toast("Draw ready. Your first match is waiting.");
}
function matchStage(round){return ["Quarter-final","Semi-final","Final"][round]||"Final"}
function rallyWonByPlayer(m){
 const avg=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;
 const advantage=(avg-m.opponent.rating)*.012+(state.attributes.Technique-50)*.0015+(state.attributes.Mental-50)*.001;
 return Math.random()<Math.max(.25,Math.min(.75,.5+advantage));
}
function playRally(){
 const m=state.activeTournament;if(!m)return;
 const playerWon=rallyWonByPlayer(m);
 if(playerWon)m.gamePlayer++;else m.gameOpponent++;
 m.rallies.unshift({score:m.gamePlayer+"-"+m.gameOpponent,winner:playerWon?"You":m.opponent.name});
 const high=Math.max(m.gamePlayer,m.gameOpponent),low=Math.min(m.gamePlayer,m.gameOpponent);
 if((high>=21&&high-low>=2)||high===30){
  const playerGame=m.gamePlayer>m.gameOpponent;
  m.games.push({you:m.gamePlayer,opponent:m.gameOpponent});
  if(playerGame)m.playerGames++;else m.opponentGames++;
  m.gamePlayer=0;m.gameOpponent=0;
  if(m.playerGames===2||m.opponentGames===2){completeTournamentMatch(m.playerGames===2);return}
 }
 save();renderAll();
}
function completeTournamentMatch(won){
 const m=state.activeTournament,stage=matchStage(m.round),score=m.games.map(g=>g.you+"-"+g.opponent).join(", ");
 m.completedMatches.push({opponent:m.opponent.name,score,won});
 if(!won){state.losses++;finishTournament(stage,false,score);return}
 state.wins++;state.attributes.Mental=Math.min(100,state.attributes.Mental+1);
 if(m.round===2){finishTournament("Winner",true,score);return}
 log(stage+" won","Defeated "+m.completedMatches[m.completedMatches.length-1].opponent+" · "+score);
 m.round++;m.opponent=opponentForRound(m.round+1);m.playerGames=0;m.opponentGames=0;m.gamePlayer=0;m.gameOpponent=0;m.games=[];m.rallies=[];
 save();renderAll();toast("You won! Next: "+matchStage(m.round));
}
function finishTournament(stage,won,score){
 const m=state.activeTournament,t=eventById(m.id);
 const multiplier=won?1:(stage==="Semi-final"?0.48:0.25);
 const earned=Math.round(t.points*multiplier),prize=won?t.prize:Math.round(t.prize*(stage==="Semi-final"?0.3:0.12));
 state.points+=earned;state.money+=prize;state.prizeTotal+=prize;state.ledger.unshift({week:state.week,label:t.name+" prize money",amount:prize,type:"income"});
 const travelCost=Math.round(t.energy*2.5);state.money-=travelCost;state.ledger.unshift({week:state.week,label:t.name+" travel & entry",amount:-travelCost,type:"expense"});
 if(won){state.ranking=Math.max(1,state.ranking-Math.max(2,Math.round(earned/4)));state.form=Math.min(100,state.form+5);state.morale=Math.min(100,state.morale+6)}
 else{state.ranking+=Math.max(1,Math.round(t.points/100));state.form=Math.max(20,state.form-4);state.morale=Math.max(15,state.morale-5)}
 state.results.push({id:t.id,outcome:won?"CHAMPION":stage.toUpperCase(),stage,earned,prize,matchScores:m.completedMatches});
 log(t.name+": "+(won?"CHAMPION":stage.toUpperCase()),"Tournament result · "+earned+" ranking points · €"+prize);
 state.activeTournament=null;save();renderAll();goTo("tournaments");toast(won?"Tournament champion!":"Tournament completed.");
}
function renderLiveTournament(){
 const root=$("tournament-live");if(!root)return;const m=state.activeTournament;
 if(!m){root.innerHTML="";return}
 const t=eventById(m.id),stage=matchStage(m.round),sets=m.games.map(g=>'<span class="set-score">'+g.you+'–'+g.opponent+'</span>').join("");
 root.innerHTML='<section class="panel live-match-panel"><div class="live-match-head"><div><p class="eyebrow">LIVE TOURNAMENT · '+t.name.toUpperCase()+'</p><h2>'+stage+'</h2><p class="muted">Best of three games · '+state.player.discipline+'</p></div><span class="live-label"><i></i> LIVE MATCH</span></div><div class="match-players"><div class="match-player you"><small>YOU</small><b>'+state.player.name+'</b><span>'+state.player.country+'</span></div><div class="match-vs">VS</div><div class="match-player"><small>OPPONENT</small><b>'+m.opponent.name+'</b><span>'+m.opponent.country+' · level '+m.opponent.rating+'</span></div></div><div class="scoreboard"><div class="score-main"><div><small>GAMES</small><b>'+m.playerGames+' – '+m.opponentGames+'</b></div><div><small>CURRENT GAME</small><b>'+m.gamePlayer+' – '+m.gameOpponent+'</b></div></div><div class="set-scores">'+sets+'</div></div><div class="rally-controls"><button class="primary-btn" id="play-rally">PLAY NEXT RALLY <span>→</span></button><span class="muted">Each click simulates one rally.</span></div><div class="rally-feed"><b>RALLY-BY-RALLY</b>'+(m.rallies.length?m.rallies.slice(0,8).map(r=>'<div><span>'+r.winner+' wins rally</span><strong>'+r.score+'</strong></div>').join(""):'<p class="muted">The match is ready. Play the first rally.</p>')+'</div><div class="completed-match-list"><b>TOURNAMENT PROGRESS</b>'+m.completedMatches.map(x=>'<div><span>'+x.opponent+'</span><strong>'+x.score+' · '+(x.won?"W":"L")+'</strong></div>').join("")+'</div></section>';
 $("play-rally").addEventListener("click",playRally);
}
function renderProfile(){
 $("profile-name").textContent=state.player.name;$("profile-subtitle").textContent=state.player.age+" years old · "+state.player.country;$("profile-country").textContent=state.player.country;$("profile-discipline").textContent=state.player.discipline;$("profile-level").textContent=currentLevel();
 const played=state.wins+state.losses,stats=[["Matches played",played],["Matches won",state.wins],["Win rate",played?Math.round(state.wins/played*100)+"%":"—"],["Ranking points",state.points],["Tournaments played",state.results.length],["Prize money","€"+state.money.toLocaleString("en-US")]];
 $("career-stats").innerHTML=stats.map(s=>'<div class="career-stat"><span>'+s[0].toUpperCase()+'</span><b>'+s[1]+'</b></div>').join("");
}
function renderPage(page){if(page==="overview")renderOverview();if(page==="training")renderTraining();if(page==="calendar")renderCalendar();if(page==="tournaments")renderTournaments();if(page==="profile")renderProfile();if(page==="world")renderWorld();if(page==="finances")renderFinances();if(page==="management")renderManagement();if(page==="selection")renderSelection();if(page==="history")renderHistory()}
function completeTraining(){
 if(state.trainingDone){toast("This week is already completed. Advance to the next week.");return}
 if(state.trainingPlan.length===0){toast("Plan at least one session first.");return}
 let gained={};let energyChange=0;const coachBoost={none:1,assistant:1.03,specialist:1.06,elite:1.1}[state.coach]||1;state.trainingPlan.forEach(id=>{const s=sessionTypes.find(x=>x.id===id);Object.entries(s.attrs).forEach(([k,v])=>gained[k]=(gained[k]||0)+v);energyChange-=s.energy});
 Object.entries(gained).forEach(([k,v])=>{state.developmentXP[k]=(state.developmentXP[k]||0)+v*0.22*coachBoost;const whole=Math.floor(state.developmentXP[k]);if(whole>0){state.attributes[k]=Math.min(100,state.attributes[k]+whole);state.developmentXP[k]-=whole}});
 state.energy=Math.max(15,Math.min(100,state.energy+energyChange));state.fitness=Math.min(100,state.fitness+(state.trainingPlan.some(x=>x==="physical")?3:1));state.form=Math.max(20,Math.min(100,state.form+2));state.morale=Math.min(100,state.morale+1);
 const n=state.trainingPlan.length;state.lastFocus=n>=4?"Consistent work builds champions":n>=2?"A productive week of development":"A lighter week to stay sharp";
 log("Training week completed",n+" sessions · "+Object.keys(gained).join(", ")+" improved");state.completedWeeks++;state.trainingDone=true;if(state.week>52){state.week=1;state.year++;state.player.age++;state.results=[];state.entered=[];log("New season begins","Welcome to season "+state.year)}
 state.trainingPlan=["technical","physical","tactical","match","recovery"];save();renderAll();goTo("overview");toast("Training complete. Review your week, then advance.");
}
function renderAll(){if(!state.player)return;renderOverview();renderAttributes();renderTraining();renderCalendar();renderTournaments();renderProfile();renderWorld();renderFinances();renderManagement();renderSelection();renderHistory()}

const rivals=[{name:"Luca Moretti",country:"Italy",rank:82,points:1840,level:72,age:18},{name:"Emil Sørensen",country:"Denmark",rank:116,points:1510,level:68,age:17},{name:"Hugo Martin",country:"France",rank:143,points:1290,level:65,age:19},{name:"Daniel Kim",country:"South Korea",rank:188,points:1080,level:62,age:18},{name:"Rafael Costa",country:"Brazil",rank:224,points:940,level:59,age:17},{name:"Milan Novak",country:"Czechia",rank:281,points:790,level:56,age:18},{name:"Arjun Patel",country:"India",rank:337,points:650,level:54,age:16}];
function addLedger(label,amount,account="personal"){state.ledger.unshift({week:state.week,label,amount,account});state.ledger=state.ledger.slice(0,40)}
function renderWorld(){
 const list=[...rivals.map(r=>({...r,player:false})),{name:state.player.name,country:state.player.country,rank:state.ranking,points:state.points,level:Math.round(Object.values(state.attributes).reduce((x,y)=>x+y,0)/6),age:state.player.age,player:true}].sort((x,y)=>x.rank-y.rank);
 $("world-summary").innerHTML='<div class="summary-tile"><span>YOUR WORLD RANK</span><b>#'+state.ranking.toLocaleString("en-US")+'</b></div><div class="summary-tile"><span>RANKING POINTS</span><b>'+state.points.toLocaleString("en-US")+'</b></div><div class="summary-tile"><span>RIVALS TRACKED</span><b>'+rivals.length+'</b></div>';
 $("world-ranking").innerHTML=list.map(r=>'<div class="ranking-row '+(r.player?"you":"")+'"><b class="rank-number">#'+r.rank+'</b><span class="rank-player"><b>'+r.name+(r.player?" (YOU)":"")+'</b><small>'+r.country+' · Age '+r.age+'</small></span><span class="rank-points">'+r.points.toLocaleString("en-US")+' pts</span></div>').join("");
 $("rival-list").innerHTML=rivals.slice(0,4).map(r=>'<div class="rival-card"><b>'+r.name+'</b><span>'+r.country+'</span><small>World #'+r.rank+' · '+r.points.toLocaleString("en-US")+' pts</small><div class="meter"><i style="width:'+r.level+'%"></i></div></div>').join("");
}
function renderFinances(){
 $("finance-balance").textContent="€"+state.money.toLocaleString("en-US");$("finance-prizes").textContent="€"+state.prizeTotal.toLocaleString("en-US");$("finance-income").textContent="€"+state.weeklyIncome.toLocaleString("en-US");$("finance-costs").textContent="€"+state.weeklyCosts.toLocaleString("en-US");
 $("finance-ledger").innerHTML=state.ledger.length?state.ledger.slice(0,15).map(x=>'<div class="ledger-row"><span><b>'+x.label+'</b><small>Week '+x.week+'</small></span><strong class="'+(x.amount<0?"negative":"positive")+'">'+(x.amount<0?"−":"+")+'€'+Math.abs(x.amount).toLocaleString("en-US")+'</strong></div>').join(""):'<p class="muted">Your financial activity will appear here as your career develops.</p>';
}

const staffRoles=[
 {id:"doubles",title:"Doubles specialist",salary:95,people:[{name:"Miguel Ferreira",detail:"Doubles tactics · Portugal"},{name:"André Silva",detail:"Rotation and front-court play · Portugal"}]},
 {id:"physical",title:"Physical trainer",salary:85,people:[{name:"Rui Carvalho",detail:"Strength and conditioning · Portugal"},{name:"Pedro Martins",detail:"Speed and power development · Portugal"}]},
 {id:"physio",title:"Physiotherapist",salary:75,people:[{name:"Inês Matos",detail:"Sports physiotherapy · Portugal"},{name:"Mariana Lopes",detail:"Recovery and injury prevention · Portugal"}]},
 {id:"psychologist",title:"Sports psychologist",salary:80,people:[{name:"Sofia Costa",detail:"Performance psychology · Portugal"},{name:"Beatriz Almeida",detail:"Competition routines and focus · Portugal"}]}
];
const sponsorCatalogue=[
 {id:"rallypro",name:"RallyPro",signing:450,weekly:85,duration:16,description:"Equipment and competition support"},
 {id:"shuttleworks",name:"ShuttleWorks",signing:700,weekly:55,duration:20,description:"Long-term development partnership"},
 {id:"courtline",name:"Courtline",signing:250,weekly:145,duration:12,description:"High-performance team funding"}
];
function ensureSponsorOffers(){if(!state.sponsorOffers.length)state.sponsorOffers=sponsorCatalogue.filter(x=>!state.sponsorContracts.some(c=>c.id===x.id)).map(x=>({...x}));}
function acceptSponsor(id){const offer=state.sponsorOffers.find(x=>x.id===id);if(!offer)return;if(state.sponsorContracts.length>=2){toast("Your team can have up to two active sponsors.");return}state.teamBudget+=offer.signing;state.sponsorContracts.push({...offer,weeksLeft:offer.duration});state.sponsorOffers=state.sponsorOffers.filter(x=>x.id!==id);addLedger("Team sponsor: "+offer.name,offer.signing,"team");log("Sponsorship signed",offer.name+" · €"+offer.signing+" initial team funding");save();renderAll();toast(offer.name+" is now sponsoring your team.");}
function hireStaff(roleId,personIndex){const role=staffRoles.find(x=>x.id===roleId),person=role&&role.people[personIndex];if(!role||!person)return;if(state.staff[roleId]){toast("You already have someone in this role.");return}if(state.teamBudget<role.salary*4){toast("Your team budget needs at least four weeks of salary. Secure sponsorship first.");return}state.staff[roleId]={name:person.name,detail:person.detail,salary:role.salary};state.teamBudget-=role.salary*4;addLedger("Staff signing reserve: "+role.title,-role.salary*4,"team");log("Staff hired",role.title+" · "+person.name);save();renderAll();toast(person.name+" joined your technical team.");}
function dismissStaff(roleId){if(!state.staff[roleId])return;const person=state.staff[roleId];delete state.staff[roleId];log("Staff departure",person.name+" left the technical team.");save();renderAll();toast("Staff contract ended.");}
function renderTeamManagement(){
 ensureSponsorOffers();
 $("team-budget").textContent="€"+state.teamBudget.toLocaleString("en-US");
 $("team-staff-cost").textContent="€"+Object.values(state.staff).reduce((sum,x)=>sum+x.salary,0).toLocaleString("en-US")+"/week payroll";
 $("staff-roles").innerHTML=staffRoles.map(role=>{const current=state.staff[role.id],options=role.people.map((p,i)=>'<option value="'+i+'">'+p.name+' — '+p.detail+'</option>').join("");return '<div class="staff-role-card"><div><b>'+role.title+'</b><small>'+(current?current.name+" · "+current.detail:"Available candidates")+'</small></div><strong>€'+role.salary+'/wk</strong>'+(current?'<button class="staff-action" data-dismiss="'+role.id+'">RELEASE</button>':'<div class="staff-hire-row"><select id="staff-'+role.id+'" class="wide-select">'+options+'</select><button class="staff-action" data-hire="'+role.id+'">HIRE</button></div>')+'</div>'}).join("");
 document.querySelectorAll("[data-hire]").forEach(btn=>btn.addEventListener("click",()=>hireStaff(btn.dataset.hire,Number($("staff-"+btn.dataset.hire).value))));
 document.querySelectorAll("[data-dismiss]").forEach(btn=>btn.addEventListener("click",()=>dismissStaff(btn.dataset.dismiss)));
 $("sponsor-contracts").innerHTML=state.sponsorContracts.length?state.sponsorContracts.map(c=>'<div class="sponsor-contract"><span><b>'+c.name+'</b><small>€'+c.weekly+'/week · '+c.weeksLeft+' weeks remaining</small></span><strong class="positive">ACTIVE</strong></div>').join(""):'<p class="muted">No active sponsors. Accept a proposal to start funding your technical team.</p>';
 $("sponsor-offers").innerHTML=state.sponsorOffers.length?state.sponsorOffers.map(o=>'<div class="sponsor-offer"><div><b>'+o.name+'</b><small>'+o.description+'</small></div><div class="sponsor-money"><strong>€'+o.signing+'</strong><small>signing bonus</small><strong>€'+o.weekly+'/week</strong><small>'+o.duration+' weeks</small></div><button class="secondary-btn" data-sponsor="'+o.id+'">ACCEPT PROPOSAL</button></div>').join(""):'<p class="muted">No new proposals at the moment.</p>';
 document.querySelectorAll("[data-sponsor]").forEach(btn=>btn.addEventListener("click",()=>acceptSponsor(btn.dataset.sponsor)));
}
function renderManagement(){
 renderTeamManagement();
 const clubs={independent:["Independent","You manage your career without club support."],local:["Local club","A stable training environment and basic support."],academy:["Performance academy","Structured development, better facilities and coaching access."],elite:["Elite training centre","High-performance environment with premium support."]};
 const coaches={none:["No personal coach","Your development relies on your own planning."],assistant:["Development coach","Regular feedback and a small boost to training gains."],specialist:["Performance coach","Specialist guidance and improved training progression."],elite:["Elite coach","High-level individual support and stronger development gains."]};
 $("club-select").value=state.club;$("coach-select").value=state.coach;$("club-name").textContent=clubs[state.club][0];$("club-description").textContent=clubs[state.club][1];$("coach-name").textContent=coaches[state.coach][0];$("coach-description").textContent=coaches[state.coach][1];
 $("career-objectives").innerHTML=[["Reach the top 500",state.ranking<=500],["Earn 1,000 ranking points",state.points>=1000],["Win a tournament",state.results.some(r=>r.outcome==="CHAMPION")],["Earn a national team call-up",state.callups.length>0]].map(x=>'<div class="objective-row"><span>'+x[0]+'</span><b class="'+(x[1]?"positive":"")+'">'+(x[1]?"COMPLETED":"IN PROGRESS")+'</b></div>').join("");
}
function renderSelection(){
 const progress=Math.max(0,Math.min(100,Math.round((1400-state.ranking)/11)));const eligible=state.ranking<=500||state.points>=900;
 $("selection-meter").style.width=progress+"%";$("selection-progress").textContent=progress+"%";
 $("selection-status").textContent=state.callups.length?"National team experience":"Earn your first call-up";
 $("selection-copy").textContent=eligible?"Your results have put you on the selectors' radar. You may receive a call-up at the end of a competitive week.":"Keep improving your ranking and collect points in higher-level tournaments. A top-500 ranking is a strong first milestone.";
 $("selection-history").innerHTML=state.callups.length?state.callups.map(c=>'<div class="ledger-row"><span><b>'+c.title+'</b><small>Season '+c.year+' · Week '+c.week+'</small></span><strong class="positive">SELECTED</strong></div>').join(""):'<p class="muted">No national team selections yet.</p>';
}
function renderHistory(){
 $("history-timeline").innerHTML=state.activity.length?state.activity.map(x=>'<div class="history-entry"><i></i><div><b>'+x.title+'</b><small>Season '+(x.year||state.year)+' · Week '+x.week+'</small><p>'+x.detail+'</p></div></div>').join(""):'<p class="muted">Your career timeline is waiting for its first milestone.</p>';
 $("history-results").innerHTML=state.results.length?state.results.map(r=>{const t=eventById(r.id);return '<div class="ledger-row"><span><b>'+(t?t.name:r.id)+'</b><small>'+r.stage+'</small></span><strong class="'+(r.outcome==="CHAMPION"?"positive":"")+'">'+r.outcome+'</strong></div>'}).join(""):'<p class="muted">No tournament results recorded yet.</p>';
}
function advanceWeek(){
 if(!state.player)return;
 if(state.activeTournament){toast("Finish your tournament match before advancing the week.");goTo("tournaments");return}
 const due=visibleTournaments().find(t=>t.week===state.week&&!state.results.some(r=>r.id===t.id));
 if(due){toast("You have a tournament this week. Play it before advancing.");goTo("tournaments");return}
 if(!state.trainingDone){toast("Complete your training week before advancing.");return}
 const clubCost={independent:0,local:35,academy:90,elite:180}[state.club]||0;const coachCost={none:0,assistant:45,specialist:100,elite:190}[state.coach]||0;
 state.weeklyIncome=75;state.weeklyCosts=clubCost+coachCost+25;state.money+=state.weeklyIncome-state.weeklyCosts;addLedger("Player development support",state.weeklyIncome);addLedger("Weekly career expenses",-state.weeklyCosts);
 let sponsorIncome=0;state.sponsorContracts=state.sponsorContracts.filter(c=>c.weeksLeft>0);state.sponsorContracts.forEach(c=>{sponsorIncome+=c.weekly;c.weeksLeft--});state.teamBudget+=sponsorIncome;if(sponsorIncome)addLedger("Sponsorship income",sponsorIncome,"team");const payroll=Object.values(state.staff).reduce((sum,x)=>sum+x.salary,0);if(payroll){state.teamBudget-=payroll;addLedger("Technical team payroll",-payroll,"team");}
 state.energy=Math.min(100,state.energy+18);state.form=Math.min(100,state.form+2);state.morale=Math.max(20,Math.min(100,state.morale+(state.money>=0?1:-3)));
 if(!state.callups.length&&(state.ranking<=500||state.points>=900)&&Math.random()<.55){const c={title:"National team training camp",year:state.year,week:state.week};state.callups.push(c);log("National team call-up",c.title+" · "+state.player.country)}
 log("Week "+state.week+" completed","Recovery, finances and season progression updated");state.trainingDone=false;state.week++;
 if(state.week>52){state.week=1;state.year++;state.player.age++;state.results=[];state.entered=[];log("New season begins","Welcome to season "+state.year)}
 save();renderAll();goTo("overview");toast("Week advanced. Your next challenge awaits.");
}
function confirmClub(){const v=$("club-select").value;const cost={independent:0,local:35,academy:90,elite:180}[v];if(cost>state.money){toast("Not enough funds for this club.");return}state.club=v;log("Club arrangement updated","New affiliation: "+v);save();renderAll();toast("Club updated.");}
function confirmCoach(){const v=$("coach-select").value;const cost={none:0,assistant:45,specialist:100,elite:190}[v];if(cost>state.money){toast("Not enough funds for this coach.");return}state.coach=v;log("Coaching team updated","New coach: "+v);save();renderAll();toast("Coaching team updated.");}

$("create-form").addEventListener("submit",e=>{e.preventDefault();const name=$("player-name").value.trim();if(!name)return;const level=$("start-level").value;state=freshState();state.player={name,age:Number($("player-age").value),country:$("player-country").value,discipline:$("player-discipline").value};if(level==="talent"){Object.keys(state.attributes).forEach(k=>state.attributes[k]+=5);state.ranking=650;state.energy=90}else if(level==="challenger"){Object.keys(state.attributes).forEach(k=>state.attributes[k]+=9);state.ranking=320;state.energy=95;state.points=80}log("Career started",""+state.player.country+" · "+state.player.discipline);save();$("start-screen").classList.add("hidden");$("career-screen").classList.remove("hidden");renderAll();goTo("overview")});
$("advance-week").addEventListener("click",advanceWeek);$("club-hire").addEventListener("click",confirmClub);$("coach-hire").addEventListener("click",confirmCoach);
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.page)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.goto)));
$("complete-training").addEventListener("click",completeTraining);
$("reset-career").addEventListener("click",()=>{if(!confirm("Delete this career and all saved progress on this browser?"))return;localStorage.removeItem(STORAGE_KEY);location.reload()});
function boot(){if(state.player){$("start-screen").classList.add("hidden");$("career-screen").classList.remove("hidden");renderAll();goTo("overview")}else{$("career-screen").classList.add("hidden");$("start-screen").classList.remove("hidden")}}
boot();
