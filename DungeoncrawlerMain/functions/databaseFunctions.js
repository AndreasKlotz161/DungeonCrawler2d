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
    return new Promise((resolve,reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
        
        const map = db.prepare("SELECT id FROM map ORDER BY id LIMIT 1;");
        let startMap = undefined;
        map.all(res => {startMap = res;});
        map.finalize();
        console.log(startMap);

        const checkCh = db.prepare("SELECT id FROM character WHERE userId=? AND name=?;");
        
        let existing = false;
        checkCh.all(name, userId, (err, characters)=>{
            if(characters > 0){
                existing = true;
            }
        });
        checkCh.finalize();

        if (!existing){
            console.log(name,health,userId);
            let attack = 20*(100/health); 
            const createCh = db.prepare("INSERT INTO character (name, health, attack, userId, mapId) VALUES (?,?,?,?,?);");
            createCh.run(name, health, attack, userId, (map != undefined? map[0]: 1), ()=>{
                resolve(true);
            });
            createCh.finalize();
        }
        else {
            resolve(false);
        }
        db.close();
    });
}

function getUserCharacters(userId){
    return new Promise((resolve,reject) =>{
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");

        const getCharacters = db.prepare("SELECT id, name FROM character WHERE userId=?;");
        
        console.log(userId);
        getCharacters.all(userId, (err, result) => {
            if(result){/////////////////////////////////////////////////// <---------------------------------
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

function createMap(mapArray){
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database("functions/database/dungeoncrawlerDB.sqlite");
        
        const statement = db.prepare("INSERT")
        getCharacters.finalize();
        db.close();
    });
}

module.exports = {login, createUser, createCharacter, getUserCharacters};