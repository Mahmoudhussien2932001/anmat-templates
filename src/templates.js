export const TEMPLATES = [
  {
    id: "template1",
    title: "Template 01",
    url: "https://anmat-template1.vercel.app/",
    image: "/templates/template-01.jpg",
  },
  {
    id: "template2",
    title: "Template 02",
    url: "https://anmat-template2.vercel.app/",
    image: "/templates/template-02.jpg",
  },
  {
    id: "template3",
    title: "Template 03",
    url: "https://anmat-template3.vercel.app/",
    image: "/templates/template-03.jpg",
  },
];

export const RATING_OPTIONS = [
  { value: "like", label: "Like", emoji: "👍" },
  { value: "dislike", label: "Dislike", emoji: "😞" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
];

export const RATING_LABELS = {
  like: "Like",
  dislike: "Dislike",
  neutral: "Neutral",
};

export function createEmptyFeedback() {
  return Object.fromEntries(
    TEMPLATES.map((template) => [
      template.id,
      { rating: "", liked: "", disliked: "" },
    ]),
  );
}
