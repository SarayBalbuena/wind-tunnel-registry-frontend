# Styling

Two tools, clear split:

| Use | For |
| --- | --- |
| **CSS Modules** (`Foo.module.css`) | Layout, custom visuals (glass cards, gradients), responsive rules, dark-mode overrides on plain elements |
| **Chakra style props** | Chakra components (`Button`, `Badge`, `IconButton`, `Dialog.*`, `Field`), spacing tweaks on them |
| `<Name>.styles.ts` | Reusable Chakra style-prop objects shared across several Chakra elements (see `EntryFormDialog.styles.ts`) |

Don't use inline `style={{}}`, emotion `css`, or global CSS.

## Tokens

The theme lives in `src/theme.ts` (Chakra `createSystem` on top of the defaults, Inter font). It adds semantic tokens that switch automatically in dark mode: `surface.page|card|border`, `session.individual|shared|total.fg|accent|subtle`, the `card` shadow and the `card` radius. In CSS, reference Chakra CSS variables:

```css
color: var(--chakra-colors-fg);
color: var(--chakra-colors-fg-subtle);
color: var(--chakra-colors-fg-muted);
border-bottom: 1px solid var(--chakra-colors-border);
background: var(--chakra-colors-bg);
color: var(--chakra-colors-blue-800);
```

Prefer semantic tokens (`fg`, `fg.muted`, `bg`, `border`) — they switch automatically in dark mode.

## Colour language

| Meaning | Palette |
| --- | --- |
| Individual / 1-on-1 | `blue` |
| Shared / Group | `purple` |
| Total | `teal` |
| Destructive | `red` |
| Focus ring | `blue.400` (light) / `blue.300` (dark) |

## Visual style: tinted flat cards

Cards are solid, not frosted glass:
- `surface.card` background with a `color-mix()` tint of the variant accent, a 1px tinted border and the `card` shadow
- a 4px accent bar on the left edge (`::before` on report cards, `border-left` on entry cards)
- `border-radius: var(--chakra-radii-card)` (14px)
- the page background (`Layout.module.css`) has blue, purple and teal radial glows over `surface.page`
- backdrop blur is used only on the sticky nav

Variants set **CSS custom properties**, elements consume them:

```css
.individual { --label-color: var(--chakra-colors-blue-800); }
.reportsCardLabel { color: var(--label-color); }
```

## Dark mode

Color mode is class-based (`next-themes` adds `.dark` on `<html>`).

```css
:global(.dark) .entriesCard { background: …; }
```

In Chakra props use `_dark={{ … }}`.

## Responsive

- Mobile-first isn't strict here; the established breakpoint is **`@media (max-width: 480px)`** at the bottom of each module.
- Chakra responsive props for Chakra components: `size={{ base: 'xs', md: 'sm' }}`.
- On mobile: reduce padding/gaps, shrink type, hide secondary text (e.g. `.reportsCardDescription { display: none; }`).

## Class composition

```ts
import { getClassNames } from '@services/utils/getClassNames';

const classes = getClassNames({
  [styles.reportsCard]: true,
  [styles[type]]: true,
  [className ?? '']: !!className,
});
```

## Typography scale in use

| Role | Size / weight |
| --- | --- |
| Card label | 18px / 700, uppercase |
| Body / description | 16px / 400 |
| Meta (date, unit) | 14px / 500–600 |
| Big number | 36px / 800 (24px mobile) |
| Entry minutes | 20px / 700 |

## CSS module conventions

- camelCase class names, prefixed by component (`.reportsCardLabel`).
- Comments in English (`/* --- Variants: Total --- */`).
- Order inside a file: base block → variants → dark mode → elements → `@supports` fallback → `@media`.
