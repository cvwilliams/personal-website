---
title: 'Who is code style for in the AI era?'
description: 'Linters and formatters exist so people can read each other’s code, but we are writing and reading way less of it.'
pubDate: 2026-11-15
tags: ['AI', 'software engineering']
draft: false
---

For my whole career, a big part of maintaining a codebase has been agreeing on how it should look.
Tabs or spaces (and how many), where the braces go, line length, how to name things, when to leave a
comment. Style guides, linters, formatters, and intricate commit hooks and CI jobs ensured we were
always on the same page as a team. It was worth it, since code is read far more often than it's
written, and a shared style made it faster for us to review each other's work.

That last part is the assumption I keep coming back to: code style exists for human readers. As AI
takes more and more of the responsibility of reading and writing code, I'm not sure the tools we
built for human readers hold their value.

## We're already reading less

I've noticed this in my own work. I describe a change, AI makes it, and I review the result. Does it
behave the way I wanted, do the tests pass, does the diff touch what I expected? I read code to
check intent and nothing more. The parts of a code review that used to be about style, like a
nitpick about naming or a misplaced bracket, are disappearing, because no one will be less
productive either way.

As this trend continues, and I think it will, the main reader of most code won't be a person. It
will be a model.

## What does a model want to read?

AI doesn't mind long files, doesn't lose its place in deeply nested code and doesn't need a
consistent indent to follow the logic. It picks up context from the code without the help a human
needs. In fact, some of what we did for human productivity is actively in the way. Verbose names,
wordy comments that restate what the code does, and generous formatting all cost tokens. Tokens are
the model's time and attention, so more of them means slower changes, higher cost and less room for
the context that actually matters. Brevity is now a feature when your reader is a model.

Maybe the question changes from "How do I make this easy for the next engineer to read?" to "How do
I make this optimal for the next model to work with?"

## Style on demand

The other part of this conversation is that style used to be expensive to change, so we had to agree
on one. If everyone formatted code their own way, every file would be a mess of competing
preferences, and reformatting by hand wasn't worth the time.

That's no longer true. If I want to read a piece of code, I can ask an AI to format it however I
like, add comments, explain parts or walk me through it line by line. A team no longer needs to
agree on one format just so I can read it, and we don't need to spend CI minutes enforcing
consistency on code that we rarely look at.

## Where I might be wrong

I don't think all of this goes away overnight, and a few things give me pause:

- **Code review does still matter.** As long as people review changes, a consistent format keeps
  diffs small and focused on what actually changed.
- **Comments may carry context the code can't.** Why something is done a certain way, what business
  rule it enforces, what was tried and didn't work. That isn't in the code, and a model needs it as
  much as a human does.
- **Models learn from human code.** Today's models are trained on code written by humans, so they
  may still work best with code that looks like it.

But the direction seems clear to me. Linting and formatting were tools for helping people read code.
As people read less, we should be honest about who our code is really for and write for that reader.
