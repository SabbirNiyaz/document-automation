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

                                    <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm xs:grid-cols-2">

                                        {/* Created */}
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Created
                                            </dt>

                                            <dd className="break-words text-gray-600">
                                                {formatDate(
                                                    dateType.created_at
                                                )}
                                            </dd>
                                        </div>

                                        {/* Created By */}
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Created By
                                            </dt>

                                            <dd className="break-words text-gray-600">
                                                {dateType.created_by
                                                    ? `${dateType.created_by.name} (ID: ${dateType.created_by.id})`
                                                    : '—'}
                                            </dd>
                                        </div>

                                        {/* Updated */}
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Updated
                                            </dt>

                                            <dd className="break-words text-gray-600">
                                                {formatDate(
                                                    dateType.updated_at
                                                )}
                                            </dd>
                                        </div>

                                        {/* Updated By */}
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Updated By
                                            </dt>

                                            <dd className="break-words text-gray-600">
                                                {dateType.updated_by
                                                    ? `${dateType.updated_by.name} (ID: ${dateType.updated_by.id})`
                                                    : '—'}
                                            </dd>
                                        </div>
                                    </dl>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-3">

                                        <Link
                                            href={
                                                DateTypeController.edit(
                                                    dateType.dateTypeId
                                                ).url
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-yellow-500 px-3.5 py-1.5 
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
                                                handleDelete(
                                                    dateType
                                                )
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-red-500 px-3.5 py-1.5 
                                            text-sm font-medium text-white shadow-sm transition-colors duration-150 
                                            hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 
                                            focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                            disabled:opacity-50 cursor-pointer"
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

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Created
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Created By
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Updated
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Updated By
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

                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                {formatDate(
                                                    dateType.created_at
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {dateType.created_by
                                                    ? `${dateType.created_by.name} (ID: ${dateType.created_by.id})`
                                                    : '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                {formatDate(
                                                    dateType.updated_at
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {dateType.updated_by
                                                    ? `${dateType.updated_by.name} (ID: ${dateType.updated_by.id})`
                                                    : '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">

                                                <Link
                                                    href={
                                                        DateTypeController.edit(
                                                            dateType.dateTypeId
                                                        ).url
                                                    }
                                                    className="inline-flex items-center rounded-md bg-yellow-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
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