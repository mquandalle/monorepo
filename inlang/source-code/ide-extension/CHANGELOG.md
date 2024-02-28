# inlang-vs-code-extension

## 1.32.8

### Patch Changes

- 960f8fb70: rename the vscode extension to "Sherlock"
  - @inlang/sdk@0.26.4
  - @inlang/telemetry@0.3.12

## 1.32.7

### Patch Changes

- b0d016e93: Use latest chromedriver to help CI install

## 1.32.6

### Patch Changes

- 22336898c: Subscribe message view to sdk message changes for dynamic updates

## 1.32.5

### Patch Changes

- d9cf66170: update docs for apps and plugins

## 1.32.4

### Patch Changes

- f5f65581e: remove commands from command palette

## 1.32.3

### Patch Changes

- @inlang/sdk@0.26.3
- @inlang/telemetry@0.3.11

## 1.32.2

### Patch Changes

- 073c78864: Changed the hreft from the 'create project’ button in the IDE extension and update docs
- 4e8cafcdd: remove missing custom api setings decoration in settings file
- 9ed82b43d: disable sentry error logging for now

## 1.32.1

### Patch Changes

- 611d058d4: scope sentry logging to activate function of extension
  - @inlang/sdk@0.26.2
  - @inlang/telemetry@0.3.10

## 1.32.0

### Minor Changes

- b3090c279: fix env issues in Visual Studio Code extension (Sherlock)

## 1.31.0

### Minor Changes

- 2f160c130: refactor: clean up env variable usage

## 1.30.2

### Patch Changes

- 431ee545d: add sentry error monitoring

## 1.30.1

### Patch Changes

- 30e03afa5: fix potential reactivity issue

## 1.30.0

### Minor Changes

- 7037bc8b3: remove outdated "configure replacement options" prompt.

  - https://github.com/opral/monorepo/discussions/2159#discussioncomment-8325600

## 1.29.4

### Patch Changes

- 008313fa1: fix message view layout

## 1.29.3

### Patch Changes

- d646e6f66: add jump to message position in code

## 1.29.2

### Patch Changes

- f7dc963df: add inline annotation language switching

## 1.29.1

### Patch Changes

- Updated dependencies [3bf94ddb5]
  - @lix-js/client@0.8.0
  - @inlang/sdk@0.26.1
  - @inlang/telemetry@0.3.9

## 1.29.0

### Minor Changes

- c98ea1dfe: refactor: internal change how projects are identified

## 1.28.3

### Patch Changes

- f26c19758: fix Fink url for cross-selling

## 1.28.2

### Patch Changes

- 365fd5610: update readme & recommendation view

## 1.28.1

### Patch Changes

- 9a55e9390: update codicon location

## 1.28.0

### Minor Changes

- f2b4e23e5: add inlang tab

### Patch Changes

- 870143a22: update import with workspaceFolder

## 1.27.0

### Minor Changes

- 676c0f905: remove deprecated loadProject({nodeishFs})

### Patch Changes

- Updated dependencies [676c0f905]
  - @inlang/sdk@0.26.0
  - @inlang/telemetry@0.3.8

## 1.26.0

### Minor Changes

- 2f55a1a0d: chore: add project group identify

### Patch Changes

- Updated dependencies [87bed968b]
- Updated dependencies [23ca73060]
  - @inlang/sdk@0.25.0
  - @inlang/create-project@1.1.8
  - @inlang/telemetry@0.3.7

## 1.25.5

### Patch Changes

- @inlang/sdk@0.24.1
- @inlang/create-project@1.1.7
- @inlang/telemetry@0.3.6

## 1.25.4

### Patch Changes

- Updated dependencies [c38faebce]
  - @inlang/sdk@0.24.0
  - @lix-js/fs@0.6.0
  - @inlang/create-project@1.1.6
  - @inlang/telemetry@0.3.5

## 1.25.3

### Patch Changes

- Updated dependencies [b920761e6]
  - @inlang/sdk@0.23.0
  - @inlang/create-project@1.1.5
  - @inlang/telemetry@0.3.4

