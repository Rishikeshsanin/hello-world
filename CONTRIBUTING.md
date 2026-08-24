# Contributing to Hello World Atlas

Thanks for helping the atlas grow. The project has two goals: keep every `Hello, World!` example **small and idiomatic**, and keep the interactive website **fast, welcoming, and fun to explore**.

## Add a language or format

1. Create a folder using the ecosystem's common display name.
2. Add one minimal source file with the conventional extension and entry point.
3. Keep the visible greeting exactly `Hello, World!` when the ecosystem supports output.
4. Add the educational comment `this is a comment and is ignored by the compiler` (use `interpreter`, `runtime`, etc. when that is more accurate) using native comment syntax.
5. Keep one short positive comment beneath it where comments are valid.
6. Add the entry to `docs/catalog.json`, `website/catalog.json`, and `LANGUAGES.md` when applicable.
7. Run `python scripts/check_catalog.py` before opening a pull request.

## Improve the website

The production UI lives in [`website/`](./website/) and intentionally has **no framework or build step**.

When changing the website:

- keep the layout responsive,
- preserve keyboard navigation and readable focus states,
- avoid adding a dependency for something a few lines of native HTML/CSS/JS can do,
- test both dark and light themes,
- test Explore, Compare, Learn, and Play after larger changes,
- include a screenshot or short description of visual changes in the pull request.

## Style rules

- Prefer standard-library-only examples.
- Prefer the most recognizable entry point for the language.
- Do not add dependencies just to print a greeting.
- Avoid binaries, IDE folders, build output, and unrelated generated files.
- Keep filenames predictable: `main.*`, `hello.*`, `Main.*`, or the ecosystem convention.
- Keep both comments close to the greeting so the example stays beginner-friendly.
- Curate languages for value and variety rather than inflating the count.

## Pull request titles

Clear, conventional titles are easiest to scan:

```text
feat: add Elm hello world
fix: correct Fortran comment syntax
docs: improve language catalog
feat: add compare keyboard shortcut
```

The pull request template will guide you through the final checks.

## Why the two comments?

The first comment teaches a beginner what comments do. The second keeps the collection warm and reinforces the project's central idea: **learning a language is a beginning, not a test**.

Thanks for making the atlas a little better. ✦
