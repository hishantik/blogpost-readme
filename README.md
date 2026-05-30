# Blog Post Readme Enhanced

A GitHub Action that fetches blog posts from personal websites and popular platforms (dev.to, Hashnode, Medium, daily.dev) and displays them in your GitHub README.

## Features

- **Multi-Platform Support**: Fetch from dev.to, Hashnode, Medium, daily.dev, and any RSS/HTML blog
- **RSS Feed Support**: Parse RSS 2.0 and Atom feeds
- **Web Scraping**: Fallback to HTML scraping when RSS isn't available
- **Auto-detection**: Automatically detects platform and uses the best method
- **Image Extraction**: Extracts featured images from posts
- **Template System**: Customize post display with variables
- **Table Layout**: Display posts in a markdown table format
- **Date Filtering**: Filter posts by date range
- **Duplicate Removal**: Remove duplicate posts across sources

## Quick Start

### 1. Add comment tags to your README

```markdown
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```

### 2. Create a workflow file

```yaml
# .github/workflows/blog-posts.yml
name: Update blog posts
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-username/blogpost-readme-enhanced@v1
        with:
          feed_list: "https://dev.to/yourusername,https://yourblog.com"
          max_post_count: 5
```

## Supported Platforms

| Platform | URL Format | Method |
|----------|------------|--------|
| dev.to | `https://dev.to/username` | RSS feed |
| Hashnode | `https://hashnode.com/@username` or `https://username.hashnode.dev` | RSS feed |
| Medium | `https://medium.com/@username` | RSS feed |
| daily.dev | `https://app.daily.dev/username` | HTML scraping |
| RSS Feed | `https://yourblog.com/feed` | Direct RSS |
| Any website | `https://yourblog.com` | HTML scraping |

## Inputs

### Required

| Input | Description |
|-------|-------------|
| `feed_list` | Comma separated list of URLs to fetch posts from |

### Optional

| Input | Description | Default |
|-------|-------------|---------|
| `readme_path` | Comma separated paths of README files to update | `./README.md` |
| `max_post_count` | Maximum number of posts to display | `5` |
| `layout` | Output layout: `list` or `table` | `list` |
| `template` | Custom template for post display (see Template Variables) | `default` |
| `date_format` | Date format using dateformat syntax | `UTC:ddd mmm dd yyyy h:MM TT` |
| `disable_sort` | Disable sorting by publish date | `false` |
| `sort_order` | Sort order: `asc` (oldest first) or `desc` (newest first) | `desc` |
| `filter_dates` | Date filter (see Date Filters) | - |
| `filter_comments` | Platforms to filter comments from | `stackoverflow,stackexchange` |
| `remove_duplicates` | Remove duplicate posts across sources | `false` |
| `comment_tag_name` | Custom comment tag name | `BLOG-POST-LIST` |
| `tag_post_pre_newline` | Insert newline before/after tags | `false` |
| `disable_html_encoding` | Disable HTML encoding in output | `false` |
| `gh_token` | GitHub token for committing | `${{ github.token }}` |
| `skip_commit` | Skip git commit (useful for testing) | `false` |
| `enable_keepalive` | Enable keepalive workflow commits | `true` |
| `user_agent` | User agent for HTTP requests | `blogpost-readme-enhanced` |
| `accept_header` | Accept header for HTTP requests | `application/rss+xml, application/xml, text/xml` |
| `retry_count` | Number of retries for failed requests | `0` |
| `retry_wait_time` | Wait time between retries in seconds | `1` |

### Outputs

| Output | Description |
|--------|-------------|
| `results` | JSON array of posts that were added to the README |

## Layout Options

### List (default)

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    layout: list
```

Output:

```markdown
- [Post Title](https://example.com/post) - May 30, 2026 (dev.to)
- [Another Post](https://example.com/post2) - May 28, 2026
```

### Table

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    layout: table
```

Output:

| # | Title | Date | Platform | Author | Description |
|---|-------|------|----------|--------|-------------|
| 1 | [Post Title](url) | 2026-05-30 | dev.to | Author | Description... |
| 2 | [Another Post](url) | 2026-05-28 | - | - | Description... |

## Template Variables

Use these variables in your custom template:

| Variable | Description |
|----------|-------------|
| `$title` | Post title |
| `$url` | Post URL |
| `$date` | Publication date |
| `$description` | Post description |
| `$counter` | Post number (1, 2, 3...) |
| `$categories` | Post categories |
| `$author` | Post author |
| `$imageUrl` | Featured image URL |
| `$platform` | Source platform (dev.to, Hashnode, Medium, daily.dev) |
| `$newline` | Newline character |

### Custom Template Example

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    template: "$counter. [$title]($url) - $date - $platform"
```

Output:

```markdown
1. [Post Title](https://dev.to/post) - May 30, 2026 - dev.to
2. [Another Post](https://dev.to/post2) - May 28, 2026 - dev.to
```

## Date Filters

Use the `filter_dates` input to filter posts by date:

| Filter | Description |
|--------|-------------|
| `daysAgo/30` | Posts from the last 30 days |
| `daysAgo/7` | Posts from the last 7 days |
| `currentMonth` | Posts from the current month |
| `currentYear` | Posts from the current year |

## Examples

### Multiple Platforms

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername,https://yourblog.com,https://medium.com/@yourusername"
    max_post_count: 10
    remove_duplicates: true
```

### Table Layout with Custom Date

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    layout: table
    date_format: "yyyy-mm-dd"
    max_post_count: 5
```

### Filter Recent Posts Only

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    filter_dates: "daysAgo/30"
    max_post_count: 5
```

### Custom Comment Tags

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    comment_tag_name: "MY-POSTS"
```

README:

```markdown
<!-- MY-POSTS:START -->
<!-- MY-POSTS:END -->
```

### Multiple README Files

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername"
    readme_path: "./README.md,./profile/README.md"
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## License

MIT
