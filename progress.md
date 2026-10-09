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
| Deploy | Workers Builds on push to `main` (`npx astro build` · `npx wrangler deploy` · build var `PUBLIC_TURNSTILE_SITE_KEY`) · Sanity publish → webhook (drafts, versions off) → Deploy Hook `sanity-publish` |
| Content | Reads its own Sanity project (`bbnuxhfu` / `production`) at build: `settings`, `service`, `space`, `teamMember`. Policies from `src/content/legal` |
| Studio | `mark-thunder/thunder.studios-cms`, local `../studio-thunder.studios`, project `bbnuxhfu` / `production` (public, org Thunder Media), Studio at thunderstudios.sanity.studio · schema `settings`, `space`, `service`, `plan`, `teamMember` deployed · published: `settings` (Thunder Studios, Thunder Films LLC, same phone and email as Thunder Media, no hours), 2 services, 3 spaces, 2 team members; no `plan`, no photos yet |
| Origin | The v2 design of thunder.media (`../portfolio`, branch `v2`), moved here as its own site |

## Pages

Home, Services, one page per service with a page address
(`/services/podcast-production`), Contact, the three policies, 404, and Lumos's
`example-components` (noindex).

| Decision | Rejected | Reason |
| --- | --- | --- |
| One site per business: own folder, repo, Worker, and Sanity project to come | Studios as `/v2` of thunder.media | Owner 10-08 |
| Home, Services, Contact and the policies only | About, Blog, Work, Locations | Owner 10-08: no blog; the crew is one line on Home, not a page |
| Home = the v2 home's hero, then one band per studio space alternating `ContentWrapper variant="columns"` and `reverse` (5:4 picture), then a rates band | `variant="breakout"` as backlog story 7 first had it | v2 already draws image bands with `columns`; same idea, same look as the rest of the site (Inferred) |
| Bands and rates are content components (`content/SpacesMain`, `content/RatesMain`) inside page Sections; the bands share one Section with `gap="medium"` | Sanity data in the page frontmatter | LUMOS: anything needing frontmatter is its own component; the gap equals the old section padding, so spacing is unchanged |
| Lists read through `getOrdered()` (`utils/ordered.ts`), sorted by the Studio's `order` | Trusting `getCollection()` order | Astro docs: collection order is non-deterministic; sort yourself |
| A service has a page when it has a page address (`slug`) | A list of service ids in the code | The editor decides in the Studio; one source (PoSD) |
| `@sanity/client` in a content loader, GROQ projecting only the fields the site uses, Zod schemas in `content.config.ts` | `@sanity/astro` + TypeGen | Build-time reads keep `getCollection()` and schema checks with no React; Sanity GROQ rules: always project |
| One action everywhere, "Request a Session" (contact form), and a closing card "Book a studio session." | "Book a Discovery Call" and "Your next project starts with a 20-minute call" | Owner 10-09: match rental studios; studios without instant booking take a session request and confirm in writing (Studio Terms) |
| One `LAUNCHED` switch for noindex, sitemap and the robots Sitemap line | Per-page noindex | One decision in one place (PoSD) |
| Page copy only from lines Thunder Media's Sanity already publishes; open facts (rates, hours) say "coming soon" | Writing rates and hours | Owner 10-08: accurate copy, updated later |
| Four policies in `src/content/legal`: Privacy, Terms of Use and Cookies describe only what this site runs (no analytics or chat; one `theme` storage key); Studio Terms covers sessions, with prices, cancellation windows and overtime left to each booking confirmation | Copying thunder.media's policies; numbers taken from other studios | Owner 10-09; studio terms follow the common outline of published studio terms (booking, cancellation, use, damage, safety, content ownership, law); Texas one-party recording consent per Texas State Law Library |

## Components

Pruned to what Studios uses, measured against upstream Lumos 0.0.4. Lumos's
own components and variants stay even when unused; Thunder's additions stay only
when a page uses them.

| Decision | Rejected | Reason |
| --- | --- | --- |
| Thunder components here: `CtaMain` (closing card), `HeroMain` (title hero), `ServicesMain` (service rows), `SpacesMain` (studio bands), `RatesMain` (rates, address, team), `ContactMain`, `Blob`, `ThemeToggle`, `SanityMedia` | The v1, v3 and v4 variants | Unused code is still read (PoSD) |
| `Card` = Lumos `default`, `cover`, `stacked` plus Thunder's `row` (services) | `quote`, `caption`, `thumb`, `bare`, team clips | Only `row` is used |
| `Nav full-screen` + `logo="split"` and `Footer split`; their `side-panel` and `default` layouts stay | Removing the defaults | They are the Lumos-level layouts the variants build on |
| `Slider` marker hit area 1.5rem around a 0.75rem dot | Upstream 0.75rem button | WCAG 2.5.8 target size |
| `ContentWrapper animate` = SplitText line reveal | The v2 blur reveal | Used only on the removed `/v2/work` |

## Studio schema

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
| Until photos are uploaded: hero = built-in crew still; video band = built-in interview still; audio and photography bands, Services banner and podcast page = Mizar stand-ins (empty alt) | `utils/photos.ts`, `content/SpacesMain`, `services/*` | Owner uploads Studio photo, Session photo and a photo per space and service |

## Debts

- Build var `PUBLIC_TURNSTILE_SITE_KEY` is thunder.media's key, whose widget does not list Studios' hostnames, so the contact form cannot pass the check yet. Studios needs its own Turnstile widget, and the Worker its secrets (`TURNSTILE_SECRET_KEY`, `JEV_API_KEY`, `GHL_WEBHOOK_URL`).
- Contact form options (services, budgets) are film-production choices that feed GHL; they change with booking.
- `LocalBusiness` `@id` and canonical URLs use `SITE_URL` (thunder.media) and `sameAs` lists Thunder Media's profiles until Studios has a domain and profiles.
- Policies published without attorney review (as for thunder.media); `studio-terms` stays a draft until the owner settles its choices (backlog checklist).
- `RichText` portable text and `SanityMedia` have nothing to render: the Studio has no rich-text field yet.
- `workers_dev` and `preview_urls` not set explicitly in `wrangler.jsonc`.
- `base.css` and a few components are not Prettier-clean (carried over).
