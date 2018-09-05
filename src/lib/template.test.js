import { replaceTokens, replaceMetaTokens, renderMetaTemplte } from './template';

test('tokens are replaced', () => {
  const template = 'my {ONE} is too {TWO}';
  const tokenDict = { ONE: 'spoon', TWO: 'big' };
  expect(replaceTokens(template, tokenDict)).toBe('my spoon is too big');
});

test('meta tag tokens are replaced', () => {
  const template = 'keywords="{KEYWORDS}", description="{DESCRIPTION}"';
  const tokenDefs = {
    DESCRIPTION: 'my {ONE} is too {TWO}',
    KEYWORDS: '{ONE}, {TWO}'
  };
  const tokenValues = {
    ONE: 'spoon',
    TWO: 'big'
  };
  expect(replaceMetaTokens(template, tokenDefs, tokenValues)).toBe(
    'keywords="spoon, big", description="my spoon is too big"'
  );
});

test('meta tag tokens are replaced, no values', () => {
  const template = 'keywords="{KEYWORDS}", description="{DESCRIPTION}"';
  const tokenDefs = {
    DESCRIPTION: 'my spoon is too big',
    KEYWORDS: 'spoon, big'
  };
  expect(replaceMetaTokens(template, tokenDefs)).toBe(
    'keywords="spoon, big", description="my spoon is too big"'
  );
});
