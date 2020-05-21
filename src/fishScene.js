const FishTypes = {
    BLUE: "blue",
    YELLOW: "yellow",
    STRIPE: "stripe",
    GREEN: "green"
};

class FishScene extends Phaser.Scene {
    constructor() {
        console.log('fish scene constructing');
        super('Fish');
    }

    preload() {
        console.log('fish scene preloading');
        this.load.image("fish", "assets/fish.png");
        this.load.image("yellowFish", "assets/yellowFish.png");
        this.load.image("greenFish", "assets/greenFish.png");
        this.load.image("stripeFish", "assets/stripeFish.png");
        this.load.image("purpleFish", "assets/purpleFish.png");
        this.load.image("worm", "assets/wormSmall.png");
        this.load.image("background", "assets/background.jpg");
    }

    create() {

        //register input events
        this.input.on("pointerdown", this.onPointerDown, this);

        this.background = this.add.image(0, 0, "background");
        this.background.displayWidth = 10000;
        this.background.displayHeight = 10000;
        //this.background.setOrigin(0);

        this.playerFish = this.createPlayerFish(0, 0);
        this.cameras.main.startFollow(this.playerFish);
        this.cameras.main.zoom = 0.15;

        this.littleFishes = [];
        
        for (var i = 0; i < 10; i++) {
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            var newFish = this.createBlueFish(randX, randY);
            this.littleFishes.push(newFish);
        }
        

        for (var i = 0; i < 10; i++) {
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            var newFish = this.createYellowFish(randX, randY);
            this.littleFishes.push(newFish);
        }

        for (var i = 0; i < 10; i++) {
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            var newFish = this.createStripeFish(randX, randY);
            this.littleFishes.push(newFish);
        }

        for (var i = 0; i < 10; i++) {
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            var newFish = this.createGreenFish(randX, randY);
            this.littleFishes.push(newFish);
        }

        this.wormSpawnTimer = 0;
        this.wormSpawnDelay = 3000;
        this.worms = [];

    }

