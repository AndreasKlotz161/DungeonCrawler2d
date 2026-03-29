const sqlite3 = require("sqlite3").verbose();

function login(username, password){
    return new Promise ((resolve, reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
    
        const statement =  db.prepare("SELECT * FROM user WHERE name=? AND password=?");
    
        statement.all(username, password, (err, users) =>{
            if (users.length == 0){
                resolve(false);
            }
            else{
                resolve(users[0]);
            }
        });
    
        statement.finalize();
        db.close();
    });
}

function createUser(name, password, isAdmin){
    return new Promise((resolve,reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const checkUsers = db.prepare("SELECT id FROM user WHERE name=?");
        checkUsers.all(name, (err, users)=>{
            if(users.length > 0){
                resolve(false);
            }
            else{
                const statement = db.prepare("INSERT INTO user (name, password, isAdmin) VALUES (?,?,?);");
        
                statement.run(name, password,isAdmin, ()=>{
                    resolve(true);
                });
                statement.finalize();
            }
        });
        checkUsers.finalize();
        db.close();
    });
}

function createCharacter(name, health, userId){
    const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
    return new Promise((resolve,reject) =>{
        const map = db.prepare("SELECT id FROM map ORDER BY id LIMIT 1;");
        map.all((err, res) => {
            if (!err && res.length > 0){
                // console.log("1 Map ID:  ", res);
                resolve(res[0].id);
            }
            else{
                reject("Theres is no existing map. -> no character created");
            }
        });
        map.finalize();
    })
    .then(mapId => {
        new Promise((resolve, reject) => {
            const checkCh = db.prepare("SELECT id FROM character WHERE userId=? AND name=?;");
            
            checkCh.all(name, userId, (err, characters)=>{
                if(err || characters.length > 0){
                    reject(`There is allready character named ${name} -> no character created \n\nError: ${err}`);
                }
                else {
                    // console.log("2 Map ID:  ", mapId);
                    resolve(mapId);
                }
            });
            checkCh.finalize();
        }).then(res =>{
            return res;
        })
        .then(mapId => {
            // console.log("3 Map ID:  ", mapId);
            if(typeof(mapId) != "number"){
                return mapId;
            }
            else {
                // // console.log(name,health,userId);
                let attack = 20*(100/health); 
                const createCh = db.prepare("INSERT INTO character (name, health, attack, userId, mapId) VALUES (?,?,?,?,?);");
                createCh.run(name, health, attack, userId, mapId, (err)=>{
                    if (err){
                        return `failed to create a charcter\n\nError: ${err}`;
                    }
                    else{
                        return true;
                    }
                });
                createCh.finalize();
            }
            db.close();
        });
    });
}

function getUserCharacters(userId){
    return new Promise((resolve,reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const getCharacters = db.prepare("SELECT id, name FROM character WHERE userId=?;");
        
        // console.log(userId);
        getCharacters.all(userId, (err, result) => {
            if(result){
                resolve(result);
            }
            else{
                resolve(false);
            }
        });
        getCharacters.finalize();
        db.close();
    });
}

function getCharacterById(characterId){
    return new Promise((resolve,reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const getCharacter = db.prepare("SELECT character.id, character.name, character.health, character.attack, character.weaponId, character.armorId, character.helmetId FROM character WHERE character.id = ?;");

        getCharacter.all(characterId, (err, result) => {
            if(result){
                resolve(result);
            }
            else{
                resolve(false);
            }
        });
        getCharacter.finalize();
        db.close();
    });
}

function getEnemys(){
    return new Promise((resolve,reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const getEnemys = db.prepare("SELECT id, name, health, attack FROM enemy;");
        
        getEnemys.all((err, result) => {
            if (err){
                // console.log(err);
            }
            if(result){
                resolve(result);
            }
            else{
                resolve(false);
            }
        });
        getEnemys.finalize();
        db.close();
    });
}

