// English strings — source of truth for all copy. `code` in backticks renders as inline code, **x** bold.
const en = {
  meta: {
    title: "Sarke — every desktop, one cursor",
    description:
      "Sarke merges two or more Windows PCs into one workspace. Drag windows and files from one computer to another with the same mouse, as if they were one desktop. Free, and it works on your local network.",
    docsTitle: "Docs — Sarke",
  },
  common: {
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Copy failed",
    todo: "TODO",
  },
  nav: {
    skip: "Skip to content",
    home: "Sarke home",
    how: "How it works",
    features: "Features",
    specs: "Specs",
    download: "Download",
    docs: "Docs",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    language: "Language",
    primary: "Primary",
    themeLight: "Switch to light mode",
    themeDark: "Switch to dark mode",
    backToTop: "Back to top",
  },
  hero: {
    titleA: "Every desktop.",
    titleB: "One cursor.",
    sub: "Sarke merges two or more Windows PCs into one workspace. Grab a window or a file on one computer and drop it on another, with the same mouse and the same drag.",
    ctaDownload: "Download for Windows",
    ctaHow: "See it work",
    meta: "Free and open source · Windows 10 and 11 · Your local network",
    stageLabel:
      "Animation: three computers on one desk act as one desktop. One cursor carries a window from the first PC to the second, then drags a file onto the laptop.",
  },
  manifesto: {
    statement:
      "This isn't screen sharing. Sarke turns the computers on your desk into one workspace, so moving between them feels like moving across a single screen.",
    points: [
      { value: "2+", label: "Windows PCs merged into one desktop" },
      { value: "1", label: "mouse and keyboard for all of them" },
      { value: "0", label: "cloud accounts, subscriptions or fees" },
    ],
  },
  how: {
    title: "How it works",
    intro: "Four moves, the same way you already use a single computer.",
    stageLabel: "Animation of the step you are reading, played by your scroll.",
    chapters: [
      {
        title: "Connect",
        text: "Run `sarke_host.exe` on your main PC and `sarke_client.exe` on the others. They link up over your local network.",
      },
      {
        title: "One cursor",
        text: "Move past the edge of one screen and the pointer lands on the next computer. Your keyboard goes with it.",
      },
      {
        title: "Carry a window",
        text: "Grab any window by its title bar and drag it onto another PC's screen. Let go, and it's there.",
      },
      {
        title: "Drop a file",
        text: "Drag a file from one desktop into a folder on another. No cloud, no USB stick, no upload.",
      },
    ],
  },
  features: {
    title: "One workspace, many machines",
    intro: "Everything you do across one screen now works across every computer on the desk.",
    items: [
      {
        title: "Merge your desktops",
        text: "Two, three or more Windows PCs behave like one wide desktop, arranged the way they sit on your desk.",
      },
      {
        title: "Carry windows across",
        text: "Grab a window on one computer and drag it onto another's screen.",
      },
      {
        title: "Drop files on any machine",
        text: "Pick up a file on one desktop and drop it into a folder on another.",
      },
      {
        title: "One mouse, one keyboard",
        text: "Push past a screen edge and keep going on the next PC. Typing follows the cursor.",
      },
      {
        title: "Live HUD",
        text: "RTT, FPS, latency, bitrate, resolution and dropped frames while you work.",
      },
      {
        title: "Emergency exit",
        text: "Ctrl+Alt+Shift+Q always hands control back to your main PC.",
      },
      {
        title: "One small installer",
        text: "A single setup file for every PC on the desk. Run it, and Sarke is ready.",
      },
    ],
  },
  specs: {
    title: "Small, native, local",
    intro: "Written in C++20 for Windows. It runs on your network and nowhere else.",
    rows: {
      platform: ["Platform", "Windows 10 / 11 · x64"],
      computers: ["Computers", "2 or more, on the same network"],
      network: ["Network", "Same LAN · TCP 50500–50501"],
      capture: ["Capture", "Windows.Graphics.Capture"],
      codec: ["Codec", "JPEG (H.264 planned)"],
      install: ["Install", "Windows installer (SarkeSetup.exe)"],
      language: ["Language", "C++20"],
      size: ["Download size", ""],
      encryption: ["Encryption", "None yet"],
    },
    unavailable: "—",
  },
  limits: {
    title: "Before you install",
    intro: "Sarke is young. Here is what it doesn't do yet, and what Windows will say about it.",
    items: [
      "**No encryption or pairing yet.** Use only on trusted home or office networks.",
      "**LAN only.** Does not work over the internet.",
      "**Windows only.** No macOS or Linux.",
      "**Unsigned .exe.** Windows SmartScreen shows “Windows protected your PC”. Click More info → Run anyway.",
      "**Antivirus warnings.** Sarke uses keyboard/mouse hooks, input injection and screen capture, so some antivirus tools may flag it. Check the source code and the SHA-256 checksum.",
      "**Minimized windows can't be captured.** Restore them first.",
      "**Administrator windows** only receive input if the host is also run as Administrator.",
    ],
  },
  download: {
    title: "Get Sarke",
    intro: "One installer for every PC on the desk.",
    released: "Released",
    size: "Size",
    sha: "SHA-256",
    copySha: "Copy SHA-256",
    loading: "Loading release info",
    unavailable: "File info unavailable",
    button: "Download SarkeSetup.exe",
    all: "All releases",
    notWindows: "Sarke runs on Windows 10/11. Download it on your PC.",
    quickTitle: "Quick start",
    steps: [
      "Download `SarkeSetup.exe` and install it on **every** PC you want to connect.",
      "On the main PC, allow `sarke_host.exe` in Windows Firewall (Private network).",
      "Run `sarke_host.exe` on the main PC.",
      "Run `sarke_client.exe --host <A's IP>` on each of the other PCs.",
      "Push the cursor off a screen edge. Drag windows and files across as if it were one desktop.",
    ],
    smartscreenTitle: "SmartScreen",
    smartscreen:
      "Windows may say “Windows protected your PC”. Sarke isn't code-signed yet. Click More info → Run anyway. Verify the SHA-256 above if you want to be sure.",
    securityTitle: "Security",
    security: "This version has no encryption. Use Sarke only on networks you trust.",
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "How many computers can I connect?",
        a: "Two or more Windows PCs on the same local network. One runs `sarke_host.exe`, the others run `sarke_client.exe`.",
      },
      {
        q: "Can I move files between computers?",
        a: "Yes. Drag a file from one desktop and drop it on another. It travels over your local network.",
      },
      {
        q: "Why does Windows warn me when I open it?",
        a: "Sarke isn't code-signed yet, so Windows SmartScreen shows “Windows protected your PC”. Click More info → Run anyway. To make sure the file is genuine, compare its SHA-256 checksum with the one in the download section.",
      },
      {
        q: "Why does my antivirus flag Sarke?",
        a: "Sarke uses keyboard and mouse hooks, input injection and screen capture, so some antivirus tools may flag it. The source code is public, and you can verify the download with its SHA-256 checksum.",
      },
      {
        q: "Does it work over the internet?",
        a: "No. Sarke works only between PCs on the same local network.",
      },
      {
        q: "Is it secure?",
        a: "Not yet. This version has no encryption and no pairing. Use Sarke only on trusted home or office networks. An encrypted connection with PIN pairing is planned.",
      },
      {
        q: "Does it work on Mac or Linux?",
        a: "No. Sarke runs on Windows 10 and 11 (x64) only.",
      },
      {
        q: "Why is a window black or frozen on the other PC?",
        a: "Minimized windows can't be captured. Restore the window first.",
      },
      {
        q: "Why don't clicks work in some apps?",
        a: "Windows running as Administrator only receive input if the host is also run as Administrator. Right-click `sarke_host.exe` → Run as administrator.",
      },
      {
        q: "How do I get my mouse back if something goes wrong?",
        a: "Press Ctrl+Alt+Shift+Q. It always returns control to your main PC.",
      },
    ],
  },
  footer: {
    description: "Sarke merges the Windows PCs on your desk into one workspace.",
    links: "Links",
    github: "GitHub",
    releases: "Releases",
    docs: "Docs",
    meaning: "Sarke (სარკე) means mirror in Georgian.",
    team: "Team",
    teamTodo: "TODO: team credits",
    license: "License",
    licenseTodo: "TODO: license",
  },
  docs: {
    label: "Documentation",
    title: "Docs",
    toc: "On this page",
    sections: {
      requirements: "Requirements",
      install: "Install",
      firstRun: "First run",
      using: "Moving windows and files",
      config: "config.json reference",
      hotkeys: "Hotkeys",
      firewall: "Firewall",
      troubleshooting: "Troubleshooting",
      build: "Building from source",
    },
    requirements: [
      "Two or more PCs running **Windows 10 or 11, x64**.",
      "All PCs on the **same local network**.",
      "TCP port **50500** (control + input) and **50501** (video) reachable on the main PC.",
      "`sarke_host.exe` allowed in Windows Firewall on **Private** networks.",
    ],
    install: [
      "Download `SarkeSetup.exe` and run it on **every** PC you want to connect.",
      "The installer is unsigned, so SmartScreen may show “Windows protected your PC”. Click More info → Run anyway. Verify the SHA-256 checksum from the release if you want to be sure.",
    ],
    firstRunIntro:
      "The main PC runs the host (it owns the physical mouse and keyboard). Every other PC runs the client.",
    firstRun: [
      "On the main PC, find its local IP address: run `ipconfig` and read the IPv4 Address.",
      "On the main PC, run the host:",
      "On each of the other PCs, run the client with the main PC's IP:",
      "Push the cursor off a screen edge — it continues on the next PC, and the keyboard follows.",
    ],
    using: [
      "**Windows:** grab a window by its title bar, drag it past the screen edge and let go on the other PC.",
      "**Files:** drag a file from one desktop and drop it into a folder on another PC.",
      "Clicks, scrolling and typing work on every machine, the same way they do on one computer.",
    ],
    configIntro: "Both executables read `config.json` from their folder.",
    configTodo:
      "TODO: the config.json keys come from the Sarke C++ repository (config.json and CLAUDE.md). They are not documented here yet to avoid guessing.",
    hotkeysHead: ["Keys", "Action"],
    hotkeys: [
      ["Ctrl+Alt+Shift+Q", "Emergency exit — always returns control to the main PC."],
      ["Ctrl+Alt+Shift+S", "Window picker — choose a window to mirror."],
    ],
    firewall: [
      "Sarke uses TCP **50500** (control + input) and **50501** (video). The other PCs connect to these ports on the main PC.",
      "The first time `sarke_host.exe` runs, Windows may ask whether to allow it. Allow it on **Private networks**.",
      "Or add the rule yourself from an Administrator terminal (adjust the path):",
    ],
    troubleshootingIntro: "The common problems and their fixes:",
    buildIntro: "Sarke is written in C++20 and builds with CMake presets.",
    buildTodo: "TODO: copy the exact CMake preset commands from the Sarke C++ repository's CLAUDE.md.",
  },
};

export default en;
export type Dict = typeof en;
