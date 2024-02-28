# @inlang/sdk

## 0.26.4

### Patch Changes

- Updated dependencies [960f8fb70]
  - @inlang/plugin@2.4.6
  - @inlang/module@1.2.6

## 0.26.3

### Patch Changes

- Updated dependencies [32746a9ff]
  - @inlang/language-tag@1.5.1
  - @inlang/message@2.0.3
  - @inlang/message-lint-rule@1.4.3
  - @inlang/plugin@2.4.5
  - @inlang/project-settings@2.2.3
  - @inlang/translatable@1.3.1
  - @inlang/module@1.2.5

## 0.26.2

### Patch Changes

- Updated dependencies [244442698]
  - @inlang/language-tag@1.5.0
  - @inlang/translatable@1.3.0
  - @inlang/message@2.0.2
  - @inlang/message-lint-rule@1.4.2
  - @inlang/plugin@2.4.4
  - @inlang/project-settings@2.2.2
  - @inlang/module@1.2.4

## 0.26.1

### Patch Changes

- Updated dependencies [3bf94ddb5]
  - @lix-js/client@0.8.0

## 0.26.0

### Minor Changes

- 676c0f905: remove deprecated loadProject({nodeishFs})

## 0.25.0

### Minor Changes

- 87bed968b: add: `project.id` API
- 23ca73060: add project identify

## 0.24.1

### Patch Changes

- Updated dependencies [23ce3f0ea]
  - @lix-js/client@0.7.0

## 0.24.0

### Minor Changes

- c38faebce: release fixed project id and catchup missed releases for cli and lix

### Patch Changes

- Updated dependencies [c38faebce]
  - @lix-js/client@0.6.0
  - @lix-js/fs@0.6.0
  - @inlang/plugin@2.4.3
  - @inlang/module@1.2.3

## 0.23.0

### Minor Changes

- b920761e6: refactor: remove `_capture` in favor of `appDir` for product insights

### Patch Changes

- Updated dependencies [74ac11c47]
  - @inlang/language-tag@1.4.0
  - @inlang/message@2.0.1
  - @inlang/message-lint-rule@1.4.1
  - @inlang/plugin@2.4.2
  - @inlang/project-settings@2.2.1
  - @inlang/translatable@1.2.1
  - @inlang/module@1.2.2

## 0.22.0

### Minor Changes

- cd29edb11: bumbing fixed env var dependecy issue affected packages

### Patch Changes

- Updated dependencies [cd29edb11]
  - @lix-js/client@0.5.0

## 0.21.0

### Minor Changes

- e20364a46: release fixed dependency chain in preparation for paraglide 1.0

### Patch Changes

- Updated dependencies [e20364a46]
  - @lix-js/client@0.4.0
  - @lix-js/fs@0.5.0
  - @inlang/plugin@2.4.1
  - @inlang/module@1.2.1

## 0.20.0

### Minor Changes

- bc5803235: hotfix reactivity bug in ide extension

## 0.19.0

### Minor Changes

- 8b05794d5: BREAKING refactor: rename `openProject({ settingsFilePath })` to `openProject({ projectPath })` to align with new project directory structure

## 0.18.0

### Minor Changes

- 9212cc19d: fix: https://github.com/opral/monorepo/issues/1647

## 0.17.0

### Minor Changes

- cafff8748: adjust tests and fix erros message

### Patch Changes

- Updated dependencies [39beea7dd]
  - @inlang/plugin@2.4.0

## 0.16.0

### Minor Changes

- 2f924df32: added Modulesettings validation via the Typebox JSON Schema Validation. This ensure that users can exclusively use module settings when there are given by the moduel

### Patch Changes

- Updated dependencies [2f924df32]
  - @inlang/message-lint-rule@1.4.0
  - @inlang/plugin@2.2.0

## 0.15.0

### Minor Changes

