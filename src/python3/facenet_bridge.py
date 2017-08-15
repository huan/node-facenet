"""
facenet-bridge
"""
import base64
import errno
import json
import os
from pathlib import PurePath
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
    return image


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

        self.FACENET_MODEL = FacenetBridge.get_model_path()

    def init(self) -> None:
        """ doc """
        self.graph = tf.Graph()
        self.session = tf.Session(graph=self.graph)

        # pylint: disable=not-context-manager
        with self.graph.as_default():
            with self.session.as_default():
                model_dir = os.path.expanduser(self.FACENET_MODEL)
                meta_file, ckpt_file = facenet.get_model_filenames(model_dir)
                saver = tf.train.import_meta_graph(
                    os.path.join(model_dir, meta_file),
                )
                saver.restore(
                    tf.get_default_session(),
                    os.path.join(model_dir, ckpt_file),
                )
                # facenet.load_model(self.FACENET_MODEL)

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
        try:
            model_path = os.environ['FACENET_MODEL']    # type: str
            return model_path
        except KeyError:
            pass

        file_path = os.path.dirname(os.path.abspath(__file__))
        path_split = PurePath(file_path).parts
        is_dist = path_split[-3:-2][0] == 'dist'    # the parent of parent directory name
        if is_dist:
            module_root = os.path.join(file_path, '..', '..', '..')
        else:
            module_root = os.path.join(file_path, '..', '..')

        module_root = os.path.abspath(
            os.path.normpath(
                module_root
            )
        )

        package = os.path.join(module_root, 'package.json')
        with open(package) as data:
            package_json = json.load(data)

        python_facenet_model_path = \
            package_json['facenet']['env']['PYTHON_FACENET_MODEL_PATH']
        model_path = os.path.join(module_root, python_facenet_model_path)

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

        if image.ndim == 2:
            image = facenet.to_rgb(image)

        # get rid of Alpha Channel from PNG(if any) and prewhiten
        image = facenet.prewhiten(image[:, :, 0:3])

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

        bounding_boxes, landmarks = align.detect_face.detect_face(
            image[:, :, 0:3],   # get rid of alpha channel(if any)
            self.minsize,
            self.pnet,
            self.rnet,
            self.onet,
            self.threshold,
            self.factor,
        )

        # do not do around: leave it to the high level api, to keep precision
        # bounding_boxes[:, 0:4] = np.around(bounding_boxes[:, 0:4])
        # landmarks = np.around(landmarks)

        return bounding_boxes.tolist(), landmarks.tolist()
