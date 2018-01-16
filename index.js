const fs = require("fs");
const fileType = require('file-type');
const readChunk = require('read-chunk');
const Jimp = require("jimp");
const async = require("async");
const sync = require("sync");

// ie. node index.js <directory path>
let dir = process.argv[2];
let buf = [];
let imageBuffer = [];
let file;

// search fs for matches
file = fs.statSync(dir);
console.log("Reading files...".bold);
if(file.isDirectory()) readDirectory(dir, buf, dir);
else checkType(dir, imageBuffer);

function readDirectory(path, buf, folder) {

  // reset image buffer
  imageBuffer = new Array();

  // read the directory
  buf = fs.readdirSync(path);

  // check each item
  buf.forEach(function (item) {

    file = fs.statSync(path + "/" + item);

    if(file.isDirectory()) readDirectory(path + "/" + item, buf, item); // recurse on directory
    else if(file.isFile()) checkType(path + "/" + item, imageBuffer); // initialize image transform
  });

  transformImage(imageBuffer, folder);
};

function checkType(file, imageBuffer){
  console.log('Checking...');
  let buffer = readChunk.sync(file, 0, 4100);
  let type = fileType(buffer);

  // if file is an image
  if(type && (type.ext === 'png' || type.ext === 'jpg'))
    imageBuffer.push({file, ext:type.ext})
}

function transformImage(imageBuffer, folder){
  let count = 0;

  // newDirectory = fs.mkdirSync('../' + dir);
  let newDirectory = 'new_' + folder;

  imageBuffer.forEach(function(item){

    Jimp.read(item.file)
      .then(function (image) {
        console.log('Processing...  ' + item.file);
        if(image.bitmap.height > image.bitmap.width) {
          image.quality(75)
            .resize(512,768)
            .write(newDirectory + "/" + count++ + "." + item.ext);
        }
        else{
          image.quality(75)
            .resize(768,512)
            .write(newDirectory + "/" + count++ + "." + item.ext);
        }
      }).catch(function (err) {
      throw err;
    })
  });
}
