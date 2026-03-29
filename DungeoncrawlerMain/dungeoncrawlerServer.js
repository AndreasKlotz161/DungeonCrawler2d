const http = require("http");
const queryString = require("querystring");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types"); // npm install mime-types

const {login, createUser,createCharacter, getUserCharacters, createMap, getEnemys, createEnemy, getEnemiesOnMap, getMapByCharacterId, getCharacterById, setNextMapForCharacter} = require("./functions/databaseFunctions.js");
const createCookie = require("./functions/httpFunctions.js").createCookie;
const {getRandomMapArray} = require("./functions/game/buildLabyrinth.js");


const documentRoot = __dirname +"\\";


const remapMaze = function ( maze ) {
    let flatMaze = maze.flat();

    flatMaze.forEach( field => {
        if(field.north) {
            field.north = flatMaze.indexOf( field.north )
        }
        if(field.east) {
            field.east = flatMaze.indexOf( field.east )
        }
        if(field.south) {
            field.south = flatMaze.indexOf( field.south )
        }
        if(field.west) {
            field.west = flatMaze.indexOf( field.west )
        }
    })
    return maze;
}

// function getMapData(rawData){
//     let mapData = JSON.parse(rawData);
//     mapData.flat().forEach((field) => {
//         if (field.north != null){
//             field.north = mapData.flat()[field.north];
//         }
//         if (field.east != null){
//             field.east = mapData.flat()[field.east];
//         }
//         if (field.south != null){
//             field.south = mapData.flat()[field.south];
//         }
//         if (field.west != null){
//             field.west = mapData.flat()[field.west];
//         }
//     });
//     return mapData;
// }

var sessions = {}; // variable um sessioncookies zu speichern

