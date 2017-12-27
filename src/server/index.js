import 'babel-polyfill'
import express from 'express'
import compression from 'compression'
import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import template from './template'
import App from '../components/App'

const clientAssets = require(KYT.ASSETS_MANIFEST) // eslint-disable-line import/no-dynamic-require
const port = parseInt(KYT.SERVER_PORT, 10)
const server = express()

// Remove annoying Express header addition.
server.disable('x-powered-by')

// Compress (gzip) assets in production.
server.use(compression())

// Setup the public directory so that we can server static assets.
server.use(express.static(path.join(process.cwd(), KYT.PUBLIC_DIR)))

// Setup server side routing.
server.get('*', (req, res) => {
  const context = {}

  const html = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  )

  if (context.url) {
    res.redirect(302, context.url)
  } else {
    res.status(200).send(
      template({
        root: html,
        manifestJSBundle: clientAssets['manifest.js'],
        mainJSBundle: clientAssets['main.js'],
        vendorJSBundle: clientAssets['vendor.js'],
        mainCSSBundle: clientAssets['main.css'],
      })
    )
  }
})

server.listen(port, () => {
  console.log(`✅  server started on port: ${port}`) // eslint-disable-line no-console
})
