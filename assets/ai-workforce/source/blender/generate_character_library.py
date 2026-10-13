"""Generate original AI Pod creature-family GLBs and studio previews.

Run with Blender 5+: blender --background --python generate_character_library.py
The script is self-contained so every exported model can be recreated from source.
"""
import bpy
import math
import os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODELS = os.path.join(ROOT, "models")
PREVIEWS = os.path.join(ROOT, "previews")
SOURCE = os.path.join(ROOT, "source", "blender")
os.makedirs(MODELS, exist_ok=True); os.makedirs(PREVIEWS, exist_ok=True); os.makedirs(SOURCE, exist_ok=True)

SPECS = {
    "research": ("research-cat", (0.31, 0.53, 0.88, 1), (0.77, 0.67, 0.96, 1)),
    "data": ("data-cat", (0.26, 0.66, 0.82, 1), (0.55, 0.48, 0.89, 1)),
    "finance": ("finance-deer", (0.37, 0.72, 0.55, 1), (0.18, 0.53, 0.38, 1)),
    "sales": ("sales-fox", (0.92, 0.39, 0.22, 1), (0.76, 0.22, 0.12, 1)),
    "engineering": ("engineering-axolotl", (0.22, 0.51, 0.91, 1), (0.12, 0.35, 0.73, 1)),
    "operations": ("operations-turtle", (0.30, 0.64, 0.35, 1), (0.16, 0.43, 0.25, 1)),
    "security": ("security-hedgehog", (0.34, 0.50, 0.64, 1), (0.13, 0.29, 0.45, 1)),
    "marketing": ("marketing-bird", (0.93, 0.40, 0.58, 1), (0.78, 0.20, 0.37, 1)),
    "legal": ("legal-owl", (0.59, 0.43, 0.27, 1), (0.41, 0.25, 0.12, 1)),
    "support": ("support-penguin", (0.50, 0.35, 0.78, 1), (0.33, 0.18, 0.62, 1)),
    "people": ("people-rabbit", (0.95, 0.47, 0.61, 1), (0.80, 0.25, 0.43, 1)),
    "product": ("product-otter", (0.49, 0.38, 0.84, 1), (0.31, 0.22, 0.64, 1)),
    "quality": ("quality-seal", (0.24, 0.63, 0.48, 1), (0.10, 0.43, 0.30, 1)),
    "orchestrator": ("workforce-orchestrator", (0.43, 0.34, 0.86, 1), (0.27, 0.18, 0.66, 1)),
}

def mat(name, color, rough=.42, metallic=0.0):
    item = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    item.use_nodes = True
    bsdf = item.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    return item

WHITE = mat("Cream", (1, .97, .91, 1), .3); DARK = mat("Eye Navy", (.025, .045, .1, 1), .15, .05); BLUSH = mat("Blush", (1, .46, .56, 1), .5)

def move(obj, collection):
    for group in list(obj.users_collection): group.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

def point(value): return (value[0], value[2], value[1])
def size(value): return (value[0], value[2], value[1])

def sphere(collection, name, location, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=point(location))
    obj = bpy.context.object; obj.name = name; obj.scale = size(scale); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for face in obj.data.polygons: face.use_smooth = True
    obj.data.materials.append(material); return move(obj, collection)

def cone(collection, name, location, scale, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=24, location=point(location), rotation=rotation)
    obj = bpy.context.object; obj.name = name; obj.scale = size(scale); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for face in obj.data.polygons: face.use_smooth = True
    obj.data.materials.append(material); return move(obj, collection)

def cube(collection, name, location, scale, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=point(location), rotation=rotation)
    obj = bpy.context.object; obj.name = name; obj.scale = size(scale); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new("Soft edges", "BEVEL"); bevel.width = .09; bevel.segments = 3
    obj.data.materials.append(material); return move(obj, collection)

def torus(collection, name, location, major, minor, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48, minor_segments=12, location=point(location), rotation=rotation)
    obj = bpy.context.object; obj.name = name; obj.data.materials.append(material)
    for face in obj.data.polygons: face.use_smooth = True
    return move(obj, collection)

def eye(collection, x, y, white, pupil):
    sphere(collection, "Eye", (x, y, .63), (.16, .18, .08), white)
    sphere(collection, "Pupil", (x, y, .72), (.066, .085, .035), pupil)

