// Preview app logic — mirrors rebuild spec (state machine, toasts, funnel).
function toast(m,ok=true){const t=document.createElement("div");t.className="toast "+(ok?"ok":"err");t.textContent=m;document.getElementById("toasts").appendChild(t);setTimeout(()=>t.remove(),4500);}
document.querySelectorAll(".sidebar button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".sidebar button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));document.getElementById("v-"+b.dataset.view).classList.remove("hidden");});
// shifts
document.querySelector("#shiftsTable tbody").innerHTML=SHIFTS.map((s,i)=>`<tr><td>${i+1}</td><td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td><td>${s[5]}</td><td><button class="btn primary">Edit</button><button class="btn danger">Delete</button></td></tr>`).join("");
// open shifts
let openN=0;const oc=()=>{document.getElementById("openCount").textContent=openN;document.getElementById("openMsg").textContent=openN?`${openN} open shift(s) available to claim.`:"There are no Open Shifts in this Payperiod or the next ones.";};
document.getElementById("postOpenBtn").onclick=()=>{openN++;oc();toast("Demo open shift posted.");};
document.getElementById("clearOpenBtn").onclick=()=>{openN=0;oc();};
// schedule grid
function row(label,cells){return `<tr><td><b>${label}</b></td>${cells.map(c=>`<td>${c==="—"?"—":`<div class="daycell">${c}</div>`}</td>`).join("")}</tr>`;}
document.getElementById("schedGrid").innerHTML=`<table class="sched"><thead><tr><th>Shift</th>${DAYS.map(d=>`<th>${d}</th>`).join("")}</tr></thead><tbody>${row("S1 12:00AM–7:59AM",SCHED.s1)}${row("S2 8:00AM–3:59PM",SCHED.s2)}${row("S3 4:00PM–11:59PM",SCHED.s3)}</tbody></table>`;
// timesheet dossier (one 8.00 cell Mon S1, like legacy sheet 21673)
let tsState="DRAFT";
document.getElementById("tsGrid").innerHTML=`<table><thead><tr><th>Shift</th>${DAYS.map(d=>`<th>${d}</th>`).join("")}</tr></thead><tbody>
${["S1 12:00AM–7:59AM","S2 8:00AM–3:59PM","S3 4:00PM–11:59PM"].map((s,si)=>`<tr><td><b>${s}</b></td>${DAYS.map((d,di)=>`<td>${si===0&&di===1?'<div class="daycell">8.00 · 10 cherry Ln</div>':"0.00"}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
document.getElementById("acceptBtn").onclick=()=>{if(!document.getElementById("attest").checked){toast("Attestation required: tick the certify checkbox.",false);return;}
tsState="ACCEPTED";document.getElementById("acceptCard").classList.add("hidden");document.getElementById("approveCard").classList.remove("hidden");
document.getElementById("fAcc").textContent="2";toast("Thanks — we'll let you know when it's approved.");};
document.getElementById("disputeBtn").onclick=()=>toast("Correction request sent to program manager (reason required in full build).");
document.getElementById("approveBtn").onclick=()=>{tsState="APPROVED";document.getElementById("approveCard").classList.add("hidden");document.getElementById("downloadCard").classList.remove("hidden");
document.getElementById("approvalBanner").innerHTML=`<div class="banner">This Timesheet was approved ✔ · entries locked · corrections via adjustment entry</div>`;
document.getElementById("fApp").textContent="1";document.getElementById("funnelMini").textContent="53 → 2 → 1";toast("Timesheet approved and locked.");};
document.getElementById("disapproveBtn").onclick=()=>{const r=prompt("Disapprove reason (required):");if(!r){toast("Reason is required to disapprove.",false);return;}tsState="DISAPPROVED";toast("Disapproved — DSP notified with reason.");};
document.getElementById("dlBtn").onclick=()=>toast("Signed file URL issued + export logged to audit_logs.");
// missing + reminders
document.querySelector("#missingTable tbody").innerHTML=MISSING.map((m,i)=>`<tr><td>${i+1}</td><td>${m[0]}</td><td>${m[1]}</td><td>${m[2]}</td><td><span class="pill danger">Not Reminded</span></td></tr>`).join("");
document.getElementById("remindBtn").onclick=()=>{if(!confirm(`Send reminders to ${MISSING.length} demo staff? (preview)`))return;document.getElementById("remindState").textContent="queued via mail provider · idempotent · logged";toast(`Reminders queued for ${MISSING.length} staff.`);};
// users + search
function renderUsers(f=""){document.querySelector("#usersTable tbody").innerHTML=STAFF.filter(s=>(s[0]+s[2]).toLowerCase().includes(f.toLowerCase())).map((s,i)=>`<tr><td>${i+1}</td><td>${s[0]}</td><td><span class="pill success">${s[1]}</span></td><td>${s[2]}</td><td>${s[3]}</td><td><button class="btn primary">Edit Role</button><button class="btn danger">Deactivate</button></td></tr>`).join("");}
renderUsers();document.getElementById("userSearch").oninput=e=>renderUsers(e.target.value);
// programs/holidays/certs
document.querySelector("#progTable tbody").innerHTML=PROGRAMS.map((p,i)=>`<tr><td>${i+1}</td><td>${p.n}</td><td>${p.m}</td><td>${p.c}</td><td>${p.h}</td><td><span class="pill success">active</span></td></tr>`).join("");
document.querySelector("#holTable tbody").innerHTML=HOLS.map((h,i)=>`<tr><td>${i+1}</td><td>${h[0]}</td><td>${h[1]}</td></tr>`).join("");
document.querySelector("#certTable tbody").innerHTML=CERTS.map((c,i)=>`<tr><td>${i+1}</td><td>${c[0]}</td><td>${c[1]}</td><td>${c[2]}</td></tr>`).join("");
// reports
document.querySelectorAll("[data-rep]").forEach(b=>b.onclick=()=>{document.getElementById("repOut").textContent=`${b.dataset.rep} report: filterable grid + CSV/XLSX/PDF export (signed URL, audited). Legacy stub replaced.`;toast(`${b.dataset.rep} report generated (demo).`);});
