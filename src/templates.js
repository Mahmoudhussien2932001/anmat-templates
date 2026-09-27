export const TEMPLATES = [
  {
    id: "template1",
    title: "Template 01",
    url: "https://anmat_template1.sa",
    image: "/templates/template-01.jpg",
  },
  {
    id: "template2",
    title: "Template 02",
    url: "https://anmat_template2.sa",
    image: "/templates/template-02.jpg",
  },
  {
    id: "template3",
    title: "Template 03",
    url: "https://anmat_template3.sa",
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
