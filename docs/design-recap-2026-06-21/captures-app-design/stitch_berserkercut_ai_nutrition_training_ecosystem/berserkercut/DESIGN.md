---
name: BerserkerCut
colors:
  surface: '#1e0f0f'
  surface-dim: '#1e0f0f'
  surface-bright: '#473534'
  surface-container-lowest: '#180a0a'
  surface-container-low: '#271717'
  surface-container: '#2c1b1b'
  surface-container-high: '#372625'
  surface-container-highest: '#433030'
  on-surface: '#f9dcda'
  on-surface-variant: '#e4bebc'
  inverse-surface: '#f9dcda'
  inverse-on-surface: '#3e2c2b'
  outline: '#ab8987'
  outline-variant: '#5b403f'
  surface-tint: '#ffb3b1'
  primary: '#ffb3b1'
  on-primary: '#680011'
  primary-container: '#ff535b'
  on-primary-container: '#5b000e'
  inverse-primary: '#bb152c'
  secondary: '#ffbd5c'
  on-secondary: '#452b00'
  secondary-container: '#ec9e00'
  on-secondary-container: '#5b3b00'
  tertiary: '#9ecfd1'
  on-tertiary: '#003739'
  tertiary-container: '#68999b'
  on-tertiary-container: '#002f31'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#ffddb3'
  secondary-fixed-dim: '#ffb950'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#b9ecee'
  tertiary-fixed-dim: '#9ecfd1'
  on-tertiary-fixed: '#002021'
  on-tertiary-fixed-variant: '#1a4e50'
  background: '#1e0f0f'
  on-background: '#f9dcda'
  surface-variant: '#433030'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-technical:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system embodies a high-intensity, "Berserker" aesthetic designed for peak performance and athletic dominance. The target audience consists of dedicated athletes and fitness enthusiasts who value precision, grit, and data-driven progress.

The visual style is **Industrial Technical**, blending the raw power of **Brutalism** with the sophisticated layering of **Glassmorphism**. The UI should evoke an emotional response of adrenaline and focus, utilizing deep onyx surfaces and sharp-edged geometry to create a "tactical interface" feel. Imagery should be high-contrast, moody, and emphasize physical form and texture.

## Colors

The palette is anchored by a deep charcoal background to minimize ocular strain during intense training and maximize the vibrance of the accent colors. 

- **Primary (Berserker Red):** Reserved for high-priority actions, critical alerts, and PR achievements. 
- **Secondary (Primal Orange):** Used for energy levels, active timers, and metabolic data.
- **Steel Gray:** Provides the structural, technical framework for data grids and borders.
- **Success:** Dedicated to adherence metrics (e.g., meeting macro targets or completing sets).

## Typography

The typography strategy leverages high-impact contrast. **Anton** is used for headlines to provide an aggressive, cinematic feel, always set in uppercase to emphasize authority. **Inter** handles the heavy lifting of data reading, ensuring clarity in low-light gym environments. 

**JetBrains Mono** is introduced for "Technical Labels" (e.g., set numbers, timestamps, macro grams), reinforcing the industrial, data-heavy nature of the app.

## Layout & Spacing

This design system uses a **Fluid Grid** model with a 4px base unit. 

- **Mobile:** 4-column layout with 16px margins.
- **Desktop/Tablet:** 12-column layout with 24px-32px margins.

Spacing should feel tight and efficient. Use "tight" spacing (4px-8px) for related data points (e.g., Reps vs Weight) and "loose" spacing (24px+) to separate distinct training blocks or nutrition meals.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**. 

1. **Base:** `#0D0D0D` (Background)
2. **Surface:** `#1A1A1A` (Standard Cards) with a 1px `Steel Gray` (#A8DADC) border at 10% opacity.
3. **Overlay:** Use semi-transparent `#1A1A1A` with a 20px backdrop blur for modal elements and the futuristic tab bar.

Avoid soft ambient shadows. If depth is required, use a 1px solid stroke or a high-contrast inner glow to simulate a metallic or glass edge.

## Shapes

The design system utilizes **Sharp (0px)** corners for the majority of UI elements to maintain a brutalist, aggressive aesthetic. 

- **Exceptions:** Only use circular shapes for functional progress rings or specific "status" indicators. 
- **Buttons:** Must be perfectly rectangular. 
- **Cards:** Sharp corners with high-contrast borders.

## Components

### Buttons
- **Primary:** Solid `Berserker Red` background with white uppercase `Anton` text. No rounded corners.
- **Technical:** Ghost style with `Steel Gray` border and `JetBrains Mono` text.

### Progress Rings
- Use a thick stroke (8px-12px) for Macro rings. 
- Track color: `#1A1A1A`. 
- Active color: `Primary` or `Success`. 

### Technical List Items (Workout Sets)
- Utilize a grid-based row. 
- Set numbers in `JetBrains Mono` with a subtle vertical `Steel Gray` divider separating the "Exercise Name" from "Load/Reps".

### Futuristic Tab Bar
- Positioned at the bottom, using a frosted glass background (`#1A1A1A` at 80% opacity with backdrop blur).
- Top border: 1px solid `Berserker Red` to indicate the active state via a sliding underline.

### Input Fields
- Sharp edges, dark background, and a 1px bottom-border that glows `Primal Orange` when focused.