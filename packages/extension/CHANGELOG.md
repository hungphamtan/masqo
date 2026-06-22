# Changelog

## [0.1.2](https://github.com/hungphamtan/masqo/compare/v0.1.1...v0.1.2) (2026-06-22)


### Features

* improve ux for run locally ([3e52888](https://github.com/hungphamtan/masqo/commit/3e528883b1ec34721510995a64753f75bececd6c))
* mobile-responsive web app UI ([c4b246d](https://github.com/hungphamtan/masqo/commit/c4b246d35f0863ecece30244703ffadc12ac6e3a))
* PII detector + code fixes + policy consistency ([48df080](https://github.com/hungphamtan/masqo/commit/48df080541b8086fcdbcd1ce256bb8327ad2056a))
* UX improvement ([a76a4e9](https://github.com/hungphamtan/masqo/commit/a76a4e9745ea4f7d58e7215ebb62a2791a1516cc))


### Bug Fixes

* move clipboard.write to content script to avoid permissions policy violation ([2916d6e](https://github.com/hungphamtan/masqo/commit/2916d6e3d54b6100bc5f4603d984a400ecda36f8))
* refocus textarea before inserting redacted text ([c8d22de](https://github.com/hungphamtan/masqo/commit/c8d22dedde093529a5b37d4074e13bd00a44432b))
* resolve dependency vulnerabilities and build failures ([2885453](https://github.com/hungphamtan/masqo/commit/28854537a035c3d9bc738b6d7b72c96c48e1411a))
* resolve security blockers for v0.1.0 launch ([fce34ce](https://github.com/hungphamtan/masqo/commit/fce34ce14351dd423250632599b5c6d5e99ce283))
* use relative asset paths in extension build ([33cf785](https://github.com/hungphamtan/masqo/commit/33cf785756afdbc843f12c47b20a51e23b3ac4f3))
* use wildcard origin for sidebar-to-parent postMessage ([8801e37](https://github.com/hungphamtan/masqo/commit/8801e37ce3c6272721e117d77f0479ef347e9686))
* use window.location.origin in sidebar postMessage ([2417f3a](https://github.com/hungphamtan/masqo/commit/2417f3a30b9715809288862b0aa989fa8c5b9710))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @masqo/engine bumped from file:../engine to 0.1.2
    * @masqo/shared bumped from file:../shared to 0.1.2
