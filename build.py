#!/usr/bin/env python3
"""Inline css/ and js/ into one self-contained HTML file you can double-click,
email, or drop on a phone. Run:  python3 build.py"""
import pathlib, re, sys

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')

def css_tag(m):
    href = m.group(1)
    if href.startswith('http'):
        return m.group(0)
    return '<style>\n' + (root / href).read_text(encoding='utf-8') + '\n</style>'

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_tag, html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '\n</script>',
              html)

out = root / 'dist' / 'amino-acids.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print('wrote %s (%.0f KB)' % (out, out.stat().st_size / 1024))
