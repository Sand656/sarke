// English strings — source of truth for all copy. `code` in backticks renders as inline code, **x** bold.
const en = {
  meta: {
    title: "Sarke — every desktop, one cursor",
    description:
      "Sarke links two Windows PCs into one workspace. Move the cursor, windows, files and the clipboard from one computer to the other with the same mouse, as if they were one desktop. Free, and it works on your local network.",
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
    sub: "Sarke links two Windows PCs into one workspace. Push the cursor past the edge of your screen and keep working on the other PC, then carry windows and files across with the same mouse.",
    ctaDownload: "Download for Windows",
    ctaHow: "See it work",
    meta: "Free and open source · Windows 10 and 11 · Your local network",
    stageLabel:
      "Animation: a display and a laptop side by side. One cursor flies from one screen to the other, carries a window over to the laptop, then brings a file back.",
  },
  showcase: {
    label: "Video: Sarke on two PCs at one desk, with one mouse, windows and files moving between them.",
  },
  manifesto: {
    statement:
      "This isn't screen sharing. Sarke turns the computers on your desk into one workspace, so moving between them feels like moving across a single screen.",
    points: [
      { value: "2", label: "Windows PCs, one desktop" },
      { value: "1", label: "mouse and keyboard for both" },
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
        text: "Install Sarke on both PCs. On one of them, choose **Connect to the other PC** in the tray menu. Sarke finds the other PC on your network by itself.",
      },
      {
        title: "One cursor",
        text: "Move past the edge of your screen and the pointer lands on the other PC. Your keyboard goes with it, and it works from either side.",
      },
      {
        title: "Carry a window",
        text: "Turn on desk mode and drag any window over the edge, or press `Ctrl+Alt+Shift+W` to send the window in front. Press it again to bring it back.",
      },
      {
        title: "Drop a file",
        text: "Drag a file over the edge and drop it into a folder on the other PC, or copy it and paste it there. No cloud, no USB stick, no upload.",
      },
    ],
  },
  features: {
    title: "One workspace, two machines",
    intro: "Everything you do across one screen now works across both computers on the desk.",
    items: [
      {
        title: "The other PC as a monitor",
        text: "Turn on desk mode and the other PC works like an extra screen. Drag any window over the edge and keep using it there.",
      },
      {
        title: "Send a window",
        text: "Press Ctrl+Alt+Shift+W to send the window in front to the other PC. Press it again and it comes back.",
      },
      {
        title: "Drop files on the other PC",
        text: "Drag files over the edge into a folder on the other PC, or drop them on the box that Ctrl+Alt+Shift+F opens.",
      },
      {
        title: "One mouse, one keyboard",
        text: "Push past a screen edge and keep going on the other PC. Typing follows the cursor.",
      },
      {
        title: "Shared clipboard",
        text: "Copy text, an image or files on one PC and paste them on the other.",
      },
      {
        title: "Emergency exit",
        text: "Ctrl+Alt+Shift+Q always hands control back to the PC you're sitting at.",
      },
      {
        title: "One small installer",
        text: "The same setup file on both PCs. It adds the firewall rules and display driver Sarke needs, then Sarke waits in the tray.",
      },
    ],
  },
  specs: {
    title: "Small, native, local",
    intro: "Written in C++20 for Windows. It runs on your network and nowhere else.",
    rows: {
      platform: ["Platform", "Windows 10 / 11 · x64"],
      computers: ["Computers", "2, on the same network"],
      network: ["Network", "Same LAN · TCP 50500–50502 · UDP 50503"],
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
      "**Two PCs, side by side.** Sarke links one PC to one other PC, standing to its left or right.",
      "**LAN only.** Does not work over the internet.",
      "**Windows only.** No macOS or Linux.",
      "**Unsigned .exe.** Windows SmartScreen shows “Windows protected your PC”. Click More info → Run anyway.",
      "**Antivirus warnings.** Sarke uses keyboard/mouse hooks, input injection and screen capture, so some antivirus tools may flag it. Check the source code and the SHA-256 checksum.",
      "**Minimized windows can't be captured.** Restore them first.",
      "**Administrator windows** only take Sarke's input, and can only be moved, if Sarke itself runs as administrator.",
    ],
  },
  download: {
    title: "Get Sarke",
    intro: "One installer, the same on both PCs.",
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
      "Download `SarkeSetup.exe` and install it on **both** PCs. It adds the firewall rules Sarke needs.",
      "Sarke opens by itself and waits in the tray (**^** on the taskbar). If it isn't running, open **Sarke** from the Start menu.",
      "On one PC, open the tray menu and choose **Connect to the other PC**. Sarke finds the other PC on your network.",
      "On each PC, choose **Display arrangement…**, drag the other PC to the side where it really stands and press **Apply**.",
      "Push the cursor past that edge. Turn on **Desk mode** in the tray menu to drag windows across.",
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
        a: "Two Windows PCs on the same local network. Install Sarke on both and connect one to the other.",
      },
      {
        q: "How do I connect the two PCs?",
        a: "Open Sarke on both. On one of them, open the tray menu and choose **Connect to the other PC**. Sarke finds the other PC on your network by itself, so you don't need an IP address. If the link drops, it reconnects on its own.",
      },
      {
        q: "The PCs don't find each other. What now?",
        a: "Check that both PCs are on the same network and run the same version of Sarke. Some networks, like guest Wi-Fi, block the search. Then open `config.json` on the PC that connects (tray menu → **Open config.json**), set `host_ip` to the other PC's IP address and restart Sarke.",
      },
      {
        q: "What is desk mode?",
        a: "With desk mode on, the other PC works like an extra monitor. Sarke adds a virtual display the size of the other PC's screen, and any window you drag onto it shows up over there, ready to use with the same mouse. Turn it on or off in the tray menu.",
      },
      {
        q: "Can I move files between computers?",
        a: "Yes. Drag files over the edge and drop them on the other PC, press `Ctrl+Alt+Shift+F` and drop them on the box at the cursor, or copy them and paste with Ctrl+V in File Explorer on the other PC. They travel over your local network.",
      },
      {
        q: "Why does Windows ask for permission when desk mode starts?",
        a: "When the other PC has a screen size Sarke hasn't used before, Sarke adds that resolution to the virtual display driver and restarts the driver. Windows asks you to allow that once for each new size.",
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
        a: "Windows running as administrator only take Sarke's input if Sarke runs as administrator too. Close Sarke from the tray menu (**Quit Sarke**), then right-click the **Sarke** shortcut → Run as administrator. Sarke can't control the Windows sign-in screen or UAC prompts.",
      },
      {
        q: "How do I get my mouse back if something goes wrong?",
        a: "Press Ctrl+Alt+Shift+Q. Control comes back to the PC you're at and Sarke stops crossing edges. Choose **Restart Sarke** in the tray menu to turn it back on.",
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
      firstRun: "Open and connect",
      using: "Using Sarke",
      tray: "The tray menu",
      config: "config.json reference",
      hotkeys: "Hotkeys",
      firewall: "Firewall",
      troubleshooting: "Troubleshooting",
      build: "Building from source",
    },
    requirements: [
      "Two PCs running **Windows 10 or 11, x64**.",
      "Both on the **same local network**.",
      "The **same version** of Sarke on both PCs.",
    ],
    install: [
      "Download `SarkeSetup.exe` and run it on **both** PCs.",
      "The installer puts Sarke in `C:\\Program Files\\Sarke`, adds its Windows Firewall rules and the virtual display driver that desk mode uses, and starts Sarke with Windows.",
      "The installer is unsigned, so SmartScreen may show “Windows protected your PC”. Click More info → Run anyway. Verify the SHA-256 checksum from the release if you want to be sure.",
    ],
    firstRunIntro:
      "Sarke runs on both PCs. One is the host and the other connects to it, but control works both ways, so it doesn't matter which is which.",
    firstRun: [
      "Open Sarke on both PCs. It starts with Windows; if it isn't running, open **Sarke** from the Start menu. It lives in the tray (**^** on the taskbar).",
      "Each PC starts as the host and waits. On one of them, open the tray menu and choose **Connect to the other PC**.",
      "Sarke finds the other PC on your local network by itself, no IP address needed. When they link up, a notification says **Connected to** and the other PC's name.",
      "On each PC, choose **Display arrangement…** in the tray menu. Drag the other PC to the side of your screens where it really stands (arrow keys work too) and press **Apply**. Sarke restarts with the new side.",
      "Push the cursor past that edge. It continues on the other PC, and the keyboard follows.",
    ],
    using: [
      "**Mouse and keyboard:** move past the edge and you're working on the other PC. Clicks, scrolling and typing work there the same way they do here, and either PC's mouse can cross over.",
      "**Desk mode:** turn on **Desk mode** in the tray menu and the other PC acts as an extra monitor. Drag any window over the edge and it appears on the other PC's screen, where you keep using it.",
      "**Send a window:** click a window, then press `Ctrl+Alt+Shift+W` to move it to the other PC. Press it again to bring it back. Without desk mode, it opens in a viewer window there.",
      "**Files:** drag files over the edge and drop them into a folder or app on the other PC, or press `Ctrl+Alt+Shift+F` and drop them on the box that appears at the cursor. Received files go to your Downloads folder (tray menu → **Open received files**).",
      "**Clipboard:** copy text, an image or files on one PC and paste on the other. Copied files paste with Ctrl+V in File Explorer. Very large copies stay behind: drag those over the edge instead.",
    ],
    trayIntro:
      "Open the Sarke menu from its icon in the tray (**^** on the taskbar). The top line shows whether this PC is the host or the client, and how the link is doing.",
    tray: [
      "**Display arrangement…:** which side of your screens the other PC stands on.",
      "**Window quality:** Low, Medium, High or Best picture for windows shown on the other PC.",
      "**Frame rate:** 15, 30 or 60 fps, or no limit.",
      "**Desk mode:** use the other PC as an extra monitor.",
      "**Notifications:** a notification when the other PC connects, when the connection drops, or both.",
      "**Open received files**, **Open config.json**, **Show log:** the files you received, the settings file and the log.",
      "**Connect to the other PC** or **Disconnect (make this PC the host)**: link to the other PC, or make this PC the host again.",
      "**Restart Sarke**, **Quit Sarke:** restart or close Sarke.",
    ],
    configIntro:
      "Sarke keeps its settings in `%LOCALAPPDATA%\\Sarke\\config.json` (tray menu → **Open config.json**). The tray menu and Display arrangement write it for you, so you rarely need to edit it by hand. Restart Sarke after you change it.",
    configHead: ["Key", "What it does"],
    configKeys: [
      ["client_side", "Where the other PC stands next to this one: `\"left\"` or `\"right\"`. Default `\"right\"`. Display arrangement sets it."],
      ["host_ip", "The other PC's IP address, for networks where Sarke can't find it by itself. Leave it out and Sarke searches on its own."],
      ["control_port", "TCP port for control and input. Default `50500`."],
      ["video_port", "TCP port for window pictures. Default `50501`."],
      ["file_port", "TCP port for files. Default `50502`."],
      ["jpeg_quality", "Picture quality of shared windows. Window quality in the tray menu sets it to 50, 75, 90 or 95."],
      ["max_fps", "Frame rate cap for shared windows. Frame rate in the tray menu sets 15, 30, 60 or no limit."],
    ],
    configNote: "If you change a port, change it on both PCs and allow the new port in Windows Firewall.",
    hotkeysHead: ["Keys", "Action"],
    hotkeys: [
      ["Ctrl+Alt+Shift+W", "Send the window in front to the other PC. Press again to bring it back."],
      ["Ctrl+Alt+Shift+F", "Open a box at the cursor. Drop files on it to send them to the other PC."],
      ["Ctrl+Alt+Shift+Q", "Emergency exit: control comes back to this PC and Sarke stops crossing edges. Choose Restart Sarke in the tray menu to turn it back on."],
    ],
    firewall: [
      "The installer adds the Windows Firewall rules Sarke needs, so there is usually nothing to do.",
      "Sarke talks over TCP **50500** (control and input), **50501** (window pictures) and **50502** (files), and finds the other PC over UDP **50503**.",
      "If the rules are gone, add them again from an Administrator terminal:",
    ],
    troubleshootingIntro: "The common problems and their fixes:",
    buildIntro: "Sarke is written in C++20 and builds with CMake presets.",
    buildTodo: "TODO: copy the exact CMake preset commands from the Sarke C++ repository's CLAUDE.md.",
  },
};

export default en;
export type Dict = typeof en;
