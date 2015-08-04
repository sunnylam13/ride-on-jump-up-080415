////////////////////////////////////////////
// 		VARIABLES
////////////////////////////////////////////
	// create an empty object... which is the start of the application
	// you don't have to start it empty though... it is cleaner however
	// the word app is too generic...
	// you might use the initials of the website you're designing

	var rideP1 = {};

	// then below there you can add things
	rideP1.game = new Phaser.Game(640,480,Phaser.CANVAS,'game');

	// this object method stores the variables for the game
	rideP1.PhaserGame = function () {
		this.player = null;
		this.platforms = null;
		this.facing = 'left';
		this.jumpTimer = 0;
		this.cursors = null;
	}

////////////////////////////////////////////
// 		END VARIABLES
////////////////////////////////////////////


////////////////////////////////////////////
// 		FUNCTIONS
////////////////////////////////////////////
	// don't forget to call the function in EXECUTION CODE area before running

	// NOTE:  in terms of organization, Ryan prefers to put all other functions and variables above the object.init() method however in reality it doesn't matter

	rideP1.PhaserGame.prototype = {

		init: function () {
			this.game.renderer.renderSession.roundPixels = true;
			this.physics.startSystem(Phaser.Physics.ARCADE);
			this.physics.arcade.gravity.y = 800;
		},

		preload: function () {
			/* 
			* load all of the game assets here...
			* we need this because the assets are on Amazon sS3
			* remove the next two lines if running local
			* 
			*/

			// this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue003/';
			// this.load.crossOrigin = 'anonymous';
			
			this.load.image('background', 'assets/background.png');
			this.load.image('platform', 'assets/platform.png');
			this.load.image('ice-platform', 'assets/ice-platform.png');
			this.load.spritesheet('dude', 'assets/dude.png', 32, 48);

			//  Note: Graphics are Copyright 2015 Photon Storm Ltd.

		},

		create: function () {
			this.add.sprite(0,0,'background');

			// ----------------------------------------
			// PLATFORMS  ------------------
			// ----------------------------------------
				
				/* 
				* When the player jumps on this type of platform we let Phaser handle the collision. 
				* Due to the way Arcade Physics works there is a special condition that means that the player will automatically "ride" with the platform. 
				* So as it moves horizontally the players x position is adjusted to match.
				* 
				*/

				// create a new platforms group with physics
				// the platforms are added to a physics group
				this.platforms = this.add.physicsGroup();

				// call the proper assets at specific positions
				// create all 4 platforms
				this.platforms.create(0,64,'ice-platform');
				this.platforms.create(200,180,'platform');
				this.platforms.create(400,296,'ice-platform');
				this.platforms.create(600,412,'platform');

				// stops gravity from making them fall 
				this.platforms.setAll('body.allowGravity',false);
				// if something or someone impacts the platform it doesn't move
				this.platforms.setAll('body.immovable',true);
				// gives each platform the same horizontal velocity
				this.platforms.setAll('body.velocity.x',100);
			// ----------------------------------------
			// END PLATFORMS  ------------------
			// ----------------------------------------
			
			// ----------------------------------------
			// PLAYER  ------------------
			// ----------------------------------------
				this.player = this.add.sprite(320,432,'dude');
				this.physics.arcade.enable(this.player);

				this.player.body.collideWorldBounds = true;
				this.player.body.setSize(20,32,5,16);

				this.player.animations.add('left',[0,1,2,3],10,true);
				this.player.animations.add('turn',[4],20,true);
				this.player.animations.add('right',[5,6,7,8],10,true);
			// ----------------------------------------
			// END PLAYER  ------------------
			// ----------------------------------------
			
			// ----------------------------------------
			// CONTROLS  ------------------
			// ----------------------------------------
				this.cursors = this.input.keyboard.createCursorKeys();
			// ----------------------------------------
			// END CONTROLS  ------------------
			// ----------------------------------------

		},

		wrapPlatform: function (platform) {
			/* 
			* COMMENT
			* 
			*/

			if (platform.body.velocity.x < 0 && platform.x <= -160) {
				platform.x = 640;
			}
			else if (platform.body.velocity.x > 0 && platform.x >= 640) {
				platform.x = -160;
			}
		},

		setFriction: function (player, platform) {
			/* 
			* But what if we don't want that to happen? 
			* What if we want our player to fall off the platform, and not ride it? 
			* Perhaps the platform is covered in ice? 
			* For that we'll let the platform set its own friction.
			*
			* The conditional checks if the platform is an ice one, and if so adjusts the players body to compensate for the distance the platform has travelled.
			* Obviously you don't have to check the image key to do this - it would make more sense if you had a special custom Game Object that knew if it was slippery or not, but the end result is the same. 
			* You need to effectively undo the horizontal drag that was applied by Arcade Physics.
			* If you run the code you'll see that on the green platforms you can ride them, but on the snow covered ones you slip right off. Perfect.
			*/

			if (platform.key === 'ice-platform') {
				player.body.x -= platform.body.x - platform.body.prev.x;
			}
		},

		update: function () {

			// apply the @method wrapPlatform to each platform in the platforms group using a forEach loop
			this.platforms.forEach(this.wrapPlatform, this);

			// run a collide/collision check
			// But what if we don't want that to happen? What if we want our player to fall off the platform, and not ride it? Perhaps the platform is covered in ice? For that we'll let the platform set its own friction.
			// done by specifying a collision callback for the platforms
			this.physics.arcade.collide(this.player,this.platforms,this.setFriction, null, this);

			// Run this AFTER thie collide check, or you won't have blocked/touching set
			var standing = this.player.body.blocked.down || this.player.body.touching.down;

			this.player.body.velocity.x = 0;

			if (this.cursors.left.isDown) {
				this.player.body.velocity.x = -200;

				if (this.facing !== 'left') {
					this.player.play('left');
					this.facing = 'left';
				}

			}
			else if (this.cursors.right.isDown) {
				this.player.body.velocity.x = 200;

				if (this.facing !== 'right') {
					this.player.play('right');
					this.facing = 'right';
				}

			}
			else {
				if (this.facing !== 'idle') {
					this.player.animations.stop();

					if (this.facing === 'left') {
						this.player.frame = 0;
					}
					else {
						this.player.frame = 5;
					}

					this.facing = 'idle';
				}
			}

			if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer) {
				this.player.body.velocity.y = -500;
				this.jumpTimer = this.time.time + 750;
			}
			// end update
		}

	}


	rideP1.game.state.add('Game',rideP1.PhaserGame,true);

////////////////////////////////////////////
// 		END FUNCTIONS
////////////////////////////////////////////


////////////////////////////////////////////
// 		EVENTS
////////////////////////////////////////////
	// for storing various event listeners
	// this method will be used to listen for the open and close events and trigger those methods
	// Ryan C often uses this though Drew doesn't always
	rideP1.events = function () {
		//
	}
////////////////////////////////////////////
// 		END EVENTS
////////////////////////////////////////////



////////////////////////////////////////////
// 		INIT
////////////////////////////////////////////
	// method to initialize our application
	// all our code will be put inside here
	// you should not be defining things in here
	rideP1.init = function () {
		this.events();
	}
////////////////////////////////////////////
// 		END INIT
////////////////////////////////////////////

////////////////////////////////////////////
// 		EXECUTION CODE
////////////////////////////////////////////
	jQuery(document).ready(function($) {
		rideP1.init();
	});  //end doc.onready function
////////////////////////////////////////////
// 		END EXECUTION CODE
////////////////////////////////////////////