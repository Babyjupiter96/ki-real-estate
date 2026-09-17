export type FaqCategory = "Real Estate" | "SEO";

export type Faq = {
  category: FaqCategory;
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    category: "Real Estate",
    question: "What is wholesale real estate?",
    answer:
      "It's a way to sell a property without listing it publicly. Ki identifies the right buyer for your property directly, structures the deal, and manages the process — often closing faster than a traditional sale.",
  },
  {
    category: "Real Estate",
    question: "How does Ki evaluate properties?",
    answer:
      "Ki looks at condition, comparable sales, market trajectory, and holding costs to arrive at a real, defensible number — not an inflated estimate designed to get you to sign.",
  },
  {
    category: "Real Estate",
    question: "Do I need to list my property?",
    answer:
      "No. Ki works directly with property owners. There's no listing, no showings, and no obligation to move forward after an evaluation.",
  },
  {
    category: "Real Estate",
    question: "How does the process work?",
    answer:
      "You share basic details about the property, Ki evaluates it and presents your options, and — if it makes sense for you — we structure a deal and move toward closing on your timeline.",
  },
  {
    category: "SEO",
    question: "What SEO services does Ki provide?",
    answer:
      "Technical SEO, local SEO and Google Business Profile optimization, keyword and content strategy, website optimization, authority building, and conversion optimization.",
  },
  {
    category: "SEO",
    question: "How long does SEO take?",
    answer:
      "Meaningful movement typically starts within the first few months, with compounding results over a sustained program. Anyone promising overnight rankings isn't being straight with you.",
  },
  {
    category: "SEO",
    question: "Does Ki work with local businesses?",
    answer:
      "Yes — local SEO and Google Business Profile optimization are core to how Ki works, especially for businesses competing for nearby search traffic.",
  },
  {
    category: "SEO",
    question: "How does Ki measure results?",
    answer:
      "Organic visibility, ranking movement on target terms, qualified traffic, and — ultimately — leads generated. Ki reports on what actually matters to your business.",
  },
];
