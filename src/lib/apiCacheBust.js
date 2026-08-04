const DEPLOY_TOKEN_META_NAME = 'deploy-token'

export const getDeployToken = () => {
  if (typeof document === 'undefined') {
    return null
  }

  const meta = document.querySelector(
    `meta[name="${DEPLOY_TOKEN_META_NAME}"]`
  )

  return meta && meta.content ? meta.content : null
}

export const withDeployToken = url => {
  const deployToken = getDeployToken()

  if (!deployToken) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}deployToken=${encodeURIComponent(deployToken)}`
}
