'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarItemProps {
  icon: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, href, onClick, disabled }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === '/' && href === '/') ||
    pathname === href ||
    pathname?.startsWith(`${href}/`) ||
    (label === 'Logout' && pathname === '/');

  const isLogout = label === 'Logout';

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        'border-l-5 rounded-r-lg transition-colors duration-200',
        isActive ? 'border-l-primary' : 'border-l-transparent'
      )}
    >
      <button
        onClick={handleClick}
        type="button"
        disabled={disabled}
        className={cn(
          'flex items-center gap-x-2 text-sm font-[500] pl-6 ml-3 text-[#737373] transition-all hover:bg-slate-300/20 dark:hover:bg-slate-700/20 w-[90%]',
          isActive && 'bg-primary-tertiary',
          // Apply different text colors based on whether it's logout or active
          isLogout ? 'text-[#E40101]' : isActive ? 'text-primary' : 'text-[#737373]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-x-2 py-3">
          <Icon
            color={
              isLogout
                ? '#E40101'
                : isActive
                  ? 'var(--primary)' // Use CSS variable directly
                  : '#737373'
            }
            className="transition-colors duration-200"
          />
          {label}
        </div>
      </button>
    </div>
  );
};