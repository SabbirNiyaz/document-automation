import { FormEvent, useEffect, useState } from 'react';
import {
    Head,
    Link,
    router,
    usePage,
} from '@inertiajs/react';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';
import {
    Info as InfoIcon,
    Pencil,
    Trash2,
    X,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface DateType {
    dateTypeId: number;
    dateTypeName: string;
}

interface Document {
    docId: number;
    title: string;
}

interface DateDetail {
    id: number;

    dateTypeId: number;

    dateType: DateType | null;

    docId: number;

    document: Document | null;

    date_value: string | null;

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

interface PaginatedDateDetails {
    data: DateDetail[];
    links: PaginationLink[];
}

interface Props {
    dateDetails: PaginatedDateDetails;

    filters: {
        search: string;
    };
}

export default function Index({
    dateDetails,
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

    const [infoDateDetail, setInfoDateDetail] =
        useState<DateDetail | null>(null);

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

    function openInfo(
        dateDetail: DateDetail
    ) {
        setInfoDateDetail(dateDetail);
    }

    function closeInfo() {
        setInfoDateDetail(null);
    }

    useEffect(() => {
        if (!infoDateDetail) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeInfo();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () =>
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
    }, [infoDateDetail]);

    function handleSearch(
        e: FormEvent
    ) {
        e.preventDefault();

        router.get(
            DateDetailController.index().url,
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
            DateDetailController.index().url,
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleDelete(
        dateDetail: DateDetail
    ) {
        const documentTitle =
            dateDetail.document?.title ??
            'Unknown';

        if (
            !confirm(
                `Are you sure you want to delete the date detail for "${documentTitle}"? This can't be undone.`
            )
        ) {
            return;
        }

        router.delete(
            DateDetailController.destroy(
                dateDetail.id
            ).url
        );
    }

    function formatDate(
        value: string | null
    ) {
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

    function formatDateValue(
        value: string | null
    ) {
        return value
            ? new Date(
                  `${value}T00:00:00`
              ).toLocaleDateString(
                  'en-US',
                  {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                  }
              )
            : '—';
    }

    return (
        <>
            <Head title="Date Details" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Date Details
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage the dates used across the system.
                        </p>
                    </div>

                    <Link
                        href={
                            DateDetailController.create()
                                .url
                        }
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Date Detail
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
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search by Date Type or Document Title..."
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
                                onClick={
                                    handleReset
                                }
                                className="flex-1 cursor-pointer rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 sm:flex-none"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Empty State */}
                {dateDetails.data.length ===
                    0 && (
                    <div className="rounded-sm border border-sidebar-border/70 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No date details found.
                    </div>
                )}

                {/* Mobile / Tablet */}
                {dateDetails.data.length >
                    0 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        {dateDetails.data.map(
                            (dateDetail) => (
                                <div
                                    key={
                                        dateDetail.id
                                    }
                                    className="rounded-sm border border-sidebar-border/70 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                ID:{' '}
                                                {
                                                    dateDetail.id
                                                }
                                            </p>

                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    dateDetail
                                                        .dateType
                                                        ?.dateTypeName ??
                                                    '—'
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {
                                                    dateDetail
                                                        .document
                                                        ?.title ??
                                                    '—'
                                                }
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {formatDateValue(
                                                    dateDetail.date_value
                                                )}
                                            </p>
                                        </div>

                                        <span
                                            className={
                                                'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                (dateDetail.status ===
                                                'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-300 text-gray-600')
                                            }
                                        >
                                            {
                                                dateDetail.status
                                            }
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openInfo(
                                                    dateDetail
                                                )
                                            }
                                            title="Info"
                                            aria-label="Info"
                                            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-500 p-2 text-white shadow-sm hover:bg-gray-600"
                                        >
                                            <InfoIcon className="h-4 w-4" />
                                        </button>

                                        <Link
                                            href={
                                                DateDetailController.edit(
                                                    dateDetail.id
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
                                                handleDelete(
                                                    dateDetail
                                                )
                                            }
                                            title="Delete"
                                            aria-label="Delete"
                                            className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Desktop Table */}
                {dateDetails.data.length >
                    0 && (
                    <div className="hidden overflow-x-auto rounded-sm border border-sidebar-border/70 bg-white shadow-sm lg:block">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Date Type
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Document Title
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Date
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

                                {dateDetails.data.map(
                                    (dateDetail) => (
                                        <tr
                                            key={
                                                dateDetail.id
                                            }
                                        >

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    dateDetail.id
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {
                                                    dateDetail
                                                        .dateType
                                                        ?.dateTypeName ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {
                                                    dateDetail
                                                        .document
                                                        ?.title ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {formatDateValue(
                                                    dateDetail.date_value
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={
                                                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                        (dateDetail.status ===
                                                        'Active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-300 text-gray-600')
                                                    }
                                                >
                                                    {
                                                        dateDetail.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openInfo(
                                                            dateDetail
                                                        )
                                                    }
                                                    title="Info"
                                                    aria-label="Info"
                                                    className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-400 p-2 text-white hover:bg-gray-500"
                                                >
                                                    <InfoIcon className="h-4 w-4" />
                                                </button>

                                                <Link
                                                    href={
                                                        DateDetailController.edit(
                                                            dateDetail.id
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
                                                        handleDelete(
                                                            dateDetail
                                                        )
                                                    }
                                                    title="Delete"
                                                    aria-label="Delete"
                                                    className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                {dateDetails.links.length >
                    3 && (
                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {dateDetails.links.map(
                            (link, i) => (
                                <Link
                                    key={i}
                                    href={
                                        link.url ??
                                        '#'
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
            {infoDateDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeInfo}
                >
                    <div
                        className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between gap-3">

                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Record Info
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    {
                                        infoDateDetail
                                            .document
                                            ?.title
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeInfo
                                }
                                className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">

                            {/* <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Date Type
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {
                                        infoDateDetail
                                            .dateType
                                            ?.dateTypeName ??
                                        '—'
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Document Title
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {
                                        infoDateDetail
                                            .document
                                            ?.title ??
                                        '—'
                                    }
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Date
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDateValue(
                                        infoDateDetail.date_value
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Status
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {
                                        infoDateDetail.status
                                    }
                                </dd>
                            </div> */}

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(
                                        infoDateDetail.created_at
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoDateDetail.created_by
                                        ? `${infoDateDetail.created_by.name} (ID: ${infoDateDetail.created_by.id})`
                                        : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(
                                        infoDateDetail.updated_at
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Updated By
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {infoDateDetail.updated_by
                                        ? `${infoDateDetail.updated_by.name} (ID: ${infoDateDetail.updated_by.id})`
                                        : '—'}
                                </dd>
                            </div>

                        </dl>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={
                                    closeInfo
                                }
                                className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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
            title: 'Date Details',
            href: DateDetailController.index()
                .url,
        },
    ],
};