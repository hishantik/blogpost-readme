# Design Spec: Blog Post Readme Enhanced

## Overview

A GitHub Action that fetches blog posts from personal websites and popular platforms (dev.to, Hashnode, Medium, daily.dev) and displays them in a GitHub README file between comment tags.

## Architecture

```
GitHub Action Inputs
        │
        ▼
┌─────────────────────────────────────────┐
│              Core Engine                 │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │RSS Fetcher│  │ Scraper  │  │Filters ││
│  └─────┬────┘  └─────┬────┘  └───┬────┘│
│        └──────┬───────┘           │     │
│               ▼                   ▼     │
│        ┌──────────┐       ┌──────────┐  │
│        │Post Merger│──────▶│  Sorter  │  │
│        └──────────┘       └────┬─────┘  │
│                                ▼        │
│                        ┌──────────┐     │
│                        │Transform │     │
│                        └────┬─────┘    │
└─────────────────────────────┼──────────┘
                              ▼
┌─────────────────────────────────────────┐
│             Output Module               │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │README Upd│  │Git Commit│  │Outputs ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
```

## Core Types

```typescript
interface Post {
  title: string;
  url: string;
  description: string;
  date: Date | null;
  author?: string;
  categories: string[];
  imageUrl?: string;
  source: 'rss' | 'scrape';
  platform?: string;
}

interface Fetcher {
  canHandle(url: string): Promise<boolean>;
  fetch(url: string): Promise<Post[]>;
}

interface ActionConfig {
  feedList: string[];
  maxPostCount: number;
  template: string;
  dateFormat: string;
  sortEnabled: boolean;
  sortOrder: 'asc' | 'desc';
  readmePath: string;
  tagName: string;
  tagPostPreNewline: boolean;
  filterComments: string;
  filterDates: string;
  disableHtmlEncoding: boolean;
  removeDuplicates: boolean;
  skipCommit: boolean;
  enableKeepalive: boolean;
  userAgent: string;
  acceptHeader: string;
  retryCount: number;
  retryWaitTime: number;
  ghToken: string;
  layout: 'list' | 'table';
}
```

## Fetchers

### Platform Fetcher
- Handles dev.to, Hashnode, Medium, daily.dev
- Converts profile URLs to RSS feed URLs
- Uses platform-specific APIs as fallback

### RSS Fetcher
- Uses `rss-parser` library
- Parses RSS 2.0 and Atom feeds
- Extracts: title, link, pubDate, content, categories, author, image

### Web Scraper Fetcher
- Uses `cheerio` for HTML parsing
- Discovers posts via: `<article>` elements, Schema.org markup, common CSS classes, links with headings + time
- Extracts: title, URL, date, description, image

### Fetcher Chain
- Platform fetcher tried first (dev.to, Hashnode, etc.)
- RSS fetcher tried second
- Scraper is fallback for sites without RSS
- Each fetcher is independently testable

## Filters

| Filter | Purpose |
|--------|---------|
| dateFilter | Keep posts within date range |
| commentFilter | Remove StackOverflow/StackExchange comments |
| duplicateFilter | Remove duplicate posts by title/URL |
| validationFilter | Remove posts missing required fields |

## Template Variables

`$title`, `$url`, `$date`, `$description`, `$counter`, `$categories`, `$author`, `$imageUrl`, `$platform`, `$newline`

## Layout Options

- **list** (default): Bullet point list with links
- **table**: Markdown table with columns: #, Title, Date, Platform, Author, Description

## Project Structure

```
blogpost-readme-enhanced/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── types.ts
│   ├── fetchers/
│   │   ├── index.ts
│   │   ├── platforms.ts
│   │   ├── rss.ts
│   │   └── scraper.ts
│   ├── filters.ts
│   ├── transformer.ts
│   └── output.ts
├── test/
│   ├── fetchers/
│   │   ├── platforms.test.ts
│   │   ├── rss.test.ts
│   │   └── scraper.test.ts
│   ├── filters.test.ts
│   ├── transformer.test.ts
│   └── output.test.ts
├── action.yml
├── tsconfig.json
├── biome.json
├── package.json
└── dist/
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Build**: esbuild
- **Testing**: Mocha + tsx
- **Linting**: Biome
- **Dependencies**: rss-parser, cheerio, @actions/core, @actions/github
