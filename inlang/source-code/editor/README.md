![editor banner image](https://cdn.jsdelivr.net/gh/opral/monorepo@main/inlang/source-code/editor/assets/editor-header.png)

# Edit translations with version control in a visual editor.

Fink enables translators to edit translations in a visual editor and submit them to your repository. It is a client-side application that pulls the translations from your repository into the browser and commits changes back to it. Contributors can easily submit translations by creating forks and pull requests within the editor.
<br />
<br />

Used by

<doc-proof organisations="osmosis, appflowy, remnote"></doc-proof>

# Why use Fink?
<doc-features>
  <doc-feature text-color="#0F172A" color="#E1EFF7" title="Edit messages visually" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/source-code/editor/assets/editor01.png"></doc-feature>
  <doc-feature text-color="#0F172A" color="#E1EFF7" title="Collaborate using version control" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/source-code/editor/assets/editor02.png"></doc-feature>
  <doc-feature text-color="#0F172A" color="#E1EFF7" title="Ensure quality with lint rules" image="https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/source-code/editor/assets/editor03.png"></doc-feature>
</doc-features>

<br />
<br />

<doc-comments>
<doc-comment text="The web editor is very well-made! ↹-compatible, fast auto-translate, nice working UI, all good!" author="WarningImHack3r" icon="mdi:github"></doc-comment>
<doc-comment text="Looks like @inlangHQ is going to kill all the translation services with CLI, IDE extension, web editor,  plugins, and CI/CD combo. Amazing." author="Nedim Arabacı" icon="simple-icons:x"></doc-comment>
</doc-comments>
<doc-comment text="I was blown away when I realized that everything in the inlang web editor was done client side." author="Anonym" icon="mdi:discord"></doc-comment>
</doc-comments>

<br />
<br />

# Let's get started

1. Add a `project.inlang` folder to your repository
2. Create a `settings.json` file to that new dir `project.inlang/settings.json`
3. Install a plugin that reads and writes your messages from the [inlang marketplace](https://inlang.com/c/plugins)
---
4. **Optional** Install lint rules to find errors in your translations from the [inlang marketplace](https://inlang.com/c/lint-rules)

Look at the [example repository](https://github.com/opral/example) and it's [settings.json](https://github.com/opral/example/blob/main/project.inlang/settings.json) for a working example.

## Example

This is how the editor could look like for your project:

<doc-links>
    <doc-link title="Open inlang example" icon="icon-park-outline:editor" href="/editor/github.com/opral/example" description="inlang example repository in the editor"></doc-link>
</doc-links>

# How to contribute translations

[![Fink Guide Ad](https://cdn.jsdelivr.net/gh/opral/monorepo@latest/inlang/assets/marketplace/editor-guide-image.jpg) Read in-depth guide](https://inlang.com/g/6ddyhpoi/guide-nilsjacobsen-contributeTranslationsWithFink)

# Pricing 
 
<doc-pricing heading="Fink has and will have a free tier." content="In the future, we will likely monetize features that bring value to larger (enterprise) projects. If you have a small project, don't worry about paying for fink."></doc-pricing>

# Login via GitHub

If your repository can't be accessed anonymously, you can login via GitHub. The editor will ask you to login if it can't access your repository.
