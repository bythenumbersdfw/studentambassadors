import { useState } from "react";

// ── POKÉMON-INSPIRED RANKS ────────────────────────────────────────────────────
// "Gotta catch 'em all — but make it journalism"
const TASKS = [
  { id: "scan",      label: "Tagged one — got a QR scan",                  points: 5,  emoji: "📱", tip: "Every scan is a journalist in your Pokédex" },
  { id: "sit",       label: "Caught one — brought them to the table",       points: 10, emoji: "☕", tip: "In the wild and at the coffee station" },
  { id: "started",   label: "They're engaging — survey started",            points: 15, emoji: "📝", tip: "Almost a full catch — stay close!" },
  { id: "completed", label: "Full catch — survey completed",                points: 25, emoji: "✅", tip: "The rarest catch. Walk them through it." },
  { id: "dfw",       label: "DFW confirmed — bonus catch",                  points: 20, emoji: "⭐", tip: "DFW journalists are the legendary Pokémon here" },
  { id: "mvr",       label: "Legendary catch — Most Valuable Referral",     points: 35, emoji: "🏅", tip: "Long career, major outlet, senior role" },
  { id: "pass",      label: "Passed the ball — contact info submitted",     points: 12, emoji: "📋", tip: "Couldn't bring them in person? Submit their info" },
  { id: "later",     label: "Post-conference interest — captured for later", points: 10, emoji: "🔖", tip: "They want to take the survey after the conference" },
  { id: "share",     label: "Spread the word — social media post",          points: 8,  emoji: "📣", tip: "Tag the project and NAHJ" },
  { id: "recruited", label: "Evolved — recruited another ambassador",       points: 15, emoji: "🤝", tip: "Grow the team, grow your score" },
];

const PRIZES = [
  { place: "🥇 First Place", color: "#F57F17", bg: "#FFFDE7", border: "#F57F17",
    rewards: ["One-on-one mentorship session with a DFW media executive","Named Project Ambassador credit in the published research report","Letter of recommendation available on request","Cash prize (amount TBD)"] },
  { place: "🥈 Second Place", color: "#757575", bg: "#FAFAFA", border: "#9E9E9E",
    rewards: ["Named Project Ambassador credit in the published research report","Journalism tool subscription of your choice","Letter of recommendation available on request","Social media feature on project channels"] },
  { place: "🥉 Third Place", color: "#8B4513", bg: "#FBF5F0", border: "#BCAAA4",
    rewards: ["Named Project Ambassador credit in the published research report","Certificate of participation for your portfolio","Social media feature on project channels"] },
  { place: "🏅 Legendary Catch — MVR", color: "#1E5C2E", bg: "#E8F5E9", border: "#1E5C2E",
    rewards: ["Awarded separately from leaderboard standings","Named in research report as Most Valuable Referral Ambassador","Personal shoutout from the Project Founder","Bonus prize TBD"] },
];

const RANKS = [
  { min: 200, label: "🏆 Master Trainer",   color: "#F57F17" },
  { min: 100, label: "⚡ Elite Reporter",   color: "#7B1FA2" },
  { min: 50,  label: "🌟 Field Journalist", color: "#2E75B6" },
  { min: 0,   label: "🔰 Rookie Reporter",  color: "#595959" },
];

const ORGS = ["UTA Communications","NAHJ Student Member","HCDFW Member","Other"];

const C = {
  navy:"#1F4E79",blue:"#2E75B6",ltblue:"#EBF3FB",
  green:"#1E5C2E",ltgreen:"#E8F5E9",
  gold:"#F57F17",ltgold:"#FFFDE7",
  purple:"#4A148C",ltpurple:"#F3E5F5",
  gray:"#595959",lgray:"#F5F5F5",mgray:"#E0E0E0",
  white:"#FFFFFF",red:"#B71C1C",ltred:"#FFEBEE",
};

function getScore(logs){ return logs.reduce((t,l)=>t+(TASKS.find(tk=>tk.id===l.taskId)?.points||0),0); }
function getRank(s){ return RANKS.find(r=>s>=r.min)||RANKS[RANKS.length-1]; }
const btn=(bg,color,extra={})=>({border:"none",borderRadius:10,cursor:"pointer",fontWeight:"bold",fontFamily:"Arial",background:bg,color,...extra});

