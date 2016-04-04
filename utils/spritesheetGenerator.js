var Canvas  = require('canvas');
var fs      = require('fs');
var Promise = require('promise');

module.exports = {
    /**
    * Blueprint is array of layer as below :
    * {
    *   animationName: xxx, //debug purpose
    *   drawZone: {
    *       x: {X position on spritesheet}
    *       y: {Y position on spritesheet}
    *       height: {height to cut},
    *       width: {width to cut}
    *   },
    *   partsOrder:
    *       [
    *           spritesheet: {absolute path to spritesheet},
    *           color: {color to redraw grey with}
    *       ]
    * }
    */
    generate: function(blueprint, path) {
        return new Promise(function (resolve, reject) {
            var canvas = new Canvas(blueprint[0].drawZone.width,blueprint.length * 100);
            var ctx = canvas.getContext('2d');
            blueprint.forEach(function(row,idx){
                console.log("Doing " + row.animationName + "...");
                var x = row.drawZone.x;
                var y = row.drawZone.y;
                var width = row.drawZone.width;
                var height = row.drawZone.height;
                row.partsOrder.forEach(function(layer,idx){
                    var img = new Canvas.Image();
                    img.onload = function(err){
                        if(err) reject(err);;
                        ctx.drawImage(img,x,y,width,height,x,y,width,height);
                        changeSpritesheetColor(ctx,x,y,width,height,layer.color);
                        console.log(row.animationName + " done!");
                    };
                    img.src = layer.spritesheet;
                });
            });

            setTimeout(function(){
                var out = fs.createWriteStream( path, {flags:'w'} )
                var stream = canvas.pngStream();

                stream.pipe(out);

                out.on('finish',function(){
                    resolve();
                });

                out.on('error', function(err){
                    reject(err);
                });

                stream.on('error', function(err){
                    reject(err);
                });
            },0);
        });
    }
}

//used in canvas draw process
function changeSpritesheetColor(ctx,x,y,width,height,rgba) {
    var imgData = ctx.getImageData(x,y,width,height);

    var r = parseInt(rgba.substr(1,2),16);
    var g = parseInt(rgba.substr(3,2),16);
    var b = parseInt(rgba.substr(5,2),16);
    var a = parseInt(rgba.substr(7,2),16);

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
    ctx.putImageData(imgData,x,y);
}
