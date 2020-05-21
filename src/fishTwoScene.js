class FishTwoScene extends Phaser.Scene {


    constructor() {
        console.log('fish scene constructing');
        super("FishTwo");
    }

    preload() {
        console.log('fish scene preloading');
        this.load.image("background", "assets/background.jpg");
        this.load.image("fish", "assets/fish.jpg");
        //this.load.image("worm", "assets/worm.png");
    }

    create() {
        this.input.on("pointerdown", this.onPointerDown, this);
        this.background = this.add.image(0, 0, "background");
        this.background.setOrigin(0);
        this.playerFish = this.createPlayerFish(100, 100);
        this.cameras.main.startFollow(this.playerFish);
        this.cameras.main.zoom = 0.5;





        //stuff it in our fishes basket

        this.fishes = [];
        for (var i = 0; i < 10; i++) {
            //pick a random x and y
            var randX = Phaser.Math.Between(0, window.innerWidth);
            var randY = Phaser.Math.Between(0, window.innerHeight);
            //create an AI fish
            var newFish = this.createAIFish(randX, randY);
            var randScale = Phaser.Math.Between(0.5, 2);
            newFish.scale = randScale;
            //stuff it in our fishes basket
            this.fishes.push(newFish);
        }





    }

    update(time, delta) {
        this.updatePlayerFish(this.playerFish, delta);
        for (var i = 0; i < this.fishes.length; i++) {

            this.updateAIFish(this.fishes[i], this.fishes, this.playerFish, delta);
        }


        for (var i = 0; i < this.fishes.length; i++) {
            var fish = this.fishes[i];
            //does this fish overlap our fish?????
            if (this.rectangleOverlap(this.playerFish.getBounds(), fish.getBounds())) {
                this.playerFish.scale += 0.05;
                fish.destroy();
                this.fishes.splice(i, 1);
            }



        }


    }


    onPointerDown(pointer) {
        console.log('pointerdown');
        var worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.playerFish.moveTarget.x = worldPoint.x;
        this.playerFish.moveTarget.y = worldPoint.y;
        this.playerFish.seekingTarget = true;
    }


    createPlayerFish(x, y) {
        var playerFish = this.add.image(x, y, "fish");
        playerFish.moveSpeed = 0.5;
        playerFish.moveTarget = new Phaser.Math.Vector2();
        playerFish.seekingTarget = false;
        return playerFish;
    }

    updatePlayerFish(fish, delta) {
        var moveDirection = this.findDirection(fish.x, fish.y, fish.moveTarget.x, fish.moveTarget.y);
        if (moveDirection.x > 0) {
            this.playerFish.flipX = true;
        } else {
            this.playerFish.flipX = false;
        }
        var targetDistance = this.findDistance(fish.x, fish.y, fish.moveTarget.x, fish.moveTarget.y);
        if (targetDistance > fish.moveSpeed * delta) {
            fish.x += moveDirection.x * fish.moveSpeed * delta;
            fish.y += moveDirection.y * fish.moveSpeed * delta;
        } else {
            fish.x = fish.moveTarget.x;
            fish.y = fish.moveTarget.y;
        }
    }

    createAIFish(x, y) {
        var newFish = this.add.image(x, y, "fish");
        newFish.moveSpeed = 0.05;

        newFish.fleeDistance = 200;
        newFish.feedDistance = 400;
        return newFish;


    }
    updateAIFish(fish, fishes, playerFish, delta) {

        var desiredVelocity = new Phaser.Math.Vector2();
        var predators = this.findPredators(fish, fishes, playerFish);
        var fleeVector = this.findFleeVector(fish, predators);
        desiredVelocity.x += fleeVector.x;
        desiredVelocity.y += fleeVector.y;

        var foodSources = this.findFoodSources(fish, playerFish, fishes);
        var feedVector = this.findFeedVector(fish, foodSources);
        desiredVelocity.x += feedVector.x;
        desiredVelocity.y += feedVector.y;

        desiredVelocity.normalize();

        if (desiredVelocity.x > 0) {
            fish.flipX = true;
        } else {
            fish.flipX = false;
        }


        fish.x += desiredVelocity.x * fish.moveSpeed * delta;
        fish.y += desiredVelocity.y * fish.moveSpeed * delta;

    }


    findPredators(fish, fishes, playerFish) {
        var predators = [];
        if (playerFish.displayWidth > fish.displayWidth) {
            predators.push(playerFish);
        }
        for (var i = 0; i < fishes.length; i++) {
            if (fishes[i].displayWidth > fish.displayWidth) {
                predators.push(fishes[i]);
            }
        }
        return predators;
    }

    findFoodSources(fish, playerFish, fishes) {
        var foodSources = [];
        if (this.fishIsBigger(fish, playerFish)) {
            foodSources.push(playerFish);
        }
        for (var i = 0; i < fishes.length; i++) {
            var theFish = fishes[i];
            if (this.fishIsBigger(fish, theFish)) {
                foodSources.push(theFish);
            }
        }

        return foodSources;
    }

    fishIsBigger(fish, otherFish) {
        if (fish.displayWidth > otherFish.displayWidth) {
            return true;
        }
        return false;
    }




    findFleeVector(fish, predators) {
        var fishFleeVector = new Phaser.Math.Vector2();
        for (var i = 0; i < predators.length; i++) {
            var predatorDistance = this.findDistance(fish.x, fish.y, predators[i].x, predators[i].y);
            if (predatorDistance <= fish.fleeDistance) {
                var predatorDirection = this.findDirection(fish.x, fish.y, predators[i].x, predators[i].y);
                predatorDirection.x *= -1;
                predatorDirection.y *= -1;

                fishFleeVector.x += predatorDirection.x;
                fishFleeVector.y += predatorDirection.y;
            }

        }

        return fishFleeVector;
    }

    findFeedVector(fish, foodSources) {
        var fishFeedVector = new Phaser.Math.Vector2();
        var closestFood = this.findNearestObject(fish, foodSources);
        if(!closestFood){return fishFeedVector;}

        var foodDistance = this.findDistance(fish.x, fish.y, closestFood.x, closestFood.y);
        if (foodDistance < fish.feedDistance) {
            var foodVector = this.findDirection(fish.x, fish.y, closestFood.x, closestFood.y);
            fishFeedVector.x += foodVector.x;
            fishFeedVector.y += foodVector.y;

        }

        return fishFeedVector;
    }


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


    rectangleOverlap(rect1, rect2) {
        return Phaser.Geom.Rectangle.Overlaps(rect1, rect2);
    }




}