    update(time, delta) {        
        this.updatePlayerFish(this.playerFish, delta);

        for (var i = 0; i < this.littleFishes.length; i++) {
            this.newUpdateAIFish(this.littleFishes[i], this.worms, delta);
        }

        if (this.wormSpawnTimer >= this.wormSpawnDelay) {
            //spawn a new worm

            var randX = 0;
            var randY = 0;
            for (var i = 0; i < 1; i++) {
                randX = Phaser.Math.Between(-window.innerWidth, window.innerWidth);
                randY = Phaser.Math.Between(-window.innerHeight, window.innerHeight);
                var theWorm = this.add.image(randX, randY, "worm");
                theWorm.scale = 4;
                this.worms.push(theWorm);
            }            
            
            this.wormSpawnTimer -= this.wormSpawnDelay;

            for (var i = 0; i < 3; i++) {
                randX = Phaser.Math.Between(0, window.innerWidth);
                randY = Phaser.Math.Between(0, window.innerHeight);
                var newFish = this.createBlueFish(randX, randY);
                this.littleFishes.push(newFish);
            }
            for (var i = 0; i < 10; i++) {
                randX = Phaser.Math.Between(-window.innerWidth, 0);
                randY = Phaser.Math.Between(-window.innerHeight, 0);
                var newFish = this.createYellowFish(randX, randY);
                this.littleFishes.push(newFish);
            }
            for (var i = 0; i < 6; i++) {
                randX = Phaser.Math.Between(0, window.innerWidth);
                randY = Phaser.Math.Between(-window.innerHeight,0);
                var newFish = this.createStripeFish(randX, randY);
                this.littleFishes.push(newFish);
            }
            for (var i = 0; i < 8; i++) {
                randX = Phaser.Math.Between(-window.innerWidth, 0);
                randY = Phaser.Math.Between(0, window.innerHeight);
                var newFish = this.createGreenFish(randX, randY);
                this.littleFishes.push(newFish);
            }
        } else {
            this.wormSpawnTimer += delta;
        }

        //check and resolve if player has eaten a fish
        for (var i = 0; i < this.littleFishes.length; i++) {
            if (this.circleOverlap(this.playerFish.getBounds(), this.littleFishes[i].getBounds())) {
                if (this.fishIsBigger(this.playerFish, this.littleFishes[i])) {
                    this.feedFish(this.playerFish);
                    this.littleFishes[i].destroy();
                    this.littleFishes.splice(i, 1);
                }
            }
        }

        //check for and resolve if fishes have got a worm
        for (var i = 0; i < this.littleFishes.length; i++) {
            for (var j = 0; j < this.worms.length; j++) {
                if (this.circleOverlap(this.littleFishes[i].getBounds(), this.worms[j].getBounds())) {
                    this.feedFish(this.littleFishes[i]);
                    this.worms[j].destroy();
                    this.worms.splice(j,1);                    
                }
            }
        }

        //check for and resolve if fishes have got a smaller fish
        for (var i = 0; i < this.littleFishes.length; i++) {
            for (var j = 0; j < this.littleFishes.length; j++) {
                if (this.littleFishes[i] != undefined && this.littleFishes[j] != undefined) {
                    if (this.fishIsBigger(this.littleFishes[i], this.littleFishes[j])) {
                        if (this.circleOverlap(this.littleFishes[i].getBounds(), this.littleFishes[j].getBounds())) {
                            this.feedFish(this.littleFishes[i]);
                            this.littleFishes[j].destroy();
                            this.littleFishes.splice(j,1);
                        }
                    }
                }
            }
        }

        //check for and resolve if player gets a worm
        for (var i = 0; i < this.worms.length; i++) {
            if (this.circleOverlap(this.playerFish.getBounds(), this.worms[i].getBounds())) {
                this.feedFish(this.playerFish);
                this.worms[i].destroy();
                this.worms.splice(i, 1);
            }
        }

        //prune out fish that are too far away to matter
        for (var i = 0; i < this.littleFishes.length; i++) {
            var fish = this.littleFishes[i];
            if(fish){
                if (this.findDistanceSquared(0, 0, fish.x, fish.y) > Math.pow(3000, 2)) {
                    fish.destroy();
                    this.littleFishes.splice(i, 1);
                }
            }else{
                console.log("ghost fish detected");
            }
            
        }

        console.log(this.littleFishes.length);

    }

    onPointerDown(pointer) {
        var worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.playerFish.moveTarget.x = worldPoint.x;
        this.playerFish.moveTarget.y = worldPoint.y;
        this.playerFish.seekingTarget = true;
    }

    //VECTOR HELPER METHODS
    findDirection(x1, y1, x2, y2) {
        var dirVector = new Phaser.Math.Vector2(x2 - x1, y2 - y1);
        dirVector.normalize();
        return (dirVector);
    }

    findDistanceSquared(x1, y1, x2, y2) {
        return ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

    }
    findDistance(x1, y1, x2, y2) {
        return Math.sqrt(this.findDistanceSquared(x1, y1, x2, y2));
    }

    //FISH FACTORY FUNCTION AND HELPER METHOD
    createAIFish(x, y, textureString) {
        var newFish = this.add.sprite(x, y, textureString);
        newFish.exp = 0;
        newFish.spawnPoint = new Phaser.Math.Vector2(x, y);
        newFish.tendToSpawnPointWeight = 0.9;
        newFish.moveSpeed = 0.15;
        newFish.fleeDistance = 150;
        newFish.fleeWeight = 12;
        newFish.feedDistance = 500;
        newFish.feedWeight = 8;
        newFish.alignmentDistance = 150;
        newFish.alignmentWeight = 2;
        newFish.cohesionDistance = 700;
        newFish.cohesionWeight = 2;
        newFish.seperationDistance = 10;
        newFish.seperationWeight = 10;
        newFish.otherTypeAvoidDistance = 150;
        newFish.otherTypeAvoidWeight = 5;
        newFish.otherSizeAvoidDistance = 150;
        newFish.otherSizeAvoidWeight = 1.5;
        newFish.setScale(1);
        newFish.maxScale = 6;
        newFish.spawnAmount = 3;
        newFish.vel = new Phaser.Math.Vector2();

        return newFish;
    }

