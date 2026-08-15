import { Link } from '@inertiajs/react';
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
import type { NavItem } from '@/types';
import PartyTypeController from '@/actions/App/Http/Controllers/PartyTypeController';
import DateTypeController from '@/actions/App/Http/Controllers/DateTypeController';
import DocumentTypeController from '@/actions/App/Http/Controllers/DocumentTypeController';
import PartyMasterController from '@/actions/App/Http/Controllers/PartyMasterController';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';
import {
    FileText,
    CalendarDays,
    Users,
    FileType,
    CalendarRange,
    Tags,
} from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Documents',
        href: DocumentController.index().url,
        icon: FileText,
    },
    {
        title: 'Date Details',
        href: DateDetailController.index().url,
        icon: CalendarDays,
    },
    {
        // title: 'Party Masters',
        title: 'Party Management',
        href: PartyMasterController.index().url,
        icon: Users,
    },
    {
        title: 'Document Types',
        href: DocumentTypeController.index().url,
        icon: FileType,
    },
    {
        title: 'Date Types',
        href: DateTypeController.index().url,
        icon: CalendarRange,
    },
    {
        title: 'Party Types',
        href: PartyTypeController.index().url,
        icon: Tags,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={DocumentController.index().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}