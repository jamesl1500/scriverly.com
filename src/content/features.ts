import { FREE_ANALYSIS_LIMIT, FREE_OUTLINE_LIMIT, PREMIUM_PRICE_USD } from '@/config/consts';
import type { ContentPage } from './types';

const pricing = `The free plan includes ${FREE_ANALYSIS_LIMIT} AI analyses and ${FREE_OUTLINE_LIMIT} outline generations each month, with no credit card required. Premium is $${PREMIUM_PRICE_USD} per month and removes both limits.`;

export interface FeaturePage extends ContentPage {
  /** Slugs of guides worth reading alongside this feature. */
  relatedGuides: string[];
}

export const features: FeaturePage[] = [
  {
    slug:  'essay-feedback',
    title: 'AI Essay Feedback and Scoring',
    label: 'Essay feedback',
    description:
      'Get an overall score, a five-part breakdown, and specific, one-click improvements for your essay — tailored to its type and academic level.',
    intro:
      'Most feedback arrives days after you needed it. Scriverly reads your draft while you are still writing it and tells you, in plain language, what is working and what to fix next.',
    sections: [
      {
        heading: 'A score you can act on',
        paragraphs: [
          'Every analysis gives your essay an overall score out of 100, then breaks it into five parts so you can see where the marks are going.',
        ],
        list: [
          'Clarity — whether each sentence says what you mean on the first read.',
          'Structure — how well your paragraphs and argument are organized.',
          'Style alignment — whether the writing fits the essay type and academic level you chose.',
          'Grammar — errors that would cost you marks.',
          'Vocabulary — word choice, range, and precision.',
        ],
      },
      {
        heading: 'Recommendations, not a wall of red ink',
        paragraphs: [
          'Instead of flagging everything, Scriverly picks the handful of changes that would improve your essay most. Each recommendation is tagged by type and severity, explains the problem, and shows a before-and-after rewrite of your own sentence.',
          'If you like the rewrite, apply it to your draft with one click. If you do not, leave it — the essay is yours.',
        ],
      },
      {
        heading: 'Feedback that knows what you are writing',
        paragraphs: [
          'An argumentative essay for a first-year course is judged differently from a doctoral analysis. When you create an essay you set its type, academic level, subject, and citation style, and the feedback is written with all of that in mind.',
          'Supported essay types are argumentative, analytical, expository, persuasive, narrative, descriptive, and comparative, from high school to doctoral level, with APA, MLA, or Chicago conventions.',
        ],
      },
      {
        heading: 'It keeps up as you write',
        paragraphs: [
          'Open the Analysis panel next to your draft and it refreshes on its own when you pause or finish a paragraph. You can also re-run it whenever you like. If nothing in your essay has changed, you get the saved result back instantly and it does not count against your monthly allowance.',
        ],
      },
      {
        heading: 'Your writing stays yours',
        paragraphs: [
          'Your essay is sent to our AI provider only to produce your feedback. We do not use your content to train AI models, and Scriverly never writes the essay for you.',
        ],
      },
      {
        heading: 'What it costs',
        paragraphs: [pricing],
      },
    ],
    relatedGuides: ['how-to-write-an-argumentative-essay', 'how-to-write-a-thesis-statement'],
  },
  {
    slug:  'essay-outline-generator',
    title: 'Essay Outline Generator',
    label: 'Outline generator',
    description:
      'Turn a title and topic into a structured essay outline with an introduction, body points, and conclusion — matched to your essay type and academic level.',
    intro:
      'The hardest part of an essay is often the first ten minutes. Give Scriverly your title and topic and it returns a structure you can start writing into straight away.',
    sections: [
      {
        heading: 'From a title to a plan',
        paragraphs: [
          'Scriverly builds the outline from what you tell it about the essay: the title, subject, an optional summary of what you want to argue, the essay type, and your academic level. The more specific the summary, the more specific the outline.',
        ],
      },
      {
        heading: 'A structure you would recognize',
        paragraphs: [
          'Each outline is split into the three parts every marker expects.',
        ],
        list: [
          'Introduction — a hook, the background your reader needs, and your thesis statement.',
          'Body — three to five main points, depending on how complex the essay is.',
          'Conclusion — your thesis restated, the argument summarized, and a closing thought.',
        ],
      },
      {
        heading: 'Talking points, not finished paragraphs',
        paragraphs: [
          'Every item has a heading specific to your topic and a one or two sentence note on what to cover there. It tells you what belongs in the paragraph; it does not write the paragraph. That keeps the thinking, and the words, yours.',
        ],
      },
      {
        heading: 'It sits beside your draft',
        paragraphs: [
          'The outline opens in a panel next to the editor. Tick items off as you write them so you can see how much of the plan is done, and regenerate the outline if your argument changes direction.',
          'You can choose to start with an outline when you create a new essay, or open the panel at any point later.',
        ],
      },
      {
        heading: 'What it costs',
        paragraphs: [pricing],
      },
    ],
    relatedGuides: ['how-to-write-an-essay-outline', 'how-to-write-a-thesis-statement'],
  },
  {
    slug:  'grammar-and-style-checker',
    title: 'Grammar and Style Checker for Essays',
    label: 'Grammar and style',
    description:
      'Find genuine spelling and grammar errors and get style suggestions written for academic essays, each with a reason and a one-click fix.',
    intro:
      'General-purpose grammar checkers treat a lab report, a text message, and a dissertation the same way. Scriverly checks your essay as an essay.',
    sections: [
      {
        heading: 'Real errors, with reasons',
        paragraphs: [
          'The spelling and grammar check lists genuine mistakes only — not stylistic preferences dressed up as errors. Each one shows your original text, the correction, and a short explanation, so you learn the rule instead of just accepting the fix.',
        ],
      },
      {
        heading: 'Style advice for academic writing',
        paragraphs: [
          'Alongside the grammar check, Scriverly gives style recommendations covering structure, argument, clarity, vocabulary, and style. Each one quotes the sentence it is about and offers a rewritten version, so the advice is never abstract.',
        ],
      },
      {
        heading: 'Citation style aware',
        paragraphs: [
          'Set your essay to APA, MLA, or Chicago and any feedback that touches citations or references is judged against that style.',
        ],
      },
      {
        heading: 'Apply a fix in one click',
        paragraphs: [
          'Every correction and rewrite has an apply button that makes the change in your draft for you. Nothing is changed without you choosing it.',
        ],
      },
      {
        heading: 'A page that suits how you write',
        paragraphs: [
          'The editor shows your word count, progress toward your word goal, and where each page would break. You can write on a blank page or switch on ruled lines under your text if that makes long drafts easier to read.',
        ],
      },
      {
        heading: 'What it costs',
        paragraphs: [
          `Grammar and style feedback is part of every AI analysis. ${pricing}`,
        ],
      },
    ],
    relatedGuides: ['how-to-write-an-argumentative-essay'],
  },
];

export function getFeature(slug: string): FeaturePage | undefined {
  return features.find(f => f.slug === slug);
}
