import { Link, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    CreditCard,
    FileBarChart,
    LayoutGrid,
    PackageMinus,
    PackagePlus,
    ReceiptText,
    Scale,
    Settings,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { create as weighment, index as bills } from '@/routes/bills';
import { edit as companySettings } from '@/routes/company';
import { index as expenses } from '@/routes/expenses';
import { index as reports } from '@/routes/reports';
import { index as salary } from '@/routes/salary';
import { show as subscription } from '@/routes/subscription';
import { index as vendors } from '@/routes/vendors';
import type { NavItem } from '@/types';

type MenuItem = NavItem & { ownerOnly?: boolean };

const menu: MenuItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        ownerOnly: true,
    },
    { title: 'New weighment', href: weighment(), icon: Scale },
    { title: 'Purchase orders', href: bills('purchase'), icon: PackagePlus },
    { title: 'Sales orders', href: bills('sales'), icon: PackageMinus },
    { title: 'Vendor management', href: vendors(), icon: Users },
    { title: 'Immediate expenses', href: expenses(), icon: ReceiptText },
    {
        title: 'Salary',
        href: salary(),
        icon: BriefcaseBusiness,
        ownerOnly: true,
    },
    { title: 'Reports', href: reports(), icon: FileBarChart, ownerOnly: true },
    {
        title: 'Subscription',
        href: subscription(),
        icon: CreditCard,
        ownerOnly: true,
    },
    {
        title: 'Settings',
        href: companySettings(),
        icon: Settings,
        ownerOnly: true,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isOwner = auth.user.role === 'owner';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isOwner ? dashboard() : bills('purchase')}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={menu.filter((item) => isOwner || !item.ownerOnly)}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
