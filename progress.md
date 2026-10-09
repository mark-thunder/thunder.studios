# Progress — Thunder Studios

What exists outside the code, how the parts fit, and every decision a first-time
reader could not work out from the code (PoSD 13.7, a design-notes file: one
section per topic, each decision once). Not repeated here: framework rules
(`LUMOS.md`, `AGENTS.md`, `component-rules.md`), versions (`package.json`; Lumos
0.0.4 at `42d4897`), history (`git log`), open work (`backlog.md`), licences
(`LICENSES.md`). State as of 10-09.

**Keeping it current.** Every change that lands updates this file in the same
commit, by editing what it changes, never by appending:

1. Change the topic section it touches; add a decision only when a first-time
   reader could not see it in the code, with what was rejected and why (source
   named: owner, T Ricks with date, PoSD, a doc).
2. Replace a decision that is overturned; do not keep both.
3. Update Systems facts and the date above; commit IDs stay in git.
4. Delete a guess or debt once it is resolved; add new ones.
5. Never write what happened, when, or how it was tested; never copy what
   another file already says (link it).
6. New custom components, variants and tokens go in the section where they
   belong, named with where they live (T Ricks 2025-10-17).

## Systems

| What | State |
| --- | --- |
| Site | `mark-thunder/thunder.studios`, Worker `thunder-studios` (owner account `9894a904…`), thunder-studios.richie-989.workers.dev · no domain · `LAUNCHED = false` in `consts.ts`: every page noindex, no sitemap, no analytics or chat |
| Deploy | Workers Builds on push to `main` (`npx astro build` · `npx wrangler deploy` · build var `PUBLIC_TURNSTILE_SITE_KEY`) · no Sanity deploy hook yet, so content changes reach the site only on a push |
| Content | Reads Thunder Media's Sanity project (`6y1gayk4` / `production`) at build: `service`, `settings`, `location`. Policies from `src/content/legal` |
| Studio | `mark-thunder/thunder.studios-cms`, local `../studio-thunder.studios`, project `bbnuxhfu` / `production` (public, org Thunder Media), Studio at thunderstudios.sanity.studio · schema `settings`, `space`, `service`, `plan`, `teamMember` deployed · drafts: 2 services, 3 spaces, 2 team members; no `settings` or `plan` yet |
| Origin | The v2 design of thunder.media (`../portfolio`, branch `v2`), moved here as its own site |

## Pages

Home, Services, one page per service with a page address
(`/services/podcast-production`), Contact, the three policies, 404, and Lumos's
`example-components` (noindex).

| Decision | Rejected | Reason |
| --- | --- | --- |
| One site per business: own folder, repo, Worker, and Sanity project to come | Studios as `/v2` of thunder.media | Owner 10-08 |
| Home, Services, Contact and the policies only | About, Blog, Work, Locations | Owner 10-08: no blog; the crew is one line on Home, not a page |
| Home = the v2 home's hero, then one band per studio alternating `ContentWrapper variant="columns"` and `reverse` (5:4 picture), then a rates band | `variant="breakout"` as backlog story 7 first had it | v2 already draws image bands with `columns`; same idea, same look as the rest of the site (Inferred) |
| The services Studios offers = `STUDIO_SERVICES` in `consts.ts`, read only through `getStudioServices()` (`utils/services.ts`) | Editing `WORK_KINDS`, which mirrors Thunder Media's Studio | Sanity is shared until Studios has its own project; one list, one reader (PoSD) |
| One `LAUNCHED` switch for noindex, sitemap and the robots Sitemap line | Per-page noindex | One decision in one place (PoSD) |
| Page copy only from lines Thunder Media's Sanity already publishes; open facts (rates, hours) say "coming soon" | Writing rates and hours | Owner 10-08: accurate copy, updated later |

## Components

Pruned to what Studios uses, measured against upstream Lumos 0.0.4. Lumos's
own components and variants stay even when unused; Thunder's additions stay only
when a page uses them.

| Decision | Rejected | Reason |
| --- | --- | --- |
| Thunder components here: `CtaMain` (closing card), `HeroMain` (title hero), `ServicesMain` (service rows), `ContactMain`, `Blob`, `ThemeToggle`, `SanityMedia` | The v1, v3 and v4 variants | Unused code is still read (PoSD) |
| `Card` = Lumos `default`, `cover`, `stacked` plus Thunder's `row` (services) | `quote`, `caption`, `thumb`, `bare`, team clips | Only `row` is used |
| `Nav full-screen` + `logo="split"` and `Footer split`; their `side-panel` and `default` layouts stay | Removing the defaults | They are the Lumos-level layouts the variants build on |
| `Slider` marker hit area 1.5rem around a 0.75rem dot | Upstream 0.75rem button | WCAG 2.5.8 target size |
| `ContentWrapper animate` = SplitText line reveal | The v2 blur reveal | Used only on the removed `/v2/work` |

## Studio schema (Phase C)

Written to the Sanity schema rules (`get_sanity_rules`: schema, studio
structure, image): `defineType`/`defineField`/`defineArrayMember`, an icon on
every type, generated IDs except the `settings` singleton, hotspot and required
alt on every image (`shared/image-with-alt.ts`).

| Decision | Rejected | Reason |
| --- | --- | --- |
| `space` (a room people book) is its own document and references the `service` booked in it | Rooms as an array in `settings` | A room has its own photo, words and order; the band's button follows the reference |
| A `service` gets a page by having a page address (`slug`) | `kind` from Thunder Media's work types | Studios' services are not film types; the field says what it does |
| `plan` per rate (name, price, charged per hour, session or month) | Rates as free text | Booking and the rates band read the same values |
| Empty studio hours = "coming soon" on the site | Required hours | The hours are not settled |

## Guesses

| Guess | Where | Resolve by |
| --- | --- | --- |
| Audio and photography bands, Services banner and the podcast page show Mizar stand-ins (empty alt) | `pages/index`, `services/*`, `assets/stand-ins` | Owner sends room photos (Phase C) |
| "Richie Rossouw, owner, and Isaac Perez, lead" | `pages/index` | Owner confirms the roles |
| Page titles end in "Thunder Media"; footer address and hours are the Longview office | `settings` (shared Sanity) | Studios' own `settings` (Phase C) |

## Debts

- Build var `PUBLIC_TURNSTILE_SITE_KEY` is thunder.media's key.
- Contact form options (services, budgets) are film-production choices that feed GHL; they change with booking.
- `LocalBusiness` schema describes Thunder Media.
- `RichText` portable text and `SanityMedia` have no Sanity body to render until Phase C.
- `workers_dev` and `preview_urls` not set explicitly in `wrangler.jsonc`.
- `base.css` and a few components are not Prettier-clean (carried over).
