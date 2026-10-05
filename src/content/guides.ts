import type { ContentPage } from './types';

export interface GuidePage extends ContentPage {
  /** ISO dates — update `updated` whenever the copy changes. */
  published:      string;
  updated:        string;
  /** Slug of the feature this guide leads into. */
  relatedFeature: string;
}

export const guides: GuidePage[] = [
  {
    slug:  'how-to-write-an-argumentative-essay',
    title: 'How to Write an Argumentative Essay',
    label: 'Argumentative essays',
    description:
      'A step-by-step guide to writing an argumentative essay: choosing a position, building a thesis, structuring your evidence, and answering the other side.',
    intro:
      'An argumentative essay takes a position on a question people can reasonably disagree about and defends it with evidence. The goal is not to sound certain — it is to give a careful reader good reasons to agree with you.',
    published: '2026-10-04',
    updated:   '2026-10-04',
    relatedFeature: 'essay-feedback',
    sections: [
      {
        heading: 'Start with a question that has two sides',
        paragraphs: [
          'A topic is not an argument. "Social media" is a topic. "Should schools restrict phone use during lessons?" is a question, and it is one where a sensible person could answer either way. If nobody would disagree with your position, there is nothing to argue.',
          'Before you commit, write one sentence for each side. If you cannot state the opposing view fairly, you do not understand the debate well enough yet.',
        ],
      },
      {
        heading: 'Write a thesis you can defend',
        paragraphs: [
          'Your thesis is your answer to the question, stated in one or two sentences, with the main reason attached. "Schools should restrict phone use during lessons because it measurably improves attention and has little cost to learning" is a thesis. "Phones in schools are a controversial issue" is not — it takes no position.',
          'A good test: could someone write an essay arguing the opposite? If yes, you have a thesis.',
        ],
      },
      {
        heading: 'Use a structure the reader can follow',
        paragraphs: [
          'Most argumentative essays follow the same shape, and markers expect it.',
        ],
        list: [
          'Introduction: set up the question, give the context a reader needs, and end with your thesis.',
          'Body paragraphs: one main reason per paragraph, each supported by evidence.',
          'Counterargument: the strongest objection to your position, and your response to it.',
          'Conclusion: restate the thesis in light of what you have shown, and say why it matters.',
        ],
        ordered: true,
      },
      {
        heading: 'Build each paragraph around one claim',
        paragraphs: [
          'Open the paragraph with the claim it will make. Follow it with evidence — a study, a statistic, a quotation, a concrete example. Then do the step most students skip: explain how that evidence supports the claim. Evidence does not speak for itself.',
          'End by tying the paragraph back to your thesis. If a paragraph does not help prove the thesis, it belongs in a different essay.',
        ],
      },
      {
        heading: 'Take the other side seriously',
        paragraphs: [
          'Answering a weak version of the opposing view convinces nobody. Pick the best objection you can find, state it the way its supporters would, and then show why your position still holds — because the objection rests on a mistaken assumption, applies only in limited cases, or is outweighed by something more important.',
          'Conceding a small point often makes the rest of your argument more believable.',
        ],
      },
      {
        heading: 'Revise for the argument first, the sentences second',
        paragraphs: [
          'On your first pass, ignore spelling. Read only your thesis and the first sentence of each paragraph. Do they form a logical chain? If not, fix the structure before polishing anything.',
          'Then check each paragraph for evidence and explanation, and only after that work on clarity, grammar, and word choice.',
        ],
      },
      {
        heading: 'Common mistakes',
        list: [
          'A thesis that describes the topic instead of taking a position.',
          'Paragraphs that summarize sources without making a claim.',
          'Evidence dropped in with no explanation of what it shows.',
          'No counterargument, or one that is too weak to be worth answering.',
          'A conclusion that introduces a brand-new argument.',
        ],
      },
    ],
  },
  {
    slug:  'how-to-write-an-essay-outline',
    title: 'How to Write an Essay Outline',
    label: 'Essay outlines',
    description:
      'Learn how to outline an essay before you write it: what goes in the introduction, body, and conclusion, with a worked example you can adapt.',
    intro:
      'An outline is the essay in miniature: your thesis, the points that support it, and the order they come in. Twenty minutes spent outlining usually saves hours of rewriting.',
    published: '2026-10-04',
    updated:   '2026-10-04',
    relatedFeature: 'essay-outline-generator',
    sections: [
      {
        heading: 'Why outline at all',
        paragraphs: [
          'Writing and deciding what to say are two different jobs, and doing both at once is why first drafts wander. An outline lets you settle the argument while it is still cheap to change — moving a bullet point takes seconds; moving a finished paragraph means rewriting everything around it.',
          'It also shows you early whether you have enough to say. If you can only find two supporting points, better to learn that before you have written a thousand words.',
        ],
      },
      {
        heading: 'Begin with the thesis',
        paragraphs: [
          'Write your thesis at the top of the page. Everything in the outline exists to support that sentence, so it has to come first. If you do not have one yet, write the question you are answering and your best current answer — you can sharpen it later.',
        ],
      },
      {
        heading: 'Plan the three parts',
        list: [
          'Introduction: a hook that earns attention, the background the reader needs, and the thesis statement.',
          'Body: three to five main points. Under each, note the evidence you will use and one line on how it supports the point.',
          'Conclusion: the thesis restated in new words, a brief summary of how you proved it, and a closing thought on why it matters.',
        ],
        ordered: true,
      },
      {
        heading: 'Put the points in a deliberate order',
        paragraphs: [
          'Order is an argument in itself. Common choices are weakest to strongest, so the essay builds; chronological, when you are tracing a development; or problem then solution. Whichever you choose, each point should make the next one easier to accept.',
        ],
      },
      {
        heading: 'A worked example',
        paragraphs: [
          'Suppose the question is whether schools should restrict phone use during lessons, and your thesis is that they should.',
        ],
        list: [
          'Introduction — hook: how often a typical student checks a phone in an hour; background: current school policies; thesis.',
          'Point 1 — attention: research on task-switching and what it costs in comprehension.',
          'Point 2 — outcomes: results from schools that introduced restrictions.',
          'Point 3 — fairness: restrictions reduce the gap between students with and without self-control strategies.',
          'Counterargument — phones are useful learning tools; response: structured, teacher-led use is still possible.',
          'Conclusion — restate thesis, summarize the three points, note what a sensible policy looks like.',
        ],
      },
      {
        heading: 'How much detail to include',
        paragraphs: [
          'Enough that you could hand the outline to someone else and they would understand your argument. A heading and a one or two sentence note per point is usually right. If you find yourself writing full paragraphs, you have started the draft — which is fine, but finish the outline first.',
        ],
      },
      {
        heading: 'Treat the outline as a draft, too',
        paragraphs: [
          'Outlines change. If you discover halfway through writing that your second point is really two points, or that your evidence supports a slightly different thesis, go back and update the plan. An outline is there to help you think, not to hold you to a decision you made before you had done the reading.',
        ],
      },
    ],
  },
  {
    slug:  'how-to-write-a-thesis-statement',
    title: 'How to Write a Thesis Statement',
    label: 'Thesis statements',
    description:
      'What a thesis statement is, what makes one strong, and how to turn a broad topic into a specific, arguable claim — with weak and strong examples.',
    intro:
      'A thesis statement is the one or two sentences that tell your reader what you are going to argue. Everything else in the essay is there to support it, which makes it the most important sentence you will write.',
    published: '2026-10-04',
    updated:   '2026-10-04',
    relatedFeature: 'essay-feedback',
    sections: [
      {
        heading: 'What a thesis statement does',
        paragraphs: [
          'It answers the question the essay is about, and it makes a promise: by the end, you will have shown this to be true. It usually sits at the end of the introduction, where the reader is ready for it.',
        ],
      },
      {
        heading: 'Three qualities of a strong thesis',
        list: [
          'Specific: it names exactly what you are claiming, not a general area.',
          'Arguable: a thoughtful person could disagree with it.',
          'Supportable: you can back it with evidence in the space you have.',
        ],
      },
      {
        heading: 'From topic to thesis in four steps',
        list: [
          'Start with your topic: remote work.',
          'Turn it into a question: does remote work make employees more productive?',
          'Give your answer: for most knowledge workers it does.',
          'Add the reason: because it removes commuting time and allows longer periods of uninterrupted focus.',
        ],
        ordered: true,
        after: [
          'Put the last two together and you have a thesis: "Remote work makes most knowledge workers more productive because it removes commuting time and allows longer periods of uninterrupted focus."',
        ],
      },
      {
        heading: 'Weak and strong examples',
        list: [
          'Weak: "This essay will discuss climate change." — announces a topic, claims nothing.',
          'Strong: "Carbon pricing is the most effective climate policy available because it changes behaviour across the whole economy rather than one sector at a time."',
          'Weak: "Shakespeare\'s Hamlet is a play about revenge." — a fact nobody disputes.',
          'Strong: "Hamlet\'s delay is not indecision but a refusal to act on evidence he cannot verify."',
        ],
      },
      {
        heading: 'Match the thesis to the essay type',
        paragraphs: [
          'An argumentative thesis takes a side. An analytical thesis makes a claim about how or why something works. An expository thesis states what you will explain and the angle you will take. A comparative thesis says what the comparison reveals, not merely that two things are similar and different.',
        ],
      },
      {
        heading: 'Revise it after you draft',
        paragraphs: [
          'Your first thesis is a working hypothesis. Once the essay is drafted, reread the thesis and ask whether it still describes what you actually argued. Very often the draft has found a sharper claim than the one you started with — replace the old thesis with the better one.',
        ],
      },
      {
        heading: 'A quick checklist',
        list: [
          'Does it answer the question that was set?',
          'Could someone reasonably disagree?',
          'Is every key term specific?',
          'Can you support it in the word count you have?',
          'Does each body paragraph help prove it?',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): GuidePage | undefined {
  return guides.find(g => g.slug === slug);
}
