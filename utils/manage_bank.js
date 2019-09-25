#!/usr/bin/env node

/*
 * Dev util to manage ir bank
 *
 */

console.log('jsVerb - Manage Bank');

const fs = require('fs');
const { parse } = require('path');

const irPath = '/ir/';
const irConfigFilePath = irPath + '/ir.json';
const ir = require('..' + irConfigFilePath);

const irSupportedExtensions = ['.ogg', '.wav'];

let newBankPath;


// add new bank
let params = process.argv;

if (!params[2] || params[2] === '--help') {
  return console.log('Usage: ./utils/manage_bank.js --add [bank]')
} else if (params[2] === '--add') {
  let bank = params[3];
  // TODO scan new bank automaticaly if no arg
  newBankPath = bank;
} else if (params[2] === '--del') {
  // TODO delete bank
}


function normaliseFileExtension(file, path) {
  let extensionNormalized = file.ext.toLowerCase();
  if (file.ext !== extensionNormalized) {
    let newFilename = path + '/' + file.name + extensionNormalized;
    fs.rename(path + '/' + file.name + file.ext, newFilename, (err) => {
      if (err) console.log(err);
    });
  }
}

function readDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err || !files) return reject('Error readding ir directory -> ' + err);
      
      let newBank = [];
      
      files.forEach((filename) => {

        let file = parse(filename);
        
        if (irSupportedExtensions.includes(file.ext.toLowerCase())) {
          normaliseFileExtension(file, path);
          console.info('Adding new ir sound', file.name, 'to bank', newBankPath);
        
          newBank.push(file.name);
        }
      })
      resolve(newBank);
    })
  })
}

function updateBank() {
  return new Promise((resolve, reject) => {
    let new_ir_data = JSON.stringify(ir, null, 2);
    fs.writeFile('.' + irConfigFilePath, new_ir_data, (err) => {
      if (err) reject('Error writing ir config file', err);
      console.log('Done.')
      resolve();
    });
  })
}


(async function proceed() {
  await readDirectory('.' + irPath + newBankPath)
    .then(files => {
      ir.reverbSet[newBankPath] = files;
    })
    .then(updateBank)
    .catch(console.log);
})();


