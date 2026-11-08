**Personal Website & Professional Portfolio**

The source repository for [Suleiman Ahmed's personal website](https://suleimanahmedx.github.io/), showcasing academic background, research interests, publications, technical expertise, and professional resources.

**Live Website:** [https://suleimanahmedx.github.io/](https://suleimanahmedx.github.io/)

## Features

- **Adaptive Themes:** Light and dark modes with automatic device preference detection and manual switching.
- **Contact Form:** Allows visitors to send messages without exposing my email address.
- **Publications:** Search and filter publications, copy citations, and download BibTeX references.
- **Technical Resources:** Filterable collection of useful resources.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Accessibility:** Respects reduced-motion preferences.
- **Interactive Navigation:** Mobile menu, smooth scrolling, and back-to-top functionality.

## Repository Structure

```text
.
├── *.html                  # Website pages
├── style.css               # Styling and themes
├── site.js                 # Interactive functionality
├── assets/                 # Images, logos and icons
├── tools/
│   └── check-links.py      # External link checker
├── site.webmanifest
├── favicon.svg
├── apple-touch-icon.png
├── robots.txt
├── sitemap.xml
└── 404.html
```

## Setup & Development

**Requirements:** Git and a modern web browser.

Clone the repository:

```bash
git clone https://github.com/suleimanahmedx/suleimanahmedx.github.io.git
cd suleimanahmedx.github.io
```

Start a local development server:

```bash
python -m http.server 8000
```

Visit `http://localhost:8000` in your browser.

Check external links (requires Python 3 and internet access):

```bash
python tools/check-links.py
```

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Python
- GitHub Pages

## Deployment

Hosted and deployed through **GitHub Pages**.

**Live Site:** [suleimanahmedx.github.io](https://suleimanahmedx.github.io/)

## Copyright & Attribution

© 2026 **Suleiman Ahmed**. All rights reserved.

Third-party names, trademarks, and logos remain the property of their respective owners. Their inclusion does not imply affiliation, sponsorship, or endorsement.

---

*Designed and maintained by Suleiman Ahmed.*
