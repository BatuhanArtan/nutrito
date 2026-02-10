import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Exchanges from './pages/Exchanges'
import Recipes from './pages/Recipes'
import Units from './pages/Units'
import Settings from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/exchanges" element={<Exchanges />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/units" element={<Units />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
