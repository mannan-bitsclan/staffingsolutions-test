/* ==========================================================================
   StaffingSolutions.io — on-page assistant
   Rule-based: every answer comes from the page's own content, so it never
   invents prices or promises. No backend, no API key.
   ========================================================================== */
(function () {
  'use strict';

  var RATE = 14, FT_HOURS = 2080;
  var PHONE = '1300 941 872', TEL = 'tel:1300941872', EMAIL = 'hire@staffingsolutions.io';
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };

  /* ---------- Knowledge base ---------- */
  // Each intent: keywords (scored), answer (HTML), follow-up quick replies.
  var INTENTS = [
    {
      id: 'greeting',
      keys: ['hi', 'hello', 'hey', 'gday', "g'day", 'good morning', 'good afternoon', 'hiya'],
      answer: "Hi there! 👋 I can tell you about hiring a dedicated Filipino virtual assistant through StaffingSolutions.io — pricing, roles, how it works, or how much you'd save. What would you like to know?",
      next: ['What does it cost?', 'How does it work?', 'What roles can I hire?']
    },
    {
      id: 'pricing',
      keys: ['price', 'pricing', 'cost', 'costs', 'rate', 'how much', '$14', '14/hr', 'per hour', 'hourly', 'charge', 'expensive', 'cheap', 'fee', 'fees', 'gst', 'invoice', 'billing', 'pay'],
      answer: "It's one rate: <strong>$14/hr + GST, all-inclusive</strong>. That covers recruitment, reference checks, employment, payroll, HR, compliance, time tracking and a dedicated account manager.<br><br>There's <strong>no placement, setup or exit fee — ever</strong>, and you only pay from the day your team member starts. Full-time (40 hrs/wk) works out to about <strong>$29,120 a year</strong>.",
      links: [['See pricing', '#pricing'], ['Open the calculator', '#calculator']],
      next: ['Calculate my savings', 'Is there a minimum term?', 'Book a call']
    },
    {
      id: 'guarantee',
      keys: ['guarantee', 'refund', 'money back', 'money-back', 'risk', 'replace', 'replacement', "doesn't work", 'not working', 'not work out', 'fire', 'unhappy', 'promise'],
      answer: "Every placement comes with the <strong>Zero-Risk Placement Promise</strong>:<ul><li><strong>No placement fee.</strong> Ever.</li><li><strong>First-week money-back</strong> — not working by day five? Full refund of week one.</li><li><strong>Free replacement, any time</strong> — for as long as you're with us.</li></ul>Before replacing anyone, our HR manager steps in to close gaps in process or expectations — often that's all it takes.",
      next: ['What does it cost?', 'How do you vet candidates?', 'Book a call']
    },
    {
      id: 'process',
      keys: ['how it works', 'how does it work', 'process', 'steps', 'get started', 'start', 'timeline', 'how long', 'how fast', 'quickly', 'weeks', 'onboard', 'onboarding', 'first day'],
      answer: "From discovery call to first day takes <strong>about two weeks</strong>:<ol><li><strong>Discovery call</strong> (Day 1) — 30 minutes to map the role, hours and systems.</li><li><strong>Meet your shortlist</strong> (Days 2–5) — reference-checked, interview-ready profiles.</li><li><strong>Interview &amp; choose</strong> (Days 6–10) — free interviews, you pick the person.</li><li><strong>We hire, you lead</strong> — we handle payroll, HR and compliance; the work is yours.</li></ol>",
      links: [['See how it works', '#how']],
      next: ['Can I see profiles first?', 'What does it cost?', 'Book a call']
    },
    {
      id: 'profiles',
      keys: ['profile', 'profiles', 'candidate', 'candidates', 'shortlist', 'interview', 'meet', 'see before', 'cv', 'resume'],
      answer: "Yes — you meet the person before you commit. You'll get shortlisted profiles for <em>your</em> role with real work history, checked references, confirmed English and the systems they've actually used.<br><br>When someone matched is already available, profiles arrive <strong>within a day or two</strong>. Interviews are free, and nothing is charged until they start.",
      links: [['See a sample profile', '#profiles']],
      next: ['Send me 3 profiles', 'How do you vet candidates?', 'How does it work?']
    },
    {
      id: 'roles',
      keys: ['role', 'roles', 'what can', 'tasks', 'hire for', 'positions', 'bookkeeper', 'bookkeeping', 'accounting', 'finance', 'payroll', 'admin', 'executive assistant', 'ea', 'data entry', 'customer service', 'customer support', 'sales', 'lead gen', 'cold call', 'marketing', 'seo', 'social media', 'copywriting', 'design', 'video', 'developer', 'developers', 'it support', 'help desk', 'property', 'real estate', 'qa'],
      answer: "There are <strong>51 roles across 6 practice areas</strong>:<ul><li><strong>NDIS Support</strong> — claims, onboarding, plan tracking (flagship)</li><li><strong>Accounting &amp; Finance</strong> — bookkeepers, payroll, AR/AP, analysts</li><li><strong>Admin &amp; Executive</strong> — EAs, admin support, data entry</li><li><strong>Customer Service &amp; Sales</strong> — CS reps, live chat, lead gen</li><li><strong>Marketing &amp; Creative</strong> — SEO, social, copy, design, video</li><li><strong>Property, IT &amp; Dev</strong> — property mgmt, help desk, developers, QA</li></ul>",
      links: [['Browse roles', '#roles']],
      next: ['NDIS support', 'Which software do they know?', 'What does it cost?']
    },
    {
      id: 'ndis',
      keys: ['ndis', 'plan manager', 'plan management', 'pace', 'careview', 'claims', 'disability', 'support coordination', 'sil', 'participant'],
      answer: "NDIS is our <strong>flagship practice</strong> — 9 roles covering claims, participant onboarding, plan tracking and NDIS bookkeeping.<br><br>Team members work PACE and Careview workflows under NDA, while <strong>portal submission stays with your team</strong>. For example, a sample NDIS Claims Officer profile has 4 years batch-processing claims for AU plan managers, through to remittance reconciliation.",
      links: [['See NDIS roles', '#roles']],
      next: ['How do you handle confidentiality?', 'What does it cost?', 'Book a call']
    },
    {
      id: 'software',
      keys: ['software', 'xero', 'hubspot', 'shopify', 'salesforce', 'clickup', 'quickbooks', 'myob', 'gohighlevel', 'go high level', 'ghl', 'crm', 'tools', 'systems', 'excel'],
      answer: "Our team members are matched to the systems you already use — there are specialists across <strong>20 systems</strong>, including <strong>Xero, QuickBooks, HubSpot, Shopify, Salesforce and ClickUp</strong>.<br><br>We also place dedicated <strong>GoHighLevel specialists</strong> for funnels, automations, snapshots and campaigns. They work inside <em>your</em> tools, with your logins.",
      links: [['See software specialists', '#roles']],
      next: ['What roles can I hire?', 'Do they work my hours?', 'Book a call']
    },
    {
      id: 'hours',
      keys: ['hours', 'time zone', 'timezone', 'aest', 'aedt', 'awst', 'perth', 'sydney', 'melbourne', 'brisbane', 'adelaide', 'gold coast', 'part-time', 'part time', 'full-time', 'full time', 'my hours', 'overnight', 'flexible'],
      answer: "Yes — your team member works <strong>your hours</strong>, same person, same start time every day.<ul><li><strong>Perth:</strong> same time zone as Manila</li><li><strong>Brisbane:</strong> +2 hrs, fixed all year</li><li><strong>Sydney &amp; Melbourne:</strong> +2 hrs winter · +3 hrs summer</li></ul>Choose <strong>full-time (40 hrs)</strong> or <strong>part-time (20 hrs)</strong>, with flexible engagements down to 5 hours a week.",
      links: [['See time zones', '#location']],
      next: ['What does it cost?', 'Is there a minimum term?', 'Book a call']
    },
    {
      id: 'confidentiality',
      keys: ['confidential', 'confidentiality', 'nda', 'security', 'secure', 'data', 'safe', 'privacy', 'access', 'trust'],
      answer: "The same way you'd treat any remote team member. Every placement signs an <strong>NDA and a confidentiality clause before day one</strong>, and they work inside <em>your</em> systems — your email, CRM and file storage — so you control what they see and can revoke access instantly.<br><br><strong>No client data is stored on our side.</strong> Time tracking and screen recording are included too.",
      next: ['How do you vet candidates?', 'NDIS support', 'Book a call']
    },
    {
      id: 'term',
      keys: ['minimum', 'contract', 'term', 'cancel', 'cancellation', 'lock in', 'lock-in', 'locked', 'exit', 'notice', 'month to month', 'commitment'],
      answer: "<strong>Three months to start, then month-to-month</strong>, with no exit penalties. Three months is the standard runway any new hire needs to learn your systems and become genuinely useful.",
      next: ['What if it doesn\'t work out?', 'What does it cost?', 'Book a call']
    },
    {
      id: 'quality',
      keys: ['how do you vet', 'quality', 'vet', 'vetting', 'vetted', 'english', 'reference', 'references', 'experience', 'experienced', 'skilled', 'skills', 'good', 'qualified', 'background check'],
      answer: "Hard vetting: <strong>references, English fluency and real experience in the role</strong>, checked by our own recruitment team in Manila. Then you interview and choose.<br><br>The other half of quality is on your side — documented processes and a proper induction make a good hire great. Your dedicated account manager helps with that, included in the rate.",
      next: ['Can I see profiles first?', 'What if it doesn\'t work out?', 'Book a call']
    },
    {
      id: 'fair',
      keys: ['fair to', 'is it fair', 'worker', 'workers', 'team member paid', 'fair', 'wage', 'wages', 'paid', 'salary', 'ethical', 'exploit', 'take home', 'benefits', 'treat'],
      answer: "Yes. We pay <strong>well above the going Manila rate</strong> for the role — a single higher wage rather than a lower base topped up with benefits, so the person takes home more. That's what keeps good people with the same client for years instead of churning every six months.<br><br>The $14/hr is what you pay us all-in, and it goes a great deal further in Manila than it does here.",
      next: ['What does it cost?', 'Who are you?', 'Book a call']
    },
    {
      id: 'company',
      keys: ['who are you', 'about', 'company', 'australian', 'abn', 'based', 'located', 'location', 'manila', 'philippines', 'filipino', 'office', 'legit', 'real company', 'aklc', 'since'],
      answer: "StaffingSolutions.io is part of <strong>AKLC Group Pty Ltd</strong> (ABN 91 646 327 157), an Australian company with head office on the <strong>Gold Coast, QLD</strong> and a recruitment team in Manila. We've supported <strong>40+ Australian businesses since 2022</strong>.<br><br>We hire, pay and manage your Filipino team member; you bill in Australian dollars with no placement, setup or exit fee.",
      links: [['Where they work', '#location']],
      next: ['How does it work?', 'What does it cost?', 'Talk to a human']
    },
    {
      id: 'contact',
      keys: ['contact', 'phone', 'call', 'email', 'talk', 'human', 'person', 'speak', 'book', 'booking', 'meeting', 'appointment', 'demo', 'consult', 'discovery'],
      answer: "Happy to connect you with a real person in our Gold Coast office — no sales script.<ul><li>📞 <a href=\"" + TEL + "\">" + PHONE + "</a></li><li>✉️ <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a></li></ul>The <strong>30-minute discovery call</strong> leaves you with a plan for the role and a real cost breakdown — even if you never hire us.",
      links: [['Book my 30-minute call', '#book']],
      next: ['What does it cost?', 'How does it work?']
    },
    {
      id: 'savings',
      keys: ['save', 'saving', 'savings', 'calculate', 'calculator', 'compare', 'local hire', 'vs local', 'cheaper', 'worth it', 'keep'],
      answer: "On average clients save <strong>around 70%</strong> vs a local hire. For example, a <strong>$100,000</strong> all-in local hire vs a full-time team member at <strong>$29,120</strong> a year means you keep <strong>$70,880</strong>.<br><br>Tell me your local all-in cost (e.g. <em>\"I pay $85k\"</em>) and I'll work it out for you.",
      links: [['Open the calculator', '#calculator']],
      next: ['I pay $80k locally', 'What does it cost?', 'Book a call']
    },
    {
      id: 'thanks',
      keys: ['thanks', 'thank you', 'cheers', 'appreciate', 'great', 'awesome', 'perfect'],
      answer: "You're welcome! 😊 Anything else I can help with? When you're ready, a 30-minute call is the fastest way to get profiles for your role.",
      next: ['Book a call', 'Send me 3 profiles', 'What does it cost?']
    }
  ];

  var FALLBACK = {
    answer: "I'm not sure I caught that — I'm best with questions about pricing, roles, NDIS support, the hiring process, hours and our guarantee. For anything else, the team is on <a href=\"" + TEL + "\">" + PHONE + "</a>.",
    next: ['What does it cost?', 'What roles can I hire?', 'Talk to a human']
  };

  var START_CHIPS = ['What does it cost?', 'How does it work?', 'What roles can I hire?', 'NDIS support', 'Calculate my savings', 'Book a call'];

  /* ---------- Matching ---------- */
  function normalise(t) { return (' ' + t.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9$'\/\- ]+/g, ' ').replace(/\s+/g, ' ') + ' '); }

  function findIntent(text) {
    var t = normalise(text), best = null, bestScore = 0;
    INTENTS.forEach(function (intent) {
      var score = 0;
      intent.keys.forEach(function (k) {
        // whole-word / phrase match; longer phrases weigh more
        if (t.indexOf(' ' + k + ' ') !== -1 || (k.length > 4 && t.indexOf(k) !== -1)) score += k.split(' ').length + (k.length > 6 ? 1 : 0);
      });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return best;
  }

  // "I pay $85k", "90,000", "120k locally" → savings answer
  function savingsReply(text) {
    var m = text.replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d+)?)\s*(k|K|thousand)?/);
    if (!m) return null;
    var n = parseFloat(m[1]) * (m[2] ? 1000 : 1);
    if (n < 20000 || n > 500000) return null;
    var ss = RATE * FT_HOURS, keep = n - ss;
    if (keep <= 0) {
      return { answer: "At " + money(n) + " a year, a full-time team member at " + money(ss) + " wouldn't save you money — but a <strong>part-time (20 hrs)</strong> engagement at " + money(ss / 2) + " might. Happy to talk it through on a call.", next: ['Book a call', 'Do they work my hours?'] };
    }
    var pct = Math.round(keep / n * 100);
    return {
      answer: "Here's the arithmetic:<div class=\"cb-calc\"><div><span>Your local hire, all-in</span><s>" + money(n) + "</s></div><div><span>Full-time at $14/hr + GST</span><b>" + money(ss) + "</b></div><div class=\"cb-calc-keep\"><span>You'd keep</span><b>" + money(keep) + "</b></div></div>That's <strong>" + pct + "% of the cost</strong>, every year — with no placement fee to start.",
      links: [['Try the full calculator', '#calculator']],
      next: ['Book a call', 'Send me 3 profiles', 'What does it cost?']
    };
  }

  function reply(text) {
    var lower = text.toLowerCase();
    if (/\d/.test(text) && /(pay|cost|salary|local|spend|k\b|\$|000)/.test(lower)) {
      var s = savingsReply(text);
      if (s) return s;
    }
    if (/send me 3 profiles|3 profiles/.test(lower)) {
      return { answer: "Great — profiles are matched to your role, systems and hours, so the quickest route is a 30-minute call (or call us on <a href=\"" + TEL + "\">" + PHONE + "</a>). You'll usually have profiles within a day or two.", links: [['Book my 30-minute call', '#book']], next: ['How does it work?', 'What does it cost?'] };
    }
    return findIntent(text) || FALLBACK;
  }

  /* ---------- DOM ---------- */
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  var botAvatar = '<span class="cb-ava" aria-hidden="true"><i class="bi bi-robot"></i></span>';

  var root = document.createElement('div');
  root.className = 'cb';
  root.innerHTML =
    '<div class="cb-nudge" id="cbNudge" role="status"><button type="button" class="cb-nudge-x" aria-label="Dismiss">&times;</button>' +
      '<strong>Hi, I\'m the SSIO assistant 👋</strong><span>Ask me about pricing, roles or how hiring works.</span></div>' +
    '<button type="button" class="cb-launch" id="cbLaunch" aria-label="Open chat assistant" aria-expanded="false" aria-controls="cbPanel">' +
      '<span class="cb-launch-ring" aria-hidden="true"></span>' +
      '<i class="bi bi-robot cb-ic-open"></i><i class="bi bi-x-lg cb-ic-close"></i>' +
      '<span class="cb-badge" aria-hidden="true">1</span>' +
    '</button>' +
    '<section class="cb-panel" id="cbPanel" role="dialog" aria-modal="false" aria-label="StaffingSolutions.io assistant" hidden>' +
      '<header class="cb-head">' +
        '<span class="cb-head-ava"><i class="bi bi-robot"></i><span class="cb-online"></span></span>' +
        '<div class="cb-head-txt"><strong>SSIO Assistant</strong><small><span class="cb-dot"></span>Online · replies instantly</small></div>' +
        '<button type="button" class="cb-icon-btn" id="cbReset" aria-label="Restart conversation" title="Restart"><i class="bi bi-arrow-counterclockwise"></i></button>' +
        '<button type="button" class="cb-icon-btn" id="cbClose" aria-label="Close chat"><i class="bi bi-x-lg"></i></button>' +
      '</header>' +
      '<div class="cb-body" id="cbBody" aria-live="polite"></div>' +
      '<div class="cb-chips" id="cbChips"></div>' +
      '<form class="cb-form" id="cbForm" autocomplete="off">' +
        '<input type="text" id="cbInput" placeholder="Ask about pricing, roles, NDIS…" aria-label="Type your question" maxlength="300">' +
        '<button type="submit" class="cb-send" aria-label="Send"><i class="bi bi-send-fill"></i></button>' +
      '</form>' +
      '<p class="cb-foot">Prefer a human? <a href="' + TEL + '">' + PHONE + '</a></p>' +
    '</section>';
  document.body.appendChild(root);

  var launch = root.querySelector('#cbLaunch');
  var panel = root.querySelector('#cbPanel');
  var body = root.querySelector('#cbBody');
  var chips = root.querySelector('#cbChips');
  var form = root.querySelector('#cbForm');
  var input = root.querySelector('#cbInput');
  var nudge = root.querySelector('#cbNudge');
  var started = false, busy = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'cb-msg cb-user';
    el.innerHTML = '<div class="cb-bubble">' + esc(text) + '</div>';
    body.appendChild(el);
    scrollDown();
  }

  function addBot(r) {
    var links = (r.links || []).map(function (l) {
      return '<a class="cb-link" href="' + l[1] + '">' + l[0] + ' <i class="bi bi-arrow-right"></i></a>';
    }).join('');
    var el = document.createElement('div');
    el.className = 'cb-msg cb-bot';
    el.innerHTML = botAvatar + '<div class="cb-bubble">' + r.answer + (links ? '<div class="cb-links">' + links + '</div>' : '') + '</div>';
    body.appendChild(el);
    setChips(r.next || START_CHIPS);
    scrollDown();
  }

  function setChips(list) {
    chips.innerHTML = '';
    list.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cb-chip';
      b.textContent = label;
      b.addEventListener('click', function () { send(label); });
      chips.appendChild(b);
    });
  }

  function botSay(r) {
    busy = true;
    var typing = document.createElement('div');
    typing.className = 'cb-msg cb-bot cb-typing';
    typing.innerHTML = botAvatar + '<div class="cb-bubble"><span></span><span></span><span></span></div>';
    body.appendChild(typing);
    scrollDown();
    setTimeout(function () {
      typing.remove();
      addBot(r);
      busy = false;
    }, 550 + Math.min(r.answer.length * 1.4, 700));
  }

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    addUser(text);
    chips.innerHTML = '';
    botSay(reply(text));
  }

  function greet() {
    body.innerHTML = '';
    var hour;
    try { hour = parseInt(new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', hour: 'numeric', hour12: false }), 10); } catch (e) { hour = 12; }
    var hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    addBot({
      answer: hello + "! 👋 I'm the <strong>StaffingSolutions.io assistant</strong>. I can explain how hiring a dedicated Filipino virtual assistant works — from <strong>$14/hr all-inclusive</strong>, with no placement fee and your first week refundable.<br><br>What can I help you with?",
      next: START_CHIPS
    });
  }

  function open() {
    hideNudge();
    panel.hidden = false;
    requestAnimationFrame(function () { root.classList.add('is-open'); });
    launch.setAttribute('aria-expanded', 'true');
    launch.setAttribute('aria-label', 'Close chat assistant');
    if (!started) { started = true; greet(); }
    setTimeout(function () { if (window.matchMedia('(pointer: fine)').matches) input.focus(); }, 250);
  }
  function close() {
    root.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-label', 'Open chat assistant');
    setTimeout(function () { if (!root.classList.contains('is-open')) panel.hidden = true; }, 300);
  }
  function hideNudge() {
    nudge.classList.remove('show');
    root.classList.add('seen');
    try { sessionStorage.setItem('ssio-cb-seen', '1'); } catch (e) { /* storage unavailable */ }
  }

  launch.addEventListener('click', function () { root.classList.contains('is-open') ? close() : open(); });
  root.querySelector('#cbClose').addEventListener('click', close);
  root.querySelector('#cbReset').addEventListener('click', function () { if (!busy) greet(); });
  nudge.querySelector('.cb-nudge-x').addEventListener('click', function (e) { e.stopPropagation(); hideNudge(); });
  nudge.addEventListener('click', open);
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); input.value = ''; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) { close(); launch.focus(); } });

  // In-page links close the panel on small screens so the section is visible
  body.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a && window.matchMedia('(max-width: 575.98px)').matches) close();
  });

  // Friendly nudge once per session, after the visitor has had a look around
  var seen = false;
  try { seen = sessionStorage.getItem('ssio-cb-seen') === '1'; } catch (e) { /* storage unavailable */ }
  if (seen) root.classList.add('seen');
  else setTimeout(function () { if (!root.classList.contains('is-open')) nudge.classList.add('show'); }, 6000);
})();
