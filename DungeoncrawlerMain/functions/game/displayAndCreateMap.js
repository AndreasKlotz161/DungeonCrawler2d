

function getMapData(){
    let rawData = JSON.parse(document.getElementById("mapData").textContent);
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

function packMapData(){
    let rawData = mapFields;
    rawData.flat().forEach(field =>{
        if (field.north != null){
            field.north = rawData.flat().indexOf(field.north);
        }
        if (field.east != null){
            field.east = rawData.flat().indexOf(field.east);
        }
        if (field.south != null){
            field.south = rawData.flat().indexOf(field.south);
        }
        if (field.west != null){
            field.west = rawData.flat().indexOf(field.west);
        }
    })
    return rawData
}

var mapFields = getMapData();
var mapData = { "mapFields": packMapData(), 
                "mapName": "",
                "mapStartX": null,
                "mapStartY": null,
                "mapGoalX": null,
                "mapGoalY": null,
                "enemies": []       }

function drawMap(mapData){
    let mapDiv = document.getElementById("map");
    let canvas = document.createElement("canvas");

    canvas.width = mapData.length *64;
    canvas.height = canvas.width;
    canvas.style.backgroundColor = "#da5b24";
    canvas.id = "canvasMap";
    
    mapDiv.appendChild(canvas);
    drawFieldsOnCanvas();
}

function addEnemy(x,y){
    mapData.enemies.push({"x": x,"y":y, "enemyId": parseInt(document.getElementById("enemy").value)});
    // console.log(mapData.enemies);
}


let elementSelector = 0;

function detectMouse(){
    let x_coord;
    let y_coord;
    let canvas = document.getElementById("canvasMap");
    
    document.getElementById("submit").onmouseenter = () =>{
        document.getElementById("mapDataSend").value = JSON.stringify(mapData);
        // console.log(document.getElementById("mapDataSend").value);
    }

    document.getElementById("name").addEventListener("input", () =>{
        mapData.mapName = document.getElementById("name").value;
    });

    canvas.onmousemove = mouse =>{
        x_coord = parseInt(mouse.offsetX / 64);
        y_coord = parseInt(mouse.offsetY / 64);
        drawCursor(x_coord, y_coord);
    };

    canvas.onmouseout = () =>{
        drawFieldsOnCanvas();
    }

    canvas.onclick = () =>{
        switch(elementSelector){
            case 0:
                mapData.mapStartX = x_coord;
                mapData.mapStartY = y_coord;
                elementSelector ++;
                break;
            case 1:
                mapData.mapGoalX = x_coord;
                mapData.mapGoalY = y_coord;
                elementSelector ++;
                break;
            default:
                addEnemy(x_coord, y_coord);
        }
    }
}

function drawFieldsOnCanvas(){
    mapFields.forEach(row =>{
        row.forEach(field =>{
            drawFieldOnCanvas(field);
        })
    }) 
}

function drawFieldOnCanvas(field){
    let canvas = document.getElementById("canvasMap");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#101010";
    if(mapData.mapStartX == field.pos.x && mapData.mapStartY == field.pos.y){
        ctx.fillStyle = "#67e90adb";
    }
    if(mapData.mapGoalX == field.pos.x && mapData.mapGoalY == field.pos.y){
        ctx.fillStyle = "#f3080898";
    }
    if(mapData.enemies.filter(e => e.x == field.pos.x && e.y == field.pos.y).length > 0){
        ctx.fillStyle = "#a500e698";
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


function drawCursor(x, y){
    let canvas = document.getElementById("canvasMap");
    let ctx = canvas.getContext("2d");
    cursorColor = ["#9adb6c98", "#db6c6c98", "#a500e698"];
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawFieldsOnCanvas();
    ctx.fillStyle = cursorColor[elementSelector];
    ctx.fillRect(5+ (64*x), 5+ (64*y), 54 ,54);
    ctx.stroke();
}

drawMap(mapFields);
detectMouse();
// var rawData = document.getElementById("mapData").textContent;
// console.log(rawData);

// exports = {getMapData, drawFieldOnCanvas, drawFieldsOnCanvas};