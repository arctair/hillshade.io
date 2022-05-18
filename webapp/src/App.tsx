import Cartograph from './components/Cartograph'
import Footer from './components/Footer'

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#111',
        color: '#EEE',
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
