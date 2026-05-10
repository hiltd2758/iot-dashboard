import { Outlet } from 'react-router-dom'
import Sidebar from './SideBar'

export default function MainLayout() {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg-main)' }}>
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}