import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DateTypeController from '@/actions/App/Http/Controllers/DateTypeController';
interface User {
    id: number;
    name: string;
}

interface DateType {
    dateTypeId: number;
    dateTypeName: string;
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

interface PaginatedDateTypes {
    data: DateType[];
    links: PaginationLink[];
}

interface Props {
    dateTypes: PaginatedDateTypes;

    filters: {
        search: string;
    };
}

export default function Index({
    dateTypes,
    filters,
}: Props) {
    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

    const { flash } = usePage().props as {
        flash?: {
            success?: string;
        };
    };

    const [showSuccess, setShowSuccess] =
        useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);

            const timer = setTimeout(
                () => setShowSuccess(false),
                3000
            );

            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Info modal
    const [infoDateType, setInfoDateType] =
        useState<DateType | null>(null);

    function openInfo(dateType: DateType) {
        setInfoDateType(dateType);
    }

    function closeInfo() {
        setInfoDateType(null);
    }

    // Close modal on Escape
    useEffect(() => {
        if (!infoDateType) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [infoDateType]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();

        router.get(
            DateTypeController.index().url,
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleReset() {
        setSearch('');

        router.get(
            DateTypeController.index().url,
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleDelete(dateType: DateType) {
        if (
            !confirm(
                `Are you sure you want to delete "${dateType.dateTypeName}"? This can't be undone.`
            )
        ) {
            return;
        }

        router.delete(
            DateTypeController.destroy(
                dateType.dateTypeId
            ).url
        );
    }

    function formatDate(value: string | null) {
        return value
            ? new Date(value).toLocaleString(
                'en-US',
                {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }
            )
            : '—';
    }

    return (
        <>
            <Head title="Date Types" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Date Types
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the date types used across the system.
                        </p>
                    </div>

                    <Link
                        href={
                            DateTypeController.create()
                                .url
                        }
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Date Type
                    </Link>
                </div>

                {/* Success Message */}
                {showSuccess &&
                    flash?.success && (
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
                        placeholder="Search by name..."
                        className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs"
                    />

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 cursor-pointer rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:flex-none"
                        >
                            Search
                        </button>

                        {(search ||
                            filters?.search) && (
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
                {dateTypes.data.length === 0 && (
                    <div className="rounded-sm border border-sidebar-border/70 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No date types found.
                    </div>
                )}

                {/* Mobile / Tablet */}
                {dateTypes.data.length > 0 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        {dateTypes.data.map(
                            (dateType) => (
                                <div
                                    key={
                                        dateType.dateTypeId
                                    }
                                    className="rounded-sm border border-sidebar-border/70 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                ID:{' '}
                                                {
                                                    dateType.dateTypeId
                                                }
                                            </p>

                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    dateType.dateTypeName
                                                }
                                            </p>
                                        </div>

                                        <span
                                            className={
                                                'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                (dateType.status ===
                                                    'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-300 text-gray-600')
                                            }
                                        >
                                            {
                                                dateType.status
                                            }
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-3">

                                        <button
                                            type="button"
                                            onClick={() => openInfo(dateType)}
                                            className="inline-flex items-center rounded-md bg-gray-500 px-3.5 py-1.5
                                            text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 
                                            focus:ring-gray-500 focus:ring-offset-2 cursor-pointer"
                                        >
                                            Info
                                        </button>

                                        <Link
                                            href={
                                                DateTypeController.edit(
                                                    dateType.dateTypeId
                                                ).url
                                            }
                                            className="ml-4 inline-flex items-center rounded-md bg-yellow-500 px-3.5 
                                            py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    dateType
                                                )
                                            }
                                            className="ml-4 inline-flex items-center rounded-md bg-red-500 px-3.5 py-1.5 text-sm 
                                            font-medium text-white hover:bg-red-600 cursor-pointer"
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Desktop Table */}
                {dateTypes.data.length > 0 && (
                    <div className="hidden overflow-x-auto rounded-sm border border-sidebar-border/70 bg-white shadow-sm lg:block">

                        <table className="min-w-full divide-y divide-gray-200">

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

                            <tbody className="divide-y divide-gray-200">

                                {dateTypes.data.map(
                                    (dateType) => (
                                        <tr
                                            key={
                                                dateType.dateTypeId
                                            }
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    dateType.dateTypeId
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {
                                                    dateType.dateTypeName
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={
                                                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                        (dateType.status ===
                                                            'Active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-300 text-gray-600')
                                                    }
                                                >
                                                    {
                                                        dateType.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">

                                                <button
                                                    type="button"
                                                    onClick={() => openInfo(dateType)}
                                                    className="inline-flex items-center rounded-md bg-gray-400 px-3.5 py-1.5 text-sm font-medium 
                                                    text-white hover:bg-gray-500 cursor-pointer"
                                                >
                                                    Info
                                                </button>

                                                <Link
                                                    href={
                                                        DateTypeController.edit(
                                                            dateType.dateTypeId
                                                        ).url
                                                    }
                                                    className="ml-4 inline-flex items-center rounded-md bg-yellow-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            dateType
                                                        )
                                                    }
                                                    className="ml-4 inline-flex items-center rounded-md bg-red-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        </tr>
                                    )
                                )}

                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {dateTypes.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {dateTypes.links.map(
                            (link, i) => (
                                <Link
                                    key={i}
                                    href={
                                        link.url ?? '#'
                                    }
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
                            )
                        )}
                    </div>
                )}

            </div>

            {/* Info Modal */}
            {infoDateType && (
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
                                    {infoDateType.dateTypeName}
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoDateType.created_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoDateType.created_by
                                        ? `${infoDateType.created_by.name} (ID: ${infoDateType.created_by.id})`
                                        : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoDateType.updated_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoDateType.updated_by
                                        ? `${infoDateType.updated_by.name} (ID: ${infoDateType.updated_by.id})`
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
            title: 'Date Types',
            href: DateTypeController.index().url,
        },
    ],
};