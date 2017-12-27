/* eslint-disable prefer-template, max-len */

const getDeferScript = src => (src ? `<script defer src="${src}"></script>` : '');

export default vo => `

<!DOCTYPE html>
<html lang="en">

  <head>
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta charSet='utf-8' />
    <meta httpEquiv="Content-Language" content="en" />
    <meta name="description" content="Jacques Derrida, perhaps commonly recognized for terms like deconstruction, differance, supplement, parasite, iterability and dissemination, also took the time to write about nearly everything else. This database organizes the breadth of Derrida’s virtuosic reach under 871 motifs.">
    <link rel="stylesheet" type="text/css" href="/fonts.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

    <link id="favicon" rel="shortcut icon" href="/kyt-favicon.png" sizes="16x16 32x32" type="image/png" />
    ${vo.mainCSSBundle
      ? '<link rel="stylesheet" type="text/css" href="' + vo.mainCSSBundle + '">'
      : ''}

    <title>Return to Cinder: a database of the work of Jacques Derrida</title>
  </head>

  <body>
    <div id="root"><div>${vo.root}</div></div>
    ${getDeferScript(vo.manifestJSBundle)}
    ${getDeferScript(vo.vendorJSBundle)}
    ${getDeferScript(vo.mainJSBundle)}
  </body>

</html>

`;
