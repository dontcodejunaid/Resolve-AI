import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio

WORKERS_DIR = os.path.join("frontend", "public", "workers")

def create_worker_loop_video(
    image_name,
    output_mp4,
    output_webp,
    screen_rect,       # (x1, y1, x2, y2)
    hands_rect,        # (x1, y1, x2, y2)
    head_rect,         # (x1, y1, x2, y2)
    led_point,         # (x, y)
    theme_color_rgb,   # (r, g, b)
    worker_type="gateway",
    num_frames=60,
    fps=24
):
    img_path = os.path.join(WORKERS_DIR, image_name)
    base_img = Image.open(img_path).convert("RGB")
    width, height = base_img.size

    base_np = np.array(base_img).astype(np.float32)
    frames = []

    # Pre-extract regions
    hx1, hy1, hx2, hy2 = head_rect
    hand_x1, hand_y1, hand_x2, hand_y2 = hands_rect
    sx1, sy1, sx2, sy2 = screen_rect

    head_crop = base_img.crop((hx1, hy1, hx2, hy2))
    hands_crop = base_img.crop((hand_x1, hand_y1, hand_x2, hand_y2))

    for i in range(num_frames):
        t = (i / num_frames) * 2 * math.pi
        frame = base_img.copy()

        # 1. Subtle breathing motion (sinusoidal vertical micro-shift)
        breath_offset = math.sin(t) * 1.8
        breath_sway = math.cos(t) * 0.5
        
        # 2. Typing hand micro-movement (alternating left/right keystrokes)
        type_left = math.sin(t * 4) * 1.2
        type_right = math.cos(t * 4 + 1.2) * 1.2
        type_combined = (type_left + type_right) * 0.5

        # Paste head with subtle breathing
        head_paste_y = int(hy1 + breath_offset)
        head_paste_x = int(hx1 + breath_sway)
        frame.paste(head_crop, (head_paste_x, head_paste_y))

        # Paste hands with typing motion
        hands_paste_y = int(hand_y1 + type_combined)
        frame.paste(hands_crop, (hand_x1, hands_paste_y))

        # 3. Dynamic Animated Screen on Monitor
        screen_w = sx2 - sx1
        screen_h = sy2 - sy1
        screen_surface = Image.new("RGBA", (screen_w, screen_h), (10, 15, 26, 0))
        draw = ImageDraw.Draw(screen_surface)

        # Scanline beam passing down screen
        scan_y = int(((i * 2.5) % screen_h))
        draw.rectangle(
            [0, max(0, scan_y - 8), screen_w, min(screen_h, scan_y + 8)],
            fill=(*theme_color_rgb, 35)
        )
        draw.line([(0, scan_y), (screen_w, scan_y)], fill=(*theme_color_rgb, 90), width=1)

        # Blinking cursor & terminal status bar
        cursor_blink = (i % 12) < 6
        if cursor_blink:
            draw.rectangle([screen_w - 18, screen_h - 14, screen_w - 6, screen_h - 8], fill=(*theme_color_rgb, 180))

        # Screen code lines updating smoothly
        num_code_bars = 7
        for bar_idx in range(num_code_bars):
            by = int(12 + bar_idx * (screen_h - 24) / num_code_bars)
            bw = int((screen_w * 0.45) + math.sin(t * 2 + bar_idx) * (screen_w * 0.25))
            bw = max(20, min(screen_w - 20, bw))
            bar_alpha = 110 + int(math.sin(t + bar_idx) * 40)
            draw.rounded_rectangle([12, by, 12 + bw, by + 3], radius=2, fill=(*theme_color_rgb, bar_alpha))

        # Composite screen surface onto frame
        frame.paste(screen_surface, (sx1, sy1), mask=screen_surface)

        # 4. Ambient light cast from monitor onto desk
        glow_pulse = 0.5 + 0.5 * math.sin(t * 2)
        glow_alpha = int(15 + glow_pulse * 20)
        
        glow_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow_img)
        g_center_x = (sx1 + sx2) // 2
        g_center_y = (sy1 + sy2) // 2
        gdraw.ellipse(
            [g_center_x - 180, g_center_y - 80, g_center_x + 180, g_center_y + 240],
            fill=(*theme_color_rgb, glow_alpha)
        )
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=30))
        frame = Image.alpha_composite(frame.convert("RGBA"), glow_img).convert("RGB")

        # 5. Computer Tower LED activity flicker
        if led_point:
            lx, ly = led_point
            led_flicker = 0.6 + 0.4 * math.sin(t * 8 + (i % 3))
            led_color = (
                int(min(255, theme_color_rgb[0] * led_flicker * 1.5)),
                int(min(255, theme_color_rgb[1] * led_flicker * 1.5)),
                int(min(255, theme_color_rgb[2] * led_flicker * 1.5))
            )
            ldraw = ImageDraw.Draw(frame)
            ldraw.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=led_color)
            ldraw.ellipse([lx - 6, ly - 6, lx + 6, ly + 6], outline=(*led_color, 120), width=1)

        frames.append(np.array(frame))

    # Save as high-performance MP4
    print(f"Saving MP4: {output_mp4} ({len(frames)} frames @ {fps} fps)...")
    imageio.mimsave(output_mp4, frames, fps=fps, quality=8, codec="libx264")

    # Save as WebP
    print(f"Saving WebP: {output_webp}...")
    pil_frames = [Image.fromarray(f) for f in frames]
    pil_frames[0].save(
        output_webp,
        save_all=True,
        append_images=pil_frames[1:],
        duration=int(1000 / fps),
        loop=0,
        quality=85
    )
    print(f"Completed {image_name} -> Video rendered successfully!")

