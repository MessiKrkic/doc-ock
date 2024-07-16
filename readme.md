# URL to PDF Crawler and Merger

This Node.js script crawls a list of URLs, saves selected parts of each page as a PDF, and then merges all PDFs into a single file. It supports multiple CSS selectors per URL for precise content selection.

## Prerequisites

- Node.js (version 12.17.0 or later recommended)
- npm

## Installation

1. Clone this repository or download the script.
2. Run `npm install` to install dependencies:

```
npm install puppeteer pdf-merger-js
```

## Usage

Run the script with:

```
node doc-ock.js <output_filename> <urls_file>
```

- `<output_filename>`: Name of the final merged PDF file.
- `<urls_file>`: Path to a text file containing URLs and optional CSS selectors.

## Input File Format

Create a text file (e.g., `urls.txt`) with the following format:

```
https://example.com | #main-content, .article-body
https://another-example.com | .header, .main-article
```

Each line should contain:
- A URL
- Optionally followed by a pipe (`|`) and a comma-separated list of CSS selectors

If no selectors are provided, the entire page content (excluding images) will be captured.

## Features

- Crawls multiple URLs
- Supports multiple CSS selectors per URL for precise content selection
- Removes all images from the captured content
- Saves selected parts of each page as a PDF
- Merges all PDFs into one file
- Displays progress in the console
- Basic error handling and timeout management

## Error Handling

- Skips URLs that can't be processed
- Exits if more than half of the URLs fail

## Notes

- I had to include the '--no-sandbox' argument when launching puppeteer, because otherwise i couldn't get it to run on Windows 11. Please be aware of this and only use it in a secure environment.
- The effectiveness of CSS selectors depends on the structure of the webpages you're crawling. You may need to inspect the pages and adjust selectors for best results.
- PDF generation timeout is set to 30 seconds per page. Adjust this in the script if needed for complex pages.