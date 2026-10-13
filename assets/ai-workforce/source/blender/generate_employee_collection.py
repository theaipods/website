"""Generate 28 original, editable creature sculptures and transparent renders.

Blender 5.2:
  blender --background --python generate_employee_collection.py -- --only pod-manager
  blender --background --python generate_employee_collection.py
"""
import bpy
import math
import os
import sys
from mathutils import Vector

sys.path.insert(0, os.path.dirname(__file__))

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "employees")
SRC, MODELS, PREVIEWS = (os.path.join(OUT, part) for part in ("source", "models", "previews"))
for directory in (SRC, MODELS, PREVIEWS):
    os.makedirs(directory, exist_ok=True)

# The reference grid's creature, prop and palette, in its exact seven-by-four order.
EMPLOYEES = [
    ("pod-manager", "Pod Manager", "phoenix", "#FF7A36", "plan"),
    ("orchestrator", "Workforce Orchestrator", "whale", "#4085EF", "orbits"),
    ("observer", "Workforce Observer", "owl", "#6761D9", "dashboard"),
    ("sales-sales-agent", "Sales Agent", "fox", "#F9A33F", "briefcase"),
    ("marketing-marketing-agent", "Marketing Agent", "bird", "#F36BA7", "megaphone"),
    ("marketing-social-media-manager", "Social Media Manager", "rabbit", "#58CCAC", "social"),
    ("hr-hr-agent", "HR Agent", "deer", "#F3A2B9", "heart"),
    ("hr-employee-assistant", "Employee Assistant", "otter", "#AB82E7", "tablet"),
    ("it-systems-administrator", "Systems Administrator", "bear", "#8CBCEC", "gear"),
    ("it-security-engineer", "Security Engineer", "fox", "#65D4C0", "shield"),
    ("it-network-engineer", "Network Engineer", "rabbit", "#6A8FEF", "network"),
    ("finance-finance-agent", "Finance Agent", "squirrel", "#F6A34B", "coin"),
    ("finance-audit-agent", "Audit Agent", "owl", "#A68DEB", "magnifier"),
    ("finance-approval-router", "Approval Router", "turtle", "#65BD80", "checklist"),
    ("ops-project-manager", "Project Manager", "unicorn", "#B9A5F2", "calendar"),
    ("ops-business-analyst", "Business Analyst", "narwhal", "#65B4EF", "chart"),
    ("product-product-manager", "Product Manager", "fox", "#F38056", "bulb"),
    ("product-ui-ux-designer", "UI/UX Designer", "butterfly", "#B18AEC", "palette"),
    ("product-frontend-developer", "Frontend Developer", "cat", "#647FD9", "laptop"),
    ("product-backend-developer", "Backend Developer", "dragon", "#6DBD9A", "laptop"),
    ("product-qa-engineer", "QA Engineer", "sheep", "#F0B1B9", "checklist"),
    ("product-cloud-engineer", "Cloud Engineer", "cloud", "#7AC5F1", "cloud"),
    ("product-devops-agent", "DevOps Agent", "octopus", "#9275DB", "gear"),
    ("data-data-analyst", "Data Analyst", "sprout", "#87CD78", "chart"),
    ("data-research-agent", "Research Agent", "fox", "#7EA7EB", "magnifier"),
    ("data-market-researcher", "Market Researcher", "flamingo", "#F17BAD", "chart"),
    ("legal-compliance-analyst", "Compliance Analyst", "deer", "#B7C5F2", "shield"),
    ("legal-redaction-guard", "Redaction Guard", "cat", "#493566", "lock"),
]


def rgba(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1,)


def mix(a, b, amount):
    return tuple(a[i] * (1 - amount) + b[i] * amount for i in range(3)) + (1,)


