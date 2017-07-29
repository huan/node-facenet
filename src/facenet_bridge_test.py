"""
test
"""
import json
import os
from typing import (
    Any,
    Iterable,
)

import numpy as np              # type: ignore
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
    assert np.array(bounding_boxes).shape == (2, 4+1),\
        'should get two faces'
    assert np.array(landmarks).shape == (2, 5, 2),\
        'should get two set of landmarks'


def test_facenet_bridge(
        facenet_bridge: FacenetBridge,
        image_aligned_face: Any,
) -> None:
    """ doc """
    image_array = image_aligned_face.tolist()
    image_json_text = json.dumps(image_array)
    embedding = np.array(
        facenet_bridge.embedding(image_json_text)
    )
    # print(embedding)
    assert embedding.shape == (128,), 'should get 128 dim facenet embedding'
