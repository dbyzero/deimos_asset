//libs
var express			= require('express');
var router			= express.Router();
var Canvas			= require('canvas');
var fs				= require('fs');
var restify			= require('restify');

//size of a slide x and y
const edge = 100;

//gruky but used to match a kind of item with the same index array
const CONST_HEAD_IDX		= 0;
const CONST_BODY_IDX		= 1;
const CONST_FEET_IDX		= 2;
const CONST_HAND_LEFT_IDX	= 3;
const CONST_HAND_RIGHT_IDX	= 4;

const CONST_HAND_RIGHT_ID	= 1;
const CONST_HEAD_ID			= 2;
const CONST_BODY_ID			= 3;
const CONST_FEET_ID			= 4;
const CONST_HAND_LEFT_ID	= 5;

const DRAW_RIGHT_ORDER	= [
	CONST_HAND_LEFT_IDX,
	CONST_BODY_IDX,
	CONST_FEET_IDX,
	CONST_HEAD_IDX,
	CONST_HAND_RIGHT_IDX
];

const DRAW_LEFT_ORDER	= [
	CONST_HAND_RIGHT_IDX,
	CONST_BODY_IDX,
	CONST_FEET_IDX,
	CONST_HEAD_IDX,
	CONST_HAND_LEFT_IDX
];

const DRAW_FRONT_ORDER	= [
	CONST_BODY_IDX,
	CONST_FEET_IDX,
	CONST_HEAD_IDX,
	CONST_HAND_LEFT_IDX,
	CONST_HAND_RIGHT_IDX
];

var apiConnection = null;
function initApi() {
	if(apiConnection === null) {
		apiConnection = restify.createJsonClient({
			url: 'http://localhost:1081',
			agent:false,
			headers:{
				// connection:'close'
			}
		});
	}
}

router.get('/', function(request, res, next) {
	// initApi();
	res.send('SPRITESHEET GENERATOR');
});

router.get('/item/:id/:rgb/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var rgba = request.params['rgb'];
		var force = 0;
		sendSpritesheet(res,id,rgba,force,next);
	} catch(err) {
		next(err);
	}
});

router.get('/item/:id/:rgb/force/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var rgba = request.params['rgb'];
		var force = 1;
		sendSpritesheet(res,id,rgba,force,next);
	} catch(err) {
		next(err);
	}
});

router.get('/monster/:id/color/:rgb/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var rgba = request.params['rgb'];
		var force = 0;
		sendMonsterSpritesheet(res,id,rgba,force,next);
	} catch(err) {
		next(err);
	}
});

router.get('/monster/:id/color/:rgb/force/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var rgba = request.params['rgb'];
		var force = 1;
		sendMonsterSpritesheet(res,id,rgba,force,next);
	} catch(err) {
		next(err);
	}
});

router.get('/char/:id/force/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var force = 1;
		sendFullSpritesheet(res,id,force,next);
	} catch(err) {
		next(err);
	}
});

router.get('/char/:id/spritesheet.png', function(request, res, next) {
	try {
		var id = parseInt(request.params['id'],10);
		var force = 0;
		sendFullSpritesheet(res,id,force,next);
	} catch(err) {
		next(err);
	}
});

