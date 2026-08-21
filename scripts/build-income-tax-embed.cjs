const fs = require("fs");
const base = "c:/Users/Admin/Desktop/puneet_/nanak-hub-upload-ccfc1000";
let css = fs.readFileSync(base + "/src/pages/IncomeTaxCalculatorPage.css", "utf8");
css = css.replace(/@import url\([^)]+\);\s*/g, "");
css += `
html,body{margin:0;padding:0}
html.framed,html.framed body{
  min-height:0!important;height:auto!important;overflow-x:hidden;overflow-y:hidden;
  width:100%;max-width:100%;min-width:0;background:#F4F7FB;
}
html.framed .itc{min-height:0!important;height:auto!important;width:100%;max-width:100%}
html.framed .itc .wrap{max-width:none;width:100%;padding:0 16px;box-sizing:border-box}
html.framed .itc header{padding:28px 0 20px}
html.framed .itc h1{font-size:clamp(26px,6vw,42px);max-width:none}
html.framed .itc .header-note{font-size:15px}
html.framed .itc .headline .big{font-size:clamp(36px,8vw,52px)}
html.framed .itc .grid{grid-template-columns:400px minmax(0,1fr);gap:26px}
html.framed .itc .panel{padding:26px}
html.framed .itc footer{padding:16px 0 24px}
@media(max-width:920px){
  html.framed .itc .grid{grid-template-columns:1fr;gap:18px}
  html.framed .itc header{padding:20px 0 14px}
  html.framed .itc .panel{padding:18px}
  html.framed .itc .wrap{padding:0 12px}
  html.framed .itc .trust-row{gap:12px;font-size:12.5px}
  html.framed .itc .lead-grid{grid-template-columns:1fr}
  html:not(.framed) .itc .grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  html.framed .itc h1{font-size:24px}
  html.framed .itc .eyebrow{font-size:11px;padding:6px 12px}
  html.framed .itc .seg button{font-size:13px;padding:8px 4px}
}
`;

