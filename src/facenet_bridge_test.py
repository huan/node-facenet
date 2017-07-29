"""
test
"""
import json
import os
from typing import (
    Any,
    Iterable,
)

from scipy.misc import imread   # type: ignore
import pytest                   # type: ignore
# pylint: disable=W0621

from facenet_bridge import (
    FacenetBridge,
    MtcnnBridge,
)


@pytest.fixture(scope='module')
def mtcnn_bridge() -> Iterable[MtcnnBridge]:
    """ doc """
    bridge = MtcnnBridge()
    bridge.init()
    yield bridge


@pytest.fixture(scope='module')
def facenet_bridge() -> Iterable[FacenetBridge]:
    """ doc """
    bridge = FacenetBridge()
    bridge.init()
    yield bridge


@pytest.fixture(scope='module')
def image_with_two_faces() -> Iterable[Any]:
    """ doc """
    file_path = os.path.dirname(os.path.abspath(__file__))
    fixture_file = os.path.abspath(os.path.normpath(
        os.path.join(
            file_path,
            '..',
            'tests',
            'fixtures',
            'two-faces.jpg',
        )
    ))

    image = imread(fixture_file)
    yield image


@pytest.fixture(scope='module')
def image_aligned_face() -> Iterable[Any]:
    """ doc """
    file_path = os.path.dirname(os.path.abspath(__file__))
    fixture_file = os.path.abspath(os.path.normpath(
        os.path.join(
            file_path,
            '..',
            'tests',
            'fixtures',
            'aligned-face.png',
        )
    ))

    image = imread(fixture_file)
    yield image


def test_mtcnn_bridge(
        mtcnn_bridge: MtcnnBridge,
        image_with_two_faces: Any
) -> None:
    """ doc """
    image_array = image_with_two_faces.tolist()
    image_json_text = json.dumps(image_array)
    bounding_boxes, landmarks = mtcnn_bridge.align(image_json_text)
    # print(bounding_boxes)
    assert bounding_boxes.shape == (2, 4+1), 'should get two faces'
    assert landmarks.shape == (2, 5, 2), 'should get two set of landmarks'


def test_facenet_bridge(
        facenet_bridge: FacenetBridge,
        image_aligned_face: Any,
) -> None:
    """ doc """
    image_array = image_aligned_face.tolist()
    image_json_text = json.dumps(image_array)
    embedding = facenet_bridge.embedding(image_json_text)
    # print(embedding)
    assert embedding.shape == (1, 128), 'should get 128 dim facenet embedding'


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
