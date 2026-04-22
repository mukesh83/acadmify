import { useState } from 'react'
import { DEMO_ORDERS } from './constants'
import Navbar      from './components/Navbar'
import Home        from './components/Home'
import Upload      from './components/Upload'
import Track       from './components/Track'
import AdminLogin  from './components/AdminLogin'
import Admin       from './components/Admin'

export default function App() {
  const [page,        setPage]        = useState('home')
  const [adminIn,     setAdminIn]     = useState(false)
  const [adminSecret, setAdminSecret] = useState(null)
  // Local orders state acts as a cache / demo fallback
  const [orders,      setOrders]      = useState(DEMO_ORDERS)

  const addOrder = order => setOrders(prev => [order, ...prev])

  const handleAdminLogin = (secret) => {
    setAdminSecret(secret)
    setAdminIn(true)
    setPage('admin')
  }

  const handleAdminLogout = () => {
    setAdminIn(false)
    setAdminSecret(null)
    setPage('home')
  }

  const showNavbar = page !== 'adminlogin' && page !== 'admin'

  return (
    <div style={{ minHeight: '100vh', background: '#0F0507', color: '#F0E8D8' }}>
      {showNavbar && <Navbar page={page} setPage={setPage} adminIn={adminIn} />}

      {page === 'home'       && <Home setPage={setPage} />}
      {page === 'upload'     && <Upload setPage={setPage} addOrder={addOrder} />}
      {page === 'track'      && <Track orders={orders} />}

      {page === 'adminlogin' && <AdminLogin onLogin={handleAdminLogin} />}
      {page === 'admin' && adminIn && (
        <Admin
          adminSecret={adminSecret}
          onLogout={handleAdminLogout}
          setPage={setPage}
        />
      )}
    </div>
  )
}