function sendFullSpritesheet(res,id,force,next) {
	initApi();
	var destImgPath = __dirname.replace('routes','cache/char/cache')+'-'+id+'.png';
	//check if we have to generate it or just send cache
	fs.exists( destImgPath, function(exists){
		if(!exists || force == 1) {

			//need avatar to get his items
			apiConnection.get('/avatar/'+id,function(err,req,resp,data) {
				if(err) throw err;
				if(data === null) {
					res.status(404).send("cannot find the avatar with id "+id);
					return;
				}

				//setting some variables to make the spritesheet
				var avatarCompo = [
					data.item_slot_head,
					data.item_slot_chest,
					data.item_slot_foot,
					data.item_slot_left_hand,
					data.item_slot_right_hand
				];
				var defaultImgLayer = new Canvas.Image;
				defaultImgLayer.src = __dirname.replace('routes','spritesheets')+'/'+data.skin+'.png';
				var imgLayers = new Array(
					null,
					null,
					null,
					null,
					null
				);

				//when all is loaded, continue;
				var itemLoaded = function() {
					setTimeout(function(){
						try	{
							var canvas = new Canvas(900,900);
							var ctx = canvas.getContext('2d');
							//draw spritesheet layers in order

							//do right parts
							var drawOrder = DRAW_RIGHT_ORDER;
							for(var i = 0; i < drawOrder.length ; i++) {
								if(imgLayers[drawOrder[i]] !== null) {
									var img = imgLayers[drawOrder[i]];
									copySpritesheetLineLayer(ctx,img,0);
									copySpritesheetLineLayer(ctx,img,2);
									copySpritesheetLineLayer(ctx,img,5);
									copySpritesheetLineLayer(ctx,img,7);
								} else {
									console.error('No layer for '+drawOrder[i]);
								}
							}

							//do left parts
							var drawOrder = DRAW_LEFT_ORDER;
							for(var i = 0; i < drawOrder.length ; i++) {
								if(imgLayers[drawOrder[i]] !== null) {
									var img = imgLayers[drawOrder[i]];
									copySpritesheetLineLayer(ctx,img,1);
									copySpritesheetLineLayer(ctx,img,3);
									copySpritesheetLineLayer(ctx,img,4);
									copySpritesheetLineLayer(ctx,img,6);
								} else {
									console.error('No layer for '+drawOrder[i]);
								}
							}

							//do front part
							var drawOrder = DRAW_FRONT_ORDER;
							for(var i = 0; i < drawOrder.length ; i++) {
								if(imgLayers[drawOrder[i]] !== null) {
									var img = imgLayers[drawOrder[i]];
									copySpritesheetLineLayer(ctx,img,8);
								} else {
									console.error('No layer for '+drawOrder[i]);
								}
							}

							var out = fs.createWriteStream( destImgPath, {flags:'w'} )
							var stream = canvas.pngStream();

							stream.pipe(out);

							out.on('finish',function(err){
								sendFile(res,destImgPath);
							});

							out.on('error', function(err){
								throw err;
							});

							stream.on('error', function(err){
								throw err;
							});
						} catch (err) {
							console.log(err);
							res.send('Error');
						}
					},0);
				}

				//fill imgLayer with each items' spritesheet
				var itemToLoad = avatarCompo.length;
				var loadSpritesheet = function(idx) {
					var item = avatarCompo[idx];
					//if null we skeep it
					if(item === null) {
						//load default
						if(idx === 0) itemId = CONST_HEAD_ID;
						if(idx === 1) itemId = CONST_BODY_ID;
						if(idx === 2) itemId = CONST_FEET_ID;
						if(idx === 3) itemId = CONST_HAND_LEFT_ID;
						if(idx === 4) itemId = CONST_HAND_RIGHT_ID;
						var rgba = data.rgba;
					} else {
						var itemId = item.id;
						var rgba = item.rgba;
					}
					apiConnection.get('/itemtemplate/'+itemId,function(err,req,resp,dataItem) {
						if(err) throw err;
						if(dataItem === null) {
							res.status(404).send("cannot find the item "+itemId);
							return;
						}
						imgLayers[idx] = new Canvas.Image();
						imgLayers[idx].src = __dirname.replace('routes','cache/cache')+'-'+itemId+'-'+rgba+'.png';
						fs.exists( imgLayers[idx].src ,function(exists){
							if(!exists || force) {
								var img = new Canvas.Image();
								img.src = __dirname.replace('routes','spritesheets')+'/'+dataItem.skin+'.png';

								var show = {
									'head':false,
									'body':false,
									'feet':false,
									'armL':false,
									'armR':false
								}

								if(idx === 0) show['head'] = true;
								if(idx === 1) show['body'] = true;
								if(idx === 2) show['feet'] = true;
								if(idx === 3) show['armL'] = true;
								if(idx === 4) show['armR'] = true;

								var canvas = new Canvas(900,900);
								var ctx = canvas.getContext('2d');
								drawSpritesheet(ctx,img,rgba,show);

								//save it
								var out = fs.createWriteStream( imgLayers[idx].src, {flags:'w'} )
								var stream = canvas.pngStream();

								out.on('finish',function(err){
									itemToLoad--;
									imgLayers[idx].src = __dirname.replace('routes','cache/cache')+'-'+itemId+'-'+rgba+'.png';
									if(itemToLoad === 0) {
										setTimeout(function(){
											itemLoaded();
										},0);
									}
								});

								out.on('error', function(err){
									throw err;
								});

								stream.on('error', function(err){
									throw err;
								});

								stream.pipe(out);
							} else {
								itemToLoad--;
								imgLayers[idx].src = __dirname.replace('routes','cache/cache')+'-'+itemId+'-'+rgba+'.png';
								if(itemToLoad === 0) {
									setTimeout(function(){
										itemLoaded();
									},0);
								}
							}

						});
					});
				}
				for(var tmpIdx = 0; tmpIdx < avatarCompo.length;tmpIdx++) {
					loadSpritesheet(tmpIdx);
				}
			});
		} else {
			sendFile(res,destImgPath);
		}
	});
}

