"""Compose the seven-by-four QA sheet from the 28 Blender renders."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
OUT = ROOT / "employees" / "contact-sheet-4k.png"
RENDERS = ROOT / "employees" / "previews"
FONT = Path("C:/Windows/Fonts/segoeui.ttf")
BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")
font = ImageFont.truetype(str(BOLD), 25) if BOLD.exists() else ImageFont.load_default()
small = ImageFont.truetype(str(FONT), 17) if FONT.exists() else ImageFont.load_default()
number = ImageFont.truetype(str(BOLD), 22) if BOLD.exists() else ImageFont.load_default()

WIDTH, HEIGHT = 4096, 2600
sheet = Image.new("RGB", (WIDTH, HEIGHT), "#F3F6FC")
paint = ImageDraw.Draw(sheet)
backgrounds = ["#FBE6DF", "#E7ECFC", "#E8E9FC", "#FBEADA", "#FAE4F0", "#E2F6F2", "#FBE6EC",
               "#EFE4F9", "#DFEEFC", "#E1F7F1", "#E6EDFC", "#FCEBD7", "#EEE7FA", "#E6F5EA",
               "#EDE7FA", "#DFEFFB", "#FCE7E0", "#F3E4FA", "#E5EAFC", "#E2F4E9", "#FCEAED",
               "#E1F1FC", "#ECE6FA", "#E8F6E8", "#E4ECFC", "#FBE5EE", "#E7EDFA", "#ECE3F4"]
ids = ["pod-manager", "orchestrator", "observer",
       "sales-sales-agent", "marketing-marketing-agent", "marketing-social-media-manager",
       "hr-hr-agent", "hr-employee-assistant", "it-systems-administrator",
       "it-security-engineer", "it-network-engineer", "finance-finance-agent",
       "finance-audit-agent", "finance-approval-router", "ops-project-manager",
       "ops-business-analyst", "product-product-manager", "product-ui-ux-designer",
       "product-frontend-developer", "product-backend-developer", "product-qa-engineer",
       "product-cloud-engineer", "product-devops-agent", "data-data-analyst",
       "data-research-agent", "data-market-researcher", "legal-compliance-analyst",
       "legal-redaction-guard"]
by_id = {employee["employeeId"]: employee for employee in MANIFEST["employees"]}
assert len(ids) == len(by_id) == 28 and set(ids) == set(by_id)

LEFT, TOP, GAP_X, GAP_Y = 32, 34, 16, 20
CW = (WIDTH - 2 * LEFT - 6 * GAP_X) // 7
CH = (HEIGHT - TOP * 2 - 3 * GAP_Y) // 4
for index, slug in enumerate(ids):
    row, column = divmod(index, 7)
    x, y = LEFT + column * (CW + GAP_X), TOP + row * (CH + GAP_Y)
    paint.rounded_rectangle((x, y, x + CW, y + CH), 25, fill="#FFFFFF")
    paint.rounded_rectangle((x + 8, y + 8, x + CW - 8, y + CH - 118), 21,
                           fill=backgrounds[index])
    source = Image.open(RENDERS / (slug + ".png")).convert("RGBA")
    if source.getchannel("A").getextrema() != (0, 255):
        raise RuntimeError(f"{slug} lacks a transparent background")
    bounds = source.getbbox()
    if not bounds:
        raise RuntimeError(f"{slug} has no visible character")
    creature = source.crop(bounds)
    creature.thumbnail((CW - 44, CH - 161), Image.Resampling.LANCZOS)
    px = x + (CW - creature.width) // 2
    py = y + 20 + (CH - 147 - creature.height) // 2
    shadow = Image.new("RGBA", creature.size)
    shadow.putalpha(creature.getchannel("A").filter(ImageFilter.GaussianBlur(16)))
    shadow_color = Image.new("RGBA", creature.size, (69, 83, 130, 0))
    shadow_color.putalpha(shadow.getchannel("A").point(lambda a: int(a * .16)))
    sheet.paste(shadow_color.convert("RGB"), (px + 7, py + 12), shadow_color)
    sheet.paste(creature.convert("RGB"), (px, py), creature)
    paint.ellipse((x + 22, y + 22, x + 68, y + 68), fill="#4968C6")
    text = str(index + 1)
    box = paint.textbbox((0, 0), text, font=number)
    paint.text((x + 45 - (box[2] - box[0]) / 2, y + 44 - (box[3] - box[1]) / 2 - 3),
               text, font=number, fill="white")
    paint.text((x + 26, y + CH - 100), by_id[slug]["displayName"],
               font=font, fill="#152244")
    paint.text((x + 26, y + CH - 60), by_id[slug]["species"],
               font=small, fill="#52627D")
sheet.save(OUT, optimize=True)
print(OUT)
