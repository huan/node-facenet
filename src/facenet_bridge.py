"""
facenet-bridge
"""
import base64
import errno
import json
import os
from typing import (
    Any,
    List,
    Tuple,
)

import tensorflow as tf     # type: ignore
import numpy as np          # type: ignore

import align.detect_face    # type: ignore
import facenet              # type: ignore


# def json_parse(text: str) -> Any:
#     """ json """
#     return json.loads(text)


# def numpize(array: Any) -> Any:
#     """ numpy """
#     return np.array(array, dtype=np.uint8)  # important to define dtype!


def base64_to_image(
        base64text: str,
        row: int,
        col: int,
        depth: int
) -> Any:
    """ base64 """
    image_bytes = base64.b64decode(base64text)
    image_view = memoryview(image_bytes)
    # important to define dtype!
    image_array = np.array(image_view, dtype=np.uint8)
    image = image_array.reshape(row, col, depth)
    # We have to return a list instead of np.array
    # because np.array can not be json serialized to python-bridge.
    return image.tolist()


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
        try_file1 = os.path.join(file_path, '..', 'package.json')
        try_file2 = os.path.join(file_path, '..', '..', 'package.json')

        try:
            with open(try_file1) as data_file:
                data = json.load(data_file)
        except FileNotFoundError:
            with open(try_file2) as data_file:
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

    def embedding(
            self,
            image_base64: str,
            row: int,
            col: int,
            depth: int,
    ) -> List[float]:
        """
        Get embedding
        """
        image = base64_to_image(image_base64, row, col, depth)
        image = np.array(image, dtype=np.uint8)

        if image.ndim == 2:
            image = facenet.to_rgb(image)
        image = facenet.prewhiten(image)

        # height, width, _ = image.shape
        # image_list = np.empty((1, height, width, 3), dtype=np.uint8)
        # image_list[0] = image

        feed_dict = {
            self.placeholder_input:         image[np.newaxis, :],
            self.placeholder_phase_train:   False,
        }
        # Use the facenet model to calcualte embeddings
        embeddings = self.session.run(
            self.placeholder_embeddings,
            feed_dict=feed_dict,
        )

        # Return the only row
        return embeddings[0].tolist()


class MtcnnBridge():
    """
    MTCNN Face Alignment
    """
    def __init__(self) -> None:
        self.graph = self.session = None            # type: Any
        self.pnet = self.rnet = self.onet = None    # type: Any

        self.minsize = 20                   # minimum size of face
        self.threshold = [0.6, 0.7, 0.7]    # three steps's threshold
        self.factor = 0.709                 # scale factor

    def init(self) -> None:
        """ doc """
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        # pylint: disable=not-context-manager
        with self.graph.as_default():
            with self.session.as_default():
                self.pnet, self.rnet, self.onet = \
                    align.detect_face.create_mtcnn(self.session, None)

    def align(
            self,
            image_base64: str,
            row: int,
            col: int,
            depth: int,
    ) -> Tuple[List[Any], List[Any]]:
        """ doc """
        image = base64_to_image(image_base64, row, col, depth)
        image = np.array(image, dtype=np.uint8)

        bounding_boxes, landmarks = align.detect_face.detect_face(
            image,
            self.minsize,
            self.pnet,
            self.rnet,
            self.onet,
            self.threshold,
            self.factor,
        )

        bounding_boxes[:, 0:4] = np.around(bounding_boxes[:, 0:4])
        landmarks = np.around(landmarks)

        return bounding_boxes.tolist(), landmarks.tolist()
