import { useEffect } from 'react'

interface HelmetProps {
  title?: string
  meta?: Array<{
    name?: string
    content?: string
    property?: string
  }>
  link?: Array<{
    rel?: string
    href?: string
  }>
  children?: React.ReactNode
}

export const Helmet = ({ title, meta = [], link = [], children }: HelmetProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Update meta tags
    meta.forEach(({ name, content, property }) => {
      if (name && content) {
        let metaElement = document.querySelector(`meta[name="${name}"]`)
        if (!metaElement) {
          metaElement = document.createElement('meta')
          metaElement.setAttribute('name', name)
          document.head.appendChild(metaElement)
        }
        metaElement.setAttribute('content', content)
      }
      
      if (property && content) {
        let metaElement = document.querySelector(`meta[property="${property}"]`)
        if (!metaElement) {
          metaElement = document.createElement('meta')
          metaElement.setAttribute('property', property)
          document.head.appendChild(metaElement)
        }
        metaElement.setAttribute('content', content)
      }
    })

    // Update link tags
    link.forEach(({ rel, href }) => {
      if (rel && href) {
        let linkElement = document.querySelector(`link[rel="${rel}"]`)
        if (!linkElement) {
          linkElement = document.createElement('link')
          linkElement.setAttribute('rel', rel)
          document.head.appendChild(linkElement)
        }
        linkElement.setAttribute('href', href)
      }
    })
  }, [title, meta, link])

  return <>{children}</>
}
