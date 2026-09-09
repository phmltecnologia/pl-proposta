from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-card.png"
LOGO = ROOT / "public" / "materials" / "logo.jpg"
WIDTH, HEIGHT = 1200, 630
BLUE = "#1479c9"
BLUE_DARK = "#0f6ebc"
BLACK = "#111111"
SLATE = "#334155"


def load_font(names, size):
    for name in names:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def cropped_logo():
    logo = Image.open(LOGO).convert("RGB")
    difference = ImageChops.difference(logo, Image.new("RGB", logo.size, "white"))
    bbox = difference.point(lambda value: 255 if value > 10 else 0).getbbox()
    return logo.crop(bbox) if bbox else logo


def draw_card():
    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(image)

    # Organic blue corners and black accent inspired by the email signature.
    draw.rounded_rectangle((-165, -215, 500, 100), radius=170, fill=BLUE)
    draw.rounded_rectangle((1080, 455, 1300, 745), radius=125, fill=BLUE)
    draw.rounded_rectangle((965, 545, 1160, 705), radius=75, fill=BLACK)

    logo = cropped_logo()
    logo.thumbnail((360, 280), Image.Resampling.LANCZOS)
    logo_x = 105 + (360 - logo.width) // 2
    logo_y = 175 + (280 - logo.height) // 2
    image.paste(logo, (logo_x, logo_y))

    draw.rectangle((585, 82, 589, 520), fill=BLUE)

    brand_blue = load_font(["segoeuib.ttf", "arialbd.ttf"], 50)
    brand_black = load_font(["segoeui.ttf", "arial.ttf"], 50)
    title = load_font(["segoeuib.ttf", "arialbd.ttf"], 62)
    body = load_font(["segoeui.ttf", "arial.ttf"], 28)
    tagline = load_font(["segoeuib.ttf", "arialbd.ttf"], 22)

    draw.text((655, 105), "PHML", font=brand_blue, fill=BLUE_DARK)
    draw.text((835, 105), "TECNOLOGIA", font=brand_black, fill=BLACK)
    draw.text((655, 215), "Documento para", font=title, fill=BLACK)
    draw.text((655, 278), "assinatura", font=title, fill=BLACK)
    draw.text((655, 366), "Acesse sua proposta e assine", font=body, fill=SLATE)
    draw.text((655, 400), "eletronicamente", font=body, fill=SLATE)
    draw.rectangle((655, 466, 820, 470), fill=BLUE)
    draw.text((655, 492), "Desenvolvedor de soluções em tecnologia", font=tagline, fill=BLUE_DARK)

    image.save(OUTPUT, "PNG", optimize=True)


if __name__ == "__main__":
    draw_card()
