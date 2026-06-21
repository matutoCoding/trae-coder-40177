import { NavLink } from 'react-router-dom';
import { Bell, Users, BarChart3, Settings, Pill, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role?: 'clerk' | 'manager';
}

const navItems = [
  { path: '/', label: '今日待提醒', icon: Bell },
  { path: '/members', label: '会员管理', icon: Users },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

const managerItems = [
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

export default function Sidebar({ role = 'clerk' }: SidebarProps) {
  const items = role === 'manager' ? [...navItems] : navItems;

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">续购提醒</h1>
          <p className="text-xs text-slate-500">慢病管理工作台</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.path === '/' && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-medium text-white">
                10
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-medium text-white">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">张营业员</p>
            <p className="text-xs text-slate-500">
              {role === 'manager' ? '店长' : '营业员'}
            </p>
          </div>
          <button className="text-slate-400 transition-colors hover:text-slate-600">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