def mat(name, color, rough=.31, metallic=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = color
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Coat Weight"].default_value = .22
    bsdf.inputs["Coat Roughness"].default_value = .22
    return m


def gradient_mat(name, dark, base, highlight):
    """An embedded image texture keeps each role's color gradient in the GLB."""
    material = mat(name, base, .41)
    width, height = 4, 256
    image = bpy.data.images.new(name + " baked gradient", width=width, height=height, alpha=True)
    pixels = []
    for y in range(height):
        t = y / (height - 1)
        if t < .54:
            color = mix(dark, base, t / .54)
        else:
            color = mix(base, highlight, (t - .54) / .46)
        for _ in range(width):
            pixels.extend((*color[:3], 1.0))
    image.pixels = pixels
    image.pack()
    nodes = material.node_tree.nodes
    texture = nodes.new("ShaderNodeTexImage")
    texture.name = "Embedded role gradient"
    texture.image = image
    material.node_tree.links.new(texture.outputs["Color"],
                                 nodes.get("Principled BSDF").inputs["Base Color"])
    return material


def smooth(obj):
    if obj.type == "MESH":
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj


def ell(name, p, s, material, rotation=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, location=p)
    o = bpy.context.object
    o.name = name
    o.scale = s
    if rotation:
        o.rotation_euler = rotation
    o.data.materials.append(material)
    return smooth(o)


def bevel_box(name, p, dimensions, material, bevel=.075, rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=p)
    o = bpy.context.object
    o.name = name
    o.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rotation:
        o.rotation_euler = rotation
    o.data.materials.append(material)
    modifier = o.modifiers.new("Sculpted rounded edges", "BEVEL")
    modifier.width = bevel
    modifier.segments = 4
    o.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return o


def cone(name, p, radius, depth, material, rotation=None, vertices=48):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=0, depth=depth, location=p)
    o = bpy.context.object
    o.name = name
    if rotation:
        o.rotation_euler = rotation
    o.data.materials.append(material)
    return smooth(o)


def cylinder(name, p, radius, depth, material, rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=p)
    o = bpy.context.object
    o.name = name
    if rotation:
        o.rotation_euler = rotation
    o.data.materials.append(material)
    bevel = o.modifiers.new("Soft rim", "BEVEL")
    bevel.width = min(.045, depth / 5)
    bevel.segments = 3
    return smooth(o)


def tube(name, points, radius, material):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for node, point in zip(spline.bezier_points, points):
        node.co = point
        node.handle_left_type = "AUTO"
        node.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    return o


def ring(name, p, major, minor, material, rotation=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=12, location=p,
                                    major_radius=major, minor_radius=minor)
    o = bpy.context.object
    o.name = name
    if rotation:
        o.rotation_euler = rotation
    o.data.materials.append(material)
    return smooth(o)


def point_camera_or_light(o, target):
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()