    createBlueFish(x, y) {
        var blueFish = this.createAIFish(x, y, "fish");
        blueFish.fishType = FishTypes.BLUE;
        blueFish.setScale(1);
        blueFish.spawnAmount = 4;
        return blueFish;
    }

    createYellowFish(x, y) {
        var yellowFish = this.createAIFish(x, y, "yellowFish");
        yellowFish.moveSpeed = 0.3;
        yellowFish.setScale(0.75);
        yellowFish.maxScale = 3;
        yellowFish.spawnAmount = 10;
        yellowFish.fishType = FishTypes.YELLOW;
        return yellowFish;
    }

    createGreenFish(x, y) {
        var greenFish = this.createAIFish(x, y, "greenFish");
        greenFish.moveSpeed = 0.25;
        greenFish.setScale(0.75);
        greenFish.maxScale = 4;
        greenFish.spawnAmount = 6;
        greenFish.fishType = FishTypes.GREEN;
        return greenFish;
    }

    createStripeFish(x,y){
        var stripeFish = this.createAIFish(x,y, "stripeFish");
        stripeFish.moveSpeed = 0.2;
        stripeFish.setScale(0.75);
        stripeFish.maxScale = 5;
        stripeFish.spawnAmount = 8;
        stripeFish.fishType = FishTypes.STRIPE;
        return stripeFish;
    }

    createPlayerFish(x, y) {
        var newPlayerFish = this.add.sprite(x, y, "purpleFish");
        newPlayerFish.fishType = FishTypes.BLUE;
        newPlayerFish.exp = 0;
        newPlayerFish.moveSpeed = 0.3;
        newPlayerFish.moveTarget = new Phaser.Math.Vector2();
        newPlayerFish.seekingTarget = false;
        newPlayerFish.maxScale = 5;

        return newPlayerFish;
    }

    updateAIFish(fish, predator, delta) {
        var predatorDistance = this.findDistance(fish.x, fish.y, predator.x, predator.y);
        if (predatorDistance <= fish.fleeDistance) {
            var fishFleeVector = this.findDirection(fish.x, fish.y, predator.x, predator.y);
            fishFleeVector.x *= -1;
            fishFleeVector.y *= -1;

            fish.x += fishFleeVector.x * fish.moveSpeed * delta;
            fish.y += fishFleeVector.y * fish.moveSpeed * delta;
        }
    }

