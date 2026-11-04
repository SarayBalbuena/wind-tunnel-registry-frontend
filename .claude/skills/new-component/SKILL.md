---
name: new-component
description: Scaffold a new React component in this repo following its conventions (folder per component, named arrow export, .types.ts, .module.css with dark mode + 480px breakpoint, colocated test). Use when the user asks to "create a component", "add a card/list/dialog/skeleton", "new UI piece", or "/new-component <Name>".
---

# New component

Creates a component that matches `docs/styleguide/components.md` and `docs/styleguide/styling.md`. Read those if anything below is unclear.

## 1. Decide placement

| Case | Location |
| --- | --- |
| New feature area | `src/components/<Feature>/<Feature>.tsx` |
| Sub-part of an existing feature | `src/components/<Feature>/<Feature><Part>/<Feature><Part>.tsx` (e.g. `Entries/EntriesCard/`) |
| Route-level screen | use the `new-page` skill instead |
| Generic Chakra wrapper (dialog, menu…) | `src/components/ui/<kebab-name>.tsx` — follow existing `ui/` file style |

Decide **container** (reads hooks/context, handles loading/error/empty) vs **presentational** (props only). Presentational components must not call data hooks.

## 2. Create files

`<Name>.types.ts`
```ts
export interface <Name>Props {
  title: string;
  variant?: 'default' | 'individual' | 'shared';
}
```

`<Name>.tsx`
```tsx
import { getClassNames } from '@services/utils/getClassNames.ts';
import { type <Name>Props } from './<Name>.types.ts';
import styles from './<Name>.module.css';

export const <Name> = ({ title, variant = 'default' }: <Name>Props) => {
  const classes = getClassNames({
    [styles.<camelName>]: true,
    [styles[variant]]: variant !== 'default',
  });

  return (
    <div className={classes} data-testid="<kebab-name>">
      {title}
    </div>
  );
};
```

`<Name>.module.css` — section order: base → variants → dark → elements → fallback → mobile.
```css
.<camelName> {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  color: var(--chakra-colors-fg);
}

/* --- Variants --- */
.individual { --accent: var(--chakra-colors-blue-600); }
.shared { --accent: var(--chakra-colors-purple-600); }

/* --- Dark mode --- */
:global(.dark) .<camelName> {
  /* overrides */
}

@media (max-width: 480px) {
  .<camelName> {
    padding: 8px 10px;
  }
}
```

Container components additionally:
```tsx
const { data, isLoading, error } = useDashboardData(); // or a dedicated hook
if (isLoading) return <<Name>Skeleton />;
if (error) return <div className={styles.error}>Error loading …</div>;
if (!data?.length) return <div className={styles.empty}>Nothing here yet.</div>;
```
→ also create `<Name>Skeleton/<Name>Skeleton.tsx` reusing the real component's CSS classes with Chakra `<Skeleton>` blocks.

Use a `<Name>.helpers.ts` for pure logic and `<Name>.styles.ts` for shared Chakra prop objects when needed.

## 3. Rules checklist

- [ ] Named arrow export, props destructured with defaults, no default export
- [ ] Aliased imports across folders, `import { type X }` for types
- [ ] Chakra components styled with props (`_dark` for dark); plain elements with CSS Modules
- [ ] Colors via `var(--chakra-colors-*)`; blue = individual, purple = shared, red = destructive
- [ ] Icon-only buttons have contextual `aria-label`; semantic HTML
- [ ] Stable `key`s, durations via `getTimeParts`
- [ ] No `useMemo`/`useCallback` by default (React Compiler is on)

## 4. Test

Create `<Name>.test.tsx` next to the component — follow the `testing` skill. At minimum: renders with props; for containers: loading/data, error (via `mockFetchResponse`), empty.

## 5. Verify

```bash
pnpm lint:fix && pnpm lint && pnpm build && pnpm test -- --run src/components/<Feature>
```

Report what was created and the verification output.