def accessory(prop, fur, light, accent, ink, cream):
    # Every object is real mesh/curve geometry. Props are kept front-right of the face.
    p = (.78, -.74, 1.08)
    if prop == "plan":
        panel = bevel_box("Planning board", (.85, -.66, 1.18), (.64, .09, .48), light)
        panel.rotation_euler[1] = -.18
        for i in range(3):
            bevel_box("Task pill", (.71 + i * .13, -.72, 1.29 - i * .11),
                      (.11, .015, .045), accent, .02)
    elif prop == "orbits":
        for i, radius in enumerate((.78, 1.00)):
            ring("Work orbit", (0, .15, 1.55), radius, .022, light,
                 (math.pi / 2.8, .15 * i, .20 * i))
        for i in range(6):
            a = math.pi * 2 * i / 6
            ell("Coordinated work signal", (math.cos(a) * 1.0, -.17,
                                            1.56 + math.sin(a) * .75),
                (.065, .065, .065), accent)
    elif prop in ("dashboard", "chart", "calendar", "checklist", "tablet", "laptop", "social"):
        panel = bevel_box("Sculpted display panel", (.90, -.69, 1.18),
                          (.71, .105, .54), ink if prop in ("laptop", "tablet") else light)
        panel.rotation_euler[1] = -.14
        if prop == "laptop":
            bevel_box("Laptop keyboard", (.88, -.87, .82), (.81, .49, .075), ink, .035)
            for i in range(4):
                bevel_box("Keyboard key", (.68 + i * .13, -1.10, .87),
                          (.07, .055, .015), light, .008)
        elif prop == "calendar":
            for x in range(3):
                for z in range(2):
                    ell("Calendar day", (.69 + x * .18, -.754, 1.30 - z * .17),
                        (.05, .02, .05), accent)
        elif prop == "checklist":
            for z in (1.35, 1.17, .99):
                ell("Checklist check", (.67, -.755, z), (.046, .02, .046), accent)
                bevel_box("Checklist line", (.90, -.756, z), (.29, .012, .025), fur, .009)
        elif prop == "social":
            for x, z in ((.7, 1.28), (.96, 1.28), (.83, 1.03)):
                ell("Social channel marker", (x, -.757, z), (.065, .02, .065), accent)
        else:
            for i, size in enumerate((.16, .27, .38)):
                bevel_box("Dashboard data bar", (.68 + i * .17, -.757, 1.08 + size / 2),
                          (.09, .013, size), accent, .012)
    elif prop == "briefcase":
        bevel_box("Leather presentation case", (.82, -.78, .78), (.70, .24, .49), accent)
        tube("Case handle", [(.66, -.78, 1.06), (.66, -.78, 1.18),
                             (.98, -.78, 1.18), (.98, -.78, 1.06)], .035, ink)
        bevel_box("Case clasp", (.82, -.91, .80), (.10, .035, .08), light, .018)
    elif prop == "megaphone":
        cone("Megaphone horn", (.86, -.86, 1.28), .28, .63, accent,
             (0, math.pi / 2, 0))
        ring("Megaphone front rim", (1.16, -.86, 1.28), .27, .035, light,
             (0, math.pi / 2, 0))
        cylinder("Megaphone grip", (.70, -.87, .95), .055, .30, ink)
    elif prop == "coin":
        cylinder("Gold finance coin", (.83, -.73, 1.13), .31, .07, accent,
                 (math.pi / 2, 0, 0))
        ring("Coin inset", (.83, -.779, 1.13), .22, .023, light,
             (math.pi / 2, 0, 0))
        ell("Coin center", (.83, -.781, 1.13), (.095, .017, .095), light)
    elif prop == "magnifier":
        ring("Magnifying lens", (.78, -.77, 1.38), .27, .045, accent,
             (math.pi / 2, 0, 0))
        tube("Magnifier handle", [(.96, -.78, 1.17), (1.20, -.78, .89)],
             .055, ink)
    elif prop == "gear":
        ring("Gear wheel", (.85, -.78, 1.21), .22, .075, accent,
             (math.pi / 2, 0, 0))
        for i in range(8):
            a = 2 * math.pi * i / 8
            ell("Gear tooth", (.85 + math.cos(a) * .25, -.79, 1.21 + math.sin(a) * .25),
                (.068, .045, .068), accent)
    elif prop == "shield":
        bevel_box("Security shield", (.82, -.80, 1.20), (.52, .11, .63), accent, .17)
        ell("Shield heart", (.82, -.868, 1.21), (.14, .025, .15), cream)
        ell("Shield keyhole", (.82, -.901, 1.24), (.035, .015, .045), ink)
    elif prop == "network":
        for x, z in ((.55, 1.42), (1.11, 1.39), (.83, .94)):
            ell("Network node", (x, -.8, z), (.13, .12, .13), accent)
        for points in ([ (.55,-.8,1.42), (1.11,-.8,1.39) ],
                       [(.55,-.8,1.42),(.83,-.8,.94)],
                       [(1.11,-.8,1.39),(.83,-.8,.94)]):
            tube("Network edge", points, .025, light)
    elif prop == "heart":
        for side in (-1, 1):
            ell("Heart lobe", (.77 + side * .11, -.78, 1.20), (.14, .07, .15), accent)
        cone("Heart point", (.77, -.79, 1.10), .17, .26, accent, (math.pi, 0, 0))
    elif prop == "bulb":
        ell("Idea lightbulb", (.85, -.80, 1.43), (.22, .19, .26), light)
        cylinder("Bulb base", (.85, -.80, 1.12), .095, .16, ink)
        for i in range(5):
            a = i * math.tau / 5
            ell("Idea sparkle", (.85 + math.sin(a) * .37, -.79,
                                  1.44 + math.cos(a) * .38), (.035, .035, .035), accent)
    elif prop == "palette":
        ell("Paint palette", (.84, -.78, 1.11), (.38, .075, .26), cream,
            (0, -.14, 0))
        for i, color in enumerate((accent, fur, light)):
            ell("Paint well", (.67 + .16 * i, -.852, 1.19 - .05 * i),
                (.045, .018, .045), color)
    elif prop == "cloud":
        for x, z, scale in ((.68, 1.11, .13), (.82, 1.20, .19), (1.00, 1.10, .15)):
            ell("Cloud service glyph", (x, -.80, z), (scale, .055, scale), cream)
    elif prop == "lock":
        bevel_box("Protected document", (.88, -.75, 1.11), (.57, .10, .63), light, .045)
        ring("Padlock shackle", (.88, -.83, 1.16), .13, .028, ink,
             (math.pi / 2, 0, 0))
        bevel_box("Padlock body", (.88, -.86, 1.08), (.27, .075, .20), ink, .036)


