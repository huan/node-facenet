"""
test
"""
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
