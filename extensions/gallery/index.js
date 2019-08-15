'use strict';

/* eslint-disable camelcase */

const fs = require('fs');
const pug = require('pug');
const path = require('path');
const express = require('express');

const dir_template_path = path.resolve(__dirname, 'dir_template.pug');
const dir_template_text = fs.readFileSync(dir_template_path, 'utf-8');
const dir_template = pug.compile(dir_template_text);

const root_template_path = path.resolve(__dirname, 'root_template.pug');
const root_template_text = fs.readFileSync(root_template_path, 'utf-8');
const root_template = pug.compile(root_template_text);

const data = new Map();
const galleryDir = fs.readdirSync('./gallery');
for (const dir of galleryDir) {
  const dirname = path.resolve('./gallery', dir);
  if (fs.lstatSync(dirname).isDirectory()) {
    const filelist = fs.readdirSync(dirname);
    const picnumber = filelist.filter((filename) => filename.indexOf('thumbnail') > -1).length;
    if (picnumber) {
      data.set(dir, picnumber);
    }
  }
}

const gallery = express();
gallery.use(express.static('gallery'));

const dirs = Array.from(data);
gallery.use('/random', (req, res, next) => {
  res.header('Cache-Control', 'no-cache');
  const [dirname, picnumber] = dirs[Math.floor(Math.random() * dirs.length)];
  const id = Math.floor(Math.random() * picnumber) + 1;
  res.redirect('/' + dirname + '/' + id + '.jpg');
});
gallery.use('/:dirname', (req, res, next) => {
  const dirname = req.params.dirname;
  const picnumber = data.get(dirname);
  if (picnumber) {
    res.status(200).end(dir_template({ dirname, picnumber }));
  } else {
    next();
  }
});
gallery.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.status(200).end(root_template({ data }));
  } else {
    next();
  }
});

module.exports = gallery;
