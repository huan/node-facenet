"""
facenet-bridge
"""
from typing import Any

import tensorflow as tf
import numpy as np
from scipy import misc

import align.detect_face
import facenet


class FacenetBridge(object):
    """
    Bridge of Facenet
    """
    MODEL_DIR = 'models/facenet/20170512-110547/'

    def __init__(self):
        self.graph = self.session = None

    def init(self):
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        with self.graph.as_default():
            with self.session.as_default():
                facenet.load_model(self.MODEL_DIR)

        self.placeholder_input = self.graph.get_tensor_by_name('input:0')
        self.placeholder_phase_train = self.graph.get_tensor_by_name('phase_train:0')
        self.placeholder_embeddings = self.graph.get_tensor_by_name('embeddings:0')

    def embedding(self, file: str) -> None:
        """
        Get embedding
        """
        img = misc.imread(file)
        if img.ndim == 2:
            img = facenet.to_rgb(img)
        img = facenet.prewhiten(img)

        w, h, d = img.shape
        images = np.empty((1, w, h, 3), dtype=np.uint8)
        images[0] = img

        feed_dict = {
            self.placeholder_input:         images,
            self.placeholder_phase_train:   False,
        }
        # Use the facenet model to calcualte embeddings
        embeddings = self.session.run(
            self.placeholder_embeddings,
            feed_dict=feed_dict,
        )

        return embeddings


class MtcnnBridge():
    """
    MTCNN Face Alignment
    """
    def __init__(self):
        self.graph = self.session = None
        self.pnet = self.rnete = self.onet = None


    def init(self):
        """ doc """
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        with self.graph.as_default():
            with self.session.as_default():
                self.pnet, self.rnet, self.onet = align.detect_face.create_mtcnn(self.session, None)


    def align(self, file: str) -> Any:
        """ doc """
        image = misc.imread(file)

        minsize = 20    # minimum size of face
        threshold = [0.6, 0.7, 0.7]  # three steps's threshold
        factor = 0.709  # scale factor

        bounding_boxes, landmarks = align.detect_face.detect_face(
            image,
            minsize,
            self.pnet,
            self.rnet,
            self.onet,
            threshold,
            factor,
        )

        # bounding_boxes = np.insert(bounding_boxes, 4, areas, axis=1)
        width = bounding_boxes[:, 2] - bounding_boxes[:, 0]
        height = bounding_boxes[:, 3] - bounding_boxes[:, 1]
        areas = width * height
        indices_desc = np.argsort(areas)[::-1]
        bounding_boxes = bounding_boxes[indices_desc]
        landmarks = landmarks.reshape(-1, 5, 2)[indices_desc]

        bounding_boxes[:, 0:4] = np.around(bounding_boxes[:, 0:4])
        return bounding_boxes, landmarks


# facenet_bridge = FacenetBridge()
# facenet_bridge.init()
# ALIGNED = '/datasets/lfw/lfw_mtcnnpy_160/Abel_Aguilar/Abel_Aguilar_0001.png'
# embedding = facenet_bridge.embedding(ALIGNED)
# print(embedding)

# mtcnn_bridge = MtcnnBridge()
# mtcnn_bridge.init()
# IMAGE = '/datasets/vgg-face/raw/Adam_Buxton/BlogAdamandJulian.jpg'
# # IMAGE = '/datasets/vgg-face/raw/Adam_Buxton/characters.jpg'
# boxes, marks = mtcnn_bridge.align(IMAGE)
# print(boxes)
# print(marks)

# for top, left, bottom, right in bounding_boxes[:, 0:4]:
#     print(
#         'width: %d, height: %d, area: %d'
#         %(right - left, bottom - top, (right - left) * (bottom - top))
#     )
