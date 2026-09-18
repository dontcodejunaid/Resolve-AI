import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio

WORKERS_DIR = os.path.join("frontend", "public", "workers")

def create_feathered_patch(base_img, bbox, feather_radius=30):
    """Creates an RGBA patch with smooth Gaussian feathered alpha edges."""
    x1, y1, x2, y2 = bbox
    crop = base_img.crop((x1, y1, x2, y2)).convert("RGBA")
    w, h = crop.size
    
    # Generate smooth alpha mask with rounded Gaussian falloff
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    margin = feather_radius
    draw.rounded_rectangle([margin, margin, w - margin, h - margin], radius=feather_radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    
    crop.putalpha(mask)
    return crop, (x1, y1)

def render_worker_loop(
    image_name,
    output_mp4,
    output_webp,
    head_bbox,        # (x1, y1, x2, y2)
    left_hand_bbox,   # (x1, y1, x2, y2)
    right_hand_bbox,  # (x1, y1, x2, y2)
    screen_bbox,      # (x1, y1, x2, y2)
    screen_lines,     # list of code lines
    theme_rgb,        # (r, g, b)
    num_frames=60,    # 2.5 seconds @ 24 fps
    fps=24
):
    img_path = os.path.join(WORKERS_DIR, image_name)
    base_img = Image.open(img_path).convert("RGB")
    width, height = base_img.size

    # Create feathered smooth patches with ZERO visible seams
    head_patch, (hx, hy) = create_feathered_patch(base_img, head_bbox, feather_radius=35)
    l_hand_patch, (lx, ly) = create_feathered_patch(base_img, left_hand_bbox, feather_radius=25)
    r_hand_patch, (rx, ry) = create_feathered_patch(base_img, right_hand_bbox, feather_radius=25)

    sx1, sy1, sx2, sy2 = screen_bbox
    sw, sh = sx2 - sx1, sy2 - sy1

    frames = []

    for i in range(num_frames):
        theta = (i / num_frames) * 2 * math.pi
        frame = base_img.copy()

        # 1. Smooth Head Motion (nodding & tilting towards the monitor)
        head_tilt = math.cos(theta * 2) * 2.5   # subtle horizontal sway
        head_nod = math.sin(theta * 2) * 3.5    # rhythmic vertical nod
        head_angle = math.sin(theta * 2) * 0.8  # micro rotation angle in degrees

        # Rotate head patch smoothly
        rotated_head = head_patch.rotate(head_angle, resample=Image.BICUBIC, center=(head_patch.width // 2, head_patch.height // 2))
        frame.paste(rotated_head, (int(hx + head_tilt), int(hy + head_nod)), mask=rotated_head)

        # 2. Real Typing Keystrokes (alternating left & right hand taps)
        # Left hand keystrokes (4 tap cycles per loop)
        l_type_y = math.sin(theta * 4) * 4.5
        l_type_x = math.cos(theta * 4) * 1.5
        l_rotated = l_hand_patch.rotate(math.sin(theta * 4) * 1.2, resample=Image.BICUBIC)
        frame.paste(l_rotated, (int(lx + l_type_x), int(ly + l_type_y)), mask=l_rotated)

        # Right hand keystrokes (alternating phase)
        r_type_y = math.cos(theta * 4 + 1.2) * 4.5
        r_type_x = -math.sin(theta * 4 + 1.2) * 1.5
        r_rotated = r_hand_patch.rotate(-math.sin(theta * 4 + 1.2) * 1.2, resample=Image.BICUBIC)
        frame.paste(r_rotated, (int(rx + r_type_x), int(ry + r_type_y)), mask=r_rotated)

        # 3. Dynamic Animated Screen on Monitor (Characters typing out smoothly)
        screen_surf = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(screen_surf)

        # Scanline beam
        scan_y = int(((i * 3.0) % sh))
        sdraw.rectangle([0, max(0, scan_y - 4), sw, min(sh, scan_y + 4)], fill=(*theme_rgb, 30))
        sdraw.line([(0, scan_y), (sw, scan_y)], fill=(*theme_rgb, 80), width=1)

        # Typing progress (characters appearing line by line)
        total_chars = int((i / num_frames) * 100) + 20
        curr_chars = total_chars
        line_h = max(11, sh // (len(screen_lines) + 1))

        for l_num, text in enumerate(screen_lines):
            line_y = 8 + l_num * line_h
            if line_y >= sh - 8:
                break
            num_show = min(len(text), max(0, curr_chars))
            visible_str = text[:num_show]
            curr_chars -= len(text)

            if len(visible_str) > 0:
                sdraw.text((8, line_y), visible_str, fill=(*theme_rgb, 220))

            # Blinking block cursor
            if 0 <= num_show <= len(text) and (i % 6 < 3):
                cx = 10 + len(visible_str) * 6
                sdraw.rectangle([cx, line_y, cx + 4, line_y + 7], fill=(255, 255, 255, 230))

        # Soft feathered screen mask to blend into monitor glass with zero seam
        screen_mask = Image.new("L", (sw, sh), 0)
        smask_draw = ImageDraw.Draw(screen_mask)
        smask_draw.rounded_rectangle([4, 4, sw - 4, sh - 4], radius=10, fill=255)
        screen_mask = screen_mask.filter(ImageFilter.GaussianBlur(radius=3))

        screen_surf.putalpha(Image.fromarray(np.minimum(np.array(screen_surf.split()[-1]), np.array(screen_mask))))
        frame.paste(screen_surf, (sx1, sy1), mask=screen_surf)

        # 4. Soft dynamic ambient glow from monitor on desk
        glow_pulse = 0.5 + 0.5 * math.sin(theta * 2)
        glow_alpha = int(12 + glow_pulse * 15)
        glow_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow_img)
        cx_m, cy_m = (sx1 + sx2) // 2, (sy1 + sy2) // 2
        gdraw.ellipse([cx_m - 150, cy_m - 60, cx_m + 150, cy_m + 200], fill=(*theme_rgb, glow_alpha))
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=25))
        frame = Image.alpha_composite(frame.convert("RGBA"), glow_img).convert("RGB")

        frames.append(np.array(frame))

    # Export MP4 (H.264 high-quality video)
    print(f"Exporting MP4: {output_mp4} ({len(frames)} frames @ {fps} fps)...")
    imageio.mimsave(output_mp4, frames, fps=fps, quality=9, codec="libx264")

    # Export WebP
    print(f"Exporting WebP: {output_webp}...")
    pil_frames = [Image.fromarray(f) for f in frames]
    pil_frames[0].save(
        output_webp,
        save_all=True,
        append_images=pil_frames[1:],
        duration=int(1000 / fps),
        loop=0,
        quality=85
    )
    print(f"Completed {image_name} successfully!")

def main():
    print("Generating Feathered Smooth AI Worker Videos (Zero Glitches, Real Typing & Head Nodding)...")

    # 1. Maya Lin (Payment Sentinel)
    render_worker_loop(
        image_name="maya.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "maya.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "maya_anim.webp"),
        head_bbox=(540, 130, 840, 440),
        left_hand_bbox=(410, 460, 520, 570),
        right_hand_bbox=(490, 440, 580, 540),
        screen_bbox=(265, 175, 490, 435),
        screen_lines=[
            "class GatewaySentinel:",
            "  async def verify_txn():",
            "    txn = await bank.fetch()",
            "    assert txn.status == 200",
            "    print('UPI MATCH: 799')",
            "    return VERIFIED_OK"
        ],
        theme_rgb=(56, 189, 248),
        num_frames=60,
        fps=24
    )

    # 2. Alex Chen (Order Specialist)
    render_worker_loop(
        image_name="alex.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "alex.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "alex_anim.webp"),
        head_bbox=(540, 150, 780, 430),
        left_hand_bbox=(400, 460, 500, 560),
        right_hand_bbox=(510, 390, 610, 490),
        screen_bbox=(280, 170, 475, 445),
        screen_lines=[
            "def check_inventory():",
            "  cart = get_cart('77210')",
            "  stock = warehouse.stock()",
            "  if stock >= 1:",
            "    order.recover()",
            "    print('Stock Confirmed: 10')"
        ],
        theme_rgb=(52, 211, 153),
        num_frames=60,
        fps=24
    )

    # 3. Samira Khan (Policy Strategist)
    render_worker_loop(
        image_name="samira.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "samira.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "samira_anim.webp"),
        head_bbox=(540, 100, 830, 440),
        left_hand_bbox=(410, 580, 540, 750),
        right_hand_bbox=(510, 630, 640, 770),
        screen_bbox=(150, 170, 485, 560),
        screen_lines=[
            "import cognee_cloud",
            "async def evaluate_rules():",
            "  p = await cognee.query()",
            "  if cost <= p.threshold:",
            "    return AUTO_RECOVERY",
            "  print('Rule Synthesized')"
        ],
        theme_rgb=(192, 132, 252),
        num_frames=60,
        fps=24
    )

    # 4. Marcus Vance (Audit Controller) - Properly Aligned Desk & Flat Keyboard
    render_worker_loop(
        image_name="marcus.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "marcus.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "marcus_anim.webp"),
        head_bbox=(580, 130, 800, 370),
        left_hand_bbox=(400, 435, 530, 530),
        right_hand_bbox=(460, 485, 590, 580),
        screen_bbox=(175, 100, 410, 470),
        screen_lines=[
            "# Deterministic Rule Engine",
            "def enforce_rules(case):",
            "  rule1.validate_tenancy()",
            "  rule2.lock_idempotency()",
            "  rule13.verify_outcome()",
            "  print('STATUS: 100% OK')"
        ],
        theme_rgb=(251, 191, 36),
        num_frames=60,
        fps=24
    )

    print("All 4 Feathered High-Quality Worker Videos Rendered Successfully!")

if __name__ == "__main__":
    main()
