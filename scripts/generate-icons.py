"""Render the site's pixel [r] monogram to SVG and raster favicon formats."""
from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / 'public/icons'
BACKGROUND = '#0b100e'
ACCENT = '#b7ed87'
# Rectangles on a 16px grid: brackets around the root initial.
PIXELS = [(2, 3, 3, 1), (2, 4, 1, 8), (2, 12, 3, 1),
          (11, 3, 3, 1), (13, 4, 1, 8), (11, 12, 3, 1),
          (6, 6, 1, 6), (7, 7, 1, 1), (8, 6, 2, 1), (9, 7, 1, 1)]

def svg(color=ACCENT, background=True):
    content = f'<rect width="16" height="16" fill="{BACKGROUND}"/>' if background else ''
    content += ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>' for x, y, w, h in PIXELS)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><title>root terminal</title>{content}</svg>\n'

(ICONS / 'root.svg').write_text(svg())
(ICONS / 'safari-pinned-tab.svg').write_text(svg('#000000', False))
base = Image.new('RGB', (16, 16), BACKGROUND)
draw = ImageDraw.Draw(base)
for x, y, width, height in PIXELS:
    draw.rectangle((x, y, x + width - 1, y + height - 1), fill=ACCENT)
for filename, size in [('favicon-16x16.png', 16), ('favicon-32x32.png', 32),
                       ('apple-touch-icon.png', 180), ('android-chrome-192x192.png', 192),
                       ('android-chrome-384x384.png', 384), ('mstile-150x150.png', 150)]:
    base.resize((size, size), Image.Resampling.NEAREST).save(ICONS / filename)
frames = [base.resize((size, size), Image.Resampling.NEAREST) for size in (16, 32, 48)]
frames[-1].save(ICONS / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=frames[:-1])
(ROOT / 'public/favicon.ico').write_bytes((ICONS / 'favicon.ico').read_bytes())
(ICONS / 'site.webmanifest').write_text(json.dumps({
    'name': 'Saksham Arya | Engineering Notes', 'short_name': 'Saksham',
    'icons': [{'src': f'/icons/android-chrome-{size}x{size}.png?v=root', 'sizes': f'{size}x{size}', 'type': 'image/png'} for size in (192, 384)],
    'theme_color': BACKGROUND, 'background_color': BACKGROUND, 'display': 'standalone', 'start_url': '/',
}, indent=2) + '\n')
(ICONS / 'browserconfig.xml').write_text(f'''<?xml version="1.0" encoding="utf-8"?>
<browserconfig><msapplication><tile><square150x150logo src="/icons/mstile-150x150.png?v=root"/><TileColor>{BACKGROUND}</TileColor></tile></msapplication></browserconfig>
''')