//send cache file or generate it and send it in repsonse
function sendMonsterSpritesheet(res,id,rgba,force, next){
	//make it from img id
	var destImgPath = __dirname.replace('routes','spritesheets/monster/cache')+'-'+id+'-'+rgba+'.png';

	fs.exists( destImgPath, function(exists){
		if(!exists || force == 1) {

			apiConnection.get('/itemtemplate/'+id,function(err,req,resp,data) {
				if(err) throw err;
				if(data === null) {
					res.status(404).send("cannot find the monster!!! Where did he go :O ?!?");
					return;
				}

				//get it from img id	
				var srcImgPath = __dirname.replace('routes','spritesheets')+'/'+data.skin+'.png';

				fs.stat( srcImgPath,function(err,stats){
					if(err) throw err;
				});

				// create context
				var canvas = new Canvas(900,900);
				var ctx = canvas.getContext('2d');
				var img = new Canvas.Image();
				img.src = srcImgPath;
				ctx.clearRect(0,0,900,900);

				//draw image
				ctx.drawImage(img,0,0,900,900,0,0,900,900);
				changeSpritesheetColor(ctx,rgba);

				var out = fs.createWriteStream( destImgPath, {flags:'w'} )
				var stream = canvas.pngStream();

				stream.pipe(out);

				out.on('finish',function(err){
					sendFile(res,destImgPath);
				});

				out.on('error', function(err){
					throw err;
				});

				stream.on('error', function(err){
					throw err;
				});
			});
		} else {
			sendFile(res,destImgPath);
		}
	});
}

//send cache file or generate it and send it in repsonse
function sendSpritesheet(res,id,rgba,force, next){
	initApi();
	//make it from img id
	var destImgPath = __dirname.replace('routes','cache/cache')+'-'+id+'-'+rgba+'.png';

	fs.exists( destImgPath, function(exists){
		if(!exists || force == 1) {

			apiConnection.get('/itemtemplate/'+id,function(err,req,resp,data) {
				if(err) throw err;
				if(data === null) {
					res.status(404).send("cannot find the item");
					return;
				}

				//show only the item part
				var show = {
					head:false,
					armL:false,
					armR:false,
					body:false,
					feet:false
				}

				show[data.kind] = true;

				//get it from img id	
				var srcImgPath = __dirname.replace('routes','spritesheets')+'/'+data.skin+'.png';

				fs.stat( srcImgPath,function(err,stats){
					if(err) throw err;
				});
				createSpritesheet(res,srcImgPath,destImgPath,rgba,show);
			});
		} else {
			sendFile(res,destImgPath);
		}
	});
}

