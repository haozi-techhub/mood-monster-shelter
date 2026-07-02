---
name: Ethereal Whimsy
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e1'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fb'
  surface-container: '#f2ecf5'
  surface-container-high: '#ece6ef'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b21'
  on-surface-variant: '#494551'
  inverse-surface: '#322f36'
  inverse-on-surface: '#f5eff8'
  outline: '#7a7583'
  outline-variant: '#cac4d3'
  surface-tint: '#674ead'
  primary: '#674ead'
  on-primary: '#ffffff'
  primary-container: '#b197fc'
  on-primary-container: '#442888'
  inverse-primary: '#cfbdff'
  secondary: '#006e2e'
  on-secondary: '#ffffff'
  secondary-container: '#97f4a4'
  on-secondary-container: '#087232'
  tertiary: '#006496'
  on-tertiary: '#ffffff'
  tertiary-container: '#61aee9'
  on-tertiary-container: '#004063'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cfbdff'
  on-primary-fixed: '#21005d'
  on-primary-fixed-variant: '#4e3493'
  secondary-fixed: '#9af7a7'
  secondary-fixed-dim: '#7eda8d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#91cdff'
  on-tertiary-fixed: '#001e31'
  on-tertiary-fixed-variant: '#004b72'
  background: '#fdf7ff'
  on-background: '#1d1b21'
  surface-variant: '#e6e0e9'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter-card: 16px
  padding-inner: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built for a "Grotesque-cute" emotional companion experience. It balances the vulnerability of a personal journal with the playful energy of a digital scrapbook. The personality is "whimsically toxic"—a blend of gentle healing and sarcastic, honest companionship.

The visual style is **Tactile Glassmorphism**. It combines soft, jelly-like textures with the structural elements of a physical journal (washi tape, stamps, and thin ink outlines). The goal is to evoke a "safe harbor" feeling that doesn't feel overly clinical or childish, but rather a sophisticated, slightly surreal space for adult emotional processing.

**Key Visual Pillars:**
- **Jelly-Texture:** Semi-transparent, iridescent gradients that mimic the mascot’s glowing, ethereal nature.
- **Scrapbook Utility:** Use of "file numbers" and "stamps" to give emotional entries a sense of organized chaos.
- **Wink & Wit:** High-contrast interactions that pair soft visuals with sharp, sarcastic micro-copy.

## Colors

The palette is anchored by a warm, creamy off-white background that mimics high-quality paper. The primary purple is used for core interactions and the mascot's spirit.

- **Primary (#B197FC):** Used for "healing" actions and the primary jelly gradient.
- **Accents:** Mint Green (Success/Growth), Sky Blue (Calm/Reflection), Peach Pink (Affection), and Star Yellow (Insight/Alerts).
- **Ink Border (#4D4D4D):** A 1px dark grey-purple used for "hand-drawn" structural lines, ensuring the soft colors remain grounded and legible.

Use iridescence where possible—gradients should transition from the primary purple into sky blue or peach pink to mimic light hitting a translucent surface.

## Typography

The typography system uses rounded, friendly sans-serifs to maintain an approachable tone. 

- **Headlines:** Use **Plus Jakarta Sans** for its soft curves and modern geometry. It feels "grown-up" but stays within the "cute" aesthetic.
- **Body:** **Be Vietnam Pro** provides exceptional readability for long-form journal entries while feeling contemporary.
- **Labels & System Data:** **Space Grotesk** is used for "File Numbers," dates, and sarcastic AI side-notes. Its slightly technical, geometric vibe adds the "grotesque" or "monstrous" efficiency required by the shelter theme.

All typography should use the "Ink Border" color rather than pure black to keep the look soft against the cream background.

## Layout & Spacing

This design system utilizes a **Mobile-First Portrait Fluid Grid** (9:16 aspect ratio). 

- **Safe Zones:** Maintain a 24px margin on the left and right edges to allow for the "scrapbook" elements (like stickers or tape) to slightly bleed off the edges without obscuring critical content.
- **The "Stack" Philosophy:** Content is organized in floating cards. Vertical rhythm is driven by the mascot's presence; the top 40% of the screen is typically reserved for the "Monster Interaction Zone," while the bottom 60% houses the "Journaling/Shelter Utility" cards.
- **Dynamic Overlap:** Elements should occasionally overlap (e.g., a sticker placed on the corner of a card) to break the rigid digital grid and reinforce the scrapbook feel.

## Elevation & Depth

Hierarchy is achieved through **Tonal Stacking** and **Backdrop Blurs** rather than traditional heavy shadows.

- **Level 1 (Base):** The Creamy Off-White background (#FFFBF5).
- **Level 2 (Cards):** Pure white surfaces with a 1px "Ink" border and a very soft, diffused purple-tinted shadow (10% opacity, 20px blur).
- **Level 3 (Interactive/Glass):** Frosted glass panels (Background blur: 15px, Opacity: 60%) used for modal overlays or the mascot's speech bubbles.
- **Level 4 (Stickers/Washi Tape):** Flat, high-contrast elements with 0px blur shadows, appearing as if they are physically stuck onto the UI.

Depth should feel "shallow," like layers of paper and thin glass stacked on a desk.

## Shapes

The shape language is dominated by "Squircle" geometry—extra-rounded corners that feel organic and "squishy."

- **Primary Cards:** Use a minimum of 32px corner radius.
- **Buttons & Input Fields:** Use pill-shaped (fully rounded) containers to mimic the mascot's fluid form.
- **Washi Tape:** Rectangular with slightly "torn" or jagged ends (randomized) to add tactile grit to the soft UI.
- **Stickers:** Die-cut shapes with a thin white offset border and a subtle 1px ink outline.

## Components

### Buttons
- **Primary:** Gradient fill (Purple to Blue), pill-shaped, with a subtle inner glow. On press, the button should "squish" (scale 0.95).
- **Secondary:** Ghost style with 1px Ink Border and a small "Stamp" icon.

### Cards
- Large white surfaces with 32px corners.
- Must include a "Reference Number" in the top right in Space Grotesk (e.g., #MM-902).
- Optional washi tape graphic at the top center to "hold" the card to the screen.

### Chips (Mood Selectors)
- Jelly-like appearance with semi-transparent fills.
- When selected, they should "glow" with a heart icon appearing next to the label.

### Input Fields
- Soft white fill with a subtle inner shadow to look "recessed."
- Text should look hand-written (high line height).

### The Mascot (Interactive Component)
- Positioned centrally or peeking from the side.
- Gradient: `linear-gradient(135deg, #B197FC 0%, #74C0FC 100%)`.
- Floating animation with a "breathing" scale effect.

### Stickers & Stamps
- Used as decorative status indicators (e.g., a "HEALED" stamp or a "TOXIC" star sticker).
- Placed at 5-10 degree angles to disrupt the horizontal lines.