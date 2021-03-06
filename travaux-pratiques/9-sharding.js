// Création des dossiers
/*
mkdir /data/confserv;
mkdir /data/n1;
mkdir /data/n2;
mkdir /data/n3;
*/

// Création des instances
/*
mongod --port 27001  --configsvr --dbpath /data/confserv
// A partir de 3.4
// mongod --port 27002  --configsvr --dbpath /data/confserv2 --replSet pythagore
// mongod --port 27003  --configsvr --dbpath /data/confserv3 --replSet pythagore

mongod --port 27018 --shardsvr --dbpath /data/n1 /!\ --port 27017
mongod --port 27019 --shardsvr --dbpath /data/n2 /!\ --port 27017
mongod --port 27020 --shardsvr --dbpath /data/n3 /!\ --port 27017
*/

// Connexion au mongos
// mongos --configdb jb-laptop:27001 --chunkSize 1 (64mo par def)
// A partir de la version 3.4
// mongos --configdb <replSet_Name>/jb-laptop:27001,jb-laptop:27002
// use config
// db.settings.save( { _id:"chunksize", value: 1 } )

// Ajout des shards
// mongo --host jb-laptop --port 27017
sh.addShard("jb-laptop:27018"); // <replSet_Name>/jb-laptop:27018,jb-laptop:27019
sh.addShard("jb-laptop:27019");
sh.addShard("jb-laptop:27020");

// Ajout des donnees test
use testsh
for (var i=0; i<50000; i++) {
  db.users.insert({"numero": "Utilisateur"+i, "name": "Utilisateur"+i, "created_at": new Date()});
}

// Check
sh.status();

// Activation du sharding sur la base
sh.enableSharding("testsh");

// Check
sh.status();

// Preparation au shardingUtilisateur52368
db.users.createIndex({ name: "hashed" });

// On active le sharding pour la collection users
sh.shardCollection("testsh.users", { name : "hashed" });

// Check
sh.status();

// remove cache
db.users.find({}).itcount();

// Test query
db.users.find({name: "Utilisateur22368"});

db.users.find({name: "Utilisateur22368"}).explain();

// Controler la repartition

sh.addShardTag('shardOOOO', 'Lot 1')
sh.addShardTag('shardOOO1', 'Lot 2')
sh.addShardTag('shardOOO2', 'Lot 3')

sh.addTagRange('testsh.users', {name: MinKey}, {name: "Utilisateur15000"}, 'Lot 1');
sh.addTagRange('testsh.users', {name: "Utilisateur15000"}, {name: "Utilisateur30000"}, 'Lot 2');
sh.addTagRange('testsh.users', {name: "Utilisateur30000"}, {name: MaxKey}, 'Lot 3');

sh.status();

// Supprimer un shard
use admin

db.adminCommand({removeShard : "xxx" })

db.adminCommand({removeShard : "xxx" }) 
// Check le statut d'avancement et le champ remaining indique les traitements restants
// Si le champ dbsToMove est indiqué alors :
db.runCommand({movePrimary: "db_in_dbstomove", to: "another_shard"})

db.adminCommand({removeShard : "xxx" }) // removeshard completed successfully

sh.status()


