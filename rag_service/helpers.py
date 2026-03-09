import requests
from bs4 import BeautifulSoup
from typing import Tuple, Optional

# Mimic a real browser so the server doesn't reject the connection
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def fetch_and_extract(url: str) -> Tuple[str, Optional[str]]:
    r = requests.get(url, timeout=15)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")

    # Extract title safely
    title_tag = soup.find("h1", id="wiki-page-title")
    title = title_tag.get_text(strip=True) if title_tag else None

    full_content = ""
    if full_content:
        full_content += f"\n# {title}"

    content_div = soup.find("div", id="wiki-content")
    if not content_div:
        return full_content.strip(), title

    for tag in content_div.find_all(["h2", "h3", "p", "li"]):
        text = tag.get_text(separator=" ", strip=True)
        if not text:
            continue
        if tag.name == "h2":
            full_content += f"\n## {text}"
        elif tag.name == "h3":
            full_content += f"\n### {text}"
        elif tag.name == "li":
            full_content += f"\n- {text}"
        else:
            full_content += f"\n{text}"
    return full_content.strip(), title

def get_urls_from_sitemap(sitemap_url: str):
    response = requests.get(sitemap_url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "xml")

    urls = []
    for loc in soup.find_all('loc'):
        url = loc.text
        if "/crm/" in url:
            urls.append(url)
    print(f"Total CRM URLs found: {len(urls)}")
    return urls