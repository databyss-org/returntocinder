import { findAll } from 'highlight-words-core';
import latinize from 'latinize';

export default function highlight({ searchWords, textToHighlight }) {
  if (!searchWords) {
    return textToHighlight;
  }

  const chunks = findAll({
    sanitize: str => str.toLowerCase(),
    searchWords,
    textToHighlight: latinize(textToHighlight)
  });

  return chunks.map((chunk, index) => {
    const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start);
    return chunk.highlight ? `<mark>${text}</mark>` : text;
  }).join('');
}
