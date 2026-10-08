import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import {
  TURNSTILE_SECRET_KEY,
  JEV_API_KEY,
  GHL_WEBHOOK_URL,
} from "astro:env/server";
import { CONTACT_ENDPOINT, SEND_TO_BASE44 } from "@/consts.ts";
import { FOLLOW_UPS } from "@/utils/followUps.ts";

const TURNSTILE_VERIFY =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const JEV_DECIDE = "https://api.typesafe.ai/v1/systemone";

/* Jev answers with a probability. Dropping a real lead costs more than
   reading a spam one, so only a confident yes is treated as spam. */
const SPAM_THRESHOLD = 0.85;

/* TypeSafe's floor for acting on a choice: below it, ask nothing. */
const FOLLOW_UP_CONFIDENCE = 0.5;

/** Whether Cloudflare accepts the token the widget issued for this visitor. */
async function verifyTurnstile(token: string, ip: string | undefined) {
  const answer = await fetch(TURNSTILE_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const result = (await answer.json()) as { success?: boolean };
  return result.success === true;
}

/** Jev's answers to `questions` about `state`, or `null` when there is no key or the call fails. */
async function askJev(state: string, questions: Record<string, unknown>) {
  if (!JEV_API_KEY) return null;
  try {
    const answer = await fetch(JEV_DECIDE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JEV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state, model: "jev-latest", questions }),
    });
    if (!answer.ok) return null;
    const result = (await answer.json()) as {
      answers?: Record<string, Record<string, unknown>>;
    };
    return result.answers ?? null;
  } catch {
    return null;
  }
}

/** Jev's probability that the enquiry is spam, or `null` when it cannot say. */
async function spamProbability(state: string) {
  const answers = await askJev(state, {
    is_spam: {
      type: "noul",
      instructions:
        "This is unsolicited spam, a scam, or an automated message, not a genuine enquiry about video, photo or podcast production.",
    },
  });
  const noul = answers?.is_spam?.noul;
  return typeof noul === "number" ? noul : null;
}

/** The follow-up that fits the enquiry best, or `null` when none fits or Jev is unsure. */
async function followUpKey(state: string) {
  const criteria = Object.fromEntries(
    FOLLOW_UPS.map(({ key, criteria }) => [key, criteria]),
  );
  criteria.none =
    "Anything that is not a real request to hire a production company: spam, SEO or link offers, sales pitches, job applications, or nonsense. Also a real enquiry that already says everything a producer needs, or one too short to judge.";
  const answers = await askJev(state, {
    follow_up: {
      type: "choice",
      instructions:
        "A visitor is filling in the contact form of a video, photo, podcast and marketing production company. Which single follow-up question would most help the producer prepare for the first call?",
      criteria,
    },
  });
  const choice = answers?.follow_up?.choice;
  const confidence = answers?.follow_up?.confidence;
  if (typeof choice !== "string" || typeof confidence !== "number") return null;
  if (choice === "none" || confidence < FOLLOW_UP_CONFIDENCE) return null;
  return FOLLOW_UPS.some(({ key }) => key === choice) ? choice : null;
}

export const server = {
  followUp: defineAction({
    input: z.object({
      service: z.string().max(200).nullish(),
      timeline: z.string().max(200).nullish(),
      budget: z.string().max(200).nullish(),
      message: z.string().min(20).max(2000),
    }),
    handler: async (input) => {
      const state = [
        `Service: ${input.service ?? ""}`,
        `Timeline: ${input.timeline ?? ""}`,
        `Budget: ${input.budget ?? ""}`,
        `Message: ${input.message}`,
      ].join("\n");
      return { key: await followUpKey(state) };
    },
  }),

  contact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1),
      company: z.string().max(200).nullish(),
      email: z.email(),
      phone: z.string().nullish(),
      service: z.string().nullish(),
      timeline: z.string().nullish(),
      budget: z.string().nullish(),
      message: z.string().nullish(),
      smsConsent: z.literal("yes").nullish(),
      followUpQuestion: z.string().max(200).nullish(),
      followUpAnswer: z.string().max(2000).nullish(),
      "cf-turnstile-response": z.string().min(1),
    }),
    handler: async (input, context) => {
      const { "cf-turnstile-response": token, ...enquiry } = input;

      let ip: string | undefined;
      try {
        ip = context.clientAddress;
      } catch {
        ip = undefined;
      }

      if (!(await verifyTurnstile(token, ip))) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "We could not verify you, so please try again.",
        });
      }

      const state = [
        `Name: ${enquiry.name}`,
        `Company: ${enquiry.company ?? ""}`,
        `Email: ${enquiry.email}`,
        `Phone: ${enquiry.phone ?? ""}`,
        `Service: ${enquiry.service ?? ""}`,
        `Timeline: ${enquiry.timeline ?? ""}`,
        `Budget: ${enquiry.budget ?? ""}`,
        `Message: ${enquiry.message ?? ""}`,
        `${enquiry.followUpQuestion ?? "Follow-up"}: ${enquiry.followUpAnswer ?? ""}`,
      ].join("\n");

      const spam = await spamProbability(state);
      if (spam !== null && spam >= SPAM_THRESHOLD) {
        return { sent: false };
      }

      const body = JSON.stringify({
        name: enquiry.name,
        /* GHL keeps first and last names apart; the form asks for one name. */
        firstName: enquiry.name.trim().split(/\s+/)[0],
        lastName: enquiry.name.trim().split(/\s+/).slice(1).join(" "),
        company: enquiry.company ?? "",
        /* GHL names the opportunity from this, so it never starts blank. */
        opportunityName: [enquiry.company || enquiry.name, enquiry.service]
          .filter(Boolean)
          .join(" – "),
        email: enquiry.email,
        phone: enquiry.phone ?? "",
        service: enquiry.service ?? "",
        timeline: enquiry.timeline ?? "",
        budget: enquiry.budget ?? "",
        message: enquiry.message ?? "",
        /* Matches the options of GHL's SMS consent checkbox field. */
        smsConsent: enquiry.smsConsent === "yes" ? "Yes" : "No",
        smsConsentDate:
          enquiry.smsConsent === "yes"
            ? new Date().toISOString().slice(0, 10)
            : "",
        followUpQuestion: enquiry.followUpQuestion ?? "",
        followUpAnswer: enquiry.followUpAnswer ?? "",
        "cf-turnstile-response": "",
      });
      const endpoints = [
        SEND_TO_BASE44 ? CONTACT_ENDPOINT : undefined,
        GHL_WEBHOOK_URL,
      ].filter((url): url is string => Boolean(url));

      /* The lead is kept if any destination takes it. */
      const answers = await Promise.allSettled(
        endpoints.map((url) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          }),
        ),
      );
      const delivered = answers.some(
        (answer) => answer.status === "fulfilled" && answer.value.ok,
      );
      if (!delivered) {
        throw new ActionError({
          code: "BAD_GATEWAY",
          message: "Your message did not send, so please try again.",
        });
      }

      return { sent: true };
    },
  }),
};
