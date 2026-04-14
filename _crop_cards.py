#!/usr/bin/env python3
"""Crop individual instrument cards from composite Gemini-generated images."""

from PIL import Image
import os

SRC = '教具'
OUT = 'img/instruments/cards'
os.makedirs(OUT, exist_ok=True)

# Image 1: 3 cols x 2 rows (2502x1696)
# Piano, Organ, Harpsichord / Accordion, Vibraphone, Glockenspiel
img1 = Image.open(f'{SRC}/Gemini_Generated_Image_4l7l0j4l7l0j4l7l.png')
cards1 = [
    # row 0
    ('piano',        0, 0),
    ('organ',        1, 0),
    ('harpsichord',  2, 0),
    # row 1
    ('accordion',    0, 1),
    ('vibraphone',   1, 1),
    ('glockenspiel', 2, 1),
]

# Image 2: 4 cols x 3 rows (2080x2016)
# Maracas, Tambourine, Snare Drum, Bass Drum /
# Timpani, Xylophone, Marimba, Cymbals /
# Triangle, Gong, Congas, Cowbell
img2 = Image.open(f'{SRC}/Gemini_Generated_Image_9zygtp9zygtp9zyg.png')
cards2 = [
    # row 0
    ('maracas',     0, 0),
    ('tambourine',  1, 0),
    ('snare',       2, 0),
    ('bass-drum',   3, 0),
    # row 1
    ('timpani',     0, 1),
    ('xylophone',   1, 1),
    ('marimba',     2, 1),
    ('cymbals',     3, 1),
    # row 2
    ('triangle',    0, 2),
    ('gong',        1, 2),
    ('congas',      2, 2),
    ('cowbell',     3, 2),
]

# Image 3: top 3 cols + bottom 2 cols (2502x1696)
# Harp, Guitar, Ukulele / Banjo, Mandolin
img3 = Image.open(f'{SRC}/Gemini_Generated_Image_gcf0bagcf0bagcf0.png')
cards3_top = [
    ('harp',    0, 0),
    ('guitar',  1, 0),
    ('ukulele', 2, 0),
]
cards3_bot = [
    ('banjo',    0, 1),
    ('mandolin', 1, 1),
]


def crop_grid(img, cards, cols, rows, padding=0):
    """Crop individual cards from a uniform grid."""
    w, h = img.size
    cell_w = w / cols
    cell_h = h / rows
    
    results = []
    for name, col, row in cards:
        left = int(col * cell_w) + padding
        top = int(row * cell_h) + padding
        right = int((col + 1) * cell_w) - padding
        bottom = int((row + 1) * cell_h) - padding
        
        card = img.crop((left, top, right, bottom))
        out_path = f'{OUT}/{name}.png'
        card.save(out_path, 'PNG')
        print(f'  {name}: {card.size}')
        results.append((name, card.size))
    return results


def crop_img3(img, top_cards, bot_cards, padding=0):
    """Crop image 3 with 3 top + 2 bottom layout.
    Based on pixel analysis:
    - Top row cards at ~(171,869), (947,1609), (1704,2376) -> 3 cards, ~700px wide, ~80px gaps
    - Bottom row cards at ~(202,830), (966,1589) -> 2 cards left-aligned, not centered
    - Row boundary at ~y=840
    """
    w, h = img.size
    
    # Use detected card positions for top row
    top_boxes = [
        (145, 0, 895, 835),     # Harp
        (920, 0, 1640, 835),    # Guitar
        (1675, 0, 2502, 835),   # Ukulele
    ]
    for (name, _, _), box in zip(top_cards, top_boxes):
        left, top, right, bottom = box
        left += padding; top += padding; right -= padding; bottom -= padding
        card = img.crop((left, top, right, bottom))
        out_path = f'{OUT}/{name}.png'
        card.save(out_path, 'PNG')
        print(f'  {name}: {card.size}')
    
    # Bottom row: 2 cards, detected at ~(170,870) and (930,1620)
    bot_boxes = [
        (145, 850, 895, 1696),   # Banjo
        (920, 850, 1640, 1696),  # Mandolin
    ]
    for (name, _, _), box in zip(bot_cards, bot_boxes):
        left, top, right, bottom = box
        left += padding; top += padding; right -= padding; bottom -= padding
        card = img.crop((left, top, right, bottom))
        out_path = f'{OUT}/{name}.png'
        card.save(out_path, 'PNG')
        print(f'  {name}: {card.size}')


# Auto-detect padding by looking at edge pixels (the beige background)
# Use small padding to trim the gaps between cards
PAD = 8

print('Image 1 (keyboard): 3x2 grid')
crop_grid(img1, cards1, cols=3, rows=2, padding=PAD)

print('\nImage 2 (percussion): 4x3 grid')
crop_grid(img2, cards2, cols=4, rows=3, padding=PAD)

print('\nImage 3 (strings): 3+2 layout')
crop_img3(img3, cards3_top, cards3_bot, padding=PAD)

print(f'\nDone! {len(cards1) + len(cards2) + len(cards3_top) + len(cards3_bot)} cards saved to {OUT}/')
