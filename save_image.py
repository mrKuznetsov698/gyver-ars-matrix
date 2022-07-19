from PIL import Image
import os
import time


def hex_to_tuple(col):
    # col #ff00ff => (255, 0, 255)
    col = int(col[1:], 16)
    return (col >> 16) & 0xFF, (col >> 8) & 0xFF, col & 0xFF


def create_image(arr, arr_size, block_size):
    img = Image.new("RGB", (arr_size[0] * block_size, arr_size[1] * block_size))
    for x in range(arr_size[0]):
        for y in range(arr_size[1]):
            for i in range(block_size):
                for j in range(block_size):
                    img.putpixel((x * block_size + i, y * block_size + j), hex_to_tuple(arr[x][y]))
    return save_image(img)


def save_image(img):
    if not os.path.exists('screenshots/'):
        os.mkdir('screenshots')
    name = f'screenshots/{int(time.time())}.bmp'
    img.save(name)
    return name