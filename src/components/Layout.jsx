
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, position: 'relative' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
