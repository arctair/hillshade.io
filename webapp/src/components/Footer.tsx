import { ReactNode } from 'react'
import Versions from './Versions'

import './Footer.css'

const gray = 'hsl(120, 10%, 30%)'
const light = 'hsl(120, 5%, 75%)'

export default function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
        padding: '0.125rem 0',
        borderTop: `1px solid black`,
        backgroundColor: gray,
        fontWeight: 'bold',
        color: light,
      }}
    >
      {window.location.href.match(
        /http:\/\/(localhost|192\.168\.\d+\.\d+):/,
      ) && (
        <Padding>
          <SimpleAnchor href="http://hillshade.io">
            deployment
          </SimpleAnchor>
        </Padding>
      )}
      <Padding>
        <SimpleAnchor href="https://github.com/arctair/hillshade.io">
          <img
            src="https://cdnjs.cloudflare.com/ajax/libs/topcoat-icons/0.2.0/svg/github.svg"
            alt="github"
            style={{ height: '1rem', verticalAlign: 'middle' }}
          />
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
