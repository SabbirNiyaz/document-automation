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
// import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import PartyTypeController from '@/actions/App/Http/Controllers/PartyTypeController';
import DateTypeController from '@/actions/App/Http/Controllers/DateTypeController';
import DocumentTypeController from '@/actions/App/Http/Controllers/DocumentTypeController';
import PartyMasterController from '@/actions/App/Http/Controllers/PartyMasterController';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';

const mainNavItems: NavItem[] = [
    {
        title: 'Documents',
        href: DocumentController.index().url,
    },
    {
        title: 'Date Details',
        href: DateDetailController.index().url,
    },
    {
        title: 'Party Masters',
        href: PartyMasterController.index().url,
    },
    {
        title: 'Document Types',
        href: DocumentTypeController.index().url,
    },
    {
        title: 'Date Types',
        href: DateTypeController.index().url,
    },
    {
        title: 'Party Types',
        href: PartyTypeController.index().url,
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
