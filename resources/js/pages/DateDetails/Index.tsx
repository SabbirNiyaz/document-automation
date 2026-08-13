import { FormEvent, useEffect, useState } from 'react';
import {
    Head,
    Link,
    router,
    useForm,
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

    notify_email: boolean;
    notify_sms: boolean;

    notification_before_days: number | null;
    notification_after_days: number | null;

    before_sent_at: string | null;
    after_sent_at: string | null;

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

    dateTypes: DateType[];
    documents: Document[];

    notificationDayOptions: number[];

    filters: {
        search: string;
        status: string; // '' | 'Active' | 'Inactive'
    };
}

export default function Index({
    dateDetails,
    dateTypes,
    documents,
    notificationDayOptions,
    filters,
}: Props) {
    const [search, setSearch] = useState(
        filters?.search ?? ''
    );

    const [status, setStatus] = useState(
        filters?.status || 'all'
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
    const [infoDateDetail, setInfoDateDetail] =
        useState<DateDetail | null>(null);

    function openInfo(dateDetail: DateDetail) {
        setInfoDateDetail(dateDetail);
    }

    function closeInfo() {
        setInfoDateDetail(null);
    }

    // Create modal
    const [showCreate, setShowCreate] = useState(false);

    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
        clearErrors: clearCreateErrors,
    } = useForm({
        dateTypeId: '',
        docId: '',
        date_value: '',
        notify_email: false as boolean,
        notify_sms: false as boolean,
        notification_before_days: '',
        notification_after_days: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    function openCreate() {
        resetCreate();
        clearCreateErrors();
        setShowCreate(true);
    }

    function closeCreate() {
        setShowCreate(false);
        resetCreate();
        clearCreateErrors();
    }

    function submitCreate(e: FormEvent) {
        e.preventDefault();

        postCreate(
            DateDetailController.store().url,
            {
                preserveScroll: true,
                onSuccess: () => closeCreate(),
            }
        );
    }

    // Edit modal
    const [editDateDetail, setEditDateDetail] =
        useState<DateDetail | null>(null);

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
        dateTypeId: '',
        docId: '',
        date_value: '',
        notify_email: false as boolean,
        notify_sms: false as boolean,
        notification_before_days: '',
        notification_after_days: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    function openEdit(dateDetail: DateDetail) {
        setEditDateDetail(dateDetail);

        setEditData({
            dateTypeId: String(dateDetail.dateTypeId),
            docId: String(dateDetail.docId),
            date_value: dateDetail.date_value ?? '',
            notify_email: dateDetail.notify_email,
            notify_sms: dateDetail.notify_sms,
            notification_before_days:
                dateDetail.notification_before_days !== null
                    ? String(dateDetail.notification_before_days)
                    : '',
            notification_after_days:
                dateDetail.notification_after_days !== null
                    ? String(dateDetail.notification_after_days)
                    : '',
            status: dateDetail.status,
        });

        clearEditErrors();
    }

    function closeEdit() {
        setEditDateDetail(null);
        resetEdit();
        clearEditErrors();
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editDateDetail) {
            return;
        }

        putEdit(
            DateDetailController.update(editDateDetail.id).url,
            {
                preserveScroll: true,
                onSuccess: () => closeEdit(),
            }
        );
    }

    // Delete modal
    const [deleteDateDetail, setDeleteDateDetail] =
        useState<DateDetail | null>(null);
    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

    function openDelete(dateDetail: DateDetail) {
        setDeleteDateDetail(dateDetail);
    }

    function closeDelete() {
        setDeleteDateDetail(null);
    }

    function confirmDelete() {
        if (!deleteDateDetail) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(
            DateDetailController.destroy(deleteDateDetail.id).url,
            {
                preserveScroll: true,
                onSuccess: () => closeDelete(),
                onFinish: () => setDeleteProcessing(false),
            }
        );
    }

    // Close modals on Escape
    useEffect(() => {
        if (
            !infoDateDetail &&
            !showCreate &&
            !editDateDetail &&
            !deleteDateDetail
        ) {
            return;
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
                closeCreate();
                closeEdit();
                closeDelete();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [infoDateDetail, showCreate, editDateDetail, deleteDateDetail]);

    // Search
    function handleSearch(e: FormEvent) {
        e.preventDefault();

        router.get(
            DateDetailController.index().url,
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

    function handleResetSearch() {
        setSearch('');

        router.get(
            DateDetailController.index().url,
            {
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    // Status filter
    function handleStatusChange(value: string) {
        setStatus(value);

        router.get(
            DateDetailController.index().url,
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

    function handleResetStatus() {
        setStatus('all');

        router.get(
            DateDetailController.index().url,
            {
                search,
            },
            {
                preserveState: true,
                replace: true,
            }
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

    function formatDateValue(value: string | null) {
        return value
            ? new Date(`${value}T00:00:00`).toLocaleDateString(
                  'en-US',
                  {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                  }
              )
            : '—';
    }

    function notificationTypeLabel(dateDetail: DateDetail) {
        if (dateDetail.notify_email && dateDetail.notify_sms) {
            return 'SMS & Email';
        }

        if (dateDetail.notify_email) {
            return 'Email';
        }

        if (dateDetail.notify_sms) {
            return 'SMS';
        }

        return 'None';
    }

    function notificationTypeBadgeClass(dateDetail: DateDetail) {
        if (dateDetail.notify_email && dateDetail.notify_sms) {
            return 'bg-indigo-100 text-indigo-800';
        }

        if (dateDetail.notify_email || dateDetail.notify_sms) {
            return 'bg-blue-100 text-blue-800';
        }

        return 'bg-gray-200 text-gray-600';
    }

    function formatDays(value: number | null) {
        if (value === null || value === undefined) {
            return '—';
        }

        return `${value} ${value === 1 ? 'day' : 'days'}`;
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

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto cursor-pointer"
                    >
                        Add Date Detail
                    </button>
                </div>

                {/* Success Message */}
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
                            placeholder="Search by Date Type or Document Title..."
                            className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm 
                            shadow-sm focus:border-indigo-500 focus:ring-indigo-500 
                            sm:w-[400px]"
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

                {/* Empty State */}
                {dateDetails.data.length === 0 && (
                    <div className="rounded-sm border border-sidebar-border/70 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No date details found.
                    </div>
                )}

                {/* Mobile / Tablet */}
                {dateDetails.data.length > 0 && (
                    <div className="flex flex-col gap-3 lg:hidden">
                        {dateDetails.data.map((dateDetail) => (
                            <div
                                key={dateDetail.id}
                                className="rounded-sm border border-sidebar-border/70 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            ID: {dateDetail.id}
                                        </p>

                                        <p className="text-sm font-medium text-gray-900">
                                            {dateDetail.dateType?.dateTypeName ?? '—'}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {dateDetail.document?.title ?? '—'}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {formatDateValue(dateDetail.date_value)}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            (dateDetail.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-300 text-gray-600')
                                        }
                                    >
                                        {dateDetail.status}
                                    </span>
                                </div>

                                {/* Notification info */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span
                                        className={
                                            'inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ' +
                                            notificationTypeBadgeClass(dateDetail)
                                        }
                                    >
                                        {notificationTypeLabel(dateDetail)}
                                    </span>

                                    <span className="text-xs text-gray-500">
                                        Before: {formatDays(dateDetail.notification_before_days)}
                                    </span>

                                    <span className="text-xs text-gray-500">
                                        After: {formatDays(dateDetail.notification_after_days)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-3">

                                    <button
                                        type="button"
                                        onClick={() => openInfo(dateDetail)}
                                        title="Info"
                                        aria-label="Info"
                                        className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-500 p-2 text-white shadow-sm hover:bg-gray-600"
                                    >
                                        <InfoIcon className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openEdit(dateDetail)}
                                        title="Edit"
                                        aria-label="Edit"
                                        className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openDelete(dateDetail)}
                                        title="Delete"
                                        aria-label="Delete"
                                        className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop Table */}
                {dateDetails.data.length > 0 && (
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
                                        Notification
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Before
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        After
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

                                {dateDetails.data.map((dateDetail) => (
                                    <tr key={dateDetail.id}>

                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {dateDetail.id}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {dateDetail.dateType?.dateTypeName ?? '—'}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {dateDetail.document?.title ?? '—'}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDateValue(dateDetail.date_value)}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={
                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                    notificationTypeBadgeClass(dateDetail)
                                                }
                                            >
                                                {notificationTypeLabel(dateDetail)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDays(dateDetail.notification_before_days)}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDays(dateDetail.notification_after_days)}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={
                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                    (dateDetail.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-300 text-gray-600')
                                                }
                                            >
                                                {dateDetail.status}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">

                                            <button
                                                type="button"
                                                onClick={() => openInfo(dateDetail)}
                                                title="Info"
                                                aria-label="Info"
                                                className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-400 p-2 text-white hover:bg-gray-500"
                                            >
                                                <InfoIcon className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEdit(dateDetail)}
                                                title="Edit"
                                                aria-label="Edit"
                                                className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDelete(dateDetail)}
                                                title="Delete"
                                                aria-label="Delete"
                                                className="ml-4 inline-flex cursor-pointer items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
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
                {dateDetails.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                        {dateDetails.links.map((link, i) => (
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
            {infoDateDetail && (
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
                                    {infoDateDetail.document?.title}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeInfo}
                                className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Notification
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {notificationTypeLabel(infoDateDetail)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Before / After
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDays(infoDateDetail.notification_before_days)}
                                    {' / '}
                                    {formatDays(infoDateDetail.notification_after_days)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Before Sent At
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoDateDetail.before_sent_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    After Sent At
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoDateDetail.after_sent_at)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-400">
                                    Created
                                </dt>

                                <dd className="mt-0.5 text-gray-700">
                                    {formatDate(infoDateDetail.created_at)}
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
                                    {formatDate(infoDateDetail.updated_at)}
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
                                onClick={closeInfo}
                                className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeCreate}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    New Date Detail
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Create a new date detail.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 
                                hover:text-gray-600 focus:outline-none focus:ring-2 
                                focus:ring-indigo-500 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitCreate}
                            className="mt-4 space-y-4"
                        >
                            {/* Date Type */}
                            <div>
                                <label
                                    htmlFor="create-dateTypeId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Date Type
                                </label>

                                <select
                                    id="create-dateTypeId"
                                    value={createData.dateTypeId}
                                    onChange={(e) =>
                                        setCreateData('dateTypeId', e.target.value)
                                    }
                                    className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Date Type</option>

                                    {dateTypes.map((dateType) => (
                                        <option
                                            key={dateType.dateTypeId}
                                            value={dateType.dateTypeId}
                                        >
                                            {dateType.dateTypeName}
                                        </option>
                                    ))}
                                </select>

                                {createErrors.dateTypeId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.dateTypeId}
                                    </p>
                                )}
                            </div>

                            {/* Document Title */}
                            <div>
                                <label
                                    htmlFor="create-docId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Document Title
                                </label>

                                <select
                                    id="create-docId"
                                    value={createData.docId}
                                    onChange={(e) =>
                                        setCreateData('docId', e.target.value)
                                    }
                                    className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Document</option>

                                    {documents.map((document) => (
                                        <option
                                            key={document.docId}
                                            value={document.docId}
                                        >
                                            {document.title}
                                        </option>
                                    ))}
                                </select>

                                {createErrors.docId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.docId}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="create-date_value"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Date
                                </label>

                                <input
                                    id="create-date_value"
                                    type="date"
                                    value={createData.date_value}
                                    onChange={(e) =>
                                        setCreateData('date_value', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {createErrors.date_value && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.date_value}
                                    </p>
                                )}
                            </div>

                            {/* Notification Channels */}
                            <div>
                                <span className="block text-sm font-medium text-gray-700">
                                    Notify Via
                                </span>

                                <div className="mt-2 flex items-center gap-6">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={createData.notify_email}
                                            onChange={(e) =>
                                                setCreateData(
                                                    'notify_email',
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded-sm border-gray-300 text-indigo-600 
                                            focus:ring-indigo-500 cursor-pointer"
                                        />
                                        Email
                                    </label>

                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={createData.notify_sms}
                                            onChange={(e) =>
                                                setCreateData(
                                                    'notify_sms',
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded-sm border-gray-300 text-indigo-600 
                                            focus:ring-indigo-500 cursor-pointer"
                                        />
                                        SMS
                                    </label>
                                </div>

                                {createErrors.notify_email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.notify_email}
                                    </p>
                                )}

                                {createErrors.notify_sms && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.notify_sms}
                                    </p>
                                )}
                            </div>

                            {/* Notify Before / After */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="create-notification_before_days"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Notify Before
                                    </label>

                                    <select
                                        id="create-notification_before_days"
                                        value={createData.notification_before_days}
                                        onChange={(e) =>
                                            setCreateData(
                                                'notification_before_days',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                        px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">None</option>

                                        {notificationDayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days} {days === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </select>

                                    {createErrors.notification_before_days && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.notification_before_days}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="create-notification_after_days"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Notify After
                                    </label>

                                    <select
                                        id="create-notification_after_days"
                                        value={createData.notification_after_days}
                                        onChange={(e) =>
                                            setCreateData(
                                                'notification_after_days',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                        px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">None</option>

                                        {notificationDayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days} {days === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </select>

                                    {createErrors.notification_after_days && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.notification_after_days}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="create-status"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="create-status"
                                    value={createData.status}
                                    onChange={(e) =>
                                        setCreateData(
                                            'status',
                                            e.target.value as 'Active' | 'Inactive'
                                        )
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>

                                {createErrors.status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.status}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeCreate}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white 
                                    shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                    focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {createProcessing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editDateDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeEdit}
                >
                    <div
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Edit Date Detail
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Update the date detail.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEdit}
                                className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 
                                hover:text-gray-600 focus:outline-none focus:ring-2 
                                focus:ring-indigo-500 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitEdit}
                            className="mt-4 space-y-4"
                        >
                            {/* Date Type */}
                            <div>
                                <label
                                    htmlFor="edit-dateTypeId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Date Type
                                </label>

                                <select
                                    id="edit-dateTypeId"
                                    value={editData.dateTypeId}
                                    onChange={(e) =>
                                        setEditData('dateTypeId', e.target.value)
                                    }
                                    className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Date Type</option>

                                    {dateTypes.map((dateType) => (
                                        <option
                                            key={dateType.dateTypeId}
                                            value={dateType.dateTypeId}
                                        >
                                            {dateType.dateTypeName}
                                        </option>
                                    ))}
                                </select>

                                {editErrors.dateTypeId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.dateTypeId}
                                    </p>
                                )}
                            </div>

                            {/* Document Title */}
                            <div>
                                <label
                                    htmlFor="edit-docId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Document Title
                                </label>

                                <select
                                    id="edit-docId"
                                    value={editData.docId}
                                    onChange={(e) =>
                                        setEditData('docId', e.target.value)
                                    }
                                    className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Select Document</option>

                                    {documents.map((document) => (
                                        <option
                                            key={document.docId}
                                            value={document.docId}
                                        >
                                            {document.title}
                                        </option>
                                    ))}
                                </select>

                                {editErrors.docId && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.docId}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="edit-date_value"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Date
                                </label>

                                <input
                                    id="edit-date_value"
                                    type="date"
                                    value={editData.date_value}
                                    onChange={(e) =>
                                        setEditData('date_value', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {editErrors.date_value && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.date_value}
                                    </p>
                                )}
                            </div>

                            {/* Notification Channels */}
                            <div>
                                <span className="block text-sm font-medium text-gray-700">
                                    Notify Via
                                </span>

                                <div className="mt-2 flex items-center gap-6">
                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={editData.notify_email}
                                            onChange={(e) =>
                                                setEditData(
                                                    'notify_email',
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded-sm border-gray-300 text-indigo-600 
                                            focus:ring-indigo-500 cursor-pointer"
                                        />
                                        Email
                                    </label>

                                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={editData.notify_sms}
                                            onChange={(e) =>
                                                setEditData(
                                                    'notify_sms',
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded-sm border-gray-300 text-indigo-600 
                                            focus:ring-indigo-500 cursor-pointer"
                                        />
                                        SMS
                                    </label>
                                </div>

                                {editErrors.notify_email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.notify_email}
                                    </p>
                                )}

                                {editErrors.notify_sms && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.notify_sms}
                                    </p>
                                )}
                            </div>

                            {/* Notify Before / After */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="edit-notification_before_days"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Notify Before
                                    </label>

                                    <select
                                        id="edit-notification_before_days"
                                        value={editData.notification_before_days}
                                        onChange={(e) =>
                                            setEditData(
                                                'notification_before_days',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                        px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">None</option>

                                        {notificationDayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days} {days === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </select>

                                    {editErrors.notification_before_days && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.notification_before_days}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="edit-notification_after_days"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Notify After
                                    </label>

                                    <select
                                        id="edit-notification_after_days"
                                        value={editData.notification_after_days}
                                        onChange={(e) =>
                                            setEditData(
                                                'notification_after_days',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm 
                                        px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">None</option>

                                        {notificationDayOptions.map((days) => (
                                            <option key={days} value={days}>
                                                {days} {days === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </select>

                                    {editErrors.notification_after_days && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.notification_after_days}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="edit-status"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="edit-status"
                                    value={editData.status}
                                    onChange={(e) =>
                                        setEditData(
                                            'status',
                                            e.target.value as 'Active' | 'Inactive'
                                        )
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>

                                {editErrors.status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.status}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white 
                                    shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                    focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {editProcessing ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteDateDetail && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={closeDelete}
                >
                    <div
                        className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Delete Date Detail
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    This action cannot be undone.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDelete}
                                className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 
                                hover:text-gray-600 focus:outline-none focus:ring-2 
                                focus:ring-indigo-500 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-gray-700">
                            Are you sure you want to delete the date detail for{' '}
                            <span className="font-medium text-gray-900">
                                "{deleteDateDetail.document?.title ?? 'Unknown'}"
                            </span>
                            ?
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDelete}
                                disabled={deleteProcessing}
                                className="text-sm font-medium text-gray-600 hover:text-gray-800 
                                disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteProcessing}
                                className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white 
                                shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500
                                focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                {deleteProcessing ? 'Deleting...' : 'Delete'}
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
            href: DateDetailController.index().url,
        },
    ],
};