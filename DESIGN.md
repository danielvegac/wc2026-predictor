# WC2026 Predictor — Design System

## Anti-patterns (NEVER use these)
- NEVER use Inter, Roboto, Open Sans, Lato, or system-ui as the primary font
- NEVER use glassmorphism (backdrop-filter: blur, frosted glass cards)
- NEVER use border-radius above 6px on cards or data components
- NEVER use box-shadow on cards — use border-only depth
- NEVER use purple, violet, or blue-gray as accent colors
- NEVER use Tailwind's amber-500 (#F59E0B) — use our custom #F0B429
- NEVER use bg-white or bg-gray-* in dark mode — use our bg-surface tokens
- NEVER use colored left-borders on cards (AI slop tell)
- NEVER use gradients as card backgrounds
- NEVER use all-caps section labels as a stylistic default
- NEVER use medium-gray (#6B7280 range) for body text in dark mode — too low contrast

## Typography
- UI font: DM Sans (weights 300, 400, 500, 700)
- Data font: DM Mono (weights 400, 500) — use for scores, numbers, stats
- Display numbers (match scores): DM Mono 700, 1.5-2.5rem
- Body text: DM Sans 400, 0.875rem
- Labels/meta: DM Sans 500, 0.75rem
- Section headers: DM Sans 700, 0.875rem, NOT all-caps

## Dark theme tokens
- --color-bg-base: #09090B       (zinc-950, near-black, NOT blue-tinted)
- --color-bg-surface: #141414    (card surfaces, 1 step above base)
- --color-bg-elevated: #1C1C1E   (modals, dropdowns)
- --color-border: #27272A        (zinc-800, subtle)
- --color-border-strong: #3F3F46 (zinc-700, emphasis)
- --color-text-primary: #FAFAFA  (zinc-50, bright)
- --color-text-secondary: #A1A1AA (zinc-400, secondary — NOT gray-500)
- --color-text-muted: #52525B    (zinc-600, muted)
- --color-accent: #F0B429        (warm amber, saturated)
- --color-accent-dim: #78530A    (accent background tint)
- --color-success: #22C55E       (green-500)
- --color-error: #EF4444         (red-500)
- --color-info: #3B82F6          (blue-500)

## Light theme tokens
- --color-bg-base: #FAFAFA       (zinc-50)
- --color-bg-surface: #FFFFFF    (pure white cards)
- --color-bg-elevated: #F4F4F5   (zinc-100)
- --color-border: #E4E4E7        (zinc-200)
- --color-border-strong: #D4D4D8 (zinc-300)
- --color-text-primary: #09090B  (zinc-950)
- --color-text-secondary: #52525B (zinc-600)
- --color-text-muted: #A1A1AA    (zinc-400)
- --color-accent: #D97706        (amber-600 — darker for light bg contrast)
- --color-accent-dim: #FEF3C7    (amber-100 tint)
- --color-success: #16A34A       (green-600)
- --color-error: #DC2626         (red-600)
- --color-info: #2563EB          (blue-600)

## Card design rules
- Background: var(--color-bg-surface)
- Border: 1px solid var(--color-border)
- Border-radius: 6px (rounded-md in Tailwind) — NEVER rounded-lg or higher
- Shadow: NONE — depth comes from borders only
- Padding: 12px 16px (compact, data-forward)
- NO backdrop-filter, NO blur, NO opacity tricks

## Spacing philosophy
- Radical minimalism: more space than you think you need
- Between cards in a grid: 12px gap
- Within a card: 12px padding
- Section separation: 32px or a simple 1px border line
- NO decorative dividers, NO gradient separators

## Score/number display
- Use DM Mono for ALL numerical data
- Match scores: font-mono font-bold text-xl minimum
- Probabilities: font-mono text-sm
- The score is the hero — give it space and weight

## Accent usage
- One accent color only: #F0B429
- Use for: current pick indicator, model prediction highlight, live badge
- NOT for: borders, backgrounds, icon fills (unless single-purpose icon)
