// Original layout studies. Replace with verified exhibits from the research team.
export const studies = [
  {
    id: "study-01",
    title: "Rhythm & repetition",
    category: "Composition study",
    image: "/studies/study-01.svg",
    description:
      "An original geometric layout study used to explore scale and rhythm. This is a design placeholder, not an attributed Ghanaian artwork.",
  },
  {
    id: "study-02",
    title: "A space between",
    category: "Form study",
    image: "/studies/study-02.svg",
    description:
      "An original study of intersecting forms, made for this prototype. The research team will replace it with an approved exhibit and its verified history.",
  },
  {
    id: "study-03",
    title: "Lines of connection",
    category: "Pattern study",
    image: "/studies/study-03.svg",
    description:
      "An original line composition for testing artwork framing and interaction. It does not represent a traditional symbol or documented cultural object.",
  },
  {
    id: "study-04",
    title: "In a new light",
    category: "Colour study",
    image: "/studies/study-04.svg",
    description:
      "An original colour-block study for the exhibition prototype. Final images, audio and credits will be supplied by the group’s content team.",
  },
] as const;
export type Study = (typeof studies)[number];
