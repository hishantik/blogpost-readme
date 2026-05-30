# Blog Post Readme Enhanced

A GitHub Action that fetches blog posts from personal websites and popular platforms (dev.to, Hashnode, Medium, daily.dev) and displays them in your GitHub README.

## Features

- **Multi-Platform Support**: Fetch from dev.to, Hashnode, Medium, daily.dev, and any RSS/HTML blog
- **RSS Feed Support**: Parse RSS 2.0 and Atom feeds
- **Web Scraping**: Fallback to HTML scraping when RSS isn't available
- **Auto-detection**: Automatically detects platform and uses the best method
- **Image Extraction**: Extracts featured images from posts
- **Template System**: Customize post display with variables
- **Date Filtering**: Filter posts by date range
- **Duplicate Removal**: Remove duplicate posts across sources

## Usage

```yaml
- uses: your-username/blogpost-readme-enhanced@v1
  with:
    feed_list: "https://dev.to/yourusername,https://yourblog.com"
    max_post_count: 10
```

### Supported Platforms

| Platform | URL Format |
|----------|------------|
| dev.to | `https://dev.to/username` |
| Hashnode | `https://hashnode.com/@username` or `https://username.hashnode.dev` |
| Medium | `https://medium.com/@username` |
| daily.dev | `https://app.daily.dev/username` |
| RSS Feed | `https://yourblog.com/feed` |
| Any website | `https://yourblog.com` (scraping fallback) |

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
- `$platform` - Source platform (dev.to, Hashnode, Medium, daily.dev)
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
