import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import map_coordinates, gaussian_filter
import imageio

WORKERS_DIR = os.path.join("frontend", "public", "workers")

def generate_smooth_vector_warp_video(
    image_name,
    output_mp4,
    output_webp,
    head_center,       # (cx, cy, radius_x, radius_y)
    left_hand_center,  # (cx, cy, radius)
    right_hand_center, # (cx, cy, radius)
    torso_center,      # (cx, cy, radius)
    screen_rect,       # (x1, y1, x2, y2)
    screen_lines,      # list of strings to type out
    theme_rgb,         # (r, g, b)
    num_frames=72,     # 3 seconds @ 24 fps
    fps=24
):
    img_path = os.path.join(WORKERS_DIR, image_name)
    base_pil = Image.open(img_path).convert("RGB")
    width, height = base_pil.size
    base_np = np.array(base_pil).astype(np.float32)

    # Coordinate grids
    y_grid, x_grid = np.mgrid[0:height, 0:width].astype(np.float32)

    # 1. Head Gaussian mask
    hx, hy, hrx, hry = head_center
    head_dist = ((x_grid - hx) / hrx) ** 2 + ((y_grid - hy) / hry) ** 2
    head_mask = np.exp(-head_dist * 2.0).astype(np.float32)
    head_mask[head_dist > 2.5] = 0

    # 2. Left Hand Gaussian mask
    lx, ly, lr = left_hand_center
    l_dist = ((x_grid - lx) ** 2 + (y_grid - ly) ** 2) / (lr ** 2)
    l_hand_mask = np.exp(-l_dist * 2.0).astype(np.float32)
    l_hand_mask[l_dist > 2.5] = 0

    # 3. Right Hand Gaussian mask
    rx, ry, rr = right_hand_center
    r_dist = ((x_grid - rx) ** 2 + (y_grid - ry) ** 2) / (rr ** 2)
    r_hand_mask = np.exp(-r_dist * 2.0).astype(np.float32)
    r_hand_mask[r_dist > 2.5] = 0

    # 4. Torso breathing mask
    tx, ty, tr = torso_center
    t_dist = ((x_grid - tx) ** 2 + (y_grid - ty) ** 2) / (tr ** 2)
    torso_mask = np.exp(-t_dist * 1.5).astype(np.float32)
    torso_mask[t_dist > 3.0] = 0

    sx1, sy1, sx2, sy2 = screen_rect
    sw = sx2 - sx1
    sh = sy2 - sy1

    frames = []

    for f_idx in range(num_frames):
        theta = (f_idx / num_frames) * 2 * math.pi

        # --- A. Realistic Typing Keystrokes (alternating finger & wrist taps) ---
        # 6 distinct keystroke cycles per 3-second loop
        type_l_y = math.sin(theta * 6) * 4.5
        type_l_x = math.cos(theta * 6) * 1.2

        type_r_y = math.sin(theta * 6 + math.pi * 0.7) * 4.5
        type_r_x = -math.cos(theta * 6 + math.pi * 0.7) * 1.2

        # --- B. Smooth Head Motion (nodding & tilting toward code) ---
        head_nod_y = math.sin(theta * 2) * 3.0
        head_tilt_x = math.cos(theta * 2) * 2.5

        # --- C. Subtle Breathing Expansion ---
        breath_y = math.sin(theta) * 2.0

        # Construct smooth continuous deformation field (ZERO seams!)
        dx = (
            head_mask * head_tilt_x +
            l_hand_mask * type_l_x +
            r_hand_mask * type_r_x
        )

        dy = (
            head_mask * head_nod_y +
            l_hand_mask * type_l_y +
            r_hand_mask * type_r_y +
            torso_mask * breath_y
        )

        # Map coordinates with bicubic interpolation
        sample_x = np.clip(x_grid - dx, 0, width - 1)
        sample_y = np.clip(y_grid - dy, 0, height - 1)

        warped_channels = []
        for c in range(3):
            warped_c = map_coordinates(
                base_np[:, :, c],
                [sample_y, sample_x],
                order=2,
                mode='nearest'
            )
            warped_channels.append(warped_c)

        warped_img_np = np.stack(warped_channels, axis=-1).astype(np.uint8)
        frame_pil = Image.fromarray(warped_img_np)

        # --- D. Dynamic Screen Content Typing Animation ---
        screen_surf = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(screen_surf)

        # Typing progress (characters appearing line by line)
        total_chars_typed = int((f_idx / num_frames) * 120) + 30
        
        # Soft monitor scanline
        scan_y = int(((f_idx * 3.5) % sh))
        sdraw.rectangle([0, max(0, scan_y - 6), sw, min(sh, scan_y + 6)], fill=(*theme_rgb, 25))
        sdraw.line([(0, scan_y), (sw, scan_y)], fill=(*theme_rgb, 80), width=1)

        # Code lines rendering on the screen
        curr_chars = total_chars_typed
        line_height = max(10, sh // 8)
        for l_num, line_text in enumerate(screen_lines):
            line_y = 10 + l_num * line_height
            if line_y >= sh - 10:
                break
            
            chars_for_this_line = min(len(line_text), max(0, curr_chars))
            visible_text = line_text[:chars_for_this_line]
            curr_chars -= len(line_text)

            # Draw code bar or syntax
            if len(visible_text) > 0:
                sdraw.text((10, line_y), visible_text, fill=(*theme_rgb, 210))

            # Blinking block cursor on active typing line
            if 0 <= chars_for_this_line <= len(line_text) and (f_idx % 8 < 4):
                cursor_x = 12 + len(visible_text) * 6
                sdraw.rectangle([cursor_x, line_y, cursor_x + 5, line_y + 8], fill=(255, 255, 255, 220))

        # Composite screen cleanly onto monitor
        frame_pil.paste(screen_surf, (sx1, sy1), mask=screen_surf)

        frames.append(np.array(frame_pil))

    # Export MP4 (H.264)
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
    print(f"Successfully generated {output_mp4} & {output_webp}!")

def main():
    print("Generating Smooth Mesh Warp AI Teammate Videos (Zero Seams, Real Typing & Head Movement)...")

    # 1. Maya Lin (Payment Sentinel)
    generate_smooth_vector_warp_video(
        image_name="maya.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "maya.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "maya_anim.webp"),
        head_center=(660, 280, 150, 160),
        left_hand_center=(460, 520, 65),
        right_hand_center=(535, 490, 65),
        torso_center=(610, 500, 160),
        screen_rect=(265, 175, 490, 435),
        screen_lines=[
            "class GatewaySentinel:",
            "  async def verify_txn(id):",
            "    txn = await bank.fetch()",
            "    assert txn.status == 200",
            "    print('UPI MATCH: 799')",
            "    return VERIFIED_OK"
        ],
        theme_rgb=(56, 189, 248),
        num_frames=72,
        fps=24
    )

    # 2. Alex Chen (Order Specialist)
    generate_smooth_vector_warp_video(
        image_name="alex.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "alex.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "alex_anim.webp"),
        head_center=(640, 270, 140, 150),
        left_hand_center=(450, 510, 60),
        right_hand_center=(560, 440, 55), # hand on mouse/keyboard
        torso_center=(600, 490, 160),
        screen_rect=(280, 170, 475, 445),
        screen_lines=[
            "def check_inventory():",
            "  cart = get_cart('CHK-77210')",
            "  stock = warehouse.stock(102)",
            "  if stock >= 1:",
            "    order.recover_idempotent()",
            "    print('Stock Confirmed: 10')"
        ],
        theme_rgb=(52, 211, 153),
        num_frames=72,
        fps=24
    )

    # 3. Samira Khan (Policy Strategist)
    generate_smooth_vector_warp_video(
        image_name="samira.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "samira.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "samira_anim.webp"),
        head_center=(660, 260, 150, 160),
        left_hand_center=(460, 640, 70),
        right_hand_center=(560, 690, 70),
        torso_center=(620, 550, 170),
        screen_rect=(150, 170, 485, 560),
        screen_lines=[
            "import cognee_cloud",
            "async def evaluate_rules():",
            "  p = await cognee.query('policy')",
            "  if cost <= policy.threshold:",
            "    return AUTO_RECOVERY",
            "  print('Rule Path Synthesized')"
        ],
        theme_rgb=(192, 132, 252),
        num_frames=72,
        fps=24
    )

    # 4. Marcus Vance (Audit Controller)
    generate_smooth_vector_warp_video(
        image_name="marcus.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "marcus.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "marcus_anim.webp"),
        head_center=(650, 260, 150, 160),
        left_hand_center=(420, 620, 70),
        right_hand_center=(550, 690, 70),
        torso_center=(610, 540, 170),
        screen_rect=(180, 140, 415, 435),
        screen_lines=[
            "# Deterministic Rule Engine",
            "def enforce_rules(case):",
            "  rule1.validate_tenancy()",
            "  rule2.lock_idempotency()",
            "  rule13.verify_outcome()",
            "  print('STATUS: 100% SECURE')"
        ],
        theme_rgb=(251, 191, 36),
        num_frames=72,
        fps=24
    )

    print("All 4 Smooth Animated Worker Videos Rendered Successfully!")

if __name__ == "__main__":
    main()
