import { useState, FormEvent, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PartyTypeController from '@/actions/App/Http/Controllers/PartyTypeController';
import { Info as InfoIcon, Pencil, Trash2, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
    status: 'Active' | 'Inactive';
    created_at: string | null;
    updated_at: string | null;

    created_by: User | null;
    updated_by: User | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPartyTypes {
    data: PartyType[];
    links: PaginationLink[];
}

interface Props {
    partyTypes: PaginatedPartyTypes;
    filters: {
        search: string;
        status: string; // '' | 'Active' | 'Inactive'
    };
}

export default function Index({ partyTypes, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const { flash } = usePage().props as {
        flash?: {
            success?: string;
        };
    };

    // Success message Timer
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Info modal
    const [infoPartyType, setInfoPartyType] = useState<PartyType | null>(null);

    function openInfo(partyType: PartyType) {
        setInfoPartyType(partyType);
    }

    function closeInfo() {
        setInfoPartyType(null);
    }

    // Close modal on Escape
    useEffect(() => {
        if (!infoPartyType) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [infoPartyType]);

    // Search (server-side, applies to full dataset before pagination)
    function handleSearch(e: FormEvent) {
        e.preventDefault();

        router.get(
            PartyTypeController.index().url,
            {
                search,
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Reset just the search term, keep status as-is
    function handleResetSearch() {
        setSearch('');

        router.get(
            PartyTypeController.index().url,
            {
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Status dropdown fires immediately, keeps current search term
    function handleStatusChange(value: string) {
        setStatus(value);

        router.get(
            PartyTypeController.index().url,
            {
                search,
                status: value !== 'all' ? value : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Reset just the status filter, keep search as-is
    function handleResetStatus() {
        setStatus('all');

        router.get(
            PartyTypeController.index().url,
            {
                search,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Delete
    function handleDelete(partyType: PartyType) {
        if (
            !confirm(
                `Are you sure you want to delete "${partyType.partyTypeName}"? 
                This can't be undone.`
            )
        ) {
            return;
        }

        router.delete(
            PartyTypeController.destroy(partyType.partyTypeId).url
        );
    }

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
            <Head title="Party Types" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Party Types
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the party types used across the system.
                        </p>
                    </div>

                    <Link
                        href={PartyTypeController.create().url}
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Party Type
                    </Link>
                </div>

                {showSuccess && flash?.success && (
                    <div className="rounded-sm bg-green-50 px-4 py-3 text-center text-sm text-green-700 shadow-sm">
                        {flash.success}
                    </div>
                )}

                {/* Search + Status filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    {/* Search group */}
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Name..."
                            className="w-full rounded-sm border-gray-300 text-sm shadow-sm 
                            px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:w-64"
                        />

                        <button
                            type="submit"
                            className="shrink-0 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm
                             font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                        >
                            Search
                        </button>

                        {(search || filters?.search) && (
                            <button
                                type="button"
                                onClick={handleResetSearch}
                                className="shrink-0 inline-flex items-center justify-center rounded-sm border border-gray-300 
                                bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                                title="Clear search"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </form>

                    {/* Status filter group */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-sm text-gray-500 shrink-0">
                            Status:
                        </label>

                        <select
                            id="status-filter"
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="rounded-sm border-gray-300 text-sm shadow-sm px-3 py-2 
                            focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        {status !== 'all' && (
                            <button
                                type="button"
                                onClick={handleResetStatus}
                                className="shrink-0 inline-flex items-center justify-center rounded-sm border border-gray-300 
                                bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                                title="Clear status filter"
                                aria-label="Clear status filter"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Empty state (shared) */}
                {partyTypes.data.length === 0 && (
                    <div className="rounded-sm border border-sidebar-border/70 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm dark:border-sidebar-border">
                        No party types found.
                    </div>
                )}

                {/* Mobile / tablet: card list (hidden on lg and up) */}
                {partyTypes.data.length > 0 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        {partyTypes.data.map((partyType) => (
                            <div
                                key={partyType.partyTypeId}
                                className="rounded-sm border border-sidebar-border/70 bg-white p-4 shadow-sm dark:border-sidebar-border"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            ID: {partyType.partyTypeId}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {partyType.partyTypeName}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            (
                                                partyType.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-300 text-gray-600'
                                            )
                                        }
                                    >
                                        {partyType.status}
                                    </span>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => openInfo(partyType)}
                                        title="Info"
                                        aria-label="Info"
                                        className="inline-flex items-center justify-center rounded-md bg-gray-500 p-2
                                        text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 
                                        focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
                                    >
                                        <InfoIcon className="h-4 w-4" />
                                    </button>

                                    <Link
                                        href={
                                            PartyTypeController.edit(
                                                partyType.partyTypeId
                                            ).url
                                        }
                                        title="Edit"
                                        aria-label="Edit"
                                        className="inline-flex items-center justify-center rounded-md bg-yellow-500 p-2
                                        text-white hover:bg-yellow-600"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(partyType)}
                                        title="Delete"
                                        aria-label="Delete"
                                        className="ml-4 inline-flex items-center justify-center rounded-md bg-red-500 p-2 
                                        text-white hover:bg-red-600 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop: table (lg and up only) */}
                {partyTypes.data.length > 0 && (
                    <div className="hidden overflow-x-auto rounded-sm border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border lg:block">

                        <table className="min-w-full divide-y divide-gray-200">

                            {/* Table Header */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Name
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="divide-y divide-gray-200">

                                {partyTypes.data.map((partyType) => (
                                    <tr key={partyType.partyTypeId}>

                                        {/* ID */}
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {partyType.partyTypeId}
                                        </td>

                                        {/* Name */}
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {partyType.partyTypeName}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={
                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                    (
                                                        partyType.status === 'Active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-300 text-gray-600'
                                                    )
                                                }
                                            >
                                                {partyType.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => openInfo(partyType)}
                                                title="Info"
                                                aria-label="Info"
                                                className="inline-flex items-center justify-center rounded-md bg-gray-400 p-2 text-sm font-medium 
                                                text-white hover:bg-gray-500 cursor-pointer"
                                            >
                                                <InfoIcon className="h-4 w-4" />
                                            </button>

                                            <Link
                                                href={
                                                    PartyTypeController.edit(
                                                        partyType.partyTypeId
                                                    ).url
                                                }
                                                title="Edit"
                                                aria-label="Edit"
                                                className="ml-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-yellow-500 p-2 
                                                text-sm font-medium text-white shadow-sm transition-colors duration-150 
                                                hover:bg-yellow-600 active:bg-yellow-700 focus:outline-none focus:ring-2 
                                                focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                                disabled:opacity-50 cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(partyType)
                                                }
                                                title="Delete"
                                                aria-label="Delete"
                                                className="ml-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-red-500 p-2 
                                                text-sm font-medium text-white shadow-sm transition-colors duration-150 
                                                hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 
                                                focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                                disabled:opacity-50 cursor-pointer"
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
                {partyTypes.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {partyTypes.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                                className={
                                    'rounded-sm px-3 py-1.5 text-sm ' +
                                    (
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    ) +
                                    (
                                        !link.url
                                            ? ' pointer-events-none opacity-50'
                                            : ''
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Info Modal */}
            {infoPartyType && (
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
                                    {infoPartyType.partyTypeName}
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
                                    {formatDate(infoPartyType.created_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoPartyType.created_by
                                        ? `${infoPartyType.created_by.name} (ID: ${infoPartyType.created_by.id})`
                                        : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoPartyType.updated_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoPartyType.updated_by
                                        ? `${infoPartyType.updated_by.name} (ID: ${infoPartyType.updated_by.id})`
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
            title: 'Party Types',
            href: PartyTypeController.index().url,
        },
    ],
};