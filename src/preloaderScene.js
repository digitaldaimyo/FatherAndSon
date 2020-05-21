class PreloaderScene extends Phaser.Scene {
    constructor(){
        console.log('preloader constructing');
        super('Preloader');
    }
    
    preload(){
        console.log('preloader preloading');
        this.load.image("fish", "assets/fish.jpg");
        this.load.image("worm", "assets/worm.png");
    }

    create(){
        this.wormSpawnTimer = 0;
        this.wormSpawnDelay = 10000;

        this.littleFishes = [];
        this.moveSpeed = 0.1;
        this.moveTarget = new Phaser.Math.Vector2(100,100);
        this.seekingTarget = false;

         //register input events
         this.input.on("pointerdown", this.onPointerDown, this);

        console.log('preloader creating');
        this.fish = this.add.image(100, 100, "fish");

        this.school = new School([this.fish], []);

        for(var i = 0; i < 5; i++){
            var newFish = new Fish(this.add, 250 + i * 75, 400, "fish");
            this.school.fishes.push(newFish);
        }
    }

    onPointerDown(pointer){
        console.log('pointerdown');
        this.moveTarget.x = pointer.x;
        this.moveTarget.y = pointer.y;
        this.seekingTarget = true;
    }

    update(time, delta){
        //worm code
        if(this.wormSpawnTimer >= this.wormSpawnDelay){
            //spawn a new worm
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            var theWorm = this.add.image(randX, randY, "worm");
            theWorm.setScale(0.2);
            this.school.foodSources.push(theWorm);
            this.wormSpawnTimer -= this.wormSpawnDelay;
        }else{
            this.wormSpawnTimer += delta;
        }
        /*
        if(this.school.foodSources.length > 0){
            for(var i = 0; i < this.school.foodSources.length; i++){
                var theFood = this.school.foodSources[i];
                var foodRect = new Phaser.Geom.Rectangle(theFood.x, theFood.y, theFood.displayWidth, theFood.displayHeight);
                for(var j = 0; j < this.school.fishes.length; i++){
                    var theFish = this.school.fishes[j];
                    var fishRect = new Phaser.Geom.Rectangle(theFish.x, theFish.y, theFish.displayWidth, theFish.displayHeight);
                    if(Phaser.Geom.Intersects.RectangleToRectangle(foodRect, fishRect)){
                        //destroy the worm
                        this.school.foodSources.splice(i, 1);
                        theFood.destroy();
                        break;
                    }
                }            
            }
        }    
        */ 

        //player fish update code
        if(this.seekingTarget){
            var moveDirection = this.findDirection(this.fish.x, this.fish.y, this.moveTarget.x, this.moveTarget.y);
            if(moveDirection.x > 0){
                this.fish.setScale(-1,1);
            }else{
                this.fish.setScale(1,1);
            }
            var targetDistance = this.findDistance(this.fish.x, this.fish.y, this.moveTarget.x, this.moveTarget.y);

            if(targetDistance > this.moveSpeed * delta){
                this.fish.x += moveDirection.x * this.moveSpeed * delta;
                this.fish.y += moveDirection.y * this.moveSpeed * delta;
            }else{
                console.log("arrived at target");
                this.fish.x = this.moveTarget.x;
                this.fish.y = this.moveTarget.y;
                this.seekingTarget = false;
            }
        } 
        
        //little fish update code
        this.school.updateFish(delta);        
    }

    findDirection(x1, y1, x2, y2){
        var dirVector = new Phaser.Math.Vector2(x2 - x1, y2 - y1);
        dirVector.normalize();
        return(dirVector);
    }

    findDistanceSquared(x1, y1, x2, y2){
        return ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

    }
    findDistance(x1, y1, x2, y2){
        return Math.sqrt(this.findDistanceSquared(x1, y1, x2, y2));
    }

    createAIFish(x,y){
        var newFish = this.add.image(x,y, "fish");
        newFish.moveSpeed = 0.07;
        newFish.fleeDistance = 200;
        //newFish.fleeWeight = 2;
        //newFish.feedDistance = 400;
        //newFish.feedWeight = 1;        
        newFish.displayWidth = 50;
        newFish.displayHeight = 50;        

        return newFish;
    }

    createPlayerFish(x,y){
        var newPlayerFish = this.add.image(x,y, "fish");

        newPlayerFish.moveSpeed = 0.1;
        newPlayerFish.moveTarget = new Phaser.Math.Vector2(100,100);
        newPlayerFish.seekingTarget = false;

        return newPlayerFish;
    }

    updateAIFish(fish, predator){
            var predatorDistance = this.findDistance(fish.x, fish.y, predator.x, predator.y);
            if(predatorDistance <= fish.fleeDistance){
                var fishFleeVector = this.findDirection(fish.x, fish.y, predator.x, predator.y);
                fishFleeVector.x *= -1;
                fishFleeVector.y *= -1;

                fish.x += fishFleeVector.x * fish.moveSpeed * delta;
                fish.y += fishFleeVector.y * fish.moveSpeed * delta;
            }
    }

    updatePlayerFish(){
        if(this.seekingTarget){
            //Find the direction to move in and turn the image the correct way
            var moveDirection = this.findDirection(this.fish.x, this.fish.y, this.moveTarget.x, this.moveTarget.y);
            if(moveDirection.x > 0){
                this.fish.setScale(-1,1);
            }else{
                this.fish.setScale(1,1);
            }

            //find the distance to the target, if we will overshoot the target set
            //the position to the target and stop seeking the target otherwise
            //move closer to the target
            var targetDistance = this.findDistance(this.fish.x, this.fish.y, this.moveTarget.x, this.moveTarget.y);
            if(targetDistance > this.moveSpeed * delta){
                this.fish.x += moveDirection.x * this.moveSpeed * delta;
                this.fish.y += moveDirection.y * this.moveSpeed * delta;
            }else{
                console.log("arrived at target");
                this.fish.x = this.moveTarget.x;
                this.fish.y = this.moveTarget.y;
                this.seekingTarget = false;
            }
        }
    }

}