function getEnemiesOnMap(mapId){
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
        const getEnemiesOnMap = db.prepare("SELECT enemy.name, enemy.health, enemy.attack, enemyOnMap.posX, enemyOnMap.posY FROM enemy, enemyOnMap WHERE enemy.id = enemyOnMap.enemyId AND enemyOnMap.mapId = ?;")
        getEnemiesOnMap.all(mapId, (err, res) =>{
            if(err){
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}

function getMapByCharacterId(characterId){
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
        const getEnemiesOnMap = db.prepare("SELECT map.id, map.name, map.tilelist, map.startX, map.startY, map.goalX, map.goalY FROM map, character WHERE map.id == character.mapId AND character.id = ?;")
        getEnemiesOnMap.all(characterId, (err, res) =>{
            if(err){
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    })
}

function setNextMapForCharacter(currentMapId, characterId){
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
        new Promise((resolve, reject) => {
            // console.log("HUHU");
            const getnextMapId = db.prepare("SELECT map.id FROM map WHERE map.id > ? ORDER BY map.id ASC LIMIT 1;");
            getnextMapId.all(currentMapId, (err, result) => {
                if(err){
                    reject(err);
                }
                else{
                    // console.log("HUHU2");
                    resolve(result);
                }
            });
        })
        .then((newMapId) => {
            // // console.log("HUHU3   ", newMapId);
            if (newMapId.length > 0){
                const setMap = db.prepare("UPDATE character SET mapId = ? WHERE id = ?;");
                setMap.run(newMapId[0].id, characterId, (err) =>{
                    if(err){
                        reject("Map couldnt get updateed for character\n\n Error:" + err);
                    }
                    else {
                        resolve(true);
                    }
                });
            } 
            else {
                resolve(false);
            }
        })
    })
}

function createMap(mapData){
    debugger
    return new Promise((resolve, reject) => {
        mapData = JSON.parse(mapData);
        // // console.log("0: ", mapData);
        // check if start and goal was set
        if(mapData.mapStartX == null || mapData.mapGoalX == null || mapData.mapName == ""){
            reject("You have to select a start and goal and write a name for the map");
        }
        else {
            // check if name is unique
            new Promise((resolve, reject) => {
                const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
                const checkNameMapExist = db.prepare("SELECT id FROM map WHERE name= ?");
                // // console.log("map exists? ", map);
                checkNameMapExist.all(mapData.mapName, (err, result) =>{
                    if (err || result.length > 0){
                        reject(`This Mapname ("${mapData.mapName}") allready exists \n\nor Error:` + err);
                    }
                    else{
                        resolve(true);
                    }
                });
                checkNameMapExist.finalize();
                db.close();
                // // console.log("1 : MAPDATA");
            })
            .then( (res) => {
                if (res){
                    //insert mapData in db
                    return new Promise((resolve,reject) =>{
                        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
                        const insertMap = db.prepare("INSERT INTO map(name, tilelist, startX, startY, goalX, goalY) VALUES (?,?,?,?,?,?);");
                        // console.log("2: ", mapData.mapName, JSON.stringify(mapData.mapFields), mapData.mapStartX, mapData.mapStartY, mapData.mapGoalX, mapData.mapGoalY);
                        insertMap.run(mapData.mapName, JSON.stringify(mapData.mapFields), mapData.mapStartX, mapData.mapStartY, mapData.mapGoalX, mapData.mapGoalY, (err) =>{
                            if(err){
                                reject(`map ${mapData.mapName}could not be inserted to DB\n` + err);
                            }
                            else{
                                resolve(true);
                            }
                        });
                        insertMap.finalize();
                        db.close();
                    })
                }
            })
            .then( (res) =>{
                if (res == true){
                    // console.log("3 Map angelegt : " + JSON.stringify(res));
                    // get mapId
                    return new Promise((resolve, reject) => {
                        var mapId = null;
                        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
                        const checkNameMapExist = db.prepare("SELECT id FROM map WHERE name= ?");
                        checkNameMapExist.all(mapData.mapName, (err, result) => {
                            if(!err && result.length > 0){
                                mapId = result[0].id;
                                resolve(mapId);
                            }else{
                                reject(`Mapname: ${mapData.mapName} not found in DB\n` + err);
                            }
                        });
                        checkNameMapExist.finalize();
                        db.close();
                    });
                }
            })
            .then(mapId =>{
                // console.log("4: MapID gefunden: " + mapId);
                if(mapId != null && mapData.enemies.length > 0){
                    // insert enemies in db
                    return new Promise((resolve, reject) => {
                        for(let i=0; i < mapData.enemies.length; i++){
                            const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
                            const insertEnemiesOnMap = db.prepare("INSERT INTO enemyOnMap (mapId, enemyId, posX, posY) VALUES (?,?,?,?);");
                            let enemy = mapData.enemies[i];
                            // console.log("4.2: " + enemy);
                            insertEnemiesOnMap.run(mapId, enemy.enemyId, enemy.x, enemy.y, (err) => {
                                if(err){
                                    reject(`failed to insert Enemy: enemyId: ${enemy.enemyId}\n` + err);
                                }
                                if(i + 1 == mapData.enemies.length){ 
                                        resolve("Map and Enemies were saved to the database");
                                }
                            });
                            insertEnemiesOnMap.finalize();
                            db.close();
                        };
                    });
                }
                else{
                    return "Map without enemies was saved to database";
                }
            })
            .then(res => {
                // console.log("5: enemies added:---", res);
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
        }
    });
}

function createEnemy(name, health, attack){
    return new Promise((resolve,reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const checkEnemies = db.prepare("SELECT id FROM enemy WHERE name=?");
        checkEnemies.all(name, (err, enemies)=>{
            if(enemies.length > 0){
                resolve(false);
            }
            else{
                const statement = db.prepare("INSERT INTO enemy (name, health, attack) VALUES (?,?,?);");
                statement.run(name, health, attack, ()=>{
                    resolve(true);
                });
                statement.finalize();
            }
        });
        checkEnemies.finalize();
        db.close();
    });
}

module.exports = {login, createUser, createCharacter, getUserCharacters, createMap, getEnemys, createEnemy, getEnemiesOnMap, getMapByCharacterId, getCharacterById, setNextMapForCharacter};