# Contributing to Hello World Atlas

Thanks for helping the atlas grow. The goal is simple: one tiny, idiomatic `Hello, World!` example per language or format.

## Add a language

1. Create a folder using the language's common display name.
2. Add one minimal source file with the conventional extension.
3. Keep the visible output exactly `Hello, World!` when the language supports output.
4. Add one short positive comment where comments are valid.
5. Add the language to `docs/catalog.json` and `LANGUAGES.md`.
6. Run `python scripts/check_catalog.py` before opening a pull request.

## Style rules

- Prefer standard-library-only examples.
- Prefer the most recognizable entry point for the language.
- Do not add dependencies just to print a greeting.
- Avoid generated binaries, IDE folders, build artifacts, and lock files for one-line examples.
- Keep filenames predictable: `main.*`, `hello.*`, `Main.*`, or the ecosystem convention.
- Keep the repository welcoming and beginner-friendly.

## Pull request title

Use a clear title such as:

```text
feat: add Elm hello world
```

## Why the positive comments?

The source files are intentionally tiny, so each one carries a small reminder that learning a language is a beginning, not a test.
