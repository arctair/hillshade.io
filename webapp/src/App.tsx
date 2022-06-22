import Cartograph from './components/Cartograph'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import { Provider as ViewStateProvider } from './components/ViewState'

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
            <ViewStateProvider>
              <Cartograph />
            </ViewStateProvider>
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
