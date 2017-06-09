"use strict";

const fs = require('fs');
const path = require('path');
const Prism = require('prismjs');

const re = /require\(\'\!\!prismjs-loader\?lang\=(.)+\!(.)+\'\)/g

function applyPrism(file) {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.indexOf('!!prismjs-loader?') > -1) {
    content.match(re).forEach(match => {
      const a = match.indexOf('lang=') + 5;
      const b= match.indexOf('!.') + 1;
      const lang = match.substring(a, b - 1);
      let source = match.substring(b, match.length - 2);
      if (lang == 'typescript') {
        source += '.ts';
      }

      const sourceFile = path.resolve(path.dirname(file), source);
      let sourceContent = fs.readFileSync(sourceFile, 'utf-8');
      if (!Prism.languages[lang]) {
        require(`prismjs/components/prism-${lang}.js`);
      }

      const prismLang = Prism.languages[lang];
      const value = Prism.highlight(sourceContent, prismLang);
      const str = JSON.stringify(value);
      content = content.replace(match, str);
    });
    fs.writeFileSync(file, content, 'utf-8');
  }
}

function visitFolder(folder, transform) {
  const files = fs.readdirSync(folder, 'utf-8');
  files.forEach((file) => {
    const path = folder + '/' + file;
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      visitFolder(path, transform);
    } else {
      transform(path);
    }
  });
}

visitFolder('./temp/src', applyPrism);

