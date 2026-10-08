import { getCollection } from "astro:content";
import { DAYS } from "@/consts.ts";

/** `07:00` → `7 AM`, `12:30` → `12:30 PM`. */
const clock = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""} ${hours < 12 ? "AM" : "PM"}`;
};

/** Days as short, joined runs: Monday–Saturday → `Mon–Sat`, Monday and Wednesday → `Mon, Wed`. */
const dayRuns = (days: readonly string[]) => {
  const order = DAYS.filter((day) => days.includes(day));
  const runs: string[][] = [];
  for (const day of order) {
    const run = runs.at(-1);
    if (run && DAYS.indexOf(day) === DAYS.indexOf(run.at(-1) as never) + 1) run.push(day);
    else runs.push([day]);
  }
  return runs
    .map((run) =>
      run.length > 2
        ? `${run[0].slice(0, 3)}–${run.at(-1)!.slice(0, 3)}`
        : run.map((day) => day.slice(0, 3)).join(", "),
    )
    .join(", ");
};

/** The company as the Studio's Site settings describe it: name, legal name, office, phone, email and hours, plus the review count. Read once per build; the build stops if Site settings is missing. */
export const getBusiness = async () => {
  const settings = (await getCollection("settings"))[0]?.data;
  if (!settings) throw new Error("Site settings is missing in Sanity.");
  const hours = settings.hours ?? [];
  const open = hours.flatMap(({ days }) => days);
  const closed = DAYS.filter((day) => !open.includes(day));
  return {
    ...settings,
    hours,
    /** The phone as a `tel:` link dials it. */
    phoneHref: `tel:+1${settings.phone.replace(/\D/g, "")}`,
    /** The office on one line. */
    addressLine: `${settings.address.street}, ${settings.address.city}, ${settings.address.state} ${settings.address.postalCode}`,
    /** The hours on one line, such as `Mon–Sat 7 AM–7 PM · Sun closed`. Empty when no hours are set. */
    hoursLine: hours.length
      ? [
          ...hours.map(
            ({ days, opens, closes }) =>
              `${dayRuns(days)} ${clock(opens)}–${clock(closes)}`,
          ),
          ...(closed.length ? [`${dayRuns(closed)} closed`] : []),
        ].join(" · ")
      : "",
  };
};
