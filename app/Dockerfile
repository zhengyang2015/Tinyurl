#基于node image构建docker
FROM node:6.3.1

RUN npm install nodemon -g
#创建tiny文件夹
RUN mkdir -p /tiny
#将tiny文件夹设定为工作目录
WORKDIR /tiny
#将当前文件夹（dockerfile所在文件夹）的内容copy到tiny文件夹中
ADD . /tiny
#运行npm install
RUN cd /tiny && npm install
#暴露3000端口（该端口号为guset的端口号，不是host的端口号，若要从host访问，还需要做端口号映射，如-p 80:3000，即将host的80端口和guest的3000端口映射）
EXPOSE 3000
#运行server.js
CMD ["nodemon", "/tiny/server.js"]