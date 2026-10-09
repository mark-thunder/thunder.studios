/** One extra question the contact form can ask. `question` and `placeholder` are shown on the page; `criteria` stays on the server and tells Jev when this question fits. */
export interface FollowUp {
  key: string;
  question: string;
  placeholder: string;
  criteria: string;
}

/** Every follow-up the form can ask, at most one per enquiry. Keys are what the server returns. */
export const FOLLOW_UPS: FollowUp[] = [
  {
    key: "podcast_setup",
    question: "How many hosts and guests, and do you need an engineer?",
    placeholder: "Two hosts, one guest, we'd like someone running the board",
    criteria:
      "A podcast or interview recording where the number of people at the mics, or whether they want an engineer, is not yet stated.",
  },
  {
    key: "photo_shoot",
    question: "How many people, and how many looks?",
    placeholder: "Six headshots, one outfit each",
    criteria:
      "A photo shoot or headshots where the number of people or looks is not yet stated, or whether they bring their own photographer.",
  },
  {
    key: "recurring",
    question: "Is this a one-off, or a regular slot?",
    placeholder: "Every other Tuesday morning",
    criteria:
      "A show, series or ongoing content where it is not yet stated whether they want one session or a regular booking.",
  },
];