export default function AmbassadorGame(){
  const [view,setView]             = useState("leaderboard");
  const [ambassadors,setAmbassadors] = useState([]);
  const [selected,setSelected]     = useState(null);
  const [logForm,setLogForm]       = useState({taskId:"",note:"",respondentName:""});
  const [flash,setFlash]           = useState(null);
  const [tapCount,setTapCount]     = useState(0);
  const [adminMode,setAdminMode]   = useState(false);
  const [adminView,setAdminView]   = useState("dashboard");
  const [signupForm,setSignupForm] = useState({name:"",org:ORGS[0]});
  const [signupDone,setSignupDone] = useState(false);
  // Pass-along / post-conference forms
  const [passForm,setPassForm]     = useState({name:"",email:"",phone:"",org:"",note:"",ambassador:""});
  const [laterForm,setLaterForm]   = useState({name:"",email:"",phone:"",note:""});
  const [passLogs,setPassLogs]     = useState([]);
  const [laterLogs,setLaterLogs]   = useState([]);
  const [passFlash,setPassFlash]   = useState(false);
  const [laterFlash,setLaterFlash] = useState(false);
  // Admin credit trigger
  const [creditForm,setCreditForm] = useState({ambassadorIdx:"",taskId:"sit",note:""});
  const [creditFlash,setCreditFlash] = useState(null);

  const handleTitleTap=()=>{ const n=tapCount+1; setTapCount(n); if(n>=5){setAdminMode(true);setTapCount(0);} };

  const sorted=[...ambassadors].map((a,i)=>({...a,i,score:getScore(a.logs)})).sort((a,b)=>b.score-a.score);
  const totalSurveys  = ambassadors.reduce((t,a)=>t+a.logs.filter(l=>l.taskId==="completed").length,0);
  const totalScans    = ambassadors.reduce((t,a)=>t+a.logs.filter(l=>l.taskId==="scan").length,0);
  const totalActions  = ambassadors.reduce((t,a)=>t+a.logs.length,0);
  const mvr=[...ambassadors].map(a=>({name:a.name,count:a.logs.filter(l=>l.taskId==="mvr").length})).sort((a,b)=>b.count-a.count)[0];
  const byOrg=ORGS.map(org=>{
    const m=ambassadors.filter(a=>a.org===org);
    return{org,count:m.length,totalScore:m.reduce((t,a)=>t+getScore(a.logs),0),totalSurveys:m.reduce((t,a)=>t+a.logs.filter(l=>l.taskId==="completed").length,0),totalActions:m.reduce((t,a)=>t+a.logs.length,0)};
  }).filter(o=>o.count>0);

  const handleLog=()=>{
    if(!logForm.taskId||selected===null)return;
    const updated=ambassadors.map((a,i)=>i!==selected?a:{...a,logs:[...a.logs,{taskId:logForm.taskId,note:logForm.note,respondentName:logForm.respondentName,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),source:"self"}]});
    setAmbassadors(updated);
    const pts=TASKS.find(t=>t.id===logForm.taskId)?.points||0;
    setFlash({name:ambassadors[selected].name,pts});
    setLogForm({taskId:"",note:"",respondentName:""});
    setTimeout(()=>setFlash(null),2800);
  };

  const handleSignup=()=>{
    if(!signupForm.name.trim())return;
    const updated=[...ambassadors,{name:signupForm.name.trim(),org:signupForm.org,logs:[]}];
    setAmbassadors(updated);
    setSelected(updated.length-1);
    setSignupDone(true);
    setTimeout(()=>{setSignupDone(false);setView("log");},2000);
  };

  const handlePass=()=>{
    if(!passForm.name.trim()||!passForm.ambassador.trim())return;
    const entry={...passForm,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};
    setPassLogs([...passLogs,entry]);
    // give the ambassador points
    const ambIdx=ambassadors.findIndex(a=>a.name.toLowerCase()===passForm.ambassador.toLowerCase());
    if(ambIdx>=0){
      const updated=ambassadors.map((a,i)=>i!==ambIdx?a:{...a,logs:[...a.logs,{taskId:"pass",note:`Passed contact: ${passForm.name}`,respondentName:passForm.name,time:entry.time,source:"pass"}]});
      setAmbassadors(updated);
    }
    setPassForm({name:"",email:"",phone:"",org:"",note:"",ambassador:""});
    setPassFlash(true);
    setTimeout(()=>setPassFlash(false),2800);
  };

  const handleLater=()=>{
    if(!laterForm.name.trim()&&!laterForm.email.trim())return;
    setLaterLogs([...laterLogs,{...laterForm,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    setLaterForm({name:"",email:"",phone:"",note:""});
    setLaterFlash(true);
    setTimeout(()=>setLaterFlash(false),2800);
  };

  // Admin credits an ambassador for bringing someone to the table
  const handleAdminCredit=()=>{
    if(creditForm.ambassadorIdx===""||!creditForm.taskId)return;
    const idx=parseInt(creditForm.ambassadorIdx);
    const task=TASKS.find(t=>t.id===creditForm.taskId);
    const updated=ambassadors.map((a,i)=>i!==idx?a:{...a,logs:[...a.logs,{taskId:creditForm.taskId,note:creditForm.note||"Credited by Project Founder",respondentName:"",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),source:"founder"}]});
    setAmbassadors(updated);
    setCreditFlash({name:ambassadors[idx].name,pts:task?.points||0,task:task?.label});
    setCreditForm({ambassadorIdx:"",taskId:"sit",note:""});
    setTimeout(()=>setCreditFlash(null),3000);
  };

  return(
    <div className="app-container" style={{fontFamily:"Arial,sans-serif",background:C.lgray,minHeight:"100svh",paddingBottom:100}}>

      {/* HEADER */}
      <div style={{background:C.navy,padding:"14px 20px 12px",position:"sticky",top:0,zIndex:10}}>
        <div onClick={handleTitleTap} style={{cursor:"default"}}>
          <div style={{color:C.white,fontSize:15,fontWeight:"bold"}}>By the Numbers 📊</div>
          <div style={{color:"#90CAF9",fontSize:11,marginTop:1}}>NAHJ 2025 — Catch Every Story. Gotta get 'em all.</div>
        </div>
        <div style={{display:"flex",gap:5,marginTop:10}}>
          {[{label:"Surveys",value:totalSurveys,emoji:"✅"},{label:"Scans",value:totalScans,emoji:"📱"},{label:"Caught",value:passLogs.length+laterLogs.length,emoji:"🎯"},{label:"Ambassadors",value:ambassadors.length,emoji:"🤝"}].map(s=>(
            <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"5px 3px",textAlign:"center"}}>
              <div style={{color:C.white,fontSize:15,fontWeight:"bold"}}>{s.value}</div>
              <div style={{color:"#90CAF9",fontSize:8}}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <div style={{display:"flex",background:C.white,borderBottom:`2px solid ${C.ltblue}`,overflowX:"auto"}}>
        {[{key:"leaderboard",label:"🏆 Board"},{key:"signup",label:"✋ Join"},{key:"log",label:"➕ Log"},{key:"pass",label:"📋 Pass"},{key:"later",label:"🔖 Later"},{key:"prizes",label:"🎁 Prizes"},{key:"tasks",label:"📋 Catch List"}].map(tab=>(
          <button key={tab.key} onClick={()=>setView(tab.key)} style={{flex:"1 0 auto",padding:"8px 5px",border:"none",cursor:"pointer",background:view===tab.key?C.ltblue:C.white,color:view===tab.key?C.navy:C.gray,fontWeight:view===tab.key?"bold":"normal",fontSize:11,borderBottom:view===tab.key?`3px solid ${C.blue}`:"3px solid transparent",whiteSpace:"nowrap"}}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* ── LEADERBOARD ── */}
        {view==="leaderboard"&&(
          <div>
            {ambassadors.length===0?(
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:44}}>🎮</div>
                <div style={{fontWeight:"bold",fontSize:16,color:C.navy,marginTop:10}}>The hunt hasn't started yet!</div>
                <div style={{fontSize:13,color:C.gray,marginTop:6}}>Hit Join to become an ambassador and start catching journalists.</div>
                <button onClick={()=>setView("signup")} style={{...btn(C.navy,C.white),padding:"12px 28px",fontSize:14,marginTop:16}}>Join the Hunt 🎯</button>
              </div>
            ):(
              <>
                <div style={{fontSize:12,color:C.gray,marginBottom:10,fontStyle:"italic"}}>Live standings — every catch updates your score in real time 🎮</div>
                {mvr&&mvr.count>0&&(
                  <div style={{background:C.ltgreen,border:`2px solid ${C.green}`,borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:"bold",fontSize:11,color:C.green}}>🏅 Legendary Catch Leader</div>
                      <div style={{fontSize:14,color:C.navy,fontWeight:"bold"}}>{mvr.name}</div>
                      <div style={{fontSize:11,color:C.gray}}>{mvr.count} legendary catch{mvr.count!==1?"es":""}</div>
                    </div>
                    <div style={{fontSize:28}}>🏅</div>
                  </div>
                )}
                {sorted.map((amb,rank)=>{
                  const badge=getRank(amb.score);
                  const isFirst=rank===0&&amb.score>0;
                  const founderCredits=amb.logs.filter(l=>l.source==="founder").length;
                  return(
                    <div key={amb.i} style={{background:isFirst?C.ltgold:C.white,border:`2px solid ${isFirst?C.gold:C.mgray}`,borderRadius:12,padding:"12px 14px",marginBottom:8,boxShadow:isFirst?"0 2px 8px rgba(245,127,23,0.15)":"0 1px 3px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:24,minWidth:34,textAlign:"center"}}>{rank===0&&amb.score>0?"🥇":rank===1?"🥈":rank===2?"🥉":`#${rank+1}`}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:"bold",fontSize:14,color:C.navy}}>{amb.name}</div>
                          <div style={{fontSize:11,color:badge.color,fontWeight:"bold"}}>{badge.label}</div>
                          {founderCredits>0&&<div style={{fontSize:10,color:C.green,marginTop:1}}>⭐ {founderCredits} founder credit{founderCredits!==1?"s":""}</div>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:22,fontWeight:"bold",color:isFirst?C.gold:C.blue}}>{amb.score}</div>
                          <div style={{fontSize:10,color:C.gray}}>pts · {amb.logs.length} catches</div>
                        </div>
                      </div>
                      {amb.logs.length>0&&(
                        <div style={{marginTop:8,borderTop:`1px solid ${C.mgray}`,paddingTop:6}}>
                          {amb.logs.slice(-3).reverse().map((log,li)=>{
                            const task=TASKS.find(t=>t.id===log.taskId);
                            return(
                              <div key={li} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.gray,marginBottom:2}}>
                                <span>{task?.emoji} {task?.label}{log.source==="founder"?" ⭐":""}</span>
                                <span style={{color:C.green,fontWeight:"bold"}}>+{task?.points}</span>
                              </div>
                            );
                          })}
                          {amb.logs.length>3&&<div style={{fontSize:10,color:C.blue}}>+{amb.logs.length-3} more catches</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* ADMIN */}
            {adminMode&&(
              <div style={{background:"#FFF3E0",border:"2px solid #FF9800",borderRadius:12,padding:14,marginTop:8}}>
                <div style={{fontWeight:"bold",color:"#E65100",marginBottom:10,fontSize:14}}>🔧 Project Founder Panel</div>

                {/* Credit an ambassador */}
                <div style={{background:C.white,borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{fontWeight:"bold",color:C.navy,fontSize:13,marginBottom:8}}>⭐ Give Credit to an Ambassador</div>
                  {creditFlash&&(
                    <div style={{background:C.ltgreen,border:`1px solid ${C.green}`,borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:13,color:C.green,fontWeight:"bold"}}>
                      🎉 +{creditFlash.pts} pts credited to {creditFlash.name}!
                    </div>
                  )}
                  <select value={creditForm.ambassadorIdx} onChange={e=>setCreditForm({...creditForm,ambassadorIdx:e.target.value})}
                    style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ccc",fontSize:13,marginBottom:8,boxSizing:"border-box"}}>
                    <option value="">Select ambassador...</option>
                    {ambassadors.map((a,i)=><option key={i} value={i}>{a.name} ({getScore(a.logs)} pts)</option>)}
                  </select>
                  <select value={creditForm.taskId} onChange={e=>setCreditForm({...creditForm,taskId:e.target.value})}
                    style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ccc",fontSize:13,marginBottom:8,boxSizing:"border-box"}}>
                    {TASKS.filter(t=>["sit","completed","dfw","mvr"].includes(t.id)).map(t=>(
                      <option key={t.id} value={t.id}>{t.emoji} {t.label} (+{t.points})</option>
                    ))}
                  </select>
                  <input value={creditForm.note} onChange={e=>setCreditForm({...creditForm,note:e.target.value})}
                    placeholder="Note (optional — e.g. brought Maria from Univision)"
                    style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid #ccc",fontSize:13,marginBottom:8,boxSizing:"border-box"}}/>
                  <button onClick={handleAdminCredit}
                    disabled={creditForm.ambassadorIdx===""}
                    style={{...btn(creditForm.ambassadorIdx!==""?"#FF9800":"#ccc",C.white),padding:"10px 20px",fontSize:13,cursor:creditForm.ambassadorIdx!==""?"pointer":"not-allowed"}}>
                    Credit Ambassador ⭐
                  </button>
                </div>

                {/* Org breakdown */}
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {["dashboard","byorg","leads"].map(v=>(
                    <button key={v} onClick={()=>setAdminView(v)} style={{...btn(adminView===v?"#E65100":C.white,adminView===v?C.white:"#E65100"),padding:"5px 10px",fontSize:11,border:"1px solid #E65100"}}>
                      {v==="dashboard"?"All":v==="byorg"?"By Org":"Leads"}
                    </button>
                  ))}
                </div>

                {adminView==="dashboard"&&ambassadors.map((a,i)=>(
                  <div key={i} style={{background:C.white,borderRadius:8,padding:"8px 12px",marginBottom:6,fontSize:12}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:"bold",color:C.navy}}>{a.name}</span><span style={{color:C.blue}}>{getScore(a.logs)} pts</span></div>
                    <div style={{color:C.gray,marginTop:2}}>{a.org} · {a.logs.length} catches · {a.logs.filter(l=>l.source==="founder").length} founder credits</div>
                  </div>
                ))}

                {adminView==="byorg"&&(
                  <div>
                    <div style={{fontSize:11,color:C.gray,marginBottom:6,fontStyle:"italic"}}>Organization breakdown — admin only</div>
                    {byOrg.length===0?<div style={{fontSize:12,color:C.gray}}>No data yet.</div>:byOrg.map(o=>(
                      <div key={o.org} style={{background:C.white,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                        <div style={{fontWeight:"bold",color:C.navy,fontSize:13}}>{o.org}</div>
                        <div style={{display:"flex",gap:12,marginTop:4}}>
                          {[{label:"Members",value:o.count},{label:"Pts",value:o.totalScore},{label:"Surveys",value:o.totalSurveys},{label:"Actions",value:o.totalActions}].map(s=>(
                            <div key={s.label} style={{textAlign:"center"}}><div style={{fontWeight:"bold",color:C.blue,fontSize:14}}>{s.value}</div><div style={{fontSize:9,color:C.gray}}>{s.label}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {adminView==="leads"&&(
                  <div>
                    <div style={{fontWeight:"bold",color:C.navy,fontSize:12,marginBottom:6}}>Pass-Along Contacts ({passLogs.length})</div>
                    {passLogs.length===0?<div style={{fontSize:12,color:C.gray,marginBottom:10}}>None yet.</div>:passLogs.map((l,i)=>(
                      <div key={i} style={{background:C.white,borderRadius:8,padding:"8px 12px",marginBottom:6,fontSize:11}}>
                        <div style={{fontWeight:"bold",color:C.navy}}>{l.name}</div>
                        <div style={{color:C.gray}}>{l.email} {l.phone&&`· ${l.phone}`}</div>
                        <div style={{color:C.gray}}>{l.org&&`${l.org} · `}via {l.ambassador} · {l.time}</div>
                        {l.note&&<div style={{color:C.blue,fontStyle:"italic"}}>{l.note}</div>}
                      </div>
                    ))}
                    <div style={{fontWeight:"bold",color:C.navy,fontSize:12,marginBottom:6,marginTop:10}}>Post-Conference Interest ({laterLogs.length})</div>
                    {laterLogs.length===0?<div style={{fontSize:12,color:C.gray}}>None yet.</div>:laterLogs.map((l,i)=>(
                      <div key={i} style={{background:C.white,borderRadius:8,padding:"8px 12px",marginBottom:6,fontSize:11}}>
                        <div style={{fontWeight:"bold",color:C.navy}}>{l.name||"(name not given)"}</div>
                        <div style={{color:C.gray}}>{l.email} {l.phone&&`· ${l.phone}`}</div>
                        <div style={{color:C.gray}}>{l.time}</div>
                        {l.note&&<div style={{color:C.blue,fontStyle:"italic"}}>{l.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{fontSize:10,color:C.gray,marginTop:8}}>Tap the title 5 times to toggle founder panel</div>
              </div>
            )}
          </div>
        )}

        {/* ── SIGN UP ── */}
        {view==="signup"&&(
          <div>
            <div style={{fontWeight:"bold",fontSize:16,color:C.navy,marginBottom:6}}>Join the Hunt ✋</div>
            <div style={{background:C.ltpurple,border:`1px solid ${C.purple}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{fontWeight:"bold",color:C.purple,fontSize:12,marginBottom:4}}>🎮 Catch every story. Gotta get 'em all.</div>
              <div style={{fontSize:12,color:C.gray}}>You're a journalist ambassador on the hunt for DFW journalists. Every person you find, connect, and bring to the survey earns you points. The more you catch, the higher you climb.</div>
            </div>
            {signupDone?(
              <div style={{background:C.ltgreen,border:`2px solid ${C.green}`,borderRadius:12,padding:24,textAlign:"center"}}>
                <div style={{fontSize:40}}>🎮</div>
                <div style={{fontWeight:"bold",color:C.green,fontSize:18,marginTop:8}}>You're in the game!</div>
                <div style={{color:C.gray,fontSize:13,marginTop:6}}>Go catch some journalists...</div>
              </div>
            ):(
              <div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:6}}>Your name</div>
                  <input value={signupForm.name} onChange={e=>setSignupForm({...signupForm,name:e.target.value})} placeholder="First and last name" style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid #ccc",fontSize:15,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:6}}>Your affiliation</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {ORGS.map(org=>(
                      <button key={org} onClick={()=>setSignupForm({...signupForm,org})} style={{padding:"8px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",background:signupForm.org===org?C.navy:C.white,color:signupForm.org===org?C.white:C.navy,boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
                        {org}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{background:C.ltgold,border:`1px solid ${C.gold}`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                  <div style={{fontWeight:"bold",color:C.gold,fontSize:12,marginBottom:3}}>🎁 Top catch wins a mentorship session with a DFW media exec</div>
                  <div style={{fontSize:11,color:C.gray}}>See the Prizes tab for all rewards — including the Legendary Catch prize.</div>
                </div>
                <button onClick={handleSignup} disabled={!signupForm.name.trim()} style={{...btn(signupForm.name.trim()?C.navy:"#ccc",C.white),width:"100%",padding:"14px",fontSize:16,cursor:signupForm.name.trim()?"pointer":"not-allowed"}}>
                  Start the Hunt 🎯
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LOG ACTION ── */}
        {view==="log"&&(
          <div>
            {ambassadors.length===0?(
              <div style={{textAlign:"center",padding:"30px 20px"}}>
                <div style={{fontSize:36}}>✋</div>
                <div style={{fontWeight:"bold",color:C.navy,fontSize:15,marginTop:10}}>Join first!</div>
                <button onClick={()=>setView("signup")} style={{...btn(C.navy,C.white),padding:"12px 28px",fontSize:14,marginTop:16}}>Join the Hunt</button>
              </div>
            ):(
              <>
                <div style={{fontWeight:"bold",fontSize:15,color:C.navy,marginBottom:10}}>Log a catch</div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:6}}>Who are you?</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {ambassadors.map((a,i)=>(
                      <button key={i} onClick={()=>setSelected(i)} style={{padding:"8px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",background:selected===i?C.navy:C.white,color:selected===i?C.white:C.navy,boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
                        {a.name}
                      </button>
                    ))}
                  </div>
                  {selected!==null&&<div style={{fontSize:12,color:C.blue,marginTop:5,fontWeight:"bold"}}>Score: {getScore(ambassadors[selected].logs)} pts · {getRank(getScore(ambassadors[selected].logs)).label}</div>}
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:6}}>What did you catch?</div>
                  {TASKS.filter(t=>!["pass","later"].includes(t.id)).map(task=>(
                    <div key={task.id} onClick={()=>setLogForm({...logForm,taskId:task.id})} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,marginBottom:5,cursor:"pointer",border:`2px solid ${logForm.taskId===task.id?C.blue:C.mgray}`,background:logForm.taskId===task.id?C.ltblue:C.white}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:18}}>{task.emoji}</span>
                        <span style={{fontSize:13,color:C.navy,fontWeight:logForm.taskId===task.id?"bold":"normal"}}>{task.label}</span>
                      </div>
                      <div style={{fontWeight:"bold",color:C.green,fontSize:14,whiteSpace:"nowrap"}}>+{task.points}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Who did you catch? (optional)</div>
                  <input value={logForm.respondentName} onChange={e=>setLogForm({...logForm,respondentName:e.target.value})} placeholder="e.g. J. Martinez" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Quick note (optional)</div>
                  <input value={logForm.note} onChange={e=>setLogForm({...logForm,note:e.target.value})} placeholder="e.g. Telemundo Dallas, 2018-2022" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                {flash?(
                  <div style={{background:C.ltgreen,border:`2px solid ${C.green}`,borderRadius:12,padding:16,textAlign:"center"}}>
                    <div style={{fontSize:28}}>🎉</div>
                    <div style={{fontWeight:"bold",color:C.green,fontSize:16}}>Catch logged!</div>
                    <div style={{color:C.gray,fontSize:13,marginTop:4}}>+{flash.pts} points for {flash.name}</div>
                  </div>
                ):(
                  <button onClick={handleLog} disabled={!logForm.taskId||selected===null} style={{...btn(logForm.taskId&&selected!==null?C.navy:"#ccc",C.white),width:"100%",padding:"14px",fontSize:15,cursor:logForm.taskId&&selected!==null?"pointer":"not-allowed"}}>
                    Log This Catch ✓
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── PASS THE BALL ── */}
        {view==="pass"&&(
          <div>
            <div style={{fontWeight:"bold",fontSize:16,color:C.navy,marginBottom:6}}>Pass the Ball 📋</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:14}}>
              Met someone with a DFW connection but couldn't get them to the table? Submit their contact info here and we'll follow up. You still get credit.
            </div>
            {passFlash?(
              <div style={{background:C.ltgreen,border:`2px solid ${C.green}`,borderRadius:12,padding:20,textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:32}}>📋</div>
                <div style={{fontWeight:"bold",color:C.green,fontSize:16,marginTop:6}}>Contact submitted!</div>
                <div style={{color:C.gray,fontSize:13,marginTop:4}}>You'll get credit for this catch.</div>
              </div>
            ):(
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Their name *</div>
                  <input value={passForm.name} onChange={e=>setPassForm({...passForm,name:e.target.value})} placeholder="Full name" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Their email</div>
                  <input value={passForm.email} onChange={e=>setPassForm({...passForm,email:e.target.value})} placeholder="email@example.com" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Their phone (optional)</div>
                  <input value={passForm.phone} onChange={e=>setPassForm({...passForm,phone:e.target.value})} placeholder="Phone number" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Their organization (optional)</div>
                  <input value={passForm.org} onChange={e=>setPassForm({...passForm,org:e.target.value})} placeholder="e.g. Univision Dallas" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Your name (so you get credit) *</div>
                  <input value={passForm.ambassador} onChange={e=>setPassForm({...passForm,ambassador:e.target.value})} placeholder="Your name" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Quick note (optional)</div>
                  <input value={passForm.note} onChange={e=>setPassForm({...passForm,note:e.target.value})} placeholder="e.g. Producer at KDFW, worked there 2015-2023" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <button onClick={handlePass} disabled={!passForm.name.trim()||!passForm.ambassador.trim()} style={{...btn(passForm.name.trim()&&passForm.ambassador.trim()?C.navy:"#ccc",C.white),width:"100%",padding:"14px",fontSize:15,cursor:passForm.name.trim()&&passForm.ambassador.trim()?"pointer":"not-allowed"}}>
                  Submit Contact +12 pts 📋
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FOLLOW UP LATER ── */}
        {view==="later"&&(
          <div>
            <div style={{fontWeight:"bold",fontSize:16,color:C.navy,marginBottom:6}}>Take It Later 🔖</div>
            <div style={{fontSize:13,color:C.gray,marginBottom:14}}>
              Interested in the survey but can't do it right now? Leave your info and we'll send it to you after the conference. No pressure, no spam — just the survey when you're ready.
            </div>
            {laterFlash?(
              <div style={{background:C.ltgreen,border:`2px solid ${C.green}`,borderRadius:12,padding:20,textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:32}}>🔖</div>
                <div style={{fontWeight:"bold",color:C.green,fontSize:16,marginTop:6}}>Got it — we'll follow up!</div>
                <div style={{color:C.gray,fontSize:13,marginTop:4}}>Thank you. Your story matters to this research.</div>
              </div>
            ):(
              <div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Your name</div>
                  <input value={laterForm.name} onChange={e=>setLaterForm({...laterForm,name:e.target.value})} placeholder="First and last name" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Best email to reach you *</div>
                  <input value={laterForm.email} onChange={e=>setLaterForm({...laterForm,email:e.target.value})} placeholder="email@example.com" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Phone (optional)</div>
                  <input value={laterForm.phone} onChange={e=>setLaterForm({...laterForm,phone:e.target.value})} placeholder="Phone number" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:C.gray,marginBottom:4}}>Anything you want us to know?</div>
                  <input value={laterForm.note} onChange={e=>setLaterForm({...laterForm,note:e.target.value})} placeholder="e.g. I worked at WFAA from 2010-2018" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ccc",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div style={{background:C.ltblue,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                  <div style={{fontSize:12,color:C.gray}}>📌 Your information will only be used to send you the survey link. It will not be shared or published.</div>
                </div>
                <button onClick={handleLater} disabled={!laterForm.email.trim()} style={{...btn(laterForm.email.trim()?C.blue:"#ccc",C.white),width:"100%",padding:"14px",fontSize:15,cursor:laterForm.email.trim()?"pointer":"not-allowed"}}>
                  Save My Spot 🔖
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PRIZES ── */}
        {view==="prizes"&&(
          <div>
            <div style={{fontWeight:"bold",fontSize:15,color:C.navy,marginBottom:6}}>What the top catchers win 🎁</div>
            <div style={{background:C.ltpurple,border:`1px solid ${C.purple}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{fontWeight:"bold",color:C.purple,fontSize:12,marginBottom:3}}>🎮 This is real. These are real prizes.</div>
              <div style={{fontSize:12,color:C.gray}}>Named credit in a published research report is a professional credential. A mentorship session with a media executive is a career door. Play to win.</div>
            </div>
            {PRIZES.map((p,i)=>(
              <div key={i} style={{background:p.bg,border:`2px solid ${p.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontWeight:"bold",fontSize:14,color:p.color,marginBottom:6}}>{p.place}</div>
                {p.rewards.map((r,ri)=>(
                  <div key={ri} style={{display:"flex",gap:8,marginBottom:4}}>
                    <span style={{color:p.color,fontWeight:"bold"}}>•</span>
                    <span style={{fontSize:13,color:C.gray}}>{r}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{background:C.ltblue,borderRadius:12,padding:"10px 14px",marginTop:4}}>
              <div style={{fontWeight:"bold",color:C.blue,fontSize:12,marginBottom:3}}>📌 Everyone gets:</div>
              <div style={{fontSize:12,color:C.gray}}>A certificate of participation and a personal thank-you from the Project Founder. Your effort helped build something that belongs to this community.</div>
            </div>
          </div>
        )}

        {/* ── CATCH LIST ── */}
        {view==="tasks"&&(
          <div>
            <div style={{background:C.ltpurple,border:`1px solid ${C.purple}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
              <div style={{fontWeight:"bold",color:C.purple,fontSize:13,marginBottom:3}}>🎮 Your Catch List</div>
              <div style={{fontSize:12,color:C.gray}}>Every journalist with a DFW connection is a catch worth making. Walk them all the way to a completed survey for the highest score.</div>
            </div>
            {TASKS.map(task=>(
              <div key={task.id} style={{background:C.white,borderRadius:12,padding:"10px 14px",marginBottom:7,borderLeft:`4px solid ${task.points>=30?C.green:task.points>=15?C.blue:C.gray}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <span style={{fontSize:20}}>{task.emoji}</span>
                    <div>
                      <div style={{fontWeight:"bold",color:C.navy,fontSize:13}}>{task.label}</div>
                      <div style={{fontSize:11,color:C.gray,marginTop:1}}>{task.tip}</div>
                    </div>
                  </div>
                  <div style={{fontWeight:"bold",color:C.green,fontSize:17,minWidth:34,textAlign:"right"}}>+{task.points}</div>
                </div>
              </div>
            ))}
            <div style={{background:C.ltgold,border:`2px solid ${C.gold}`,borderRadius:12,padding:"10px 14px",marginTop:4}}>
              <div style={{fontWeight:"bold",color:C.gold,marginBottom:6,fontSize:13}}>🏆 Trainer Ranks</div>
              {RANKS.map(r=>(<div key={r.label} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}><span style={{color:r.color,fontWeight:"bold"}}>{r.label}</span><span style={{color:C.gray}}>{r.min}+ pts</span></div>))}
            </div>
            <div style={{background:C.ltblue,borderRadius:12,padding:"10px 14px",marginTop:8}}>
              <div style={{fontWeight:"bold",color:C.blue,marginBottom:5,fontSize:13}}>💡 Pro Moves</div>
              {["DFW journalists are your legendaries — hunt them first","Walk them all the way to a completed survey for 25 pts","Can't bring them to the table? Use the Pass tab — still gets you points","Spotted someone interested but busy? Send them to the Later tab","Post on social early — easy 8 points and it spreads the word"].map((tip,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:4,fontSize:12,color:C.gray}}>
                  <span style={{color:C.blue,fontWeight:"bold"}}>•</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
