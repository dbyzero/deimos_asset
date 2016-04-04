//libs
var express                 = require('express');
var router                  = express.Router();

var avatarBlueprint         = require('./blueprints/avatar');
var spritesheetGenerator    = require('../utils/spritesheetGenerator');
var sendFile                = require('../utils/sendFile');

//this url cannot be override by a public file
router.get('/avatar/:id.png/nocache', function(request, res, next) {
    generateAvatarSpritesheet(request, res, next);
});

//can be override by a public file (for cache purpose)
router.get('/avatar/:id.png', function(request, res, next) {
    generateAvatarSpritesheet(request, res, next);
});

var generateAvatarSpritesheet = function (request, res, next) {
    var apiConnection = GLOBAL['app'].get('apiConnection');
    var id = parseInt(request.params.id);
    apiConnection.get('/avatar/'+id,function(api_err, api_req, api_res, api_data) {
        if(api_err) {
            next("Deimos API Error:" + api_err);
        }
        if(api_data.id === undefined) {
            res.status(404).send("cannot find the avatar with id "+id);
        }

        var BPAvatar = new avatarBlueprint(api_data);
        var blueprint = BPAvatar.layers;
        var path = __dirname + '/../public/spritesheet/avatar/' + id + ".png";

        spritesheetGenerator.generate(blueprint, path)
            .then(function(){
                sendFile(res, path);
            })
            .catch(function(err){
                console.error(err);
                res.status(500).send(err);
            });
    });
}

module.exports = router;