def setup_scene():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.film_transparent = True
    scene.render.resolution_x = scene.render.resolution_y = 2048
    scene.render.resolution_percentage = 50 if "--draft" in sys.argv else 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "Medium High Contrast"
    scene.world = bpy.data.worlds.new("Neutral studio")
    scene.world.color = (.34, .38, .45)
    bpy.ops.object.camera_add(location=(3.7, -8.6, 4.15))
    camera = bpy.context.object
    camera.name = "Collection orthographic studio camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 4.55
    point_camera_or_light(camera, (0, -.20, 1.53))
    scene.camera = camera
    for name, position, energy, size, color in (
        ("Warm softbox", (-3.8, -4.7, 6.0), 400, 5.0, (1.0, .92, .85)),
        ("Cool fill", (4.4, -2.4, 4.4), 280, 4.5, (.78, .86, 1.0)),
        ("Shape rim", (0, 3.0, 5.4), 420, 3.4, (.87, .91, 1.0)),
    ):
        bpy.ops.object.light_add(type="AREA", location=position)
        lamp = bpy.context.object
        lamp.name = name
        lamp.data.energy = energy
        lamp.data.shape = "DISK"
        lamp.data.size = size
        lamp.data.color = color
        point_camera_or_light(lamp, (0, 0, 1.40))
    scene.camera.data.lens = 52
    return scene


def render_and_export(slug, scene):
    # Only character geometry is exported. Cameras and lights stay in the editable scene.
    bpy.ops.object.select_all(action="DESELECT")
    for o in scene.objects:
        if o.type in ("MESH", "CURVE"):
            o.select_set(True)
    scene.render.filepath = os.path.join(PREVIEWS, slug + ".png")
    bpy.ops.render.render(write_still=True)
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.quality = 92
    scene.render.filepath = os.path.join(PREVIEWS, slug + ".webp")
    bpy.ops.render.render(write_still=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(MODELS, slug + ".glb"),
                              export_format="GLB", use_selection=True,
                              export_materials="EXPORT")
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SRC, slug + ".blend"))


def build(slug, name, kind, color, prop):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base = rgba(color)
    pale = mix(base, rgba("#FFFFFF"), .47)
    shadow = mix(base, rgba("#172448"), .43)
    vivid = mix(base, rgba("#FF569B") if kind in ("bird", "flamingo", "deer") else rgba("#3677FF"), .21)
    if kind == "phoenix":
        shadow, pale, vivid = rgba("#D63E25"), rgba("#FFD15B"), rgba("#F24C31")
    elif kind == "butterfly":
        shadow, pale, vivid = rgba("#6949D0"), rgba("#ACDFFF"), rgba("#E967E9")
    elif kind == "sprout":
        shadow, pale, vivid = rgba("#23895B"), rgba("#D3F58D"), rgba("#5BCE71")
    elif kind == "dragon":
        shadow, pale, vivid = rgba("#278B67"), rgba("#B6EF8D"), rgba("#46D49A")
    elif kind == "flamingo":
        shadow, pale, vivid = rgba("#CE367B"), rgba("#FFB7D9"), rgba("#FF5B9B")
    skin = gradient_mat("Role-specific baked fur gradient", shadow, base, pale)
    light = mat("Pale sculptural highlights", pale, .43)
    shade = mat("Deep species contours", shadow, .44)
    accent = mat("Bright role accent", vivid, .37)
    cream = mat("Ivory breast and eye enamel", rgba("#FFF8EF"), .35)
    ink = mat("Midnight glass iris", rgba("#111D39"), .16)
    blush = mat("Warm cheek and ear lining", rgba("#F6A2B9"), .48)
    gold = mat("Warm metallic gold", rgba("#FFC464"), .28, .12)
    from species_v2 import build_species
    build_species(kind, {"gradient": skin, "light": light, "shade": shade,
                         "accent": accent, "ivory": cream, "ink": ink,
                         "blush": blush, "gold": gold}, slug)
    accessory(prop, skin, light, accent, ink, cream)
    scene = setup_scene()
    scene["AI Pod employee"] = name
    scene["Creature"] = kind
    scene["Role prop"] = prop
    render_and_export(slug, scene)
    print("COMPLETED", slug, flush=True)


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]
    selected = [e for e in EMPLOYEES if only is None or e[0] == only]
    if not selected:
        raise SystemExit("Unknown employee slug: " + str(only))
    for item in selected:
        build(*item)
    print("Generated", len(selected), "editable 3D employees", flush=True)


if __name__ == "__main__":
    main()
