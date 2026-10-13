"""Procedural reconstruction of the reference's engineered intelligence sculpture.

Run with Blender 5.2: blender --background --python blender/scripts/create_company_brain.py
Editable curves are saved in the .blend before conversion for the website GLB.
"""
import bpy, math, os, random
from mathutils import Vector

rng=random.Random(2107)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"exports")
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name!="Collection": bpy.data.collections.remove(c)
root=bpy.context.scene.collection.children.get("Collection"); root.name="INTELLIGENCE_ENGINE"
def collection(name):
    c=bpy.data.collections.new(name); root.children.link(c); return c
C={n:collection(n) for n in ("Inner_Chassis","Mechanical_Lattice","Primary_Conduits","Micro_Architecture","Copper_Circuits","Intelligence_Core","Radial_Pins","Lower_Conduits","Translucent_Network","Signal_Animation","Studio_Lights","Camera")}

def material(name,rgb,metal=0,rough=.36,glow=None,power=0,alpha=1):
    m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,alpha);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*rgb,1)
    p.inputs["Metallic"].default_value=metal;p.inputs["Roughness"].default_value=rough
    p.inputs["Alpha"].default_value=alpha
    if glow:
        p.inputs["Emission Color"].default_value=(*glow,1)
        p.inputs["Emission Strength"].default_value=power
    if alpha<1:m.surface_render_method="DITHERED"
    return m
silver=material("Polished_Steel",(.44,.55,.59),.86,.23)
edge=material("Bright_Ridge",(.70,.77,.75),.78,.24)
gun=material("Gunmetal",(.14,.22,.25),.88,.31)
dark=material("Inner_Graphite",(.07,.12,.14),.8,.36)
bronze=material("Bronze",(.34,.17,.08),.88,.27)
copper=material("Copper",(.56,.23,.075),.84,.25)
amber=material("Amber_Trace",(.68,.19,.035),.45,.29,(1,.28,.035),1.8)
whitehot=material("White_Hot_Core",(1,.64,.22),.28,.16,(1,.48,.13),8)
cyan=material("Wireframe_Ice",(.24,.46,.54),.24,.51,None,0,.26)

def move(o,c):
    for old in list(o.users_collection):old.objects.unlink(o)
    c.objects.link(o);return o
def ball(name,point,radius,mat,c):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,radius=radius,location=point)
    o=move(bpy.context.object,c);o.name=name;o.data.materials.append(mat)
    for face in o.data.polygons:face.use_smooth=True
    return o
def tube(name,pts,radius,mat,c):
    d=bpy.data.curves.new(name,"CURVE");d.dimensions="3D";d.resolution_u=2;d.bevel_depth=radius;d.bevel_resolution=2
    sp=d.splines.new("BEZIER");sp.bezier_points.add(len(pts)-1)
    for b,p in zip(sp.bezier_points,pts):
        b.co=p;b.handle_left_type="AUTO";b.handle_right_type="AUTO"
    o=bpy.data.objects.new(name,d);c.objects.link(o);o.data.materials.append(mat);return o
def rod(name,a,b,radius,mat,c):
    a,b=Vector(a),Vector(b);axis=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=axis.length,location=(a+b)/2)
    o=move(bpy.context.object,c);o.name=name;o.rotation_euler=axis.to_track_quat("Z","Y").to_euler();o.data.materials.append(mat)
    for f in o.data.polygons:f.use_smooth=True
    return o
def torus(name,point,major,minor,mat,c):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=48,minor_segments=8,location=point,rotation=(math.pi/2,0,0))
    o=move(bpy.context.object,c);o.name=name;o.data.materials.append(mat)
    for f in o.data.polygons:f.use_smooth=True
    return o
def front(x,z,inset=0):
    q=(x/2.05)**2+((z-.12)/1.61)**2
    return -.28-1.42*math.sqrt(max(.075,1-q))+inset

# Open, layered chassis. No smooth solid hemispheres.
for j,z in enumerate((-.99,-.72,-.43,-.12,.19,.50,.80,1.08)):
    span=1.97*math.sqrt(max(.18,1-((z-.12)/1.65)**2))
    pts=[(x,front(x,z,.41),z+.025*math.sin(k*.7+j)) for k in range(31) for x in [-span+2*span*k/30]]
    tube("Chassis_Horizontal_%02d"%j,pts,.023,gun,C["Inner_Chassis"])