    newUpdateAIFish(fish, worms, delta) {
        var desiredVelocity = new Phaser.Math.Vector2();

        var fleeVector = this.findFleeVector(fish, this.findPredators(fish, this.playerFish, this.littleFishes));
        desiredVelocity.x += fleeVector.x * fish.fleeWeight;
        desiredVelocity.y += fleeVector.y * fish.fleeWeight;

        var feedVector = this.findFeedVector(fish, this.findFoodSources(fish, this.playerFish, worms, this.littleFishes));
        desiredVelocity.x += feedVector.x * fish.feedWeight;
        desiredVelocity.y += feedVector.y * fish.feedWeight;

        var seperationVector = this.findSeperationVector(fish, this.littleFishes);
        desiredVelocity.x += seperationVector.x * fish.seperationWeight;
        desiredVelocity.y += seperationVector.y * fish.seperationWeight;

        var cohesionVector = this.findCohesionVector(fish, this.littleFishes);
        desiredVelocity.x += cohesionVector.x * fish.cohesionWeight;
        desiredVelocity.y += cohesionVector.y * fish.cohesionWeight;

        var alignmentVector = this.findAlignmentVector(fish, this.littleFishes);
        desiredVelocity.x += alignmentVector.x * fish.alignmentWeight;
        desiredVelocity.y += alignmentVector.y * fish.alignmentWeight;

        var otherTypeAvoidanceVector = this.findOtherTypeAvoidanceVector(fish, this.littleFishes);
        desiredVelocity.x += otherTypeAvoidanceVector.x * fish.otherTypeAvoidWeight;
        desiredVelocity.y += otherTypeAvoidanceVector.y * fish.otherTypeAvoidWeight;

        var tendToSpawnPointVector = this.findTendToSpawnPointVector(fish);
        tendToSpawnPointVector.normalize();
        desiredVelocity.x += tendToSpawnPointVector.x * fish.tendToSpawnPointWeight;
        desiredVelocity.y += tendToSpawnPointVector.y * fish.tendToSpawnPointWeight;

        var randomJitter = Phaser.Math.Between(1, 9) / 10;
        desiredVelocity.x += randomJitter;
        desiredVelocity.y += randomJitter;

        desiredVelocity.normalize();
        fish.vel = desiredVelocity;
        if (desiredVelocity != Phaser.Math.Vector2.ZERO) {
            if (desiredVelocity.x > 0) {
                fish.flipX = true;
            } else if (desiredVelocity.x < 0) {
                fish.flipX = false;
            }
            //add division to speed bonus to make bigger fish slower, divide by scale
            var scaleSpeedBonus = 1;
            var speed = fish.moveSpeed * scaleSpeedBonus;
            fish.x += desiredVelocity.x * speed * delta;
            fish.y += desiredVelocity.y * speed * delta;
        }
    }

    findNearestObject(object, collection) {
        var theDistance = Number.MAX_VALUE;
        var nearestObject;
        for (var i = 0; i < collection.length; i++) {
            var newDistanceSqr = this.findDistanceSquared(object.x, object.y, collection[i].x, collection[i].y);
            if (newDistanceSqr < theDistance) {
                theDistance = newDistanceSqr;
                nearestObject = collection[i];
            }
        }
        return nearestObject;
    }

    findFleeVector(fish, predators) {
        var fleeVector = new Phaser.Math.Vector2();
        for (var i = 0; i < predators.length; i++) {
            var predatorDistance = this.findDistanceSquared(fish.x, fish.y, predators[i].x, predators[i].y);

            if (predatorDistance <= Math.pow(fish.fleeDistance + fish.displayWidth / 2 + predators[i].displayWidth / 2,2)) {
                var fishFleeVector = this.findDirection(fish.x, fish.y, predators[i].x, predators[i].y);
                fishFleeVector.x *= -1;
                fishFleeVector.y *= -1;

                fleeVector.x += fishFleeVector.x;
                fleeVector.y += fishFleeVector.y;
            }
        }
        fleeVector.normalize();
        return fleeVector;
    }

    findOtherTypeAvoidanceVector(fish, fishes) {
        var otherTypeVector = new Phaser.Math.Vector2();
        for (var i = 0; i < fishes.length; i++) {
            if (fish.fishType !== fishes[i].fishType || fish.displayWidth !== fishes[i].displayWidth) {
                var otherFishDistance = this.findDistanceSquared(fish.x, fish.y, fishes[i].x, fishes[i].y);
                if (otherFishDistance <= Math.pow(fish.otherTypeAvoidDistance + fish.displayWidth / 2 + fishes[i].displayWidth / 2, 2)) {
                    var fishAvoidVector = this.findDirection(fish.x, fish.y, fishes[i].x, fishes[i].y);
                    fishAvoidVector.x *= -1;
                    fishAvoidVector.y *= -1;
                    var perpendicularVector = new Phaser.Math.Vector2(-fishAvoidVector.y, fishAvoidVector.x);

                    otherTypeVector.x += perpendicularVector.x;
                    otherTypeVector.y += perpendicularVector.y;
                }
            }
        }
        otherTypeVector.normalize();
        return otherTypeVector;
    }

