FROM tensorflow/tensorflow:latest-gpu-py3
MAINTAINER Huan LI <zixia@zixia.net>

ENV LC_ALL C.UTF-8

RUN  curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get install -y \
      git \
      nodejs \
      vim \
  && rm -rf /var/lib/apt/lists/*

ENV PYTHON_FACENET /python-facenet
RUN  mkdir "$PYTHON_FACENET" \
  && cd "$PYTHON_FACENET" \
  && git clone https://github.com/davidsandberg/facenet.git . \
  && pip install \
          h5py \
          opencv-python \
  && echo "Python Facenet Installed."
ENV PYTHONPATH "$PYTHON_FACENET/src"

# Open API Specification - https://www.openapis.org/
RUN mkdir /oas
WORKDIR /oas

COPY package.json .
RUN npm install && rm -fr /tmp/* ~/.npm
COPY . .

EXPOSE 80

VOLUME [ "/facenet" ]
CMD [ "npm", "start" ]