def main():
    print("Starting AI Teammate 4-Video Render Pipeline...")

    # Worker 1: Maya Lin (Payment Sentinel)
    create_worker_loop_video(
        image_name="maya.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "maya.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "maya_anim.webp"),
        screen_rect=(250, 160, 500, 440),
        hands_rect=(360, 440, 580, 580),
        head_rect=(500, 150, 850, 450),
        led_point=(290, 505),
        theme_color_rgb=(56, 189, 248), # Sky Blue
        worker_type="gateway"
    )

    # Worker 2: Alex Chen (Inventory Specialist)
    create_worker_loop_video(
        image_name="alex.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "alex.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "alex_anim.webp"),
        screen_rect=(265, 155, 480, 455),
        hands_rect=(380, 430, 570, 560),
        head_rect=(500, 160, 780, 440),
        led_point=(570, 350),
        theme_color_rgb=(52, 211, 153), # Emerald Green
        worker_type="inventory"
    )

    # Worker 3: Samira Khan (Policy Strategist)
    create_worker_loop_video(
        image_name="samira.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "samira.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "samira_anim.webp"),
        screen_rect=(130, 150, 500, 580),
        hands_rect=(350, 560, 650, 780),
        head_rect=(460, 110, 840, 450),
        led_point=(298, 725),
        theme_color_rgb=(192, 132, 252), # Purple
        worker_type="policy"
    )

    # Worker 4: Marcus Vance (Audit Controller)
    create_worker_loop_video(
        image_name="marcus.jpg",
        output_mp4=os.path.join(WORKERS_DIR, "marcus.mp4"),
        output_webp=os.path.join(WORKERS_DIR, "marcus_anim.webp"),
        screen_rect=(160, 120, 430, 450),
        hands_rect=(290, 570, 640, 760),
        head_rect=(420, 110, 840, 430),
        led_point=(140, 625),
        theme_color_rgb=(251, 191, 36), # Amber Gold
        worker_type="audit"
    )

    print("All 4 AI Worker Videos successfully generated and saved!")

if __name__ == "__main__":
    main()
