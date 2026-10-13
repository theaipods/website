"""Normalize the intelligence-engine animation in Blender 5.2."""
import bpy

scene=bpy.context.scene
scene.frame_start=1
scene.frame_end=360
scene.render.fps=24
for action in bpy.data.actions:
    curves=[]
    if hasattr(action,"fcurves"):
        curves.extend(action.fcurves)
    for layer in action.layers:
        for strip in layer.strips:
            for channelbag in strip.channelbags:
                curves.extend(channelbag.fcurves)
    for curve in curves:
        for point in curve.keyframe_points:
            point.interpolation="BEZIER"
print("Intelligence engine animation normalized to a 15-second loop.")
