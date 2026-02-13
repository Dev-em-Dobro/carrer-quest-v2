import { NavItem } from '../types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    href: '/',
    active: true,
  },
  {
    label: 'Job Board',
    icon: 'work',
    href: '/jobs',
  },
  {
    label: 'Skill Assessments',
    icon: 'code',
    href: '/assessments',
  },
  {
    label: 'Analytics',
    icon: 'bar_chart',
    href: '/analytics',
  },
];

export const LOGO_TEXT = {
  main: 'CAREER',
  accent: 'QUEST',
};
