var config = {
	type: Phaser.AUTO,
    width:  window.innerWidth,
    height:  window.innerHeight,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: FishScene
};         
    
 new Phaser.Game(config); 