## 1.25.2

### Patch Changes

- Updated dependencies [cd29edb11]
  - @inlang/sdk@0.22.0
  - @inlang/create-project@1.1.4
  - @inlang/telemetry@0.3.3

## 1.25.1

### Patch Changes

- Updated dependencies [e20364a46]
  - @inlang/sdk@0.21.0
  - @lix-js/fs@0.5.0
  - @inlang/create-project@1.1.3
  - @inlang/telemetry@0.3.2

## 1.25.0

### Minor Changes

- bc5803235: hotfix reactivity bug in ide extension

### Patch Changes

- Updated dependencies [bc5803235]
  - @inlang/sdk@0.20.0
  - @inlang/create-project@1.1.2
  - @inlang/telemetry@0.3.1

## 1.24.0

### Minor Changes

- 013a0923b: fix windows close project selection bug

## 1.23.0

### Minor Changes

- 1d0f167b4: Bug fix of internal #195

### Patch Changes

- Updated dependencies [1d0f167b4]
  - @inlang/telemetry@0.3.0

## 1.22.0

### Minor Changes

- e237b4942: chore: update SDK dependency and support for project directories

## 1.21.1

### Patch Changes

- @inlang/telemetry@0.2.1

## 1.21.0

### Minor Changes

- 82ccb9e80: add quote stripping to extract messages in Visual Studio Code extension (Sherlock)
- cc3c17d8a: add resolve string escape for inline preview

## 1.20.0

### Minor Changes

- Adjust publish script to publish to marketplace

## 1.19.0

### Minor Changes

- change logo of Visual Studio Code extension (Sherlock)

## 1.18.0

### Minor Changes

- 6e1fddf71: update watch & README + MARKETPLACE

## 1.17.0

### Minor Changes

- ae3cad41c: latest bugfixes

## 1.16.0

### Minor Changes

- 9d754d722: add watch to fs

### Patch Changes

- Updated dependencies [9d754d722]
  - @lix-js/fs@0.4.0

## 1.15.0

### Minor Changes

- 452553bed: remove reload prompt instead silent reload
- 39beea7dd: change return type of extractMessageOptions

## 1.14.0

### Minor Changes

- 77ed7a85c: update deps

## 1.13.0

### Minor Changes

- 3bfc38121: Use configured proxy for requests from ide-extension, if available

## 1.12.0

### Minor Changes

- a3bd1b72f: fix: show inlang logo as extension icon

### Patch Changes

- Updated dependencies [6f42758bb]
  - @lix-js/fs@0.3.0

## 1.11.0

### Minor Changes

- a1f3f064b: improve: tryAutoGenProjectSettings

  - Only prompts the user if the settings can actually be generated.

  refactor: remove unused code

## 1.10.0

### Minor Changes

- 241a37328: Refactor event emitters

## 1.9.0

### Minor Changes

- e336aa227: clean up command configuration

## 1.8.0

### Minor Changes

- b7dfc781e: change message format match from object to array

## 1.7.0

### Minor Changes

- 9df069d11: quickfix: Visual Studio Code extension (Sherlock) config create

## 1.6.0

### Minor Changes

- 564a2df5: improved the wording of the automatic settings file prompt

## 1.5.0

### Minor Changes

- 8bf4c07a: fix lint reactivity bug & migrate

## 1.4.0

### Minor Changes

- 1df3ba43: improve auto settings & ide extension structure

## 1.3.0

- updated dependencies

## 1.2.0

### Minor Changes

- 0f925704: fix env

## 1.1.0

### Minor Changes

- 973858c6: chore(fix): remove unpublished dependency which lead to installation failing

### Patch Changes

- Updated dependencies [973858c6]
  - @inlang/telemetry@0.2.0
  - @inlang/result@1.1.0
  - @lix-js/fs@0.2.0

## 0.9.3

### Patch Changes

- 1bd24020: Fixes an error so placeholders are displayed in message previews.

