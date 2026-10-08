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
    key: "event_scale",
    question: "How many days is it, and about how many people?",
    placeholder: "Two days, about 400 people",
    criteria:
      "An event, conference, expo, summit or live show where the number of days and the size of the crowd are not yet stated.",
  },
  {
    key: "location",
    question: "Where will we shoot?",
    placeholder: "City, and the venue if you know it",
    criteria:
      "A shoot whose city or venue is not yet stated, especially anything outside Longview, Texas.",
  },
  {
    key: "film_use",
    question: "Where will people watch the finished film?",
    placeholder: "Website, a sales meeting, social ads…",
    criteria:
      "A brand film, documentary, commercial or testimonial where it is not yet stated where the finished video will be shown.",
  },
  {
    key: "podcast_setup",
    question: "How many hosts and guests, and do you have a studio?",
    placeholder: "One host, a guest each week, no studio yet",
    criteria:
      "A podcast where the number of hosts or guests, or whether they have a studio, is not yet stated.",
  },
  {
    key: "marketing_goal",
    question: "What would a good result look like in 90 days?",
    placeholder: "Twenty booked calls a month from the website",
    criteria:
      "Ongoing marketing, social content, ads or a retainer where the goal or the result they want is not yet stated.",
  },
];
