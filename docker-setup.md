### RethinkDB
1. `source /etc/lsb-release && echo 'deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main' | sudo tee /etc/apt/sources.list.d/rethinkdb.list`
1. `wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -`
1. `sudo apt-get update`
1. `sudo apt-get install rethinkdb`

### Java 8
1. `sudo apt-add-repository ppa:webupd8team/java`
1. `sudo apt-get update`
1. `sudo apt-get install oracle-java8-installer`
1. `export JAVA_HOME=/usr/lib/jvm/java-8-oracle`

### Neo4j
1. `wget -O - https://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -`
1. `echo 'deb http://debian.neo4j.org/repo stable/' >/tmp/neo4j.list`
1. `sudo mv /tmp/neo4j.list /etc/apt/sources.list.d`
1. `sudo apt-get update`
1. `sudo apt-get install neo4j`
