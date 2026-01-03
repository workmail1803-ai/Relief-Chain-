/**
 * Layout Component (MVC Pattern)
 * View Layer - Main layout wrapper with navbar
 */
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
            <Navbar />
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
