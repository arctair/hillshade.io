import { ReactNode } from 'react'
import Versions from './Versions'

import './Footer.css'

export default function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
      }}
    >
      {window.location.href.startsWith('http://localhost:') && (
        <Padding>
          <SimpleAnchor href="http://hillshade.io">
            deployment
          </SimpleAnchor>
        </Padding>
      )}
      <Padding>
        <SimpleAnchor href="https://github.com/arctair/hillshade.io">
          github
        </SimpleAnchor>
      </Padding>
      <Versions wrapper={Padding} />
    </div>
  )
}

type SimpleAnchorProps = { children: ReactNode; href: string }
function SimpleAnchor({ href, children }: SimpleAnchorProps) {
  return (
    <a
      href={href}
      children={children}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    />
  )
}

type PaddingProps = { children: ReactNode }
function Padding(props: PaddingProps) {
  return <div {...props} className="padding" />
}
