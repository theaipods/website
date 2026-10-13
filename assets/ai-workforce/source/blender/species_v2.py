"""Role-specific creature geometry for the AI Pod workforce collection.

Coordinates are shared across all roles: -Y faces the camera, Z is up.
Every visible component is geometry, including eyes, expressions and props.
"""
import math
import bpy


def build_species(kind, p, slug):
    from __main__ import ell, tube, ring, cone, cylinder, bevel_box

    skin, light, shade, accent = p["gradient"], p["light"], p["shade"], p["accent"]
    ivory, ink, blush, gold = p["ivory"], p["ink"], p["blush"], p["gold"]

    def e(name, xyz, scale, material=skin, rotation=None):
        return ell(name, xyz, scale, material, rotation)

    def plate(name, outline, material, depth=.10, y=.18):
        """Bevelled silhouette mesh in the X/Z plane, with real front and side faces."""
        n=len(outline)
        vertices=[(x,y,z) for x,z in outline]+[(x,y+depth,z) for x,z in outline]
        faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
        faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        mesh=bpy.data.meshes.new(name+" mesh")
        mesh.from_pydata(vertices,[],faces)
        mesh.update()
        obj=bpy.data.objects.new(name,mesh)
        bpy.context.collection.objects.link(obj)
        obj.data.materials.append(material)
        bevel=obj.modifiers.new("Polished rounded silhouette","BEVEL")
        bevel.width=min(.065,depth*.45)
        bevel.segments=4
        obj.modifiers.new("Weighted studio normals","WEIGHTED_NORMAL")
        return obj

    def eyes(z, y=-.52, spread=.29, radius=.16, iris=ink, tall=1.15, whites=True, lashes=False):
        for s in (-1, 1):
            x=s*spread
            if whites:
                e("Sclera %s" % s, (x,y,z), (radius*1.17,.078,radius*tall*1.20), ivory)
            e("Glass iris %s" % s,(x,y-.075,z+.004),(radius*.83,.062,radius*tall),iris)
            e("Eye catchlight %s" % s,(x-.046,y-.139,z+.068),(.049,.012,.058),ivory)
            e("Second eye glint %s" % s,(x+.047,y-.14,z-.047),(.015,.009,.017),ivory)
            if lashes:
                for j in range(2):
                    tube("Tiny lashes", [(x+s*(.085+j*.05),y-.025,z+radius*.9),
                                         (x+s*(.12+j*.05),y-.02,z+radius*1.23)],.014,shade)

    def smile(y,z,width=.16):
        tube("Curved smile",[(-width,y,z), (0,y-.035,z-.055), (width,y,z)],.012,shade)

    def cheek(y,z,wide=.53):
        for s in (-1,1):
            e("Soft cheek",(s*wide,y,z),(.12,.042,.065),blush)

    def paw(x,z,scale=.20,material=skin,y=-.47):
        e("Posed paw",(x,y,z),(scale,.22,scale*.78),material)

    def feet(spread=.38,z=.25,scale=.28,material=skin):
        for s in (-1,1):
            e("Grounded foot",(s*spread,-.22,z),(scale,.33,.18),material)

    def ears_pair(z=2.70,width=.57,height=.53,round=False,inner=blush,back=.02):
        for s in (-1,1):
            if round:
                e("Round ear",(s*width,back,z),(.23,.15,.22),skin)
                e("Inner ear",(s*width,back-.14,z),(.14,.026,.13),inner)
            else:
                e("Long tapered ear",(s*width,back,z),(.20,.14,height),skin,
                  (0,s*.08,-s*.18))
                e("Pink ear lining",(s*width,back-.13,z+.015),(.11,.033,height*.72),inner,
                  (0,s*.08,-s*.18))

    def snout(z=1.95, length=.28, nose_material=shade):
        e("Forward muzzle",(0,-.62,z),(.31,length,.20),light)
        e("Little nose",(0,-.82,z+.02),(.08,.055,.064),nose_material)
        smile(-.82,z-.115,.12)

    def fox_body():
        # A seated fox with a pointed muzzle and huge sweeping tail, not a biped.
        variant = "product" if "product-manager" in slug else "security" if "security" in slug else "research" if "research" in slug else "sales"
        e("Sitting fox haunch",(0,.24,.83),(.61,.57,.70),skin)
        e("Fox chest ruff",(0,-.31,1.13),(.41,.23,.58),ivory)
        e("Fox neck",(0,-.03,1.54),(.42,.38,.37),skin)
        e("Pointed fox head",(0,-.15,2.11),(.66,.52,.53),skin)
        for s in (-1,1):
            cone("Tall fox ear",(s*.45,-.05,2.68),.29,.78,skin,(0,s*.17,-s*.18),vertices=5)
            cone("Fox ear inset",(s*.45,-.28,2.65),.15,.53,blush,(0,s*.17,-s*.18),vertices=5)
            e("Fox muzzle pad",(s*.13,-.64,1.94),(.20,.18,.16),ivory)
        eyes(2.22,-.56,.27,.17,tall=1.15,lashes=variant=="product")
        e("Fox nose",(0,-.83,1.98),(.075,.055,.058),shade)
        smile(-.81,1.84)
        cheek(-.54,1.92,.45)
        feet(.38,.25,.27,shade)
        for s in (-1,1): paw(s*.43,1.02,.17,skin,-.53)
        # Fox tail sits to the side with a colored tip; distinct curve and scale per role.
        side=-1 if variant in ("sales","research") else 1
        x=side*1.02
        e("Oversized fox tail",(x,.38,1.06),(.47,.35,.81),skin,(0,0,-side*.55))
        e("Contrasting tail tip",(side*1.32,.29,1.56),(.30,.25,.31),light,(0,0,-side*.5))
        for i in range(3):
            e("Fox ruff point",((i-1)*.20,-.46,1.39),(.12,.13,.28),ivory,
              (0,0,(i-1)*.16))
        if variant=="research":
            for s in (-1,1): ring("Research spectacles",(s*.27,-.65,2.22),.25,.027,shade,(math.pi/2,0,0))
            tube("Spectacle bridge",[(-.05,-.67,2.23),(.05,-.67,2.23)],.022,shade)
        if variant=="security":
            e("Protective forehead stripe",(0,-.58,2.49),(.29,.035,.075),accent)
        if variant=="product":
            for s in (-1,1): e("Inventor cheek fluff",(s*.57,-.27,1.93),(.18,.14,.20),light)

    def cat_body():
        dark="redaction" in slug
        e("Seated cat body",(0,.18,.88),(.55,.53,.66),skin)
        e("Cat bib",(0,-.28,1.00),(.33,.22,.47),light)
        e("Rounded cat head",(0,-.11,2.02),(.64,.49,.55),skin)
        for s in (-1,1):
            cone("Cat ear",(s*.46,-.01,2.63),.27,.63,skin,(0,s*.08,-s*.20),vertices=5)
            cone("Cat inner ear",(s*.45,-.18,2.62),.14,.40,blush,(0,s*.08,-s*.20),vertices=5)
            e("Cat whisker pad",(s*.13,-.57,1.85),(.19,.12,.14),light)
            for j in (-1,1): tube("Fine cat whisker",[(s*.23,-.65,1.85+j*.045),
                    (s*.59,-.61,1.81+j*.08)],.009,light)
        eyes(2.13,-.53,.25,.17,iris=accent if dark else ink)
        e("Triangular cat nose",(0,-.72,1.91),(.07,.046,.055),blush)
        smile(-.70,1.78,.12)
        feet(.33,.27,.25,shade)
        for s in (-1,1): paw(s*.45,.93,.15,skin,-.45)
        tube("Curled cat tail",[(-.47,.31,.65),(-.95,.33,.52),(-1.18,.31,1.04),
                                (-1.02,.29,1.54)],.16,skin)
        e("Tail tuft",(-1.02,.29,1.55),(.18,.18,.25),light)
        if dark:
            e("Midnight forehead crest",(0,-.46,2.42),(.30,.07,.12),shade)

    def bird_body(phoenix=False):
        e("Pear-shaped bird",(0,.05,1.15),(.57,.50,.80),skin)
        e("Feathered breast",(0,-.38,1.12),(.34,.16,.51),light)
        e("Bird head",(0,-.11,2.16),(.57,.48,.52),skin)
        eyes(2.22,-.54,.25,.15,tall=1.13,lashes=not phoenix)
        cone("Shaped beak",(0,-.65,1.99),.16,.31,gold if phoenix else accent,
             (math.pi/2,0,0),vertices=6)
        cheek(-.47,1.91,.42)
        for s in (-1,1):
            if phoenix:
                outline=[(.42,1.36),(.76,1.10),(1.18,1.27),(1.51,1.62),
                         (1.66,2.12),(1.42,1.96),(1.32,2.63),
                         (1.05,2.30),(.83,2.73),(.65,2.15)]
                plate("Flame-shaped flight wing",[(s*x,z) for x,z in outline],accent,.13,.23)
                for i in range(5):
                    x=s*(.77+i*.15)
                    z=1.55+i*.17
                    e("Gold feather tip",(x,-.03,z),(.15,.055,.37),gold,
                      (0,0,-s*(.35+i*.15)))
            else:
                outline=[(.45,1.23),(.79,1.01),(1.26,1.20),(1.37,1.45),
                         (1.19,1.81),(.93,2.04),(.55,1.82)]
                plate("Layered bird wing",[(s*x,z) for x,z in outline],accent,.12,.20)
                for i in range(3):
                    e("Soft feather edge",(s*(.84+i*.18),-.02,1.22+i*.12),
                      (.12,.055,.28),light,(0,0,-s*.50))
            e("Three-toed bird foot",(s*.30,-.20,.23),(.24,.28,.12),gold if phoenix else shade)
            for j in range(3):
                e("Toe",(s*.30+(j-1)*.11,-.42,.17),(.07,.16,.06),gold if phoenix else shade)
        for i in range(4 if phoenix else 3):
            e("Flame crest" if phoenix else "Soft crest",((i-1.5)*.15,-.01,2.66+i%2*.09),
              (.12,.10,.35 if phoenix else .24),gold if phoenix and i%2 else accent,
              (0,0,(i-1.5)*.17))
        for s in (-1,1):
            for i in range(3 if phoenix else 2):
                e("Radiant tail plume",(s*(.30+i*.15),.47,.75+i*.22),
                  (.15,.16,.62 if phoenix else .38),gold if phoenix and i%2 else accent,
                  (0,0,s*.39))

    def whale_body(narwhal=False):
        e("Long swimming marine body",(0,.15,1.27),(1.10,.56,.59),skin)
        e("Whale jaw and pale belly",(0,-.42,1.02),(.82,.18,.34),ivory)
        e("Broad whale snout",(0,-.40,1.33),(.79,.20,.28),light)
        for s in (-1,1):
            e("Outstretched flipper",(s*.89,-.14,.96),(.42,.15,.19),shade,(0,0,s*.33))
            e("Tail fluke",(s*1.33,.48,1.25),(.39,.20,.18),shade,(0,0,s*.30))
            e("Animated whale eye",(s*.44,-.55,1.47),(.16,.068,.18),ink)
            e("Whale eye shine",(s*.44-.046,-.61,1.52),(.045,.01,.055),ivory)
            for j in range(2):
                e("Breath bubble",(s*(.84+j*.24),.0,2.11+j*.33),(.11-j*.02,)*3,light)
        smile(-.61,1.17,.17)
        e("Whale fin",(0,.39,1.68),(.18,.15,.34),accent,(0,.30,0))
        if narwhal:
            cone("Twisted narwhal horn",(.20,-.36,2.07),.17,1.03,ivory,(-.30,-.16,0))
            for j in range(5):
                ring("Horn spiral band",(.20,-.36,1.67+j*.14),.12-j*.013,.016,accent)

    def owl_body():
        audit="audit" in slug
        e("Plump owl body",(0,.08,1.24),(.64,.48,.84),skin)
        e("Layered feather belly",(0,-.40,1.18),(.39,.15,.56),light)
        e("Broad owl head",(0,-.08,2.22),(.67,.46,.55),skin)
        for s in (-1,1):
            e("Owl facial disc",(s*.28,-.44,2.28),(.32,.09,.34),light)
            cone("Feathered brow ear",(s*.48,-.02,2.73),.21,.48,shade,
                 (0,s*.16,-s*.29))
            e("Folded owl wing",(s*.62,.08,1.31),(.25,.23,.58),shade,(0,0,-s*.18))
            for j in range(3):
                e("Owl wing feather",(s*(.72+j*.04),-.05,1.17-j*.17),
                  (.10,.10,.24),accent)
        eyes(2.28,-.56,.28,.18,tall=1.0)
        cone("Owl beak",(0,-.64,2.03),.12,.23,gold,(math.pi/2,0,0))
        feet(.30,.39,.22,gold)
        for s in (-1,1):
            for j in range(3): e("Owl toe",(s*.31+(j-1)*.11,-.44,.16),(.06,.14,.05),gold)
        if audit:
            for s in (-1,1):
                e("Auditor head plume",(s*.37,.09,2.75),(.17,.15,.29),light,
                  (0,0,-s*.32))

    def squirrel_body():
        finance="finance" in slug
        e("Squirrel haunch",(0,.18,.84),(.59,.55,.65),skin)
        e("Squirrel breast",(0,-.33,1.07),(.37,.18,.50),ivory)
        e("Squirrel head",(0,-.11,2.03),(.61,.48,.54),skin)
        ears_pair(2.62,.47,.31,True)
        eyes(2.15,-.55,.25,.16)
        for s in (-1,1):
            e("Puffy squirrel cheek",(s*.30,-.51,1.88),(.24,.17,.20),light)
            paw(s*.37,1.08,.17,skin,-.58)
        e("Squirrel nose",(0,-.73,1.94),(.07,.05,.055),blush)
        smile(-.70,1.80,.12)
        feet(.32,.24,.25,shade)
        tube("Tall curling squirrel tail",[(-.48,.33,.65),(-1.06,.38,.54),
             (-1.38,.38,1.16),(-1.10,.34,1.91),(-.80,.30,1.83)],.25,skin)
        e("Luxurious tail plume",(-1.18,.34,1.53),(.37,.28,.59),skin,(0,0,-.22))
        e("Pale tail tip",(-.86,.28,1.94),(.19,.16,.21),light)
        if finance:
            for j in range(3):
                e("Gold cheek accent",(-.34+j*.11,-.57,1.76),(.025,.02,.035),gold)

    def rabbit_body():
        social="social" in slug
        e("Compact rabbit torso",(0,.10,.91),(.57,.50,.67),skin)
        e("Rabbit head",(0,-.15,1.95),(.58,.47,.52),skin)
        for s in (-1,1):
            angle=(.21 if social else .11)*s
            e("Tall leaflike rabbit ear",(s*.35,.02,2.78),(.20,.12,.66),skin,(0,0,angle))
            e("Ear lining",(s*.35,-.10,2.78),(.10,.025,.50),blush,(0,0,angle))
        eyes(2.06,-.58,.24,.17,tall=1.09)
        e("Rabbit nose",(0,-.68,1.83),(.07,.045,.055),blush)
        smile(-.68,1.71,.11)
        cheek(-.51,1.78,.44)
        feet(.36,.23,.26,light)
        for s in (-1,1): paw(s*.47,.97,.15,skin,-.43)
        e("Cotton rabbit tail",(-.55,.40,.70),(.25,.23,.26),ivory)
        if social:
            e("Social sprig leaf",(.66,-.38,1.38),(.18,.06,.30),accent,(0,0,-.42))

    def deer_body():
        hr="hr" in slug
        e("Deer haunch",(0,.17,.97),(.48,.46,.65),skin)
        e("Deer chest",(0,-.28,1.23),(.31,.20,.52),light)
        e("Slender deer neck",(0,-.03,1.72),(.29,.31,.45),skin)
        e("Sweet deer head",(0,-.18,2.30),(.56,.45,.47),skin)
        e("Long deer muzzle",(0,-.57,2.12),(.25,.21,.20),light)
        e("Deer nose",(0,-.76,2.14),(.075,.052,.060),shade)
        eyes(2.39,-.56,.24,.15,lashes=hr)
        cheek(-.50,2.08,.43)
        for s in (-1,1):
            e("Deer leaf ear",(s*.57,-.01,2.48),(.33,.12,.19),skin,(0,0,s*.18))
            e("Deer ear lining",(s*.57,-.12,2.48),(.23,.027,.12),blush,(0,0,s*.18))
            tube("Branching antler",[(s*.26,.05,2.66),(s*.40,.06,3.02),
                  (s*.58,.05,3.25)],.044,gold if hr else light)
            tube("Antler tine",[(s*.39,.06,3.00),(s*.68,.04,3.04)],.034,gold if hr else light)
            if hr:
                e("Heart antler lobe",(s*.69,.02,3.12),(.12,.08,.13),accent)
            e("Deer foreleg",(s*.30,-.23,.56),(.14,.19,.40),skin)
            e("Cloven hoof",(s*.30,-.29,.20),(.20,.25,.12),shade)
        e("Small deer tail",(-.47,.38,.93),(.18,.20,.16),light)
        smile(-.75,2.00,.10)

    def bear_body():
        e("Sturdy bear body",(0,.20,.98),(.68,.58,.73),skin)
        e("Bear chest",(0,-.34,1.05),(.43,.22,.52),ivory)
        e("Bear head",(0,-.10,2.10),(.70,.53,.58),skin)
        ears_pair(2.62,.53,.24,True)
        e("Bear muzzle",(0,-.60,1.92),(.31,.20,.23),light)
        eyes(2.24,-.57,.28,.16)
        e("Bear nose",(0,-.79,1.97),(.10,.07,.07),shade)
        smile(-.79,1.81,.12)
        for s in (-1,1):
            e("Chunky bear arm",(s*.61,-.22,1.12),(.27,.29,.39),skin)
            paw(s*.62,.82,.25,shade,-.46)
        feet(.43,.23,.32,shade)
        for i in range(4):
            e("Fluffy bear back ruff",(-.60+i*.38,.47,1.48),(.24,.26,.26),light)

    def turtle_body():
        e("Upright domed shell",(0,.30,1.20),(.74,.51,.85),shade)
        e("Hex-plated shell surface",(0,.67,1.27),(.60,.24,.67),skin)
        for i in range(7):
            a=math.tau*i/7
            e("Raised shell scute",(.43*math.cos(a),.77,1.28+.43*math.sin(a)),
              (.17,.055,.17),accent)
        e("Pale front plastron",(0,-.34,1.12),(.43,.20,.66),light)
        e("Short turtle neck",(0,-.32,1.69),(.38,.34,.37),skin)
        e("Friendly turtle head",(0,-.40,2.05),(.57,.44,.48),skin)
        eyes(2.15,-.78,.24,.17,whites=False)
        e("Turtle beak",(0,-.84,1.92),(.18,.12,.12),light)
        smile(-.93,1.80,.11)
        for s in (-1,1):
            e("Turtle hand",(s*.57,-.42,1.22),(.20,.23,.25),skin)
            e("Turtle planted foot",(s*.51,-.33,.32),(.30,.30,.22),skin)
            e("Turtle cheek",(s*.44,-.75,1.86),(.12,.04,.07),blush)

    def unicorn_body():
        e("Horse torso",(0,.21,1.02),(.60,.51,.65),skin)
        e("Arched unicorn neck",(0,-.16,1.57),(.37,.32,.57),skin,(.08,0,0))
        e("Long unicorn head",(0,-.26,2.19),(.54,.44,.55),skin)
        e("Horse muzzle",(0,-.59,1.92),(.31,.23,.23),light)
        eyes(2.30,-.56,.25,.16,tall=1.0,lashes=True)
        e("Unicorn nose",(0,-.78,1.96),(.09,.055,.06),shade)
        ears_pair(2.67,.43,.35,False)
        cone("Unicorn horn",(0,-.25,2.88),.15,.83,gold,(-.17,0,0))
        for i in range(6):
            e("Flowing mane curl",(-.57+i*.13,.08,2.49-i*.18),
              (.16,.19,.29),accent if i%2 else light,(0,0,-.24))
        for s in (-1,1):
            e("Elegant foreleg",(s*.36,-.21,.62),(.18,.23,.43),skin)
            e("Glossy hoof",(s*.36,-.29,.20),(.23,.26,.12),shade)
        tube("Flowing unicorn tail",[(-.55,.36,.88),(-1.01,.45,.75),
             (-1.16,.48,1.34)],.17,accent)

    def butterfly_body():
        e("Butterfly thorax",(0,.03,1.45),(.35,.33,.66),skin)
        e("Butterfly face",(0,-.16,2.25),(.49,.41,.48),skin)
        eyes(2.31,-.53,.21,.14,tall=1.20)
        e("Butterfly nose",(0,-.58,2.07),(.055,.05,.05),blush)
        smile(-.57,1.98,.10)
        for s in (-1,1):
            # Four sculpted, veined wings dominate the silhouette, like the reference.
            upper=[(.24,2.22),(.52,2.84),(1.11,3.18),(1.55,3.08),
                   (1.69,2.75),(1.53,2.29),(1.04,1.74),(.35,1.77)]
            lower=[(.28,1.75),(.87,1.66),(1.46,1.30),(1.55,.93),
                   (1.26,.66),(.73,.75),(.30,1.22)]
            plate("Expansive upper wing",[(s*x,z) for x,z in upper],accent,.11,.34)
            plate("Iridescent lower wing",[(s*x,z) for x,z in lower],shade,.10,.34)
            upper_inset=[(.45,2.22),(.64,2.72),(1.13,3.00),(1.46,2.90),
                         (1.43,2.56),(1.02,1.96),(.47,1.90)]
            lower_inset=[(.42,1.67),(.86,1.53),(1.33,1.25),(1.39,.97),
                         (1.16,.79),(.73,.91),(.43,1.25)]
            plate("Upper wing color panel",[(s*x,z) for x,z in upper_inset],light,.06,.19)
            plate("Lower wing color panel",[(s*x,z) for x,z in lower_inset],accent,.06,.18)
            for tip in ((1.10,2.99),(1.47,2.71),(1.26,1.07)):
                e("Pearlescent wing eye spot",(s*tip[0],-.035,tip[1]),
                  (.10,.024,.12),ivory)
            for endpoint in ((1.13,2.96),(1.46,2.72),(1.25,1.08)):
                tube("Fine raised wing vein",[(s*.38,-.06,1.79),
                     (s*endpoint[0],-.07,endpoint[1])],.012,shade)
            for j in range(3):
                e("Wing eye spot",(s*(.69+j*.20),-.03,2.23-j*.19),
                  (.09,.025,.11),ivory)
            tube("Butterfly antenna",[(s*.16,-.06,2.57),(s*.28,-.03,2.88)],.023,shade)
            e("Antenna tip",(s*.28,-.03,2.89),(.06,.06,.06),accent)
            e("Butterfly slipper",(s*.25,-.18,.64),(.18,.22,.15),skin)

    def dragon_body():
        e("Dragon haunch",(0,.23,.91),(.67,.55,.70),skin)
        e("Dragon segmented belly",(0,-.34,1.06),(.38,.18,.55),light)
        e("Dragon head",(0,-.17,2.11),(.66,.51,.57),skin)
        e("Long reptile snout",(0,-.65,1.91),(.37,.24,.22),skin)
        eyes(2.23,-.58,.27,.17,iris=shade)
        e("Dragon nostril left",(-.16,-.89,1.97),(.035,.015,.027),shade)
        e("Dragon nostril right",(.16,-.89,1.97),(.035,.015,.027),shade)
        smile(-.87,1.81,.16)
        for s in (-1,1):
            cone("Dragon horn",(s*.43,-.03,2.71),.16,.46,gold,(0,s*.20,-s*.15))
            e("Dragon wing",(s*.87,.33,1.59),(.44,.10,.66),accent,
              (0,s*.10,-s*.25))
            for j in range(3):
                e("Dragon wing scallop",(s*(.81+j*.19),.30,1.36+j*.20),
                  (.18,.08,.30),light)
            paw(s*.56,1.06,.18,skin,-.50)
        feet(.42,.23,.29,shade)
        tube("S-curled dragon tail",[(-.49,.40,.72),(-1.00,.43,.49),
             (-1.31,.39,.84),(-1.20,.36,1.27)],.19,skin)
        for i in range(5):
            cone("Back spine",(0,.50,.77+i*.33),.11,.27,accent,
                 (math.pi/2,0,0))

    def sheep_body():
        e("Sheep wool core",(0,.16,1.10),(.67,.52,.67),ivory)
        for i in range(14):
            a=math.tau*i/14
            e("Soft wool curl",(.62*math.cos(a),.20,1.14+.61*math.sin(a)),
              (.24,.23,.24),ivory)
        e("Pink sheep face",(0,-.39,2.00),(.49,.38,.48),skin)
        eyes(2.08,-.71,.20,.14)
        e("Sheep muzzle",(0,-.72,1.85),(.21,.12,.15),light)
        e("Sheep nose",(0,-.84,1.88),(.055,.04,.05),shade)
        for s in (-1,1):
            e("Sheep leaf ear",(s*.50,-.31,2.14),(.26,.11,.15),skin)
            e("Small hoof",(s*.40,-.20,.24),(.22,.27,.15),shade)
        for i in range(5):
            e("Wool crown",(-.43+i*.21,-.28,2.40+i%2*.06),(.20,.20,.20),ivory)

    def cloud_body():
        for x,z,r in [(-.72,1.14,.48),(-.32,1.55,.57),(.30,1.57,.59),
                      (.81,1.15,.48),(0,1.11,.67)]:
            e("Cloud vapor lobe",(x,.04,z),(r,r*.75,r),skin)
        e("Pale cloud lower edge",(0,-.36,.88),(.70,.16,.26),light)
        eyes(1.31,-.52,.31,.18,whites=False)
        smile(-.65,1.04,.15)
        cheek(-.49,1.08,.61)
        for s in (-1,1):
            e("Cloud puff hand",(s*.89,-.34,.89),(.23,.25,.22),light)

    def octopus_body():
        e("Octopus dome",(0,.04,1.87),(.69,.52,.72),skin)
        e("Octopus pale face",(0,-.40,1.70),(.39,.16,.34),light)
        eyes(2.02,-.50,.27,.17)
        e("Octopus beak",(0,-.61,1.67),(.06,.04,.055),shade)
        smile(-.61,1.56,.11)
        for i in range(8):
            a=math.tau*i/8
            x=math.cos(a); y=math.sin(a)
            tube("Independent curling arm %d" % i,
                 [(x*.34,y*.28,1.31),(x*.68,y*.44,.73),
                  (x*1.10,y*.49,.46),(x*1.21,y*.43,.72)],.14,
                 accent if i%3==0 else skin)
            for j in range(3):
                e("Suction cup",(x*(.71+j*.14),y*(.45+j*.03)-.09,.64-j*.03),
                  (.035,.020,.035),light)
        for s in (-1,1):
            ring("Engineer goggles",(s*.26,-.56,2.03),.25,.042,shade,(math.pi/2,0,0))
        tube("Goggle bridge",[(-.04,-.56,2.04),(.04,-.56,2.04)],.03,shade)

    def sprout_body():
        e("Leaf creature torso",(0,.07,1.03),(.56,.50,.72),skin)
        e("Sprout face",(0,-.13,2.00),(.53,.47,.50),skin)
        eyes(2.10,-.56,.23,.15,tall=1.10)
        e("Sprout nose",(0,-.64,1.86),(.06,.05,.05),shade)
        smile(-.62,1.75,.11)
        for s in (-1,1):
            tube("Living leaf stem",[(s*.17,.04,2.44),(s*.39,.02,2.78),
                 (s*.60,.02,3.03)],.045,shade)
            leaf=[(.16,2.52),(.49,2.63),(.89,3.21),(.73,3.44),
                  (.34,3.19),(.14,2.82)]
            plate("Living pointed leaf",[(s*x,z) for x,z in leaf],accent,.09,.03)
            tube("Leaf vein",[(s*.22,-.09,2.62),(s*.53,-.10,3.15),
                 (s*.74,-.09,3.32)],.022,light)
            paw(s*.43,1.05,.14,skin,-.41)
        feet(.35,.22,.24,shade)
        e("Small living tail",(-.63,.38,.77),(.34,.10,.23),accent,(0,0,-.35))

    def flamingo_body():
        e("Elegant flamingo torso",(0,.19,1.28),(.47,.47,.61),skin)
        e("Layered pink wing",(-.39,-.06,1.31),(.28,.17,.44),accent,(0,0,-.24))
        for i in range(4):
            e("Wing feather",(-.52-i*.08,-.13,1.16-i*.08),(.11,.11,.28),light,
              (0,0,-.25))
        tube("Curved swanlike neck",[(.06,-.03,1.65),(.31,-.13,2.06),
             (.30,-.25,2.50),(.11,-.31,2.67)],.16,skin)
        e("Flamingo head",(.10,-.33,2.67),(.36,.34,.33),skin)
        e("Flamingo eye",(-.03,-.63,2.75),(.105,.035,.13),ink)
        e("Eye glint",(-.06,-.66,2.80),(.028,.008,.035),ivory)
        cone("Downturned flamingo beak",(.20,-.65,2.50),.13,.42,shade,
             (math.pi/2.5,0,0))
        for s in (-1,1):
            tube("Stilt leg",[(s*.20,.11,.83),(s*.24,.03,.38),
                (s*.24,-.04,.14)],.06,shade)
            e("Webbed foot",(s*.24,-.20,.12),(.18,.27,.06),shade)
        e("Tail plume",(-.49,.39,1.13),(.29,.16,.28),accent,(0,0,-.32))

    builders={
        "fox":fox_body,"cat":cat_body,"bird":lambda:bird_body(False),
        "phoenix":lambda:bird_body(True),"whale":lambda:whale_body(False),
        "narwhal":lambda:whale_body(True),"owl":owl_body,"squirrel":squirrel_body,
        "rabbit":rabbit_body,"deer":deer_body,"bear":bear_body,
        "turtle":turtle_body,"unicorn":unicorn_body,"butterfly":butterfly_body,
        "dragon":dragon_body,"sheep":sheep_body,"cloud":cloud_body,
        "octopus":octopus_body,"sprout":sprout_body,"flamingo":flamingo_body,
        "otter":None,
    }
    if kind=="otter":
        e("Streamlined otter torso",(0,.16,1.08),(.54,.47,.72),skin)
        e("Otter belly",(0,-.29,1.13),(.34,.19,.51),light)
        e("Otter head",(0,-.10,2.08),(.59,.47,.54),skin)
        ears_pair(2.51,.51,.21,True)
        eyes(2.17,-.55,.25,.15)
        e("Otter snout",(0,-.61,1.89),(.26,.17,.18),ivory)
        e("Otter nose",(0,-.76,1.93),(.075,.05,.06),shade)
        smile(-.75,1.76,.12)
        for s in (-1,1): paw(s*.48,1.02,.17,skin,-.45)
        feet(.37,.24,.28,shade)
        tube("Long swimming tail",[(-.48,.34,.70),(-1.02,.41,.56),
             (-1.32,.37,.95)],.18,skin)
    else:
        builders[kind]()