//simple send file
function sendFile(res,destImgPath) {
	var stream = fs.createReadStream( destImgPath );
	var dataEnd = "";
	stream.on('error', function(err){
		console.error(err);
		res.send('error');
	});
	// res.send('ok');
	stream.pipe(res);
}

//generate the spritesheet
function createSpritesheet(res,srcImgPath,destImgPath,rgba,show) {
	var img = new Canvas.Image();
	img.src = srcImgPath;

	setTimeout(function(){
		var canvas = new Canvas(900,900);
		var ctx = canvas.getContext('2d');

		ctx.clearRect(0,0,900,900);
		drawSpritesheet(ctx,img,rgba,show);

		var out = fs.createWriteStream( destImgPath, {flags:'w'} )
		var stream = canvas.pngStream();

		stream.pipe(out);

		out.on('finish',function(err){
			sendFile(res,destImgPath);
		});

		out.on('error', function(err){
			throw err;
		});

		stream.on('error', function(err){
			throw err;
		});
	},0);
}

//canvas draw process
function drawSpritesheet(ctx,img,rgba,show) {
	drawSpritesheetLine(ctx,img,0,spriteSheetMap.stand,show, true);
	drawSpritesheetLine(ctx,img,1,spriteSheetMap.stand,show);
	drawSpritesheetLine(ctx,img,2,spriteSheetMap.walk,show,true);
	drawSpritesheetLine(ctx,img,3,spriteSheetMap.walk,show);
	drawSpritesheetLine(ctx,img,4,spriteSheetMap.fly,show);
	drawSpritesheetLine(ctx,img,5,spriteSheetMap.fly,show,true);
	drawSpritesheetLine(ctx,img,6,spriteSheetMap.shoot,show);
	drawSpritesheetLine(ctx,img,7,spriteSheetMap.shoot,show,true);
	drawSpritesheetLine(ctx,img,8,spriteSheetMap.standFront,show);
	drawSpritesheetIcons(ctx,img,show);
	changeSpritesheetColor(ctx,rgba);
}

//draw a kinf of animation (jump left, walk right...etc..)
function drawSpritesheetLine(ctx, img, lineIndex, map, show, invert) {
	if(invert) {
		//on inverse le show des bras si on flip
		ctx.save();
		ctx.scale(-1,1);
	}
	var i, spriteIdx, spriteData, spriteElement, destX, destY, srcX, srcY;
	for(spriteIdx = 0; spriteIdx < map.length; spriteIdx++) {
		spriteData = map[spriteIdx];
		//switch hands if inverted
		if(invert) {
			var oldIdxLast = spriteData[spriteData.length - 1];
			spriteData[spriteData.length - 1] = spriteData[0];
			spriteData[0] = oldIdxLast;
		}
		for (i = 0; i < spriteData.length; i++) {
			spriteElement = spriteData[i];
			if(show[spriteElement.sprite[2]] !== true) continue;
			srcX = spriteElement.sprite[0] * edge;
			srcY = spriteElement.sprite[1] * edge;
			destX = spriteIdx * edge + spriteElement.dx;
			destY = lineIndex * edge + spriteElement.dy;
			try {
				ctx.drawImage(img,srcX,srcY,edge,edge, invert ? -destX - 100: destX,destY,edge,edge);
			} catch(err) {
				console.error(err);
				return;
			}
		};
		if(invert) {
			var oldIdxLast = spriteData[spriteData.length - 1];
			spriteData[spriteData.length - 1] = spriteData[0];
			spriteData[0] = oldIdxLast;
		}
	}
	if(invert) ctx.restore();
}

function copySpritesheetLineLayer(ctx, img, lineIndex) {
	ctx.drawImage(
		img,
		0, lineIndex * edge, edge*8, edge,
		0, lineIndex * edge, edge*8, edge
	);
}

