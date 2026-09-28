# Changelog

## [0.1.5](https://github.com/hungphamtan/masqo/compare/masqo-v0.1.4...masqo-v0.1.5) (2026-09-28)


### Features

* add Cloudflare Web Analytics snippet to web app ([f467bf0](https://github.com/hungphamtan/masqo/commit/f467bf0d7509bf0b528d23a59c17b31b14d155f3))
* add more help sections ([7c2aae6](https://github.com/hungphamtan/masqo/commit/7c2aae6dc18c901be16e2dc2d0336a451049e8b4))
* add opt-in Plausible analytics with consent banner ([0cd816f](https://github.com/hungphamtan/masqo/commit/0cd816fdf1fa271e7af19bc9db5fa54dc0478f4f))
* improve ux for run locally ([3e52888](https://github.com/hungphamtan/masqo/commit/3e528883b1ec34721510995a64753f75bececd6c))
* mobile-responsive web app UI ([c4b246d](https://github.com/hungphamtan/masqo/commit/c4b246d35f0863ecece30244703ffadc12ac6e3a))
* PII detector + code fixes + policy consistency ([48df080](https://github.com/hungphamtan/masqo/commit/48df080541b8086fcdbcd1ce256bb8327ad2056a))
* prep npm packages for publishing ([ad89527](https://github.com/hungphamtan/masqo/commit/ad895271d5d5eda749998aeec98e9586c92e7e56))
* UX improvement ([a76a4e9](https://github.com/hungphamtan/masqo/commit/a76a4e9745ea4f7d58e7215ebb62a2791a1516cc))
* **web:** accessible FlowDiagram component ([39a7289](https://github.com/hungphamtan/masqo/commit/39a72894ac330ff2c1309e4b0f77e17797b53945))
* **web:** cli and engine detail pages ([cf4c96f](https://github.com/hungphamtan/masqo/commit/cf4c96f44fff62d32e28af2305a451d7b628edbf))
* **web:** DetailPage layout composing diagram + media ([cb5499e](https://github.com/hungphamtan/masqo/commit/cb5499e81e0e790a76ef78a402edb6ae4af08758))
* **web:** FeatureMedia video component with fallback + transcript ([b71012d](https://github.com/hungphamtan/masqo/commit/b71012d320a64fb25bdfa7289bd19f5df3bff021))
* **web:** hide video block by default, soften diagram box color ([56490ed](https://github.com/hungphamtan/masqo/commit/56490ede4220cb0e8d343d5cd8b0f3d9004caa13))
* **web:** how-it-works UX — visual detail pages, extension CTA, iOS zoom fix, deps audit ([1be46e9](https://github.com/hungphamtan/masqo/commit/1be46e953ef3f6e311c4bd84684c4798f188fd35))
* **web:** showVideo gates whole media block; softer diagram connectors ([f214a97](https://github.com/hungphamtan/masqo/commit/f214a970f864d9fd0f3ee1b2ede4e130a1f980d8))
* **web:** web-app and extension detail pages ([a7260b2](https://github.com/hungphamtan/masqo/commit/a7260b2e3443cb17edccb2ffa373dd4d6e292a03))
* **web:** wire detail-page routes, overview links, responsive media CSS ([bdb2141](https://github.com/hungphamtan/masqo/commit/bdb2141ef9e7fdcd2740deaeda29e7623065628d))


### Bug Fixes

* **deps:** resolve high-severity audit findings ([cd20b6c](https://github.com/hungphamtan/masqo/commit/cd20b6c30534e38078ca3acf84ece19dee5beeca))
* **deps:** sync package-lock with react ^19 range ([b0f7d6d](https://github.com/hungphamtan/masqo/commit/b0f7d6d863fadf685e88c4ae589d1069e969bb91))
* **deps:** sync package-lock with react ^19 range ([9dac678](https://github.com/hungphamtan/masqo/commit/9dac67898700d12139a9c01bdb0e6fcabbdc9698))
* **engine:** stop flagging Confluence page IDs as phone numbers ([3e72c18](https://github.com/hungphamtan/masqo/commit/3e72c18dc5b0ffd3b19a94e759bcc30a696944d8))
* **engine:** stop flagging Confluence page IDs as phone numbers ([342b8e9](https://github.com/hungphamtan/masqo/commit/342b8e991e1edec4babb1ffb100e68d2c75c4b65)), closes [#9](https://github.com/hungphamtan/masqo/issues/9)
* **extension:** apply CWS pre-submit security fixes ([92b2386](https://github.com/hungphamtan/masqo/commit/92b238674f74273108c2677842a5a22d7d9d4fa7))
* **extension:** remove &lt;all_urls&gt; and broad host permissions for CWS approval ([ff73633](https://github.com/hungphamtan/masqo/commit/ff73633310205a8123c52a79886f5f90abcf5e40))
* move clipboard.write to content script to avoid permissions policy violation ([2916d6e](https://github.com/hungphamtan/masqo/commit/2916d6e3d54b6100bc5f4603d984a400ecda36f8))
* prevent iOS Safari auto-zoom on textarea focus ([f920654](https://github.com/hungphamtan/masqo/commit/f9206547d86bf7b119d7e289fbdd0ea492716cde))
* refocus textarea before inserting redacted text ([c8d22de](https://github.com/hungphamtan/masqo/commit/c8d22dedde093529a5b37d4074e13bd00a44432b))
* resolve dependency vulnerabilities and build failures ([2885453](https://github.com/hungphamtan/masqo/commit/28854537a035c3d9bc738b6d7b72c96c48e1411a))
* resolve security blockers for v0.1.0 launch ([fce34ce](https://github.com/hungphamtan/masqo/commit/fce34ce14351dd423250632599b5c6d5e99ce283))
* update store listing information ([67a5a0c](https://github.com/hungphamtan/masqo/commit/67a5a0c2aebc9ca48bc3992a754ec05aeb53388a))
* update store listing information to fix submission of your item was rejected ([06c74ac](https://github.com/hungphamtan/masqo/commit/06c74ac79ef118e00f5728441d6e809a417e8c11))
* use relative asset paths in extension build ([33cf785](https://github.com/hungphamtan/masqo/commit/33cf785756afdbc843f12c47b20a51e23b3ac4f3))
* use wildcard origin for sidebar-to-parent postMessage ([8801e37](https://github.com/hungphamtan/masqo/commit/8801e37ce3c6272721e117d77f0479ef347e9686))
* use window.location.origin in sidebar postMessage ([2417f3a](https://github.com/hungphamtan/masqo/commit/2417f3a30b9715809288862b0aa989fa8c5b9710))
* web package tsconfig rootDir and unused React import ([af1d3f3](https://github.com/hungphamtan/masqo/commit/af1d3f35e53aa813a11091a63f9d9944fa139ae3))
* **web:** correct GitHub repo URL in header link ([144a410](https://github.com/hungphamtan/masqo/commit/144a410a1bad6d640f4be001a613bae8817e5bca))
* **web:** correct GitHub repo URL in header link ([90fe78a](https://github.com/hungphamtan/masqo/commit/90fe78a3347ac2c5be0a509db0c6888ab3a4b21e))

## [0.1.4](https://github.com/hungphamtan/masqo/compare/v0.1.3...v0.1.4) (2026-06-22)


### Bug Fixes

* **extension:** apply CWS pre-submit security fixes ([92b2386](https://github.com/hungphamtan/masqo/commit/92b238674f74273108c2677842a5a22d7d9d4fa7))
* **extension:** remove &lt;all_urls&gt; and broad host permissions for CWS approval ([ff73633](https://github.com/hungphamtan/masqo/commit/ff73633310205a8123c52a79886f5f90abcf5e40))

## [0.1.3](https://github.com/hungphamtan/masqo/compare/v0.1.2...v0.1.3) (2026-06-22)


### Bug Fixes

* **web:** correct GitHub repo URL in header link ([144a410](https://github.com/hungphamtan/masqo/commit/144a410a1bad6d640f4be001a613bae8817e5bca))
* **web:** correct GitHub repo URL in header link ([90fe78a](https://github.com/hungphamtan/masqo/commit/90fe78a3347ac2c5be0a509db0c6888ab3a4b21e))

## [0.1.2](https://github.com/hungphamtan/masqo/compare/v0.1.1...v0.1.2) (2026-06-22)


### Features

* add Cloudflare Web Analytics snippet to web app ([f467bf0](https://github.com/hungphamtan/masqo/commit/f467bf0d7509bf0b528d23a59c17b31b14d155f3))
* add opt-in Plausible analytics with consent banner ([0cd816f](https://github.com/hungphamtan/masqo/commit/0cd816fdf1fa271e7af19bc9db5fa54dc0478f4f))
* improve ux for run locally ([3e52888](https://github.com/hungphamtan/masqo/commit/3e528883b1ec34721510995a64753f75bececd6c))
* mobile-responsive web app UI ([c4b246d](https://github.com/hungphamtan/masqo/commit/c4b246d35f0863ecece30244703ffadc12ac6e3a))
* PII detector + code fixes + policy consistency ([48df080](https://github.com/hungphamtan/masqo/commit/48df080541b8086fcdbcd1ce256bb8327ad2056a))
* prep npm packages for publishing ([ad89527](https://github.com/hungphamtan/masqo/commit/ad895271d5d5eda749998aeec98e9586c92e7e56))
* UX improvement ([a76a4e9](https://github.com/hungphamtan/masqo/commit/a76a4e9745ea4f7d58e7215ebb62a2791a1516cc))


### Bug Fixes

* move clipboard.write to content script to avoid permissions policy violation ([2916d6e](https://github.com/hungphamtan/masqo/commit/2916d6e3d54b6100bc5f4603d984a400ecda36f8))
* refocus textarea before inserting redacted text ([c8d22de](https://github.com/hungphamtan/masqo/commit/c8d22dedde093529a5b37d4074e13bd00a44432b))
* resolve dependency vulnerabilities and build failures ([2885453](https://github.com/hungphamtan/masqo/commit/28854537a035c3d9bc738b6d7b72c96c48e1411a))
* resolve security blockers for v0.1.0 launch ([fce34ce](https://github.com/hungphamtan/masqo/commit/fce34ce14351dd423250632599b5c6d5e99ce283))
* use relative asset paths in extension build ([33cf785](https://github.com/hungphamtan/masqo/commit/33cf785756afdbc843f12c47b20a51e23b3ac4f3))
* use wildcard origin for sidebar-to-parent postMessage ([8801e37](https://github.com/hungphamtan/masqo/commit/8801e37ce3c6272721e117d77f0479ef347e9686))
* use window.location.origin in sidebar postMessage ([2417f3a](https://github.com/hungphamtan/masqo/commit/2417f3a30b9715809288862b0aa989fa8c5b9710))
* web package tsconfig rootDir and unused React import ([af1d3f3](https://github.com/hungphamtan/masqo/commit/af1d3f35e53aa813a11091a63f9d9944fa139ae3))
