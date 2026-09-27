# DZRent Project State & Admin Design System

This document describes the state of the DZRent codebase and documents the admin presentation design system established during the Donezo SaaS redesign.

---

## 1. Admin Design System (Donezo Visual Target)

The admin panel (`/app/[lang]/admin`) uses a dedicated presentation layer that strictly decouples internal platform management from the consumer-facing marketing site.

### Design Tokens

- **Canvas Background**: `#F6F7F9` (soft neutral canvas).
- **Cards**: Pure white (`#FFFFFF`), `rounded-2xl` (16px radius), zero visible 1px borders, layered soft ambient shadow:
  - Base shadow: `0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04)`
  - Hover shadow: `0 2px 4px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)`
  - Hover lift: `translateY(-2px)` on interactive cards via `.admin-card-hover`.
- **Primary Brand Blue**: `#0071E3` (`brand-500` / `brand-600` on hover, `bg-blue-50` / `bg-brand-50` for tints). This is the single source of truth for all primary CTAs, active states, and accents. Purple and violet have been completely eliminated from the admin interface.
- **Typography**: Font-family is strictly preserved (`--font-heading`, `--font-body`, Cairo for Arabic, SF Pro / Inter for Latin).
  - Page titles: `text-2xl md:text-3xl font-bold tracking-tight`
  - Stat numbers: `text-3xl md:text-4xl font-bold tracking-tight`
  - Card titles: `text-sm font-semibold`
  - Eyebrows: `text-xs font-medium uppercase tracking-wide text-neutral-400`
  - Secondary/Caption: `text-xs text-neutral-400/500`

---

## 2. Spacing System Scale

To prevent eyeballing and density mismatch:

| Element | Desktop (`>= md`) | Mobile (`< md`) | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Page Gutters** | 32px | 24px | `px-6 md:px-8` |
| **Vertical Rhythm** | 32px between sections | 24px | `space-y-6 md:space-y-8` |
| **Grid Gaps** | 24px | 16px | `gap-4 md:gap-6` |
| **Card Padding** | 24px everywhere | 16px | `p-4 md:p-6` |
| **StatCard Rhythm** | Icon/title row → 12px → Big number → 4px → Caption/trend | Same | `mt-3`, `mt-1` |
| **Sidebar Nav Items** | 44px min-height, 4px gap | 44px | `min-h-[44px]`, `space-y-1` |
| **Topbar Height** | 64px fixed | 64px | `h-16` |

---

## 3. Status Color Mapping

Applied consistently across all pages:

| Status Group | Color | Classes | Examples |
| :--- | :--- | :--- | :--- |
| **Available / Completed** | Green | `bg-emerald-50 text-emerald-700` | Ready for rent, confirmed, completed |
| **Rented / On Road / Active** | Blue | `bg-blue-50 text-blue-700` | On road, active rental, deposit paid |
| **Maintenance / Pending** | Amber | `bg-amber-50 text-amber-700` | Inspection, service, pending approval |
| **Retired / Cancelled** | Gray | `bg-gray-100 text-gray-600` | Archived vehicle, cancelled reservation |

---

## 4. Reusable Admin Component Library (`components/admin/`)

All admin pages reuse components from `@/components/admin`:

- **`<SectionCard>`**: Standard `rounded-2xl bg-white p-4 md:p-6` wrapper with layered shadow and zero 1px borders.
- **`<StatCard variant="default" | "highlight">`**:
  - `variant="highlight"`: Solid primary-blue (`bg-brand-500 text-white`) card used for exactly ONE hero metric per page (e.g. Total Revenue on Overview).
  - `variant="default"`: Crisp white card with soft layered shadow.
  - Strict internal rhythm (`mt-3` and `mt-1`).
- **`<StatusBadge>`**: Rounded-full pill badge with automatic semantic color resolution or explicit `color="green"|"blue"|"amber"|"gray"`.
- **`<Avatar>`**: Circular avatar supporting photo `src` or colored initials fallback with blue/neutral tints. Sizes: `sm` (28px), `md` (36px), `lg` (44px).
- **`<NavItem>`**: Sidebar navigation item with fixed height (`min-h-[44px]`), active indicator bar (`border-s-[3px] border-brand-500`), and RTL compatibility.
- **`<AdminTopbar>`**: App-shell header with DZRent mark, rounded-full search bar with `⌘K` shortcut, circular notification bell, language switcher, and avatar dropdown with Sign Out.
- **`<AdminSidebar>`**: Platform Control sidebar with Superadmin pill, active route tracking, Sign Out, and optional help card.
- **`<AdminShellClient>`**: Client wrapper connecting topbar, sidebar drawer, and main content on `#F6F7F9` canvas.
- **`<EmptyState>`**: Updated with blue-tinted icon circle (`bg-blue-50 text-brand-600`) and solid primary-blue CTA pill.

---

## 5. Non-Touch Boundaries & Invariants

The following architectural layers remain untouched:
1. **Data Logic & Supabase Queries**: No schema changes, queries, mutations, or RLS policy alterations.
2. **Route Structure**: All URLs (`/[lang]/admin/...`) remain strictly preserved.
3. **i18n & RTL**: Trilingual dictionaries (`ar`, `fr`, `en`) and Arabic RTL orientation (`rtl:`, `border-s-`) fully functional.
