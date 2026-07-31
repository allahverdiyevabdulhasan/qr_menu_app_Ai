'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/components/LanguageProvider';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  MonitorPlay, 
  Users, 
  CreditCard, 
  MapPin, 
  Settings, 
  PackageSearch,
  Wallet,
  UserCheck,
  Shield,
  FileText,
  BrainCircuit,
  Megaphone,
  Star,
  Building2,
  Bike,
  PieChart,
  PlusCircle,
  ChefHat,
  Truck,
  RotateCcw,
  Clock,
  DollarSign,
  History,
  BookOpen,
  BarChart2,
  Gift,
  LayoutTemplate
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, checkAuth } = useAuthStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, [checkAuth]);

  if (!mounted || !user) return null;

  const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.is_superuser || user.is_super_admin;
  const isAdminOrOwner = user.role === 'RESTAURANT_OWNER' || user.role === 'MANAGER';

  const menuGroups = isSuperAdmin ? [
    {
      title: t('sidebar_saas_management'),
      items: [
        { name: t('sidebar_general_overview'), path: "/dashboard", icon: <LayoutDashboard size={20} />, show: true },
        { name: t('sidebar_saas_control_center'), path: "/saas-admin", icon: <Shield size={20} />, show: true },
        { name: t('sidebar_module_management'), path: "/saas-admin/modules", icon: <LayoutTemplate size={20} />, show: true },
      ]
    }
  ] : [
    {
      title: t('sidebar_control_panel'),
      items: [
        { name: t('sidebar_general_overview'), path: "/dashboard", icon: <LayoutDashboard size={20} />, show: user.restaurant_settings?.enable_overview !== false },
        { name: t('sidebar_sales_reports'), path: "/dashboard/reports/sales", icon: <PieChart size={20} />, show: (isAdminOrOwner || user.can_view_analytics) && user.restaurant_settings?.enable_reports !== false },
      ]
    },
    {
      title: t('sidebar_operations'),
      items: [
        { name: t('sidebar_orders'), path: "/operations/orders", icon: <ShoppingCart size={20} />, show: user.restaurant_settings?.enable_orders !== false },
        { name: t('sidebar_past_orders'), path: "/operations/orders/history", icon: <History size={20} />, show: user.restaurant_settings?.enable_orders !== false },
        { name: t('sidebar_new_order'), path: "/operations/orders/create", icon: <PlusCircle size={20} />, show: (isAdminOrOwner || user.can_view_waiter_panel || user.can_view_cashier_panel) && user.restaurant_settings?.enable_pos !== false },
        { name: t('sidebar_kds'), path: "/operations/kds", icon: <ChefHat size={20} />, show: (isAdminOrOwner || user.can_view_kitchen_screen) && user.restaurant_settings?.enable_kds !== false },
        { name: t('sidebar_waiter_panel'), path: "/operations/waiter", icon: <Users size={20} />, show: (isAdminOrOwner || user.can_view_waiter_panel) && user.restaurant_settings?.enable_waiter !== false },
        { name: t('sidebar_cashier_panel'), path: "/operations/cashier", icon: <CreditCard size={20} />, show: (isAdminOrOwner || user.can_view_cashier_panel) && user.restaurant_settings?.enable_cashier !== false },
        { name: t('sidebar_courier_panel'), path: "/operations/courier", icon: <Truck size={20} />, show: (isAdminOrOwner || user.role === 'COURIER') && user.restaurant_settings?.enable_courier !== false },
        { name: t('sidebar_tables'), path: "/operations/tables", icon: <MapPin size={20} />, show: (isAdminOrOwner || user.can_view_waiter_panel) && user.restaurant_settings?.enable_reservations !== false },
      ]
    },
    {
      title: t('sidebar_finance_hr'),
      items: [
        { name: t('sidebar_z_reports'), path: "/management/finance/z-reports", icon: <FileText size={20} />, show: (isAdminOrOwner || user.can_view_daily_revenue) && user.restaurant_settings?.enable_finance_z_reports !== false },
        { name: t('sidebar_refunds'), path: "/management/finance/refunds", icon: <RotateCcw size={20} />, show: (isAdminOrOwner || user.can_view_cashier_panel) && user.restaurant_settings?.enable_finance_refunds !== false },
        { name: t('sidebar_expenses'), path: "/management/expenses", icon: <Wallet size={20} />, show: (isAdminOrOwner || user.can_view_expenses) && user.restaurant_settings?.enable_finance_expenses !== false },
        { name: t('sidebar_shifts'), path: "/management/staff/shifts", icon: <Clock size={20} />, show: (isAdminOrOwner || user.can_view_payroll) && user.restaurant_settings?.enable_hr_shifts !== false },
        { name: t('sidebar_payroll'), path: "/management/staff/payroll", icon: <DollarSign size={20} />, show: (isAdminOrOwner || user.can_view_payroll) && user.restaurant_settings?.enable_hr_payroll !== false },
        { name: t('sidebar_roles'), path: "/management/roles", icon: <Shield size={20} />, show: isAdminOrOwner && user.restaurant_settings?.enable_hr_roles !== false },
      ]
    },
    {
      title: t('sidebar_menu_inventory'),
      items: [
        { name: t('sidebar_menu_items'), path: "/management/menu", icon: <PackageSearch size={20} />, show: (isAdminOrOwner || user.can_manage_menu) && user.restaurant_settings?.enable_menu_items !== false },
        { name: t('sidebar_ingredients'), path: "/management/menu/ingredients", icon: <BookOpen size={20} />, show: (isAdminOrOwner || user.can_manage_menu) && user.restaurant_settings?.enable_inventory_ingredients !== false },
        { name: t('sidebar_stock_inventory'), path: "/management/inventory", icon: <PackageSearch size={20} />, show: (isAdminOrOwner || user.can_manage_inventory) && user.restaurant_settings?.enable_inventory_stock !== false },
        { name: t('sidebar_stock_predictions'), path: "/management/inventory/forecast", icon: <BarChart2 size={20} />, show: (isAdminOrOwner || user.can_manage_inventory) && user.restaurant_settings?.enable_inventory_predictions !== false },
      ]
    },
    {
      title: t('sidebar_ai_growth'),
      items: [
        { name: t('sidebar_ai_reports'), path: "/ai/reports", icon: <BrainCircuit size={20} />, show: (isAdminOrOwner || user.can_view_ai_reports) && user.restaurant_settings?.enable_ai_reports !== false },
        { name: t('sidebar_ai_assistant'), path: "/ai/assistant", icon: <BrainCircuit size={20} />, show: (isAdminOrOwner || user.can_view_ai_reports) && user.restaurant_settings?.enable_ai_assistant !== false },
        { name: t('sidebar_campaigns'), path: "/marketing/campaigns", icon: <Megaphone size={20} />, show: (isAdminOrOwner || user.can_manage_campaigns) && user.restaurant_settings?.enable_marketing_campaigns !== false },
        { name: t('sidebar_loyalty'), path: "/marketing/loyalty", icon: <Gift size={20} />, show: (isAdminOrOwner || user.can_manage_campaigns) && user.restaurant_settings?.enable_marketing_loyalty !== false },
        { name: t('sidebar_reviews'), path: "/marketing/reviews", icon: <Star size={20} />, show: (isAdminOrOwner || user.can_view_reviews) && user.restaurant_settings?.enable_reviews !== false },
      ]
    },
    {
      title: t('sidebar_system_settings'),
      items: [
        { name: t('sidebar_branches'), path: "/branches", icon: <Building2 size={20} />, show: isSuperAdmin || user.restaurant_settings?.enable_branches },
        { name: t('sidebar_general_settings'), path: "/settings/general", icon: <Settings size={20} />, show: (isAdminOrOwner || user.can_manage_settings) && user.restaurant_settings?.enable_settings !== false },
        { name: t('sidebar_module_management'), path: "/settings/modules", icon: <LayoutDashboard size={20} />, show: isSuperAdmin },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          NeyMenu AI
        </h2>
      </div>

      <div className="flex-1 py-4">
        {menuGroups.map((group, idx) => {
          const visibleItems = group.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="mb-6">
              <h3 className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {visibleItems.map((item, itemIdx) => {
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                  return (
                    <li key={itemIdx}>
                      <Link 
                        href={item.path}
                        className={`flex items-center px-6 py-2.5 text-sm font-medium transition-colors duration-150 ${
                          isActive 
                            ? 'text-indigo-600 bg-indigo-50 border-r-4 border-indigo-600' 
                            : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
