# AI Pod 3D employee collection

The 28 current registry employees each have an original, editable Blender scene,
GLB export and transparent PNG/WebP render. The creature choices and roles follow
the supplied seven-column by four-row workforce reference. The geometry is built
by species rather than recoloring a shared body: wings, fins, antlers, shells,
tentacles, tails, faces, poses and role props are actual meshes or curves. Color
gradients are embedded image textures in the GLBs. There are no reference-image
crops or image planes in the deliverable assets.

## Files

- `employees/source/<employee-id>.blend`: editable native Blender source.
- `employees/models/<employee-id>.glb`: portable geometry and materials.
- `employees/previews/<employee-id>.png`: 2048px transparent master.
- `employees/previews/<employee-id>.webp`: optimized website render.
- `employees/contact-sheet-4k.png`: all 28, in reference order.
- `manifest.json`: canonical employee ID to media mapping.
- `source/blender/generate_employee_collection.py`: repeatable model generator.
- `source/blender/species_v2.py`: individual species silhouettes and expressions.
- `source/generation-scripts/create_contact_sheet.py`: visual QA sheet.
- `source/generation-scripts/reframe_renders.py`: centers and scales the full
  character within the transparent canvas after Blender rendering; it does not
  read or crop the supplied reference image.
- `source/generation-scripts/validate_collection.py`: required files, transparency,
  GLB geometry and public-copy validation.

The browser copies of GLBs and previews are in
`web/public/ai-workforce/employees/`. Keep source `.blend` files outside
`public`. The shared `WorkerScene` uses optimized images on marketing pages and
loads a role's own GLB in the employee profile. Compact workspace avatars use
the same employee mapping.

## Regenerate

From `web/`:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python assets\ai-workforce\source\blender\generate_employee_collection.py
node --import tsx assets\ai-workforce\source\generation-scripts\generate-manifest.ts
python assets\ai-workforce\source\generation-scripts\reframe_renders.py
Copy-Item assets\ai-workforce\employees\models\*.glb public\ai-workforce\employees\models\ -Force
Copy-Item assets\ai-workforce\employees\previews\*.webp public\ai-workforce\employees\previews\ -Force
Copy-Item assets\ai-workforce\employees\previews\*.png public\ai-workforce\employees\previews\ -Force
python assets\ai-workforce\source\generation-scripts\create_contact_sheet.py
python assets\ai-workforce\source\generation-scripts\validate_collection.py
```

Use `-- --only employee-id --draft` when iterating on a single character.
The production run omits `--draft` and exports 2048px masters. Inspect the
contact sheet and representative GLBs after changing the geometry.
