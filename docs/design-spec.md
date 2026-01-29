# Plugin Arena - Frontend Design Specification

## Overview

Plugin Arena adopts a **"ゆるい" (relaxed/soft)** design aesthetic inspired by Nintendo's [タヌポータル](https://www.nintendo.com/jp/switch/acbaa/portal/index.html). The goal is to create a warm, approachable, and friendly user experience that stands apart from typical developer tools' corporate aesthetics.

---

## Design Principles

1. **Warm & Approachable** - Avoid cold, corporate aesthetics
2. **Soft & Rounded** - No sharp edges; everything feels gentle
3. **Playful but Functional** - Cute without sacrificing usability
4. **Desktop-First** - Optimized for developer workflow, adapted for mobile

---

## Color Palette

### Primary Colors

| Role | Color Name | Hex Code | Usage |
|------|-----------|----------|-------|
| Background | Warm Cream | `#FFF8E7` | Main page background |
| Surface | Soft Beige | `#F5F0E6` | Card backgrounds |
| Primary Accent | Soft Coral | `#FFB7B2` | CTAs, highlights, badges |
| Secondary Accent | Mint Green | `#98D8C8` | Success states, secondary actions |

### Text Colors

| Role | Hex Code | Usage |
|------|----------|-------|
| Primary Text | `#4A4A4A` | Body text, headings |
| Secondary Text | `#7A7A7A` | Descriptions, metadata |
| Muted Text | `#A0A0A0` | Placeholders, disabled states |

### Category Colors (Pastel)

| Category | Color | Hex Code |
|----------|-------|----------|
| MCP | Pastel Blue | `#A8D8EA` |
| Skill | Pastel Purple | `#CDB4DB` |
| Hook | Pastel Orange | `#FFCDB2` |
| Command | Pastel Green | `#B5EAD7` |

### Semantic Colors

| State | Color | Hex Code |
|-------|-------|----------|
| Success | Soft Green | `#98D8C8` |
| Warning | Soft Yellow | `#FFE5A0` |
| Error | Soft Red | `#FFABAB` |
| Info | Soft Blue | `#A8D8EA` |

---

## Typography

### Font Family

```css
/* Primary Font - Rounded Sans-Serif */
font-family: 'Nunito', 'Varela Round', 'M PLUS Rounded 1c', sans-serif;

/* Fallback for Japanese */
font-family: 'Nunito', 'M PLUS Rounded 1c', 'Hiragino Maru Gothic ProN', sans-serif;
```

### Font Sizes

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | 700 | 1.3 |
| H2 | 24px | 700 | 1.3 |
| H3 | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

---

## Spacing & Layout

### Spacing Scale

```
4px  - xs
8px  - sm
16px - md
24px - lg
32px - xl
48px - 2xl
64px - 3xl
```

### Border Radius

| Element | Radius |
|---------|--------|
| Cards | 20px |
| Buttons | 16px |
| Pill Buttons | 9999px (full round) |
| Input Fields | 12px |
| Badges | 8px |

### Shadows

```css
/* Card Shadow - Soft & Diffused */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

/* Hover Shadow - Slightly elevated */
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);

/* Button Shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
```

---

## Components

### Plugin Cards (Compact)

```
┌─────────────────────────────────┐
│  [Category Icon]                │
│                                 │
│  Plugin Name                    │
│  ★ 1,234  |  ELO: 1650         │
└─────────────────────────────────┘
```

**Specifications:**
- Width: 280px (responsive)
- Padding: 20px
- Border-radius: 20px
- Background: `#F5F0E6`
- Hover: Subtle scale (1.02) + shadow increase

### Category Tabs (Pill Buttons)

```
( All ) ( MCP ) ( Skill ) ( Hook ) ( Command )
```

**Specifications:**
- Padding: 8px 20px
- Border-radius: 9999px (pill)
- Active: Category color background
- Inactive: Transparent with border
- Transition: 200ms ease-in-out

### Rank Badges

| Rank | Badge Style |
|------|-------------|
| #1 | Gold badge with crown icon |
| #2 | Silver badge |
| #3 | Bronze badge |
| #4+ | Simple number in muted color |

**Badge Colors:**
- Gold: `#FFD700` with warm glow
- Silver: `#C0C0C0`
- Bronze: `#CD7F32`

### Voting Cards (Side-by-Side)

```
┌─────────────────┐  VS  ┌─────────────────┐
│                 │      │                 │
│   Plugin A      │      │   Plugin B      │
│   [Details]     │      │   [Details]     │
│                 │      │                 │
│  [ Vote ★ ]    │      │  [ Vote ★ ]    │
└─────────────────┘      └─────────────────┘
```

**Specifications:**
- Card width: 400px (desktop), 100% (mobile)
- VS divider: Soft coral color with gentle animation
- Vote button: Full-width, coral background

