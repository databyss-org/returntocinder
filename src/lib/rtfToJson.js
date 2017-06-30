/* eslint-disable prefer-template, no-continue */

import parse from 'rtf-parser';

import { urlifyMotif, textifyMotif } from './_helpers';

const sectionPattern = /^(\*{3})*\+*[A-Z]{1,4}i{0,3}/;

const defaults = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  foreground: { red: 0, blue: 0, green: 0 },
  background: { red: 255, blue: 255, green: 255 },
  firstLineIndent: 0,
  indent: 0,
  align: 'left',
  valign: 'normal',
  fontSize: 24
};

export function asStream(cb) {
  return parse(htmlifyResult(cb));
}

export function fromStream(stream, cb) {
  return parse.stream(stream, htmlifyResult(cb));
}

export function fromString(string, cb) {
  return parse.string(string, htmlifyResult(cb));
}

function htmlifyResult(cb) {
  return (err, doc) => {
    if (err) return cb(err);
    try {
      return cb(null, rtfToHTML(doc));
    } catch (ex) {
      return cb(ex);
    }
  };
}

function rtfToHTML(doc) {
  const chapters = {};
  let sections;
  let entries;

  // console.error(doc.content);

  for (let i = 0; i < doc.content.length; i += 1) {
    // scan for chapter
    const chapterTitle = getHeading(doc.content[i]);
    if (!chapterTitle) {
      continue;
    }
    sections = {};

    do {
      if (getHeading(doc.content[i + 1])) {
        // end chapter
        break;
      }

      i += 1;
      // scan for section
      const sectionTitle = getSection(doc.content[i]);
      if (!sectionTitle) {
        continue;
      }

      // capture entries
      entries = [];
      do {
        const entry = renderPara(doc.content[i], defaults);
        if (entry) {
          const re = new RegExp(
            `^(<em>)*\\s*${sectionPattern.source.substr(1)}\\s*(</em>)*`
          );
          entries = entries.concat(entry.replace(re, '').trim());
        }
        if (getSection(doc.content[i + 1])) {
          // end section
          break;
        }
        if (getHeading(doc.content[i + 1])) {
          // end chapter
          break;
        }
        i += 1;
      } while (i < doc.content.length);
      sections[sectionTitle] = entries;
    } while (i < doc.content.length);

    const chapterTitleText = textifyMotif(chapterTitle);
    const chapterTitleUrl = urlifyMotif(chapterTitleText);

    if (!chapterTitleUrl.length) {
      continue;
    }

    chapters[urlifyMotif(chapterTitleText)] = {
      title: chapterTitle,
      sources: sections
    };
  }

  // console.log(chapters);
  return JSON.stringify(chapters);
}

function getHeading(chunk) {
  if (!chunk) {
    return false;
  }
  if (!(chunk.style.bold || (
    chunk.content && chunk.content.length && chunk.content[0].style.bold
  ))) {
    return false;
  }
  return renderPara(chunk, defaults);
}

function getSection(chunk) {
  const c = getChunkValue(chunk);
  const s = c.match(sectionPattern);
  return s ? s[0] : null;
}

function getChunkValue(chunk) {
  if (!chunk) {
    return '';
  }
  if (chunk.content && !chunk.content.length) {
    return '';
  }
  return chunk.content ? chunk.content[0].value : chunk.value;
}

// function CSS (chunk, defaults) {
//   let css = ''
//   if (chunk.style.indent != null && chunk.style.indent !== defaults.indent) {
//     css += `padding-left: ${chunk.style.indent / 20}pt;`
//   }
//   return css
// }

function styleTags(chunk, defaults) {
  let open = '';
  let close = '';
  if (chunk.style.italic != null && chunk.style.italic !== defaults.italic) {
    open += '<em>';
    close = '</em>' + close;
  }
  if (chunk.style.strikethrough != null && chunk.style.strikethrough !== defaults.strikethrough) {
    open += '<s>';
    close = '</s>' + close;
  }
  if (chunk.style.underline != null && chunk.style.underline !== defaults.underline) {
    open += '<u>';
    close = '</u>' + close;
  }
  if (chunk.style.valign != null && chunk.style.valign !== defaults.valign) {
    if (chunk.style.valign === 'super') {
      open += '<sup>';
      close = '</sup>' + close;
    } else if (chunk.style.valign === 'sub') {
      open += '<sup>';
      close = '</sup>' + close;
    }
  }
  if (chunk.style.fontSize != null && chunk.style.fontSize !== defaults.fontSize) {
    open += '<small>';
    close = '</small>' + close;
  }
  return { open, close };
}

function renderPara(para, defaults) {
  if (!para) return null;
  // console.log('renderPara', para);
  const tags = styleTags(para, defaults);
  const pdefaults = Object.assign({}, defaults);
  for (const item of Object.keys(para.style)) {
    if (para.style[item] != null) pdefaults[item] = para.style[item];
  }
  if (para.content) {
    if (para.content.length === 0) return null;
    return tags.open +
      para.content.map(span => renderPara(span, pdefaults)).join('') +
      tags.close;
  }
  if (para.value.length === 0) return null;
  return para.value.match(/[^\s]/) ? tags.open + para.value + tags.close : ' ';
}
