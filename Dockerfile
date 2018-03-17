FROM ubuntu:17.10
LABEL maintainer="Huan LI <zixia@zixia.net>"

ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL          C.UTF-8

RUN apt-get update && apt-get install -y \
      build-essential \
      curl \
      g++ \
      git \
      iputils-ping \
      libcairo2-dev \
      libjpeg8-dev \
      libpango1.0-dev \
      libgif-dev \
      python2.7 \
      python3.6 \
      python3.6-dev \
      python3-venv \
      sudo \
      tzdata \
      vim \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /facenet /workdir

WORKDIR /facenet
COPY . .
RUN npm install --unsafe-perm \
  && npm run dist \
  && sudo ln -s /usr/lib/node_modules /node_modules \
  && sudo ln -s /facenet/node_modules/* /node_modules/ \
  && sudo ln -s /facenet /node_modules/facenet \
  && sudo rm -fr /tmp/* ~/.npm

# EXPOSE 80

VOLUME [ "/workdir" ]
CMD [ "npm", "start" ]
