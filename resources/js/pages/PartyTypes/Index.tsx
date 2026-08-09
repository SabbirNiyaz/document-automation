import { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PartyTypeController from '@/actions/App/Http/Controllers/PartyTypeController';

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
    status: 'Active' | 'Inactive';
    created_at: string | null;
    updated_at: string | null;
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
    };
}

export default function Index({ partyTypes, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const { flash } = usePage().props as {
        flash?: {
            success?: string;
        };
    };

    // Search
    function handleSearch(e: FormEvent) {
        e.preventDefault();

        router.get(
            PartyTypeController.index().url,
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Clear search
    function handleReset() {
        setSearch('');

        router.get(
            PartyTypeController.index().url,
            {},
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

    return (
        <>
            <Head title="Party Types" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Party Types
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the party types used across the system.
                        </p>
                    </div>

                    <Link
                        href={PartyTypeController.create().url}
                        className="inline-flex items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Party Type
                    </Link>
                </div>

                {/* Success Message */}
                {flash?.success && (
                    <div className="rounded-sm bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full max-w-xs rounded-sm border-gray-300 text-sm shadow-sm 
                        px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                    />

                    <button
                        type="submit"
                        className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm
                         font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                    >
                        Search
                    </button>
                    {(search || filters?.search) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm
                             font-medium text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Table */}
                <div className="overflow-hidden rounded-sm border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border">

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

                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Created
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Updated
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-gray-200">

                            {partyTypes.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-sm text-gray-500"
                                    >
                                        No party types found.
                                    </td>
                                </tr>
                            )}

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

                                    {/* Created */}
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {partyType.created_at
                                            ? new Date(partyType.created_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '—'}
                                    </td>

                                    {/* Updated */}
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {partyType.updated_at
                                            ? new Date(
                                                partyType.updated_at
                                            ).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '—'}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Link
                                            href={
                                                PartyTypeController.edit(
                                                    partyType.partyTypeId
                                                ).url
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500 px-3.5 py-1.5 
                                            text-sm font-medium text-white shadow-sm transition-colors duration-150 
                                            hover:bg-yellow-600 active:bg-yellow-700 focus:outline-none focus:ring-2 
                                            focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                            disabled:opacity-50 cursor-pointer"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(partyType)
                                            }
                                            className="ml-4 inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3.5 py-1.5 
                                            text-sm font-medium text-white shadow-sm transition-colors duration-150 
                                            hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 
                                            focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                            disabled:opacity-50 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {partyTypes.links.length > 3 && (
                    <div className="flex flex-wrap gap-1 justify-end">
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