## 0.9.2

### Patch Changes

- 68504fbc: update README

## 0.9.1

### Patch Changes

- ce0c2566: add jsonc parser for extensions.json parsing

## 0.9.0

### Minor Changes

- 9ff20754: Add context tooltip, which lets you view all localizations of a message, edit and open them in the editor.
- 823cec8a: add lints to ide extension

## 0.8.1

### Patch Changes

- 06b12597: Adjust loading inlangs config so it is compatible with Windows
- 543231e4: Fixes telemtry in ide-extension, so it won't crash if there is no git.

## 0.8.0

### Minor Changes

- 283f5764: Several performance improvements.

### Patch Changes

- 943e29c1: added a missing group identifier event

## 0.7.6

### Patch Changes

- 584e436b: Updated to new plugin-json link from monorepo

## 0.7.5

### Patch Changes

- 66519584: Fixes https://github.com/opral/monorepo/issues/927

## 0.7.4

### Patch Changes

- 3657b5ea: fix config not loading because of wrong path detection
- 11452575: remove telemetry events "decoration set" and "code action provided"

## 0.7.3

### Patch Changes

- 97092de0: fix config not loading because of wrong path detection
- 97092de0: remove telemetry events "decoration set" and "code action provided"

## 0.7.2

### Patch Changes

- 719c1e8b: internal refacotring

## 0.7.1

### Patch Changes

- 66e85ac1: Fix: Importing local JavaScript files via $import() has been fixed.
- c9208cc6: capture the used configs for roadmap priorization
- 7f4e79bb: add telemetry for recommended in workspace

## 0.7.0

### Minor Changes

- 16f4307f: add recommendation prompt
- d9ff0e23: change recommendation key to "disableRecommendation"

## 0.6.4

### Patch Changes

- 1cad35e9: persist user with id

## 0.6.3

### Patch Changes

- 04f5ac93: The ide extension config has been moved back into @inlang/core. For more information, read https://github.com/opral/monorepo/issues/856.
- Updated dependencies [04f5ac93]
  - @inlang/core@0.9.0

## 0.6.2

### Patch Changes

- b3e868f1: remove monorepo config parsing and add warning to config if no ide extension properties are set

## 0.6.1

### Patch Changes

- 04f81ae8: Minor refactorings

## 0.6.0

### Minor Changes

- 9cd701a3: The Visual Studio Code extension (Sherlock) should now work for the majority of projects.

  We fixed a problem that blocked the Visual Studio Code extension (Sherlock) for months. The extension transpiles ESM under the hood to CJS now because Electron, and thus Visual Studio Code, do not support ESM.

## 0.5.9

### Patch Changes

- @inlang/core@0.8.6

## 0.5.8

### Patch Changes

- @inlang/core@0.8.5

## 0.5.7

### Patch Changes

- a9b71575: fix: dynamic import

## 0.5.6

### Patch Changes

- 4147156d: refactor esm imports

## 0.5.5

### Patch Changes

- 5c6d472e: update settings for plugins
- Updated dependencies [5c6d472e]
  - @inlang/core@0.8.4

## 0.5.4

### Patch Changes

- 652de069: update for ide extension release
- 89f0c7a2: update vs-code-extension

## 0.5.3

### Patch Changes

- Updated dependencies [6bf22450]
- Updated dependencies [61190e25]
  - @inlang/core@0.5.3

## 0.5.1

### Patch Changes

- @inlang/core@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [a0b85eb]
- Updated dependencies [e9e9ce5]
  - @inlang/core@0.5.0

## 0.4.3

### Patch Changes

- Updated dependencies [fc30d4b]
  - @inlang/core@0.4.3

## 0.4.2

### Patch Changes

- Updated dependencies [f28da6b]
- Updated dependencies [f28da6b]
- Updated dependencies [f28da6b]
  - @inlang/core@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [e5a88c8]
  - @inlang/core@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [1d756dd]
- Updated dependencies [a4b9fce]
  - @inlang/core@0.4.0
