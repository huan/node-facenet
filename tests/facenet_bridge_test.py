"""
test
"""
# import os
# import sys

# sys.path.append(
#     os.path.abspath(
#         os.path.join(
#             os.path.dirname(__file__),
#             '..',
#             'src')))


from facenet_bridge import (
    FacenetBridge,
    MtcnnBridge,
)


def test_mtcnn_bridge() -> None:
    """ doc """
    bridge = MtcnnBridge()
    assert bridge, 'should instanciated MtcnnBridge'


def test_facenet_bridge() -> None:
    """ doc """
    bridge = FacenetBridge()
    assert bridge, 'should instanciated FacenetBridge'
