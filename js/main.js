(function () {
  'use strict';

  /* ---------- Navbar shrink + back-to-top ---------- */
  var nav = document.getElementById('mainNav');
  var toTop = document.getElementById('toTop');
  // Scroll progress hairline
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Back-to-top only appears once the visitor reaches the end of the page
  var footer = document.querySelector('.ss-footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      toTop.classList.toggle('show', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(footer);
  }

  // Close mobile menu after picking a link
  document.querySelectorAll('#navMenu .nav-link, #navMenu .btn-ss').forEach(function (link) {
    link.addEventListener('click', function () {
      var menu = document.getElementById('navMenu');
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  /* ---------- Hero ---------- */
  var hero = document.querySelector('.hero');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split the headline into words so each can rise in turn
  var title = document.querySelector('.hero-title[data-split]');
  if (title) {
    var idx = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.innerHTML = '<span style="--i:' + (idx++) + '"></span>';
            w.firstChild.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName.toLowerCase() !== 'svg') {
          split(child);
        }
      });
    })(title);
  }

  // Kick off the entrance once the page (and fonts) are ready
  function heroReady() { if (hero) hero.classList.add('is-ready'); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(heroReady);
    setTimeout(heroReady, 1200); // safety net
  } else {
    window.addEventListener('load', heroReady);
  }

  // Live AEST clock (Brisbane — no daylight saving)
  var clock = document.getElementById('aestClock');
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour: 'numeric', minute: '2-digit' });
    } catch (e) { /* older browsers: keep default text */ }
  }
  tick();
  setInterval(tick, 30000);

  // Video play / pause
  var video = document.getElementById('heroVideo');
  var toggle = document.getElementById('videoToggle');
  if (video && toggle) {
    var setIcon = function () {
      var paused = video.paused;
      toggle.innerHTML = '<i class="bi bi-' + (paused ? 'play-fill' : 'pause-fill') + '"></i>';
      toggle.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    };
    if (reduceMotion) video.pause();
    toggle.addEventListener('click', function () {
      if (video.paused) { video.play(); } else { video.pause(); }
    });
    video.addEventListener('play', setIcon);
    video.addEventListener('pause', setIcon);
    setIcon();
  }

  // Subtle mouse parallax on the stage
  var stage = document.getElementById('heroStage');
  if (stage && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var media = document.getElementById('heroMedia');
    var cards = stage.querySelectorAll('.glass-card[data-depth]');
    var raf = null;
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        media.style.transform = 'rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
        cards.forEach(function (c) {
          var d = parseFloat(c.getAttribute('data-depth'));
          c.style.transform = 'translate3d(' + (x * d) + 'px,' + (y * d) + 'px,0)';
        });
      });
    });
    stage.addEventListener('mouseleave', function () {
      media.style.transform = '';
      cards.forEach(function (c) { c.style.transform = ''; });
    });
  }

  /* ---------- Live time-zone overlap (location section) ---------- */
  var tzx = document.querySelector('.tzx');
  if (tzx) {
    var AXIS_START = 5, AXIS_SPAN = 17; // Manila 5am → 10pm
    var pct = function (h) { return ((h - AXIS_START) / AXIS_SPAN * 100) + '%'; };
    var clockFmt = function (h) { var hh = ((Math.floor(h) + 11) % 12) + 1, ap = h >= 12 && h < 24 ? 'pm' : 'am'; return hh + ':00' + ap; };
    // Minutes since midnight in a given zone
    var zoneMinutes = function (tz, d) {
      var parts = new Intl.DateTimeFormat('en-AU', { timeZone: tz, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d);
      var get = function (t) { return parseInt(parts.filter(function (p) { return p.type === t; })[0].value, 10); };
      return get('hour') * 60 + get('minute');
    };
    var timeIn = function (tz, d) { return d.toLocaleTimeString('en-AU', { timeZone: tz, hour: 'numeric', minute: '2-digit' }); };

    var updateTz = function () {
      var now = new Date(), manilaMin;
      try { manilaMin = zoneMinutes('Asia/Manila', now); } catch (e) { return; } // keep static fallback
      var mh = Math.floor(manilaMin / 60), mm = manilaMin % 60;
      document.getElementById('tzxManila').textContent = (((mh + 11) % 12) + 1) + ':' + (mm < 10 ? '0' : '') + mm;
      document.getElementById('tzxManilaAp').textContent = mh >= 12 ? 'pm' : 'am';
      document.getElementById('tzxDate').textContent = now.toLocaleDateString('en-AU', { timeZone: 'Asia/Manila', weekday: 'long', day: 'numeric', month: 'long' }) + ' · UTC+8';

      var nowH = manilaMin / 60;
      tzx.querySelectorAll('.tzx-row').forEach(function (row) {
        var tz = row.getAttribute('data-tz');
        var diff = (zoneMinutes(tz, now) - manilaMin) / 60;
        if (diff > 12) diff -= 24;
        if (diff < -12) diff += 24;
        var start = 9 - diff, end = 17 - diff;
        var win = row.querySelector('.tzx-win');
        win.style.setProperty('--l', pct(start));
        win.style.setProperty('--w', ((end - start) / AXIS_SPAN * 100) + '%');
        row.querySelector('.tzx-range').textContent = clockFmt(start) + ' – ' + clockFmt(end);
        row.querySelector('.tzx-off').textContent = diff === 0 ? 'Same time zone' : (diff > 0 ? '+' : '') + diff + ' hrs vs Manila';
        row.querySelector('.tzx-local').textContent = timeIn(tz, now);
        var nowEl = row.querySelector('.tzx-now');
        var inRange = nowH >= AXIS_START && nowH <= AXIS_START + AXIS_SPAN;
        nowEl.hidden = !inRange;
        if (inRange) nowEl.style.setProperty('--now', pct(nowH));
      });
    };
    updateTz();
    setInterval(updateTz, 30000);
  }

  /* ---------- Client logo marquee ---------- */
  var clients = [
    'Aaron Sansoni', 'Aaron Brown & Associates', 'Find A Carer', 'Complete Technology Solutions', 'Online Savvy',
    'Torqit', '4TheLove', 'BlueMelon', 'GreenQube', 'Livsee', 'Provider Partners Consulting',
    'Shifting Sands Support Services', 'Unlimited Mortgage Lending', 'Bourkes Florist', 'Checkmate Industries',
    'Corporate Diversity Pathways', 'Cura Technologies', 'Garden Nursery Products', 'Hallmark Occupational Therapy',
    'Harper B', 'Hemy Healing', 'Hyperion Technologies', 'IgniteOS', 'Infinity Care Australia', 'Link To Life',
    'Living Water & Co', 'LVL UP Support Services', 'MondoRoam', 'Nios Spa', 'One True Pairing', 'Parrot Digital',
    'PBK Consultancy', 'Phora Australia', 'Royal Care Disabilities Services', 'Tina Kristen Weddings', 'Toto & Co',
    'Travel Agent Finder', 'TX Colon', 'Vuemotion', 'We Know Video', 'Wholehearted Care'
  ];
  // Shuffle so no client is permanently first
  for (var i = clients.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = clients[i]; clients[i] = clients[j]; clients[j] = t;
  }
  // Monogram from the first two words, e.g. "Toto & Co" → "TC"
  function initials(name) {
    var words = name.split(/\s+/).filter(function (w) { return /^[A-Za-z0-9]/.test(w); });
    return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
  }
  function fillMarquee(setId, trackId, list) {
    var set = document.getElementById(setId);
    var track = document.getElementById(trackId);
    if (!set || !track) return;
    list.forEach(function (c) {
      var mark = document.createElement('span');
      mark.className = 'logo-mark';
      var icon = document.createElement('span');
      icon.className = 'lm-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = initials(c);
      mark.appendChild(icon);
      mark.appendChild(document.createTextNode(c));
      set.appendChild(mark);
    });
    // Duplicate the set so the -50% loop is seamless
    var clone = set.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }
  var half = Math.ceil(clients.length / 2);
  fillMarquee('logoSet', 'logoTrack', clients.slice(0, half));
  fillMarquee('logoSet2', 'logoTrack2', clients.slice(half));

  /* ---------- Word-by-word section headings ---------- */
  var wordTitles = document.querySelectorAll('.display-title, .stats-title, .cta-panel h2');
  wordTitles.forEach(function (t) {
    var n = 0;
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'ws-w';
            w.innerHTML = '<span style="--i:' + (n++) + '"></span>';
            w.firstChild.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          wrap(child);
        }
      });
    })(t);
    t.classList.add('ws');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('words-in');
        wio.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    wordTitles.forEach(function (t) { wio.observe(t); });
  } else {
    wordTitles.forEach(function (t) { t.classList.add('words-in'); });
  }

  /* ---------- Cursor spotlight on cards ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.gx-card, .role-tile, .kpi-card, .tzx, .profile-card').forEach(function (card) {
      var glow = document.createElement('span');
      glow.className = 'spot-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.classList.add('spot-host');
      card.insertBefore(glow, card.firstChild);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Reveal on scroll + stat counters ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.count').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.count').forEach(function (el) { el.textContent = el.getAttribute('data-to'); });
  }

  /* ---------- Stats charts ---------- */
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };

  // Shared tooltip
  var tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function placeTip(x, y) {
    var r = tip.getBoundingClientRect();
    var left = Math.min(Math.max(x - r.width / 2, 8), window.innerWidth - r.width - 8);
    var top = y - r.height - 14;
    if (top < 8) top = y + 18;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideTip() { tip.classList.remove('show'); }
  window.addEventListener('scroll', hideTip, { passive: true });

  // Bars & segments: title + line of detail from data attributes
  document.querySelectorAll('[data-tip-title]').forEach(function (el) {
    function show() {
      tip.innerHTML = '<strong></strong><span></span>';
      tip.firstChild.textContent = el.getAttribute('data-tip-title');
      tip.lastChild.textContent = el.getAttribute('data-tip');
      tip.classList.add('show');
      var r = el.getBoundingClientRect();
      placeTip(r.left + r.width / 2, r.top);
    }
    el.addEventListener('mouseenter', show);
    el.addEventListener('focus', show);
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('blur', hideTip);
  });

  // Cumulative cost line chart: local hire vs StaffingSolutions.io
  var savEl = document.getElementById('chartSavings');
  if (savEl) {
    var LOCAL_YR = 100000, SS_YR = 14 * 40 * 52;
    var drawn = reduceMotion, lastW = 0, lastH = 0, clipRect = null;

    // The SVG is absolutely positioned, so the card's layout decides the size
    var renderSavings = function () {
      var W = savEl.clientWidth, H = savEl.clientHeight;
      if (!W || !H || (W === lastW && H === lastH)) return;
      lastW = W; lastH = H;
      var narrow = W < 520;
      var m = { t: 18, r: 10, b: 30, l: 48 };
      var iw = W - m.l - m.r, ih = H - m.t - m.b;
      var x = function (mo) { return m.l + iw * mo / 12; };
      var y = function (v) { return m.t + ih * (1 - v / LOCAL_YR); };
      var s = '';

      s += '<defs><clipPath id="cSav"><rect x="0" y="0" height="' + H + '" width="' + (drawn ? W : 0) + '"/></clipPath></defs>';

      [0, 25000, 50000, 75000, 100000].forEach(function (v) {
        s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="' + (v ? '#EFF3FA' : '#D9E1EE') + '"/>';
        s += '<text class="ax" x="' + (m.l - 10) + '" y="' + (y(v) + 4) + '" text-anchor="end">$' + (v / 1000) + 'K</text>';
      });
      [0, 3, 6, 9, 12].forEach(function (mo) {
        var anchor = mo === 0 ? 'start' : mo === 12 ? 'end' : 'middle';
        s += '<text class="ax" x="' + x(mo) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">' + (mo ? mo + ' mo' : 'Start') + '</text>';
      });

      var x0 = x(0), x12 = x(12), y0 = y(0), yL = y(LOCAL_YR), yS = y(SS_YR);
      var am = narrow ? 7.5 : 8;
      var ay = (y(LOCAL_YR * am / 12) + y(SS_YR * am / 12)) / 2;
      s += '<g clip-path="url(#cSav)">' +
        '<polygon points="' + x0 + ',' + y0 + ' ' + x12 + ',' + yL + ' ' + x12 + ',' + yS + '" fill="#0F4CC4" fill-opacity=".08"/>' +
        '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x12 + '" y2="' + yL + '" stroke="#858FA5" stroke-width="2" stroke-linecap="round"/>' +
        '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x12 + '" y2="' + yS + '" stroke="#0F4CC4" stroke-width="2" stroke-linecap="round"/>' +
        '<text class="lbl-keep" x="' + x(am) + '" y="' + ay + '" text-anchor="middle">You keep ' + fmt(LOCAL_YR - SS_YR) + '</text>' +
        '<text class="lbl-keep-sub" x="' + x(am) + '" y="' + (ay + 17) + '" text-anchor="middle">in year one</text>' +
        '<text class="lbl" x="' + (x12 - 14) + '" y="' + (yL + 4) + '" text-anchor="end">Local ' + fmt(LOCAL_YR) + '</text>' +
        '<text class="lbl" x="' + (x12 - 14) + '" y="' + (yS + 22) + '" text-anchor="end">SSIO ' + fmt(SS_YR) + '</text>' +
        '<circle cx="' + x12 + '" cy="' + yL + '" r="5" fill="#858FA5" stroke="#fff" stroke-width="2"/>' +
        '<circle cx="' + x12 + '" cy="' + yS + '" r="5" fill="#0F4CC4" stroke="#fff" stroke-width="2"/>' +
        '</g>';

      // Hover layer
      s += '<line class="xh" y1="' + m.t + '" y2="' + y0 + '"/>' +
        '<circle class="hd hd-l" r="5" fill="#858FA5" stroke="#fff" stroke-width="2"/>' +
        '<circle class="hd hd-s" r="5" fill="#0F4CC4" stroke="#fff" stroke-width="2"/>' +
        '<rect class="hit" x="' + m.l + '" y="0" width="' + iw + '" height="' + H + '" fill="transparent"/>';

      savEl.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>';
      clipRect = savEl.querySelector('#cSav rect');

      var svg = savEl.firstChild;
      var xh = svg.querySelector('.xh'), hl = svg.querySelector('.hd-l'), hs = svg.querySelector('.hd-s');
      var hit = svg.querySelector('.hit');
      function move(clientX) {
        var r = svg.getBoundingClientRect();
        var mo = Math.round(Math.min(Math.max((clientX - r.left - m.l) / iw, 0), 1) * 12);
        var lv = LOCAL_YR * mo / 12, sv = SS_YR * mo / 12, px = x(mo);
        xh.setAttribute('x1', px); xh.setAttribute('x2', px);
        hl.setAttribute('cx', px); hl.setAttribute('cy', y(lv));
        hs.setAttribute('cx', px); hs.setAttribute('cy', y(sv));
        savEl.classList.add('hovering');
        tip.innerHTML = '<strong>' + (mo ? 'After ' + mo + ' month' + (mo > 1 ? 's' : '') : 'Day one') + '</strong>' +
          '<div class="tip-row"><span class="sw sw-local"></span>Local hire<b>' + fmt(lv) + '</b></div>' +
          '<div class="tip-row"><span class="sw sw-ss"></span>StaffingSolutions.io<b>' + fmt(sv) + '</b></div>' +
          '<div class="tip-row tip-keep">You keep<b>' + fmt(lv - sv) + '</b></div>';
        tip.classList.add('show');
        placeTip(r.left + px, r.top + y(lv));
      }
      function leave() { savEl.classList.remove('hovering'); hideTip(); }
      hit.addEventListener('mousemove', function (e) { move(e.clientX); });
      hit.addEventListener('mouseleave', leave);
      hit.addEventListener('touchstart', function (e) { move(e.touches[0].clientX); }, { passive: true });
      hit.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
      hit.addEventListener('touchend', leave);
    };

    // Draw the lines in from the left the first time the chart is seen
    var drawIn = function () {
      if (drawn) return;
      drawn = true;
      var start = null, dur = 1600;
      (function stepDraw(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        if (clipRect) clipRect.setAttribute('width', lastW * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(stepDraw);
      })(performance.now());
    };

    renderSavings();
    if ('ResizeObserver' in window) {
      new ResizeObserver(renderSavings).observe(savEl);
    } else {
      window.addEventListener('resize', renderSavings);
    }
    if ('IntersectionObserver' in window && !drawn) {
      var savIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { drawIn(); savIo.disconnect(); }
      }, { threshold: 0.35 });
      savIo.observe(savEl);
    } else {
      drawIn();
    }
  }

  /* ---------- Savings calculator ---------- */
  var RATE = 14, WEEKS = 52;
  var range = document.getElementById('localRange');
  var hours = 40;
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-AU'); };

  function calc() {
    var localFT = parseInt(range.value, 10);
    var local = localFT * (hours / 40);
    var yearHours = hours * WEEKS;
    var ss = RATE * yearHours;
    var keep = Math.max(local - ss, 0);
    var pct = local > 0 ? Math.round((keep / local) * 100) : 0;

    var fill = ((localFT - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--fill', fill + '%');

    document.getElementById('localOut').textContent = money(localFT);
    document.getElementById('resLocal').textContent = money(local);
    document.getElementById('localNote').textContent = hours === 40 ? 'full-time equivalent' : 'part-time · 50% of full-time';
    document.getElementById('resSS').textContent = money(ss);
    document.getElementById('resFormula').textContent = '$14/hr + GST · ' + hours + ' hrs/wk · ' + yearHours.toLocaleString('en-AU') + ' hrs/yr';
    document.getElementById('resKeep').textContent = money(keep);
    document.getElementById('resPct').textContent = pct + '% of the cost';
    document.getElementById('keepBtn').innerHTML = 'Keep my ' + money(keep) + ' <i class="bi bi-arrow-right"></i>';
  }

  if (range) {
    range.addEventListener('input', calc);

    document.querySelectorAll('#roleChips .role-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('#roleChips .role-chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        document.getElementById('resRole').textContent = chip.textContent;
      });
    });

    document.querySelectorAll('#hoursSeg button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#hoursSeg button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        hours = parseInt(btn.getAttribute('data-hours'), 10);
        calc();
      });
    });

    calc();
  }
})();