def base_creature(collection, body, belly):
    sphere(collection, "Body", (0, .82, 0), (.69, .82, .52), body)
    sphere(collection, "Belly", (0, .76, .43), (.42, .56, .10), belly)
    sphere(collection, "Head", (0, 1.8, .04), (.76, .67, .6), body)
    eye(collection, -.25, 1.88, WHITE, DARK); eye(collection, .25, 1.88, WHITE, DARK)
    sphere(collection, "Blush", (-.48, 1.65, .47), (.105, .052, .018), BLUSH); sphere(collection, "Blush", (.48, 1.65, .47), (.105, .052, .018), BLUSH)
    sphere(collection, "Foot", (-.3, .15, .08), (.25, .15, .3), body); sphere(collection, "Foot", (.3, .15, .08), (.25, .15, .3), body)
    sphere(collection, "Arm", (-.59, 1.08, .02), (.18, .38, .18), body); sphere(collection, "Arm", (.59, 1.08, .02), (.18, .38, .18), body)

def build(role, collection):
    _, primary, secondary = SPECS[role]; body = mat(role + " body", primary); accent = mat(role + " accent", secondary, .3); belly = mat(role + " belly", tuple(min(1, x + .26) for x in primary[:3]) + (1,), .38)
    base_creature(collection, body, belly)
    if role in ("research", "data"):
        cone(collection, "Cat ear", (-.43, 2.31, .03), (.25, .48, .2), accent, (0, 0, -.32)); cone(collection, "Cat ear", (.43, 2.31, .03), (.25, .48, .2), accent, (0, 0, .32)); torus(collection, "Research lens", (.39, 1.89, .74), .19, .035, accent, (math.pi / 2, 0, 0)); cube(collection, "Notebook", (.55, 1.04, .55), (.38, .25, .04), belly, (0, 0, -.16))
    elif role == "finance":
        cone(collection, "Deer ear", (-.48, 2.35, 0), (.24, .48, .19), accent, (0, 0, -.28)); cone(collection, "Deer ear", (.48, 2.35, 0), (.24, .48, .19), accent, (0, 0, .28));
        for side in (-1, 1): cone(collection, "Antler", (side * .35, 2.58, -.04), (.04, .38, .04), accent, (0, side * .25, side * -.3)); sphere(collection, "Antler tip", (side * .48, 2.83, -.04), (.075, .075, .075), accent)
        cube(collection, "Calculator", (.54, 1.04, .54), (.34, .23, .06), belly, (0, 0, -.14))
    elif role == "sales":
        cone(collection, "Fox ear", (-.47, 2.3, .02), (.27, .52, .21), DARK, (0, 0, -.32)); cone(collection, "Fox ear", (.47, 2.3, .02), (.27, .52, .21), DARK, (0, 0, .32)); torus(collection, "Fox tail", (-.78, .76, -.18), .48, .1, body, (math.pi / 2.7, .25, .2)); cube(collection, "Presentation case", (.56, .82, .28), (.36, .23, .1), belly, (0, 0, -.08))
    elif role == "engineering":
        for side in (-1, 1):
            for index in range(3): sphere(collection, "Axolotl gill", (side * (.7 + index * .08), 2.0 - index * .18, 0), (.14, .1, .08), accent)
        cube(collection, "Code slate", (.55, 1.04, .55), (.4, .25, .04), DARK, (0, 0, -.16))
    elif role == "operations":
        sphere(collection, "Shell", (0, 1.05, -.16), (.76, .65, .34), accent)
        for index in range(5): sphere(collection, "Shell tile", (math.cos(index * 1.25) * .36, 1.1 + math.sin(index * 1.25) * .18, .08), (.11, .11, .035), belly)
    elif role == "security":
        for index in range(7): cone(collection, "Hedgehog spike", (math.cos(index * .82) * .58, 1.25 + math.sin(index * .82) * .38, -.23), (.13, .36, .13), DARK, (math.pi / 2.6, 0, index * .82))
        torus(collection, "Shield", (.54, 1.1, .6), .2, .055, accent, (math.pi / 2, 0, 0))
    elif role == "marketing":
        cone(collection, "Beak", (0, 1.7, .65), (.19, .28, .2), accent, (math.pi / 2, 0, 0)); sphere(collection, "Wing", (-.81, 1.48, .02), (.39, .19, .31), body); sphere(collection, "Wing", (.81, 1.48, .02), (.39, .19, .31), body); cube(collection, "Creative brush", (.56, 1.07, .48), (.055, .35, .055), accent, (0, 0, -.55))
    elif role == "legal":
        cone(collection, "Owl ear", (-.42, 2.31, 0), (.24, .45, .19), DARK, (0, 0, -.25)); cone(collection, "Owl ear", (.42, 2.31, 0), (.24, .45, .19), DARK, (0, 0, .25)); sphere(collection, "Eye plate", (-.28, 1.86, .7), (.29, .29, .07), belly); sphere(collection, "Eye plate", (.28, 1.86, .7), (.29, .29, .07), belly); cone(collection, "Beak", (0, 1.65, .68), (.11, .18, .11), accent, (math.pi / 2, 0, 0)); cube(collection, "Policy folio", (.55, 1.04, .55), (.38, .25, .04), belly, (0, 0, -.14))
    elif role == "support":
        sphere(collection, "Penguin coat", (0, 1.39, .1), (.59, .88, .46), DARK); sphere(collection, "Penguin belly", (0, 1.45, .51), (.38, .64, .1), WHITE); torus(collection, "Headset", (0, 1.95, .02), .78, .05, accent, (math.pi / 2, 0, 0)); sphere(collection, "Headset mic", (.78, 1.72, .4), (.07, .07, .05), accent)
    elif role == "people":
        sphere(collection, "Rabbit ear", (-.33, 2.51, .01), (.19, .58, .16), belly); sphere(collection, "Rabbit ear", (.33, 2.51, .01), (.19, .58, .16), belly); sphere(collection, "Heart", (0, 1.57, .58), (.1, .08, .025), accent)
    elif role == "product":
        sphere(collection, "Otter ear", (-.55, 2.13, .01), (.17, .17, .12), accent); sphere(collection, "Otter ear", (.55, 2.13, .01), (.17, .17, .12), accent); cube(collection, "Roadmap tile", (.55, 1.04, .55), (.39, .25, .04), belly, (0, 0, -.16))
    elif role == "quality":
        sphere(collection, "Seal flipper", (-.64, 1.47, .02), (.23, .15, .2), accent); sphere(collection, "Seal flipper", (.64, 1.47, .02), (.23, .15, .2), accent); torus(collection, "Verification stamp", (.55, 1.04, .52), .13, .04, accent, (math.pi / 2, 0, 0))
    elif role == "orchestrator":
        torus(collection, "Coordination ring", (0, 2.05, -.08), 1.05, .04, accent, (math.pi / 2.6, 0, 0))
        for index in range(4):
            angle = index * math.pi / 2; sphere(collection, "Orbit mote", (math.cos(angle) * 1.0, 1.92 + math.sin(angle) * .32, .1), (.08, .08, .08), accent)
        cone(collection, "Conductor crest", (0, 2.5, -.04), (.28, .43, .22), accent)

