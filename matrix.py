import sys
import threading
from save_image import create_image
import time

WIDTH = 80
HEIGHT = 45
PRD = 3600 # seconds
flag = True
mx = [['#000000' for j in range(HEIGHT)] for i in range(WIDTH)]


def service():
    global flag
    tmr = time.time()
    while flag:
        if time.time() - tmr >= PRD:
            tmr = time.time()
            create_image(mx, (WIDTH, HEIGHT), 20)
            for i in range(WIDTH):
                for j in range(HEIGHT):
                    mx[i][j] = '#000000'
        time.sleep(10)
    sys.exit()


def start_service():
    thr = threading.Thread(target=service)
    thr.start()


def stop_service():
    global flag
    flag = False