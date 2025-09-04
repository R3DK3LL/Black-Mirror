# Black Mirror

Real-time camera mirror with split-flap display rendering and interactive game modes.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Ready-green.svg)](#quick-start)
[![Platform](https://img.shields.io/badge/Platform-Browser-orange.svg)](#requirements)

</div>

---

## Overview

Camera feed converts to mechanical split-flap panel display. Three interactive modes overlay game logic onto the real-time mirror.

## Modes

**Mirror** - Direct camera reflection rendered as individual flip panels  
**Snake** - AI snake avoids dark areas where user appears  
**Dot Collector** - Character collects items while avoiding user silhouette

## Visual Styles

**Airport** - Classic mechanical panels with realistic shadows  
**Large** - Chunky pixel blocks for retro gaming aesthetic  
**Minecraft** - Cubic voxel rendering with pixelated textures  
**Retro** - Synthwave colors with neon glow effects  
**Bright** - High contrast colors with animated backgrounds

## Controls

| Function | Description |
|----------|-------------|
| Start Mirror | Initialize camera capture and display |
| Mode Selector | Switch between Mirror/Snake/Dot Collector |
| Style Selector | Change visual appearance theme |
| Size Slider | Adjust individual panel dimensions |
| Screenshot | Export current frame as PNG |
| Record | Capture gameplay video as WebM |

## Quick Start

<table>
<tr>
<td align="center">

**Step 1**  
Open `index.html`

</td>
<td align="center">

**Step 2**  
Allow camera access

</td>
<td align="center">

**Step 3**  
Select mode & style

</td>
<td align="center">

**Step 4**  
Adjust settings & play

</td>
</tr>
</table>

## Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge
- **Camera**: WebRTC-compatible device
- **JavaScript**: Modern ES6+ support
- **Permissions**: Camera access required

## Technical Details

**Performance**
- 30fps target frame rate with adaptive throttling
- Grid size calculated from window dimensions
- Hardware-accelerated CSS transitions
- Canvas-based image processing at reduced resolution

**Architecture**
- Modular JavaScript without external dependencies
- CSS-based theming system
- WebRTC camera integration
- Real-time pixel data processing

## File Structure

```
index.html          Main application entry point
app.js             Core engine and UI management
styles/            CSS theme files
  ├── base.css     Core UI styling
  ├── airport.css  Mechanical panel theme
  ├── large.css    Chunky pixel theme
  ├── minecraft.css Voxel-style theme
  ├── retro.css    Synthwave neon theme
  └── bright.css   High contrast theme
modes/             Game logic modules
  ├── mirror.js    Direct reflection mode
  ├── snake.js     AI avoidance game
  └── capture.js   Screenshot/video functions
```

## Development

**Adding Game Mode**
1. Create new file in `modes/` directory
2. Implement `init(app)` and `update(app, imageData)` functions
3. Add option to mode selector in `index.html`
4. Handle mode switch in `app.js`

**Adding Visual Style**  
1. Create new CSS file in `styles/` directory
2. Define `.flap.black` and `.flap.white` styles
3. Add option to style selector in `index.html`

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 60+ | Full |
| Firefox | 55+ | Full |
| Safari | 11+ | Full |
| Edge | 79+ | Full |

## License

MIT License - see [LICENSE](LICENSE) file for details.

## No Dependencies

Pure HTML5, CSS3, and JavaScript implementation. No frameworks, build tools, or external libraries required.