def look_at(obj, point): obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def render_preview(collection, name, backdrop):
    for col in bpy.context.scene.collection.children:
        col.hide_render = col != collection
    scene = bpy.context.scene; scene.render.resolution_x = 512; scene.render.resolution_y = 512; scene.render.resolution_percentage = 100; scene.render.engine = 'BLENDER_EEVEE'; scene.render.image_settings.file_format = 'PNG'; scene.render.film_transparent = False
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value = tuple(min(1, c + .46) for c in backdrop[:3]) + (1,)
    background.inputs['Strength'].default_value = .35
    scene.render.filepath = os.path.join(PREVIEWS, name + '.png'); bpy.ops.render.render(write_still=True)

bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
for collection in list(scene.collection.children): scene.collection.children.unlink(collection)
# Creature faces point along Blender's positive Y axis.  Keep the studio in
# front of that axis so the rendered previews match the interactive site.
camera_data = bpy.data.cameras.new('Studio camera'); camera = bpy.data.objects.new('Studio camera', camera_data); scene.collection.objects.link(camera); scene.camera = camera; camera.location = (3.4, 5.4, 2.8); camera.data.lens = 62; look_at(camera, (0, 0, 1.25))
key_data = bpy.data.lights.new('Key', 'AREA'); key_data.energy = 860; key_data.shape = 'DISK'; key_data.size = 4; key = bpy.data.objects.new('Key', key_data); scene.collection.objects.link(key); key.location = (-4, 4, 6); look_at(key, (0, 0, 1.2))
fill_data = bpy.data.lights.new('Fill', 'AREA'); fill_data.energy = 420; fill_data.size = 5; fill = bpy.data.objects.new('Fill', fill_data); scene.collection.objects.link(fill); fill.location = (4, 1, 3); look_at(fill, (0, 0, 1.3))
floor_mat = mat('Studio floor', (.92, .94, .98, 1), .55); bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -.02)); floor = bpy.context.object; floor.name = 'Studio floor'; floor.data.materials.append(floor_mat)

collections = []
for role, (name, primary, secondary) in SPECS.items():
    collection = bpy.data.collections.new(name); scene.collection.children.link(collection); collections.append(collection); build(role, collection)
    for obj in collection.objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = next(iter(collection.objects)); bpy.ops.export_scene.gltf(filepath=os.path.join(MODELS, name + '.glb'), export_format='GLB', use_selection=True, export_materials='EXPORT')
    bpy.ops.object.select_all(action='DESELECT'); render_preview(collection, name, primary)

for col in collections: col.hide_render = False
scene.render.filepath = os.path.join(PREVIEWS, 'library-cover.png'); bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE, 'ai_pod_creature_library.blend'))
print('Generated', len(SPECS), 'AI Pod creature models')
