(function () {
  "use strict";

  var SITE = window.SITE;
  var GLASS = { x: 455.1, y: 536.8, w: 189.8, h: 164.5 }; // CRT glass bounds in wallpaper pixels, traced from its edges (+1px bleed)
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var get = function (path) {
    return path.split(".").reduce(function (obj, key) { return obj == null ? obj : obj[key]; }, SITE);
  };

  /* ---------- Fill text from data.js ---------- */
  document.title = SITE.meta.title;
  $('meta[name="description"]').setAttribute("content", SITE.meta.description);

  $$("[data-text]").forEach(function (el) { el.textContent = get(el.dataset.text); });
  $$("[data-attr]").forEach(function (el) {
    el.dataset.attr.split(";").forEach(function (pair) {
      var parts = pair.split(":");
      el.setAttribute(parts[0], get(parts[1]));
    });
  });

  /* ---------- Keep the zoom origin and CRT overlay on the monitor ---------- */
  var wallImg = $(".wall__img");
  var scene = $(".wall__scene");

  function placeGlow() {
    var iw = wallImg.naturalWidth, ih = wallImg.naturalHeight;
    if (!iw || !ih) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    var scale = Math.max(vw / iw, vh / ih);
    var pos = getComputedStyle(wallImg).objectPosition.split(" ").map(parseFloat);
    var offX = (vw - iw * scale) * (pos[0] / 100);
    var offY = (vh - ih * scale) * (pos[1] / 100);
    var root = document.documentElement.style;

    // Scale against the file's own size (the glass bounds were measured at 1672px wide)
    var k = scale * iw / 1672;
    var sx = offX + GLASS.x * k, sy = offY + GLASS.y * k;
    root.setProperty("--sx", sx + "px");
    root.setProperty("--sy", sy + "px");
    root.setProperty("--sw", GLASS.w * k + "px");
    root.setProperty("--sh", GLASS.h * k + "px");
    root.setProperty("--bw", iw * scale + "px");
    root.setProperty("--bh", ih * scale + "px");
    root.setProperty("--bx", (offX - sx) + "px");
    root.setProperty("--by", (offY - sy) + "px");

    // Zoom target: scale the scene until the glass alone fills the view.
    // The glass is tilted with rounded corners, so aim at the rectangle that
    // fits fully inside it (95% x 78% of its box, centred slightly low).
    var sw = GLASS.w * k, sh = GLASS.h * k;
    var zs = Math.max(vw / (sw * 0.95), vh / (sh * 0.78)) * 1.04;
    var cx = sx + sw * 0.495, cy = sy + sh * 0.53;
    root.setProperty("--zs", zs);
    root.setProperty("--zx", (vw / 2 - zs * cx) + "px");
    root.setProperty("--zy", (vh / 2 - zs * cy) + "px");
  }

  if (wallImg.complete) placeGlow(); else wallImg.addEventListener("load", placeGlow);
  window.addEventListener("resize", placeGlow);

  /* ---------- CRT glitch: static, plus a burst every few seconds ---------- */
  var crt = $("#crt");
  var noise = $(".crt__noise", crt);
  var noiseCtx = noise.getContext("2d");
  var noiseFrame = noiseCtx.createImageData(noise.width, noise.height);
  var crtRunning = true;
  var burstTimer = null;
  var lastNoise = 0;
  var glitchLevel = 0; // 0 idle, 1 booting, 2 peak
  var BAND_COLOURS = ["rgba(255,70,140,0.55)", "rgba(70,210,255,0.5)", "rgba(255,190,120,0.6)", "rgba(255,255,255,0.45)"];

  function drawNoise() {
    var d = noiseFrame.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.random() * 255;
      d[i] = v; d[i + 1] = v * 0.94; d[i + 2] = v * 0.88; d[i + 3] = 255;
    }
    noiseCtx.putImageData(noiseFrame, 0, 0);

    // Horizontal colour bands, more of them at the peak
    for (var b = 0; b < glitchLevel * 4; b++) {
      noiseCtx.fillStyle = BAND_COLOURS[(Math.random() * BAND_COLOURS.length) | 0];
      noiseCtx.fillRect(0, Math.random() * noise.height, noise.width, 1 + Math.random() * 6);
    }
  }

  function noiseLoop(t) {
    if (!crtRunning) return;
    if (t - lastNoise > (glitchLevel ? 40 : 70)) { drawNoise(); lastNoise = t; }
    requestAnimationFrame(noiseLoop);
  }

  function scheduleBurst() {
    burstTimer = setTimeout(function () {
      crt.classList.add("is-glitch");
      setTimeout(function () {
        crt.classList.remove("is-glitch");
        if (burstTimer) scheduleBurst();
      }, 180 + Math.random() * 260);
    }, 1800 + Math.random() * 3200);
  }

  function stopBursts() {
    clearTimeout(burstTimer);
    burstTimer = null;
    crt.classList.remove("is-glitch");
  }

  if (reduceMotion.matches) {
    drawNoise(); // a still frame of static, no flicker or bursts
  } else {
    requestAnimationFrame(noiseLoop);
    scheduleBurst();
  }

  /* ---------- Intro → desktop ---------- */
  var intro = $("#intro");
  var desktop = $("#desktop");
  var body = document.body;

  // The greeting plays first; once it's typed out and has had a moment to be
  // read, About pulls out of the dock
  var ABOUT_PAUSE = 1500;
  var aboutTimer = null;

  function showDesktop() {
    desktop.hidden = false;
    void desktop.offsetWidth; // let the start state paint before transitioning
    desktop.classList.add("is-on");
    layoutIcons(); // the desktop has real sizes now
    playGreeting(function () {
      aboutTimer = setTimeout(openAbout, ABOUT_PAUSE);
    });
  }

  function openAbout() {
    aboutTimer = null;
    if (Object.keys(openWins).length) return; // they've started exploring
    var keepFocus = document.activeElement && document.activeElement !== document.body;
    openWindow("about");
    if (keepFocus) return;
    var heading = $(".win--about .win__heading");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function finishIntro() {
    intro.hidden = true;
    if (document.activeElement && intro.contains(document.activeElement)) document.activeElement.blur();
  }

  function turnOn() {
    $("#turn-on").disabled = true;

    if (reduceMotion.matches) {
      intro.classList.add("is-fading");
      crt.hidden = true;
      showDesktop();
      setTimeout(finishIntro, 400);
      return;
    }

    // 1. Zoom into the monitor until its glass fills the view
    placeGlow();
    stopBursts();
    body.classList.add("is-zooming");

    // 2. Once close, the screen glitches (clipped to the glass)
    setTimeout(function () {
      glitchLevel = 1;
      body.classList.add("is-glitching");
    }, 900);

    // 3. The glitch spikes, then settles into a calm lit screen
    setTimeout(function () {
      glitchLevel = 2;
      body.classList.add("is-glitch-peak");
    }, 1280);
    setTimeout(function () {
      body.classList.add("is-resolving");
    }, 1540);

    // 4. Hand over to the browser: a cover the same colour as the lit glass
    //    hides the zoom resetting, then fades as the window settles in.
    setTimeout(function () {
      body.classList.add("is-covered");
      crtRunning = false;
      glitchLevel = 0;
      scene.style.transition = "none";
      body.classList.remove("is-zooming", "is-glitching", "is-glitch-peak", "is-resolving");
      crt.hidden = true; // the wallpaper's own glow returns behind the browser
      intro.hidden = true;
      showDesktop();
      void scene.offsetWidth;
      scene.style.transition = "";
      body.classList.remove("is-covered"); // the cover fades out
    }, 1780);

    setTimeout(finishIntro, 2350);
  }

  $("#turn-on").addEventListener("click", turnOn);

  /* ---------- Helpers ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = text;
    return node;
  }

  /* ---------- Dock ----------
     Brand tools show their own app icon (assets/logos). About shows your
     photo, or a simple person glyph until there is one. If an icon can't
     load, the tile falls back to the app's initial. */
  var PERSON_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  var WINDOWS = SITE.windows;
  var dock = $("#dock");

  function initialTile(icon, label) {
    icon.innerHTML = "";
    icon.classList.add("is-initial");
    icon.appendChild(el("span", null, label.charAt(0)));
  }

  SITE.desktop.dock.forEach(function (item) {
    if (!item.label || !WINDOWS[item.id]) return; // hide items without a window
    var btn = el("button", "dock__item dock__item--" + item.id);
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    var icon = el("span", "dock__icon");
    var src = item.photo ? WINDOWS.about && WINDOWS.about.photo : item.logo;
    if (src) {
      icon.classList.add(item.photo ? "is-photo" : "is-logo");
      var img = el("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.addEventListener("error", function () {
        if (item.photo) { icon.className = "dock__icon"; icon.innerHTML = PERSON_ICON; }
        else initialTile(icon, item.label);
      });
      icon.appendChild(img);
    } else if (item.photo) {
      icon.innerHTML = PERSON_ICON;
    } else {
      initialTile(icon, item.label);
    }
    btn.appendChild(icon);
    btn.setAttribute("aria-label", item.label); // icon only; the name is still read out
    btn.addEventListener("click", function () { toggleWindow(item.id); });
    dock.appendChild(btn);
  });

  /* ---------- Window system ----------
     openWindow(id) opens (or brings forward) the window described in
     SITE.windows[id]. On desktop windows are draggable by their title bar
     and the one you touch comes to the front (desktop and tablet). */
  var layer = $("#windows");
  var openWins = {};   // id -> element
  var zTop = 10;
  var cascade = 0;

  var MIN_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // Window contents. Anything not listed here gets the default heading + text.
  var CONTENT = {
    about: function (body, w) {
      var top = el("div", "about");
      var photo = el("div", "about__photo");
      if (w.photo) {
        var img = el("img");
        img.src = w.photo;
        img.alt = w.photoAlt || "";
        photo.appendChild(img);
      } else {
        photo.classList.add("is-empty");
        photo.appendChild(el("span", "about__photo-note", w.photoPlaceholder));
      }
      top.appendChild(photo);
      var words = el("div", "about__words");
      if (w.name) words.appendChild(el("h3", "win__heading serif", w.name));
      (w.intro || []).filter(Boolean).forEach(function (line) {
        words.appendChild(el("p", "win__text about__line", line));
      });
      if (w.status) words.appendChild(el("p", "about__status", w.status));
      var ctas = el("div", "about__ctas");
      if (w.viewTabs && TOUR.steps.length) {
        var play = el("button", "btn btn--primary", w.viewTabs);
        play.type = "button";
        play.addEventListener("click", startTour);
        ctas.appendChild(play);
      }
      if (w.sayHi && WINDOWS.sayhi) {
        var hi = el("button", "btn btn--ghost", w.sayHi);
        hi.type = "button";
        hi.addEventListener("click", function () { openWindow("sayhi", hi); });
        ctas.appendChild(hi);
      }
      if (ctas.children.length) words.appendChild(ctas);
      top.appendChild(words);
      body.appendChild(top);
    },

    // Email, LinkedIn and resume; a row without a link shows its placeholder
    sayhi: function (body, w) {
      if (w.heading) body.appendChild(el("h3", "win__heading serif", w.heading));
      var list = el("ul", "sayhi");
      (w.rows || []).forEach(function (row) {
        if (!row.label) return;
        var li = el("li", "sayhi__row");
        li.appendChild(el("span", "sayhi__label", row.label));
        if (row.link) {
          var a = el("a", "sayhi__link", row.text || row.link.replace(/^mailto:/, ""));
          a.href = row.link;
          if (!/^mailto:/.test(row.link)) { a.target = "_blank"; a.rel = "noopener"; }
          li.appendChild(a);
        } else {
          li.appendChild(el("span", "sayhi__todo", row.placeholder || "TODO"));
        }
        list.appendChild(li);
      });
      body.appendChild(list);
    }
  };

  function defaultContent(body, w) {
    if (w.heading) body.appendChild(el("h3", "win__heading serif", w.heading));
    if (w.text) body.appendChild(el("p", "win__text", w.text));
    if (w.items) { // a list, each line with its own flag
      var list = el("ul", "flist");
      w.items.forEach(function (item) {
        if (!item.text) return;
        var li = el("li", "flist__item", item.text);
        if (item.flag) li.appendChild(el("span", "flag", item.flag));
        list.appendChild(li);
      });
      body.appendChild(list);
    }
  }

  /* ---------- Projects: one shared template ----------
     Sections in order (noticed, costs, made, missed, now), a "Growth lens"
     sticky note, and a Try button that hides while its link is empty. */
  var PROJ = SITE.projects;
  var PL = PROJ.labels;
  var ORDER = ["noticed", "costs", "made", "missed", "now"];

  function linkFor(key) { return (key && SITE.links[key]) || ""; }

  function sectionBlock(project, key) {
    var text = project.sections && project.sections[key];
    if (!text || !PL.sections[key]) return null;
    var box = el("section", "psec");
    var head = el("h4", "psec__label", PL.sections[key]);
    if ((project.notBuilt || []).indexOf(key) !== -1) head.appendChild(el("span", "flag", project.notBuiltLabel || PL.notBuilt));
    box.appendChild(head);
    box.appendChild(el("p", "psec__text", text));
    return box;
  }

  // An answer block with its own heading: { label, flag, text } where text
  // is one paragraph or a list of them
  function answerBlock(b) {
    if (!b || !b.label || !b.text) return null;
    var box = el("section", "psec");
    var head = el("h4", "psec__label", b.label);
    if (b.flag) head.appendChild(el("span", "flag", b.flag));
    box.appendChild(head);
    (Array.isArray(b.text) ? b.text : [b.text]).filter(Boolean).forEach(function (para) {
      if (Array.isArray(para)) box.appendChild(pointList("ul", para)); // bullet points
      else if (para.numbered) box.appendChild(pointList("ol", para.numbered));
      else box.appendChild(el("p", "psec__text", para));
    });
    return box;
  }

  // A bulleted or numbered list; an item can be { lead, text } with a bold lead
  function pointList(tag, items) {
    var list = el(tag, "psec__list");
    items.forEach(function (item) {
      var li = el("li");
      if (item.lead) {
        li.appendChild(el("strong", null, item.lead + ": "));
        li.appendChild(document.createTextNode(item.text || ""));
      } else {
        li.textContent = item;
      }
      list.appendChild(li);
    });
    return list;
  }

  function projectFooter(project) {
    var foot = el("div", "pfoot");
    if (project.growth && project.growth.text) {
      var note = el("aside", "growth");
      var top = el("p", "growth__label", project.growth.label || PL.growth);
      if (project.growth.todo) top.appendChild(el("span", "growth__todo", PL.todo));
      note.appendChild(top);
      if (project.growth.heading) note.appendChild(el("p", "growth__heading", project.growth.heading));
      [].concat(project.growth.text).forEach(function (para, i) {
        // Usually the note continues a set opening; "whole" notes are written in full
        var line = project.growth.whole || i ? para : PL.growthPrefix + " " + para;
        note.appendChild(el("p", "growth__text", line));
      });
      foot.appendChild(note);
    }
    var url = linkFor(project.link);
    if (url && project.tryLabel) {
      var a = el("a", "btn btn--primary pfoot__try", project.tryLabel + " ↗");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      foot.appendChild(a);
    }
    return foot;
  }

  /* ---- Claude window: past chats in a sidebar, one shown at a time ----
     Only Tasmia's prompts, notes and screenshots; no made-up AI replies.
     */
  CONTENT.claude = function (body) {
    var C = SITE.claudeChats;
    var L = C.labels;
    body.classList.add("cc");

    var side = el("nav", "cc__side");
    side.setAttribute("aria-label", C.pickLabel);
    var main = el("div", "cc__main");
    var rows = {};

    /* Thinking: a quiet status row where the reply will appear, with three
       pulsing dots and a message that fades to the next every ~1.7s. It's
       removed when the reply goes in. Timers are dropped on switching chats. */
    var pending = [];
    function later(fn, ms) { pending.push(setTimeout(fn, ms)); }
    function stopPending() { pending.forEach(clearTimeout); pending = []; }
    var THINK = (C.thinking || []).filter(Boolean);

    function thinking(where, ms, done) {
      if (!THINK.length) { done(); return; }
      var rowEl = el("div", "cc__thinking");
      rowEl.setAttribute("role", "status");
      var dots = el("span", "cc__dots");
      dots.setAttribute("aria-hidden", "true");
      dots.innerHTML = "<i></i><i></i><i></i>";
      var text = el("span", "cc__think-text", THINK[0]);
      rowEl.appendChild(dots);
      rowEl.appendChild(text);
      where.appendChild(rowEl);
      rowEl.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
      // The rest in a shuffled order, so it doesn't feel like a script
      var rest = THINK.slice(1).sort(function () { return Math.random() - 0.5; });
      var step = function () {
        if (!rest.length || !rowEl.isConnected) return;
        text.classList.add("is-out");
        later(function () {
          text.textContent = rest.shift();
          text.classList.remove("is-out");
          later(step, 1700);
        }, 240);
      };
      later(step, 1700);
      later(function () { rowEl.remove(); done(); }, ms);
    }

    function row(id, label, className) {
      var b = el("button", "cc__row" + (className ? " " + className : ""), label);
      b.type = "button";
      b.addEventListener("click", function () { select(id); });
      rows[id] = b;
      return b;
    }

    side.appendChild(row("new", C.newChat, "cc__row--new"));
    C.groups.forEach(function (g) {
      var ids = (g.chats || []).filter(function (id) { return C.chats[id] && C.chats[id].title; });
      if (!ids.length) return;
      if (g.label) side.appendChild(el("p", "cc__group", g.label));
      ids.forEach(function (id) {
        side.appendChild(row(id, C.chats[id].title));
      });
    });

    function bubble(text) { return el("div", "cbubble cbubble--you", text); }

    // Question chips: each one answers with its template sections, then goes away
    function askChips(c) {
      var thread = el("div", "cc__thread");
      thread.setAttribute("aria-live", "polite");
      var chips = el("div", "cc__chips");
      c.questions.forEach(function (item) {
        if (!item.q) return;
        var chip = el("button", "qchip", item.q);
        chip.type = "button";
        chip.addEventListener("click", function () {
          thread.appendChild(el("div", "cbubble cbubble--you cc__q", item.q));
          chip.remove();
          if (!chips.children.length) chips.remove();
          thinking(thread, 3000, function () {
            var reply = el("div", "cbubble cbubble--me");
            (item.sections || []).forEach(function (key) {
              var block = sectionBlock(c, key);
              if (block) reply.appendChild(block);
            });
            (item.blocks || []).forEach(function (b) {
              var block = answerBlock(b);
              if (block) reply.appendChild(block);
            });
            thread.appendChild(reply);
            reply.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
          });
        });
        chips.appendChild(chip);
      });
      main.appendChild(thread);
      main.appendChild(chips);
    }

    function select(id) {
      Object.keys(rows).forEach(function (key) {
        if (key === id) rows[key].setAttribute("aria-current", "true");
        else rows[key].removeAttribute("aria-current");
      });
      stopPending();
      main.innerHTML = "";
      main.scrollTop = 0;
      var c = C.chats[id];

      if (!c) { // New chat
        main.appendChild(el("h3", "cc__title serif", C.newChatHeading));
        if (C.newChatText) main.appendChild(el("p", "win__text", C.newChatText));
        return;
      }
      var title = el("h3", "cc__title serif", c.title);
      main.appendChild(title);

      if (c.kind === "built") {
        if (c.opening) main.appendChild(bubble(c.opening)); // the line the chat opens with
        if (c.prompt) {
          main.appendChild(bubble(c.prompt));
        }
        thinking(main, 1400, function () { builtReply(c); });
      }
    }

    // What a built chat shows once it has "thought": the card, then sections
    function builtReply(c) {
      var out = el("article", "cc__out");
      out.appendChild(el("p", "cc__out-label", c.outLabel || L.out));
      if (c.outIntro) out.appendChild(el("p", "psec__text cc__out-intro", c.outIntro));
      var shot = el("div", "cc__shot");
      if (c.image) {
        var img = el("img");
        img.src = c.image;
        img.alt = c.title;
        shot.appendChild(img);
      } else {
        shot.classList.add("is-empty");
        shot.appendChild(el("span", null, c.imagePlaceholder || L.imagePlaceholder));
      }
      out.appendChild(shot);
      if (c.note) out.appendChild(el("p", "psec__text", c.note));
      var url = linkFor(c.link);
      if (url) {
        var a = el("a", "btn btn--primary cc__try", L.tryIt + " ↗");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        out.appendChild(a);
      }
      main.appendChild(out);
      if (c.questions && c.questions.length) askChips(c);
      else {
        var secs = el("div", "cc__secs");
        if (c.blocks) { // its own headings
          c.blocks.forEach(function (b) {
            var block = answerBlock(b);
            if (block) secs.appendChild(block);
          });
        } else {
          ["missed", "now"].forEach(function (key) {
            var block = sectionBlock(c, key);
            if (block) secs.appendChild(block);
          });
        }
        main.appendChild(secs);
      }
      main.appendChild(projectFooter({ growth: c.growth }));
    }

    body.appendChild(side);
    body.appendChild(main);
    var first = C.groups[0] && C.groups[0].chats[0];
    select(C.chats[first] ? first : "new");
    return { select: select };
  };

  /* ---- ChatGPT window: "My questions, my answers" ----
     Tapping a question (or typing something close) shows it as a bubble, a
     short "thinking" line, then Tasmia's own answer typed out. */
  CONTENT.chatgpt = function (body) {
    var G = SITE.chatgpt;
    body.classList.add("gpt");
    var chips = (G.chips || []).filter(function (c) { return c.q; });

    body.appendChild(el("h3", "gpt__headline serif", G.headline));
    var thread = el("div", "gpt__thread");
    thread.setAttribute("aria-live", "polite");
    body.appendChild(thread);

    var form = el("form", "gpt__box");
    form.setAttribute("autocomplete", "off");
    var input = el("input", "gpt__input");
    input.type = "text";
    input.placeholder = G.placeholder;
    input.setAttribute("aria-label", G.inputLabel);
    var send = el("button", "gpt__send");
    send.type = "submit";
    send.setAttribute("aria-label", G.sendLabel);
    send.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    form.appendChild(input);
    form.appendChild(send);
    body.appendChild(form);

    var list = el("div", "gpt__chips");
    chips.forEach(function (c) {
      var b = el("button", "qchip", c.q);
      b.type = "button";
      b.addEventListener("click", function () { ask(c); });
      list.appendChild(b);
    });
    body.appendChild(list);

    var turn = 0;
    function words(text) {
      return text.toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; });
    }
    // A close match: most of the typed words appear in one of the questions
    function closest(text) {
      var typed = words(text);
      if (!typed.length) return null;
      var best = null, bestScore = 0;
      chips.forEach(function (c) {
        var hay = c.q.toLowerCase();
        var hits = typed.filter(function (w) { return hay.indexOf(w) !== -1; }).length;
        var score = hits / typed.length;
        if (score > bestScore) { best = c; bestScore = score; }
      });
      return bestScore >= 0.5 ? best : null;
    }

    function ask(c, typed) {
      var mine = ++turn;
      thread.appendChild(el("div", "cbubble cbubble--you", c ? c.q : typed));
      var think = el("div", "gpt__thinking", G.thinking);
      thread.appendChild(think);
      think.scrollIntoView({ block: "nearest" });
      setTimeout(function () {
        if (mine !== turn || !think.isConnected) return;
        think.remove();
        var reply = el("div", "cbubble cbubble--me gpt__reply");
        if (!c) reply.appendChild(el("strong", "gpt__none", G.noResults.title));
        var p = el("p", "gpt__answer");
        reply.appendChild(p);
        thread.appendChild(reply);
        var text = c ? c.a : G.noResults.text;
        if (reduceMotion.matches) { p.textContent = text; return; }
        var n = 0;
        (function type() {
          if (mine !== turn || !p.isConnected) return;
          p.textContent = text.slice(0, ++n);
          if (n < text.length) setTimeout(type, 18);
          else reply.scrollIntoView({ block: "nearest" });
        })();
      }, reduceMotion.matches ? 300 : 1000);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      var match = closest(text);
      ask(match, text);
    });
  };

  /* ---- Wispr Flow window: two pages as tabs ---- */
  CONTENT.wispr = function (body) {
    var W2 = SITE.wisprPages;
    body.classList.add("wsp");
    var tabs = el("div", "figwin__tabs wsp__tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", W2.tabsLabel);
    var panel = el("div", "wsp__panel");
    panel.setAttribute("role", "tabpanel");
    var stop = null;

    function show(page) {
      $$(".figwin__tab", tabs).forEach(function (t) { t.setAttribute("aria-selected", t.dataset.page === page.id ? "true" : "false"); });
      if (stop) stop();
      stop = null;
      panel.innerHTML = "";
      panel.appendChild(el("h3", "win__heading serif", page.title));
      if (page.kind === "meter") stop = meterPage(panel, page);
      else if (page.kind === "transcript") stop = transcriptPage(panel, page);
    }

    (W2.pages || []).forEach(function (page) {
      var t = el("button", "figwin__tab", page.tab);
      t.type = "button";
      t.dataset.page = page.id;
      t.setAttribute("role", "tab");
      t.addEventListener("click", function () { show(page); });
      tabs.appendChild(t);
    });
    body.appendChild(tabs);
    body.appendChild(panel);
    if (W2.pages && W2.pages.length) show(W2.pages[0]);
  };

  // A credit meter that drains as the visitor scrolls or taps the page
  function meterPage(panel, page) {
    var level = 100;
    var box = el("div", "meter");
    var top = el("div", "meter__top");
    top.appendChild(el("span", null, page.label));
    var pct = el("span", "meter__pct", "100%");
    top.appendChild(pct);
    var track = el("div", "meter__track");
    track.setAttribute("role", "meter");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", "100");
    track.setAttribute("aria-label", page.label);
    var fill = el("div", "meter__fill");
    track.appendChild(fill);
    box.appendChild(top);
    box.appendChild(track);
    var hint = el("p", "meter__hint", page.hint);
    if (page.hint) box.appendChild(hint);
    panel.appendChild(box);

    var done = el("div", "meter__done");
    done.hidden = true;
    if (page.done) done.appendChild(el("p", "meter__done-text serif", page.done));
    var dl = page.doneLink;
    if (dl && dl.label && WINDOWS[dl.window]) {
      var go = el("button", "btn btn--primary meter__go", dl.label);
      go.type = "button";
      go.addEventListener("click", function () {
        var w = openWindow(dl.window);
        if (w && w.api && w.api.select && dl.chat) w.api.select(dl.chat);
      });
      done.appendChild(go);
    }
    panel.appendChild(done);

    var lastWheel = 0;
    function drain(amount) {
      if (level <= 0) return;
      // With reduced motion the meter empties in one go
      level = reduceMotion.matches ? 0 : Math.max(0, level - amount);
      fill.style.width = level + "%";
      pct.textContent = Math.round(level) + "%";
      track.setAttribute("aria-valuenow", String(Math.round(level)));
      box.classList.toggle("is-low", level < 25);
      if (level <= 0) {
        box.classList.add("is-empty");
        hint.hidden = true;
        done.hidden = false;
      }
    }
    function onClick(e) { if (!e.target.closest("button, a")) drain(14); }
    function onScroll() {
      var now = Date.now();
      if (now - lastWheel < 60) return;
      lastWheel = now;
      drain(3);
    }
    panel.addEventListener("click", onClick);
    panel.addEventListener("wheel", onScroll, { passive: true });
    panel.addEventListener("touchmove", onScroll, { passive: true });
    return function () {
      panel.removeEventListener("click", onClick);
      panel.removeEventListener("wheel", onScroll);
      panel.removeEventListener("touchmove", onScroll);
    };
  }

  // A dictation box that types a prompt, then gets interrupted
  function transcriptPage(panel, page) {
    var timers = [];
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var box = el("div", "dictate");
    var head = el("div", "dictate__head");
    head.appendChild(el("span", "dictate__dot"));
    head.appendChild(el("span", null, page.label));
    box.appendChild(head);
    var text = el("p", "dictate__text");
    var said = el("span");
    var shout = el("span", "dictate__shout");
    var resumed = el("span"); // what I kept saying after the shout
    var caret = el("span", "dictate__caret");
    caret.setAttribute("aria-hidden", "true");
    text.appendChild(said);
    text.appendChild(shout);
    text.appendChild(resumed);
    text.appendChild(caret);
    box.appendChild(text);
    panel.appendChild(box);
    var caption = el("p", "dictate__caption serif", page.caption);
    caption.hidden = true;
    if (page.caption) panel.appendChild(caption);

    var prompt = page.prompt || "", interruption = page.interruption || "", after = page.after || "";
    // A prompt that already trails off ("…") doesn't need the dash before the shout
    var cut = /…$/.test(prompt) ? " " : "—";
    var tail = after ? " " + after : "";
    text.setAttribute("aria-label", [prompt, interruption, after].filter(Boolean).join(" "));
    function finish() { box.classList.add("is-done"); caption.hidden = false; }

    if (reduceMotion.matches) {
      said.textContent = prompt + (interruption ? cut : "");
      shout.textContent = interruption;
      resumed.textContent = tail;
      finish();
    } else {
      var i = 0;
      var typeAfter = function () {
        resumed.textContent = tail.slice(0, ++i);
        if (i < tail.length) later(typeAfter, 30);
        else later(finish, 400);
      };
      var typeShout = function () {
        shout.textContent = interruption.slice(0, ++i);
        if (i < interruption.length) later(typeShout, 26);
        else if (tail) later(function () { i = 0; typeAfter(); }, 320);
        else later(finish, 400);
      };
      var typeSaid = function () {
        said.textContent = prompt.slice(0, ++i);
        if (i < prompt.length) later(typeSaid, 30);
        else if (interruption) later(function () { said.textContent += cut; i = 0; box.classList.add("is-interrupted"); typeShout(); }, 260);
        else finish();
      };
      later(typeSaid, 400);
    }
    return function () { timers.forEach(clearTimeout); };
  }

  /* ---- Notion: the brain dump as a simple page (our own style) ---- */
  CONTENT.notion = function (body, w) {
    body.classList.add("npage");
    if (w.heading) body.appendChild(el("h3", "npage__heading serif", w.heading));
    var list = el("ul", "npage__list");
    (w.lines || []).filter(Boolean).forEach(function (line) { list.appendChild(el("li", null, line)); });
    body.appendChild(list);
    if (w.outro) body.appendChild(el("p", "npage__outro", w.outro));
    if (w.sayHi && WINDOWS.sayhi) {
      var hi = el("button", "btn btn--ghost npage__hi", w.sayHi);
      hi.type = "button";
      hi.addEventListener("click", function () { openWindow("sayhi", hi); });
      body.appendChild(hi);
    }
  };

  /* ---- Figma: boards as tabs, each a pan/zoom canvas plus the template ---- */
  CONTENT.figma = function (body, w) {
    body.classList.add("figwin");
    var boards = (w.boards || []).filter(function (id) { return PROJ[id] && PROJ[id].board; });
    var tabs = el("div", "figwin__tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", PL.boardsLabel);
    var panel = el("div", "figwin__panel");
    panel.setAttribute("role", "tabpanel");
    var stopCanvas = null;

    function show(id) {
      $$(".figwin__tab", tabs).forEach(function (t) { t.setAttribute("aria-selected", t.dataset.board === id ? "true" : "false"); });
      if (stopCanvas) stopCanvas();
      panel.innerHTML = "";
      panel.setAttribute("aria-label", PROJ[id].board);
      stopCanvas = renderBoard(panel, PROJ[id]);
    }

    boards.forEach(function (id) {
      var tab = el("button", "figwin__tab", PROJ[id].board);
      tab.type = "button";
      tab.dataset.board = id;
      tab.setAttribute("role", "tab");
      tab.addEventListener("click", function () { show(id); });
      tabs.appendChild(tab);
    });
    body.appendChild(tabs);
    body.appendChild(panel);
    if (boards.length) show(boards[0]);
  };

  function renderBoard(panel, p) {
    var board = el("div", "board");
    var canvas = makeCanvas(p.canvas || []);
    board.appendChild(canvas.el);
    var side = el("div", "board__side");
    if (p.notice) side.appendChild(el("p", "board__notice", p.notice));
    if (p.blocks) { // its own headings, in its own order
      p.blocks.forEach(function (b) {
        var block = answerBlock(b);
        if (block) side.appendChild(block);
      });
    } else {
      ORDER.forEach(function (key) {
        var block = sectionBlock(p, key);
        if (block) side.appendChild(block);
      });
    }
    side.appendChild(projectFooter(p));
    board.appendChild(side);
    panel.appendChild(board);
    return canvas.stop;
  }

  /* ---- The canvas: drag to pan, wheel or pinch to zoom, pins open notes ---- */
  function makeCanvas(rows) {
    var MIN = 0.25, MAX = 2.5;
    var wrap = el("div", "canvas");
    var view = el("div", "canvas__view");
    view.tabIndex = 0;
    view.setAttribute("aria-label", PL.canvasLabel);
    var world = el("div", "canvas__world");
    view.appendChild(world);
    var pinCount = 0; // pins are numbered across the whole board
    wrap.appendChild(view);

    rows.forEach(function (row) {
      var r = el("div", "crow");
      var title = el("p", "crow__title", row.title);
      if (row.notBuilt) title.appendChild(el("span", "flag", PL.notBuilt));
      r.appendChild(title);
      if (row.subtitle) r.appendChild(el("p", "crow__sub", row.subtitle));
      var frames = el("div", "crow__frames" + (row.wrap ? " crow__frames--wrap" : ""));
      (row.frames || []).forEach(function (f) {
        var fig = el("figure", "cframe" + (f.free ? " cframe--free" : ""));
        var screen = el("div", "cframe__screen");
        if (f.image) {
          var img = el("img");
          img.src = f.image;
          img.alt = f.label || "";
          img.draggable = false;
          screen.appendChild(img);
        } else {
          screen.classList.add("is-empty");
          screen.appendChild(el("span", "cframe__label", f.label));
        }
        (f.pins || []).forEach(function (pin) {
          if (!pin.note && !pin.title) return;
          var b = el("button", "pin", String(++pinCount));
          b.type = "button";
          b.style.left = pin.x + "%";
          b.style.top = pin.y + "%";
          b.setAttribute("aria-label", pin.title || pin.note);
          b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
          b.addEventListener("click", function (e) { e.stopPropagation(); openNote(b, pin); });
          screen.appendChild(b);
        });
        fig.appendChild(screen);
        if (f.caption) fig.appendChild(el("figcaption", "cframe__caption", f.caption));
        frames.appendChild(fig);
      });
      r.appendChild(frames);
      world.appendChild(r);
    });

    // Zoom control
    var ctrl = el("div", "canvas__zoom");
    var minus = el("button", "canvas__btn", "−");
    var pct = el("span", "canvas__pct", "100%");
    var plus = el("button", "canvas__btn", "+");
    var fitBtn = el("button", "canvas__btn canvas__fit");
    fitBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    [[minus, PL.zoomOut], [plus, PL.zoomIn], [fitBtn, PL.fit]].forEach(function (pair) {
      pair[0].type = "button";
      pair[0].setAttribute("aria-label", pair[1]);
    });
    ctrl.appendChild(minus);
    ctrl.appendChild(pct);
    ctrl.appendChild(plus);
    ctrl.appendChild(fitBtn);
    wrap.appendChild(ctrl);

    var note = el("div", "pnote");
    note.hidden = true;
    note.setAttribute("role", "dialog");
    wrap.appendChild(note);

    var cam = { x: 0, y: 0, z: 1 };
    var touched = false; // stop auto-fitting once the visitor moves the board

    function apply(animate) {
      world.classList.toggle("is-animating", !!animate);
      world.style.transform = "translate(" + cam.x + "px," + cam.y + "px) scale(" + cam.z + ")";
      world.style.setProperty("--inv", 1 / cam.z);
      pct.textContent = Math.round(cam.z * 100) + "%";
    }

    function zoomAt(factor, cx, cy, animate) {
      var z = clamp(cam.z * factor, MIN, MAX);
      cam.x = cx - (cx - cam.x) * (z / cam.z);
      cam.y = cy - (cy - cam.y) * (z / cam.z);
      cam.z = z;
      apply(animate);
    }

    function fit(animate) {
      var vw = view.clientWidth, vh = view.clientHeight;
      var ww = world.offsetWidth, wh = world.offsetHeight;
      if (!vw || !ww) return;
      // Show the whole board; on narrow screens fit the width and scroll down instead
      var z = vw < 500 ? vw / ww : Math.min(vw / ww, vh / wh);
      cam.z = clamp(z * 0.94, MIN, 1);
      cam.x = (vw - ww * cam.z) / 2;
      cam.y = Math.max(12, (vh - wh * cam.z) / 2);
      apply(animate);
    }

    function center() { return { x: view.clientWidth / 2, y: view.clientHeight / 2 }; }
    minus.addEventListener("click", function () { var c = center(); touched = true; zoomAt(1 / 1.25, c.x, c.y, true); });
    plus.addEventListener("click", function () { var c = center(); touched = true; zoomAt(1.25, c.x, c.y, true); });
    fitBtn.addEventListener("click", function () { touched = true; fit(true); });

    // Drag to pan; two fingers pinch to zoom
    var pointers = {};
    var last = null;
    function snapshot() {
      var ids = Object.keys(pointers);
      var a = pointers[ids[0]], b = pointers[ids[1]];
      if (ids.length === 1) return { x: a.x, y: a.y, d: 0 };
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) };
    }
    view.addEventListener("pointerdown", function (e) {
      closeNote();
      var rect = view.getBoundingClientRect();
      pointers[e.pointerId] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      try { view.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
      last = snapshot();
      touched = true;
      view.classList.add("is-panning");
    });
    view.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      var rect = view.getBoundingClientRect();
      pointers[e.pointerId] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      var now = snapshot();
      if (last.d && now.d) zoomAt(now.d / last.d, now.x, now.y);
      cam.x += now.x - last.x;
      cam.y += now.y - last.y;
      apply();
      last = now;
    });
    function lift(e) {
      delete pointers[e.pointerId];
      last = Object.keys(pointers).length ? snapshot() : null;
      if (!last) view.classList.remove("is-panning");
    }
    view.addEventListener("pointerup", lift);
    view.addEventListener("pointercancel", lift);

    // Touchpad pinch arrives as small wheel steps with ctrlKey set, so it gets a
    // stronger zoom; a mouse wheel zooms in clicks; two-finger scroll pans.
    view.addEventListener("wheel", function (e) {
      e.preventDefault();
      closeNote();
      touched = true;
      var rect = view.getBoundingClientRect();
      var unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? view.clientHeight : 1; // lines or pages to px (3 lines ≈ one wheel click)
      var dx = e.deltaX * unit, dy = e.deltaY * unit;
      var mouseWheel = e.deltaMode !== 0 || (dx === 0 && Math.abs(dy) >= 50 && Number.isInteger(dy));
      if (e.ctrlKey) zoomAt(Math.exp(-dy * 0.012), e.clientX - rect.left, e.clientY - rect.top);
      else if (mouseWheel) zoomAt(Math.exp(-dy * 0.0025), e.clientX - rect.left, e.clientY - rect.top);
      else { cam.x -= dx; cam.y -= dy; apply(); }
    }, { passive: false });

    // Keyboard: arrows pan, + and - zoom
    view.addEventListener("keydown", function (e) {
      var step = 40, c = center();
      if (e.key === "ArrowLeft") cam.x += step;
      else if (e.key === "ArrowRight") cam.x -= step;
      else if (e.key === "ArrowUp") cam.y += step;
      else if (e.key === "ArrowDown") cam.y -= step;
      else if (e.key === "+" || e.key === "=") { zoomAt(1.25, c.x, c.y, true); return; }
      else if (e.key === "-") { zoomAt(1 / 1.25, c.x, c.y, true); return; }
      else return;
      e.preventDefault();
      touched = true;
      apply();
    });

    // Pin notes
    function openNote(pinEl, pin) {
      note.innerHTML = "";
      if (pin.title) note.appendChild(el("p", "pnote__title", pin.title));
      if (pin.note) note.appendChild(el("p", "pnote__text", pin.note));
      var x = el("button", "pnote__close");
      x.type = "button";
      x.setAttribute("aria-label", PL.closeNote);
      x.innerHTML = CLOSE_ICON;
      x.addEventListener("click", function () { closeNote(); pinEl.focus({ preventScroll: true }); });
      note.appendChild(x);
      note.hidden = false;
      var w = wrap.getBoundingClientRect(), r = pinEl.getBoundingClientRect();
      var left = r.right - w.left + 8, top = r.top - w.top - 8;
      if (left + note.offsetWidth > w.width - 8) left = r.left - w.left - note.offsetWidth - 8;
      note.style.left = clamp(left, 8, w.width - note.offsetWidth - 8) + "px";
      note.style.top = clamp(top, 8, w.height - note.offsetHeight - 8) + "px";
      x.focus({ preventScroll: true });
    }
    function closeNote() { note.hidden = true; }
    note.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); closeNote(); view.focus({ preventScroll: true }); }
    });

    // Fit once the board has a size, and again on resize until it's been moved
    var ro = new ResizeObserver(function () { if (!touched) fit(); });
    ro.observe(view);
    setTimeout(function () { if (!touched) fit(); }, 60); // in case no resize is reported

    return { el: wrap, stop: function () { ro.disconnect(); } };
  }

  // Dock icon: opens the window, brings it forward, or tucks it away
  // (minimizes) if it's already in front. A minimized window comes back out.
  function toggleWindow(id) {
    var w = openWins[id];
    if (!w) openWindow(id);
    else if (w.minimized) restoreWindow(id);
    else if (w.classList.contains("is-front")) minimizeWindow(id);
    else focusWindow(id);
  }

  function openWindow(id, from) {
    var data = WINDOWS[id];
    if (!data) return null;
    if (aboutTimer) { clearTimeout(aboutTimer); aboutTimer = null; } // they opened something first
    if (openWins[id]) { focusWindow(id); return openWins[id]; }

    var w = el("section", "win win--" + id);
    w.setAttribute("role", "dialog");
    w.setAttribute("aria-label", data.title || id);
    var bar = el("div", "win__bar");
    var dots = el("span", "win__dots");
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<i></i><i></i><i></i>";
    bar.appendChild(dots);
    bar.appendChild(el("span", "win__title", data.title));
    var min = el("button", "win__min");
    min.type = "button";
    min.setAttribute("aria-label", SITE.desktop.minimizeWindow + ": " + (data.title || id));
    min.innerHTML = MIN_ICON;
    min.addEventListener("click", function () { minimizeWindow(id); });
    bar.appendChild(min);
    var close = el("button", "win__close");
    close.type = "button";
    close.setAttribute("aria-label", SITE.desktop.closeWindow + ": " + (data.title || id));
    close.innerHTML = CLOSE_ICON;
    close.addEventListener("click", function () {
      closeWindow(id);
    });
    bar.appendChild(close);
    w.appendChild(bar);

    var body = el("div", "win__body");
    w.api = (CONTENT[id] || defaultContent)(body, data) || {};
    w.appendChild(body);
    tabFooter(w, id);
    layer.appendChild(w);
    openWins[id] = w;
    updateBlur();

    placeWindow(w, id);
    makeDraggable(w, bar);
    w.addEventListener("pointerdown", function () { focusWindow(id); });
    w.addEventListener("focusin", function () { focusWindow(id); });

    focusWindow(id);
    w.origin = from || $(".dock__item--" + id); // where it comes from, and goes back to
    if (!genie(w, w.origin, false)) {
      void w.offsetWidth; // start state paints before the open animation
      w.classList.add("is-open");
    }
    setPressed(id, true);
    return w;
  }

  /* Pull a window out of (or tuck it back into) the icon that opened it.
     From the dock it's a real genie (genieWarp, below). From anything else
     (a desktop icon, a button) it grows out of / shrinks into that spot.
     Returns false when there's nothing to animate from (or motion is
     reduced), so the plain fade is used instead. */
  function genie(w, origin, closing, done) {
    if (reduceMotion.matches || !origin || !w.animate || !origin.offsetParent) return false;
    if (origin.closest(".dock")) return genieWarp(w, origin, closing, done);
    var o = origin.getBoundingClientRect();
    var r = w.getBoundingClientRect();
    if (!r.width || !o.width) return false;
    var dx = (o.left + o.width / 2) - (r.left + r.width / 2);
    var dy = (o.top + o.height / 2) - (r.top + r.height / 2);
    var sx = Math.max(o.width / r.width, 0.04), sy = Math.max(o.height / r.height, 0.04);
    var frames = [
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")", opacity: 0 },
      { transform: "translate(" + dx * 0.55 + "px," + dy * 0.35 + "px) scale(" + Math.max(sx, 0.3) + "," + 0.62 + ")", opacity: 1, offset: 0.45 },
      { transform: "none", opacity: 1 }
    ];
    if (closing) frames.reverse().forEach(function (f, i) { if ("offset" in f) f.offset = 0.55; });
    w.classList.add("is-open");
    w.style.transition = "none"; // the animation does the moving
    var anim = w.animate(frames, {
      duration: closing ? 380 : 560,
      easing: closing ? "cubic-bezier(0.5, 0, 0.75, 0.4)" : "cubic-bezier(0.2, 0.75, 0.25, 1)",
      fill: closing ? "forwards" : "none"
    });
    anim.onfinish = function () {
      w.style.transition = "";
      if (done) done();
    };
    return true;
  }

  /* The genie: during the animation the window is drawn as thin horizontal
     strips (copies of it, each clipped once to its own band). Every frame,
     each strip gets a perspective transform that maps its band onto a
     four-cornered shape on the curve, so neighbouring strips meet edge to
     edge and only transforms change (smooth: nothing repaints). The bottom
     narrows towards the dock icon first and the rest pours down after it,
     like the Mac's genie. The real window is hidden meanwhile. */
  var GENIE_STRIPS = 28;

  // CSS matrix3d that maps the rectangle (0, y0)-(w, y1) onto the corners
  // tl, tr, br, bl (each [x, y]), as a projective (perspective) transform
  function quadMatrix(w, y0, y1, tl, tr, br, bl) {
    var dx1 = tr[0] - br[0], dx2 = bl[0] - br[0], dx3 = tl[0] - tr[0] + br[0] - bl[0];
    var dy1 = tr[1] - br[1], dy2 = bl[1] - br[1], dy3 = tl[1] - tr[1] + br[1] - bl[1];
    var den = dx1 * dy2 - dx2 * dy1 || 1e-6;
    var g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
    var a = tr[0] - tl[0] + g * tr[0], b = bl[0] - tl[0] + h * bl[0], c = tl[0];
    var d = tr[1] - tl[1] + g * tr[1], e = bl[1] - tl[1] + h * bl[1], f = tl[1];
    // That maps the unit square; first squash the band into it
    var bh = y1 - y0;
    var m11 = a / w, m12 = b / bh, m13 = c - b * y0 / bh;
    var m21 = d / w, m22 = e / bh, m23 = f - e * y0 / bh;
    var m31 = g / w, m32 = h / bh, m33 = 1 - h * y0 / bh;
    return "matrix3d(" + [m11, m21, 0, m31, m12, m22, 0, m32, 0, 0, 1, 0, m13, m23, 0, m33].join(",") + ")";
  }

  function genieWarp(w, icon, into, done) {
    if (w.genieStop) w.genieStop(); // a quick minimize-then-restore: the new one wins
    var W = w.getBoundingClientRect(), I = icon.getBoundingClientRect();
    if (!W.width || !W.height) return false;
    var ww = W.width, wh = W.height;
    var holder = el("div", "genie");
    holder.setAttribute("aria-hidden", "true");
    // Keep each copy's scroll positions so the strips match the window
    var scrolled = $$("*", w).map(function (n) { return [n.scrollTop, n.scrollLeft]; });
    var strips = [];
    for (var i = 0; i < GENIE_STRIPS; i++) {
      var c = w.cloneNode(true);
      c.classList.add("genie__strip");
      c.classList.remove("is-minimized");
      c.style.cssText = "left:" + W.left + "px;top:" + W.top + "px;width:" + ww + "px;height:" + wh + "px;";
      var y0 = wh * i / GENIE_STRIPS, y1 = wh * (i + 1) / GENIE_STRIPS;
      // Cut once; each band reaches a hair into the next one (drawn on top
      // of it), so no hairline seams show
      c.style.clipPath = "inset(" + y0 + "px 0 " + Math.max(0, wh - y1 - 0.75) + "px 0)";
      holder.appendChild(c);
      strips.push({ el: c, y0: y0, y1: y1 });
    }
    layer.appendChild(holder);
    strips.forEach(function (s) {
      $$("*", s.el).forEach(function (n, k) {
        if (scrolled[k] && (scrolled[k][0] || scrolled[k][1])) { n.scrollTop = scrolled[k][0]; n.scrollLeft = scrolled[k][1]; }
      });
    });
    w.classList.add("is-open");
    w.style.transition = "none";
    w.style.visibility = "hidden";

    var clamp01 = function (n) { return Math.max(0, Math.min(1, n)); };
    var smooth = function (n) { return n * n * (3 - 2 * n); };
    var inOut = function (n) { return n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2; };
    var lerp = function (a, b, n) { return a + (b - a) * n; };

    // p = 0: the window as it is; p = 1: fully inside the dock icon
    function draw(p) {
      var squeeze = smooth(clamp01(p / 0.5));   // the sides bend in
      var slide = clamp01((p - 0.22) / 0.78);   // then it pours into the icon
      var top = lerp(W.top, I.top, inOut(slide));
      var bottom = lerp(W.bottom, I.bottom, inOut(clamp01(slide * 1.3)));
      var span = Math.max(1, I.top - W.top);
      var fade = p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
      // How far an edge at screen height y has bent towards the icon
      var edge = function (y) {
        var k = squeeze * smooth(clamp01((y - W.top) / span));
        return [lerp(W.left, I.left, k), lerp(W.right, I.right, k)];
      };
      strips.forEach(function (s) {
        var ya = lerp(top, bottom, s.y0 / wh), yb = Math.max(lerp(top, bottom, s.y1 / wh), ya + 0.01);
        var t = edge(ya), b = edge(yb);
        // Corners relative to the copy's own top-left (its transform origin)
        var ox = W.left, oy = W.top;
        s.el.style.transform = quadMatrix(ww, s.y0, s.y1,
          [t[0] - ox, ya - oy], [Math.max(t[1], t[0] + 0.5) - ox, ya - oy],
          [Math.max(b[1], b[0] + 0.5) - ox, yb - oy], [b[0] - ox, yb - oy]);
        s.el.style.opacity = fade;
      });
    }
    w.genieDraw = draw; // lets a test pause on any frame

    var duration = into ? 560 : 520;
    var start = null, stopped = false;
    var finish = function () {
      holder.remove();
      delete w.genieDraw;
      delete w.genieStop;
      w.style.transition = "";
      w.style.visibility = "";
    };
    w.genieStop = function () { stopped = true; finish(); };
    draw(into ? 0 : 1);
    requestAnimationFrame(function step(now) {
      if (stopped) return;
      if (start === null) start = now;
      var t = clamp01((now - start) / duration);
      draw(into ? t : 1 - t);
      if (t < 1) { requestAnimationFrame(step); return; }
      finish();
      if (done) done();
    });
    return true;
  }

  /* ---- Minimize: tuck a window into its dock icon; the icon brings it back ---- */
  function minimizeWindow(id) {
    var w = openWins[id];
    if (!w || w.minimized) return;
    var icon = $(".dock__item--" + id);
    var hadFocus = w.contains(document.activeElement);
    if (hadFocus) document.activeElement.blur();
    w.minimized = true;
    w.classList.remove("is-front");
    w.setAttribute("aria-hidden", "true");
    var hide = function () { w.classList.add("is-minimized"); w.style.visibility = ""; };
    if (!icon || !genie(w, icon, true, hide)) hide();
    updateBlur();
    frontmost(hadFocus, icon);
  }

  function restoreWindow(id) {
    var w = openWins[id];
    if (!w || !w.minimized) return;
    w.minimized = false;
    w.classList.remove("is-minimized");
    w.removeAttribute("aria-hidden");
    focusWindow(id);
    updateBlur();
    genie(w, $(".dock__item--" + id), false);
  }

  // After a window goes away, the next one down comes to the front
  function frontmost(moveFocus, fallback) {
    var rest = Object.keys(openWins).filter(function (k) { return !openWins[k].minimized; })
      .sort(function (a, b) { return openWins[b].style.zIndex - openWins[a].style.zIndex; });
    if (rest.length) {
      focusWindow(rest[0]);
      if (moveFocus) openWins[rest[0]].querySelector(".win__close").focus({ preventScroll: true });
    } else if (moveFocus) {
      (fallback || $(".dock__item")).focus({ preventScroll: true });
    }
  }

  // About sits in the middle of the desktop; later windows cascade
  function placeWindow(w, id) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var width = w.offsetWidth, height = w.offsetHeight;
    var left, top;
    if (id === "about" || width > 700) {
      // Big windows sit centred between the menu bar (42px) and the dock (~100px)
      left = Math.round((vw - width) / 2);
      top = Math.round(42 + (vh - 42 - 100 - height) / 2);
    } else {
      cascade = (cascade + 1) % 6;
      left = Math.round(vw * 0.5 - width * 0.38 + cascade * 26);
      top = Math.round(Math.max(64, vh * 0.2) + cascade * 22);
    }
    w.style.left = clamp(left, 8, vw - width - 8) + "px";
    w.style.top = clamp(top, 42, vh - height - 120) + "px";
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  // The wallpaper softens while the About window is open
  function updateBlur() {
    desktop.classList.toggle("is-focus", !!openWins.about && !openWins.about.minimized);
  }

  function focusWindow(id) {
    var w = openWins[id];
    if (!w || w.minimized || w.classList.contains("is-front")) return;
    Object.keys(openWins).forEach(function (key) { openWins[key].classList.remove("is-front"); });
    w.style.zIndex = ++zTop;
    w.classList.add("is-front");
  }

  function closeWindow(id) {
    var w = openWins[id];
    if (!w) return;
    var hadFocus = w.contains(document.activeElement);
    delete openWins[id];
    // Tuck it back where it came from; it's already gone as far as the desktop knows
    w.style.pointerEvents = "none";
    w.setAttribute("aria-hidden", "true");
    if (hadFocus) document.activeElement.blur();
    // A minimized window is already out of sight: just remove it
    if (w.minimized || !genie(w, w.origin || $(".dock__item--" + id), true, function () { w.remove(); })) w.remove();
    updateBlur();
    setPressed(id, false);
    frontmost(hadFocus, $(".dock__item--" + id));
  }

  function setPressed(id, on) {
    var btn = $(".dock__item--" + id);
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function makeDraggable(w, handle) {
    var start = null;
    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      start = { x: e.clientX, y: e.clientY, left: w.offsetLeft, top: w.offsetTop };
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
      w.classList.add("is-dragging");
    });
    handle.addEventListener("pointermove", function (e) {
      if (!start) return;
      w.style.left = clamp(start.left + e.clientX - start.x, 8 - w.offsetWidth / 2, window.innerWidth - w.offsetWidth / 2) + "px";
      w.style.top = clamp(start.top + e.clientY - start.y, 42, window.innerHeight - 60) + "px";
    });
    var stop = function () { start = null; w.classList.remove("is-dragging"); };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var front = layer.querySelector(".win.is-front");
    if (front) front.querySelector(".win__close").click();
  });

  /* ---------- Open tabs: Figma, Claude, Wispr, ChatGPT, Notion ----------
     Each of these windows has a footer (Tab · n of 5, Close tab, Next), however
     it was opened. "View Open Tabs" in About starts at the first one. */
  var TOUR = SITE.tour;
  TOUR.steps = TOUR.steps.filter(function (id) { return WINDOWS[id]; });

  function startTour() {
    closeWindow("about"); // the tabs take over from the About window
    openTab(TOUR.steps[0]);
  }

  function openTab(id) {
    var w = openWindow(id);
    var next = w && w.querySelector(".win__tour-next");
    if (next) next.focus({ preventScroll: true });
  }

  function tabFooter(w, id) {
    var n = TOUR.steps.indexOf(id);
    if (n === -1) return;
    // Previous on the left; Close tab and Next on the right
    var foot = el("div", "win__tour");
    var left = el("div", "win__tour-side");
    if (n > 0) {
      var prev = el("button", "btn btn--ghost win__tour-prev", TOUR.previous);
      prev.type = "button";
      prev.addEventListener("click", function () {
        closeWindow(id);
        openTab(TOUR.steps[n - 1]);
      });
      left.appendChild(prev);
    }
    foot.appendChild(left);
    var right = el("div", "win__tour-side win__tour-side--end");
    var end = el("button", "win__tour-end", TOUR.end);
    end.type = "button";
    end.addEventListener("click", function () { closeWindow(id); });
    var last = n === TOUR.steps.length - 1;
    var next = el("button", "btn btn--primary win__tour-next", last ? TOUR.finish : TOUR.next);
    next.type = "button";
    next.addEventListener("click", function () {
      closeWindow(id);
      if (!last) { openTab(TOUR.steps[n + 1]); return; }
      // Finish ends on Say Hi!, so the last stop is a way to get in touch
      if (WINDOWS.sayhi) openWindow("sayhi");
    });
    right.appendChild(end);
    right.appendChild(next);
    foot.appendChild(right);
    w.appendChild(foot);
  }
  /* ---- Desktop icons ---- */
  var DESK_ICONS = {
    folder: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2.2h7A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" fill="#f7c9a8" stroke="#c98a62" stroke-width="1.2"/><path d="M3 10h18" stroke="#c98a62" stroke-width="1.2"/>',
    pdf: '<path d="M6 3h8.5L19 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fffaf2" stroke="#8f92a4" stroke-width="1.2"/><path d="M14.5 3v4.5H19" fill="none" stroke="#8f92a4" stroke-width="1.2"/><rect x="5.5" y="12.5" width="10" height="5" rx="1.2" fill="#e8705a"/><text x="10.5" y="16.3" font-size="3.6" font-family="Inter, sans-serif" font-weight="700" text-anchor="middle" fill="#fff">PDF</text>',
    txt: '<path d="M6 3h8.5L19 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fffdf6" stroke="#8f92a4" stroke-width="1.2"/><path d="M14.5 3v4.5H19" fill="none" stroke="#8f92a4" stroke-width="1.2"/><path d="M7.5 11h8M7.5 14h8M7.5 17h5" stroke="#9aa0b8" stroke-width="1.2" stroke-linecap="round"/>'
  };
  var noHover = window.matchMedia("(hover: none)");
  var iconBar = $("#desk-icons");

  SITE.desktopIcons.items.forEach(function (item) {
    if (!item.label || (!item.window && !item.link)) return;
    if (item.window && !WINDOWS[item.window]) return;

    var btn = el("button", "desk-icon");
    btn.type = "button";
    var glyph = '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">' + (DESK_ICONS[item.kind] || DESK_ICONS.folder) + '</svg>';
    if (item.image) {
      var pic = el("img", "desk-icon__img");
      pic.src = item.image;
      pic.alt = "";
      pic.draggable = false;
      pic.addEventListener("error", function () { pic.outerHTML = glyph; }); // missing file: drawn icon
      btn.appendChild(pic);
    } else {
      btn.innerHTML = glyph;
    }
    btn.appendChild(el("span", "desk-icon__label", item.label));

    var openIt = function () {
      if (item.link) window.open(item.link, "_blank", "noopener");
      else openWindow(item.window, btn);
    };
    // Double-click on desktop; a single tap on touch screens or Enter/Space
    btn.dataset.id = item.id;
    btn.addEventListener("click", function (e) {
      if (e.detail === 0 || e.pointerType === "touch" || e.pointerType === "pen" || noHover.matches) { openIt(); return; }
      $$(".desk-icon.is-selected").forEach(function (b) { b.classList.remove("is-selected"); });
      btn.classList.add("is-selected");
    });
    btn.addEventListener("dblclick", openIt);

    // A file in this site only shows if it's really there (links elsewhere always show)
    if (item.link && !/^https?:/.test(item.link)) {
      btn.hidden = true;
      fetch(item.link, { method: "HEAD" })
        .then(function (r) { if (r.ok) { btn.hidden = false; layoutIcons(); } })
        .catch(function () {});
    }
    iconBar.appendChild(btn);
  });

  /* ---- Sticky note: bullet points, at the top right ---- */
  var NOTE = SITE.stickyNote;
  var sticky = null;
  var notePoints = NOTE ? (NOTE.points || []).filter(Boolean) : [];
  if (notePoints.length) {
    sticky = el("aside", "sticky");
    sticky.dataset.id = "sticky";
    sticky.setAttribute("aria-label", NOTE.label || "");
    var strip = el("div", "sticky__strip"); // the note's top edge, like desktop Stickies
    strip.setAttribute("aria-hidden", "true");
    strip.innerHTML = "<i></i><i></i>";
    sticky.appendChild(strip);
    var ul = el("ul", "sticky__list");
    notePoints.forEach(function (p) { ul.appendChild(el("li", null, p)); });
    sticky.appendChild(ul);
    iconBar.appendChild(sticky);
  }

  /* ---- Where things sit on the desktop ----
     Fixed spots: icons stacked down the left, the sticky note at the top
     right. Nothing here can be dragged. */
  var TOP_LIMIT = 46; // just under the menu bar

  function place(item, x, y) {
    item.style.left = Math.max(4, x) + "px";
    item.style.top = Math.max(TOP_LIMIT, y) + "px";
  }

  function layoutIcons() {
    var y = TOP_LIMIT + 12;
    $$(".desk-icon", iconBar).forEach(function (btn) {
      if (btn.hidden) return;
      place(btn, 16, y);
      y += (btn.offsetHeight || 80) + 6;
    });
    // The greeting sits lower, above the monitor, so the top right is free
    if (sticky) place(sticky, window.innerWidth - sticky.offsetWidth - 36, TOP_LIMIT + 40);
  }

  window.addEventListener("resize", layoutIcons);

  // Clicking the empty desktop clears the selection
  layer.addEventListener("pointerdown", function (e) {
    if (e.target === layer) $$(".desk-icon.is-selected").forEach(function (b) { b.classList.remove("is-selected"); });
  });

  /* ---- Welcome greeting: "Welcome to" fades in, then the serif lines type out ----
     Every letter is in place from the start (just invisible), so the text
     doesn't shift around as it types. */
  var greeting = $(".greeting");
  var greetTitle = $("#greeting-title");
  var G = SITE.desktop.greeting;
  var TYPE_MS = 65; // per letter: a medium pace
  var typeChars = [];
  var caret = el("span", "greeting__caret");
  greetTitle.setAttribute("aria-label", [G.welcome].concat(G.title || []).join(" "));
  $$("span", greetTitle).forEach(function (part) { part.setAttribute("aria-hidden", "true"); });
  $$(".greeting__line", greetTitle).forEach(function (line) {
    var text = line.textContent;
    line.textContent = "";
    text.split("").forEach(function (ch) {
      var c = el("span", "greeting__char", ch);
      typeChars.push(c);
      line.appendChild(c);
    });
  });

  function playGreeting(done) {
    greeting.classList.add("is-shown"); // "Welcome to" fades in
    if (reduceMotion.matches) {
      typeChars.forEach(function (c) { c.classList.add("is-on"); });
      done();
      return;
    }
    var i = 0;
    var next = function () {
      if (i >= typeChars.length) {
        setTimeout(function () { caret.remove(); }, 1200);
        done();
        return;
      }
      var c = typeChars[i++];
      c.classList.add("is-on");
      c.after(caret);
      var nextChar = typeChars[i];
      var newLine = nextChar && nextChar.parentNode !== c.parentNode;
      // A little unevenness feels typed; spaces and line breaks take a beat longer
      setTimeout(next, newLine ? 280 : c.textContent === " " ? TYPE_MS * 1.6 : TYPE_MS + Math.random() * 35);
    };
    setTimeout(next, 750); // after the fade
  }

  /* ---- Time and date in the menu bar ---- */
  var CLOCK = SITE.clock;
  var timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: CLOCK.timeZone, hour: "numeric", minute: "2-digit" });
  var dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: CLOCK.timeZone, weekday: "short", day: "numeric", month: "short" });

  function renderClock() {
    var now = new Date();
    $("#clock-time").textContent = timeFmt.format(now);
    $("#clock-date").textContent = dateFmt.format(now);
  }

  renderClock();
  // Tick on the minute
  setTimeout(function () {
    renderClock();
    setInterval(renderClock, 60000);
  }, 60000 - (Date.now() % 60000));
})();
