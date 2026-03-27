class Field{
    constructor(pos){
        this.pos = pos;
        this.north = null;
        this.east = null;
        this.south = null;
        this.west = null;
    }
    getNeighbour(dir){
        switch (dir){
            case 0: return this.north;
            case 1: return this.east;
            case 2: return this.south;
            case 3: return this.west;
        }
    }
    setNeighbour(dir,field){
        switch (dir){
            case 0: this.north = field;break;
            case 1: this.east = field;break;
            case 2: this.south = field;break;
            case 3: this.west = field;break;
        }
    }
    getNeighbours(){
        return [this.north, this.east, this.south, this.west];
    }

    setNeighbours(arr){
        let neighbours = getNeighbors(this.pos, arr)
        this.north = neighbours[0];
        this.east = neighbours[1];
        this.south = neighbours[2];
        this.west = neighbours[3];

    }

    testMove(arr, x, y, direction){
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
}

class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    static idFromPoint(x, y, fields){
        return y * fields + x;
    }

    static pointFromId(id, fields){
        return new Point(id % fields, parseInt(id/fields));
    }

    equals(point){
        return this.x == point.x && this.y == point.y;
    }
}

module.exports = { Field, Point };
