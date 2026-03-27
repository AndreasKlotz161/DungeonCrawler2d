const http = require("http");
const queryString = require("querystring");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types"); // npm install mime-types

const {login, createUser,createCharacter, getUserCharacters} = require("./functions/databaseFunctions.js");
const createCookie = require("./functions/httpFunctions.js").createCookie;
const {getRandomMapArray} = require("./functions/game/buildLabyrinth.js");
const { resolve } = require("dns");

const documentRoot = "C:\\Users\\andreass\\Documents\\JsProjects\\nodeJS\\nodeJS_Project\\NodeJS_Project\\DungeoncrawlerMain\\";

//login("user" ,"xyz"); // test von login()
// login("peter", "123");


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
            console.log(user);
            let loginPromise = login(user.name, user.password);
            loginPromise.then(user =>{
                // console.log(user);
                if (user === false){
                    response.end("Login fehlerhaft");
                }
                else{
                    const cookie = createCookie();
                    response.setHeader("Set-Cookie", cookie);
                    sessions[cookie] = user;
                    console.log(user);
                    
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
                    if(result === true){
                        response.writeHead(302, "OK", {"Location":`http://127.0.0.1:3000/login?name=${user.name}&password=${user.password}`});
                        response.end();
                    }
                    else{
                        response.writeHead(200, "OK", {"content-type": "text/html"})
                        response.end(`No Character created<br><a href="http://127.0.0.1:3000/login?name=${user.name}&password=${user.password}">go to menu</a>`);
                    }
                });
                break;
            }

        case "createMap.html":{
            const filepath = path.resolve(documentRoot + "GUI/admin/createMap.html");
            const mimetype = mime.lookup(filepath);

            console.log(mimetype, filepath)
            getRandomMapArray(5).then((map) => {
                fs.readFile(filepath, (err, data)=>{
                    if (err){
                        response.writeHead(404, "Not Found");
                    }
                    else {
                        var maze = map;
                        //console.log(map);
                        debugger;
                        const dataReplacer = new Promise((resolve,reject) =>{
                            var dataNew = data.toString().replace("%MAP%", JSON.stringify(remapMaze(maze)));
                            resolve(dataNew);
                        });
                        dataReplacer.then((dataNew) => {
                            response.writeHead(200, "OK", {"Content-Type": mimetype});
                            response.end(dataNew);
                        });
                    }
                });
            });
            break;
        }

        case "createMap":

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
                        }
                        response.writeHead(200, "OK", {"Content-Type": mimetype});
                        response.end(data);
                    }
                    
                });
            }
            else{
                if(url[0] == "/"){
                    url[0] = "GUI/index.html";
                }
                const filepath = path.resolve(documentRoot + url[0]);
                console.log(filepath);

                const mimetype = mime.lookup(filepath);
                console.log(mimetype, filepath);

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
