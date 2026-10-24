---
name: blog-voice
description: Greg's voice and structure for blog posts on this site, plus how to plan interactive demos. Use when drafting, outlining, editing, or reviewing a post or page in `public/content/`, or when the user says "write a post", "draft a post", "edit my post", "punch this up", or "make it sound like me".
---

# Blog voice

Write like Greg talking to one curious friend at his desk: first person, plain words, real numbers, and a little mischief. The reader should learn something and smile at least once per section. The model post is `public/content/posts/8-bit-sound-effects-with-the-web-audio-api/content.mdx`. Read it before drafting a technical post.

## Who's talking

- A software engineer since 1997, former radio engineer, self-taught photographer, dad of three in Enterprise, Alabama. Family (Tara, Chase, Chloe, Wyatt) shows up naturally when they were part of the story ("Photo by Chloe").
- Learns in public. Says when he didn't know something ("I had NO idea what REM was", "I honestly didn't know") and when it went wrong ("Well, it rained. All day.").
- Opinionated but fair. Tests claims instead of repeating them (the microphone shootout put both mics on the same processor, unedited).
- Warm, a bit dry, never snarky at the reader. Jokes at his own expense or at the situation ("We did this to ourselves.").

## Sentence-level habits

Use these. They're what makes a draft sound like him.

- Short paragraphs, often one to three sentences. A one-line paragraph for a beat: "Go on. I'll wait."
- Question, then answer: "Her blood pressure? It didn't change." "Zoomed into the moon though? I don't have to compromise as much."
- Parenthetical asides that wink: "(Close the tab. It's fine. I've done it too.)"
- Sound words and rhythm in italics: _Tick, tick, tick._ _ch-chk_. _tbleep_. Click. Click Click.
- Exact specifics over adjectives: "40 weeks and 31 minutes", "about 200 lines", "`VOLUME` is `0.05`. Five percent!", "1/250 sec, f/6.3, ISO 100, at 600mm".
- Italics for the one word that carries the stress: "deciding _which_ wave, _how loud_, and _for how long_."
- Bold only for the single sentence a skimmer must not miss, about once per section: "**there are no audio files on this site.**"
- Contractions everywhere. "Here's the thing", "OK", "Turns out" are fine.
- A small confession or reaction after a reveal: "That felt way too low when I wrote it. Then I tried `0.3` with headphones on."

## The whimsy layer

Every technical post should have play built in, not sprinkled on.

1. **Open in the middle.** Start with an action, a scene, or a surprise. Never with a definition or "In this post, I will". Examples: "Before we start, find the little speaker icon in the header and click it." "It happened so fast."
2. **Make the reader do something.** If the site itself demonstrates the topic, send them to poke it. If not, a demo does it (see below).
3. **Build a mental model with a physical analogy** before code: "a bunch of guitar pedals connected by cables." "It's the audio version of making pixels bigger."
4. **Start from the smallest thing that works**, then add one idea per section. Each section answers the question the last one raised.
5. **Name the trap.** Show the bug you actually hit and why: "here's the trap I fell into." Readers trust a post that admits a wrong turn.
6. **Plant a payoff.** A secret, an easter egg, or a promise early ("Like it ten times and... well, you'll see") that a later section pays off ("OK, I promised you a secret.").
7. **End on a callback** to the opening, not a summary. "Now go hover over some links. _Tick, tick, tick._"

Keep it earned. One joke that lands beats three that wink. Whimsy never replaces the explanation; it carries it.

## Explaining technical things

- Explain the _why_ behind each line: why `0.001` and not `0`, why `localStorage` and not a cookie. Cite the primary source inline (MDN, a spec, nesdev, vendor docs) when you state a fact.
- Code blocks are short (under ~20 lines) and real: copy from the repo when the post is about this site, and link to the file on GitHub. Trim to what the paragraph discusses, and say so when something was left out.
- Inline comments in snippets name what each line does in plain words (`// a volume knob`, `// destination = your speakers`).
- Introduce jargon by doing first, naming second: show the overshoot, then "That overshoot is called the Gibbs phenomenon."
- Put a side question the reader is already asking in a callout (below), not an `###` heading: "Wait, where does 523 come from?"
- A closing list of practical lessons is welcome ("What I'd tell you before you try this"), five items max, each a short imperative plus one sentence of why.

## Callouts

A callout is a tinted card for something worth saying that would break the flow of the paragraph: a tangent, a trap, a bonus. Write it as a GitHub alert blockquote. Text after the marker on the same line is the optional title, and it can hold inline code.

```md
> [!NOTE] Wait, where does 523 come from?
> Music has a formula hiding in it...
```

- `[!NOTE]` (blue, info icon): a side question or the "why" behind a number. "Why `0.001` and not `0`?"
- `[!TIP]` (green, bulb): a bonus trick the reader can use elsewhere. "The `satisfies` trick"
- `[!WARNING]` (amber, triangle): the trap that will bite them. "Browsers won't play audio until the visitor interacts with the page."

Rules:

