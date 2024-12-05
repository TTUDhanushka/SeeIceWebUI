#!/usr/bin/env python3
"""
UI to display camera image frame
Created on: 2024-09-15
"""
from PyQt5.QtCore import pyqtSignal
from PyQt5.QtCore import QThread, QObject
from PyQt5.QtGui import QPixmap, QImage
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
import sys
import cv2
import numpy as np
from threading import Lock, Thread, Event


class Worker(QObject):
    progress = pyqtSignal(int)
    # completed = pyqtSi

class MainWindow(QMainWindow):
    def __init__(self, image_buffer):
        super().__init__()
        self.image_buffer = image_buffer
        self.initializeUI()

    def initializeUI(self):
        self.setGeometry(50, 50, 800, 600)
        self.setWindowTitle("SeeIce")
        self.setUpCameraView()
        self.show()

    def setUpCameraView(self):
        self.camera_view = QLabel()
        # Image from buffer
        image = self.image_buffer.get()

        if image is not None:
            height, width, channels = image.shape
            bytes_per_line = channels * width
            image = QImage(image.data, width, height, bytes_per_line, QImage.Format.Format_RGB888)
            image_pixmap = QPixmap.fromImage(image)
            self.camera_view.setPixmap(image_pixmap)
        else:
            print(f"Image buffer returned None as output.")

class VideoBuffer:
    def __init__(self):
        self.mutex = Lock()
        self.image_buf = {'image': None}

    def put(self, image):

        try:
            self.mutex.acquire()
            self.image_buf['image'] = image

        finally:
            self.mutex.release()

    def get(self):
        try:
            self.mutex.acquire()
            return self.image_buf['image']

        finally:
            self.mutex.release()


class VideoStream:
    def __init__(self):
        pass

    def capture_camera(self, image_buffer, stop_event):
        # camera_list = get_available_cameras()
        #
        # print(f"No of cameras {len(camera_list)}")
        try:
            cap = cv2.VideoCapture(0, cv2.CAP_ANY)

            if not cap.isOpened():
                return

            while cap.isOpened() and  not stop_event.is_set():
                ret, cv_image = cap.read()

                # cv_color_img = np.zeros_like(cv_image, dtype=np.uint8)

                cv_color_img = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
                cv2.imshow("Image", cv_color_img)

                image_buffer.put(cv_color_img)
                # return cv_color_img
                # print(f"Read ret {ret}")

                cv2.waitKey(30)
        except Exception:
            print(f"Camera index out of range. Or no camera detected.")

    def get_available_cameras(self) -> list[int]:
        index = 0
        camera_ids = []
        MAX_CAMERA_COUNT = 10

        while index < MAX_CAMERA_COUNT:
            cap = cv2.VideoCapture(index, cv2.CAP_ANY)

            # if cap.isOpened():
            if cap.read()[0]:
                camera_ids.append(index)
                index += 1
            else:
                return camera_ids

            cv2.waitKey(30)

def main():
    image_buffer = VideoBuffer()

    stop_event = Event()

    camera_reader = VideoStream()

    # camera_q_thread = QThread()
    camera_thread = Thread(target=camera_reader.capture_camera, args=(image_buffer, stop_event))
    camera_thread.start()

    try:
        app = QApplication(sys.argv)
        window = MainWindow(image_buffer)
        sys.exit(app.exec())

    except KeyboardInterrupt:
        stop_event.set()
        camera_thread.join()


if __name__ == '__main__':
    main()
