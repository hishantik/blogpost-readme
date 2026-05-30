# Blog Post Readme Enhanced

A GitHub Action that fetches blog posts from personal websites (via RSS feeds or web scraping) and displays them in your GitHub README.

## Features

- **RSS Feed Support**: Parse RSS 2.0 and Atom feeds
- **Web Scraping**: Fallback to HTML scraping when RSS isn't available
- **Auto-detection**: Automatically tries RSS first, then scrapes
- **Image Extraction**: Extracts featured images from posts
- **Template System**: Customize post display with variables
- **Date Filtering**: Filter posts by date range
- **Duplicate Removal**: Remove duplicate posts across sources

## Usage

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://yourblog.com/feed,https://yourblog.com"
    max_post_count: 5
```

Add comment tags to your README:

```markdown
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `feed_list` | Comma separated list of URLs | Required |
| `readme_path` | README file path(s) | `./README.md` |
| `max_post_count` | Max posts to display | `5` |
| `template` | Post template | `default` |
| `date_format` | Date format | `UTC:ddd mmm dd yyyy h:MM TT` |
| `disable_sort` | Disable date sorting | `false` |
| `sort_order` | Sort order (asc/desc) | `desc` |
| `filter_dates` | Date filter | - |
| `remove_duplicates` | Remove duplicates | `false` |

## Template Variables

- `$title` - Post title
- `$url` - Post URL
- `$date` - Publication date
- `$description` - Post description
- `$counter` - Post number
- `$categories` - Post categories
- `$author` - Post author
- `$imageUrl` - Featured image URL
- `$newline` - Newline character

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
