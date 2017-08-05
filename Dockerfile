FROM tensorflow/tensorflow:latest-gpu-py3
MAINTAINER Huan LI <zixia@zixia.net>

ENV LC_ALL C.UTF-8

RUN  curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get update && apt-get install -y \
      git \
      iputils-ping \
      nodejs \
      python2.7 \
      vim \
  && rm -rf /var/lib/apt/lists/*

# Open API Specification - https://www.openapis.org/
RUN mkdir /oas
WORKDIR /oas

COPY package.json .
RUN npm install --python=python2.7 && rm -fr /tmp/* ~/.npm
COPY . .

EXPOSE 80

VOLUME [ "/app" ]
CMD [ "npm", "start" ]
