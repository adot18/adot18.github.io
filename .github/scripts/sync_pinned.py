#!/usr/bin/env python3
"""Sync pinned GitHub repositories into pinned-projects.js."""

from html.parser import HTMLParser
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTENT_JS = os.path.join(ROOT, "content.js")
OUTPUT_JS = os.path.join(ROOT, "pinned-projects.js")


def detect_username() -> str:
    env_user = os.environ.get("GITHUB_USERNAME", "").strip()
    if env_user:
        return env_user
    if os.path.exists(CONTENT_JS):
        with open(CONTENT_JS, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.search(r'github\s*:\s*["\']https?://github\.com/([^/"\'\s]+)', text)
        if m:
            return m.group(1)
    return "adot18"


def format_repo(
    username: str,
    name: str,
    owner: str,
    url: str,
    description: str | None,
    language: str | None,
    topics: list[str],
    stars: int,
) -> dict:
    display_name = name if owner.lower() == username.lower() else f"{owner}/{name}"
    tags: list[str] = []
    seen = set()

    if language:
        tags.append(language)
        seen.add(language.lower())

    for topic in topics:
        if len(tags) >= 3:
            break
        if topic and topic.lower() not in seen:
            tags.append(topic)
            seen.add(topic.lower())

    if stars > 0:
        tags.append(f"★ {stars}")

    return {
        "type": "code",
        "name": display_name,
        "blurb": (description or "").strip(),
        "url": url,
        "tags": tags,
    }


def fetch_via_graphql(username: str, token: str) -> list[dict] | None:
    query = """
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              owner { login }
              description
              url
              stargazerCount
              primaryLanguage { name }
              repositoryTopics(first: 4) {
                nodes {
                  topic { name }
                }
              }
            }
          }
        }
      }
    }
    """
    payload = json.dumps({"query": query, "variables": {"login": username}}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "ongalex-dev-pinned-sync",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        print(f"GraphQL request failed: {e}", file=sys.stderr)
        return None

    if data.get("errors"):
        print(f"GraphQL returned errors: {data['errors']}", file=sys.stderr)
        return None

    nodes = (((data.get("data") or {}).get("user") or {}).get("pinnedItems") or {}).get("nodes")
    if nodes is None:
        return None

    repos: list[dict] = []
    for node in nodes:
        if not node or not node.get("name"):
            continue
        owner = ((node.get("owner") or {}).get("login")) or username
        topics = [
            ((t.get("topic") or {}).get("name"))
            for t in ((node.get("repositoryTopics") or {}).get("nodes") or [])
            if (t.get("topic") or {}).get("name")
        ]
        repos.append(
            format_repo(
                username=username,
                name=node["name"],
                owner=owner,
                url=node["url"],
                description=node.get("description"),
                language=((node.get("primaryLanguage") or {}).get("name")),
                topics=topics,
                stars=int(node.get("stargazerCount") or 0),
            )
        )
    return repos


class PinnedHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.items: list[dict] = []
        self._in_item = False
        self._item_depth = 0
        self._current: dict | None = None
        self._capture: str | None = None
        self._capture_buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        classes = (attr_map.get("class") or "").split()

        if tag == "li" and "pinned-item-list-item" in classes:
            self._in_item = True
            self._item_depth = 1
            self._current = {"href": "", "desc": "", "lang": "", "stars": 0}
            return

        if not self._in_item or self._current is None:
            return

        self._item_depth += 1

        if tag == "a":
            href = attr_map.get("href") or ""
            if not self._current["href"] and re.match(r"^/[^/]+/[^/]+$", href):
                self._current["href"] = href
            elif href.endswith("/stargazers"):
                self._capture = "stars"
                self._capture_buf = []
        elif tag == "p" and "pinned-item-desc" in classes:
            self._capture = "desc"
            self._capture_buf = []
        elif tag == "span" and attr_map.get("itemprop") == "programmingLanguage":
            self._capture = "lang"
            self._capture_buf = []

    def handle_endtag(self, tag: str) -> None:
        if not self._in_item or self._current is None:
            return

        if self._capture == "desc" and tag == "p":
            self._current["desc"] = " ".join("".join(self._capture_buf).split())
            self._capture = None
        elif self._capture == "lang" and tag == "span":
            self._current["lang"] = " ".join("".join(self._capture_buf).split())
            self._capture = None
        elif self._capture == "stars" and tag == "a":
            raw_stars = " ".join("".join(self._capture_buf).split()).replace(",", "")
            m = re.search(r"(\d+(?:\.\d+)?)\s*([kKmM]?)", raw_stars)
            if m:
                val = float(m.group(1))
                suffix = m.group(2).lower()
                if suffix == "k":
                    val *= 1000
                elif suffix == "m":
                    val *= 1_000_000
                self._current["stars"] = int(val)
            self._capture = None

        self._item_depth -= 1
        if self._item_depth == 0:
            if self._current["href"]:
                self.items.append(self._current)
            self._in_item = False
            self._current = None

    def handle_data(self, data: str) -> None:
        if self._capture is not None:
            self._capture_buf.append(data)


def fetch_via_html(username: str) -> list[dict] | None:
    req = urllib.request.Request(
        f"https://github.com/{username}",
        headers={"User-Agent": "ongalex-dev-pinned-sync"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"Profile HTML fetch failed: {e}", file=sys.stderr)
        return None

    parser = PinnedHTMLParser()
    parser.feed(body)
    if not parser.items:
        return None

    repos: list[dict] = []
    for item in parser.items[:6]:
        parts = item["href"].strip("/").split("/")
        if len(parts) != 2:
            continue
        owner, name = parts
        repos.append(
            format_repo(
                username=username,
                name=name,
                owner=owner,
                url=f"https://github.com/{owner}/{name}",
                description=html.unescape(item["desc"]),
                language=html.unescape(item["lang"]) or None,
                topics=[],
                stars=item["stars"],
            )
        )
    return repos


def main() -> int:
    username = detect_username()
    token = os.environ.get("GITHUB_TOKEN", "").strip()

    repos = None
    if token:
        repos = fetch_via_graphql(username, token)

    if repos is None:
        print(f"Falling back to GitHub profile HTML for {username}...", file=sys.stderr)
        repos = fetch_via_html(username)

    if repos is None:
        print("Failed to fetch pinned repositories; keeping existing pinned-projects.js", file=sys.stderr)
        return 1

    content = (
        "// Auto-generated by .github/workflows/sync-pinned.yml — do not edit manually.\n"
        f"window.PINNED_PROJECTS = {json.dumps(repos, indent=2, ensure_ascii=False)};\n"
    )

    if os.path.exists(OUTPUT_JS):
        with open(OUTPUT_JS, "r", encoding="utf-8") as f:
            if f.read() == content:
                print(f"pinned-projects.js is already up to date ({len(repos)} repos).")
                return 0

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated pinned-projects.js with {len(repos)} pinned repos for {username}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
