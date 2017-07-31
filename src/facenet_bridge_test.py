"""
test
"""
import base64
# import json
import os
from typing import (
    Any,
    Iterable,
)

import numpy as np              # type: ignore
import pytest                   # type: ignore
from scipy.misc import imread   # type: ignore
# pylint: disable=W0621

from facenet_bridge import (
    base64_to_image,
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


def test_base64(image_aligned_face: Any) -> None:
    """ base64 """
    row, col, depth = shape = image_aligned_face.shape
    image_array = image_aligned_face.flatten().tolist()

    # print(image_aligned_face.shape)
    # print(len(image_array))

    base64_text = base64.b64encode(
        bytearray(image_array)
    ).decode('utf8')

    decoded_image = base64_to_image(base64_text, row, col, depth)
    decoded_image = np.array(decoded_image)
    assert decoded_image.shape == shape, 'should get back the same shape'
    assert decoded_image.tolist() == image_aligned_face.tolist(),\
        'should be same between encode/decode'


def test_mtcnn_bridge(
        mtcnn_bridge: MtcnnBridge,
        image_with_two_faces: Any,
) -> None:
    """ doc """
    row, col, depth = image_with_two_faces.shape
    image_array = image_with_two_faces.flatten().tolist()

    image_base64_text = base64.b64encode(
        bytearray(image_array)
    ).decode('utf8')

    bounding_boxes, landmarks = mtcnn_bridge.align(
        image_base64_text,
        row,
        col,
        depth,
    )
    # print(bounding_boxes)
    assert np.array(bounding_boxes).shape == (2, 4+1),\
        'should get two faces'
    assert np.array(landmarks).shape == (10, 2),\
        'should get two set of landmarks'


def test_facenet_bridge(
        facenet_bridge: FacenetBridge,
        image_aligned_face: Any,
) -> None:
    """ doc """
    row, col, depth = image_aligned_face.shape
    image_array = image_aligned_face.flatten().tolist()
    image_base64_text = base64.b64encode(
        bytearray(image_array)
    ).decode('utf8')

    embedding = np.array(
        facenet_bridge.embedding(image_base64_text, row, col, depth)
    )
    # print(embedding)
    assert embedding.shape == (128,), 'should get 128 dim facenet embedding'
