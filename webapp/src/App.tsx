import Cartograph from './components/Cartograph'
import Footer from './components/Footer'

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'hsl(120, 40%, 5%)',
        color: 'hsl(120, 5%, 75%)',
      }}
    >
      <div style={{ flex: 1 }}>
        <Cartograph />
      </div>
      <div
        style={{
          flex: 0,
        }}
      >
        <Footer />
      </div>
    </div>
  )
}
