export default [
  {
    path: '/Baby Daddy/BBDD.rtf',
    testPath: '/Baby Daddy/BBDD-test.rtf',
    out: { public: './repo/public', content: './repo/src/content' },
    compile: true
  },
  {
    path: '/Baby Daddy/kant.rtf',
    out: { public: './repo/public', content: './repo/src/content' },
    compile: true,
    isSupplement: true,
  },
  {
    path: '/Baby Daddy/content/about/contact.json',
    out: './repo/src/content/about/contact.json',
    compile: true
  },
  {
    path: '/Baby Daddy/content/about/epigraphs.json',
    out: './repo/src/content/about/epigraphs.json',
    compile: true
  },
  {
    path: '/Baby Daddy/content/about/frontis.json',
    out: './repo/src/content/about/frontis.json',
    compile: true
  },
  {
    path: '/Baby Daddy/content/about/grammar.json',
    out: './repo/src/content/about/grammar.json',
    compile: true
  },
  {
    path: '/Baby Daddy/content/about/manifest.json',
    out: './repo/src/content/about/manifest.json',
    compile: true
  }
];