for j in range(20):
    a=j*math.tau/20
    pts=[(x,front(x,z,.46),z) for k in range(26) for r in [.12+1.72*k/25] for x,z in [(r*math.cos(a),.12+r*.76*math.sin(a))]]
    tube("Chassis_Spoke_%02d"%j,pts,.019,bronze if j%4==0 else dark,C["Inner_Chassis"])

# Small beveled pieces fill the interior and expose physical depth.
for i in range(154):
    a=rng.uniform(0,math.tau);r=math.sqrt(rng.random())*1.79
    x=r*math.cos(a);z=.12+r*.76*math.sin(a);y=front(x,z,.28+rng.uniform(.03,.22))
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    o=move(bpy.context.object,C["Mechanical_Lattice"]);o.name="Machined_Plate_%03d"%i
    o.dimensions=(rng.uniform(.10,.28),rng.uniform(.018,.045),rng.uniform(.06,.18));o.rotation_euler[1]=rng.uniform(-.6,.6)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bevel=o.modifiers.new("Radiused edge","BEVEL");bevel.width=.012;bevel.segments=2
    o.data.materials.append((gun,dark,bronze,silver)[i%4])
    if i%3==0:ball("Plate_Rivet_%03d"%i,(x,y-.035,z),.024,edge,C["Micro_Architecture"])

# Interwoven metal tendons: 78 broad ridges plus grooves and copper return wires.
for side in (-1,1):
    for row in range(13):
        z0=-1.13+row*.194
        for lane in range(3):
            phase=rng.uniform(-.4,.4)+row*.3;width=rng.uniform(.65,1.03);start=.13+rng.uniform(0,.13)
            pts=[]
            for k in range(19):
                t=k/18
                x=side*(start+width*t+lane*.058+.075*math.sin(t*math.tau*1.7+phase))
                z=z0+.10*math.sin(t*math.tau*2.2+phase)+.055*math.sin(t*math.tau*4.2+lane)
                if (x/2.05)**2+((z-.12)/1.61)**2>.88:continue
                pts.append((x,front(x,z,-.018-lane*.014),z))
            if len(pts)<4:continue
            name="Conduit_%s_%02d_%d"%("L" if side<0 else "R",row,lane)
            tube(name,pts,.073 if lane==0 else .047,silver if lane==0 else gun,C["Primary_Conduits"])
            if lane==0:
                tube(name+"_Bright_Groove",[(x,y-.065,z+.025) for x,y,z in pts],.011,edge,C["Micro_Architecture"])
                tube(name+"_Copper_Seam",[(x,y+.064,z-.028) for x,y,z in pts],.012,copper,C["Copper_Circuits"])
            elif row%2==0:
                tube(name+"_Inner_Trace",[(x,y+.05,z-.012) for x,y,z in pts],.009,bronze,C["Copper_Circuits"])

# Arched bridges cut across the horizontal flow.
for side in (-1,1):
    for j in range(18):
        cx=side*rng.uniform(.28,1.68);cz=rng.uniform(-1,1.12)
        rad=rng.uniform(.13,.27);bend=rng.uniform(.20,.48);pts=[]
        for k in range(11):
            t=k/10;x=cx+side*rad*math.sin(t*math.pi);z=cz+bend*(t-.5)+.055*math.sin(2*math.pi*t)
            if (x/2.05)**2+((z-.12)/1.61)**2>.87:continue
            pts.append((x,front(x,z,-.12),z))
        if len(pts)>4:
            tube("Cross_Bridge_%s_%02d"%(side,j),pts,rng.uniform(.055,.09),edge if j%5==0 else silver,C["Primary_Conduits"])
            for p in pts[2::4]:ball("Bridge_Coupler",(p[0],p[1]-.06,p[2]),.035,bronze,C["Micro_Architecture"])

# Interlaced crown members join the two sides into one continuous machine.
for j in range(8):
    z0=-.58+j*.248
    pts=[]
    for k in range(23):
        t=k/22;x=-.66+1.32*t+.044*math.sin(t*math.tau*1.7+j*.7)
        z=z0+.09*math.sin(t*math.tau*1.8+j*.65)
        pts.append((x,front(x,z,-.11),z))
    tube("Central_Crown_Fold_%02d"%j,pts,.055 if j%3 else .074,edge if j%4==0 else silver,C["Primary_Conduits"])
    if j%2==0:
        tube("Central_Crown_Copper_%02d"%j,[(x,y+.047,z-.015) for x,y,z in pts],.011,copper,C["Copper_Circuits"])