---

## Mascot: Plugin Neko (プラネコ)

### Character Concept

A friendly **cat character** that serves as the site's mascot and guide.

**Design Elements:**
- Soft, rounded body shape
- Large, friendly eyes
- Pastel color palette (cream/coral accents)
- Sometimes wears a small "plug" collar or carries a puzzle piece

**Usage:**
- Empty states ("No plugins found yet!")
- Loading states (animated)
- Success celebrations (happy expression)
- Error states (confused expression)
- Navigation helper (pointing paw)

**Expressions:**
1. Happy (default)
2. Curious (searching)
3. Excited (new plugin discovered)
4. Sleeping (loading)
5. Confused (error/not found)

---

## Animations

### General Principles

- **Duration**: 200-300ms for micro-interactions
- **Easing**: `ease-in-out` or `cubic-bezier(0.4, 0, 0.2, 1)`
- **No jarring movements**: Everything should feel soft and gentle

### Specific Animations

| Element | Animation |
|---------|-----------|
| Card Hover | Scale 1.02, shadow increase |
| Button Hover | Subtle brightness increase |
| Tab Switch | Fade + slide transition |
| Vote Submit | Soft pulse on selected card |
| Page Transition | Gentle fade (150ms) |
| Loading | Mascot sleeping animation |

```css
/* Standard transition */
transition: all 200ms ease-in-out;

/* Card hover */
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

---

## Page Layouts

### Home / Ranking Page

```
┌──────────────────────────────────────────────────┐
│  [Logo + Mascot]        [Search]     [Theme]     │
├──────────────────────────────────────────────────┤
│                                                  │
│  ( All ) ( MCP ) ( Skill ) ( Hook ) ( Command )  │
│                                                  │
│  Now ▼  |  Trend  |  Classic                     │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ #1 Gold │  │ #2 Silvr│  │ #3 Bronz│          │
│  │ Plugin  │  │ Plugin  │  │ Plugin  │          │
│  └─────────┘  └─────────┘  └─────────┘          │
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ #4      │  │ #5      │  │ #6      │          │
│  │ Plugin  │  │ Plugin  │  │ Plugin  │          │
│  └─────────┘  └─────────┘  └─────────┘          │
│                                                  │
│                  [Load More]                     │
└──────────────────────────────────────────────────┘
```

### Vote Page

```
┌──────────────────────────────────────────────────┐
│  [Logo]           Vote for the Best!      [Skip] │
├──────────────────────────────────────────────────┤
│                                                  │
│    Which plugin do you prefer?                   │
│                                                  │
│  ┌─────────────────┐    ┌─────────────────┐     │
│  │                 │    │                 │     │
│  │   Plugin A      │ VS │   Plugin B      │     │
│  │   ★ 500        │    │   ★ 320        │     │
│  │                 │    │                 │     │
│  │  [ Choose A ]   │    │  [ Choose B ]   │     │
│  └─────────────────┘    └─────────────────┘     │
│                                                  │
│              [ Can't Decide - Skip ]             │
│                                                  │
│  Your votes help improve rankings!  [Mascot]     │
└──────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Mobile Adaptations

- Cards: Single column, full width
- Vote cards: Stacked vertically
- Navigation: Hamburger menu
- Font sizes: Slightly reduced

---

## Accessibility

- Color contrast: Minimum 4.5:1 for text
- Focus states: Visible coral outline
- Touch targets: Minimum 44x44px
- Screen reader: Proper ARIA labels
- Reduced motion: Respect `prefers-reduced-motion`

---

## Dark Mode (Optional Future)

If implemented:
- Background: `#2D2D2D`
- Surface: `#3D3D3D`
- Text: `#F5F5F5`
- Accents: Slightly desaturated pastels

---

## Implementation Notes

### CSS Variables

```css
:root {
  /* Colors */
  --color-bg: #FFF8E7;
  --color-surface: #F5F0E6;
  --color-coral: #FFB7B2;
  --color-mint: #98D8C8;
  --color-text: #4A4A4A;
  --color-text-secondary: #7A7A7A;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.08);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: '#FFF8E7',
        beige: '#F5F0E6',
        coral: '#FFB7B2',
        mint: '#98D8C8',
      },
      borderRadius: {
        'card': '20px',
        'button': '16px',
      },
      fontFamily: {
        sans: ['Nunito', 'M PLUS Rounded 1c', 'sans-serif'],
      },
    },
  },
}
```

---

## References

- [タヌポータル (Animal Crossing: New Horizons)](https://www.nintendo.com/jp/switch/acbaa/portal/index.html) - Design inspiration
- [LMArena](https://lmarena.ai/) - Voting interface reference

---

*Last Updated: 2025-01-29*