    findFeedVector(fish, foodSources) {
        var foodVector = new Phaser.Math.Vector2();
        var closestFood = this.findNearestObject(fish, foodSources);

        if (!closestFood) { return foodVector; }

        var foodDistance = this.findDistanceSquared(fish.x, fish.y, closestFood.x, closestFood.y);
        if (foodDistance <= Math.pow(fish.feedDistance + fish.displayWidth / 2,2)) {
            var fishFoodVector = this.findDirection(fish.x, fish.y, closestFood.x, closestFood.y);
            foodVector.x += fishFoodVector.x;
            foodVector.y += fishFoodVector.y;
        }

        return foodVector;
    }

    findCohesionVector(fish, fishes) {
        var centerOfMass = new Phaser.Math.Vector2();
        var neighborCount = 0;
        for (var i = 0; i < fishes.length; i++) {
            if (fish !== fishes[i] && fish.fishType === fishes[i].fishType && fish.displayWidth === fishes[i].displayWidth) {
                if (this.findDistanceSquared(fish.x, fish.y, fishes[i].x, fishes[i].y) < Math.pow(fish.cohesionDistance,2)) {                    
                    centerOfMass.x += fishes[i].x;
                    centerOfMass.y += fishes[i].y;
                    neighborCount++;                    
                }
            }
        }

        if (neighborCount > 0) {
            centerOfMass.x /= neighborCount;
            centerOfMass.y /= neighborCount;
        }

        return this.findDirection(fish.x, fish.y, centerOfMass.x, centerOfMass.y);
    }

    findSeperationVector(fish, fishes) {
        var seperationVector = new Phaser.Math.Vector2();
        var neighborCount = 0;
        for (var i = 0; i < fishes.length; i++) {
            if (fish != fishes[i] && fish.displayWidth === fishes[i].displayWidth) {
                var fishDistance = this.findDistanceSquared(fish.x, fish.y, fishes[i].x, fishes[i].y);
                if (fishDistance <= Math.pow(fish.seperationDistance + fish.displayWidth / 2 + fishes[i].displayWidth / 2, 2)) {
                    var fishDirection = this.findDirection(fish.x, fish.y, fishes[i].x, fishes[i].y);
                    seperationVector.x += fishDirection.x;
                    seperationVector.y += fishDirection.y;
                    neighborCount++;                    
                }
            }
        }

        if (neighborCount > 0) {
            seperationVector.x /= neighborCount * -1;
            seperationVector.y /= neighborCount * -1;
        }
        return seperationVector;
    }

    findAlignmentVector(fish, fishes) {
        var alignmentVector = new Phaser.Math.Vector2();
        var neighborCount = 0;
        for (var i = 0; i < fishes.length; i++) {
            if (fish !== fishes[i] && fish.fishType == fishes[i].fishType && fish.displayWidth === fishes[i].displayWidth) {
                if (this.findDistanceSquared(fish.x, fish.y, fishes[i].x, fishes[i].y) < Math.pow(fish.alignmentDistance, 2)) {
                    if (fish.displayWidth == fishes[i].displayWidth) {
                        alignmentVector.x += fishes[i].vel.x;
                        alignmentVector.y += fishes[i].vel.y;
                        neighborCount++;
                    }
                }
            }
        }

        if (neighborCount > 0) {
            alignmentVector.x /= neighborCount;
            alignmentVector.y /= neighborCount;
        }

        return alignmentVector;
    }

    findWorldCenterVector(fish) {
        var worldCenterVector = new Phaser.Math.Vector2();
        var worldCenterPoint = this.cameras.main.getWorldPoint(window.innerWidth / 2, window.innerHeight / 2);
        worldCenterVector = this.findDirection(fish.x, fish.y, worldCenterPoint.x, worldCenterPoint.y);

        return worldCenterVector;
    }