for j in range(7):
    base_x=-.58+j*.193
    pts=[]
    for k in range(15):
        t=k/14;z=.20+1.19*t
        x=base_x+.075*math.sin(t*math.tau*1.4+j*.72)
        pts.append((x,front(x,z,-.14),z))
    tube("Crown_Descending_Tendon_%02d"%j,pts,.082 if j%3==0 else .064,silver if j%2 else edge,C["Primary_Conduits"])
    tube("Crown_Descending_Groove_%02d"%j,[(x,y-.06,z) for x,y,z in pts],.009,gun,C["Micro_Architecture"])

for j in range(72):
    a=rng.uniform(0,math.tau);r=rng.uniform(.32,1.65)
    x=r*math.cos(a);z=.12+r*.75*math.sin(a);y=front(x,z,.16)
    end=(x+rng.uniform(-.18,.18),y-.04,z+rng.uniform(-.16,.16))
    tube("Copper_Microcircuit_%02d"%j,[(x,y,z),(x,y-.07,z+.06),end],.010,amber if j%8==0 else copper,C["Copper_Circuits"])
    if j%3==0:ball("Circuit_Node_%02d"%j,end,.034,copper,C["Micro_Architecture"])

# A curved lower mantle closes the rounded silhouette beneath the aperture.
for j in range(10):
    a0=math.pi*1.05+j*.095
    pts=[]
    for k in range(21):
        a=a0+k*.045
        x=1.54*math.cos(a)
        z=.10+1.47*math.sin(a)+.035*math.sin(k*.9+j)
        pts.append((x,front(x,z,-.04),z))
    tube("Lower_Mantle_Channel_%02d"%j,pts,.049 if j%3 else .067,silver if j%2 else gun,C["Primary_Conduits"])
    if j%2==0:
        tube("Lower_Mantle_Copper_%02d"%j,[(x,y+.05,z-.02) for x,y,z in pts],.01,copper,C["Copper_Circuits"])

# White-hot core is deliberately only about 6 percent of the total width.
for i,(rad,width,mat) in enumerate(((.29,.031,gun),(.256,.017,copper),(.215,.026,edge),(.157,.015,bronze))):
    torus("Core_Housing_Ring_%d"%i,(0,-1.99+.015*i,.08),rad,width,mat,C["Intelligence_Core"])
energy=ball("White_Hot_Energy_Centre",(0,-2.04,.08),.127,whitehot,C["Intelligence_Core"])
ball("Amber_Corona",(0,-1.88,.08),.16,amber,C["Intelligence_Core"])
for i in range(16):
    a=i*math.tau/16
    p=(.34*math.cos(a),-1.92,.08+.34*math.sin(a))
    q=(.47*math.cos(a),-1.82,.08+.47*math.sin(a))
    rod("Core_Radial_Contact_%02d"%i,p,q,.016,copper if i%2 else edge,C["Intelligence_Core"])
    ball("Core_Contact_Pin_%02d"%i,q,.026,bronze,C["Intelligence_Core"])

# 31 radially distributed probes along the upper and side perimeter.
pin_points=[];pin_rotations=[]
for i in range(31):
    a=math.radians(-20)+i*math.radians(220)/30
    base=Vector((2.04*math.cos(a),.05,.12+1.6*math.sin(a)))
    direction=Vector((math.cos(a),rng.uniform(-.2,.1),math.sin(a))).normalized()
    tip=base+direction*rng.uniform(.31,.53);pin_points.append(base)
    pin_rotations.append(direction.to_track_quat("Z","Y").to_euler())
    rod("Radial_Pin_Shaft_%02d"%i,base,tip,.024,silver,C["Radial_Pins"])
    ball("Radial_Pin_Ball_%02d"%i,tip,.079,edge,C["Radial_Pins"])
    ball("Radial_Pin_Socket_%02d"%i,base,.035,gun,C["Radial_Pins"])
    if i%4==0:ball("Radial_Pin_Signal_%02d"%i,tip+direction*.005,.026,amber,C["Signal_Animation"])
