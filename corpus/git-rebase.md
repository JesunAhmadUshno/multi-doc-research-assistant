# Git Rebase and Merge

Git offers two ways to integrate work from one branch into another: merging and rebasing. A merge creates a new merge commit with two parents that ties the two histories together, preserving the exact record of when branches diverged and rejoined. The history keeps its true shape, including every branch point.

A rebase instead replays commits. When you rebase a feature branch onto the main branch, Git temporarily sets the feature commits aside, fast-forwards the branch pointer to the tip of main, and then reapplies each feature commit one at a time on top. The result is a straight, linear history as if the work had started from the current main all along. Because the commits are reapplied onto a new base, each replayed commit gets a new commit hash, even when its content is identical.

Rewriting hashes is why the golden rule of rebasing exists: never rebase commits that have been pushed and shared with other people. Their copies still point at the old hashes, and your rewritten history will diverge from theirs, forcing confusing recovery work on everyone. Rebasing your own local, unpushed commits is safe and is a common way to clean up work before sharing it.

Interactive rebase, started with git rebase -i, opens a list of the commits about to be replayed and lets you edit the plan. You can reorder commits, squash several commits into one, reword messages, edit a commit's content, or drop a commit entirely. Teams use it to turn a messy series of work-in-progress commits into a small set of clear, reviewable steps.

When a replayed commit conflicts with the new base, Git pauses the rebase and marks the conflict in the files. You resolve the conflict, stage the result, and run git rebase --continue. If things go wrong, git rebase --abort returns the branch to exactly where it was before the rebase started.
