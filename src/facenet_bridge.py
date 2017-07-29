"""
facenet-bridge
"""
import errno
import os
import json
from typing import Any

import tensorflow as tf     # type: ignore
import numpy as np          # type: ignore
from scipy import misc      # type: ignore

import align.detect_face    # type: ignore
import facenet              # type: ignore


class FacenetBridge(object):
    """
    Bridge of Facenet
    """
    FACENET_MODEL = None   # type: str

    def __init__(self) -> None:
        self.graph = self.session = None        # type: Any

        self.placeholder_input = None           # type: Any
        self.placeholder_phase_train = None     # type: Any
        self.placeholder_embeddings = None      # type: Any

        try:
            self.FACENET_MODEL = os.environ['FACENET_MODEL']     # type: str
        except KeyError:
            self.FACENET_MODEL = FacenetBridge.get_model_path()

    def init(self) -> None:
        """ doc """
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        # pylint: disable=not-context-manager
        with self.graph.as_default():
            with self.session.as_default():
                facenet.load_model(self.FACENET_MODEL)

        self.placeholder_input = self.graph.get_tensor_by_name('input:0')
        self.placeholder_phase_train = \
            self.graph.get_tensor_by_name('phase_train:0')
        self.placeholder_embeddings = \
            self.graph.get_tensor_by_name('embeddings:0')

    @staticmethod
    def get_model_path() -> str:
        """
        Get facenet model path from package.json
        """
        file_path = os.path.dirname(os.path.abspath(__file__))
        file1 = os.path.join(file_path, '..', 'package.json')
        file2 = os.path.join(file_path, '..', '..', 'package.json')

        try:
            with open(file1) as data_file:
                data = json.load(data_file)
        except FileNotFoundError:
            with open(file2) as data_file:
                data = json.load(data_file)

        model_path = os.path.abspath(os.path.normpath(
            os.path.join(
                file_path,
                '..',
                data['facenet']['env']['PYTHON_FACENET_MODEL_PATH'],
            )
        ))

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                errno.ENOENT,
                os.strerror(errno.ENOENT),
                model_path
            )

        return model_path

    def embedding(self, file: str) -> None:
        """
        Get embedding
        """
        img = misc.imread(file)
        if img.ndim == 2:
            img = facenet.to_rgb(img)
        img = facenet.prewhiten(img)

        w, h = img.shape
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
    def __init__(self) -> None:
        self.graph = self.session = None            # type: Any
        self.pnet = self.rnet = self.onet = None   # type: Any

    def init(self) -> None:
        """ doc """
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        # pylint: disable=not-context-manager
        with self.graph.as_default():
            with self.session.as_default():
                self.pnet, self.rnet, self.onet = \
                    align.detect_face.create_mtcnn(self.session, None)

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