const server = http.createServer((request, response) => {
    const url = request.url.split("?");
    
    const endpoints = url[0].split("/");
    
    switch(endpoints[1]){
        case "logout":
            sessions[request.headers["cookie"]] = null;
            response.end( "<a href='/'>LOGIN</a><br><br>" + "Du wurdest abgemeldet.")
            break;
        case "login":
            const user = queryString.parse(url[1]);
            //console.log(user);
            let loginPromise = login(user.name, user.password);
            loginPromise.then(user =>{
                // console.log(user);
                if (user === false){
                    response.end("<a href='/'>back to login</a><p>Login fehlerhaft</p><br>");
                }
                else{
                    const cookie = createCookie();
                    response.setHeader("Set-Cookie", cookie);
                    sessions[cookie] = user;
                    // console.log(user);
                    
                    const documentPath = user.isAdmin == 1? "GUI/admin/menuAdmin.html" : "GUI/notAdmin/menuUser.html"
                    const filepath = path.resolve(documentRoot + documentPath);
                    const mimetype = mime.lookup(filepath);

                    fs.readFile(filepath, (err, data)=>{
                        if (err){
                            response.writeHead(404, "Not Found");
                        }
                        else {
                            if(mimetype == "text/html"){
                                data = data.toString().replace("%USERNAME%", user.name);
                                if (user.isAdmin == 0){
                                    getUserCharacters(user.id).then((char) =>{
                                        var characters= "";
                                        if (char){
                                            char.forEach(element => {
                                                characters += `<option value='${element.id}'>${element.name}</option>`;
                                            });
                                        }
                                        data = data.replace("%CHARACTERS%", characters);
                                        response.writeHead(200, "OK", {"Content-Type": mimetype});
                                        response.end(data);
                                    });
                                }
                                else{
                                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                                    response.end(data);
                                }
                            }
                        }       
                    });
                }
            });
            break;

        case "createUser.html":{
            const filepath = path.resolve(documentRoot + "GUI/createUser.html");
            const mimetype = mime.lookup(filepath);

            fs.readFile(filepath, (err, data)=>{
                if (err){
                    response.writeHead(404, "Not Found");
                }
                else {
                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                    response.end(data);
                }
                
            });}
            break;
            
        case "createUser":
            let newUser = queryString.parse(url[1]);
            const createUserPromise = createUser(newUser.name, newUser.password, parseInt(newUser.isAdmin));

            createUserPromise.then(result =>{
                if(result === true){
                    response.writeHead(302, "OK", {"Location":`http://127.0.0.1:3000/login?name=${newUser.name}&password=${newUser.password}`});
                    response.end();
                }
                else{
                    response.writeHead(200, "OK", {"content-type": "text/html"})
                    response.end("No User created<br><a href='http://127.0.0.1:3000/'>go to login</a>");
                }
            });

            break;

        case "createCharacter.html":{
            const filepath = path.resolve(documentRoot + "GUI/notAdmin/newCharacter.html");
            const mimetype = mime.lookup(filepath);

            fs.readFile(filepath, (err, data)=>{
                if (err){
                    response.writeHead(404, "Not Found");
                }
                else {
                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                    response.end(data);
                }
                
            });}
            break;

        case "createCharacter":
            if(sessions[request.headers["cookie"]] != undefined){
                const user = sessions[request.headers["cookie"]];
                let newCharacter = queryString.parse(url[1]);
                const newCharacterPromise = createCharacter(newCharacter.name, newCharacter.health, user.id);
    
                newCharacterPromise.then((result) => {
                    // console.log("RESULT: ", typeof(result));
                    if(result === undefined){
                        response.writeHead(302, "OK", {"Location":`http://127.0.0.1:3000/login?name=${user.name}&password=${user.password}`});
                        response.end();
                    }
                    else{
                        response.writeHead(200, "OK", {"content-type": "text/html"})
                        response.end(`<p>${result}</p><br><a href="http://127.0.0.1:3000/login?name=${user.name}&password=${user.password}">go to menu</a>`);
                    }
                });
                break;
            }
            else {
                response.writeHead(302, "OK", {"Location":`http://127.0.0.1:3000`});
                response.end();
                break;
            }

        case "createMap.html":{
            const filepath = path.resolve(documentRoot + "GUI/admin/createMap.html");
            const mimetype = mime.lookup(filepath);

            let mapSize = queryString.parse(url[1]).mapSize;
            // console.log(mapSize);
            mapSize = mapSize == ""? 5: parseInt(mapSize) > 15? 15 : parseInt(mapSize);

            getRandomMapArray(mapSize).then((map) => {
                fs.readFile(filepath, (err, data)=>{
                    if (err){
                        response.writeHead(404, "Not Found");
                    }
                    else {
                        getEnemys().then((enemies) =>{
                            let enemiesOpt = "";
                            enemies.forEach(enemy =>{
                                enemiesOpt += `<option value='${enemy.id}'>${enemy.name} | HP: ${enemy.health} | AP: ${enemy.attack}</option>`;
                            });
                            return enemiesOpt;
                        })
                        .then(res =>{
                            var maze = map;
                            const dataReplacer = new Promise((resolve,reject) =>{
                                var dataNew = data.toString().replace("%MAP%", JSON.stringify(remapMaze(maze))).replace("%ENEMIES%", res);
                                resolve(dataNew);
                            });
                            dataReplacer.then((dataNew) => {
                                response.writeHead(200, "OK", {"Content-Type": mimetype});
                                response.end(dataNew);
                            });
                        })
                    }
                });
            });
            break;
        }

        case "createMap":
            if (request.method === 'POST') {
                let data = '';
                request.on('data', part => {
                    data += part.toString();
                });
                request.on('end', () => {
                    const postData = queryString.parse(data);
                    const createMapPromise = createMap(postData.mapDataSend);

                    createMapPromise
                    .then(result =>{
                        response.end(`<p>${result}</p><br><a href="/">kcab ot unem</a>`);
                    })
                    .catch(err => {
                        response.end(`<p>${err}</p><br><a href="/">kcab ot unem</a>`);
                    })
                    ;
                });
            }
            else {
                response.end('<p>Send only POST requests</p><br><a href="/">kcab ot unem</a>');
            }
            break;

        case "newEnemy.html":{
            const filepath = path.resolve(documentRoot + "GUI/admin/newEnemy.html");
            const mimetype = mime.lookup(filepath);
            // console.log(mimetype, filepath);

            fs.readFile(filepath, (err, data)=>{
                if (err){
                    response.writeHead(404, "Not Found");
                }
                else {
                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                    response.end(data);
                }   
            });
            break;
        }

        case "createEnemy":
            let newEnemy = queryString.parse(url[1]);
            const createEnemyPromise = createEnemy(newEnemy.name, newEnemy.health, newEnemy.attack);

            createEnemyPromise.then(result =>{
                if(result === true){
                    response.writeHead(302, "OK", {"Location":`/`});
                    response.end("");
                }
                else{
                    response.writeHead(200, "OK", {"content-type": "text/html"})
                    response.end("No Enemy created<br><a href='/'>go to menu</a>");
                }
            });
            break;

        case "playGame.html":{
            if(sessions[request.headers["cookie"]] != undefined){
                const user = sessions[request.headers["cookie"]];
                const filepath = path.resolve(documentRoot + "GUI/notAdmin/playGame.html");
                const mimetype = mime.lookup(filepath);
                const loginHref = "/"// `/login?user=${user.name}&password=${user.password}`;
                //console.log(mimetype, filepath);

                const characterId = parseInt(queryString.parse(url[1]).character);
                //console.log("charID: ", characterId);
                
                fs.readFile(filepath, (err, data)=>{
                    if (err){
                        response.writeHead(404, "Not Found");
                    }
                    else {
                        getMapByCharacterId(characterId).then(map =>{
                            // console.log(map);
                            return [map[0].id, data.toString().replace("%MAP%", JSON.stringify(map[0])).replace("%LOGIN%", loginHref)];
                        }).then(data =>{
                            getEnemiesOnMap(data[0]).then(enemies =>{
                                //console.log("ENEMIES: " , enemies);
                                return data[1].replace("%ENEMIES%", JSON.stringify(enemies))
                            }).then(data => {
                                getCharacterById(characterId).then(character =>{
                                    return data.replace("%CHARACTER%", JSON.stringify(character));
                                }).then(data =>{
                                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                                    response.end(data);
                                });
                            })
                        });
                    }   
                });
            } 
            else{
                response.writeHead(302, "OK", {"Location":`/`});
                response.end("");
            }
            break;
        }
        case "nextMap":
            data = queryString.parse(url[1]);
            // console.log(data.currentCharacterId + " ||| " +  data.currentMapId);
            setNextMapForCharacter(data.currentMapId, data.currentCharacterId)
            .then(result =>{
                if(result === true){
                    response.writeHead(302, "OK", {"Location":`/playGame.html?character=${data.currentCharacterId}`});
                    response.end("Next Map");
                }
                else{
                    response.writeHead(200, "OK", {"content-type": "text/html"})
                    response.end("You have played all Maps<br><a href='/'>go to menu</a>");
                }
            });
            break;

        default:
            if(sessions[request.headers["cookie"]] != undefined){
                const user = sessions[request.headers["cookie"]];
                var documentPath = url[0];
                if (url[0] == "/"){
                    documentPath = user.isAdmin == 1? "GUI/admin/menuAdmin.html" : "GUI/notAdmin/menuUser.html"
                }
                const filepath = path.resolve(documentRoot + documentPath);
                const mimetype = mime.lookup(filepath);
                console.log(mimetype, filepath);

                fs.readFile(filepath, (err, data)=>{
                    if (err){
                        response.writeHead(404, "Not Found");
                    }
                    else {
                        if(mimetype == "text/html"){
                            data = data.toString().replace("%USERNAME%", user.name);
                            console.log(user);
                            if (user.isAdmin == 0){
                                getUserCharacters(user.id)
                                .then((char) =>{
                                    var characters= "";
                                    if (char){
                                        char.forEach(element => {
                                            characters += `<option value='${element.id}'>${element.name}</option>`;
                                        });
                                    }
                                    return data.replace("%CHARACTERS%", characters);
                                })
                                .then( newData =>{
                                    response.writeHead(200, "OK", {"Content-Type": mimetype});
                                    response.end(newData);
                                });
                            }
                            else {
                                response.writeHead(200, "OK", {"Content-Type": mimetype});
                                response.end(data);
                            }
                        }
                        else{
                            response.writeHead(200, "OK", {"Content-Type": mimetype});
                            response.end(data);
                        }
                    }      
                });


            }
            else{
                if(url[0] == "/"){
                    url[0] = "GUI/index.html";
                }
                const filepath = path.resolve(documentRoot + url[0]);
                const mimetype = mime.lookup(filepath);
                fs.readFile(filepath, (err, data)=>{
                    if (err){
                        response.writeHead(404, "Not Found");
                    }
                    else {
                        response.writeHead(200, "OK", {"Content-Type": mimetype});
                        response.end(data);
                    }
                    
                });
            }
    }
});

server.listen(3000);
