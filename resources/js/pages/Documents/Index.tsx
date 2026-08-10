import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';
import { Info as InfoIcon, Pencil, Trash2, FileText, Calendar, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface Party {
    partyId: number;
    partyName: string;
}

interface DocumentType {
    document_id: number;
    document_name: string;
}

interface DateDetailItem {
    id: number;
    dateTypeName: string | null;
    date_value: string | null;
    status: 'Active' | 'Inactive';
}

interface DocumentItem {
    docId: number;
    title: string;
    description: string | null;
    partyName: Party | null;
    docType: DocumentType | null;
    date: string;
    soft_copy: string | null;
    status: 'Active' | 'Inactive';
    attachment: string | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: User | null;
    updated_by: User | null;
    dateDetails: DateDetailItem[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDocuments {
    data: DocumentItem[];
    links: PaginationLink[];
}

interface Props {
    documents: PaginatedDocuments;

    filters: {
        search: string;
    };
}

export default function Index({
    documents,
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

    // PDF modal state
    const [pdfModal, setPdfModal] = useState<{
        open: boolean;
        docId: number | null;
        title: string;
    }>({
        open: false,
        docId: null,
        title: '',
    });

    function openPdfModal(document: DocumentItem) {
        setPdfModal({
            open: true,
            docId: document.docId,
            title: document.title,
        });
    }

    function closePdfModal() {
        setPdfModal({
            open: false,
            docId: null,
            title: '',
        });
    }

    // Info modal state
    const [infoDocument, setInfoDocument] = useState<DocumentItem | null>(null);

    function openInfo(document: DocumentItem) {
        setInfoDocument(document);
    }

    function closeInfo() {
        setInfoDocument(null);
    }

    // Date modal state
    const [dateModal, setDateModal] = useState<{
        open: boolean;
        title: string;
        dateDetails: DateDetailItem[];
    }>({
        open: false,
        title: '',
        dateDetails: [],
    });

    function openDateModal(document: DocumentItem) {
        setDateModal({
            open: true,
            title: document.title,
            dateDetails: document.dateDetails ?? [],
        });
    }

    function closeDateModal() {
        setDateModal({
            open: false,
            title: '',
            dateDetails: [],
        });
    }

    // Close PDF modal on Escape key
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closePdfModal();
            }
        }

        if (pdfModal.open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [pdfModal.open]);

    // Close info modal on Escape key
    useEffect(() => {
        if (!infoDocument) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [infoDocument]);

    // Close date modal on Escape key
    useEffect(() => {
        if (!dateModal.open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeDateModal();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [dateModal.open]);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);

            const timer = setTimeout(
                () => setShowSuccess(false),
                3000
            );

            return () =>
                clearTimeout(timer);
        }
    }, [flash?.success]);

    function handleSearch(
        e: FormEvent
    ) {
        e.preventDefault();

        router.get(
            DocumentController.index().url,
            {
                search,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleReset() {
        setSearch('');

        router.get(
            DocumentController.index().url,
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleDelete(
        document: DocumentItem
    ) {
        if (
            !confirm(
                `Are you sure you want to delete "${document.title}"?`
            )
        ) {
            return;
        }

        router.delete(
            DocumentController.destroy(
                document.docId
            ).url
        );
    }

    function formatDate(
        value: string | null
    ) {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleString(
            'en-US',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    }

    function formatDocumentDate(
        value: string
    ) {
        if (!value) {
            return '—';
        }

        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }
        );
    }

    return (
        <>
            <Head title="Documents" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Documents
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage documents and attachments.
                        </p>

                    </div>

                    <Link
                        href={
                            DocumentController.create().url
                        }
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
                    >
                        Add Document
                    </Link>

                </div>

                {/* Success */}

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
                        placeholder="Search documents..."
                        className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs"
                    />

                    <div className="flex gap-2">

                        <button
                            type="submit"
                            className="flex-1 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:flex-none"
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
                                    className="flex-1 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50 sm:flex-none"
                                >
                                    Reset
                                </button>

                            )}

                    </div>

                </form>

                {/* Empty */}

                {documents.data.length === 0 && (

                    <div className="rounded-sm border bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No documents found.
                    </div>

                )}

                {/* Mobile */}

                {documents.data.length > 0 && (

                    <div className="flex flex-col gap-3 lg:hidden">

                        {documents.data.map(
                            (document) => (

                                <div
                                    key={
                                        document.docId
                                    }
                                    className="rounded-sm border bg-white p-4 shadow-sm"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div>

                                            <p className="text-xs text-gray-400">
                                                ID: {
                                                    document.docId
                                                }
                                            </p>

                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    document.title
                                                }
                                            </p>

                                        </div>

                                        <span
                                            className={
                                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                (
                                                    document.status ===
                                                        'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-300 text-gray-600'
                                                )
                                            }
                                        >
                                            {
                                                document.status
                                            }
                                        </span>

                                    </div>

                                    <dl className="mt-3 grid grid-cols-1 gap-3 text-sm">

                                        <div>

                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Description
                                            </dt>

                                            <dd className="text-gray-600">
                                                {
                                                    document.description ??
                                                    '—'
                                                }
                                            </dd>

                                        </div>

                                        <div>

                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Party
                                            </dt>

                                            <dd className="text-gray-600">
                                                {
                                                    document.partyName
                                                        ?.partyName ??
                                                    '—'
                                                }
                                            </dd>

                                        </div>

                                        <div>

                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Document Type
                                            </dt>

                                            <dd className="text-gray-600">
                                                {
                                                    document.docType
                                                        ?.document_name ??
                                                    '—'
                                                }
                                            </dd>

                                        </div>

                                        <div>

                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Soft Copy
                                            </dt>

                                            <dd className="text-gray-600">
                                                {
                                                    document.soft_copy ??
                                                    '—'
                                                }
                                            </dd>

                                        </div>

                                        <div>

                                            <dt className="text-xs uppercase tracking-wide text-gray-400">
                                                Date
                                            </dt>

                                            <dd className="text-gray-600">
                                                {formatDocumentDate(
                                                    document.date
                                                )}
                                            </dd>

                                        </div>

                                    </dl>

                                    <div className="mt-4 flex flex-wrap gap-2">

                                        <button
                                            type="button"
                                            onClick={() => openInfo(document)}
                                            title="Info"
                                            aria-label="Info"
                                            className="inline-flex items-center justify-center rounded-md bg-gray-500 p-2 text-white hover:bg-gray-600 cursor-pointer"
                                        >
                                            <InfoIcon className="h-4 w-4" />
                                        </button>

                                        {document.attachment ? (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openPdfModal(document)
                                                }
                                                title="View PDF"
                                                aria-label="View PDF"
                                                className="inline-flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 cursor-pointer"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>

                                        ) : (

                                            <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-400">
                                                No PDF
                                            </span>

                                        )}

                                        <button
                                            type="button"
                                            onClick={() => openDateModal(document)}
                                            title="View Dates"
                                            aria-label="View Dates"
                                            className="inline-flex items-center justify-center rounded-md bg-purple-500 p-2 text-white hover:bg-purple-600 cursor-pointer"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </button>

                                        <Link
                                            href={
                                                DocumentController.edit(
                                                    document.docId
                                                ).url
                                            }
                                            title="Edit"
                                            aria-label="Edit"
                                            className="inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    document
                                                )
                                            }
                                            title="Delete"
                                            aria-label="Delete"
                                            className="inline-flex items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600 cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

                {/* Desktop */}

                {documents.data.length > 0 && (

                    <div className="hidden overflow-x-auto rounded-sm border bg-white shadow-sm lg:block">

                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        ID
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Title
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Description
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Party
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Document Type
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Soft Copy
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Attachment
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Date Details
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {documents.data.map(
                                    (document) => (

                                        <tr
                                            key={
                                                document.docId
                                            }
                                        >

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.docId
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {
                                                    document.title
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {
                                                    document.description ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.partyName
                                                        ?.partyName ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.docType
                                                        ?.document_name ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.soft_copy
                                                        ? document.soft_copy
                                                        : '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {formatDocumentDate(
                                                    document.date
                                                )}
                                            </td>

                                            <td className="px-4 py-3">

                                                <span
                                                    className={
                                                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                        (
                                                            document.status ===
                                                                'Active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-300 text-gray-600'
                                                        )
                                                    }
                                                >
                                                    {
                                                        document.status
                                                    }
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">

                                                {document.attachment ? (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openPdfModal(document)
                                                        }
                                                        title="View PDF"
                                                        aria-label="View PDF"
                                                        className="inline-flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 cursor-pointer"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>

                                                ) : (

                                                    <span className="text-sm text-gray-400">
                                                        No PDF
                                                    </span>

                                                )}

                                            </td>

                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openDateModal(document)}
                                                    title="View Dates"
                                                    aria-label="View Dates"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-purple-500 p-2 text-white hover:bg-purple-600 cursor-pointer"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                            </td>

                                            <td className="px-4 py-3 text-right whitespace-nowrap">

                                                <button
                                                    type="button"
                                                    onClick={() => openInfo(document)}
                                                    title="Info"
                                                    aria-label="Info"
                                                    className="inline-flex items-center justify-center rounded-md bg-gray-400 p-2 text-white hover:bg-gray-500 cursor-pointer"
                                                >
                                                    <InfoIcon className="h-4 w-4" />
                                                </button>

                                                <Link
                                                    href={
                                                        DocumentController.edit(
                                                            document.docId
                                                        ).url
                                                    }
                                                    title="Edit"
                                                    aria-label="Edit"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            document
                                                        )
                                                    }
                                                    title="Delete"
                                                    aria-label="Delete"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-red-500 p-2 text-white hover:bg-red-600 cursor-pointer"
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

                {documents.links.length > 3 && (

                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">

                        {documents.links.map(
                            (link, i) => (

                                <Link
                                    key={i}
                                    href={
                                        link.url ??
                                        '#'
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            link.label,
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

                            )
                        )}

                    </div>

                )}

                {/* PDF Modal */}

                {pdfModal.open && pdfModal.docId && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={closePdfModal}
                    >

                        <div
                            className="flex h-[90vh] w-full max-w-4xl flex-col rounded-sm bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="flex items-center justify-between border-b px-4 py-3">

                                <h2 className="truncate pr-4 text-sm font-medium text-gray-900">
                                    {pdfModal.title}
                                </h2>

                                <button
                                    type="button"
                                    onClick={closePdfModal}
                                    className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                            </div>

                            <div className="flex-1 overflow-hidden bg-gray-100">

                                <iframe
                                    src={
                                        DocumentController
                                            .viewAttachment(
                                                pdfModal.docId
                                            ).url
                                    }
                                    className="h-full w-full"
                                    title={pdfModal.title}
                                />

                            </div>

                        </div>

                    </div>

                )}

                {/* Date Details Modal */}

                {dateModal.open && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeDateModal}
                    >
                        <div
                            className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Date Details
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {dateModal.title}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeDateModal}
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 border-t border-gray-100 pt-4">
                                {dateModal.dateDetails.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No date details for this document.
                                    </p>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead>
                                            <tr>
                                                <th className="py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Date Type
                                                </th>

                                                <th className="py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Date
                                                </th>

                                                <th className="py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {dateModal.dateDetails.map((detail) => (
                                                <tr key={detail.id}>
                                                    <td className="py-2 pr-2 text-gray-700">
                                                        {detail.dateTypeName ?? '—'}
                                                    </td>

                                                    <td className="py-2 pr-2 text-gray-700">
                                                        {detail.date_value
                                                            ? new Date(
                                                                `${detail.date_value}T00:00:00`
                                                            ).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })
                                                            : '—'}
                                                    </td>

                                                    <td className="py-2">
                                                        <span
                                                            className={
                                                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                                (detail.status === 'Active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-300 text-gray-600')
                                                            }
                                                        >
                                                            {detail.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeDateModal}
                                    className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Modal */}

                {infoDocument && (

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
                                        {infoDocument.title}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeInfo}
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                                        {formatDate(infoDocument.created_at)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Created By
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {infoDocument.created_by
                                            ? `${infoDocument.created_by.name} (ID: ${infoDocument.created_by.id})`
                                            : '—'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Updated
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {formatDate(infoDocument.updated_at)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Updated By
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {infoDocument.updated_by
                                            ? `${infoDocument.updated_by.name} (ID: ${infoDocument.updated_by.id})`
                                            : '—'}
                                    </dd>
                                </div>

                            </dl>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeInfo}
                                    className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                        </div>

                    </div>

                )}

            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href:
                DocumentController.index().url,
        },
    ],
};