/* eslint-disable react/no-danger */
import React from 'react'
import { withRouter } from 'react-router'

const Link = ({ to, html, history }) => {
  const onClick = e => {
    e.preventDefault()
    history.push(to)
  }
  return (
    <a onClick={onClick} href={to} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default withRouter(Link)
