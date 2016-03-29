var fs = require('fs');
var sass = require('node-sass');

var buildCss = function( filePath, outputFile ) {
  sass.render({
    'file': filePath,
    'indendWidth': 4,
    'outFile': outputFile,
    // 'outputStyle': 'compressed',
    'sourceMap': true
  }, function(err, result) {
    if(err) {
      throw err;
    }
    console.log('Duration: ' + result.stats.duration + 'ms');

    fs.writeFile(outputFile, result.css, function(err){
      if(!err){
        console.log('Css written at ' + outputFile);
      } else {
        console.log(err);
      }
    });

    fs.writeFile(outputFile + '.map', result.map, function(err){
      if(!err){
        console.log('Sourcemap written at ' + outputFile + '.map');
      } else {
        console.log(err);
      }
    });
  });
}

//todo

buildCss('./scss/skills.scss', './public/css/skills.css');
buildCss('./scss/keyframes.scss', './public/css/keyframes.css');
buildCss('./scss/animations.scss', './public/css/animations.css');
// buildCss()
