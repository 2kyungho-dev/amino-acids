#!/usr/bin/env python3
"""Two jobs, run this before every commit:

1. Stamp index.html's own css/js links with a hash of their contents, so a
   browser that cached the old files is forced to fetch the new ones. GitHub
   Pages serves everything with max-age=600, which otherwise leaves visitors
   running a stale mix of new HTML and old JS for ten minutes after a deploy.
2. Inline everything into dist/amino-acids.html, a single file you can email
   or drop on a phone.
"""
import hashlib, pathlib, re

root  = pathlib.Path(__file__).parent
index = root / 'index.html'
html  = index.read_text(encoding='utf-8')

LINK   = re.compile(r'<link rel="stylesheet" href="([^"]+)">')
SCRIPT = re.compile(r'<script src="([^"]+)"></script>')

def is_local(p): return not p.startswith('http')
def bare(p):     return p.split('?')[0]

# ---- 1. version stamp -------------------------------------------------
assets = [bare(p) for p in LINK.findall(html) + SCRIPT.findall(html) if is_local(p)]
digest = hashlib.sha1()
for a in assets:
    digest.update((root / a).read_bytes())
ver = digest.hexdigest()[:8]

def stamp(fmt):
    def sub(m):
        p = m.group(1)
        return m.group(0) if not is_local(p) else fmt % (bare(p) + '?v=' + ver)
    return sub

stamped = LINK.sub(stamp('<link rel="stylesheet" href="%s">'), html)
stamped = SCRIPT.sub(stamp('<script src="%s"></script>'), stamped)
if stamped != html:
    index.write_text(stamped, encoding='utf-8')
    print('stamped index.html assets with ?v=%s' % ver)
else:
    print('asset version unchanged (%s)' % ver)
html = stamped

# ---- 2. single-file build --------------------------------------------
def inline(tag, wrap):
    def sub(m):
        p = m.group(1)
        if not is_local(p):
            return m.group(0)
        return wrap % (root / bare(p)).read_text(encoding='utf-8')
    return sub

out_html = LINK.sub(inline('link', '<style>\n%s\n</style>'), html)
out_html = SCRIPT.sub(inline('script', '<script>\n%s\n</script>'), out_html)

out = root / 'dist' / 'amino-acids.html'
out.parent.mkdir(exist_ok=True)
out.write_text(out_html, encoding='utf-8')
print('wrote %s (%.0f KB)' % (out, out.stat().st_size / 1024))
