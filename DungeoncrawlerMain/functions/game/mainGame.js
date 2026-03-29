
function getEnemies(){
    return JSON.parse(document.getElementById("enemiesData").textContent);
}

function getMapData(){
    return JSON.parse(document.getElementById("mapData").textContent);
}

function unpackMapFields(mapFields){
    let rawData = JSON.parse(mapFields);
    rawData.flat().forEach((field) => {
        if (field.north != null){
            field.north = rawData.flat()[field.north];
        }
        if (field.east != null){
            field.east = rawData.flat()[field.east];
        }
        if (field.south != null){
            field.south = rawData.flat()[field.south];
        }
        if (field.west != null){
            field.west = rawData.flat()[field.west];
        }
    });
    return rawData;
}

function getCharacter(){
    return JSON.parse(document.getElementById("charcterData").textContent)
}


function drawMap(mapFields){
    let mapDiv = document.getElementById("map");
    let canvas = document.createElement("canvas");

    canvas.width = mapFields.length *64;
    canvas.height = canvas.width;
    canvas.style.backgroundColor = "#da5b24";
    canvas.id = "canvasMap";
    
    mapDiv.appendChild(canvas);
    drawFieldsOnCanvas(mapFields);
    drawCharacter(character.posX, character.posY);
    enemies.forEach(enemy => {
        drawEnemy(enemy.posX, enemy.posY);
    });
}

