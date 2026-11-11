const $ = (id) => document.getElementById(id);
const state = { player:null, week:1, year:2026, energy:85, wins:0, losses:0, money:0, points:0, ranking:1240, training:"technical", attributes:{Technique:48,Speed:45,Power:43,Stamina:46,Tactics:42,Mental:44}, activity:[] };
const trainingEffects = {
  technical:{Technique:2,Tactics:1,energy:-12,label:"Technical training"},
  physical:{Speed:2,Power:1,Stamina:2,energy:-18,label:"Physical training"},
  tactical:{Tactics:2,Mental:1,energy:-10,label:"Tactical training"},
  recovery:{energy:24,label:"Recovery week"}
};
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function log(title,detail){state.activity.unshift({title,detail});state.activity=state.activity.slice(0,6);renderActivity()}
function renderActivity(){const list=$("activity-list");list.innerHTML=state.activity.length?state.activity.map(item=>'<div class="activity-item"><i class="activity-dot"></i><div><b>'+item.title+'</b><small>'+item.detail+'</small></div></div>').join():'<p class="muted">Your career story will appear here.</p>'}
function render(){
  $("season-label").textContent="SEASON "+state.year;
  $("welcome-title").textContent="Welcome, "+state.player.name+".";
  $("player-subtitle").textContent=state.player.country+" · "+state.player.discipline+" · Week "+String(state.week).padStart(2,"0");
  $("season-number").textContent=state.year;
  $("ranking").textContent="#"+state.ranking.toLocaleString("en-US");
  $("points").textContent=state.points+" ranking points";
  $("level").textContent=state.player.age<19?"Junior":state.player.age<23?"U23":"Senior";
  $("age-stat").textContent="Age "+state.player.age;
  $("record").textContent=state.wins+"–"+state.losses;
  $("money").textContent="€"+state.money.toLocaleString("en-US");
  $("week-label").textContent="WEEK "+String(state.week).padStart(2,"0");
  $("energy-meter").style.width=state.energy+"%";$("energy-value").textContent=state.energy+"%";
  $("attributes-list").innerHTML=Object.entries(state.attributes).map(([name,value])=>'<div class="attribute"><span>'+name+'</span><div class="attribute-meter"><i style="width:'+value+'%"></i></div><b>'+value+'</b></div>').join("");
  renderActivity();
}
$("create-form").addEventListener("submit",e=>{
  e.preventDefault();const name=$("player-name").value.trim();if(!name)return;
  state.player={name,age:Number($("player-age").value),country:$("player-country").value,discipline:$("player-discipline").value};
  $("start-screen").classList.add("hidden");$("career-screen").classList.remove("hidden");
  log("Career started",""+state.player.country+" · "+state.player.discipline);
  render();window.scrollTo({top:0,behavior:"smooth"});
});
document.querySelectorAll(".training-option").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".training-option").forEach(b=>b.classList.remove("selected"));button.classList.add("selected");state.training=button.dataset.training;
}));
$("advance-week").addEventListener("click",()=>{
  const effect=trainingEffects[state.training];
  Object.entries(effect).forEach(([key,value])=>{if(key==="energy")state.energy=Math.max(20,Math.min(100,state.energy+value));else state.attributes[key]=Math.min(100,state.attributes[key]+value)});
  if(state.training!=="recovery")state.energy=Math.max(20,state.energy);
  state.week++;if(state.week>52){state.week=1;state.year++;state.player.age++}
  log(effect.label,"Week "+(state.week-1)+" completed · Energy "+state.energy+"%");
  render();toast("Week completed. Your player has developed.");
});
$("enter-tournament").addEventListener("click",()=>{
  if(state.energy<30){toast("Your energy is too low. Take a recovery week first.");return}
  const strength=Object.values(state.attributes).reduce((a,b)=>a+b,0)/6;
  const chance=Math.max(.2,Math.min(.9,.25+strength/100-state.losses*.008));
  const won=Math.random()<chance;
  state.energy=Math.max(10,state.energy-25);
  if(won){state.wins++;state.points+=120;state.money+=150;state.ranking=Math.max(1,state.ranking-35);state.attributes.Mental=Math.min(100,state.attributes.Mental+1);log("Tournament: quarter-final reached","Victory · +120 ranking points · €150 prize money");toast("A great result! You won your opening match.");}
  else{state.losses++;state.points+=15;state.ranking=Math.max(1,state.ranking-3);log("Tournament: early exit","Defeat · Valuable experience gained");toast("Not your day. Learn from the match and keep improving.");}
  render();
});
$("reset-career").addEventListener("click",()=>{if(!confirm("Are you sure you want to delete this career and start again?"))return;location.reload()});
