import Cartograph from './components/Cartograph'
import Footer from './components/Footer'
import { RemoteLayoutProvider } from './components/RemoteLayoutState'
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
          <ViewStateProvider>
            <RemoteLayoutProvider>
              <div style={{ flex: 0, flexBasis: '30vw' }}>
                <Sidebar />
              </div>
              <div style={{ flex: 1 }}>
                <Cartograph />
              </div>
            </RemoteLayoutProvider>
          </ViewStateProvider>
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
