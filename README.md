# Developer Portfolio & Blog Platform

A clean, responsive developer portfolio website showcasing project history and technical blogs rendered dynamically from local Markdown files.

## 🚀 Running Locally

Due to browser security restrictions (CORS) when loading local files via `file://`, you must run a local HTTP server to read the blog posts:

* **Windows**: Double-click **`run.bat`** to start the server and open the site.
* **Any OS**: Open a terminal in this directory and run:
  ```bash
  python -m http.server 8000
  ```
  Then visit [http://localhost:8000](http://localhost:8000).

## ✍️ Adding Blog Posts

1. Add a Markdown (`.md`) file to the `blogs/` directory.
2. Register the post metadata in `blog.html` (under the `metadata` object).
3. Add a blog card link targeting `blog.html?post=filename` to `blogs.html`.
