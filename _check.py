#!/usr/bin/env python3
"""Static sanity checks for script.js, style.css, and index.html."""

from __future__ import annotations

import os
import re
import subprocess
import sys

BASE = os.path.dirname(os.path.abspath(__file__))

HTML_VOID_TAGS = frozenset({
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
    "canvas", "option",
})


def read_text(name: str) -> str:
    path = os.path.join(BASE, name)
    with open(path, encoding="utf-8") as f:
        return f.read()


_REGEX_PREFIX = frozenset("(,[{=:!&|?;>+-~%^")


def _js_regex_start(out: list[str]) -> bool:
    j = len(out) - 1
    while j >= 0 and out[j] in " \t\r\n":
        j -= 1
    if j < 0:
        return True
    prev = out[j]
    if prev in _REGEX_PREFIX:
        return True
    if prev.isalnum() or prev == "_":
        while j >= 0 and (out[j].isalnum() or out[j] == "_"):
            j -= 1
        keyword = "".join(out[j + 1 :]).lower()
        return keyword in {"return", "case", "throw", "typeof", "void", "delete", "in", "of", "instanceof"}
    return False


def strip_js(text: str) -> str:
    """Remove strings, comments, and regex literals for delimiter counting."""
    out: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == "/" and i + 1 < n:
            if text[i + 1] == "/":
                while i < n and text[i] != "\n":
                    out.append(" ")
                    i += 1
                continue
            if text[i + 1] == "*":
                i += 2
                while i + 1 < n and not (text[i] == "*" and text[i + 1] == "/"):
                    out.append("\n" if text[i] == "\n" else " ")
                    i += 1
                i = min(i + 2, n)
                continue
            if _js_regex_start(out):
                start = i
                i += 1
                while i < n:
                    if text[i] == "\\":
                        i += 2
                        continue
                    if text[i] == "/":
                        i += 1
                        while i < n and text[i] in "gimsuy":
                            i += 1
                        out.extend(" " * (i - start))
                        break
                    i += 1
                else:
                    out.append(ch)
                    i = start + 1
                continue
        if ch in ('"', "'", "`"):
            quote = ch
            out.append(" ")
            i += 1
            while i < n:
                if text[i] == "\\":
                    out.extend([" ", " "])
                    i += 2
                    continue
                if text[i] == quote:
                    out.append(" ")
                    i += 1
                    break
                out.append("\n" if text[i] == "\n" else " ")
                i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def strip_css(text: str) -> str:
    out: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == "/" and i + 1 < n and text[i + 1] == "*":
            i += 2
            while i + 1 < n and not (text[i] == "*" and text[i + 1] == "/"):
                out.append("\n" if text[i] == "\n" else " ")
                i += 1
            i = min(i + 2, n)
            continue
        if ch in ('"', "'"):
            quote = ch
            out.append(" ")
            i += 1
            while i < n:
                if text[i] == "\\":
                    out.extend([" ", " "])
                    i += 2
                    continue
                if text[i] == quote:
                    out.append(" ")
                    i += 1
                    break
                out.append("\n" if text[i] == "\n" else " ")
                i += 1
            continue
        out.append(ch)
        i += 1
    return "".join(out)


def count_balance(text: str, pairs: tuple[tuple[str, str, str], ...]) -> list[str]:
    errors: list[str] = []
    for open_ch, close_ch, label in pairs:
        opens = text.count(open_ch)
        closes = text.count(close_ch)
        diff = opens - closes
        if diff:
            errors.append(f"{label}: {opens} open, {closes} close, balance {diff:+d}")
    return errors


def check_node_syntax(filename: str) -> list[str]:
    path = os.path.join(BASE, filename)
    if not os.path.isfile(path):
        return [f"missing {filename}"]
    result = subprocess.run(
        ["node", "--check", path],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        msg = (result.stderr or result.stdout).strip()
        return [f"{filename} syntax: {msg}"]
    return []


def check_html_tags(html: str) -> list[str]:
    html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
    tag_re = re.compile(r"<(/?)([\w:-]+)([^>]*?)(\/?)>", re.IGNORECASE)

    stack: list[str] = []
    errors: list[str] = []

    for match in tag_re.finditer(html):
        is_close, tag, _attrs, trailing_slash = match.groups()
        tag = tag.lower()
        if tag in HTML_VOID_TAGS or trailing_slash == "/":
            continue
        if not is_close:
            stack.append(tag)
            continue
        if stack and stack[-1] == tag:
            stack.pop()
            continue
        expected = stack[-1] if stack else "none"
        errors.append(f"closing </{tag}> but expected </{expected}>")

    if stack:
        errors.append(f"unclosed tags: {stack}")
    return errors


def main() -> int:
    failures: list[str] = []

    for js_file in ("script.js", "bootstrap-instruments.js"):
        failures.extend(check_node_syntax(js_file))

    js_clean = strip_js(read_text("script.js"))
    failures.extend(
        f"JS {msg}"
        for msg in count_balance(
            js_clean,
            (("(", ")", "parens"), ("{", "}", "braces"), ("[", "]", "brackets")),
        )
    )

    css_clean = strip_css(read_text("style.css"))
    failures.extend(f"CSS {msg}" for msg in count_balance(css_clean, (("{", "}", "braces"),)))

    html_errors = check_html_tags(read_text("index.html"))
    failures.extend(f"HTML {msg}" for msg in html_errors)

    if failures:
        print(f"{len(failures)} check(s) failed:")
        for msg in failures:
            print(f"  - {msg}")
        return 1

    print("All checks passed")
    print("  script.js, bootstrap-instruments.js — node --check OK")
    print("  JS delimiters balanced (strings/comments stripped)")
    print("  CSS braces balanced")
    print("  HTML tag nesting balanced (self-closing tags handled)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
