# from http://stackoverflow.com/questions/34318184/create-a-nodejs-container-docker-based-on-ubuntu
# set the base image to ubuntu
FROM ubuntu:14.04

# # Tooling setup
# For debugging
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install software-properties-common -y

RUN apt-get install wget -y
RUN apt-get install nodejs -y
RUN apt-get install nodejs-legacy -y
RUN apt-get install npm -y

# Install RethinkDB
RUN echo 'deb http://download.rethinkdb.com/apt trusty main' | tee /etc/apt/sources.list.d/rethinkdb.list
RUN wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | apt-key add -
RUN apt-get update
RUN apt-get install rethinkdb -y

# Java 8
RUN apt-add-repository ppa:webupd8team/java
RUN apt-get update
RUN apt-get install oracle-java8-installer -y
RUN export JAVA_HOME=/usr/lib/jvm/java-8-oracle

# Neo4j
RUN wget -O - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
RUN echo 'deb http://debian.neo4j.org/repo stable/' > /etc/apt/sources.list.d/neo4j.list
RUN apt-get update
RUN apt-get install neo4j -y

# # Application Setup # #
# Install nodemon
RUN npm i -g nodemon pm2

# Provides cached layer for node_modules
RUN mkdir -p /usr/src/app

# Define a working directory
WORKDIR /usr/src/app
ADD ./jarvis-latest /usr/src/app
RUN npm i

# Expose port
EXPOSE 8888

# Run app using nodemon
CMD ["/usr/src/app/start.sh"]
