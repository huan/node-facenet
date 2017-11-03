FROM ubuntu:17.10
LABEL maintainer="Huan LI <zixia@zixia.net>"

ENV DEBIAN_FRONTEND noninteractive
ENV LC_ALL          C.UTF-8

RUN  curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get update && apt-get install -y \
      build-essential \
      g++ \
      git \
      iputils-ping \
      libcairo2-dev \
      libjpeg8-dev \
      libpango1.0-dev \
      libgif-dev \
      nodejs \
      python2.7 \
      python3.6 \
      sudo \
      vim \
  && rm -rf /var/lib/apt/lists/*

# Open API Specification - https://www.openapis.org/
RUN mkdir /facenet
WORKDIR /facenet

COPY package.json .
RUN npm install --python=python2.7 \
    && ln -s /usr/lib/node_modules /node_modules \
    && npm run dist \
    && npm link \
    && rm -fr /tmp/* ~/.npm
COPY . .

# Add facenet user.
RUN groupadd facenet && useradd -g facenet -d /facenet -m -G audio,video,sudo facenet \
    && chown -R facenet:facenet /facenet \
    && echo "facenet   ALL=NOPASSWD:ALL" >> /etc/sudoers

# EXPOSE 80

VOLUME [ "/workdir" ]
CMD [ "npm", "start" ]
