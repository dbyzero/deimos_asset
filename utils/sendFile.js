var fs                      = require('fs');

module.exports = function sendFile(res,destImgPath) {
    var stream = fs.createReadStream( destImgPath );
    stream.on('error', function(err){
        console.error(err);
        res.status(500).send('error');
    });
    stream.pipe(res);
}