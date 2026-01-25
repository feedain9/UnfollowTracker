# UnfollowTracker

> Discover who unfollowed you on Instagram — in one click.

A minimal, privacy-focused Chrome extension that reveals who doesn't follow you back on Instagram. No account access needed. Your data stays on your device.

## Features

- **One-click scan** — See who doesn't follow you back instantly
- **Privacy-first** — All data stored locally, never leaves your browser
- **Clean UI** — Premium dark interface, distraction-free
- **Export results** — Download your unfollowers list as JSON
- **No login required** — Works with your existing Instagram session

## Installation

### From source (Developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/UnfollowTracker.git
   cd UnfollowTracker
   ```

2. (Optional) Generate proper icons:
   ```bash
   npm install
   npm run generate-icons
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `UnfollowTracker` folder

4. Open Instagram and click the extension icon

## How it works

1. Open [instagram.com](https://www.instagram.com) and log in
2. Click the UnfollowTracker extension icon
3. Click **Scan my account**
4. View who doesn't follow you back

The extension uses Instagram's public web API to fetch your followers and following lists, then compares them locally to identify non-mutual follows.

## Privacy

- **No external servers** — Everything runs in your browser
- **No data collection** — We don't track or store anything
- **Open source** — Verify the code yourself

## Tech Stack

- Vanilla JavaScript (ES6+)
- Chrome Extension Manifest V3
- CSS Custom Properties
- Instagram Web GraphQL API

## Project Structure

```
UnfollowTracker/
├── manifest.json          # Extension configuration
├── src/
│   ├── popup.html         # Extension popup UI
│   ├── styles/
│   │   ├── popup.css      # Popup styles
│   │   └── inject.css     # Instagram overlay styles
│   └── scripts/
│       ├── popup.js       # Popup logic
│       ├── content.js     # Instagram scanner
│       └── background.js  # Service worker
├── assets/
│   └── icons/             # Extension icons
└── scripts/
    └── generate-icons.js  # Icon generator
```

## Disclaimer

This tool is not affiliated with, authorized by, or connected to Instagram or Meta. Use responsibly and at your own risk. Excessive scanning may trigger Instagram's rate limits.

## License

MIT © 2024
