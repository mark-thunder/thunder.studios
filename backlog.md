# Product backlog — Thunder Studios

The one list of work still to do, ordered by value (Scrum: the Product Backlog
is ordered, living, and holds only what adds value; done work is the increment,
in `git log`, with the current state in `progress.md`). The owner is Product
Owner and orders it; Claude refines it. Stories: _as a … I want … so that …_ with
acceptance criteria. The top item is the next sprint's goal.

## Definition of Done

- `astro check` 0 errors · `astro build` ok
- Verified at 1440 / 768 / 375
- Lumos components; new CSS passes LUMOS.md checklists; no `px` in `src/` or built CSS
- Opens in Stacki as visual nodes with typed fields
- No `href="#"`
- Guesses and debts recorded in `progress.md`

## Owner checklist

- [ ] Business name and legal name for Studios
- [ ] Studio ZIP code and the email enquiries go to
- [ ] Rates: hourly, membership (price and what each includes)
- [ ] Studio hours, or "open around the clock"
- [ ] Photos of each room (video podcast, audio podcast, photography) and portraits of Richie and Isaac
- [ ] Domain for the site

## Backlog

### 1 · Own Sanity project (Phase C)

As the owner I want Studios' content in its own Studio so that editing it never touches thunder.media.

- Content: owner reviews and publishes the drafts (2 `service`, 3 `space`, 2 `teamMember`) · `settings` once the owner checklist is answered · `plan` once rates are set
- Site: `SANITY` in `consts.ts` → the new project · collections for `space`, `service`, `plan`, `teamMember` · home bands and rates from Sanity · `STUDIO_SERVICES` and `WORK_KINDS` removed
- Deploy hook on `thunder-studios` + Sanity webhook on publish (drafts off)
- AC: one Studio publish reaches the site · no Thunder Media content on any page

### 2 · Booking

As a creator I want to book studio time by the hour or as a member so that I can record without owning a studio.

- Choose: GHL calendar embed (fast, takes payment, GHL's look and scripts) or a Lumos booking component in `components/form`, with an Astro Action reading GHL's open slots and creating the appointment behind Turnstile (T Ricks Stated 2026-02-14 multi-step visit form; 2026-09-11 a form is its own component). Check GHL's calendar API before building the second
- Membership: GHL recurring product → tag → members' calendar
- Contact form options change to studio choices with it
- AC: a test booking shows in the GHL calendar in Stripe test mode

### 3 · Launch

As the owner I want Studios public on its own domain so that people can find and book it.

- Domain on the Worker · Studios' own Turnstile key and GHL tracking · analytics · `LAUNCHED = true` · `workers_dev` and `preview_urls` set explicitly
- AC: the domain serves the Worker · pages indexable · sitemap accepted · a test enquiry reaches GHL

## Later (not ordered)

- Community, Studio Members first
