import { useState } from "react";
import { useTenant } from "./TenantContext";

const C = {
  navy:    "var(--amb-navy)",
  blue:    "var(--amb-blue)",
  ltblue:  "var(--amb-ltblue)",
  green:   "var(--amb-green)",
  ltgreen: "var(--amb-ltgreen)",
  gold:    "var(--amb-gold)",
  ltgold:  "var(--amb-ltgold)",
  gray:    "var(--amb-gray)",
  lgray:   "var(--amb-lgray)",
  mgray:   "var(--amb-mgray)",
  white:   "var(--amb-white)",
  red:     "var(--amb-red)",
  ltred:   "var(--amb-ltred)",
  orange:  "var(--amb-orange)",
};

const btn = (bg, color, extra = {}) => ({
  border: "none", borderRadius: 10, cursor: "pointer",
  fontWeight: "bold", fontFamily: "Arial", background: bg, color, ...extra,
});

export default function AmbassadorGame() {
  const tenantConfig = useTenant();
  const amb = tenantConfig?.ambassador || {};

  const APP_NAME     = tenantConfig?.appName  || "By the Numbers";
  const APP_SUBTITLE = amb.subtitle || "";
  const APP_TAGLINE  = amb.tagline  || "";
  const EVENT_NAME   = amb.event    || "";

  const TASKS  = amb.tasks  || [];
  const PRIZES = amb.prizes || [];
  const RANKS  = amb.ranks  || [];

  const getScore = (logs) =>
    logs.reduce((t, l) => t + (TASKS.find((tk) => tk.id === l.taskId)?.points || 0), 0);
  const getRank = (s) => RANKS.find((r) => s >= r.min) || RANKS[RANKS.length - 1];

  const [view, setView]                 = useState("leaderboard");
  const [ambassadors, setAmbassadors]   = useState([]);
  const [selected, setSelected]         = useState(null);
  const [logForm, setLogForm]           = useState({ taskId: "", note: "", respondentName: "" });
  const [flash, setFlash]               = useState(null);
  const [tapCount, setTapCount]         = useState(0);
  const [adminMode, setAdminMode]       = useState(false);
  const [adminView, setAdminView]       = useState("pending");
  const [signupForm, setSignupForm]     = useState({ name: "", university: "", org: "", sponsorName: "", sponsorEmail: "", showOnLeaderboard: true });
  const [signupDone, setSignupDone]     = useState(false);
  const [linkForm, setLinkForm]         = useState({ contactName: "", note: "" });
  const [linkFlash, setLinkFlash]       = useState(false);
  const [laterForm, setLaterForm]       = useState({ name: "", email: "", phone: "", ambassadorName: "", note: "" });
  const [laterLogs, setLaterLogs]       = useState([]);
  const [laterFlash, setLaterFlash]     = useState(false);
  const [creditForm, setCreditForm]     = useState({ ambassadorIdx: "", taskId: "sit", note: "" });
  const [creditFlash, setCreditFlash]   = useState(null);
  const [linkLogs, setLinkLogs]         = useState([]);

  const handleTitleTap = () => {
    const n = tapCount + 1;
    setTapCount(n);
    if (n >= 5) { setAdminMode(true); setTapCount(0); }
  };

  const activeAmbassadors  = ambassadors.filter((a) => a.status === "active");
  const pendingAmbassadors = ambassadors.filter((a) => a.status === "pending");

  const sorted = [...activeAmbassadors]
    .map((a) => ({ ...a, i: ambassadors.indexOf(a), score: getScore(a.logs) }))
    .sort((a, b) => b.score - a.score);

  const totalSurveys = activeAmbassadors.reduce((t, a) => t + a.logs.filter((l) => l.taskId === "completed").length, 0);
  const totalLinks   = activeAmbassadors.reduce((t, a) => t + a.logs.filter((l) => l.taskId === "link").length, 0);
  const totalActions = activeAmbassadors.reduce((t, a) => t + a.logs.length, 0);
  const mvc = [...activeAmbassadors]
    .map((a) => ({ name: a.name, count: a.logs.filter((l) => l.taskId === "mvr").length }))
    .sort((a, b) => b.count - a.count)[0];

  const byOrg = [...new Set(activeAmbassadors.map((a) => a.university))].map((u) => {
    const m = activeAmbassadors.filter((a) => a.university === u);
    return {
      org: u,
      count: m.length,
      totalScore:   m.reduce((t, a) => t + getScore(a.logs), 0),
      totalSurveys: m.reduce((t, a) => t + a.logs.filter((l) => l.taskId === "completed").length, 0),
      totalActions: m.reduce((t, a) => t + a.logs.length, 0),
    };
  }).filter((o) => o.count > 0);

  const handleLog = () => {
    if (!logForm.taskId || selected === null) return;
    const updated = ambassadors.map((a, i) =>
      i !== selected ? a : {
        ...a,
        logs: [...a.logs, {
          taskId: logForm.taskId, note: logForm.note,
          respondentName: logForm.respondentName,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "self",
        }],
      }
    );
    setAmbassadors(updated);
    const pts = TASKS.find((t) => t.id === logForm.taskId)?.points || 0;
    setFlash({ name: ambassadors[selected].name, pts });
    setLogForm({ taskId: "", note: "", respondentName: "" });
    setTimeout(() => setFlash(null), 2800);
  };

  const handleSignup = () => {
    if (!signupForm.name.trim() || !signupForm.university.trim() || !signupForm.sponsorName.trim() || !signupForm.sponsorEmail.trim()) return;
    setAmbassadors([...ambassadors, {
      name:               signupForm.name.trim(),
      university:         signupForm.university.trim(),
      org:                signupForm.org.trim() || "Not specified",
      sponsorName:        signupForm.sponsorName.trim(),
      sponsorEmail:       signupForm.sponsorEmail.trim(),
      showOnLeaderboard:  signupForm.showOnLeaderboard,
      status:             "pending",
      logs:               [],
      submittedAt:        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setSignupDone(true);
  };

  const handleLink = () => {
    if (!linkForm.contactName.trim() || selected === null) return;
    const entry = {
      contactName:    linkForm.contactName,
      note:           linkForm.note,
      ambassadorName: ambassadors[selected].name,
      time:           new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setLinkLogs([...linkLogs, entry]);
    const updated = ambassadors.map((a, i) =>
      i !== selected ? a : {
        ...a,
        logs: [...a.logs, {
          taskId: "link",
          note: `Shared link with ${linkForm.contactName}${linkForm.note ? ` — ${linkForm.note}` : ""}`,
          respondentName: linkForm.contactName,
          time:   entry.time,
          source: "self",
        }],
      }
    );
    setAmbassadors(updated);
    setLinkForm({ contactName: "", note: "" });
    setLinkFlash(true);
    setTimeout(() => setLinkFlash(false), 2800);
  };

  const handleLater = () => {
    if (!laterForm.email.trim()) return;
    setLaterLogs([...laterLogs, { ...laterForm, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setLaterForm({ name: "", email: "", phone: "", ambassadorName: "", note: "" });
    setLaterFlash(true);
    setTimeout(() => setLaterFlash(false), 2800);
  };

  const handleAdminCredit = () => {
    if (creditForm.ambassadorIdx === "" || !creditForm.taskId) return;
    const idx  = parseInt(creditForm.ambassadorIdx);
    const task = TASKS.find((t) => t.id === creditForm.taskId);
    const updated = ambassadors.map((a, i) =>
      i !== idx ? a : {
        ...a,
        logs: [...a.logs, {
          taskId: creditForm.taskId,
          note:   creditForm.note || "Credited by Project Founder",
          respondentName: "",
          time:   new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "founder",
        }],
      }
    );
    setAmbassadors(updated);
    setCreditFlash({ name: ambassadors[idx].name, pts: task?.points || 0 });
    setCreditForm({ ambassadorIdx: "", taskId: "sit", note: "" });
    setTimeout(() => setCreditFlash(null), 3000);
  };

  const approveAmbassador = (idx) =>
    setAmbassadors(ambassadors.map((a, i) => (i !== idx ? a : { ...a, status: "active" })));

  const declineAmbassador = (idx) =>
    setAmbassadors(ambassadors.map((a, i) => (i !== idx ? a : { ...a, status: "declined" })));

  const selectedAmb = selected !== null ? ambassadors[selected] : null;
  const canLog      = selectedAmb && selectedAmb.status === "active";

  return (
    <div style={{ fontFamily: "Arial,sans-serif", maxWidth: 480, margin: "0 auto", background: C.lgray, minHeight: "100vh", paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ background: C.navy, padding: "14px 20px 12px", position: "sticky", top: 0, zIndex: 10 }}>
        <div onClick={handleTitleTap} style={{ cursor: "default" }}>
          <div style={{ color: C.white, fontSize: 14, fontWeight: "bold", lineHeight: 1.3 }}>{APP_NAME}</div>
          <div style={{ color: "#B5D4F4", fontSize: 10, marginTop: 1, lineHeight: 1.3 }}>{APP_SUBTITLE}</div>
          <div style={{ color: "#90CAF9", fontSize: 10, marginTop: 1 }}>{EVENT_NAME} · {APP_TAGLINE}</div>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
          {[
            { label: "Surveys",     value: totalSurveys,       emoji: "✅" },
            { label: "Links",       value: totalLinks,         emoji: "🔗" },
            { label: "Follow-ups",  value: laterLogs.length,   emoji: "🔖" },
            { label: "Ambassadors", value: activeAmbassadors.length, emoji: "🤝" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "5px 3px", textAlign: "center" }}>
              <div style={{ color: C.white, fontSize: 15, fontWeight: "bold" }}>{s.value}</div>
              <div style={{ color: "#90CAF9", fontSize: 8 }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>
        {pendingAmbassadors.length > 0 && adminMode && (
          <div style={{ background: "#FF9800", borderRadius: 8, padding: "4px 10px", marginTop: 8, fontSize: 11, color: C.white, fontWeight: "bold", textAlign: "center" }}>
            ⏳ {pendingAmbassadors.length} pending approval{pendingAmbassadors.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* NAV */}
      <div style={{ display: "flex", background: C.white, borderBottom: `2px solid ${C.ltblue}`, overflowX: "auto" }}>
        {[
          { key: "leaderboard", label: "🏆 Board" },
          { key: "signup",      label: "✋ Apply" },
          { key: "log",         label: "➕ Log" },
          { key: "link",        label: "🔗 Share" },
          { key: "later",       label: "🔖 Later" },
          { key: "prizes",      label: "🎁 Prizes" },
          { key: "tasks",       label: "📋 Connections" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            style={{
              flex: "1 0 auto", padding: "8px 4px", border: "none", cursor: "pointer",
              background: view === tab.key ? C.ltblue : C.white,
              color:      view === tab.key ? C.navy   : C.gray,
              fontWeight: view === tab.key ? "bold"   : "normal",
              fontSize: 11,
              borderBottom: view === tab.key ? `3px solid ${C.blue}` : "3px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 14px 0" }}>

        {/* ── LEADERBOARD ── */}
        {view === "leaderboard" && (
          <div>
            {activeAmbassadors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 44 }}>📰</div>
                <div style={{ fontWeight: "bold", fontSize: 16, color: C.navy, marginTop: 10 }}>No active ambassadors yet!</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 6 }}>Apply to join the program. Applications are reviewed by the Project Founder before activation.</div>
                <button onClick={() => setView("signup")} style={{ ...btn(C.navy, C.white), padding: "12px 28px", fontSize: 14, marginTop: 16 }}>Apply Now</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: C.gray, marginBottom: 10, fontStyle: "italic" }}>Live standings — every connection updates your score in real time</div>
                {mvc && mvc.count > 0 && (
                  <div style={{ background: C.ltgreen, border: `2px solid ${C.green}`, borderRadius: 12, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 11, color: C.green }}>🏅 Most Valuable Connection Leader</div>
                      <div style={{ fontSize: 14, color: C.navy, fontWeight: "bold" }}>{mvc.name}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{mvc.count} MVC nomination{mvc.count !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ fontSize: 28 }}>🏅</div>
                  </div>
                )}
                {sorted.map((amb, rank) => {
                  const badge        = getRank(amb.score);
                  const isFirst      = rank === 0 && amb.score > 0;
                  const founderCredits = amb.logs.filter((l) => l.source === "founder").length;
                  const displayName  = amb.showOnLeaderboard ? amb.name : amb.name.split(" ")[0];
                  const displayOrg   = amb.showOnLeaderboard ? amb.university : "";
                  return (
                    <div key={amb.i} style={{ background: isFirst ? C.ltgold : C.white, border: `2px solid ${isFirst ? C.gold : C.mgray}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: isFirst ? "0 2px 8px rgba(245,127,23,0.15)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 24, minWidth: 34, textAlign: "center" }}>
                          {rank === 0 && amb.score > 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: 14, color: C.navy }}>{displayName}</div>
                          {displayOrg && <div style={{ fontSize: 11, color: C.gray }}>{displayOrg}</div>}
                          <div style={{ fontSize: 11, color: badge?.color, fontWeight: "bold" }}>{badge?.label}</div>
                          {founderCredits > 0 && <div style={{ fontSize: 10, color: C.green, marginTop: 1 }}>⭐ {founderCredits} founder credit{founderCredits !== 1 ? "s" : ""}</div>}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 22, fontWeight: "bold", color: isFirst ? C.gold : C.blue }}>{amb.score}</div>
                          <div style={{ fontSize: 10, color: C.gray }}>pts · {amb.logs.length} connections</div>
                        </div>
                      </div>
                      {amb.logs.length > 0 && (
                        <div style={{ marginTop: 8, borderTop: `1px solid ${C.mgray}`, paddingTop: 6 }}>
                          {amb.logs.slice(-3).reverse().map((log, li) => {
                            const task = TASKS.find((t) => t.id === log.taskId);
                            return (
                              <div key={li} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.gray, marginBottom: 2 }}>
                                <span>{task?.emoji} {task?.label}{log.source === "founder" ? " ⭐" : ""}</span>
                                <span style={{ color: C.green, fontWeight: "bold" }}>+{task?.points}</span>
                              </div>
                            );
                          })}
                          {amb.logs.length > 3 && <div style={{ fontSize: 10, color: C.blue }}>+{amb.logs.length - 3} more</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* ADMIN PANEL */}
            {adminMode && (
              <div style={{ background: "#FFF3E0", border: "2px solid #FF9800", borderRadius: 12, padding: 14, marginTop: 8 }}>
                <div style={{ fontWeight: "bold", color: C.orange, marginBottom: 10, fontSize: 14 }}>🔧 Project Founder Panel</div>

                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  {["pending", "active", "credit", "byorg", "leads"].map((v) => (
                    <button key={v} onClick={() => setAdminView(v)} style={{ ...btn(adminView === v ? "#E65100" : C.white, adminView === v ? C.white : "#E65100"), padding: "5px 10px", fontSize: 11, border: "1px solid #E65100", position: "relative" }}>
                      {v === "pending" ? "Pending" : v === "active" ? "Active" : v === "credit" ? "Credit" : v === "byorg" ? "By School" : "Leads"}
                      {v === "pending" && pendingAmbassadors.length > 0 && (
                        <span style={{ background: C.red, color: C.white, borderRadius: "50%", fontSize: 9, padding: "1px 5px", marginLeft: 4 }}>{pendingAmbassadors.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                {adminView === "pending" && (
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, marginBottom: 8, fontStyle: "italic" }}>Review and approve student ambassador applications</div>
                    {pendingAmbassadors.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.gray }}>No pending applications.</div>
                    ) : pendingAmbassadors.map((a) => {
                      const idx = ambassadors.indexOf(a);
                      return (
                        <div key={idx} style={{ background: C.white, borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: `1px solid ${C.mgray}` }}>
                          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 13 }}>{a.name}</div>
                          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{a.university}{a.org && a.org !== "Not specified" ? ` · ${a.org}` : ""}</div>
                          <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}><span style={{ fontWeight: "bold" }}>Faculty sponsor: </span>{a.sponsorName}</div>
                          <div style={{ fontSize: 12, color: C.blue }}>{a.sponsorEmail}</div>
                          <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>Applied: {a.submittedAt}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button onClick={() => approveAmbassador(idx)} style={{ ...btn(C.green, C.white), flex: 1, padding: "8px", fontSize: 13 }}>✓ Approve</button>
                            <button onClick={() => declineAmbassador(idx)} style={{ ...btn(C.red, C.white), flex: 1, padding: "8px", fontSize: 13 }}>✕ Decline</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {adminView === "active" && (
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, marginBottom: 8, fontStyle: "italic" }}>All active ambassadors — {activeAmbassadors.length} of maximum 10</div>
                    {activeAmbassadors.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.gray }}>No active ambassadors yet.</div>
                    ) : activeAmbassadors.map((a) => {
                      const idx = ambassadors.indexOf(a);
                      return (
                        <div key={idx} style={{ background: C.white, borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: "bold", color: C.navy }}>{a.name}</span>
                            <span style={{ color: C.blue }}>{getScore(a.logs)} pts</span>
                          </div>
                          <div style={{ color: C.gray, marginTop: 2 }}>{a.university} · {a.logs.length} connections · {a.logs.filter((l) => l.source === "founder").length} founder credits</div>
                          <div style={{ color: C.gray, fontSize: 11 }}>{a.showOnLeaderboard ? "Full name visible" : "First name only on leaderboard"}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {adminView === "credit" && (
                  <div>
                    <div style={{ fontWeight: "bold", color: C.navy, fontSize: 13, marginBottom: 8 }}>⭐ Credit an Ambassador</div>
                    {creditFlash && (
                      <div style={{ background: C.ltgreen, border: `1px solid ${C.green}`, borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 13, color: C.green, fontWeight: "bold" }}>
                        🎉 +{creditFlash.pts} pts credited to {creditFlash.name}!
                      </div>
                    )}
                    <select value={creditForm.ambassadorIdx} onChange={(e) => setCreditForm({ ...creditForm, ambassadorIdx: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}>
                      <option value="">Select ambassador...</option>
                      {activeAmbassadors.map((a) => {
                        const idx = ambassadors.indexOf(a);
                        return <option key={idx} value={idx}>{a.name} — {a.university} ({getScore(a.logs)} pts)</option>;
                      })}
                    </select>
                    <select value={creditForm.taskId} onChange={(e) => setCreditForm({ ...creditForm, taskId: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}>
                      {TASKS.filter((t) => ["sit", "completed", "dfw", "mvr"].includes(t.id)).map((t) => (
                        <option key={t.id} value={t.id}>{t.emoji} {t.label} (+{t.points})</option>
                      ))}
                    </select>
                    <input value={creditForm.note} onChange={(e) => setCreditForm({ ...creditForm, note: e.target.value })} placeholder="Note — optional" style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                    <button onClick={handleAdminCredit} disabled={creditForm.ambassadorIdx === ""} style={{ ...btn(creditForm.ambassadorIdx !== "" ? "#FF9800" : "#ccc", C.white), padding: "10px 20px", fontSize: 13, cursor: creditForm.ambassadorIdx !== "" ? "pointer" : "not-allowed" }}>
                      Credit Ambassador ⭐
                    </button>
                  </div>
                )}

                {adminView === "byorg" && (
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, marginBottom: 6, fontStyle: "italic" }}>Breakdown by university — admin only</div>
                    {byOrg.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.gray }}>No data yet.</div>
                    ) : byOrg.map((o) => (
                      <div key={o.org} style={{ background: C.white, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                        <div style={{ fontWeight: "bold", color: C.navy, fontSize: 13 }}>{o.org}</div>
                        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                          {[{ label: "Students", value: o.count }, { label: "Pts", value: o.totalScore }, { label: "Surveys", value: o.totalSurveys }, { label: "Actions", value: o.totalActions }].map((s) => (
                            <div key={s.label} style={{ textAlign: "center" }}>
                              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 14 }}>{s.value}</div>
                              <div style={{ fontSize: 9, color: C.gray }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {adminView === "leads" && (
                  <div>
                    <div style={{ fontWeight: "bold", color: C.navy, fontSize: 12, marginBottom: 6 }}>Link Shares — Ambassador Logged ({linkLogs.length})</div>
                    {linkLogs.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.gray, marginBottom: 10 }}>None yet.</div>
                    ) : linkLogs.map((l, i) => (
                      <div key={i} style={{ background: C.white, borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 11 }}>
                        <div style={{ fontWeight: "bold", color: C.navy }}>{l.contactName}</div>
                        <div style={{ color: C.gray }}>Via {l.ambassadorName} · {l.time}</div>
                        {l.note && <div style={{ color: C.blue, fontStyle: "italic" }}>{l.note}</div>}
                      </div>
                    ))}
                    <div style={{ fontWeight: "bold", color: C.navy, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Post-Event Follow-Up Interest ({laterLogs.length})</div>
                    {laterLogs.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.gray }}>None yet.</div>
                    ) : laterLogs.map((l, i) => (
                      <div key={i} style={{ background: C.white, borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 11 }}>
                        <div style={{ fontWeight: "bold", color: C.navy }}>{l.name || "(name not given)"}</div>
                        <div style={{ color: C.gray }}>{l.email}{l.phone && ` · ${l.phone}`}</div>
                        {l.ambassadorName && <div style={{ color: C.green, fontStyle: "italic" }}>Connected via {l.ambassadorName}</div>}
                        {l.note && <div style={{ color: C.blue, fontStyle: "italic" }}>{l.note}</div>}
                        <div style={{ color: C.gray }}>{l.time}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 10, color: C.gray, marginTop: 8 }}>Tap the title 5 times to toggle founder panel</div>
              </div>
            )}
          </div>
        )}

        {/* ── APPLY / SIGN UP ── */}
        {view === "signup" && (
          <div>
            <div style={{ fontWeight: "bold", fontSize: 16, color: C.navy, marginBottom: 6 }}>Apply to Be an Ambassador ✋</div>
            <div style={{ background: C.ltblue, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 12, marginBottom: 4 }}>{APP_TAGLINE}</div>
              <div style={{ fontSize: 12, color: C.gray }}>You are here as a connector — helping DFW Latino journalists find this research and add their story to a record that has never existed before. Applications are reviewed by the Project Founder before activation.</div>
            </div>

            {signupDone ? (
              <div style={{ background: "#FFF8E1", border: `2px solid ${C.gold}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 40 }}>⏳</div>
                <div style={{ fontWeight: "bold", color: C.gold, fontSize: 18, marginTop: 8 }}>Application submitted!</div>
                <div style={{ color: C.gray, fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>Your application is being reviewed by the Project Founder. You will be notified when your account is activated.</div>
                <div style={{ color: C.gray, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>In the meantime, explore the Prizes and Connections tabs to get familiar with the program.</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>Your full name *</div>
                  <input value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} placeholder="First and last name" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>Your university or college *</div>
                  <input value={signupForm.university} onChange={(e) => setSignupForm({ ...signupForm, university: e.target.value })} placeholder="e.g. University of Texas at Arlington" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>Your organization or affiliation (optional)</div>
                  <input value={signupForm.org} onChange={(e) => setSignupForm({ ...signupForm, org: e.target.value })} placeholder="e.g. NAHJ Student Chapter, journalism program..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ccc", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div style={{ background: C.lgray, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontWeight: "bold", color: C.navy, fontSize: 12, marginBottom: 6 }}>Faculty sponsor information *</div>
                  <div style={{ fontSize: 11, color: C.gray, marginBottom: 10, lineHeight: 1.5 }}>Please provide the name and email of the professor, advisor, or university sponsor who is aware of your participation. This is required to confirm your eligibility for research credit.</div>
                  <input value={signupForm.sponsorName} onChange={(e) => setSignupForm({ ...signupForm, sponsorName: e.target.value })} placeholder="Faculty sponsor full name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                  <input value={signupForm.sponsorEmail} onChange={(e) => setSignupForm({ ...signupForm, sponsorEmail: e.target.value })} placeholder="Faculty sponsor email address" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ background: C.ltblue, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontWeight: "bold", color: C.blue, fontSize: 12, marginBottom: 6 }}>Leaderboard visibility</div>
                  <div style={{ fontSize: 12, color: C.gray, marginBottom: 10 }}>Would you like your full name and university visible to other ambassadors on the leaderboard?</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ label: "Yes — show my name and university", val: true }, { label: "No — show first name only", val: false }].map((opt) => (
                      <button key={String(opt.val)} onClick={() => setSignupForm({ ...signupForm, showOnLeaderboard: opt.val })}
                        style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: "bold", textAlign: "center", background: signupForm.showOnLeaderboard === opt.val ? C.navy : C.white, color: signupForm.showOnLeaderboard === opt.val ? C.white : C.navy, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: C.ltgold, border: `1px solid ${C.gold}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontWeight: "bold", color: C.gold, fontSize: 12, marginBottom: 3 }}>🎁 Top ambassador wins a mentorship session with a DFW media executive</div>
                  <div style={{ fontSize: 11, color: C.gray }}>See the Prizes tab for all rewards including named research report credit.</div>
                </div>
                <button
                  onClick={handleSignup}
                  disabled={!signupForm.name.trim() || !signupForm.university.trim() || !signupForm.sponsorName.trim() || !signupForm.sponsorEmail.trim()}
                  style={{ ...btn(signupForm.name.trim() && signupForm.university.trim() && signupForm.sponsorName.trim() && signupForm.sponsorEmail.trim() ? C.navy : "#ccc", C.white), width: "100%", padding: "14px", fontSize: 16, cursor: signupForm.name.trim() && signupForm.university.trim() && signupForm.sponsorName.trim() && signupForm.sponsorEmail.trim() ? "pointer" : "not-allowed" }}>
                  Submit Application 🤝
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LOG CONNECTION ── */}
        {view === "log" && (
          <div>
            {activeAmbassadors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <div style={{ fontSize: 36 }}>⏳</div>
                <div style={{ fontWeight: "bold", color: C.navy, fontSize: 15, marginTop: 10 }}>No active ambassadors yet</div>
                <div style={{ color: C.gray, fontSize: 13, marginTop: 6 }}>Applications must be approved by the Project Founder before logging connections.</div>
                <button onClick={() => setView("signup")} style={{ ...btn(C.navy, C.white), padding: "12px 28px", fontSize: 14, marginTop: 16 }}>Apply Now</button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: "bold", fontSize: 15, color: C.navy, marginBottom: 10 }}>Log a connection</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>Who are you?</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activeAmbassadors.map((a) => {
                      const idx = ambassadors.indexOf(a);
                      return (
                        <button key={idx} onClick={() => setSelected(idx)} style={{ padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: "bold", background: selected === idx ? C.navy : C.white, color: selected === idx ? C.white : C.navy, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                          {a.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && canLog && (
                    <div style={{ fontSize: 11, color: C.blue, marginTop: 5, fontWeight: "bold" }}>
                      Score: {getScore(ambassadors[selected].logs)} pts · {getRank(getScore(ambassadors[selected].logs))?.label}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>What did you do?</div>
                  {TASKS.filter((t) => !["link", "later"].includes(t.id)).map((task) => (
                    <div key={task.id} onClick={() => setLogForm({ ...logForm, taskId: task.id })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, marginBottom: 5, cursor: "pointer", border: `2px solid ${logForm.taskId === task.id ? C.blue : C.mgray}`, background: logForm.taskId === task.id ? C.ltblue : C.white }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{task.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, color: C.navy, fontWeight: logForm.taskId === task.id ? "bold" : "normal" }}>{task.label}</div>
                          <div style={{ fontSize: 10, color: C.gray }}>{task.tip}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: "bold", color: C.green, fontSize: 14, whiteSpace: "nowrap" }}>+{task.points}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Who did you connect with? (optional)</div>
                  <input value={logForm.respondentName} onChange={(e) => setLogForm({ ...logForm, respondentName: e.target.value })} placeholder="e.g. J. Martinez" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Quick note (optional)</div>
                  <input value={logForm.note} onChange={(e) => setLogForm({ ...logForm, note: e.target.value })} placeholder="e.g. Telemundo Dallas, worked there 2018-2022" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                {flash ? (
                  <div style={{ background: C.ltgreen, border: `2px solid ${C.green}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 28 }}>🎉</div>
                    <div style={{ fontWeight: "bold", color: C.green, fontSize: 16 }}>Connection logged!</div>
                    <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>+{flash.pts} points for {flash.name}</div>
                  </div>
                ) : (
                  <button onClick={handleLog} disabled={!logForm.taskId || !canLog} style={{ ...btn(logForm.taskId && canLog ? C.navy : "#ccc", C.white), width: "100%", padding: "14px", fontSize: 15, cursor: logForm.taskId && canLog ? "pointer" : "not-allowed" }}>
                    Log This Connection ✓
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SHARE LINK ── */}
        {view === "link" && (
          <div>
            <div style={{ fontWeight: "bold", fontSize: 16, color: C.navy, marginBottom: 6 }}>Share the Follow-Up Link 🔗</div>
            <div style={{ fontSize: 13, color: C.gray, marginBottom: 10 }}>Met a DFW journalist who is interested but not ready right now? Ask if you can send them the link. They decide what to share — no pressure.</div>
            <div style={{ background: C.ltblue, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 12, marginBottom: 3 }}>How it works</div>
              <div style={{ fontSize: 12, color: C.gray }}>You share the link. They fill out whatever they are comfortable sharing at their own pace. You log their name here so you get credit for the connection.</div>
            </div>
            {activeAmbassadors.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: 13, color: C.gray }}>You need an active ambassador account to log link shares.</div>
                <button onClick={() => setView("signup")} style={{ ...btn(C.navy, C.white), padding: "12px 28px", fontSize: 14, marginTop: 12 }}>Apply Now</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 6 }}>Who are you?</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activeAmbassadors.map((a) => {
                      const idx = ambassadors.indexOf(a);
                      return (
                        <button key={idx} onClick={() => setSelected(idx)} style={{ padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: "bold", background: selected === idx ? C.navy : C.white, color: selected === idx ? C.white : C.navy, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                          {a.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {linkFlash ? (
                  <div style={{ background: C.ltgreen, border: `2px solid ${C.green}`, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 28 }}>🔗</div>
                    <div style={{ fontWeight: "bold", color: C.green, fontSize: 16, marginTop: 6 }}>Link share logged!</div>
                    <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>+12 points added. Good connection.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Name of the person you shared with *</div>
                      <input value={linkForm.contactName} onChange={(e) => setLinkForm({ ...linkForm, contactName: e.target.value })} placeholder="Their name — first and last if you have it" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Quick note (optional)</div>
                      <input value={linkForm.note} onChange={(e) => setLinkForm({ ...linkForm, note: e.target.value })} placeholder="e.g. KDFW producer, DFW 2015-2023" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                    </div>
                    <button onClick={handleLink} disabled={!linkForm.contactName.trim() || selected === null || !canLog} style={{ ...btn(linkForm.contactName.trim() && selected !== null && canLog ? C.navy : "#ccc", C.white), width: "100%", padding: "14px", fontSize: 15, cursor: linkForm.contactName.trim() && selected !== null && canLog ? "pointer" : "not-allowed" }}>
                      Log This Connection +12 pts 🔗
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAKE IT LATER ── */}
        {view === "later" && (
          <div>
            <div style={{ fontWeight: "bold", fontSize: 16, color: C.navy, marginBottom: 6 }}>Take the Survey Later 🔖</div>
            <div style={{ fontSize: 13, color: C.gray, marginBottom: 14 }}>Interested in the research but not ready right now? Leave your contact info and we will send you the survey link after this event. Share only what you are comfortable with.</div>
            {laterFlash ? (
              <div style={{ background: C.ltgreen, border: `2px solid ${C.green}`, borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 32 }}>🔖</div>
                <div style={{ fontWeight: "bold", color: C.green, fontSize: 16, marginTop: 6 }}>Got it — we will follow up!</div>
                <div style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>Your story matters to this research. Thank you.</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Your name</div>
                  <input value={laterForm.name} onChange={(e) => setLaterForm({ ...laterForm, name: e.target.value })} placeholder="First and last name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Best email to reach you *</div>
                  <input value={laterForm.email} onChange={(e) => setLaterForm({ ...laterForm, email: e.target.value })} placeholder="email@example.com" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Phone (optional)</div>
                  <input value={laterForm.phone} onChange={(e) => setLaterForm({ ...laterForm, phone: e.target.value })} placeholder="Phone number" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Who introduced you to this project? (optional)</div>
                  <input value={laterForm.ambassadorName} onChange={(e) => setLaterForm({ ...laterForm, ambassadorName: e.target.value })} placeholder="Ambassador's name — if you remember it" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 4, fontStyle: "italic" }}>This helps us recognize the student who connected you to the project. Completely optional.</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.gray, marginBottom: 4 }}>Anything you want us to know? (optional)</div>
                  <input value={laterForm.note} onChange={(e) => setLaterForm({ ...laterForm, note: e.target.value })} placeholder="e.g. I worked at WFAA from 2010-2018" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <div style={{ background: C.ltblue, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: C.gray }}>📌 Your contact information will only be used to send you the survey link. It will not be shared or published.</div>
                </div>
                <button onClick={handleLater} disabled={!laterForm.email.trim()} style={{ ...btn(laterForm.email.trim() ? C.blue : "#ccc", C.white), width: "100%", padding: "14px", fontSize: 15, cursor: laterForm.email.trim() ? "pointer" : "not-allowed" }}>
                  Save My Spot 🔖
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PRIZES ── */}
        {view === "prizes" && (
          <div>
            <div style={{ fontWeight: "bold", fontSize: 15, color: C.navy, marginBottom: 6 }}>What you are working toward 🎁</div>
            <div style={{ background: C.ltblue, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 12, marginBottom: 3 }}>These are real prizes for real work.</div>
              <div style={{ fontSize: 12, color: C.gray }}>Named credit in a published research report is a professional credential. A mentorship session with a media executive is a career door. Every connection you make is building something that belongs to this community.</div>
            </div>
            {PRIZES.map((p, i) => (
              <div key={i} style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontWeight: "bold", fontSize: 14, color: p.color, marginBottom: 6 }}>{p.place}</div>
                {p.rewards.map((r, ri) => (
                  <div key={ri} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: p.color, fontWeight: "bold" }}>•</span>
                    <span style={{ fontSize: 13, color: C.gray }}>{r}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ background: C.ltblue, borderRadius: 12, padding: "10px 14px", marginTop: 4 }}>
              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 12, marginBottom: 3 }}>📌 Every ambassador receives:</div>
              <div style={{ fontSize: 12, color: C.gray }}>A certificate of participation and a personal thank-you from the Project Founder — regardless of final standing.</div>
            </div>
          </div>
        )}

        {/* ── CONNECTION LIST ── */}
        {view === "tasks" && (
          <div>
            <div style={{ background: C.ltblue, border: `1px solid ${C.blue}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: "bold", color: C.blue, fontSize: 13, marginBottom: 3 }}>Your Connection List</div>
              <div style={{ fontSize: 12, color: C.gray }}>Every DFW Latino journalist you connect with is helping build a record that has never existed before. Walk them all the way to a completed survey for the highest points.</div>
            </div>
            {TASKS.map((task) => (
              <div key={task.id} style={{ background: C.white, borderRadius: 12, padding: "10px 14px", marginBottom: 7, borderLeft: `4px solid ${task.points >= 30 ? C.green : task.points >= 15 ? C.blue : C.gray}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{task.emoji}</span>
                    <div>
                      <div style={{ fontWeight: "bold", color: C.navy, fontSize: 13 }}>{task.label}</div>
                      <div style={{ fontSize: 11, color: C.gray, marginTop: 1 }}>{task.tip}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: "bold", color: C.green, fontSize: 17, minWidth: 34, textAlign: "right" }}>+{task.points}</div>
                </div>
              </div>
            ))}
            <div style={{ background: C.ltgold, border: `2px solid ${C.gold}`, borderRadius: 12, padding: "10px 14px", marginTop: 4 }}>
              <div style={{ fontWeight: "bold", color: C.gold, marginBottom: 6, fontSize: 13 }}>🏆 Ambassador Levels</div>
              {RANKS.map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                  <span style={{ color: r.color, fontWeight: "bold" }}>{r.label}</span>
                  <span style={{ color: C.gray }}>{r.min}+ pts</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.ltblue, borderRadius: 12, padding: "10px 14px", marginTop: 8 }}>
              <div style={{ fontWeight: "bold", color: C.blue, marginBottom: 5, fontSize: 13 }}>💡 Tips</div>
              {[
                "DFW journalists with long careers are the most valuable connections — prioritize them",
                "Walk someone all the way through the survey for 25 points",
                "Can't bring them to the table? Use the Share Link tab — you still get credit",
                "If they want to take it later send them to the Take It Later tab",
                "Post on social early — 8 easy points and it spreads the word",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 12, color: C.gray }}>
                  <span style={{ color: C.blue, fontWeight: "bold" }}>•</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