    findTendToSpawnPointVector(fish) {
        return this.findDirection(fish.x, fish.y, fish.spawnPoint.x, fish.spawnPoint.y);
    }

    findWanderVector() {

    }

    findFoodSources(fish, playerFish, worms, fishes) {
        var foodSources = [];
        foodSources = foodSources.concat(worms);
        if (this.fishIsBigger(fish, playerFish)) {
            //foodSources.push(playerFish);
        }
        for (var i = 0; i < fishes.length; i++) {
            var theFish = fishes[i];
            if (this.fishIsBigger(fish, theFish)) {
                foodSources.push(theFish);
            }
        }

        return foodSources;
    }

    findPredators(fish, playerFish, fishes) {
        var predators = [];
        if (this.fishIsBigger(playerFish, fish)) {
            predators.push(playerFish);
        }
        for (var i = 0; i < fishes.length; i++) {
            var theFish = fishes[i];
            if (this.fishIsBigger(theFish, fish)) {
                predators.push(theFish);
            }
        }

        return predators;
    }

    feedFish(fish) {
        fish.exp += 0.5;
        if (fish.exp >= fish.scale * 2) {
            this.growFish(fish);
        }
    }

    growFish(fish) {
        var targetScale = fish.scale + 0.25;
        if (targetScale <= fish.maxScale) {
            var tween = this.tweens.add({
                targets: fish,
                props: {
                    scale: { value: targetScale, duration: 1000 }
                }
            });
        }else{
            if(fish != this.playerFish){
                for (var i = 0; i < fish.spawnAmount; i++) {
                    switch(fish.fishType){
                        case FishTypes.BLUE:
                            var newFish = this.createBlueFish(fish.x, fish.y);
                            break;
                        case FishTypes.GREEN:
                            var newFish = this.createGreenFish(fish.x, fish.y);
                            break;
                        case FishTypes.YELLOW:
                            var newFish = this.createYellowFish(fish.x, fish.y);
                            break;
                        case FishTypes.STRIPE:
                            var newFish = this.createStripeFish(fish.x, fish.y);
                            break;
                    }
                    console.log("fish born");
                    this.littleFishes.push(newFish);                
                }
                var fishIndex = this.littleFishes.indexOf(fish);
                fish.destroy();
                this.littleFishes.splice(fishIndex, 1);
            }            
        }
    }

    fishIsBigger(fish, otherFish) {
        if (fish.displayWidth > otherFish.displayWidth) {
            return true;
        }
        return false;
    }

    updatePlayerFish(playerFish, delta) {
        if (playerFish.seekingTarget) {
            var moveDirection = this.findDirection(playerFish.x, playerFish.y, playerFish.moveTarget.x, playerFish.moveTarget.y);
            if (moveDirection.x > 0) {
                playerFish.flipX = true;
            } else {
                playerFish.flipX = false;
            }

            var targetDistance = this.findDistance(playerFish.x, playerFish.y, playerFish.moveTarget.x, playerFish.moveTarget.y);
            if (targetDistance > playerFish.moveSpeed * delta) {
                playerFish.x += moveDirection.x * playerFish.moveSpeed * delta;
                playerFish.y += moveDirection.y * playerFish.moveSpeed * delta;
            } else {
                console.log("arrived at target");
                playerFish.x = playerFish.moveTarget.x;
                playerFish.y = playerFish.moveTarget.y;
                playerFish.seekingTarget = false;
            }
        }
    }

    rectangleOverlap(rect1, rect2) {
        return Phaser.Geom.Rectangle.Overlaps(rect1, rect2);
    }

    circleOverlap(rect1, rect2) {
        var distance = this.findDistanceSquared(rect1.centerX, rect1.centerY, rect2.centerX, rect2.centerY);
        var combinedRadius = rect1.width / 2 + rect2.width / 2;
        if (distance <= Math.pow(combinedRadius,2)) {
            return true;
        } else {
            return false;
        }
    }
}