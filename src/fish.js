class Fish{
    get x(){
        return this._x;
    }
    set x(value){
        this._x = value;
        this.myImage.x = value;
    }

    get y(){
        return this._y;
    }
    set y(value){
        this._y = value;
        this.myImage.y = value;
    }

    constructor(add, x, y, textureString){
        this._x = x;
        this._y = y;
        this.moveSpeed = 0.07;
        this.detectDistance = 200;
        this.myImage = add.image(x, y, textureString);
        this.myImage.displayWidth = 50;
        this.myImage.displayHeight = 50;
    }
}