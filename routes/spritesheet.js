//libs
var express                 = require('express');
var router                  = express.Router();
var Canvas                  = require('canvas');
var fs                      = require('fs');
var config                  = require('../config');
var spritesheetGenerator	= require('../utils/spritesheetGenerator');

//this url cannot be override by a public file
router.get('/avatar/:id/nocache/spritesheet.png', function(request, res, next) {
    generateAvatarSpritesheet(request, res, next);
    res.redirect('/avatar/' + reqest.params.id + '/spritesheet.png');
});

//can be override by a public file (for cache purpose)
router.get('/avatar/:id/spritesheet.png', function(request, res, next) {
    var spritesheetPath = generateAvatarSpritesheet(request, res, next);
});

var generateAvatarSpritesheet = function (request, res, next) {
    var apiConnection = GLOBAL['app'].get('apiConnection');
    var id = parseInt(request.params['id']);
    apiConnection.get('/avatar/'+id,function(api_err, api_req, api_res, api_data) {
        if(api_err) {
            next("DEIMOS API ERROR:" + api_err);
        }
        if(api_data.id === undefined) {
            res.status(404).send("cannot find the avatar with id "+id);
        }
        res.send(api_data);
        var blueprint = {
            //height: XXXpx,
            //width: XXXpx,
            // [
                //spritesheetPath,
                //color,
                //flipped,
                //zone (default 100%,100%)
            // ]
        };
        // var spritesheetPath = spritesheetGenerator.generate(blueprint);
    });

}

module.exports = router;
