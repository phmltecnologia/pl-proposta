from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-card.png"
LOGO = ROOT / "public" / "materials" / "logo.jpg"
WIDTH, HEIGHT = 1200, 630


def font(name, size):
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts") / name.replace(".ttf", "bd.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


def draw_card():
    image = Image.new("RGB", (WIDTH, HEIGHT), "#081a30")
    pixels = image.load()
    start = (8, 26, 48)
    end = (21, 70, 116)
    for x in range(WIDTH):
        ratio = x / (WIDTH - 1)
        color = tuple(round(start[i] * (1 - ratio) + end[i] * ratio) for i in range(3))
        for y in range(HEIGHT):
            pixels[x, y] = color

    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 20, HEIGHT), fill="#f59e0b")
    draw.ellipse((970, -110, 1320, 240), fill="#1d4ed8")
    draw.ellipse((1030, 455, 1260, 685), fill="#f59e0b")

    logo = Image.open(LOGO).convert("RGB")
    logo_box = (72, 66, 282, 186)
    logo_panel = Image.new("RGB", (logo_box[2] - logo_box[0], logo_box[3] - logo_box[1]), "#ffffff")
    logo.thumbnail((170, 90), Image.Resampling.LANCZOS)
    logo_panel.paste(logo, ((logo_panel.width - logo.width) // 2, (logo_panel.height - logo.height) // 2))
    image.paste(logo_panel, (logo_box[0], logo_box[1]), rounded_mask(logo_panel.size, 20))

    regular = font("segoeui.ttf", 24)
    semibold = font("segoeuib.ttf", 24)
    title = font("segoeuib.ttf", 62)
    body = font("segoeui.ttf", 26)
    small = font("segoeui.ttf", 19)

    draw.text((72, 235), "PL TECNOLOGIA", fill="#93c5fd", font=semibold, spacing=4)
    draw.text((72, 292), "Documento para", fill="#ffffff", font=title)
    draw.text((72, 366), "assinatura", fill="#ffffff", font=title)
    draw.text((72, 470), "Acesse sua proposta e assine eletronicamente", fill="#dbeafe", font=body)
    draw.rounded_rectangle((72, 535, 390, 580), radius=22, fill="#1d4ed8")
    draw.text((98, 546), "Assinatura simples e segura", fill="#ffffff", font=small)

    card = Image.new("RGBA", (285, 375), (255, 255, 255, 248))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((0, 0, 284, 374), radius=24, outline="#dbeafe", width=3)
    card_draw.rectangle((26, 34, 259, 43), fill="#1d4ed8")
    card_draw.rectangle((26, 62, 190, 74), fill="#cbd5e1")
    card_draw.rounded_rectangle((26, 111, 259, 169), radius=9, fill="#eff6ff")
    card_draw.rectangle((44, 129, 174, 139), fill="#94a3b8")
    card_draw.rectangle((44, 148, 224, 157), fill="#cbd5e1")
    card_draw.ellipse((199, 207, 246, 254), fill="#10b981")
    card_draw.line((211, 230, 220, 239), fill="#ffffff", width=5)
    card_draw.line((220, 239, 237, 218), fill="#ffffff", width=5)
    card_draw.rectangle((30, 285, 255, 288), fill="#94a3b8")
    card_draw.rectangle((30, 316, 160, 325), fill="#64748b")
    image.paste(card, (825, 115), card)

    image.save(OUTPUT, "PNG", optimize=True)


if __name__ == "__main__":
    draw_card()