function drawCharacter(x,y){
    let canvas = document.getElementById("canvasMap");
    let ctx = canvas.getContext("2d");
    
    ctx.beginPath();
    ctx.arc(32 + x*64, 32 + y* 64, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#15ff00";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#075500";
    ctx.stroke();
}

function drawEnemy(x, y){
    let canvas = document.getElementById("canvasMap");
    let ctx = canvas.getContext("2d");
    
    ctx.beginPath();
    ctx.arc(32 + x * 64, 32 + y* 64, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#fbff00";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff9100";
    ctx.stroke();
}


function drawFieldsOnCanvas(mapTiles){
    mapTiles.forEach(row =>{
        row.forEach(field =>{
            drawFieldOnCanvas(field);
        })
    })
}

function drawFieldOnCanvas(field){
    let canvas = document.getElementById("canvasMap");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#101010";
    if(mapData.startX == field.pos.x && mapData.startY == field.pos.y){
        ctx.fillStyle = "#00a2ff";
    }
    if(mapData.goalX == field.pos.x && mapData.goalY == field.pos.y){
        ctx.fillStyle = "#f30808";
    }
    ctx.fillRect(5+(field.pos.x * 64), 5+ (field.pos.y * 64), 54, 54);
    ctx.stroke();
    if (field.north != null){
        ctx.fillRect(5+(field.pos.x * 64), (field.pos.y * 64), 54, 5);
    }
    if (field.east != null){
        ctx.fillRect(59+(field.pos.x * 64), 5+(field.pos.y * 64), 5, 54);
    }
    if (field.south != null){
        ctx.fillRect(5+(field.pos.x * 64), 59+(field.pos.y * 64), 54, 5);
    }
    if (field.west != null){
        ctx.fillRect((field.pos.x * 64), 5+(field.pos.y * 64), 5, 54);
    }
}

function detectGoalReached(){
    return (character.posX === mapData.goalX && character.posY === mapData.goalY);
}

function detectEnemy(){
    let result = -1
    enemies.forEach((enemy, index) =>{
        if(enemy.posX == character.posX && enemy.posY == character.posY){
            // console.log(index);
            result = index;
        }
    })
    return result;
}

function moveEnemyRandomly(enemy){
    let dir = parseInt(Math.random()*16) % 6;
    let currentEnemyField = mapData.tilelist[enemy.posY][enemy.posX];
    if (dir == 1 && currentEnemyField.east != null){
        enemy.posX = currentEnemyField.east.pos.x;
        enemy.posY = currentEnemyField.east.pos.y;
    } 
    if (dir == 3 && currentEnemyField.west != null){
        enemy.posX = currentEnemyField.west.pos.x;
        enemy.posY = currentEnemyField.west.pos.y;
    }
    if (dir == 0 && currentEnemyField.north != null){
        enemy.posX = currentEnemyField.north.pos.x;
        enemy.posY = currentEnemyField.north.pos.y;
    }
    if (dir == 2 && currentEnemyField.south != null){
        enemy.posX = currentEnemyField.south.pos.x;
        enemy.posY = currentEnemyField.south.pos.y;
    }
}

function pushEnemy(enemy){
    let dir = (Math.random()*12 )%4;
    let currentEnemyField = mapData.tilelist[enemy.posY][enemy.posX];
    let currentCharacterField = mapData.tilelist[character.posY][character.posX];
    if (currentEnemyField.east != null && currentEnemyField.east != currentCharacterField){
        enemy.posX = currentEnemyField.east.pos.x;
        enemy.posY = currentEnemyField.east.pos.y;
    } 
    else if (currentEnemyField.west != null && currentEnemyField.west != currentCharacterField){
        enemy.posX = currentEnemyField.west.pos.x;
        enemy.posY = currentEnemyField.west.pos.y;
    }
    else if (currentEnemyField.north != null && currentEnemyField.north != currentCharacterField){
        enemy.posX = currentEnemyField.north.pos.x;
        enemy.posY = currentEnemyField.north.pos.y;
    }
    else if (currentEnemyField.south != null && currentEnemyField.south != currentCharacterField){
        enemy.posX = currentEnemyField.south.pos.x;
        enemy.posY = currentEnemyField.south.pos.y;
    }
}

var mapData = getMapData();
mapData.tilelist = unpackMapFields(mapData.tilelist);
document.title = `PLAY GAME - MAP: ${mapData.name}`;
document.getElementById("currentMapId").setAttribute("value", mapData.id);

var enemies = getEnemies();

var character = getCharacter()[0];
character.posX = mapData.startX;
character.posY = mapData.startY;
document.getElementById("currentCharacterId").setAttribute("value", character.id);

document.getElementById("characterName").textContent = character.name;
const charHealth = document.getElementById("characterHealth");
charHealth.textContent = character.health;
const charAttack = document.getElementById("characterAttack");
charAttack.textContent = character.attack;
document.getElementById("characterHelmet").textContent = character.helmetId;
document.getElementById("characterArmor").textContent = character.armorId;
document.getElementById("characterWeapon").textContent = character.weaponId;

// console.log(mapData);
// console.log(enemies);
// console.log(character);

drawMap(mapData.tilelist);





const checkKey = document.body.onkeydown = event =>{
    let currentCharacterField = mapData.tilelist[character.posY][character.posX];
    // console.log(event.key);
    if (event.key == "ArrowRight" && currentCharacterField.east != null){
        character.posX = currentCharacterField.east.pos.x;
        character.posY = currentCharacterField.east.pos.y;
    } 
    if (event.key =="ArrowLeft" && currentCharacterField.west != null){
        character.posX = currentCharacterField.west.pos.x;
        character.posY = currentCharacterField.west.pos.y;
    }
    if (event.key == "ArrowUp" && currentCharacterField.north != null){
        character.posX = currentCharacterField.north.pos.x;
        character.posY = currentCharacterField.north.pos.y;
    }
    if (event.key == "ArrowDown" && currentCharacterField.south != null){
        character.posX = currentCharacterField.south.pos.x;
        character.posY = currentCharacterField.south.pos.y;
    }
    drawFieldsOnCanvas(mapData.tilelist);
    drawCharacter(character.posX, character.posY);
    enemies.forEach(enemy => {
        moveEnemyRandomly(enemy);
        drawEnemy(enemy.posX, enemy.posY);
    });
    
    setTimeout(() => {
        if (detectGoalReached()){
            // alert("Goal reached!");
            document.getElementById("finished").style.visibility = "visible";
            document.body.onkeydown = null;
        }
        let enemyIndex = detectEnemy();
        // console.log(enemyIndex);
        if (enemyIndex != -1){
            document.body.onkeydown = null; 
            let currEnemy = enemies[enemyIndex];
            
            document.getElementById("enemyName").textContent = currEnemy.name;
            const enemyHealth =  document.getElementById("enemyHealth");
            const enemyAttack = document.getElementById("enemyAttack");
            enemyHealth.textContent = currEnemy.health;
            enemyAttack.textContent = currEnemy.attack;
            document.getElementById("displayEnemy").style.visibility = "visible";
            if (currEnemy.health > 0){
                document.getElementById("attack").onclick = () =>{
                    currEnemy.health -= character.attack;
                    enemyHealth.textContent = currEnemy.health;
                    if(currEnemy.health < 1){
                        enemies.pop(enemyIndex);
                        setTimeout(() => {
                            enemyHealth.textContent = "ENEMY DEFEATED";
                        }, 1500);
                        document.getElementById("displayEnemy").style.visibility = "hidden";
                        document.body.onkeydown = checkKey;
                    }
                    else {
                        setTimeout(() =>{
                            character.health -= currEnemy.attack;
                            charHealth.textContent = character.health;
                        }, 500);
                    }
                }
                document.getElementById("push").onclick = () => {
                    setTimeout(() => {
                            enemyHealth.textContent = "ENEMY PUSHED AWAY";
                            for(let i = 0; i < 5; i++){
                                pushEnemy(currEnemy);
                                drawFieldsOnCanvas(mapData.tilelist);
                                drawCharacter(character.posX, character.posY);
                                drawEnemy(currEnemy.posX, currEnemy.posY);
                                setTimeout(() => {}, 300);
                            }
                            document.getElementById("displayEnemy").style.visibility = "hidden";
                            document.body.onkeydown = checkKey;
                    }, 1500);
                }
                    // else {
                    //     setTimeout(() =>{
                    //         character.health -= currEnemy.attack;
                    //         charHealth.textContent = character.health;
                    //     }, 500);
                    // }
            }
        }
    },200);
}