- Three or four per post at most. If everything is a callout, nothing is.
- The post must read fine if the reader skips every callout. The main story stays in the prose.
- Titles are short, in sentence case, and often a question. A lead-in sentence before a warning helps ("Here's the thing that will bite you if you try this:").
- Callouts can hold paragraphs, lists, and code blocks (prefix every line with `>`).
- Keep the voice inside them. A callout is still Greg talking, just leaning in.

## Interactive demos

Plan demos while outlining, not after. Good spots are where prose would say "imagine" or "picture this", or where a value has a feel that numbers can't give (how a fade sounds, what grit does to noise).

Rules for each demo:

- One idea, one or two controls. The reader should get it in five seconds.
- Lead in with an invitation on the line before: "Don't take my word for it. Drag the slider:" "Crank it and see (and hear) for yourself:" "Listen to the very end of each one:"
- Follow with a paragraph that names what they just saw or heard, and the surprising part ("Somewhere past 16, it stops sounding like static and starts sounding like a broken robot.").
- Titles are short imperative verb phrases: "Build a square wave", "Write a sound", "Hear the click", "Crunch the noise".
- Let readers break things on purpose. Editable values, presets, a way to reset, and output they can copy (the notes demo prints code you can paste into `SOUNDS`).
- The surrounding prose must still make sense without JavaScript, because the post prerenders and the demo is a client island.

Mechanics follow `AGENTS.md` ("Demos"): `<div data-demo="name"></div>` on its own line in the post, components in `components/islands/demos/<slug>/demos.tsx`, names and titles in `registry.ts`, built from `components/islands/demo-kit/` (`Plot`, `Controls`, `DemoButton`, `Slider`, `Caption`). Sound goes through `playNotes`. Run `npm run content` after adding a demo. Put pure helpers (wave math, formatters) in exported functions so unit tests can cover them.

When drafting a post, list proposed demos (name, title, control, what the reader learns) and get approval before building them.

## Shape of a post

```
---
title: 'Short, sentence case, a little playful'   # 'My website goes beep now'
slug: 'keyword-rich-slug'                          # matches the folder name
date: '2026-10-23T00:00:00'
modified: '2026-10-23T00:00:00'
type: 'post'
draft: true                                        # until Greg publishes
description: 'One specific sentence: what, how, and a concrete number.'
featuredImage: './file.jpg'
categories: ['Code']                               # or ['Blog']
tags: ['lowercase', 'tags']
---
```

1. Hook (2-5 short paragraphs): scene or action, the surprise, what we're about to take apart.
2. Sections, `##` in sentence case. Mix plain labels with questions or playful phrasing: "The world's smallest synthesizer", "Why square waves sound like Nintendo", "The browser doesn't trust you (and that's good)".
3. Payoff section if one was planned.
4. Practical lessons, then a link to the code.
5. One-line callback ending.

## Other registers

- **Photography and behind-the-shot:** chronological, practice then result, settings as a short list (aperture, shutter, ISO, focal length), honest about misses. Keep the playful asides; skip demos unless one shows something a photo can't.
- **Personal and family:** dialogue in quotes, scene by scene, sincere. Dial the jokes down to Greg's own (the "sarcastic ass in me" level), never at anyone else's expense. Scripture closers appear in his personal posts; keep them if he writes them, don't add them.
- **Reviews and comparisons:** state the claim being tested, show the method, show raw results, then the opinion.

## Old habits to drop

Older posts on this site have patterns the current rules forbid. Don't copy them:

- Emoji, including the old `📸` and `🤣` sign-offs.
- Em dashes, en dashes as dashes, and `--`. Use a comma, colon, or parentheses.
- Title Case headings and generic "Wrap Up", "Preface", "Further Reading" sections.
- "Thanks for reading!" as the last line.
- Bold on several sentences per section, ALL CAPS for emphasis, `Lol!`.
- "Additionally", "As an aside", "Please note", "TL;DR" blocks.

## Writing rules

Follow `docs/code-standards.md` ("Writing"): straight quotes, no em dashes, sentence case, plain verbs, no emoji. Also skip: delve, robust, seamless, leverage, ensure, crucial, showcase, highlight (verb), "not just X, but Y", and sentence-ending "-ing" phrases that explain significance.

## Workflow

**Drafting:**

1. Read the code or notes the post is about. For a post about this site, read the real files so every snippet and number is true.
2. Propose an outline: the hook, sections with one idea each, demo spots, the payoff, the ending callback. Wait for a go-ahead on anything that needs new demo code.
3. Write to `public/content/posts/<slug>/content.mdx` with `draft: true`.
4. Self-check below, then `npm run format` and `npm run content`.

**Editing Greg's draft:** keep his jokes, asides, and phrasing. Tighten, fix facts, and apply the writing rules. Flag anything that drifts from the voice instead of rewriting it wholesale. Don't sand the personality off.

## Self-check

- Does the first line drop the reader into something?
- Is there a number where there was an adjective?
- Does each section teach one thing, and does each demo have an invitation before and a reveal after?
- Is each tangent or trap in a callout, with no more than four in the post?
- Is there at least one honest "I got this wrong" or "I didn't know"?
- Does the ending call back to the opening?
- Any emoji, em dashes, curly quotes, Title Case headings, or banned words?
- Would the post still read well with JavaScript off?
