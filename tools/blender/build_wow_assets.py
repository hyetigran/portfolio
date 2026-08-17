"""
Procedural asset generator for the /wow scene.

Builds every model used by the Three.js scene as real geometry (beveled edges,
displaced rock forms, layered foliage) and exports them into a single GLB whose
meshes are pulled out by name on the React side.

Run:
    /Applications/Blender.app/Contents/MacOS/Blender -b \
        --python tools/blender/build_wow_assets.py

Meshes are authored around the origin with +Y up and a footprint that sits on
y=0, so the scene can place them without per-asset fudge factors.
"""

import bpy
import bmesh
import math
import random
import os
import numpy as np

OUT = os.path.join(os.getcwd(), "public", "models", "wow-assets.glb")
TEX = 256


# --------------------------------------------------------------------------
# procedural tileable textures
#
# Authored as numpy buffers rather than shader nodes so they bake straight into
# the GLB as ordinary images — no node-graph baking step, and they stay tileable.
# --------------------------------------------------------------------------


def _rng(seed):
    return np.random.default_rng(seed)


def _fbm(h, w, seed, octaves=4, base=4):
    """Cheap tileable value noise: sum of upsampled low-res lattices."""
    rng = _rng(seed)
    out = np.zeros((h, w), np.float32)
    amp = 1.0
    total = 0.0
    for o in range(octaves):
        n = base * (2**o)
        lattice = rng.random((n, n)).astype(np.float32)
        # wrap-around tile by repeating the lattice before interpolation
        ys = np.linspace(0, n, h, endpoint=False)
        xs = np.linspace(0, n, w, endpoint=False)
        y0 = np.floor(ys).astype(int) % n
        x0 = np.floor(xs).astype(int) % n
        y1 = (y0 + 1) % n
        x1 = (x0 + 1) % n
        fy = (ys - np.floor(ys)).astype(np.float32)[:, None]
        fx = (xs - np.floor(xs)).astype(np.float32)[None, :]
        fy = fy * fy * (3 - 2 * fy)
        fx = fx * fx * (3 - 2 * fx)
        a = lattice[np.ix_(y0, x0)]
        b = lattice[np.ix_(y0, x1)]
        c = lattice[np.ix_(y1, x0)]
        d = lattice[np.ix_(y1, x1)]
        out += amp * ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)
        total += amp
        amp *= 0.5
    return out / total


def _rgba(rgb):
    h, w, _ = rgb.shape
    out = np.ones((h, w, 4), np.float32)
    out[:, :, :3] = np.clip(rgb, 0, 1)
    return out


def _tint(mask, dark, light):
    """Blend two colors by a 0..1 mask."""
    dark = np.array(dark, np.float32)
    light = np.array(light, np.float32)
    return dark[None, None, :] + (light - dark)[None, None, :] * mask[:, :, None]


