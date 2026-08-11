import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PartyMasterController from '@/actions/App/Http/Controllers/PartyMasterController';
import { Info as InfoIcon, Pencil, Trash2, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
}

interface PartyMaster {
    partyId: number;
    partyName: string;
    address: string;
    partyTypeId: number;
    partyType: PartyType | null;
    contactPerson: string;
    phone: string;
    email: string;
    status: 'Active' | 'Inactive';
    created_at: string | null;
    created_by: User | null;
    updated_at: string | null;
    updated_by: User | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPartyMasters {
    data: PartyMaster[];
    links: PaginationLink[];
}

interface Props {
    partyMasters: PaginatedPartyMasters;
    filters: {
        search: string;
    };
}

export default function Index({ partyMasters, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const { flash } = usePage().props as {
        flash?: {
            success?: string;
        };
    };

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);

            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Info modal
    const [infoParty, setInfoParty] = useState<PartyMaster | null>(null);

    function openInfo(party: PartyMaster) {
        setInfoParty(party);
    }

    function closeInfo() {
        setInfoParty(null);
    }

    // Close modal on Escape
    useEffect(() => {
        if (!infoParty) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [infoParty]);

    // Search
    function handleSearch(e: FormEvent) {
        e.preventDefault();

        router.get(
            PartyMasterController.index().url,
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Reset search
    function handleReset() {
        setSearch('');

        router.get(
            PartyMasterController.index().url,
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Delete
    function handleDelete(partyMaster: PartyMaster) {
        if (
            !confirm(
                `Are you sure you want to delete "${partyMaster.partyName}"? This can't be undone.`
            )
        ) {
            return;
        }

        router.delete(
            PartyMasterController.destroy(
                partyMaster.partyId
            ).url
        );
    }

    // Format date
    function formatDate(value: string | null) {
        return value
            ? new Date(value).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            : '—';
    }

    return (
        <>
            <Head title="Party Masters" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Party Masters
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage parties used across the system.
                        </p>
                    </div>

                    <Link
                        href={PartyMasterController.create().url}
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Party
                    </Link>
                </div>

                {/* Success Message */}
                {showSuccess && flash?.success && (
                    <div className="rounded-sm bg-green-50 px-4 py-3 text-center text-sm text-green-700 shadow-sm">
                        {flash.success}
                    </div>
                )}

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-2 sm:flex-row"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by Party Name or Party Type..."
                        className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs"
                    />

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 cursor-pointer rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:flex-none"
                        >
                            Search
                        </button>

                        {(search || filters?.search) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 cursor-pointer rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 sm:flex-none"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Empty State */}
                {partyMasters.data.length === 0 && (
                    <div className="rounded-sm border border-sidebar-border/70 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No parties found.
                    </div>
                )}

                {/* Mobile / Tablet Cards */}
                {partyMasters.data.length > 0 && (
                    <div className="flex flex-col gap-3 lg:hidden">

                        {partyMasters.data.map((party) => (
                            <div
                                key={party.partyId}
                                className="rounded-sm border border-sidebar-border/70 bg-white p-4 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            ID: {party.partyId}
                                        </p>

                                        <p className="text-sm font-medium text-gray-900">
                                            {party.partyName}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            (party.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-300 text-gray-600')
                                        }
                                    >
                                        {party.status}
                                    </span>
                                </div>

                                {/* Details */}
                                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm">

                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-gray-400">
                                            Party Type
                                        </dt>

                                        <dd className="text-gray-600">
                                            {party.partyType
                                                ? party.partyType.partyTypeName
                                                : '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-gray-400">
                                            Address
                                        </dt>

                                        <dd className="break-words text-gray-600">
                                            {party.address || '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-gray-400">
                                            Contact Person
                                        </dt>

                                        <dd className="text-gray-600">
                                            {party.contactPerson || '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-gray-400">
                                            Phone
                                        </dt>

                                        <dd className="text-gray-600">
                                            {party.phone || '—'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-gray-400">
                                            Email
                                        </dt>

                                        <dd className="break-words text-gray-600">
                                            {party.email || '—'}
                                        </dd>
                                    </div>
                                </dl>

                                {/* Actions */}
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => openInfo(party)}
                                        title="Info"
                                        aria-label="Info"
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-500 p-2
                                        text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 
                                        focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
                                    >
                                        <InfoIcon className="h-4 w-4" />
                                    </button>

                                    <Link
                                        href={
                                            PartyMasterController.edit(
                                                party.partyId
                                            ).url
                                        }
                                        title="Edit"
                                        aria-label="Edit"
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-yellow-500 p-2 text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(party)
                                        }
                                        title="Delete"
                                        aria-label="Delete"
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-red-500 p-2 
                                        text-white shadow-sm hover:bg-red-600 focus:outline-none 
                                        focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop Table */}
                {partyMasters.data.length > 0 && (
                    <div className="hidden overflow-x-auto rounded-sm border border-sidebar-border/70 bg-white shadow-sm lg:block">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Party Name
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Party Type
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Address
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Contact Person
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Phone
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Email
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {partyMasters.data.map((party) => (
                                    <tr key={party.partyId}>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {party.partyId}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {party.partyName}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {party.partyType
                                                ? party.partyType.partyTypeName
                                                : '—'}
                                        </td>

                                        <td className="max-w-xs px-4 py-3 text-sm text-gray-500">
                                            {party.address || '—'}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {party.contactPerson || '—'}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {party.phone || '—'}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {party.email || '—'}
                                        </td>

                                        <td className="px-4 py-3 text-right text-sm whitespace-nowrap">

                                            <button
                                                type="button"
                                                onClick={() => openInfo(party)}
                                                title="Info"
                                                aria-label="Info"
                                                className="inline-flex items-center justify-center rounded-md bg-gray-400 p-2 
                                                text-white hover:bg-gray-500 cursor-pointer"
                                            >
                                                <InfoIcon className="h-4 w-4" />
                                            </button>

                                            <Link
                                                href={
                                                    PartyMasterController.edit(
                                                        party.partyId
                                                    ).url
                                                }
                                                title="Edit"
                                                aria-label="Edit"
                                                className="ml-4 inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(party)
                                                }
                                                title="Delete"
                                                aria-label="Delete"
                                                className="ml-4 inline-flex items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600 cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>

                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {partyMasters.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {partyMasters.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                                className={
                                    'rounded-sm px-3 py-1.5 text-sm ' +
                                    (link.active
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50') +
                                    (!link.url
                                        ? ' pointer-events-none opacity-50'
                                        : '')
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Info Modal */}
            {infoParty && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeInfo}
                >
                    <div
                        className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Record Info
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    {infoParty.partyName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeInfo}
                                className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 
                                hover:text-gray-600 focus:outline-none focus:ring-2 
                                focus:ring-indigo-500 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoParty.created_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoParty.created_by
                                        ? `${infoParty.created_by.name} (ID: ${infoParty.created_by.id})`
                                        : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoParty.updated_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoParty.updated_by
                                        ? `${infoParty.updated_by.name} (ID: ${infoParty.updated_by.id})`
                                        : '—'}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={closeInfo}
                                className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm 
                                font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                focus:ring-offset-2 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Party Masters',
            href: PartyMasterController.index().url,
        },
    ],
};