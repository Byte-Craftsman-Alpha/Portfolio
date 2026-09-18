import os
from PIL import Image, ImageDraw, ImageFont

def generate_og_image():
    width = 1200
    height = 630
    img = Image.new('RGB', (width, height), color='#faf9f6')
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([24, 24, width - 24, height - 24], outline='#e8e4df', width=2)
    draw.rectangle([28, 28, width - 28, height - 28], outline='#f3f1ed', width=1)

    # Try to load fonts
    try:
        font_eyebrow = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_desc = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    except Exception:
        font_eyebrow = font_title = font_subtitle = font_desc = font_footer = ImageFont.load_default()

    # Brand badge
    draw.rectangle([80, 80, 360, 124], fill='#f3f1ed', outline='#e8e4df', width=1)
    draw.text((96, 92), "TEAM PARADOX · GORAKHPUR", fill='#8a8580', font=font_eyebrow)

    # Name
    draw.text((80, 170), "Aditya Chaudhari", fill='#2c2c2c', font=font_title)

    # Role
    draw.text((80, 260), "Python-Led Full-Stack Engineer", fill='#3d3d3d', font=font_subtitle)

    # Value prop
    desc = (
        "Practical systems across backend APIs, real-time messaging, browser automation,\n"
        "computer vision, and campus platforms (EduPortal). Evidence over adjectives."
    )
    draw.text((80, 330), desc, fill='#6b6b6b', font=font_desc, spacing=10)

    # Horizontal divider
    draw.line([80, 480, width - 80, 480], fill='#e8e4df', width=2)

    # Footer elements
    draw.text((80, 520), "aditya.teamparadox.in", fill='#2c2c2c', font=font_footer)
    draw.text((width - 440, 520), "Co-Leader @ Team Paradox", fill='#8a8580', font=font_footer)

    os.makedirs("public", exist_ok=True)
    img.save("public/og-image.png", format="PNG", optimize=True)
    print("Generated public/og-image.png (1200x630)")

def generate_apple_icon():
    size = 180
    img = Image.new('RGB', (size, size), color='#2c2c2c')
    draw = ImageDraw.Draw(img)

    # Inner border
    draw.rectangle([8, 8, size - 8, size - 8], outline='#3d3d3d', width=2)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
    except Exception:
        font = ImageFont.load_default()

    # Monogram "AC"
    text = "AC"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) / 2
    y = (size - text_h) / 2 - 4

    draw.text((x, y), text, fill='#faf9f6', font=font)

    os.makedirs("public", exist_ok=True)
    img.save("public/apple-touch-icon.png", format="PNG", optimize=True)
    print("Generated public/apple-touch-icon.png (180x180)")

if __name__ == "__main__":
    generate_og_image()
    generate_apple_icon()

