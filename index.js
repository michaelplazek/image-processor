const fs = require("fs");
const fileType = require('file-type');
const readChunk = require('read-chunk');
const Jimp = require("jimp");
const async = require("async");
const sync = require("sync");

let dir = process.argv[2];
let buf = [];
let imageBuffer = [];
let file;

readDirectory(dir);
transformImage(imageBuffer);

function readDirectory(path) {

  // read the directory
  buf = fs.readdirSync(path);

  // check each item
  buf.forEach(function (item) {

    // check whether item is a file or nested directory
    file = fs.statSync(path + "/" + item);
    console.log('inside stat: ' + path + "/" + item);
    if(file.isDirectory()) readDirectory(item); // recurse on directory
    else if(file.isFile()) checkType(item); // initialize image transform
    });
};

function checkType(file){
  console.log('Checking...');
  let buffer = readChunk.sync(dir + '/' + file, 0, 4100);
  let type = fileType(buffer);

  // if file is an image
  if(type.ext === 'png' || type.ext === 'jpg'){
    console.log("type: " + type.ext);
    imageBuffer.push({file, ext:type.ext})
  }
}

function transformImage(imageBuffer){
  let count = 0;

  imageBuffer.forEach(function(item){

    Jimp.read(dir + "/" + item.file)
      .then(function (image) {
        console.log('Jimo Reading...  ' + dir + "/" + item.file);
        image.quality(75)
          .resize(768,512)
          .write(count++ + "." + item.ext);

      }).catch(function (err) {
      throw err;
    })
  });
}
