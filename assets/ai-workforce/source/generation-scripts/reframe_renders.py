"""Frame original Blender renders for card use; never reads the reference grid.

This trims only the transparent padding around each generated 3D render and
places the complete creature on a fresh 2048px transparent canvas. The source
Blender scene and GLB geometry remain unchanged.
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PREVIEWS = ROOT / "employees" / "previews"
CANVAS = 2048
CONTENT = 1710


def main():
    count = 0
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    for entry in manifest["employees"]:
        path = PREVIEWS / (entry["employeeId"] + ".png")
        source = Image.open(path).convert("RGBA")
        if source.size != (CANVAS, CANVAS):
            raise ValueError(f"Expected 2048px production render: {path}")
        alpha = source.getchannel("A")
        box = alpha.getbbox()
        if not box:
            raise ValueError(f"Empty render: {path}")
        subject = source.crop(box)
        ratio = CONTENT / max(subject.size)
        new_size = (round(subject.width * ratio), round(subject.height * ratio))
        subject = subject.resize(new_size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        left = (CANVAS - new_size[0]) // 2
        top = (CANVAS - new_size[1]) // 2
        canvas.alpha_composite(subject, (left, top))
        canvas.save(path, compress_level=3)
        canvas.save(path.with_suffix(".webp"), "WEBP", quality=94, method=4)
        count += 1
    if count != 28:
        raise ValueError(f"Expected 28 render files, found {count}")
    print(f"Reframed {count} complete Blender renders on transparent 2048px canvases.")


if __name__ == "__main__":
    main()
