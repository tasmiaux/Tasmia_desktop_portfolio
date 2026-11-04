/*
  All visible text for curious.me lives here.

  - Personal details come only from the site owner.
  - Anything still to be written starts with "TODO:" so it's easy to find.
  - Anything left as "" (a link, a photo, a line of text) is hidden on the
    site instead of showing a broken item.
  - The previous browser version (chapters, search, chat) is saved in
    archive/browser-version/ if you want any of its text back.
*/

window.SITE = {
  meta: {
    title: "Tasmia's Desktop",
    description: "An interactive portfolio by Sayeda Tasmia Fathima, styled as a dreamy desktop."
  },

  /* ---- FILL THESE IN: empty links are hidden ------------------- */
  links: {
    khata: "",       // live Khata app URL
    smytten: "",     // Smytten Figma prototype URL (set it to public)
    medilog: ""     // MediLog Figma prototype URL (set it to public)
  },

  intro: {
    headline: "Well, hello there, internet stranger!",
    tagline: "Glad you found your way here.",
    byline: "I'm Tasmia Fathima, a product designer from Bengaluru. This little space is where my ideas, experiments and work live.",
    cta: "Enter my virtual desktop",
    wallpaperAlt: "A glowing beige computer monitor in a field of pink and white cosmos flowers under a soft blue sky."
  },

  /* ---- The desktop ------------------------------------------------ */
  desktop: {
    brand: "Tasmia's Portfolio",
    // Sits just above the monitor in the wallpaper. title: two serif lines, staggered
    greeting: {
      welcome: "Welcome to",
      title: ["My little corner", "of the internet."]
    },
    dockLabel: "Dock",
    closeWindow: "Close",
    minimizeWindow: "Minimize",
    // Each dock icon opens the window with the same id (see `windows`).
    // logo: the brand's own app icon (see assets/logos/SOURCES.txt). If it
    //       can't load, a plain tile with the app's initial shows instead.
    // About uses your photo from windows.about.photo.
    dock: [
      { id: "about", label: "About", photo: true },
      { id: "figma", label: "Figma", logo: "assets/logos/figma.svg" },
      { id: "claude", label: "Claude", logo: "assets/logos/claude.svg" },
      { id: "wispr", label: "Wispr Flow", logo: "assets/logos/wispr-flow.png" },
      { id: "chatgpt", label: "ChatGPT", logo: "assets/logos/chatgpt.svg" },
      { id: "notion", label: "Notion", logo: "assets/logos/notion.png" }
    ]
  },

  /* ---- Windows ------------------------------------------------------
     title: shown in the window's title bar
     heading, text: the window's content (placeholders for now)          */
  windows: {
    about: {
      title: "About",
      name: "Hi, I'm Tasmia Fathima.",
      photo: "assets/me.jpg",
      photoAlt: "Photo of Sayeda Tasmia Fathima",
      photoPlaceholder: "TODO: your photo",
      // One string per paragraph
      intro: [
        "Product designer, final-year engineering student, and professional overthinker of everyday problems.",
        "I like figuring out why things don't work, how they could work better, and occasionally building an idea just to see where it goes.",
        "Usually somewhere between Figma, Claude Code, and one too many open tabs."
      ],
      status: "Status: degree pending. Ideas loading.", // a small bold line under the intro
      viewTabs: "View Open Tabs", // starts the tour
      sayHi: "Say Hi! ↗"           // opens the "sayhi" window
    },
    figma: { title: "Figma", boards: ["smytten", "medilog"] },  // project boards, as tabs
    claude: { title: "Claude" },                    // chats from `claudeChats`
    chatgpt: { title: "My questions, my answers" }, // questions from `chatgpt`
    wispr: { title: "Wispr Flow" },                 // pages from `wisprPages`
    // Opened by "Say Hi" in About and Notion. Each row: label, the link, and the
    // text shown for it. Links open in a new tab; a row with no link shows its placeholder.
    sayhi: {
      title: "Say Hi!",
      heading: "Say Hi!",
      rows: [
        // Opens Gmail with a new email to this address
        { label: "Email", link: "https://mail.google.com/mail/?view=cm&fs=1&to=ui.uxfatima@gmail.com", text: "ui.uxfatima@gmail.com" },
        { label: "LinkedIn", link: "https://www.linkedin.com/in/ui-uxfatima01", text: "linkedin.com/in/ui-uxfatima01" },
        { label: "Resume", link: "https://drive.google.com/file/d/1Pk_WUvLjbduFDFib4DhcEAhwCokN-c5l/view?usp=sharing", text: "View resume" }
      ]
    },
    // The ideas not built yet
    folder1: {
      title: "Unfinished",
      heading: "Unfinished stuff",
      items: [
        { text: "Voice entry for Khata" },
        { text: "An AI layer for MediLog" },
        { text: "Smytten’s next fixes: price on the button, “paid → back in wallet”, first-tap sheet" }
      ]
    },
    // The brain dump lives in Notion now (a page in our own style)
    notion: {
      title: "Notion",
      // One bullet point per line
      lines: [
        "Random idea: I could build an app for...",
        "Tasmia, please lock in. It's November already.",
        "10 months down. What even happened? 😐😭",
        "Places to go, beaches to see. 🏖️✈️"
      ],
      outro: "anyways,",      // a line after the points
      sayHi: "Say Hi! ↗"       // then a button that opens the "sayhi" window
    }
  },

  /* ---- Projects ------------------------------------------------------
     One shared template for every project:
       sections: noticed, costs, made, missed, now (shown in that order,
                 under the headings in labels.sections)
       notBuilt: section keys to flag; notBuiltLabel overrides the flag text
       growth:   the sticky note at the bottom; the text continues the
                 sentence "What I noticed about getting people to …"
       link:     key in `links`; the Try button hides while it's empty
     Honesty rules: no invented numbers or claims; anything not built is
     flagged; MediLog uses sample data and is never advice. */
  projects: {
    labels: {
      sections: {
        noticed: "Looking closer",
        costs: "Why it matters",
        made: "What I built",
        missed: "Looking back",
        now: "If I took it further"
      },
      growth: "Beyond the design",
      growthPrefix: "What I noticed about getting people to",
      notBuilt: "proposed, not built",
      todo: "TODO",
      boardsLabel: "Boards",
      canvasLabel: "Board: drag or two-finger scroll to move, pinch or mouse wheel to zoom",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      fit: "Fit to screen",
      closeNote: "Close note"
    },

    smytten: {
      board: "Smytten",
      tryLabel: "View prototype",
      link: "smytten",
      // Side panel: headed blocks in order. text is one paragraph or a list
      // of them. Inside it, a list shows as bullet points, and { numbered: [...] }
      // as a numbered list. A list item can be { lead, text }: the lead is bold.
      blocks: [
        { label: "Where I started", text: [
          "I opened Smytten as a first-time user. There was no real onboarding, just two “Get Started” screens, which I skipped. I went straight to the trial minis and Trial Points tab to understand how they worked.",
          "The explainer said: “Get 10 trial points on sign up… Pay ₹235 per order and get cash back on full-size products.” I assumed I had 10 points to spend, so I filled my cart. Only at checkout did I discover an additional fee of ₹235–₹299. Reviews confirmed others had the same confusion: “Trials are advertised free, but you pay ₹235 first.”"
        ] },
        { label: "The problem I focused on", text: [
          "Users discover the cost only after assuming the trials are free. Words like “Free”, “Trial Points” and “100% cashback” create the wrong expectation, making the checkout fee feel like a surprise.",
          "The wallet repeats the “100% cashback” promise, but in practice, cashback unlocks through further spending at just 5–10%."
        ] },
        { label: "My first fix (four decisions)", text: [
          { numbered: [
            { lead: "3-slide onboarding", text: "Show the starting price (₹235) before users pick products, with the final slide reframing the fee as savings." },
            { lead: "“Currency” tooltip", text: "Replace “Trial points are your currency…” with “Questions about Trial Points?”. Calling points a currency makes users associate them with money." },
            { lead: "Honest copy", text: "Show the fee, point recharge after each order and 60-day expiry upfront. Remove misleading percentage-based “100% cashback” claims." },
            { lead: "Cashback moved to the Shop journey", text: "Explain cashback where it's relevant, keeping trial checkout focused on one question: What am I paying for?" }
          ] }
        ] },
        { label: "What I got wrong", text: "I had designed for people who read. But I skipped the onboarding myself. Impatient users often explore instead of reading, so a fix hidden in onboarding or copy misses exactly those people." },
        { label: "What I'd do now (not built, a hypothesis)", text: [
          "Show the cost at the moment of action. Trial points are points, not currency, so the actual rupee amount should appear wherever users make a decision:",
          [
            { lead: "Button", text: "“Try for ₹299”" },
            { lead: "Cart", text: "“₹299 paid → ₹299 back in your wallet”" },
            { lead: "Before confirmation", text: "Clearly explain cashback terms." }
          ],
          "I'd test this with first-time users, measuring checkout completion, wallet usage and “Why was I charged?” questions."
        ] }
      ],
      growth: {
        whole: true,
        label: "Beyond the screens",
        heading: "It wasn't a broken system, but broken timing.",
        text: [
          "The fee was disclosed, just too late and too vaguely to set the right expectation.",
          "I don't have conversion data, so these remain design hypotheses I'd want to test.",
          "What I learned: Trust was lost before users even tried the product. And a fix that only works for people who read misses those who prefer to explore on their own."
        ]
      },
      // Canvas rows. image: a file in assets/projects/ ("" shows a grey frame)
      canvas: [
        {
          title: "Where things get confusing",
          frames: [
            // Pins: x / y are % across / down the screenshot; they're numbered in order
            { label: "Screen 1 · The surprise", image: "assets/projects/smytten-2.png", pins: [
              { x: 88, y: 26, title: "“100% cashback”", note: "It sounds like users get their money back, but the cashback goes to the Smytten wallet and comes with conditions." }
            ] },
            { label: "Screen 2 · The fine print", image: "assets/projects/smytten-3.png", pins: [
              { x: 93, y: 78, title: "“Use them to order trial packs.”", note: "This makes it sound like trial points alone are used to order trial packs. There's no mention of the additional payment or platform fee users have to pay." }
            ] },
            { label: "Screen 3 · The explanation", image: "assets/projects/smytten-4.png", pins: [
              { x: 93, y: 70, title: "“Why am I paying ₹234?”", note: "The explanation of the payment appears too late, only when users reach the cart. This could cause users to feel surprised by the charge and drop off before completing checkout. This is a hypothesis, not a confirmed drop-off insight." }
            ] }
          ]
        },
        {
          title: "What I changed",
          subtitle: "A clearer trial journey, with more honest copy.",
          // free: any shape, not a phone frame; the screenshot keeps its own proportions.
          // wrap: the frames flow two to a line instead of one long row
          wrap: true,
          frames: [
            { label: "3-slide onboarding", image: "assets/projects/smytten-fix-onboarding.png", caption: "3-slide onboarding", free: true },
            { label: "Tooltip", image: "assets/projects/smytten-fix-tooltip.png", caption: "Tooltip", free: true },
            { label: "Trial tab explainer", image: "assets/projects/smytten-fix-trial-tab.png", caption: "Trial tab explainer", free: true },
            { label: "Cart", image: "assets/projects/smytten-fix-cart.png", caption: "Cart", free: true },
            { label: "Wallet cashback", image: "assets/projects/smytten-fix-wallet.png", caption: "Wallet cashback", free: true }
          ]
        }
      ]
    },

    medilog: {
      board: "MediLog",
      tryLabel: "View prototype",
      link: "medilog",
      // Kept on purpose: this is never medical advice
      notice: "Sample data used throughout. This is a design concept, not a medical product.",
      blocks: [
        { label: "Where I started", text: [
          "Lab reports are full of numbers, ranges and medical terms. Even when the information is all there, it's not always easy to tell what matters or what has changed since the last test.",
          "I wanted to explore how the same information could feel easier to understand."
        ] },
        { label: "The problem I focused on", text: [
          "A report should do more than display results. It should help people make sense of them.",
          "I focused on making important information easier to find, understand and compare, without making the experience feel overwhelming."
        ] },
        { label: "My approach", text: [
          "I explored a simple report-reading flow:",
          [
            "Show the important details upfront.",
            "Use plain language to explain results.",
            "Make changes between reports easier to spot.",
            "Offer a gentle reminder to consult a doctor when needed."
          ],
          "I first explored the flow with Lovable, then refined the screens in Figma and created a small set of reusable components.",
          "A 2-day design exploration completed as part of an assignment, using sample data. This is not a medical product or a validated solution."
        ] },
        { label: "What I'd explore next", text: [
          "I'd explore better ways to help users compare their current and previous reports, making changes easier to spot and understand.",
          "For example, highlighting what has changed between reports, without interpreting results or suggesting medical actions.",
          "I'd test whether this makes report comparisons easier to follow and helps users keep track of their reports over time."
        ] }
      ],
      growth: {
        whole: true,
        label: "Beyond the screens",
        heading: "Understanding matters as much as information.",
        text: [
          "I learned that showing more data doesn't always make something clearer. The challenge is helping people understand what they're looking at without overwhelming or alarming them."
        ]
      },
      // Canvas rows. image: a file in assets/projects/ ("" shows a grey frame)
      canvas: [
        {
          title: "From raw numbers to clearer answers",
          frames: [
            // Pins: x / y are % across / down the screenshot
            { label: "Screen 1 · Overall summary", image: "assets/projects/medilog-1.png", pins: [
              { x: 90, y: 41, title: "Overall Summary", note: "A one-line summary of the report reassures users that their results are generally within range, with an option to view the full summary." }
            ] },
            { label: "Screen 2 · Key results", image: "assets/projects/medilog-2.png", pins: [
              { x: 46, y: 58, title: "Key Results", note: "Highlights only the important test results, using calm language such as “Slightly elevated”, “Above the typical range” or “Within range”. Flagged results can be tapped to view comparisons with previous reports." }
            ] },
            { label: "Screen 3 · Result comparison", image: "assets/projects/medilog-4.png", pins: [
              { x: 92, y: 46, title: "Result Comparison", note: "Shows a graph comparing the last three reports, highlighting what has changed over time, with a reassuring note to discuss the changes with a doctor." }
            ] },
            { label: "Screen 4 · Cholesterol changes", image: "assets/projects/medilog-5.png", pins: [
              { x: 90, y: 82, title: "What can I do next?", note: "Highlights how cholesterol levels have changed since the previous report, explains common factors that may contribute to the change, and suggests three next steps." }
            ] }
          ]
        }
      ]
    }
  },

  /* ---- Claude window: chats in a sidebar ---------------------------
     Only your own prompts, notes and screenshots. No made-up AI replies.
     kind "built":      prompt, a "What came out" card, What I missed,
                        What I'd do now and a Growth lens note */
  claudeChats: {
    newChat: "New chat",
    newChatHeading: "New chat",
    newChatText: "TODO: what a new chat shows.",
    pickLabel: "Chats",
    // Shown (one at a time, every ~1.7s) while a reply is "loading"; the first one always leads
    thinking: [
      "Thinking...",
      "Connecting the dots...",
      "Sleuthing around...",
      "Untangling the mess...",
      "Looking into it...",
      "Trying another approach...",
      "Putting it together...",
      "Almost there..."
    ],
    labels: {
      out: "What came out",
      tryIt: "Try it",
      imagePlaceholder: "Screenshot"
    },
    // The sidebar, top to bottom; a group with a label gets a heading
    groups: [
      { chats: ["khata", "portfolio"] }
    ],
    chats: {
      "khata": {
        kind: "built",
        title: "Khata · Built in a day",
        opening: "Mom lost her diary. And suddenly, nobody knew how much was spent or what was left to deduct.",
        prompt: "Build a simple expense tracker my mom can actually use. Keep it easy: Google sign-in, amount, category, cash or UPI, a dashboard, and a calculator. Let the family view expenses through a read-only link.",
        outLabel: "What I built",
        outIntro: "A working expense tracker, designed and built in a day with Claude Code.",
        image: "assets/projects/khata.png", // sign-in, home, dashboard and calculator, side by side
        imagePlaceholder: "App screenshot",
        note: "I kept the first version focused. No shared accounts, complicated profiles or extra setup. Just log an expense and see where the money goes.",
        link: "khata",            // key in `links`; the Try it button shows once it's set
        // Question chips. Each answer is a list of blocks: a heading, an
        // optional flag, and one or more paragraphs.
        questions: [
          { q: "Why did this idea start?", blocks: [
            { label: "Looking closer", text: "My mom tracked household expenses in a diary and in her head. GPay showed her who she paid, but not what she paid for. Cash expenses weren't recorded anywhere." },
            { label: "The problem I wanted to solve", text: "She didn't need another finance app. She needed a simple way to keep track of everyday spending without changing how she already managed money." },
            { label: "My approach", text: "I kept the experience familiar: quick expense entry, simple categories, cash and UPI tracking, and a dashboard that brings everything together." }
          ] },
          { q: "What did I leave out?", blocks: [
            { label: "A smaller first version", text: [
              "I considered shared profiles and passwords, but they added more setup than the problem needed.",
              "I kept Google sign-in and a read-only family link instead. That meant my mom could track expenses without managing multiple accounts."
            ] }
          ] },
          { q: "What's next?", blocks: [
            { label: "If I took it further", flag: "Proposed, not built", text: [
              "I'd explore voice-based expense entry so my mom could log spending without typing every detail.",
              "I'd also test how often she logs expenses and whether the app becomes part of her daily routine."
            ] }
          ] }
        ],
        growth: {
          whole: true,
          label: "Beyond the build",
          heading: "What I took away",
          text: [
            "Building quickly taught me that deciding what not to build matters just as much as choosing the features.",
            "The next challenge isn't adding more features. It's making Khata useful enough to come back to every day."
          ]
        }
      },
      "portfolio": {
        kind: "built",
        title: "So, I built my portfolio",
        prompt: "I'm entering a hiring challenge. I want my portfolio to feel less like a website and more like walking into my computer. Start with a glitch intro, then open up into a desktop where each window holds a little piece of my work.",
        outLabel: "What I ended up building",
        image: "assets/projects/portfolio.png",
        note: "A desktop you can explore, with windows for my About section, Figma work, Claude, Wispr and ChatGPT. There are folders to open, little details to discover, and even a Bengaluru clock.",
        link: "",
        // Headed sections under the screenshot card (heading, then paragraphs)
        blocks: [
          { label: "A few plot twists", text: [
            "The idea changed three times. It started as a detective game, turned into a search history, and eventually became this desktop.",
            "I spent a lot of time exploring the look before settling on the story. I also ran out of Emergent credits along the way. Next time, I'd figure out the experience first, then build the visuals around it."
          ] },
          { label: "One thing I didn't expect", text: "I had fun designing all the little details, but what I enjoyed most was thinking about how someone would explore the space. I also discovered Wispr, and honestly, I might be talking to my computer more than typing from now on. It's that useful." }
        ]
      }
    }
  },

  /* ---- ChatGPT window: "My questions, my answers" -------------------
     Your own questions and your own one-line answers. Not AI replies. */
  chatgpt: {
    headline: "What's on your mind?",
    placeholder: "Ask me something…",
    inputLabel: "Ask a question",
    sendLabel: "Send",
    thinking: "Thinking…",
    chips: [
      { q: "Entry-level means entry-level, right?", a: "Some job posts disagree. I’m choosing optimism." },
      { q: "How to get experience without experience?", a: "Build the thing you’d be hired to build, then show it. (Hi, you’re looking at it.)" },
      { q: "Is this job post real?", a: "Unclear. Applying anyway, politely." },
      { q: "What should I make this weekend?", a: "Something small enough to finish and weird enough to remember." },
      { q: "Brainstorm, bro…", a: "Idea one is great. Idea two is better. By idea seven I’m rewriting idea one." }
    ],
    noResults: {
      title: "No results found",
      text: "TODO: a funny line for questions you haven't answered yet."
    }
  },

  /* ---- Wispr Flow window: two pages, as tabs ------------------------ */
  wisprPages: {
    tabsLabel: "Pages",
    pages: [
      {
        id: "emergent",
        tab: "Emergent credits",
        title: "Emergent, please don't run out of credits. 😭",
        kind: "meter",            // drains as the visitor scrolls or taps
        label: "Credits",
        hint: "Scroll or tap here to keep building.",
        done: "Finished in Claude Code.",
        doneLink: { label: "Check out how I built it", window: "claude", chat: "portfolio" }
      },
      {
        id: "mom",
        tab: "Wispr and mom",
        title: "Why did Wispr write down my mom shouting?",
        kind: "transcript",       // types the prompt, then the interruption
        label: "Listening…",
        // prompt, then the shout that cut in, then what I said after it
        prompt: "Make the dock a little bigger and move it lower on the screen…",
        interruption: "Dinner ready hai, come have it soon!",
        after: "…and keep the icons rounded.",
        caption: "Wispr, 1. Family, 0."
      }
    ]
  },

  /* ---- Desktop icons (down the left side) ---------------------------
     Shown once the About window is closed or the tour ends.
     window: opens that window from `windows`
     link:   opens a file in a new tab once it's set (the icon hides if
             the file isn't there); until then `window` opens instead     */
  desktopIcons: {
    label: "Desktop",
    items: [
      // image: a transparent PNG for the icon (falls back to a drawn icon if missing)
      { id: "folder1", label: "Unfinished", kind: "folder", image: "assets/icons/folder.png", window: "folder1" },
      // Opens the resume on Google Drive in a new tab
      { id: "resume", label: "Resume.pdf", kind: "pdf", image: "assets/icons/doc.svg", link: "https://drive.google.com/file/d/1Pk_WUvLjbduFDFib4DhcEAhwCokN-c5l/view?usp=sharing" }
    ]
  },

  /* ---- To-do note: a small window on the right of the desktop, drag it anywhere ---- */
  stickyNote: {
    label: "Sticky note",
    // One bullet point each
    points: [
      "brainstorm that 3 am idea before you forget it.",
      "just hit apply. job application #30.",
      "delete that button on screen 3 in figma. (yes, that one.)"
    ]
  },

  /* ---- Time, place and date, side by side at the right of the menu bar */
  clock: {
    place: "Bengaluru",
    timeZone: "Asia/Kolkata"
  },

  /* ---- The tour ("View Open Tabs" in the About window) --------------
     Opens these windows one at a time, each with a Next button.        */
  tour: {
    steps: ["figma", "claude", "wispr", "chatgpt", "notion"],
    next: "Next →",
    previous: "← Previous",
    finish: "Finish",
    end: "Close tab"
  },

  /* ---- Cases: copied from the case-file project's data.js -------
     Not shown yet; kept for the project windows to come. Keep the honest
     labels ("proposed, not built", no invented numbers). */
  traits: {
    notice: "Notices friction",
    business: "Connects it to the business",
    build: "Builds to test"
  },

  cases: {
    khata: {
      no: "01",
      name: "Khata",
      teaser: "An expense tracker for the way my mom actually manages money.",
      link: "khata",
      labels: ["Built in a day", "Live", "Voice entry: next, not built"],
      statement: "I'd talk to my mom about what she struggles with before writing the problem statement, not after.",
      clues: [
        {
          title: "The invisible payment",
          trait: "notice",
          gist: "GPay shows who, never why.",
          text: "GPay shows who you paid, not what for, and cash never shows up anywhere. My mom keeps a mental tally and reports her day's spending to my dad."
        },
        {
          title: "A habit, not a feature",
          trait: "business",
          gist: "No daily habit, no users.",
          text: "My first write-up said she was afraid of finance apps. She uses GPay fine. I understood what she was going through but couldn't frame it. The real problem: nothing gave her a reason to log money every day, and a tracker nobody opens twice has no users."
        },
        {
          title: "One tap, one day",
          trait: "build",
          gist: "Live in a day. Test the weekly habit.",
          text: "One-tap Google sign-in, amount, category, cash or UPI, a dashboard and a calculator, plus a read-only share link for family. Built in a day and live. I cut shared profiles and passwords as MVP bloat. I'd test how many days a week someone logs an expense. Voice entry is next, and it is not built."
        }
      ]
    },
    smytten: {
      no: "02",
      name: "Smytten",
      teaser: "A “free trial” that wasn't free, and the trust it cost.",
      link: "smytten",
      labels: ["Onboarding and honest copy: built", "Next fixes: proposed, not built", "No conversion data"],
      statement: "I reached a solution quickly and stopped iterating. Next time I'd explore more options before committing, and test them with first-time users.",
      clues: [
        {
          title: "Trial points, real money",
          trait: "notice",
          gist: "“Free” that costs ₹235.",
          text: "The ₹235 trial comes back as wallet cashback, but words like “free” and “trial points” hide that it costs money, and “100% cashback” turns out to be a small, conditional amount. The cost shows up in the cart as a surprise. Reviews say “scam” and “trap”."
        },
        {
          title: "Where would you dig?",
          trait: "business",
          gist: "The cost appears after belief forms.",
          question: "Users are leaving angry. Reviews say “scam” and “trap”. Where would you dig first?",
          text: "Each of these costs Smytten something: users who abandon at checkout, users who never use the wallet, and bad reviews that make new users costlier. My first fix, a 3-screen onboarding and clearer copy, only helped people who read. People skip onboarding. The real problem is that the cost appears after the user has already formed a belief."
        },
        {
          title: "Stop designing for readers",
          trait: "build",
          gist: "Show the cost where people act.",
          text: "I built a 3-screen onboarding and honest copy at the key touchpoints. Next I'd put the price on the button (“Try for ₹235”), show “₹235 paid → ₹235 back in wallet” in the cart, and use a bottom sheet the first time someone taps Try. I'd test trial checkout completion, wallet use and “why was I charged?” tickets. These changes are proposed, not built, and I have no conversion data, so all of this is a hypothesis."
        }
      ]
    },
    medilog: {
      no: "03",
      name: "MediLog",
      teaser: "Medical reports are full of numbers. What do they actually mean?",
      link: "medilog",
      labels: ["Clickable prototype", "Sample data only", "AI layer: next, not built"],
      statement: "I had to move fast, so I didn't sit with the problem. Next time I'd explore more ways to solve it before opening any tool. The AI layer idea only came to me after I submitted.",
      clues: [
        {
          title: "Numbers without meaning",
          trait: "notice",
          gist: "Numbers that scare, not explain.",
          text: "Reports are columns of values, ranges and units with no sense of what matters. Comparing this report with the last one is harder still, and the numbers can alarm people more than they inform them."
        },
        {
          title: "Why come back?",
          trait: "business",
          gist: "Comparison is the reason to return.",
          text: "An app people open once has no reason to be opened again. Comparing this report with the last one, in calm words like “in range” and “slightly elevated”, is the reason to return. The app never diagnoses. It says “consider checking with your doctor”."
        },
        {
          title: "AI as a draft",
          trait: "build",
          gist: "Two days: AI draft, Figma decisions.",
          text: "I had two days. I wrote a master prompt with an AI chat, generated a starting prototype in Lovable, then redesigned it in Figma and built a small design system with reusable components, which was new to me. Four to five screens and a clickable prototype, all with sample data. I'd test how many reports someone adds and whether they come back. Next, not built: an AI layer that explains changes between reports in calm language."
        }
      ]
    }
  }
};