//used in canvas draw process
function drawSpritesheetIcons(ctx,img,show) {
	try {
		if(show['feet']) ctx.drawImage(img,900,0 ,edge,edge,800,0,edge,edge);
		if(show['armL']) ctx.drawImage(img,900,100,edge,edge,800,0,edge,edge);
		if(show['armR']) ctx.drawImage(img,900,100,edge,edge,800,0,edge,edge);
		if(show['head']) ctx.drawImage(img,900,200,edge,edge,800,0,edge,edge);
		if(show['body']) ctx.drawImage(img,900,300,edge,edge,800,0,edge,edge);
	} catch(err) {
		console.error(err);
	}
}

//used in canvas draw process
function changeSpritesheetColor(ctx,rgba) {
	var imgData = ctx.getImageData(0,0,900,900);

	var r = parseInt(rgba.substr(0,2),16);
	var g = parseInt(rgba.substr(2,2),16);
	var b = parseInt(rgba.substr(4,2),16);
	var a = parseInt(rgba.substr(6,2),16);

	if(isNaN(r)) r = 0;
	if(isNaN(g)) g = 0;
	if(isNaN(b)) b = 0;
	if(isNaN(a)) a = 255;

	// invert colors
	var r2,g2,b2,a2;
	for (var i=0;i<imgData.data.length;i+=4)
	{
		r2=imgData.data[i];
		g2=imgData.data[i+1];
		b2=imgData.data[i+2];
		a2=imgData.data[i+3];
		if(r2 === 0) continue;
		if(r2 === g2 &&  g2 === b2) {
			imgData.data[i] = (parseInt(r)+r2)/2;
			imgData.data[i+1] = (parseInt(g)+g2)/2;
			imgData.data[i+2] = (parseInt(b)+b2)/2;
			imgData.data[i+3] = a;
		}
	}
	ctx.putImageData(imgData,0,0);
}

/**
 * Sprites
 */
var head_front   = [0,0,'head'];
var armR_front   = [1,0,'armR'];
var armL_front   = [2,0,'armL'];
var legs_front   = [3,0,'feet'];
var body_front   = [4,0,'body'];
var fly_armR     = [5,0,'armR'];
var fly_armL     = [6,0,'armL'];
var fly_legs     = [7,0,'feet'];

var head_left    = [0,1,'head'];
var body_left    = [1,1,'body'];
var legs_left    = [2,1,'feet'];
var armLL_left   = [3,1,'armL'];
var armL_left    = [4,1,'armL'];
var armM_left    = [5,1,'armL'];
var armR_left    = [6,1,'armL'];
var armRR_left   = [7,1,'armL'];
var armLL_right   = [3,1,'armR'];
var armL_right    = [4,1,'armR'];
var armM_right    = [5,1,'armR'];
var armR_right    = [6,1,'armR'];
var armRR_right   = [7,1,'armR'];

var legs_p1_left = [0,2,'feet'];
var legs_p2_left = [1,2,'feet'];
var legs_p3_left = [2,2,'feet'];
var legs_p4_left = [3,2,'feet'];
var legs_p5_left = [4,2,'feet'];
var legs_p6_left = [5,2,'feet'];
var legs_p7_left = [6,2,'feet'];
var legs_p8_left = [7,2,'feet'];

var shoot_1_right = [0,3,'armR'];
var shoot_2_right = [1,3,'armR'];
var shoot_3_right = [2,3,'armR'];
var shoot_4_right = [3,3,'armR'];
var shoot_5_right = [4,3,'armR'];
var shoot_6_right = [5,3,'armR'];
var shoot_7_right = [6,3,'armR'];
var shoot_8_right = [7,3,'armR'];

var shoot_1_left = [0,3,'armL'];
var shoot_2_left = [1,3,'armL'];
var shoot_3_left = [2,3,'armL'];
var shoot_4_left = [3,3,'armL'];
var shoot_5_left = [4,3,'armL'];
var shoot_6_left = [5,3,'armL'];
var shoot_7_left = [6,3,'armL'];
var shoot_8_left = [7,3,'armL'];

