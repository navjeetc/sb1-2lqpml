import { Home, Users, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export function useNavigation() {
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patient List', href: '/patients', icon: Users },
    { name: 'Add New Patient', href: '/new', icon: UserPlus },
  ];

  return { navigationItems };
}