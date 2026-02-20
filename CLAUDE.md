# Tuesday UI

## What This Is

Tuesday is a cross-platform app for real estate agents. Social + productivity: browse MLS listings, manage deals, create presentations, follow agents, chat, share to Instagram Stories.

This repo (`tuesday-ui`) is the monorepo containing the Expo app, design system, and documentation.

## Tech Stack

- **Framework**: Expo 52 + Expo Router 4 (file-based routing)
- **Language**: TypeScript (strict)
- **Styling**: NativeWind v4 + Tailwind CSS v3 — use `className` for layout, inline `style` for dynamic/theme values
- **Icons**: Phosphor React Native (`weight="fill"` for active, `weight="bold"` for inactive tabs, `weight="regular"` for SideNav/actions)
- **Animations**: Reanimated 3 (no Animated API, no LayoutAnimation)
- **Fonts**: Geist Sans (Light/Regular/Medium/SemiBold/Bold), GeistMono (nav labels)
- **Dark mode**: System-follows via `useColorScheme()` + CSS `prefers-color-scheme` in global.css

## Monorepo Structure

```
apps/
  tuesday/          — Main Expo app (the product)
  docs/             — Documentation site (GitHub Pages)
  playground/       — Component playground

packages/
  tokens/           — Design tokens (colors, typography, spacing, radii, tailwind-preset)
  ui/               — Shared UI components (Button, Card, Avatar, TextField, etc.)
  hooks/            — Shared hooks (useTheme)
  utils/            — Utilities
```

## App Architecture (apps/tuesday)

Routes and layouts live in `app/`. Components, hooks live next to the app — no `src/` directory.

```
app/
  _layout.tsx                 — Root (fonts, providers, splash)
  (tabs)/
    _layout.tsx               — Responsive: <Tabs> on mobile, <SideNav> + <Slot> on desktop
    feed.tsx
    search.tsx
    saved.tsx
    ai.tsx                    — Hidden from tabs (href: null), AI is always a FAB
    work/
      _layout.tsx             — Stack on mobile, Slot on desktop
      index.tsx               — Mobile: section list; Desktop: redirects to /work/actions
      actions.tsx
      deals.tsx
      links.tsx
      clients.tsx
      team.tsx
    profile.tsx

components/
  SideNav.tsx                 — Desktop web side navigation
  AIFab.tsx                   — Floating AI button (all platforms)
  ScreenHeader.tsx            — Reusable screen header with back button + right actions
  TuesdayLogo.tsx             — SVG logo component

hooks/
  useIsDesktopWeb.ts          — useIsDesktopWeb() + useNavMode() → mobile | collapsed | expanded
  useThemeColors.ts           — Returns resolved dark/light color values from tokens
```

### Navigation Pattern

- **Mobile (native + mobile web)**: 5 bottom tabs (Feed, Search, Saved, Work, Profile). AI is a floating button.
- **Desktop collapsed (768–1264px)**: SideNav 72px wide, expands on hover. Work sub-items promoted to top-level.
- **Desktop expanded (>= 1264px)**: SideNav 220px wide, always visible. Work sub-items promoted to top-level.
- AI is a floating button on all platforms. Not in tabs, not in SideNav.
- Single route tree for all form factors. `useNavMode()` switches layout.
- Desktop side nav uses `router.replace()` (no back-stack buildup).

## Design Decisions

| Decision | Answer |
|----------|--------|
| Font | Geist Sans (5 weights) |
| Icons | Phosphor React Native |
| Color system | Semantic + gray scale (dark-first with `.light` variant) |
| Dark mode | System-follows |
| Card style | Shadows |
| Loading state | Shimmer / Skeleton |
| Border radius | `md` = 8px (default), `sm` = 4px, `lg` = 12px |
| Animation lib | Reanimated only |

## Color System

Colors are defined dark-first in `packages/tokens/src/colors.ts`:
```ts
{ DEFAULT: '#000000', light: '#FFFFFF' }  // DEFAULT = dark mode value
```

Use `useThemeColors()` hook to resolve colors in components. Alias it as `t`:
```ts
const t = useThemeColors();
// t.background, t.foreground, t.foregroundMuted, t.border, etc.
```

## Component Patterns (packages/ui)

All shared components follow this pattern:
- Accept `className` prop for styling overrides
- Use `React.forwardRef` for native ref access
- Use `cn()` from `@tuesday-ui/utils` for class merging
- Variant-based styling via `Record<Variant, string>` maps
- Sizes: `sm`, `md` (default), `lg`

Typography uses iOS naming: `caption`, `footnote`, `body`, `title1`, `largeTitle` (not h1/h2/h3).

Spacing is on a 4px grid. Standard input height is `h-10`.

## Code Style

- TypeScript strict — no `any`, no `as` casts unless truly needed
- Keep components small and focused
- Prefer composition over inheritance
- Don't over-engineer — build what's needed now

## Working Rules

- NEVER commit without explicit permission
- NEVER push without explicit permission
- When unsure between approaches, ask — don't guess

## Planned (not yet installed)

- **Backend**: Convex (real-time database, will replace REST API)
- **Images**: expo-image (NOT React Native Image)
- **Data fetching**: React Query / TanStack Query (server state)
- **Lists**: FlashList (for large virtualized lists)

## App Feature Map

```
Feed        — Swiper view, Timeline view
Search      — MLS search, Agent search
Saved       — Saved listings
AI          — Chat UI with /listing, /present commands
Profile     — Profile view, Notifications, Settings
Work
  Actions   — Timeline, Inbox, Scheduled
  Deals     — Listings (with action timeline), Buying (with saved search)
  Links     — Website, Presentations, Comp links, Buyer market updates
  Clients   — Buyers, Sellers, Leads
  Team      — Real estate team, TC, Brokerage, Vendors
```
