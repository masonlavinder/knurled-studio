---
id: "1"
title: "How I Made This Site"
slug: "site"
author: "Mason Lavinder"
publishDate: "2025-12-14"
tags: ["react", "typescript", "development"]
featured: true
excerpt: "Building a personal site with GitHub Pages, React, and a back-to-basics philosophy"
---
I built this site for three main reasons:

1. **Showcase my work** - Most of my programming experience has been in private repos for work and grad school
2. **Share ideas** - A place to write opinions and show cool projects
3. **Explore constraints** - See what's possible using only GitHub Pages

Instead of using Medium, AWS, or running my own server, I wanted to use GitHub as a constraint. It seemed like an interesting challenge: how do you build a personal website and blog using only GitHub?

## Back to Basics: Static Websites

These days we often forget about the simplicity of static websites. In the name of performance, we:
- Lazy load front ends
- Code split everything
- Add cache layers
- Optimize with read-only database layers
- Load balance across servers

But there was a time when websites were just served up. I made this site like that, but with a few modern upgrades.

## The Tech Stack

**Build Tools:** I used Vite with React for a good development environment with quick reloads. Sure, I could have used vanilla HTML/CSS/JavaScript, but I've grown an affinity for React and TypeScript. Plus, how important is load time for a simple personal site?

**Content:** Each article is written in Markdown and rendered using the React Markdown library. Very straightforward.

**Styling:** I'm a big proponent of keeping styling simple and functional. I use CSS modules to keep things organized and start with simple colors, minimal fonts, and clean layouts.

### Design Philosophy

**Design in grayscale first.** If your site is ugly without colors, colors won't make it better. Focus on hierarchy, spacing, and typography before adding visual flourishes.

## Building the Blog System

One of the core features I wanted was a simple blog without needing a CMS or database. Here's how I made it work:

**Markdown as Content:** Every blog post is just a markdown file in the `src/posts/` directory, auto-discovered at build time via Vite's `import.meta.glob`. Each file has front matter (metadata) at the top:

```markdown
---
id: "1"
title: "How I Made This Site"
slug: "site"
author: "Mason Lavinder"
publishDate: "2025-12-14"
tags: ["react", "typescript"]
featured: true
excerpt: "Building a personal site..."
---
```

**Dynamic Loading:** I wrote a blog service that imports markdown files as raw strings, parses the front matter using the `gray-matter` library, and renders the content with React Markdown. The beauty of this approach is that adding a new post is as simple as dropping a markdown file in a folder.

**Features I Added:**
- Search by title, excerpt, or content
- Tag-based filtering
- Reading time calculation (assuming 200 words per minute)
- Featured post indicators

All of this without a backend or database. Just static files and client-side JavaScript.

## The Routing Strategy

I used React Router for navigation, but kept it simple. The site has four main routes:
- `/` - Home page
- `/blog` - Blog listing
- `/blog/:slug` - Individual posts
- `/link-list` - Curated resources

GitHub Pages hosts everything under `/lavinder/` as a base path, which required configuring Vite's base URL. Once that's set up, deployment is just:

```bash
npm run build
npm run deploy
```

The `gh-pages` package handles pushing the built files to the `gh-pages` branch, and GitHub serves them automatically.

## Styling Without a Framework

I deliberately avoided CSS frameworks like Tailwind or Bootstrap.  Bootstrap looks like you used bootstrap and Tailwind is overkill for this (plus I don't think it's less complicated) Instead, I:

1. **Created a design system** using CSS custom properties (variables) for colors, spacing, and typography
2. **Used CSS Modules** to scope styles to components and avoid naming conflicts
3. **Kept it responsive** with simple media queries and CSS Grid

The color palette is earthy - olive green, burnt orange, and vanilla tones.  These are some of my favorites and I think web dev needs a little more whimsy. There are too many white and blue or all black tech bro websites. I wanted something warm and readable.

## What I Learned

**GitHub Pages is more capable than I thought.** With a proper build step, you can deploy full React applications, not just static HTML pages.

**Markdown is underrated.** It's fast to write, easy to version control, and renders perfectly with the right styling.  Also, AI tools can be a big help to get the formatting right 

**Constraints breed creativity.** By limiting myself to GitHub Pages (no backend, no database), I had to think a little differently about features like blog search and routing. The result is a simpler, faster site.

If you're thinking about building your own site, I'd encourage you to start simple. You don't need a complex stack or hosting setup to get started. Just pick a constraint and see what you can build within it.

