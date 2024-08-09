# Changelog

## 1.0.0 (2024-08-09)


### ⚠ BREAKING CHANGES

* Implement clustering support with node:worker_threads
* Fresh start
* New folder structure and organize files
* remove /guilds system command
* Implement Prisma for persistent storage
* Make pino-pretty and pino-loki optional dependencies, removed old pretty scripts and created new dev script
* Localization support, breaking change.

### deps

* Make pino-pretty and pino-loki optional dependencies, removed old pretty scripts and created new dev script ([056e052](https://github.com/mariusbegby/cadence/commit/056e052ba4b50c1f20cbb2b7b803a80b9142129c))


### Features

* Add new /history command to show previously played tracks ([bf461c2](https://github.com/mariusbegby/cadence/commit/bf461c2f26ebbc24f6e3dc1d33b0657bfec3f065))
* Add new /move command to move a track to specified position ([100325b](https://github.com/mariusbegby/cadence/commit/100325b7d819243cc8785edbad69f8f02c9a55e9))
* Add new config option to enable/disable button labels ([47d3c36](https://github.com/mariusbegby/cadence/commit/47d3c36cc727531eaa4436d069c28d1426f88602))
* Add norwegian localization file (no) ([a0dd74e](https://github.com/mariusbegby/cadence/commit/a0dd74e8d86a54d0a515cdc56b2fe4d80c61f3c7))
* Added /back command to go back in history ([e11df37](https://github.com/mariusbegby/cadence/commit/e11df3706fa02dfdba73c8b3856071b7cca1b785))
* Fresh start ([50771d8](https://github.com/mariusbegby/cadence/commit/50771d8871ebb1bd10d08c3e9f2b987cb49a8976))
* Implement clustering support with node:worker_threads ([7f9c5c3](https://github.com/mariusbegby/cadence/commit/7f9c5c338986ce848e5a8e3b31cb15dc90f6bd69))
* Implement Health Check Service ([db4c714](https://github.com/mariusbegby/cadence/commit/db4c714fb794d4e52268e9a0aeae198f32188407))
* Implement Prisma for persistent storage ([ad29a63](https://github.com/mariusbegby/cadence/commit/ad29a6388d491d0d1fcde0d976dfc6d94bada154))
* Localization support, breaking change. ([28592b1](https://github.com/mariusbegby/cadence/commit/28592b13d836f52f501ab9d0b6168cdf7174804b))
* **music:** implement Song Announce Feature ([99c3cd0](https://github.com/mariusbegby/cadence/commit/99c3cd006f075957a22eaa6f408706bab4592d66))
* Optionally add pino-pretty and pino-loki transports if installed ([eb9eceb](https://github.com/mariusbegby/cadence/commit/eb9eceb5398564bfcf4c2b39db8edba1a5659b59))
* **settings:** created settings command. ([1c98fd6](https://github.com/mariusbegby/cadence/commit/1c98fd6c41326fe3467f5da204409e0c38793dce))
* Updated /remove command with options for range, queue, user and duplicates! ([27d4c6c](https://github.com/mariusbegby/cadence/commit/27d4c6c0220e84f4005c077a768040528ebbdffb))


### Bug Fixes

* Add check on startup to see if ffmpeg is available ([0b72e92](https://github.com/mariusbegby/cadence/commit/0b72e926934e5dc942a4af8b24458a2d299c7e03))
* add config option for open source url and icon ([4f29399](https://github.com/mariusbegby/cadence/commit/4f29399a8eb2204b72e89e5bffdac730aca5fc13))
* add missing translator for /systemstatus title ([e216791](https://github.com/mariusbegby/cadence/commit/e21679152bc060e45e2a7089624806b714aa95e4))
* Add new action buttons also to /history command ([fac39e4](https://github.com/mariusbegby/cadence/commit/fac39e45cbd752db7148ea4be590a5cd05a88fb9))
* Add Open source button to /status ([fa84e29](https://github.com/mariusbegby/cadence/commit/fa84e2925e048819e56b37f1257699653daf472b))
* Add track position to footer when track(s) added to queue in /play ([d496945](https://github.com/mariusbegby/cadence/commit/d496945949e58d7430c61177a3d38f0e178195e2))
* add translation of unexpected error ([b953179](https://github.com/mariusbegby/cadence/commit/b953179e965c64c1f3359d936b83a2d34d5baff3))
* add user in footer on validation warnings ([eb26f5a](https://github.com/mariusbegby/cadence/commit/eb26f5ab93019b36a9a2dab85a819c7a28ae9c83))
* Adds Missing Prisma Dockerfile Setup ([15e67f4](https://github.com/mariusbegby/cadence/commit/15e67f4c442d0811522b927fbf1db4147eeb5b88))
* also translate command params for /help ([e2040ba](https://github.com/mariusbegby/cadence/commit/e2040baa8d0943d0295e62a9c29dceb67298cbdd))
* await client.login, thanks to @Kriblin ([64a709b](https://github.com/mariusbegby/cadence/commit/64a709b03226b2f4d2b0489bdd7d3ba59f59e2fc))
* Better handling of unavailable source  after added to queue ([69d23d1](https://github.com/mariusbegby/cadence/commit/69d23d1b77fc9066abd2cc532e5a54c36c0f064c))
* change addNumberOption to addIntegerOption ([6ca7ce3](https://github.com/mariusbegby/cadence/commit/6ca7ce3e4be92e9240208c76c6bdf1418193ccef))
* check for duplicate /track/id in spotify url and trim ([b3b73ad](https://github.com/mariusbegby/cadence/commit/b3b73ad49f920dfd81598ea15c20b6ab87fa5ea4))
* correct usage for deploying commands ([7fb2c5e](https://github.com/mariusbegby/cadence/commit/7fb2c5ebeee3bf4b33c42d6efcc91e4161971bd2))
* Dockerfile was missing locales copy ([556cefa](https://github.com/mariusbegby/cadence/commit/556cefa71b6087bc68e11f4d61e80a5538d3f57a))
* eslint formatting errors ([fec394f](https://github.com/mariusbegby/cadence/commit/fec394ffc0886c44d557c61f1dc3dd0aa2e39d84))
* Fix not being able to select multiple ffmpeg filters ([83462ab](https://github.com/mariusbegby/cadence/commit/83462ab6265937d0c517436cbf2a9bc60d1c1aaa))
* Fix playlist added position being incorrect in some cases ([664fa50](https://github.com/mariusbegby/cadence/commit/664fa50dfe65d85a86808e6aa712d821025bc8c1))
* Fix showing repeat mode in skipped track ([88511f8](https://github.com/mariusbegby/cadence/commit/88511f87c1fffb7270a70fe4782789e1288c5f22))
* **lang:** Fixed translation string bug ([1728503](https://github.com/mariusbegby/cadence/commit/1728503bb6c35ac0363214d3167216bfccc586d4))
* log error object in error handler ([79e1b5f](https://github.com/mariusbegby/cadence/commit/79e1b5f3ada7820746f37787ef311c1e61b97127))
* New folder structure and organize files ([39ff5ec](https://github.com/mariusbegby/cadence/commit/39ff5ecb5d2d28b06e161054f0c793531ce06506))
* override willAutoPlay event to set bot user as requestedBy ([aa36925](https://github.com/mariusbegby/cadence/commit/aa3692592dc876c10b0372df399c1fb0925359ec))
* **playerSkip:** only log on error ([f5a39f4](https://github.com/mariusbegby/cadence/commit/f5a39f430eb99c8702ad3cd502a385ef545bf22c))
* remove /guilds system command ([ccc4f19](https://github.com/mariusbegby/cadence/commit/ccc4f19cc0911f663b503b1dbef48842b902db29))
* remove unnecessary queue.clear() call in /stop ([f9fa501](https://github.com/mariusbegby/cadence/commit/f9fa501125bc96ade97fc76dda65729712be5044))
* Replace support server and add bot info with link buttons in /help ([612e3a0](https://github.com/mariusbegby/cadence/commit/612e3a00a65fc8c3aa36b5c0c0a012349d44ee09))
* set skipFFmpeg to false to solve bug ([ea8f97d](https://github.com/mariusbegby/cadence/commit/ea8f97dc2b405b5ed0ace99b6016fd1937790117))
* sets noImplicity false for `any` types ([d2bb9d3](https://github.com/mariusbegby/cadence/commit/d2bb9d364461bb2e65018258bbee3d067ee2fe15))
* Small changes to new action buttons ([981be70](https://github.com/mariusbegby/cadence/commit/981be707f04af0fd21481075683c63a3d0d42a2f))
* solve bug using getNumber after changing to addIntegerOption ([4b630e2](https://github.com/mariusbegby/cadence/commit/4b630e2512282a481b50678714f7dd580d3f4be5))
* transform search query in /play autocomplete ([5601767](https://github.com/mariusbegby/cadence/commit/56017678062a343f94f18ebb1ed770c6d9efe49a))
* update default config value for button labels to true ([ee54513](https://github.com/mariusbegby/cadence/commit/ee5451320e99f92edeb89dbcf21641304f0ca296))
* update deps, change opus provider ([814029e](https://github.com/mariusbegby/cadence/commit/814029e6361ed3824aa7854f7857b46ecb065c71))
* update extractor to stable ([d7ef706](https://github.com/mariusbegby/cadence/commit/d7ef706604c3fb23b497075f3637b2c55c99cc92))
* update mediaplex to latest ([78b5d85](https://github.com/mariusbegby/cadence/commit/78b5d85c9e045eb26f47063f33d04dfef96e0f24))
* Update npm scripts ([9c4c995](https://github.com/mariusbegby/cadence/commit/9c4c99558ae4b26febe84e7a56fc496591cb5c38))
* update youtube-ext to fix YouTube HTTP response bug ([48bffc8](https://github.com/mariusbegby/cadence/commit/48bffc87b8b6654714b1047d72ea3fdd5586e41e))
* update youtubei extractor + include progress bar again ([4ca0128](https://github.com/mariusbegby/cadence/commit/4ca01283bbab680240ab9d64cf425ece88e68e9e))
* Updates Node.JS 18 engine to latest minor version ([c9743f8](https://github.com/mariusbegby/cadence/commit/c9743f8eb861661c60720523659453af1c48b639))
