function createCookie(){
    let random1 = parseInt(Math.random() * 100_000_000); // "_" zwischen ziffern werden vom interpreter ignoriert
    let random2 = parseInt(Math.random() * 100_000_000);
    
    return random1.toString(16) + random2.toString(16);
}

module.exports = {createCookie};