# The editable Geometry Nodes rig instances a complete pin at each radial point.
# Authored pin meshes remain the reliable export path for GLB compatibility.
proto_shaft=rod("Prototype_Shaft",(0,0,0),(0,0,.42),.024,silver,C["Radial_Pins"])
proto_tip=ball("Prototype_Tip",(0,0,.42),.079,edge,C["Radial_Pins"])
proto_socket=ball("Prototype_Socket",(0,0,0),.07,gun,C["Radial_Pins"])
bpy.ops.object.select_all(action="DESELECT")
for obj in (proto_shaft,proto_tip,proto_socket):obj.select_set(True)
bpy.context.view_layer.objects.active=proto_shaft;bpy.ops.object.join()
prototype=bpy.context.object;prototype.name="Radial_Pin_GN_Prototype";prototype.hide_render=True
mesh=bpy.data.meshes.new("Radial_Pin_Distribution_Vertices");mesh.from_pydata(pin_points,[],[]);mesh.update()
rotation_attr=mesh.attributes.new(name="pin_rotation",type="FLOAT_VECTOR",domain="POINT")
for i,rot in enumerate(pin_rotations):rotation_attr.data[i].vector=rot
emitter=bpy.data.objects.new("Radial_Pin_Geometry_Nodes_Emitter",mesh);C["Radial_Pins"].objects.link(emitter)
ng=bpy.data.node_groups.new("Radial_Pin_Distribution","GeometryNodeTree")
ng.interface.new_socket(name="Geometry",in_out="INPUT",socket_type="NodeSocketGeometry")
ng.interface.new_socket(name="Geometry",in_out="OUTPUT",socket_type="NodeSocketGeometry")
nodes=ng.nodes;links=ng.links
inp=nodes.new("NodeGroupInput");out=nodes.new("NodeGroupOutput")
points=nodes.new("GeometryNodeMeshToPoints");points.mode="VERTICES"
source=nodes.new("GeometryNodeObjectInfo");source.inputs["Object"].default_value=prototype;source.transform_space="ORIGINAL"
rotations=nodes.new("GeometryNodeInputNamedAttribute");rotations.data_type="FLOAT_VECTOR";rotations.inputs["Name"].default_value="pin_rotation"
instances=nodes.new("GeometryNodeInstanceOnPoints")
links.new(inp.outputs["Geometry"],points.inputs["Mesh"])
links.new(points.outputs["Points"],instances.inputs["Points"])
links.new(source.outputs["Geometry"],instances.inputs["Instance"])
links.new(rotations.outputs["Attribute"],instances.inputs["Rotation"])
links.new(instances.outputs["Instances"],out.inputs["Geometry"])
emitter.modifiers.new("Pin distribution authoring points","NODES").node_group=ng
emitter.hide_render=True

# Descending information conduits, each attached inside the sculptural body.
for i in range(10):
    x=-1.29+i*.286+rng.uniform(-.04,.04)
    top=-.84-rng.uniform(0,.32);bottom=-2.36-rng.uniform(0,.9);y=-.23+rng.uniform(-.18,.24)
    pts=[(x,front(x,top,.13),top),(x+rng.uniform(-.09,.09),y,top-.33),(x+rng.uniform(-.07,.07),y,bottom)]
    tube("Vertical_Data_Trunk_%02d"%i,pts,.032 if i%3 else .048,copper if i%3==0 else gun,C["Lower_Conduits"])
    if i%2==0:tube("Vertical_Energy_Filament_%02d"%i,[(x-.025,y-.015,top-.18),(x-.02,y-.02,bottom+.08)],.008,amber,C["Lower_Conduits"])
    for j in range(3):
        ball("Trunk_Collar_%02d_%d"%(i,j),(x,y,top-.3-j*.28),.045,edge,C["Micro_Architecture"])

# Translucent spatial mesh draped over the lower-right interior.
for row in range(15):
    v=row/14;pts=[]
    for k in range(21):
        u=k/20;pts.append((.18+1.55*u,-.52-.34*math.sin(u*math.pi)+.13*v,-.54-v*(1.08+.37*math.sin(u*math.pi))+.23*math.sin(u*math.pi)*v))
    tube("Network_Latitude_%02d"%row,pts,.006,cyan,C["Translucent_Network"])
