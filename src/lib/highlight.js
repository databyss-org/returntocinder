import { findAll } from 'highlight-words-core';
import latinize from 'latinize';

export default function highlight({ searchWords, textToHighlight }) {
  if (!searchWords) {
    return textToHighlight;
  }

  const chunks = findAll({
    sanitize: str => str.toLowerCase(),
    searchWords,
    textToHighlight: latinize(textToHighlight),
  });

  // find tag regions so we don't mess with strings in links
  const regex = /<\/?[^>]+(>|$)/g;
  const tagChunks = [];
  let match;
  while ((match = regex.exec(textToHighlight))) {
    const start = match.index;
    const end = regex.lastIndex;
    // We do not return zero-length matches
    if (end > start) {
      tagChunks.push({ match, start, end });
    }
    // Prevent browsers like Firefox from getting stuck in an infinite loop
    // See http://www.regexguru.com/2008/04/watch-out-for-zero-length-matches/
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  return chunks
    .map((chunk, index) => {
      const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start);

      // do not mess with strings in links
      for (const tagChunk of tagChunks) {
        if (chunk.start >= tagChunk.start && chunk.end <= tagChunk.end) {
          return text;
        }
      }

      return chunk.highlight ? `<mark>${text}</mark>` : text;
    })
    .join('');
}
