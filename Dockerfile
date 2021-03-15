FROM node:slim
WORKDIR /project
ENV LANG C.UTF-8
COPY . /project
RUN npm i --registry=https://registry.npm.taobao.org/ &&\
    echo "over,success"