for column in range(21):
    u=column/20;pts=[]
    for k in range(15):
        v=k/14;pts.append((.18+1.55*u,-.52-.34*math.sin(u*math.pi)+.13*v,-.54-v*(1.08+.37*math.sin(u*math.pi))+.23*math.sin(u*math.pi)*v))
    tube("Network_Meridian_%02d"%column,pts,.005,cyan,C["Translucent_Network"])

# 15-second loop: contained core pulse and sequential travelling signals.
for i in range(12):
    a=i*math.tau/12;r=.40+rng.uniform(0,.6);x=r*math.cos(a);z=.08+r*.78*math.sin(a)
    p=ball("Travelling_Signal_%02d"%i,(0,-1.93,.08),.028,amber,C["Signal_Animation"])
    base=1+i*23
    for frame,loc,scale in ((1,(0,-1.93,.08),.01),(base,(0,-1.93,.08),.01),(base+30,(x*.6,front(x*.6,z*.6,-.18),z*.6),1),(base+60,(x,front(x,z,-.18),z),.65),(base+80,(x,front(x,z,-.18),z),.01),(360,(0,-1.93,.08),.01)):
        p.location=loc;p.scale=(scale,)*3;p.keyframe_insert("location",frame=min(frame,360));p.keyframe_insert("scale",frame=min(frame,360))
for frame,scale in ((1,1),(90,1.055),(180,1),(270,1.045),(360,1)):
    energy.scale=(scale,)*3;energy.keyframe_insert("scale",frame=frame)

def lamp(name,kind,location,strength,color,size=4):
    d=bpy.data.lights.new(name,kind);d.energy=strength;d.color=color
    if kind=="AREA":d.shape="DISK";d.size=size
    o=bpy.data.objects.new(name,d);C["Studio_Lights"].objects.link(o);o.location=location
    o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat("-Z","Y").to_euler()
lamp("Large_Cool_Softbox","AREA",(-4,-6,5),1060,(.75,.86,1),5)
lamp("Silver_Rim","AREA",(4,2,3),820,(.52,.75,1),4)
lamp("Lower_Reflector","AREA",(1,-5,-2),290,(.72,.79,.83),4)
lamp("Copper_Interior","POINT",(0,-2.14,.08),260,(1,.34,.07),1)
cam_data=bpy.data.cameras.new("Studio_Camera");cam=bpy.data.objects.new("Studio_Camera",cam_data)
C["Camera"].objects.link(cam);bpy.context.scene.camera=cam;cam_data.lens=48
for f,p in ((1,(.23,-10.9,.92)),(180,(.43,-10.73,.99)),(360,(.23,-10.9,.92))):
    cam.location=p;cam.rotation_euler=(Vector((0,0,-.25))-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.keyframe_insert("location",frame=f);cam.keyframe_insert("rotation_euler",frame=f)
scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=360;scene.render.fps=24
scene.render.engine="BLENDER_EEVEE";scene.render.resolution_x=1280;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG";scene.render.image_settings.color_mode="RGBA";scene.render.film_transparent=True
scene.world.color=(.003,.009,.014);scene.view_settings.look="AgX - Medium High Contrast"
scene.frame_set(206);scene.render.filepath=os.path.join(OUT,"company_brain_preview.png")
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,"company_brain_master.blend"))
# Authoring-only Geometry Nodes controls are preserved in the BLEND.
for obj in (emitter,prototype):bpy.data.objects.remove(obj,do_unlink=True)
for obj in list(bpy.data.objects):
    if obj.type!="CURVE":continue
    bpy.ops.object.select_all(action="DESELECT");obj.select_set(True);bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target="MESH")
# Export static parts in material batches to keep realtime draw calls low.
static={}
for obj in list(bpy.data.objects):
    if obj.type!="MESH" or obj.animation_data:continue
    bpy.ops.object.select_all(action="DESELECT");obj.select_set(True);bpy.context.view_layer.objects.active=obj
    if obj.modifiers:bpy.ops.object.convert(target="MESH")
    name=obj.data.materials[0].name if obj.data.materials else "untextured"
    static.setdefault(name,[]).append(obj)
for name,objects in static.items():
    if len(objects)<2:continue
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    objects[0].name="Realtime_Batch_"+name
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,"company_brain.glb"),export_format="GLB",export_animations=True,export_apply=True,export_yup=True,export_lights=False,export_cameras=False)
print("INTELLIGENCE_ENGINE_COMPLETE")
