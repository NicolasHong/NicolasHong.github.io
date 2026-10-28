# Nicolas Hong Academic Homepage

This repository powers [nicolashong.github.io](https://nicolashong.github.io), the personal academic homepage for Dr. Xiaodong Hong. It is built with Jekyll and based on the Academic Pages template, with local customizations for publications, CV, blog posts, talks, and portfolio pages.

## What Is Here

- `_pages/` contains top-level pages such as About, CV, Publications, Talks, Blog archive, and Portfolio.
- `_publications/`, `_posts/`, `_talks/`, `_teaching/`, and `_portfolio/` contain collection items rendered by Jekyll.
- `_data/navigation.yml` controls the main navigation order.
- `_config.yml` controls site metadata, author profile links, collections, plugins, and build settings.
- `_sass/` and `assets/css/main.scss` define the theme styles.
- `assets/js/` contains interaction scripts.
- `images/` and `files/` store profile images, paper PDFs, BibTeX files, slides, and other static assets.

## Local Development

This project uses Jekyll 4 and a local Bundler setup. On Windows, use the helper scripts so gems and executable wrappers stay inside this repository instead of your user profile.

Install or update Ruby/Jekyll dependencies:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bundle.ps1 install
```

Run the site locally:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

The site will usually be available at:

```text
http://127.0.0.1:4000
```

Run a production build without starting the server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bundle.ps1 exec jekyll build
```

Regenerate the talk map locally after editing `_talks/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\talkmap.ps1
```

If JavaScript dependencies need to be rebuilt after editing `assets/js/_main.js`, install Node packages and run:

```bash
npm install
npm run build:js
```

The current custom interaction layer lives in `assets/js/nicolas-polish.js`, so most small UI enhancements do not require rebuilding `main.min.js`.

## Visitor Statistics

The footer can show today's and total site visits using [GoatCounter](https://www.goatcounter.com/). This runs in the visitor's browser and adds no GitHub Actions job. The account and its public counter must be enabled before anything appears on the site:

1. Create a GoatCounter site and set its website URL to this site. Registration and email verification must be completed by the site owner.
2. In GoatCounter site settings, enable "Allow adding visitor counts on your website". Set the account time zone to Asia/Shanghai so "Today" matches the site.
3. Set the public site code in the analytics.goatcounter.site_code field in _config.yml (for example, nicolashong, not a password or API token).
4. For public regional statistics, change GoatCounter's "Dashboard viewable by" setting to everyone, then set analytics.goatcounter.public_dashboard to true. This exposes the full dashboard, not just regions. Leave both private/default if you do not want that.

Counts start when tracking is activated; historical visits cannot be reconstructed. GoatCounter caches the public counts for up to four hours, and ad blockers may prevent some visits from being counted. When site_code is empty, the tracking script and footer counters are omitted.

## Common Editing Tasks

- Update homepage text: `_pages/about.md`
- Update publications: add or edit Markdown files in `_publications/`
- Update publication BibTeX: `files/bibtex/`
- Update CV data: `_data/cv.json` or `_pages/cv.md`
- Update navigation: `_data/navigation.yml`
- Update author sidebar: `author` fields in `_config.yml`
- Update custom visual polish: `_sass/layout/_nicolas-polish.scss`

## Codex Workflow

When using Codex in this repository, the recommended flow is:

1. Ask Codex to inspect the relevant files before editing.
2. Keep content edits scoped to the relevant collection or page.
3. Put broad visual changes in `_sass/layout/_nicolas-polish.scss`.
4. Put lightweight behavior in `assets/js/nicolas-polish.js`.
5. Run a local Jekyll build or serve command before publishing.

Useful prompts:

```text
帮我新增一篇 publication，并补齐 bibtex 链接。
帮我检查 GitHub Pages 构建可能失败的地方。
帮我优化首页 About 文案，但不要改变页面结构。
帮我调整导航和作者侧栏样式，保持 Academic Pages 兼容。
```

## Deployment

This repository builds with Jekyll 4 through GitHub Actions. In the repository settings, set GitHub Pages to deploy from **GitHub Actions**. After committing changes to `main` or `master`, wait for the Pages workflow to finish, then visit:

```text
https://nicolashong.github.io
```

## Upstream

This site is based on [Academic Pages](https://github.com/academicpages/academicpages.github.io). Template-level changes should be made carefully so future upgrades remain manageable.
