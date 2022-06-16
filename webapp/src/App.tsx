import Cartograph from './components/Cartograph'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <div
          style={{ display: 'flex', flexDirection: 'row', height: '100%' }}
        >
          <div style={{ flex: 0 }}>
            <Sidebar />
          </div>
          <div style={{ flex: 1 }}>
            <Cartograph />
          </div>
        </div>
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
