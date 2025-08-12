import { Outlet } from 'react-router-dom'
import Header from './components/Header'

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t p-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} Linkroom</footer>
    </div>
  )
}
