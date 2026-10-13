"""Validate all 28 Blender deliverables against the registry manifest."""
import json
import struct
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
EMPLOYEES = DATA["employees"]
assert len(EMPLOYEES) == 28
assert len({item["employeeId"] for item in EMPLOYEES}) == 28
ids = {item["employeeId"] for item in EMPLOYEES}
for directory, extension in (
    (ROOT / "employees" / "source", ".blend"),
    (ROOT / "employees" / "models", ".glb"),
    (ROOT / "employees" / "previews", ".png"),
    (ROOT / "employees" / "previews", ".webp"),
    (ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "models", ".glb"),
    (ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "previews", ".png"),
    (ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "previews", ".webp"),
):
    assert {path.stem for path in directory.glob("*" + extension)} == ids, (directory, extension)
for item in EMPLOYEES:
    slug = item["employeeId"]
    source = ROOT / "employees" / "source" / (slug + ".blend")
    model = ROOT / "employees" / "models" / (slug + ".glb")
    png = ROOT / "employees" / "previews" / (slug + ".png")
    webp = ROOT / "employees" / "previews" / (slug + ".webp")
    public_model = ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "models" / (slug + ".glb")
    public_png = ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "previews" / (slug + ".png")
    public_render = ROOT.parents[1] / "public" / "ai-workforce" / "employees" / "previews" / (slug + ".webp")
    for path in (source, model, png, webp, public_model, public_png, public_render):
        assert path.exists() and path.stat().st_size > 1000, path
    raw = model.read_bytes()
    magic, version, total = struct.unpack_from("<4sII", raw)
    assert magic == b"glTF" and version == 2 and total == len(raw), slug
    chunk_length, chunk_type = struct.unpack_from("<II", raw, 12)
    assert chunk_type == 0x4E4F534A
    scene = json.loads(raw[20:20 + chunk_length])
    assert len(scene.get("meshes", [])) >= 12, f"{slug}: too few editable 3D parts"
    assert len(scene.get("materials", [])) >= 4, f"{slug}: missing materials"
    assert len(scene.get("images", [])) >= 1, f"{slug}: missing embedded gradient texture"
    with Image.open(png) as image:
        assert image.size == (2048, 2048), (slug, image.size)
        alpha = image.convert("RGBA").getchannel("A")
        assert alpha.getextrema() == (0, 255), f"{slug}: PNG must include transparent and opaque pixels"
        box = alpha.getbbox()
        assert box is not None and box[0] >= 8 and box[1] >= 8, f"{slug}: character clipped"
        assert box[2] <= 2040 and box[3] <= 2040, f"{slug}: character clipped"
    with Image.open(webp) as image:
        assert image.size == (2048, 2048) and "A" in image.mode, slug
    assert public_model.read_bytes() == raw, f"{slug}: public GLB is stale"
    assert public_png.read_bytes() == png.read_bytes(), f"{slug}: public PNG is stale"
    assert public_render.read_bytes() == webp.read_bytes(), f"{slug}: public render is stale"
print("Validated 28 Blender scenes, GLBs, 2048px transparent masters, optimized renders and public copies.")