const html = `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Australian Income Tax Calculator 2025-26 &amp; 2026-27 | Nanak Accountants</title>
<meta name="description" content="Accountant-built Australian income tax calculator. Resident, foreign resident and working holiday maker rates, Medicare levy, LITO, HECS-HELP and the 2026-27 $1,000 instant deduction.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body data-embed-root="itc-embed">
<div class="itc" id="itc-embed">
  <header>
    <div class="wrap">
      <div class="eyebrow">Free Calculator | Nanak Accountants &amp; Associates</div>
      <h1>Work out your <span class="hl">income tax</span> for 2025-26 and 2026-27</h1>
      <p class="header-note">Built by registered tax agents. Resident, foreign resident and working holiday maker rates, the Medicare levy, LITO, HECS-HELP marginal repayments and the 15% bracket cut from 1 July 2026.</p>
      <div class="trust-row">
        <span>Registered Tax Agent 26113345</span>
        <span>Trusted by 5,000+ businesses</span>
        <span>Rated 5 stars from 1,000+ reviews</span>
      </div>
    </div>
  </header>
  <main>
    <div class="wrap">
      <div class="grid">
        <section class="panel" aria-label="Your details">
          <h2>Your details</h2>
          <div class="field">
            <label>Financial year</label>
            <div class="seg" id="fySeg" role="group" aria-label="Financial year">
              <button type="button" data-fy="y2526" class="active">2025-26</button>
              <button type="button" data-fy="y2627">2026-27</button>
            </div>
          </div>
          <div class="field">
            <label for="income">Income before tax</label>
            <div class="row2">
              <input type="number" id="income" min="0" step="500" value="95000" inputmode="decimal" aria-label="Income amount">
              <select id="freq" aria-label="Income frequency">
                <option value="annual">per year</option>
                <option value="monthly">per month</option>
                <option value="fortnightly">per fortnight</option>
                <option value="weekly">per week</option>
              </select>
            </div>
          </div>
          <label class="check"><input type="checkbox" id="incSuper"><span>Amount includes super<small>Tick if your package is quoted inclusive of the 12% super guarantee</small></span></label>
          <div class="field">
            <label for="residency">Residency for tax purposes</label>
            <select id="residency">
              <option value="resident">Australian resident (incl. most temporary visas)</option>
              <option value="nonres">Foreign resident (usual home overseas)</option>
              <option value="whm">Working holiday maker (417 / 462 visa)</option>
            </select>
            <div class="res-note" id="resNote"></div>
          </div>
          <label class="check"><input type="checkbox" id="help"><span>I have a HECS-HELP debt<small>Includes HELP, VSL, SSL and AASL study loans</small></span></label>
          <label class="check" id="instantWrap" style="display:none"><input type="checkbox" id="instant" checked><span>$1,000 instant work deduction<small>New for 2026-27 - a flat deduction for work expenses, no receipts needed. Australian residents with work income.</small></span></label>
          <div class="field">
            <label for="deductions">Other work-related deductions (per year)</label>
            <input type="number" id="deductions" min="0" step="100" value="0" inputmode="decimal">
            <p class="hint">Claim the $1,000 flat deduction or your actual expenses with receipts - not both. Enter actuals here if they are higher.</p>
          </div>
        </section>
        <section aria-label="Your results">
          <div class="headline">
            <div class="lbl">Your estimated tax</div>
            <div class="big" id="bigNum">$0</div>
            <div class="per" id="bigPer">per year - income tax, Medicare levy</div>
            <div class="period-tabs" id="periodTabs" role="group" aria-label="Display period">
              <button type="button" data-period="weekly">Weekly</button>
              <button type="button" data-period="fortnightly">Fortnightly</button>
              <button type="button" data-period="monthly">Monthly</button>
              <button type="button" data-period="annual" class="active">Annual</button>
            </div>
            <div class="rate-chips">
              <span class="chip" id="chipEff">Effective tax rate: 0%</span>
              <span class="chip" id="chipMarg">Marginal rate: 0%</span>
              <span class="chip" id="chipNet">Take-home: $0 per year</span>
            </div>
          </div>
          <div class="panel payslip">
            <table aria-label="Tax breakdown">
              <thead><tr><th>Breakdown</th><th id="colPeriod">Annual</th><th>Annual</th></tr></thead>
              <tbody id="payslipBody"></tbody>
            </table>
          </div>
          <div class="lead">
            <h3>Ready to <span class="hl">do your tax return with us?</span></h3>
            <p>Leave your details and one of our accountants will get back to you.</p>
            <div class="lead-grid">
              <input type="text" id="leadName" placeholder="Your name" autocomplete="name" aria-label="Name">
              <input type="email" id="leadEmail" placeholder="you@email.com" autocomplete="email" aria-label="Email">
              <input type="tel" id="leadPhone" placeholder="Mobile" autocomplete="tel" aria-label="Mobile">
              <button class="btn" id="leadBtn" type="button">Get started</button>
            </div>
            <div class="status" id="leadStatus" role="status"></div>
            <label class="consent"><input type="checkbox" id="consent"><span>Keep me updated with tax tips and reminders by email, text and phone. Opt out any time. <a href="#" id="termsToggle">Full terms</a></span></label>
            <p class="terms-full" id="termsFull">I agree to receive marketing from Nanak Accountants &amp; Associates by email, text message and phone call. I understand calls may be automated, pre-recorded or use an AI voice, that standard message rates may apply, and that this consent applies even if my number is on the Do Not Call Register. I can opt out any time by replying STOP to a text, using the unsubscribe link in any email, or asking not to receive further calls.</p>
            <p class="alt-links">Optional - you'll get your results either way. <a href="https://nanakaccountants.com.au/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a> &nbsp;|&nbsp; <a href="https://calendly.com/nanakaccountant" target="_blank" rel="noopener noreferrer">Book a time</a> &nbsp;|&nbsp; <a href="tel:1300626258">1300 626 258</a></p>
          </div>
        </section>
      </div>
      <footer>
        <p>General advice only - not tax or financial advice. Estimates use the resident, foreign resident and working holiday maker rates legislated for 2025-26 and 2026-27, the 2% Medicare levy with the singles low-income reduction, LITO, and the HECS-HELP marginal repayment system. Excludes the Medicare levy surcharge, family and seniors thresholds, offsets other than LITO, and reportable fringe benefits or super contributions. Residency for tax purposes is set by the ATO's residency tests, not your visa. Your circumstances may change the result - speak with us on <a href="tel:1300626258">1300 626 258</a>.</p>
      </footer>
    </div>
  </main>
</div>
<script>
(function(){
  if (window.parent && window.parent !== window) document.documentElement.classList.add("framed");

  var LEAD_SOURCE = "income_tax_calculator";
  var API_BASE = (function(){
    try {
      var h = (location.hostname || "").toLowerCase();
      if (h === "localhost" || h === "127.0.0.1" || h === "api.cavaluer.com") return "";
    } catch(e){}
    return "https://api.cavaluer.com";
  })();

  var RATES = {
    y2526: {
      label:"2025-26",
      resident:[[18200,0],[45000,0.16],[135000,0.30],[190000,0.37],[Infinity,0.45]],
      nonres:[[135000,0.30],[190000,0.37],[Infinity,0.45]],
      whm:[[45000,0.15],[135000,0.30],[190000,0.37],[Infinity,0.45]],
      medicare:{lo:27222,hi:34027,rate:0.02,shade:0.10},
      help:{t1:67000,t2:125000,base2:8700,capFrom:179286,capRate:0.10},
      sg:0.12, instantDeduction:0
    },
    y2627: {
      label:"2026-27",
      resident:[[18200,0],[45000,0.15],[135000,0.30],[190000,0.37],[Infinity,0.45]],
      nonres:[[135000,0.30],[190000,0.37],[Infinity,0.45]],
      whm:[[45000,0.15],[135000,0.30],[190000,0.37],[Infinity,0.45]],
      medicare:{lo:28011,hi:35014,rate:0.02,shade:0.10},
      help:{t1:69528,t2:129716,base2:9028,capFrom:186050,capRate:0.10},
      sg:0.12, instantDeduction:1000
    }
  };
  var LITO = {max:700,t1:37500,taper1:0.05,t2:45000,taper2:0.015};
  var PERIODS = {weekly:52,fortnightly:26,monthly:12,annual:1};
  var PER_LABEL = {weekly:"per week",fortnightly:"per fortnight",monthly:"per month",annual:"per year"};
  var COL_LABEL = {weekly:"Weekly",fortnightly:"Fortnightly",monthly:"Monthly",annual:"Annual"};
  var FREQ_TO_YEAR = {annual:1,monthly:12,fortnightly:26,weekly:52};
  var RES_NOTES = {
    resident:"<b>Tax residency is not your visa status.</b> If Australia is where you live, work and have a settled routine - including students and 482, 485 or 491 holders here 183 days or more - you are generally a resident for tax purposes, even without PR or citizenship.",
    nonres:"<b>Check before choosing this.</b> Foreign resident rates generally apply only if your usual home is overseas. Most temporary visa holders living in Australia are residents for tax purposes and should select Australian resident. Unsure? Speak with us before lodging.",
    whm:"These rates apply only to <b>417 and 462 visa holders</b>. On any other visa, choose Australian resident or foreign resident based on where your usual home is."
  };

  var state = {fy:"y2526", period:"annual", income:95000, freq:"annual", incSuper:false, residency:"resident", hasHelp:false, useInstant:true, deductions:0};

  function money(n){ return "$" + Math.round(n).toLocaleString("en-AU"); }
  function bracketTax(ti, scale){
    var tax=0, prev=0;
    for (var i=0;i<scale.length;i++){
      var cap=scale[i][0], rate=scale[i][1];
      if (ti>prev) tax += (Math.min(ti,cap)-prev)*rate;
      prev=cap; if (ti<=cap) break;
    }
    return tax;
  }
  function marginalRate(ti, scale){
    var prev=0;
    for (var i=0;i<scale.length;i++){
      var cap=scale[i][0], rate=scale[i][1];
      if (ti>prev && ti<=cap) return rate;
      prev=cap;
    }
    return ti<=0 ? 0 : scale[scale.length-1][1];
  }
  function lito(ti){
    if (ti<=LITO.t1) return LITO.max;
    if (ti<=LITO.t2) return Math.max(0, LITO.max-(ti-LITO.t1)*LITO.taper1);
    return Math.max(0, LITO.max-(LITO.t2-LITO.t1)*LITO.taper1-(ti-LITO.t2)*LITO.taper2);
  }
  function medicareLevy(ti, cfg){
    if (ti<=cfg.lo) return 0;
    if (ti>=cfg.hi) return ti*cfg.rate;
    return (ti-cfg.lo)*cfg.shade;
  }
  function helpRepay(ti, cfg){
    if (ti<=cfg.t1) return 0;
    if (ti>=cfg.capFrom) return ti*cfg.capRate;
    if (ti<=cfg.t2) return (ti-cfg.t1)*0.15;
    return cfg.base2+(ti-cfg.t2)*0.17;
  }
  function calculate(gross, yearKey, residency, hasHelp, useInstant, otherDeductions){
    var y=RATES[yearKey];
    var scale=y[residency];
    var instant = residency==="resident" && useInstant ? y.instantDeduction : 0;
    var deductions = Math.max(instant, otherDeductions||0);
    var taxable = Math.max(0, gross-deductions);
    var grossTax = bracketTax(taxable, scale);
    var offset = residency==="resident" ? Math.min(lito(taxable), grossTax) : 0;
    var incomeTax = grossTax-offset;
    var levy = residency==="resident" ? medicareLevy(taxable, y.medicare) : 0;
    var help = hasHelp ? helpRepay(taxable, y.help) : 0;
    var total = incomeTax+levy+help;
    return {gross:gross,deductions:deductions,instant:instant,taxable:taxable,grossTax:grossTax,offset:offset,incomeTax:incomeTax,levy:levy,help:help,total:total,net:gross-total,marginal:marginalRate(taxable,scale)};
  }

  function postHeight(){
    try { if (typeof window.nanakPostEmbedHeight === "function") window.nanakPostEmbedHeight(); } catch(e){}
  }

  function render(){
    var y = RATES[state.fy];
    var showInstant = state.fy==="y2627" && state.residency==="resident";
    document.getElementById("instantWrap").style.display = showInstant ? "" : "none";
    var note = document.getElementById("resNote");
    note.innerHTML = RES_NOTES[state.residency];
    note.className = "res-note" + (state.residency==="nonres" ? " warn" : "");

    var entered = (Number(state.income)||0) * FREQ_TO_YEAR[state.freq];
    var superAmount = state.incSuper ? entered - entered/(1+y.sg) : 0;
    var gross = state.incSuper ? entered/(1+y.sg) : entered;
    var applyInstant = showInstant && state.useInstant;
    var r = calculate(gross, state.fy, state.residency, state.hasHelp, applyInstant, Number(state.deductions)||0);
    var div = PERIODS[state.period];

    document.getElementById("bigNum").textContent = money(r.total/div);
    document.getElementById("bigPer").textContent = PER_LABEL[state.period] + " - income tax, Medicare levy" + (state.hasHelp ? " and HELP" : "");
    document.getElementById("colPeriod").textContent = COL_LABEL[state.period];
    document.getElementById("chipEff").textContent = "Effective tax rate: " + (r.gross>0 ? ((r.total/r.gross)*100).toFixed(1) : "0.0") + "%";
    document.getElementById("chipMarg").textContent = "Marginal rate: " + (r.marginal*100).toFixed(0) + "%";
    document.getElementById("chipNet").textContent = "Take-home: " + money(r.net/div) + " " + PER_LABEL[state.period];

    var rows = [];
    rows.push({label:"Gross income", sub: state.incSuper ? "Excludes the 12% super shown below" : null, annual:r.gross});
    if (state.incSuper) rows.push({label:"Employer super", sub:"Paid to your fund, not to you", annual:superAmount, cls:"muted"});
    if (r.deductions>0){
      var dLabel = r.instant>0 && r.deductions===r.instant ? "$1,000 instant deduction" : "Work-related deductions";
      rows.push({label:dLabel, sub:"Reduces your taxable income", annual:r.deductions, cls:"muted", sign:"-"});
      rows.push({label:"Taxable income", annual:r.taxable});
    }
    rows.push({label:"Income tax", sub: r.offset>0 ? "After LITO of "+money(r.offset) : null, annual:r.incomeTax, cls:"neg", sign:"-"});
    if (state.residency==="resident") rows.push({label:"Medicare levy", sub: r.levy===0 ? "Below the low-income threshold" : "2% of taxable income", annual:r.levy, cls:"neg", sign:"-"});
    if (state.hasHelp) rows.push({label:"HECS-HELP repayment", sub:"Marginal system, "+y.label+" thresholds", annual:r.help, cls:"neg", sign:"-"});
    rows.push({label:"Take-home pay", annual:r.net, isTotal:true});

    var tbody = document.getElementById("payslipBody");
    tbody.innerHTML = rows.map(function(row){
      if (row.isTotal) return '<tr class="total"><td>'+row.label+'</td><td>'+money(row.annual/div)+'</td><td>'+money(row.annual)+'</td></tr>';
      var sign = row.sign||"";
      var amountClass = row.cls==="neg" ? "neg" : "";
      var sub = row.sub ? '<span class="sub">'+row.sub+"</span>" : "";
      return '<tr class="'+(row.cls||"")+'"><td>'+row.label+sub+'</td><td class="'+amountClass+'">'+sign+money(row.annual/div)+'</td><td class="'+amountClass+'">'+sign+money(row.annual)+"</td></tr>";
    }).join("");

    window.__itcLast = r;
    postHeight();
  }

  document.getElementById("fySeg").addEventListener("click", function(e){
    var b = e.target.closest("button[data-fy]"); if (!b) return;
    state.fy = b.getAttribute("data-fy");
    Array.prototype.forEach.call(document.querySelectorAll("#fySeg button"), function(x){ x.classList.toggle("active", x===b); });
    render();
  });
  document.getElementById("periodTabs").addEventListener("click", function(e){
    var b = e.target.closest("button[data-period]"); if (!b) return;
    state.period = b.getAttribute("data-period");
    Array.prototype.forEach.call(document.querySelectorAll("#periodTabs button"), function(x){ x.classList.toggle("active", x===b); });
    render();
  });
  ["income","freq","deductions","residency"].forEach(function(id){
    var el = document.getElementById(id);
    function sync(){
      if (id==="income" || id==="deductions") state[id] = Number(el.value)||0;
      else state[id] = el.value;
      render();
    }
    el.addEventListener("input", sync);
    el.addEventListener("change", sync);
  });
  document.getElementById("incSuper").addEventListener("change", function(){ state.incSuper=this.checked; render(); });
  document.getElementById("help").addEventListener("change", function(){ state.hasHelp=this.checked; render(); });
  document.getElementById("instant").addEventListener("change", function(){ state.useInstant=this.checked; render(); });
  document.getElementById("termsToggle").addEventListener("click", function(e){
    e.preventDefault();
    document.getElementById("termsFull").classList.toggle("open");
    postHeight();
  });

  document.getElementById("leadBtn").addEventListener("click", async function(){
    var btn = this;
    var st = document.getElementById("leadStatus");
    var name = document.getElementById("leadName").value.trim();
    var email = document.getElementById("leadEmail").value.trim();
    var phone = document.getElementById("leadPhone").value.trim();
    var consent = document.getElementById("consent").checked;
    st.className = "status"; st.textContent = "";
    if (!name || !email){ st.textContent = "Add your name and email so we can get back to you."; st.classList.add("err"); return; }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){ st.textContent = "That email address doesn't look right - check and try again."; st.classList.add("err"); return; }
    var r = window.__itcLast || {};
    var snapshot = {
      financial_year: RATES[state.fy].label,
      residency: state.residency,
      income: Number(state.income)||0,
      income_frequency: state.freq,
      has_help: state.hasHelp,
      tax: r.incomeTax||null,
      medicare: r.levy||null,
      help_repayment: r.help||null,
      net: r.net||null,
      display_period: state.period
    };
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      var resp = await fetch(API_BASE + "/api/leads", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          lead:{
            name:name, email:email, phone:phone, mobile:phone||null,
            source:LEAD_SOURCE, service_interest:"individual_tax",
            callback_requested:!!phone, marketing_optin:consent,
            consent:{email:true, sms:!!phone&&consent, whatsapp:false},
            calculator_snapshot:snapshot
          },
          touchpoint:{channel:"calculator", source:LEAD_SOURCE, page:"/income-tax-calculator", captured_at:new Date().toISOString()},
          source:LEAD_SOURCE, calculatorSnapshot:snapshot
        })
      });
      var body = await resp.json().catch(function(){return {};});
      if (!resp.ok || body.success===false) throw new Error(body.message||"Could not submit");
      st.textContent = "Thanks " + name + " - we'll be in touch shortly.";
      st.classList.add("ok");
      btn.textContent = "Get started";
    } catch(err){
      btn.disabled=false; btn.textContent="Get started";
      st.textContent = err.message || "Something went wrong. Please try again.";
      st.classList.add("err");
    }
    postHeight();
  });

  render();
  setTimeout(postHeight, 50);
  setTimeout(postHeight, 300);
})();
</script>
<script src="./nanak-embed-child-resize.js" defer></script>
</body>
</html>`;

fs.writeFileSync(base + "/public/embeds/income-tax-calculator.html", html);
console.log("wrote", html.length, "bytes");