def tex_stone(seed=1):
    h = w = TEX
    yy, xx = np.mgrid[0:h, 0:w]
    course = 32
    row = yy // course
    offset = (row % 2) * 24
    block = ((xx + offset) // 48).astype(np.float32)
    shade = _fbm(h, w, seed, 4, 4) * 0.45 + 0.55
    # per-block value variation
    rng = _rng(seed + 7)
    var = rng.random((h // course + 2, w // 48 + 2)).astype(np.float32)
    shade = shade * (0.75 + 0.5 * var[row % var.shape[0], block.astype(int) % var.shape[1]])
    mortar_y = ((yy % course) < 3).astype(np.float32)
    mortar_x = (((xx + offset) % 48) < 3).astype(np.float32)
    mortar = np.clip(mortar_y + mortar_x, 0, 1)
    rgb = _tint(np.clip(shade, 0, 1), (0.09, 0.10, 0.13), (0.34, 0.36, 0.42))
    rgb *= 1.0 - 0.55 * mortar[:, :, None]
    return _rgba(rgb)


def tex_plaster(seed=2):
    h = w = TEX
    n = _fbm(h, w, seed, 5, 3)
    grime = _fbm(h, w, seed + 11, 3, 2)
    rgb = _tint(n * 0.6 + 0.4, (0.16, 0.15, 0.13), (0.46, 0.44, 0.40))
    rgb *= (0.75 + 0.35 * grime)[:, :, None]
    return _rgba(rgb)


def tex_planks(seed=3, plank=32):
    h = w = TEX
    yy, xx = np.mgrid[0:h, 0:w]
    idx = (xx // plank).astype(int)
    rng = _rng(seed)
    var = rng.random(w // plank + 1).astype(np.float32)
    grain = _fbm(h, w, seed + 5, 4, 8)
    # stretch grain along the plank direction
    grain = (grain + np.roll(grain, 3, axis=1) + np.roll(grain, -3, axis=1)) / 3.0
    shade = 0.45 + 0.55 * grain
    shade *= 0.7 + 0.6 * var[idx % var.shape[0]]
    gap = ((xx % plank) < 2).astype(np.float32)
    rgb = _tint(np.clip(shade, 0, 1), (0.07, 0.045, 0.025), (0.34, 0.22, 0.13))
    rgb *= 1.0 - 0.7 * gap[:, :, None]
    return _rgba(rgb)


def tex_rooftile(seed=4):
    h = w = TEX
    yy, xx = np.mgrid[0:h, 0:w]
    rowh, tilew = 22, 30
    row = yy // rowh
    offset = (row % 2) * 15
    ty = (yy % rowh) / rowh
    gap_x = (((xx + offset) % tilew) < 2).astype(np.float32)
    # darker toward the bottom lip of each tile: reads as overlap shadow
    lip = np.clip((ty - 0.72) / 0.28, 0, 1)
    n = _fbm(h, w, seed, 4, 6)
    shade = 0.55 + 0.45 * n - 0.45 * lip
    rgb = _tint(np.clip(shade, 0, 1), (0.05, 0.07, 0.12), (0.20, 0.26, 0.40))
    rgb *= 1.0 - 0.5 * gap_x[:, :, None]
    return _rgba(rgb)


def tex_bark(seed=5):
    h = w = TEX
    n = _fbm(h, w, seed, 5, 4)
    n = (n + np.roll(n, 5, axis=0) + np.roll(n, -5, axis=0)) / 3.0  # vertical furrows
    rgb = _tint(np.clip(n * 1.2, 0, 1), (0.04, 0.03, 0.02), (0.21, 0.15, 0.10))
    return _rgba(rgb)


def tex_foliage(seed=6):
    h = w = TEX
    n = _fbm(h, w, seed, 5, 8)
    speck = (_fbm(h, w, seed + 3, 2, 32) > 0.62).astype(np.float32)
    rgb = _tint(np.clip(n, 0, 1), (0.025, 0.055, 0.035), (0.13, 0.26, 0.15))
    rgb *= (0.85 + 0.3 * speck)[:, :, None]
    return _rgba(rgb)


def tex_rockface(seed=7):
    h = w = TEX
    n = _fbm(h, w, seed, 5, 5)
    speck = _fbm(h, w, seed + 2, 2, 40)
    rgb = _tint(np.clip(n * 0.9 + 0.1, 0, 1), (0.06, 0.055, 0.05), (0.31, 0.30, 0.28))
    rgb *= (0.85 + 0.3 * speck)[:, :, None]
    return _rgba(rgb)


def tex_canvas(seed=8):
    h = w = TEX
    yy, xx = np.mgrid[0:h, 0:w]
    weave = (np.sin(xx * math.pi / 3) * np.sin(yy * math.pi / 3)) * 0.5 + 0.5
    n = _fbm(h, w, seed, 4, 4)
    shade = 0.55 + 0.3 * n + 0.15 * weave
    rgb = _tint(np.clip(shade, 0, 1), (0.10, 0.09, 0.07), (0.36, 0.33, 0.27))
    return _rgba(rgb)


def _star_points(cx, cy, R, points=5):
    """Vertices of a 5-point star, outer/inner radii alternating."""
    inner = R * 0.382
    out = []
    for i in range(points * 2):
        a = -math.pi / 2 + i * math.pi / points
        rad = R if i % 2 == 0 else inner
        out.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    return out


def _fill_poly(mask, pts):
    """Even-odd scanline fill of a polygon into a boolean mask."""
    h, w = mask.shape
    n = len(pts)
    ymin = max(0, int(math.floor(min(p[1] for p in pts))))
    ymax = min(h - 1, int(math.ceil(max(p[1] for p in pts))))
    for y in range(ymin, ymax + 1):
        xs = []
        for i in range(n):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % n]
            if (y1 <= y < y2) or (y2 <= y < y1):
                xs.append(x1 + (y - y1) / (y2 - y1) * (x2 - x1))
        xs.sort()
        for k in range(0, len(xs) - 1, 2):
            a = max(0, int(math.ceil(xs[k])))
            b = min(w - 1, int(math.floor(xs[k + 1])))
            if b >= a:
                mask[y, a : b + 1] = True


def tex_banner(seed=9):
    """Fantasy-medieval US banner: 13 stripes, star canton, weathered."""
    h = w = TEX
    rgb = np.zeros((h, w, 3), np.float32)

    stripe_h = h / 13.0
    for i in range(13):
        y0, y1 = int(i * stripe_h), int((i + 1) * stripe_h)
        rgb[y0:y1] = (0.42, 0.055, 0.06) if i % 2 == 0 else (0.72, 0.66, 0.52)

    canton_h, canton_w = int(h * 0.46), int(w * 0.52)
    rgb[:canton_h, :canton_w] = (0.055, 0.09, 0.26)

    # gold stars, offset rows — real 5-point polygons, scanline filled
    rows, cols = 6, 5
    ch, cw = canton_h / rows, canton_w / cols
    star = np.zeros((canton_h, canton_w), bool)
    R = min(ch, cw) * 0.40
    for r in range(rows):
        for c in range(cols):
            cx = (c + 0.5) * cw + (0 if r % 2 == 0 else cw * 0.5)
            cy = (r + 0.5) * ch
            if cx > canton_w - cw * 0.3:
                continue
            _fill_poly(star, _star_points(cx, cy, R))
    star = star.astype(np.float32)
    gold = np.array((0.85, 0.68, 0.24), np.float32)
    rgb[:canton_h, :canton_w] = (
        rgb[:canton_h, :canton_w] * (1 - star[:, :, None]) + gold[None, None, :] * star[:, :, None]
    )

    # weathering: vertical fade, blotches, thread speckle
    fade = np.linspace(1.0, 0.72, h, dtype=np.float32)[:, None, None]
    rgb *= fade
    rgb *= (0.82 + 0.28 * _fbm(h, w, seed, 4, 3))[:, :, None]
    weave = (np.sin(np.mgrid[0:h, 0:w][1] * math.pi / 2.0) * 0.5 + 0.5)[:, :, None]
    rgb *= 0.94 + 0.06 * weave
    return _rgba(rgb)


def make_image(name, arr):
    h, w, _ = arr.shape
    img = bpy.data.images.new(name, width=w, height=h, alpha=False)
    img.colorspace_settings.name = "sRGB"
    img.pixels.foreach_set(arr[::-1].reshape(-1))
    img.pack()
    return img

# --------------------------------------------------------------------------
# scene setup helpers
# --------------------------------------------------------------------------


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


MATERIALS = {}


def mat(
    name,
    color,
    roughness=0.85,
    metallic=0.0,
    emission=None,
    emission_strength=1.0,
    texture=None,
):
    key = name
    if key in MATERIALS:
        return MATERIALS[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    if texture is not None:
        node = m.node_tree.nodes.new("ShaderNodeTexImage")
        node.image = texture
        node.location = (-400, 200)
        m.node_tree.links.new(node.outputs["Color"], bsdf.inputs["Base Color"])
    MATERIALS[key] = m
    return m


def make_lod(src_name, ratio):
    """
    Decimated copy for distant instances.

    Built after UV unwrap and the AO bake so the LOD inherits both; decimation
    interpolates UVs and vertex colors rather than discarding them.
    """
    src = bpy.data.objects[src_name]
    lod = src.copy()
    lod.data = src.data.copy()
    lod.name = f"{src_name}_lod"
    lod.data.name = lod.name
    bpy.context.collection.objects.link(lod)
    m = lod.modifiers.new("dec", "DECIMATE")
    m.decimate_type = "COLLAPSE"
    m.ratio = ratio
    apply_modifiers(lod)
    return lod


def bake_ao(samples=24):
    """
    Bake ambient occlusion into a vertex color layer.

    glTF multiplies COLOR_0 into base color, and GLTFLoader flips on
    `vertexColors` automatically, so this lands as contact shading in the
    browser with no shader work.

    Every asset is authored at the origin, so each object is isolated for its
    own bake — otherwise they would all occlude each other.
    """
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    try:
        scene.cycles.use_denoising = False
    except AttributeError:
        pass

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    for obj in meshes:
        for other in meshes:
            other.hide_render = other is not obj

        attrs = obj.data.color_attributes
        if not attrs:
            attrs.new(name="AO", type="FLOAT_COLOR", domain="CORNER")
        obj.data.color_attributes.active_color_index = 0

        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.bake(type="AO", target="VERTEX_COLORS")
        except RuntimeError as exc:
            print("BAKE_FAIL", obj.name, exc)

    # Soften: a raw AO bake averages ~0.45 here, which is far too heavy for a
    # scene lit only by a weak moon and one fire. Lerp back toward white.
    strength = 0.5
    for obj in meshes:
        attrs = obj.data.color_attributes
        if not attrs:
            continue
        ca = attrs[0]
        arr = np.empty(len(ca.data) * 4, np.float32)
        ca.data.foreach_get("color", arr)
        arr = 1.0 - (1.0 - arr) * strength
        arr[3::4] = 1.0
        ca.data.foreach_set("color", arr)

    for o in meshes:
        o.hide_render = False
    print("BAKED_AO", len(meshes))


def uv_unwrap_all(scale_for):
    """Smart-project UVs, then scale them so tileable textures repeat sensibly."""
    for obj in list(bpy.data.objects):
        if obj.type != "MESH":
            continue
        # the banner cloth carries hand-authored UVs; projecting would fragment it
        if obj.name.startswith("banner"):
            continue
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.select_all(action="SELECT")
            bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
            bpy.ops.object.mode_set(mode="OBJECT")
        except RuntimeError as exc:
            print("UV_SKIP", obj.name, exc)
            try:
                bpy.ops.object.mode_set(mode="OBJECT")
            except RuntimeError:
                pass
            continue

        layer = obj.data.uv_layers.active
        if not layer:
            continue
        s = scale_for(obj.name)
        arr = np.empty(len(layer.data) * 2, np.float32)
        layer.data.foreach_get("uv", arr)
        arr *= s
        layer.data.foreach_set("uv", arr)


def new_obj(name, verts, faces, material):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.validate()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(material)
    bpy.context.collection.objects.link(obj)
    return obj


def shade_smooth(obj):
    """Blender 4.1+ removed mesh.use_auto_smooth; per-polygon flags are enough."""
    for poly in obj.data.polygons:
        poly.use_smooth = True


def subsurf(obj, levels=1):
    m = obj.modifiers.new("subsurf", "SUBSURF")
    m.levels = levels
    m.render_levels = levels
    return m


def displace_verts(obj, seed, amount, scale=1.0):
    """Push vertices along their normals by smooth noise — organic irregularity."""
    rnd = random.Random(seed)
    mesh = obj.data
    mesh.calc_normals_split() if hasattr(mesh, "calc_normals_split") else None
    offs = {}
    for v in mesh.vertices:
        k = (
            round(v.co.x * scale, 1),
            round(v.co.y * scale, 1),
            round(v.co.z * scale, 1),
        )
        if k not in offs:
            offs[k] = (rnd.random() - 0.5) * 2.0
        v.co += v.normal * (offs[k] * amount)


def bevel(obj, width=0.02, segments=2, angle=math.radians(40)):
    m = obj.modifiers.new("bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = angle
    m.harden_normals = False
    return m


def apply_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            obj.modifiers.remove(m)


def join(objs, name):
    """Join a list of objects into one, keeping per-face materials."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    joined.data.name = name
    return joined


# --------------------------------------------------------------------------
# primitive builders (manual so nothing depends on operator context)
# --------------------------------------------------------------------------


def box(name, sx, sy, sz, material, center=(0, 0, 0)):
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    cx, cy, cz = center
    v = [
        (cx - hx, cy - hy, cz - hz),
        (cx + hx, cy - hy, cz - hz),
        (cx + hx, cy + hy, cz - hz),
        (cx - hx, cy + hy, cz - hz),
        (cx - hx, cy - hy, cz + hz),
        (cx + hx, cy - hy, cz + hz),
        (cx + hx, cy + hy, cz + hz),
        (cx - hx, cy + hy, cz + hz),
    ]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    return new_obj(name, v, f, material)


def cylinder(name, radius_b, radius_t, height, sides, material, center=(0, 0, 0)):
    cx, cy, cz = center
    v, f = [], []
    for i in range(sides):
        a = (i / sides) * math.tau
        v.append((cx + math.cos(a) * radius_b, cy + math.sin(a) * radius_b, cz))
    for i in range(sides):
        a = (i / sides) * math.tau
        v.append((cx + math.cos(a) * radius_t, cy + math.sin(a) * radius_t, cz + height))
    for i in range(sides):
        j = (i + 1) % sides
        f.append((i, j, sides + j, sides + i))
    f.append(tuple(range(sides - 1, -1, -1)))
    f.append(tuple(range(sides, sides * 2)))
    return new_obj(name, v, f, material)


def cone(name, radius, height, sides, material, center=(0, 0, 0)):
    cx, cy, cz = center
    v, f = [], []
    for i in range(sides):
        a = (i / sides) * math.tau
        v.append((cx + math.cos(a) * radius, cy + math.sin(a) * radius, cz))
    apex = len(v)
    v.append((cx, cy, cz + height))
    for i in range(sides):
        j = (i + 1) % sides
        f.append((i, j, apex))
    f.append(tuple(range(sides - 1, -1, -1)))
    return new_obj(name, v, f, material)


def torus(name, major_r, minor_r, material, major=28, minor=12, center=(0, 0, 0)):
    cx, cy, cz = center
    v, f = [], []
    for i in range(major):
        a = (i / major) * math.tau
        ca, sa = math.cos(a), math.sin(a)
        for j in range(minor):
            b = (j / minor) * math.tau
            r = major_r + minor_r * math.cos(b)
            v.append((cx + ca * r, cy + sa * r, cz + minor_r * math.sin(b)))
    for i in range(major):
        i2 = (i + 1) % major
        for j in range(minor):
            j2 = (j + 1) % minor
            f.append((i * minor + j, i2 * minor + j, i2 * minor + j2, i * minor + j2))
    return new_obj(name, v, f, material)


def needle_skirt(name, radius, height, material, points=28, rings=3, jag=0.72, center=(0, 0, 0)):
    """
    Conifer tier: a conical skirt whose outer ring alternates radius so the
    silhouette reads as needles rather than a smooth cone.
    """
    cx, cy, cz = center
    v, f = [], []
    for r_i in range(rings + 1):
        t = r_i / rings
        rr = radius * (1.0 - t)
        zz = cz + height * t
        for i in range(points):
            a = (i / points) * math.tau
            spike = 1.0 if i % 2 == 0 else jag
            # only the outermost ring is jagged; inner rings stay round
            s = spike if r_i == 0 else (1.0 - (1.0 - spike) * (1.0 - t))
            v.append((cx + math.cos(a) * rr * s, cy + math.sin(a) * rr * s, zz))
    for r_i in range(rings):
        for i in range(points):
            i2 = (i + 1) % points
            a0 = r_i * points
            a1 = (r_i + 1) * points
            f.append((a0 + i, a0 + i2, a1 + i2, a1 + i))
    # cap the underside
    f.append(tuple(range(points - 1, -1, -1)))
    return new_obj(name, v, f, material)


def gable_roof(name, w, d, h, material, center=(0, 0, 0)):
    """Ridged roof: ridge runs along Y, slopes fall toward +/-X."""
    cx, cy, cz = center
    hw, hd = w / 2, d / 2
    v = [
        (cx - hw, cy - hd, cz),
        (cx + hw, cy - hd, cz),
        (cx + hw, cy + hd, cz),
        (cx - hw, cy + hd, cz),
        (cx, cy - hd, cz + h),
        (cx, cy + hd, cz + h),
    ]
    f = [
        (3, 2, 1, 0),
        (0, 3, 5, 4),
        (1, 4, 5, 2),
        (0, 4, 1),
        (3, 2, 5),
    ]
    return new_obj(name, v, f, material)


# --------------------------------------------------------------------------
# materials
# --------------------------------------------------------------------------


def build_materials():
    # Albedos are baked into the textures; the scene is lit by a weak moon plus
    # one campfire, so these stay well below daylight range.
    img = {
        "stone": make_image("t_stone", tex_stone()),
        "plaster": make_image("t_plaster", tex_plaster()),
        "planks": make_image("t_planks", tex_planks()),
        "rooftile": make_image("t_rooftile", tex_rooftile()),
        "bark": make_image("t_bark", tex_bark()),
        "foliage": make_image("t_foliage", tex_foliage()),
        "rock": make_image("t_rock", tex_rockface()),
        "canvas": make_image("t_canvas", tex_canvas()),
    }

    return {
        "plaster": mat("plaster", (1, 1, 1), 0.92, texture=img["plaster"]),
        "timber": mat("timber", (1, 1, 1), 0.9, texture=img["planks"]),
        "roof": mat("roof", (1, 1, 1), 0.62, 0.12, texture=img["rooftile"]),
        "stone": mat("stone", (1, 1, 1), 0.88, texture=img["stone"]),
        "darkstone": mat("darkstone", (0.55, 0.6, 0.75), 0.92, texture=img["stone"]),
        "wood": mat("wood", (1, 1, 1), 0.88, texture=img["planks"]),
        "iron": mat("iron", (0.11, 0.11, 0.13), 0.45, 0.85),
        "foliage": mat("foliage", (1, 1, 1), 0.93, texture=img["foliage"]),
        "bark": mat("bark", (1, 1, 1), 0.94, texture=img["bark"]),
        "rock": mat("rock", (1, 1, 1), 0.95, texture=img["rock"]),
        "window": mat(
            "window",
            (1.0, 0.68, 0.36),
            0.6,
            emission=(1.0, 0.60, 0.26),
            emission_strength=2.2,
        ),
        "canvas": mat("canvas", (1, 1, 1), 0.95, texture=img["canvas"]),
        "gold": mat("gold", (0.62, 0.46, 0.16), 0.32, 0.9),
        "bannercloth": mat(
            "bannercloth", (1, 1, 1), 0.9, texture=make_image("t_banner", tex_banner())
        ),
    }


# --------------------------------------------------------------------------
# assets
# --------------------------------------------------------------------------


def _window(name, M, w=0.34, h=0.44, depth=0.09):
    """Recessed frame + mullions + emissive pane. Built at origin facing -Y."""
    parts = []
    frame_t = 0.06
    for dx, dz, sw, sh in (
        (0, h / 2, w + frame_t, frame_t),
        (0, -h / 2, w + frame_t, frame_t),
        (-w / 2, 0, frame_t, h),
        (w / 2, 0, frame_t, h),
    ):
        p = box(f"{name}_f", sw, depth, sh, M["timber"], center=(dx, 0, dz))
        bevel(p, 0.012, 2)
        parts.append(p)
    # mullions
    parts.append(box(f"{name}_m", 0.035, depth * 0.7, h, M["timber"]))
    parts.append(box(f"{name}_m", w, depth * 0.7, 0.035, M["timber"]))
    # glass, set back into the reveal
    parts.append(box(f"{name}_g", w * 0.96, 0.03, h * 0.96, M["window"], center=(0, 0.03, 0)))
    # sill
    sill = box(f"{name}_s", w + 0.16, depth * 1.6, 0.05, M["timber"], center=(0, -0.02, -h / 2 - 0.05))
    bevel(sill, 0.012, 2)
    parts.append(sill)
    return parts


def make_house(name, w, d, body_h, roof_h, M, storeys=1, chimney=True, overhang=0.22):
    parts = []

    # stone foundation course
    found = box(f"{name}_found", w + 0.14, d + 0.14, 0.26, M["stone"], center=(0, 0, 0.13))
    bevel(found, 0.03, 3)
    parts.append(found)

    b = box(f"{name}_body", w, d, body_h, M["plaster"], center=(0, 0, body_h / 2 + 0.2))
    bevel(b, 0.035, 3)
    parts.append(b)

    # half-timbering: corner posts, mid rail, diagonal braces
    for sx in (-1, 1):
        for sy in (-1, 1):
            p = box(
                f"{name}_post",
                0.13,
                0.13,
                body_h,
                M["timber"],
                center=(sx * (w / 2 - 0.06), sy * (d / 2 - 0.06), body_h / 2 + 0.2),
            )
            bevel(p, 0.02, 3)
            parts.append(p)

    rail_z = body_h * (0.55 if storeys > 1 else 0.62) + 0.2
    rail = box(f"{name}_rail", w + 0.1, d + 0.1, 0.14, M["timber"], center=(0, 0, rail_z))
    bevel(rail, 0.022, 3)
    parts.append(rail)

    for sy in (-1, 1):
        for sx in (-1, 1):
            br = box(f"{name}_brace", 0.1, 0.1, body_h * 0.5, M["timber"])
            br.rotation_euler = (0, sx * 0.62, 0)
            br.location = (sx * w * 0.27, sy * (d / 2 - 0.03), body_h * 0.28 + 0.2)
            bevel(br, 0.018, 2)
            parts.append(br)

    # roof with thickness, ridge cap, fascia and exposed rafter ends
    rw, rd = w + overhang * 2, d + overhang * 2
    r = gable_roof(f"{name}_roof", rw, rd, roof_h, M["roof"], center=(0, 0, body_h + 0.2))
    sol = r.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.09
    bevel(r, 0.025, 3)
    parts.append(r)

    ridge = box(f"{name}_ridge", 0.2, rd + 0.05, 0.14, M["roof"], center=(0, 0, body_h + roof_h + 0.22))
    bevel(ridge, 0.03, 3)
    parts.append(ridge)

    for sy in (-1, 1):
        fascia = box(
            f"{name}_fascia", rw, 0.07, 0.16, M["timber"], center=(0, sy * rd / 2, body_h + 0.16)
        )
        bevel(fascia, 0.015, 2)
        parts.append(fascia)

    n_raft = max(3, int(rd / 0.42))
    for i in range(n_raft):
        y = -rd / 2 + (i + 0.5) * (rd / n_raft)
        for sx in (-1, 1):
            raft = box(
                f"{name}_raft",
                0.1,
                0.09,
                0.11,
                M["timber"],
                center=(sx * (rw / 2 - 0.06), y, body_h + 0.24),
            )
            bevel(raft, 0.015, 2)
            parts.append(raft)

    if chimney:
        cx, cy = w * 0.28, d * 0.18
        ch_h = roof_h + 0.6
        ch = box(f"{name}_chim", 0.26, 0.26, ch_h, M["stone"], center=(cx, cy, body_h + ch_h / 2))
        bevel(ch, 0.025, 3)
        parts.append(ch)
        cap = box(f"{name}_cap", 0.38, 0.38, 0.09, M["stone"], center=(cx, cy, body_h + ch_h))
        bevel(cap, 0.02, 3)
        parts.append(cap)
        band = box(f"{name}_cb", 0.31, 0.31, 0.07, M["stone"], center=(cx, cy, body_h + ch_h * 0.55))
        bevel(band, 0.015, 2)
        parts.append(band)

    # framed windows on both long walls
    for sy in (-1, 1):
        for dx in (-w * 0.26, w * 0.26):
            for wp in _window(f"{name}_win", M):
                wp.rotation_euler = (0, 0, 0 if sy < 0 else math.pi)
                wp.location = (dx, sy * (d / 2 + 0.04), body_h * 0.55 + 0.2)
                parts.append(wp)
        if storeys > 1:
            for wp in _window(f"{name}_win2", M, 0.28, 0.34):
                wp.rotation_euler = (0, 0, 0 if sy < 0 else math.pi)
                wp.location = (0, sy * (d / 2 + 0.04), body_h * 0.86 + 0.2)
                parts.append(wp)

    # door on the -X gable end
    door_h = min(1.05, body_h * 0.62)
    dfr = box(f"{name}_dfr", 0.1, 0.72, door_h + 0.12, M["timber"], center=(-w / 2 - 0.03, 0, 0.2 + door_h / 2))
    bevel(dfr, 0.018, 2)
    parts.append(dfr)
    dpanel = box(f"{name}_dp", 0.07, 0.56, door_h, M["wood"], center=(-w / 2 - 0.06, 0, 0.2 + door_h / 2))
    bevel(dpanel, 0.015, 2)
    parts.append(dpanel)

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_pine(name, trunk_h, tiers, base_r, tier_drop, M, seed=0):
    """Tapered trunk, root flare, and stacked needled skirts."""
    rnd = random.Random(seed)
    parts = []

    t = cylinder(f"{name}_trunk", 0.15, 0.07, trunk_h + tiers * 0.42, 14, M["bark"])
    bevel(t, 0.02, 2)
    parts.append(t)

    # root flare
    for i in range(6):
        a = (i / 6) * math.tau + rnd.random() * 0.3
        rt = cone(f"{name}_root", 0.09, 0.34, 6, M["bark"])
        rt.rotation_euler = (1.15, 0, a)
        rt.location = (math.cos(a) * 0.13, math.sin(a) * 0.13, 0.06)
        parts.append(rt)

    z = trunk_h * 0.34
    r = base_r
    for i in range(tiers):
        h = r * 1.75
        pts = 30 if i < tiers - 2 else 22
        skirt = needle_skirt(
            f"{name}_tier{i}",
            r,
            h,
            M["foliage"],
            points=pts,
            rings=3,
            jag=0.66,
            center=(0, 0, z),
        )
        # slight per-tier twist so tiers don't align into visible columns
        skirt.rotation_euler = (0, 0, rnd.random() * math.tau)
        parts.append(skirt)
        z += h * 0.5
        r *= tier_drop

    crown = needle_skirt(f"{name}_crown", r * 1.05, r * 2.6, M["foliage"], points=16, rings=2, jag=0.7, center=(0, 0, z))
    parts.append(crown)

    obj = join(parts, name)
    apply_modifiers(obj)
    shade_smooth(obj)
    return obj


def make_rock(name, seed, radius, M):
    """Subdivided icosphere with layered noise displacement — a real boulder."""
    rnd = random.Random(seed)
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=radius)

    # two octaves of positional noise for large form + surface break-up
    def noise_at(co, freq, s):
        return math.sin(co.x * freq + s) * math.cos(co.y * freq * 1.3 + s * 1.7) * math.sin(
            co.z * freq * 0.8 + s * 2.3
        )

    s1 = rnd.random() * 10
    s2 = rnd.random() * 10
    for v in bm.verts:
        n = v.co.normalized()
        big = noise_at(v.co, 2.1 / max(radius, 0.2), s1) * 0.26
        fine = noise_at(v.co, 7.5 / max(radius, 0.2), s2) * 0.07
        v.co += n * radius * (big + fine)
        v.co.z *= 0.74
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, radius * 0.5))
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(M["rock"])
    bpy.context.collection.objects.link(obj)
    bevel(obj, 0.008, 2)
    apply_modifiers(obj)
    return obj


def make_tower(name, radius, height, M, roof=True):
    parts = []
    body = cylinder(f"{name}_body", radius, radius * 0.9, height, 28, M["stone"])
    bevel(body, 0.035, 3)
    parts.append(body)

    # banded courses up the shaft
    for frac in (0.3, 0.58, 0.84):
        band = cylinder(
            f"{name}_band",
            radius * 0.95,
            radius * 0.95,
            0.12,
            28,
            M["darkstone"],
            center=(0, 0, height * frac),
        )
        bevel(band, 0.02, 2)
        parts.append(band)

    # corbels supporting the parapet
    n_cor = 20
    for i in range(n_cor):
        a = (i / n_cor) * math.tau
        c = box(
            f"{name}_corbel",
            radius * 0.2,
            radius * 0.2,
            0.18,
            M["darkstone"],
            center=(math.cos(a) * radius * 1.0, math.sin(a) * radius * 1.0, height - 0.28),
        )
        c.rotation_euler = (0, 0, a)
        bevel(c, 0.015, 2)
        parts.append(c)

    ring = cylinder(
        f"{name}_ring", radius * 1.14, radius * 1.14, 0.26, 28, M["darkstone"], center=(0, 0, height - 0.1)
    )
    bevel(ring, 0.025, 3)
    parts.append(ring)

    merlons = 16
    for i in range(merlons):
        a = (i / merlons) * math.tau
        m = box(
            f"{name}_merlon",
            radius * 0.28,
            radius * 0.28,
            0.42,
            M["stone"],
            center=(math.cos(a) * radius * 1.0, math.sin(a) * radius * 1.0, height + 0.25),
        )
        m.rotation_euler = (0, 0, a)
        bevel(m, 0.02, 3)
        parts.append(m)

    if roof:
        c = cone(f"{name}_roof", radius * 1.22, radius * 2.5, 28, M["roof"], center=(0, 0, height + 0.4))
        bevel(c, 0.025, 3)
        parts.append(c)
        fin = cone(f"{name}_fin", 0.07, 0.4, 8, M["gold"], center=(0, 0, height + 0.4 + radius * 2.5))
        parts.append(fin)

    # arrow slits with stone surrounds
    for i in range(6):
        a = (i / 6) * math.tau + 0.4
        for hz in (0.38, 0.66):
            px, py = math.cos(a) * radius * 0.97, math.sin(a) * radius * 0.97
            sur = box(f"{name}_sur", 0.22, 0.16, 0.62, M["darkstone"], center=(px, py, height * hz))
            sur.rotation_euler = (0, 0, a)
            bevel(sur, 0.015, 2)
            parts.append(sur)
            s = box(f"{name}_slit", 0.09, 0.1, 0.4, M["window"], center=(px * 1.03, py * 1.03, height * hz))
            s.rotation_euler = (0, 0, a)
            parts.append(s)

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_wall(name, length, height, M):
    parts = []
    b = box(f"{name}_body", length, 0.9, height, M["stone"], center=(0, 0, height / 2))
    bevel(b, 0.035, 3)
    parts.append(b)

    for sy in (-1, 1):
        cap = box(f"{name}_cap", length + 0.1, 0.16, 0.14, M["darkstone"], center=(0, sy * 0.45, height))
        bevel(cap, 0.02, 2)
        parts.append(cap)

    n = max(4, int(length / 0.5))
    for i in range(n):
        x = -length / 2 + (i + 0.5) * (length / n)
        m = box(f"{name}_m", length / n * 0.55, 0.9, 0.36, M["stone"], center=(x, 0, height + 0.18))
        bevel(m, 0.02, 3)
        parts.append(m)

    # buttress piers
    for x in (-length / 2 + 0.5, 0.0, length / 2 - 0.5):
        p = box(f"{name}_pier", 0.4, 1.25, height * 0.92, M["stone"], center=(x, 0, height * 0.46))
        bevel(p, 0.025, 3)
        parts.append(p)

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_barrel(name, M):
    parts = []
    # staved barrel: bulged profile from stacked rings
    sides = 20
    v, f = [], []
    profile = [(0.0, 0.30), (0.18, 0.345), (0.46, 0.365), (0.74, 0.345), (0.92, 0.30)]
    for z, r in profile:
        for i in range(sides):
            a = (i / sides) * math.tau
            v.append((math.cos(a) * r, math.sin(a) * r, z))
    for k in range(len(profile) - 1):
        for i in range(sides):
            i2 = (i + 1) % sides
            f.append((k * sides + i, k * sides + i2, (k + 1) * sides + i2, (k + 1) * sides + i))
    f.append(tuple(range(sides - 1, -1, -1)))
    f.append(tuple(range(len(v) - sides, len(v))))
    body = new_obj(f"{name}_b", v, f, M["wood"])
    bevel(body, 0.012, 2)
    parts.append(body)

    for z, r in ((0.14, 0.352), (0.46, 0.372), (0.78, 0.352)):
        parts.append(torus(f"{name}_hoop", r, 0.026, M["iron"], major=24, minor=8, center=(0, 0, z)))

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_crate(name, M):
    parts = []
    b = box(f"{name}_b", 0.8, 0.8, 0.8, M["wood"], center=(0, 0, 0.4))
    bevel(b, 0.04, 3)
    parts.append(b)
    # plank battens on all four sides plus lid frame
    for sx in (-1, 1):
        for z in (0.1, 0.7):
            parts.append(
                box(f"{name}_sl", 0.075, 0.85, 0.075, M["timber"], center=(sx * 0.38, 0, z))
            )
        for z in (0.1, 0.7):
            parts.append(
                box(f"{name}_sl", 0.85, 0.075, 0.075, M["timber"], center=(0, sx * 0.38, z))
            )
        parts.append(box(f"{name}_v", 0.075, 0.075, 0.8, M["timber"], center=(sx * 0.38, 0.38, 0.4)))
        parts.append(box(f"{name}_v", 0.075, 0.075, 0.8, M["timber"], center=(sx * 0.38, -0.38, 0.4)))
    lid = box(f"{name}_lid", 0.86, 0.86, 0.07, M["timber"], center=(0, 0, 0.81))
    bevel(lid, 0.02, 3)
    parts.append(lid)

    for p in parts[1:]:
        bevel(p, 0.012, 2)

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_banner(name, M):
    """
    Hanging fantasy banner: turned pole, ornate crossbar with spear finials,
    and a cloth with real fold geometry (not a flat plane).

    The cloth carries explicit UVs so the flag texture maps once across it —
    smart-projection would fragment it, so `uv_unwrap_all` skips this asset.
    """
    parts = []
    pole_h = 9.0
    bar_z = pole_h - 0.75
    bar_len = 3.5
    cw, chh = 3.0, 5.8

    pole = cylinder(f"{name}_pole", 0.085, 0.07, pole_h, 10, M["wood"])
    bevel(pole, 0.012, 1)
    parts.append(pole)

    for z in (0.35, 3.2, 6.4, bar_z + 0.25):
        ring = cylinder(f"{name}_ring", 0.105, 0.105, 0.13, 10, M["gold"], center=(0, 0, z))
        bevel(ring, 0.015, 1)
        parts.append(ring)

    tip = cone(f"{name}_tip", 0.14, 0.62, 8, M["gold"], center=(0, 0, pole_h))
    bevel(tip, 0.012, 1)
    parts.append(tip)

    # crossbar: built along +Z then laid along X
    bar = cylinder(f"{name}_bar", 0.065, 0.065, bar_len, 10, M["wood"])
    bar.rotation_euler = (0, math.pi / 2, 0)
    bar.location = (-bar_len * 0.28, 0, bar_z)
    bevel(bar, 0.012, 1)
    parts.append(bar)

    for sx, off in ((-1, -bar_len * 0.28), (1, bar_len * 0.72)):
        fin = cone(f"{name}_barfin", 0.11, 0.42, 8, M["gold"])
        fin.rotation_euler = (0, sx * math.pi / 2, 0)
        fin.location = (off, 0, bar_z)
        parts.append(fin)

    # cloth with folds + explicit UVs
    nx, nz = 26, 34
    verts, faces, uvs = [], [], []
    for j in range(nz + 1):
        t = j / nz
        for i in range(nx + 1):
            u = i / nx
            x = -cw / 2 + u * cw
            # deeper folds so the cloth catches light instead of reading flat
            y = (
                math.sin(u * math.pi * 3.5) * 0.20
                + math.sin(u * math.pi * 7.0) * 0.06
            ) * (0.3 + 0.7 * t)
            z = bar_z - 0.18 - t * chh - math.sin(u * math.pi) * 0.12 * t
            verts.append((x + cw / 2 + 0.16, y, z))
            uvs.append((u, 1.0 - t))
    for j in range(nz):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + 1, a + nx + 2, a + nx + 1))

    cloth = new_obj(f"{name}_cloth", verts, faces, M["bannercloth"])
    uv_layer = cloth.data.uv_layers.new(name="UVMap")
    loop_uv = []
    for poly in cloth.data.polygons:
        for li in poly.loop_indices:
            loop_uv.extend(uvs[cloth.data.loops[li].vertex_index])
    uv_layer.data.foreach_set("uv", loop_uv)
    sol = cloth.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.035
    parts.append(cloth)

    # gold fringe along the hem
    for i in range(14):
        u = (i + 0.5) / 14
        x = -cw / 2 + u * cw + cw / 2 + 0.16
        z = bar_z - 0.18 - chh - math.sin(u * math.pi) * 0.12
        f = cone(f"{name}_fringe", 0.045, 0.22, 5, M["gold"], center=(x, 0, z))
        f.rotation_euler = (math.pi, 0, 0)
        f.location = (x, 0, z)
        parts.append(f)

    # small gold boss low-centre on the cloth, plus a short vertical bar under it
    em = cone(f"{name}_emblem", 0.19, 0.1, 4, M["gold"])
    em.rotation_euler = (-math.pi / 2, math.pi / 4, 0)
    em.location = (cw / 2 + 0.16, -0.2, bar_z - chh + 1.35)
    parts.append(em)

    stem = box(f"{name}_stem", 0.07, 0.05, 0.5, M["gold"])
    stem.location = (cw / 2 + 0.16, -0.19, bar_z - chh + 0.95)
    parts.append(stem)

    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


def make_tent(name, M):
    parts = []
    w, d, h = 2.6, 3.2, 2.1
    v = [
        (-w / 2, -d / 2, 0),
        (w / 2, -d / 2, 0),
        (w / 2, d / 2, 0),
        (-w / 2, d / 2, 0),
        (0, -d / 2, h),
        (0, d / 2, h),
    ]
    f = [(0, 3, 5, 4), (1, 4, 5, 2), (0, 4, 1), (3, 2, 5)]
    body = new_obj(f"{name}_c", v, f, M["canvas"])
    sol = body.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.06
    parts.append(body)
    for sy in (-1, 1):
        p = cylinder(f"{name}_pole", 0.05, 0.05, h + 0.35, 6, M["wood"], center=(0, sy * d / 2, 0))
        parts.append(p)
    obj = join(parts, name)
    apply_modifiers(obj)
    return obj


# --------------------------------------------------------------------------
# build + export
# --------------------------------------------------------------------------


def main():
    reset_scene()
    M = build_materials()

    make_house("house_a", 1.9, 1.7, 1.9, 1.1, M)
    make_house("house_b", 1.5, 1.5, 3.1, 1.5, M, storeys=2)
    make_house("house_c", 3.1, 2.4, 1.9, 1.2, M)
    make_house("house_d", 2.2, 1.9, 2.5, 1.2, M, storeys=2, chimney=False)

    make_pine("pine_a", 1.6, 7, 0.95, 0.84, M, seed=1)
    make_pine("pine_b", 2.1, 8, 0.82, 0.86, M, seed=2)
    make_pine("pine_c", 1.1, 5, 1.12, 0.8, M, seed=3)

    for i, r in enumerate((0.5, 0.75, 1.05)):
        make_rock(f"rock_{'abc'[i]}", 1000 + i * 37, r, M)

    make_tower("tower_a", 1.5, 6.5, M, roof=True)
    make_tower("tower_b", 1.2, 4.5, M, roof=False)
    make_wall("wall_a", 5.0, 3.2, M)

    make_barrel("barrel", M)
    make_crate("crate", M)
    make_tent("tent", M)
    make_banner("banner", M)

    # UV scale per asset family, tuned so texture features land at a believable
    # real-world size for each object's footprint.
    def uv_scale(name: str) -> float:
        if name.startswith("house"):
            return 2.2
        if name.startswith("pine"):
            return 1.4
        if name.startswith("rock"):
            return 1.1
        if name.startswith("tower") or name.startswith("wall"):
            return 2.6
        if name in ("barrel", "crate"):
            return 1.6
        return 1.5

    uv_unwrap_all(uv_scale)
    bake_ao()

    # Distant instances (village, forest) swap to these — the scene places
    # hundreds of each, so full-detail everywhere would be millions of wasted
    # triangles on objects a few pixels tall.
    for n in ("house_a", "house_b", "house_c", "house_d"):
        make_lod(n, 0.18)
    for n in ("pine_a", "pine_b", "pine_c"):
        make_lod(n, 0.3)

    # Blender is Z-up, glTF is Y-up; the exporter converts with +Y up by default.
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    kwargs = dict(
        filepath=OUT,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        use_selection=False,
        export_vertex_color="ACTIVE",
        # Draco keeps the high-poly library web-sized; the decoder is vendored
        # into public/draco so there's no CDN dependency at runtime.
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=10,
    )
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError:
        kwargs.pop("export_vertex_color")
        bpy.ops.export_scene.gltf(**kwargs)
    print("WROTE", OUT)
    names = sorted(o.name for o in bpy.data.objects)
    print("OBJECTS", len(names), names)
    tris = sum(len(o.data.loop_triangles) for o in bpy.data.objects if o.type == "MESH")
    print("NOTE_TRIS", tris)


if __name__ == "__main__":
    for o in list(bpy.data.objects):
        pass
    main()
