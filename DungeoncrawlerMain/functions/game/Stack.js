class Stack{
    constructor(value = null){
        if (value){
            this.stack = [].concat(value);
        }
        else{
            this.stack = [];
        }
    }
    // returns the top element from the stack but it stays on the stack
    peek(){
        if (this.stack.length > 0){
            return this.stack[this.stack.length-1];
        }
        else{
            console.log("stack is empty");
        }
    }
    // adds an element on top of the stack
    add(value){
        this.stack = this.stack.concat(value);
    }
    // returns the top element and deletes it from the stack
    get(){
        if (this.stack.length > 0){
            return this.stack.pop();
        }
        else{
            console.log("stack is empty");
        }
    }
    // returns the size of the stack
    size(){
        if (this.stack.length == 0){
            return 0;
        }
        return this.stack.length;
    }
}

module.exports = {Stack};
