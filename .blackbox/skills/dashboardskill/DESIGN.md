---
name: Construct Friendly
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#efecf8'
  surface-container-high: '#e9e7f2'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b23'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#fbf8ff'
  on-background: '#1a1b23'
  surface-variant: '#e3e1ec'
typography:
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The brand personality is centered on making complex construction workflows feel approachable and less intimidating. By moving away from the industry-standard heavy slates and industrial grays, the design system utilizes a "Soft Professionalism" style—a hybrid of modern SaaS minimalism and tactile warmth. 

The emotional response should be one of calm reliability. The UI avoids aggressive "safety" aesthetics in favor of a bright, airy workspace that feels like a modern office environment rather than a dusty job site. Key attributes include high legibility, generous whitespace to reduce cognitive load, and a friendly, supportive tone conveyed through soft shapes and subtle depth.

## Colors
The palette is designed to be refreshing and high-visibility without being harsh.
- **Primary (Teal):** Used for main actions, active states, and brand presence. It suggests growth and precision.
- **Secondary (Amber):** Reserved for alerts, safety warnings, and status indicators that require attention without inducing panic.
- **Background (Mint/Grey):** A very light, tinted wash that reduces eye strain compared to pure white while maintaining a clean, modern feel.
- **Neutral:** A medium-soft zinc/grey used for body text and secondary icons to maintain high contrast against the mint background without the "heaviness" of black.

## Typography
The system uses a pairing of **Lexend** for headings and **Inter** for UI and body text. 
- **Lexend** provides a friendly, geometric structure that aids readability for users who may be viewing screens in variable lighting conditions on-site.
- **Inter** is used for its exceptional clarity in data-heavy tables and forms.
Maintain a "balanced" scale; avoid excessive font sizes to maximize information density while ensuring that touch targets and labels remain comfortably legible for all users.

## Layout & Spacing
The layout follows a **fluid grid** logic with specific constraints to ensure usability on tablets (common in the field). 
- **Grid:** A 12-column system for desktop, shifting to a 4-column system for mobile.
- **Rhythm:** Use an 8px base unit. Padding within cards and containers should default to `md` (16px) or `lg` (24px) to provide "breathing room" that prevents the software from feeling cluttered.
- **Safe Zones:** Ensure all interactive elements have a minimum 44px tap target height, regardless of the visual size of the component, to accommodate use with gloves or in high-movement environments.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and **Tonal Layering**. 
- **Shadows:** Use extremely soft, diffused shadows with a slight Teal tint (`rgba(13, 148, 136, 0.08)`) to lift cards off the Mint background. Avoid harsh blacks.
- **Surface Layering:** The base background is the Mint wash. Interactive cards use a pure white surface to create a natural hierarchy.
- **Gradients:** Subtle top-to-bottom linear gradients (e.g., Primary Teal to a slightly lighter Teal) can be used on primary action buttons to give them a "touchable," tactile quality without appearing dated.

## Shapes
The shape language is defined by **Soft Roundedness**. 
- Standard components (buttons, inputs) use a **12px** (0.75rem) corner radius.
- Larger containers like cards and modals use a **16px** (1rem) radius.
- Selection indicators and tags use a fully rounded **Pill** shape.
This consistent curvature reinforces the "friendly" and "approachable" brand personality, removing the aggressive edges often found in industrial software.

## Components
- **Buttons:** Primary buttons feature a subtle gradient and 12px rounded corners. Secondary buttons should use a ghost style with a 1.5px border in the Primary Teal color.
- **Inputs:** Fields should have a white background, a soft 1px border (#ccf2f4), and 12px rounding. Active states use a 2px Teal glow.
- **Cards:** Elevate cards with the "Ambient Shadow" defined in the Elevation section. Use 16px padding as the standard.
- **Chips/Status:** Use the Secondary Amber for "Pending" or "Warning" and the Primary Teal for "Completed" or "Active." Chips are always pill-shaped.
- **Icons:** Use "Duotone" or rounded line icons. Icons should be multi-colored, using soft tints of the primary and secondary palette to aid quick visual recognition of different tool categories (e.g., Blue for documents, Amber for safety, Teal for tasks).
- **Progress Bars:** Use thick, rounded tracks (8px height) with the Primary Teal as the fill color to make project completion feel rewarding.