const { Stack }  = require("./Stack.js");
const { Field,Point } = require('./Backtracking.js');


function testMove2(arr, x, y, direction){
    switch (direction){
        case 0:
            if (y -1 < 0){return false;};
            break;
        case 1:
            if (x +1 >= arr[y].length){return false;};
            break;
        case 2:
            if (y +1 >= arr.length){return false;};
            break;
        case 3:
            if (x -1 < 0){return false;};
            break;
    }
    return true;
}

function getNeighbors( id , arr){
    const pt = Point.pointFromId(id, arr[0].length);

    let result = [null,null,null,null];

    if (testMove2(arr, pt.x, pt.y, 0)){
        result [0] = arr[pt.y-1][pt.x];
    }
    if (testMove2(arr, pt.x, pt.y, 1)){
        result [1] = arr[pt.y][pt.x+1];
    }
    if (testMove2(arr, pt.x, pt.y, 2)){
        result [2] = arr[pt.y+1][pt.x];
    }
    if (testMove2(arr, pt.x, pt.y, 3)){
        result [3] = arr[pt.y][pt.x-1];
    }
    return result;
}

function getRandomBacktrackArr(arrIn,field, fields){

    let visitedFields = [];
    let backtrackFields = new Stack;
    let startFieldId = parseInt(Math.random() * (arrIn.length * arrIn[0].length));
    
    
    while (visitedFields.length < (arrIn.length * arrIn[0].length)){
        if(!visitedFields.includes(startFieldId)){
            visitedFields.push(startFieldId);
            backtrackFields.add(startFieldId);
        }
        let neighbours = getNeighbors(startFieldId, arrIn)
        let validNeighbors = neighbours
                            .filter((id) =>{
                                return id != null && !visitedFields.includes(id);
                            });
        if(validNeighbors.length == 0){
            startFieldId = backtrackFields.get();
        }
        else{
            var fieldIdCache = startFieldId;
            startFieldId = validNeighbors[parseInt(Math.random() * validNeighbors.length)];
            field.forEach((row) =>{
                row.forEach((elem) =>{
                    if (elem.pos.equals(Point.pointFromId(startFieldId,fields))){
                        var chosenNeighbourField = null;
                        field.forEach((row) => {
                            row.forEach((element) => {
                                if (element.pos.equals(Point.pointFromId(fieldIdCache,fields))){
                                    chosenNeighbourField = element;
                                }
                            });
                        });
                        elem.setNeighbour((neighbours.indexOf(startFieldId)+2)%4, field[chosenNeighbourField.pos.y][chosenNeighbourField.pos.x]);
                        field[chosenNeighbourField.pos.y][chosenNeighbourField.pos.x].setNeighbour(neighbours.indexOf(startFieldId), elem);
                    }
                });
            });
        }
    }
    return [visitedFields, field];
}

function getRandomMapArray(fields){
    return new Promise((resolve, reject) => {
        var field = [];
    
        for(let i = 0; i < fields; i++){
            field.push([]);
        }
    
        for (let y = 0; y < fields; y++){
            for (let x = 0; x < fields; x++){
                field[y][x] = new Field(new Point(x,y));
            }
        }
    
        let arrFieldId = field.map((r)=> {
            return r.map((e) =>{
                return Point.idFromPoint(e.pos.x, e.pos.y, fields);
            });
        });
        let res = getRandomBacktrackArr(arrFieldId,field,fields);
        // console.log(res[0]); // ausgabe der backtrackliste
        resolve(res[1]);
    });
}

// console.log(getRandomMapArray(10)); // testausgabe des arrays aus Fields

module.exports = {getRandomMapArray};