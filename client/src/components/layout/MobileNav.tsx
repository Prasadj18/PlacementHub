import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  CalendarDays,
  Bell,
  UserCircle,
} from 'lucide-react';
import './MobileNav.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/applications', icon: FileText, label: 'Apps' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