- f5d9aa485: improve: better error output for invalid project settings
- d5e794e0c: fix: 'module' not defined error

  The error was caused by the variable `module` being shadowed by vitest types.

  ```diff
  export class ModuleHasNoExportsError extends ModuleError {
  	constructor(options: { module: string; cause?: Error }) {
  		super(
  -			`Module "${module}" has no exports. Every module must have an "export default".`,
  +			`Module "${options.module}" has no exports. Every module must have an "export default".`,
  			options
  		)
  		this.name = "ModuleHasNoExportsError"
  	}
  }
  ```

## 0.14.0

### Minor Changes

- 6fe144640: fix #1478 – loadProject with absolute windows paths

## 0.13.0

### Minor Changes

- 0e0d910b7: check languageTags for sourceLanguageTag
- 5c443c47a: chore: (again) removed the `PluginUsesReservedNamespaceError` from `loadProject()`. A previous merge conflict seemed to have re-introduced the error.
- ae752c309: REFACTOR: Removed PluginUsesReservedNamespaceError.

  The feedback loop for causing the error was too long. Creating a new inlang plugin always required adding the plugin to the whitelist, which has been forgotting leading to crashes in production.
  Furthermore, the sdk should not crash if plugins are valid. The marketplace is the appropriate place to validate namespaces.

- 029d78dc8: #1456 add windows tests & fix tests

## 0.12.0

### Minor Changes

- 936cfa401: fix [[#1456](https://github.com/opral/monorepo/issues/1456)]: resolving modules from relative paths sometimes lead to incorrect file paths and subsequent import failures

## 0.11.0

### Minor Changes

- 6f42758bb: force absolute path for settingsFilePath to intercept nodeishFs with absolute paths

### Patch Changes

- Updated dependencies [6f42758bb]
  - @inlang/plugin@2.1.0
  - @lix-js/fs@0.3.0

## 0.10.0

### Minor Changes

- 2976a4b15: IMPROVE: Better error messages across the SDK.

## 0.9.0

### Minor Changes

- 0f9dc72b3: refactor: expose all project settings to modules

### Patch Changes

- Updated dependencies [e56bcdd4e]
- Updated dependencies [404d365b2]
- Updated dependencies [d57b1a2ce]
  - @inlang/message-lint-rule@1.3.0
  - @inlang/plugin@2.0.0
  - @inlang/project-settings@2.2.0

## 0.8.0

### Minor Changes

- b7dfc781e: change message format match from object to array

### Patch Changes

- Updated dependencies [b7dfc781e]
  - @inlang/message@2.0.0

## 0.7.0

### Minor Changes

- 0d0502f4: deprecate detectedLanguageTags

### Patch Changes

- Updated dependencies [0d0502f4]
  - @inlang/plugin@1.3.0

## 0.6.0

### Minor Changes

- 84ed67f2: Update @inlang/language-tag dependency which removes the language tag validation, unblocking several users of inlang.

### Patch Changes

- Updated dependencies [84ed67f2]
  - @inlang/translatable@1.2.0

## 0.5.0

### Minor Changes

- 25fe8502: refactor: remove plugin.meta and messageLintRule.meta nesting
- 0a2114d4: refactor: rename `config` to `settings` and `setConfig` to `setSettings` respectively

### Patch Changes

- Updated dependencies [25fe8502]
  - @inlang/message-lint-rule@1.2.0
  - @inlang/project-settings@2.1.0
  - @inlang/plugin@1.2.0

## 0.4.0

### Minor Changes

- 071cac4a: fix: use ESM compatible ddent library

## 0.3.0

### Minor Changes

- 73f7a0bf: add: createNodeishMemoryFs for easier testing

## 0.2.0

### Minor Changes

- 973858c6: chore(fix): remove unpublished dependency which lead to installation failing

### Patch Changes

- Updated dependencies [973858c6]
  - @inlang/message-lint-rule@1.1.0
  - @inlang/project-settings@1.2.0
  - @inlang/language-tag@1.1.0
  - @inlang/translatable@1.1.0
  - @inlang/message@1.1.0
  - @inlang/module@1.1.0
  - @inlang/plugin@1.1.0
  - @inlang/json-types@1.1.0
  - @inlang/result@1.1.0
  - @lix-js/fs@0.2.0
