FROM node:10
WORKDIR /actionhero

ADD . ./
#RUN git clone https://github.com/actionhero/actionhero.git /actionhero
RUN npm install

#CMD node_modules/.bin/actionhero start
CMD node node_modules/.bin/actionhero start
EXPOSE 8080
