class School{
    constructor(predators, foodSources){
        this.predators = predators;
        this.foodSources = foodSources;
        this.fishes = [];
    }

    updateFish(delta){
        
        for(var i = 0; i < this.fishes.length; i++){

            var desiredVelocity = new Phaser.Math.Vector2();
            var theFish = this.fishes[i];

            var fleeVector = this.findFleeVector(theFish, this.predators);
            desiredVelocity.x += fleeVector.x * 2;
            desiredVelocity.y += fleeVector.y * 2; 
            //desiredVelocity.normalize();

            var feedVector = this.findFeedVector(theFish, this.foodSources);
            desiredVelocity.x += feedVector.x;
            desiredVelocity.y += feedVector.y;  
            desiredVelocity.normalize();

            if(desiredVelocity != Phaser.Math.Vector2.ZERO){
                if(desiredVelocity.x > 0){
                    theFish.myImage.displayWidth = -50;
                    theFish.myImage.displayHeight = 50;
                }else{
                    theFish.myImage.displayWidth = 50;
                    theFish.myImage.displayHeight = 50;
                }

                theFish.x += desiredVelocity.x * theFish.moveSpeed * delta;
                theFish.y += desiredVelocity.y * theFish.moveSpeed * delta;
            }            
        }
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

    findNearestObject(object, collection){
        var theDistance = Number.MAX_VALUE;
        var nearestObject;
        for(var i = 0; i < collection.length; i++){
            var newDistanceSqr = findDistanceSqu5red(object.x, object.y, collection[i].x, collection[i].y);
            if(newDistanceSqr < theDistance){
                theDistance = newDistanceSqr;
                nearestObject = collection[i];
            }
        }
        return nearestObject;
    }

    findFleeVector(agent, predators){        
        var fleeVector = new Phaser.Math.Vector2();
        for(var i = 0; i < predators.length; i++){
            var thePredator = predators[i];
            var predatorDistance = this.findDistance(agent.x, agent.y, thePredator.x, thePredator.y);
            if(predatorDistance <= agent.detectDistance){
                var agentFleeVector = this.findDirection(agent.x, agent.y, thePredator.x, thePredator.y);
                agentFleeVector.x *= -1;
                agentFleeVector.y *= -1;

                fleeVector.x += agentFleeVector.x;
                fleeVector.y += agentFleeVector.y;
            }      
        }        

        return fleeVector;
    }

    findFeedVector(agent, foodSources){
        var foodVector = new Phaser.Math.Vector2();
        for(var i = 0; i < foodSources.length; i++){
            var theFood = foodSources[i];
            var foodDistance = this.findDistance(agent.x, agent.y, theFood.x, theFood.y);
            if(foodDistance <= agent.detectDistance){
                var agentFoodVector = this.findDirection(agent.x, agent.y, theFood.x, theFood.y);
                foodVector.x += agentFoodVector.x;
                foodVector.y += agentFoodVector.y;
            }      
        }        
        return foodVector;
    }
}