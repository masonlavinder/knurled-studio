---
id: "3"
title: "How I accidentally remade Docusaurus"
slug: "how-i-remade-docusaurus"
author: "Mason Lavinder"
publishDate: "2026-04-18"
tags: ["development"]
featured: true
excerpt: "I built a blog engine from scratch for this site. A few months later I realized I'd rebuilt something that already exists."
---
I built a blog engine from scratch for this site. A few months later I installed [Docusaurus](https://docusaurus.io/) for a work project and realized I'd accidentally rebuilt it.

Here's how it happened.

## Building It Myself

I wanted a spot for a few musings, a home page, and the typical things to tell a little about me. I said hey, I want to render markdown files to a blog list and be able to have things like tags to help people navigate. Well, I did just that.

I host all posts in the public folder as .md files and have standard headers for all of them. For example, this post has:

doc block:

```yaml
id: "3"
title: "How I accidentally remade Docusaurus"
slug: "how-i-remade-docusaurus"
author: "Mason Lavinder"
publishDate: "2026-04-18"
tags: ["development"]
featured: true
excerpt: "I accidentally remade Docusaurus: Open Source Rules"
```

Then I check the content that gets loaded to the site into the public folder on the url, import them with a buffer, push em into a list, process a little, and render.

I thought this was smart. I know I could serve them from an S3 bucket and optimize the time to page load and bundle size and blah blah, I just wanted a good ol fashion static site. Super easy. Host on Git pages. Make life simple. OG internet.

That went great. I rendered the files when selected using React Markdown, which is lightweight enough considering the stack was simple.

## Enter Docusaurus

Well, a few months later, I needed to create a docs site for the product at Third Loop. It needed standard documentation and maybe some articles. Docusaurus came up as reputable and hosting seemed simple. I made the site in an afternoon and before you know it I was up and running with git pages.

Well then I realized I was an idiot.

I built this myself. Sure, Docusaurus has some bells and whistles. But it's a way to create the super simple blog-like pages. It's funny how problems are rarely unique.

## The Takeaways

Well, my big takeaway was not to port this to Docusaurus. In fact, I like the way I did it for this site. But I think the real moral of the story is two-fold:

**For personal projects, just do it yourself.** You'll learn something if nothing else. The bias towards inaction can slow you down if you take hours looking for the perfect solution. The worst thing that happens is you learn how the "better" version works.

**For work projects, lean on open source.** The open source community is the backbone of modern technology and thus society these days. It's wild to think how much of what we build sits on top of work that people do for free.

Docusaurus is a simple example of open source software making a difference, but the larger takeaway is how much open source software is out there. You can solve SO many problems with it. The world doesn't run without it.

