const fs = require("fs");
const fileType = require('file-type');
const readChunk = require('read-chunk');
const Jimp = require("jimp");
const async = require("async");
const sync = require("sync");

// ie. node index.js <directory path>
let dir = process.argv[2];
let buf = [];
let file;

readDirectory(dir, buf, dir);

function readDirectory(path, buf, folder) {

  // reset image buffer
  let imageBuffer = [];

  // read the directory
  buf = fs.readdirSync(path);

  // check each item
  buf.forEach(function (item) {

    // check whether item is a file or nested directory
    file = fs.statSync(path + "/" + item);
    console.log('inside stat: ' + path + "/" + item);
    if(file.isDirectory()){
      readDirectory(path + "/" + item, buf, item); // recurse on directory
    }
    else if(file.isFile()) checkType(path + "/" + item, imageBuffer); // initialize image transform
    });

  transformImage(imageBuffer, folder);
};

function checkType(file, imageBuffer){
  console.log('Checking...');
  let buffer = readChunk.sync(file, 0, 4100);
  let type = fileType(buffer);

  // if file is an image
  if(type.ext === 'png' || type.ext === 'jpg'){
    console.log("type: " + type.ext);
    imageBuffer.push({file, ext:type.ext})
  }
}

function transformImage(imageBuffer, folder){
  let count = 0;

  // newDirectory = fs.mkdirSync('../' + dir);
  let newDirectory = 'new_' + folder;

  imageBuffer.forEach(function(item){

    Jimp.read(item.file)
      .then(function (image) {
        console.log('Jimo Reading...  ' + item.file);
        image.quality(75)
          .resize(768,512)
          .write(newDirectory + "/" +count++ + "." + item.ext);

      }).catch(function (err) {
      throw err;
    })
  });
}