var icon_27x27   = [8,0,'icon_body'];
var icon_27x27   = [8,1,'icon_head'];
var icon_27x27   = [8,2,'icon_arm'];
var icon_27x27   = [8,3,'icon_feet'];

/**
 * Spritesheet map
 */
var spriteSheetMap = {};
spriteSheetMap.standFront = [];
spriteSheetMap.stand = [];
spriteSheetMap.walk = [];
spriteSheetMap.fly = [];
spriteSheetMap.shoot = [];


spriteSheetMap.standFront[0] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.standFront[1] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 1
	}
];

spriteSheetMap.standFront[2] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 2
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 2
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 2
	}
];

spriteSheetMap.standFront[3] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: armL_front,
		'dx'		: -1,
		'dy'		: 2
	},
	{
		'sprite'	: armR_front,
		'dx'		: 1,
		'dy'		: 2
	}
];

spriteSheetMap.standFront[4] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_front,
		'dx'		: -1,
		'dy'		: 2
	},
	{
		'sprite'	: armR_front,
		'dx'		: 1,
		'dy'		: 2
	}
];

spriteSheetMap.standFront[5] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 1
	}
];

spriteSheetMap.standFront[6] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.standFront[7] = [
	{
		'sprite'	: legs_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_front,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_front,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.stand[0] = [
	{
		'sprite'	: armM_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armM_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[1] = [
	{
		'sprite'	: armL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[2] = [
	{
		'sprite'	: armLL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armRR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[3] = [
	{
		'sprite'	: armL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[4] = [
	{
		'sprite'	: armM_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armM_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[5] = [
	{
		'sprite'	: armR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[6] = [
	{
		'sprite'	: armRR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armLL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.stand[7] = [
	{
		'sprite'	: armR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[0] = [
	{
		'sprite'	: armM_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p7_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p3_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armM_left,
		'dx'		: 1,
		'dy'		: 1
		}
];

spriteSheetMap.walk[1] = [
	{
		'sprite'	: armL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p8_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p4_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[2] = [
	{
		'sprite'	: armLL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p1_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p5_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armRR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[3] = [
	{
		'sprite'	: armL_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p2_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p6_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armR_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[4] = [
	{
		'sprite'	: armM_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p3_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_p7_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armM_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[5] = [
	{
		'sprite'	: armR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p4_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_p8_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[6] = [
	{
		'sprite'	: armRR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p5_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_p1_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armLL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.walk[7] = [
	{
		'sprite'	: armR_right,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p6_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_p2_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: armL_left,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[0] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
		}
];

spriteSheetMap.fly[1] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[2] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[3] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[4] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[5] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[6] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];

spriteSheetMap.fly[7] = [
	{
		'sprite'	: fly_armR,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_legs,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: fly_armL,
		'dx'		: 1,
		'dy'		: 1
	}
];


spriteSheetMap.shoot[0] = [
	{
		'sprite'	: shoot_1_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_1_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.shoot[1] = [
	{
		'sprite'	: shoot_2_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_2_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.shoot[2] = [
	{
		'sprite'	: shoot_3_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_3_left,
		'dx'		: 0,
		'dy'		: 0
	},
];

spriteSheetMap.shoot[3] = [
	{
		'sprite'	: shoot_4_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_4_left,
		'dx'		: 0,
		'dy'		: 0
	},
];

spriteSheetMap.shoot[4] = [
	{
		'sprite'	: shoot_5_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_5_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.shoot[5] = [
	{
		'sprite'	: shoot_6_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_6_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.shoot[6] = [
	{
		'sprite'	: shoot_7_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 1
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_7_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

spriteSheetMap.shoot[7] = [
	{
		'sprite'	: shoot_8_right,
		'dx'		: -1,
		'dy'		: -3
	},
	{
		'sprite'	: body_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: head_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: legs_left,
		'dx'		: 0,
		'dy'		: 0
	},
	{
		'sprite'	: shoot_8_left,
		'dx'		: 0,
		'dy'		: 0
	}
];

module.exports = router;