import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';
import { Info as InfoIcon, Pencil, Trash2, FileText, Calendar, X, Plus } from 'lucide-react';

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
    dateTypeId: number;
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

interface DateTypeOption {
    dateTypeId: number;
    dateTypeName: string;
}

interface Props {
    documents: PaginatedDocuments;

    filters: {
        search: string;
        status: string; // '' | 'Active' | 'Inactive'
    };

    dateTypes: DateTypeOption[];
    parties: Party[];
    documentTypes: DocumentType[];
}

export default function Index({
    documents,
    filters,
    dateTypes,
    parties,
    documentTypes,
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

    // PDF modal state (used for row "View PDF" AND Edit modal's "View Current PDF")
    const [pdfModal, setPdfModal] = useState<{
        open: boolean;
        docId: number | null;
        title: string;
    }>({
        open: false,
        docId: null,
        title: '',
    });

    function openPdfModal(docId: number, title: string) {
        setPdfModal({
            open: true,
            docId,
            title,
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

    // Create modal state
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
        title: '',
        description: '',
        partyName: '',
        docType: '',
        date: '',
        soft_copy: '',
        status: 'Active' as 'Active' | 'Inactive',
        attachment: null as File | null,
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

        postCreate(DocumentController.store().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeCreate(),
        });
    }

    // Edit modal state
    const [editDocument, setEditDocument] = useState<DocumentItem | null>(null);

    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
        transform: transformEdit,
    } = useForm({
        title: '',
        description: '',
        partyName: '',
        docType: '',
        date: '',
        soft_copy: '',
        status: 'Active' as 'Active' | 'Inactive',
        attachment: null as File | null,
        _method: 'PUT',
    });

    function openEdit(document: DocumentItem) {
        setEditDocument(document);

        setEditData({
            title: document.title,
            description: document.description ?? '',
            partyName: document.partyName ? String(document.partyName.partyId) : '',
            docType: document.docType ? String(document.docType.document_id) : '',
            date: document.date,
            soft_copy: document.soft_copy ?? '',
            status: document.status,
            attachment: null,
            _method: 'PUT',
        });

        clearEditErrors();
    }

    function closeEdit() {
        setEditDocument(null);
        resetEdit();
        clearEditErrors();
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editDocument) {
            return;
        }

        // Strip attachment key entirely when no new file was chosen,
        // so the backend never receives a null/empty value that could
        // overwrite the existing PDF path.
        transformEdit((formData) => {
            if (!formData.attachment) {
                const { attachment, ...rest } = formData;
                return rest;
            }
            return formData;
        });

        postEdit(DocumentController.update(editDocument.docId).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeEdit(),
        });
    }

    // Delete modal state
    const [deleteDocument, setDeleteDocument] = useState<DocumentItem | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    function openDelete(document: DocumentItem) {
        setDeleteDocument(document);
    }

    function closeDelete() {
        setDeleteDocument(null);
    }

    function confirmDelete() {
        if (!deleteDocument) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(DocumentController.destroy(deleteDocument.docId).url, {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setDeleteProcessing(false),
        });
    }

    // Date modal state
    const [dateModal, setDateModal] = useState<{
        open: boolean;
        docId: number | null;
        title: string;
        dateDetails: DateDetailItem[];
    }>({
        open: false,
        docId: null,
        title: '',
        dateDetails: [],
    });

    function openDateModal(document: DocumentItem) {
        setDateModal({
            open: true,
            docId: document.docId,
            title: document.title,
            dateDetails: document.dateDetails ?? [],
        });
    }

    function closeDateModal() {
        setDateModal({
            open: false,
            docId: null,
            title: '',
            dateDetails: [],
        });
    }

    // Add Date modal state
    const [addDateModal, setAddDateModal] = useState<{
        open: boolean;
        docId: number | null;
    }>({
        open: false,
        docId: null,
    });

    const {
        data: addDateData,
        setData: setAddDateData,
        post: postAddDate,
        processing: addDateProcessing,
        errors: addDateErrors,
        reset: resetAddDate,
        clearErrors: clearAddDateErrors,
    } = useForm({
        dateTypeId: '',
        docId: '' as number | string,
        date_value: '',
        status: 'Active',
        stay: true,
    });

    function openAddDateModal(docId: number) {
        resetAddDate();
        clearAddDateErrors();
        setAddDateData({
            dateTypeId: '',
            docId,
            date_value: '',
            status: 'Active',
            stay: true,
        });
        setAddDateModal({ open: true, docId });
    }

    function closeAddDateModal() {
        setAddDateModal({ open: false, docId: null });
        resetAddDate();
        clearAddDateErrors();
    }

    // Edit Date modal state
    const [editDateModal, setEditDateModal] = useState<{
        open: boolean;
        id: number | null;
        dateTypeName: string | null;
    }>({
        open: false,
        id: null,
        dateTypeName: null,
    });

    const {
        data: editDateData,
        setData: setEditDateData,
        put: putEditDate,
        processing: editDateProcessing,
        errors: editDateErrors,
        reset: resetEditDate,
        clearErrors: clearEditDateErrors,
    } = useForm({
        dateTypeId: '' as number | string,
        docId: '' as number | string,
        date_value: '',
        status: 'Active' as 'Active' | 'Inactive',
        stay: true,
    });

    function openEditDateModal(detail: DateDetailItem) {
        resetEditDate();
        clearEditDateErrors();
        setEditDateData({
            dateTypeId: detail.dateTypeId,
            docId: dateModal.docId ?? '',
            date_value: detail.date_value ?? '',
            status: detail.status,
            stay: true,
        });
        setEditDateModal({
            open: true,
            id: detail.id,
            dateTypeName: detail.dateTypeName,
        });
    }

    function closeEditDateModal() {
        setEditDateModal({ open: false, id: null, dateTypeName: null });
        resetEditDate();
        clearEditDateErrors();
    }

    function submitEditDate(e: FormEvent) {
        e.preventDefault();

        if (!editDateModal.id) return;

        putEditDate(DateDetailController.update(editDateModal.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                closeEditDateModal();
                closeDateModal();
            },
        });
    }

    function submitAddDate(e: FormEvent) {
        e.preventDefault();

        postAddDate(DateDetailController.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                closeAddDateModal();
                closeDateModal();
            },
        });
    }

    // Delete Date Detail modal state
    const [deleteDateDetail, setDeleteDateDetail] = useState<DateDetailItem | null>(null);
    const [deleteDateProcessing, setDeleteDateProcessing] = useState(false);

    function openDeleteDate(detail: DateDetailItem) {
        setDeleteDateDetail(detail);
    }

    function closeDeleteDate() {
        setDeleteDateDetail(null);
    }

    function confirmDeleteDate() {
        if (!deleteDateDetail) {
            return;
        }

        setDeleteDateProcessing(true);

        router.delete(DateDetailController.destroy(deleteDateDetail.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteDate();
                closeDateModal();
            },
            onFinish: () => setDeleteDateProcessing(false),
        });
    }

    // Close PDF modal on Escape key
    useEffect(() => {
        if (!pdfModal.open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closePdfModal();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

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

    // Close create/edit/delete modals on Escape key
    useEffect(() => {
        if (!showCreate && !editDocument && !deleteDocument) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeCreate();
                closeEdit();
                closeDelete();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [showCreate, editDocument, deleteDocument]);

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

    // Close add date modal on Escape key
    useEffect(() => {
        if (!addDateModal.open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeAddDateModal();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [addDateModal.open]);

    // Close edit date modal on Escape key
    useEffect(() => {
        if (!editDateModal.open) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeEditDateModal();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [editDateModal.open]);

    // Close delete date modal on Escape key
    useEffect(() => {
        if (!deleteDateDetail) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeDeleteDate();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () =>
            document.removeEventListener('keydown', handleKeyDown);
    }, [deleteDateDetail]);

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
            DocumentController.index().url,
            {
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleStatusChange(value: string) {
        setStatus(value);

        router.get(
            DocumentController.index().url,
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

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 sm:w-auto cursor-pointer"
                    >
                        Add Document
                    </button>

                </div>

                {/* Success */}

                {showSuccess &&
                    flash?.success && (

                        <div className="rounded-sm bg-green-50 px-4 py-3 text-center text-sm text-green-700 shadow-sm">
                            {flash.success}
                        </div>

                    )}

                {/* Search + Status filters */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Title, Description or Document Type..."
                            className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:w-[420px]"
                        />

                        <button
                            type="submit"
                            className="shrink-0 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
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
                                                    openPdfModal(document.docId, document.title)
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

                                        <button
                                            type="button"
                                            onClick={() => openEdit(document)}
                                            title="Edit"
                                            aria-label="Edit"
                                            className="inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600 cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openDelete(document)
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
                                                            openPdfModal(document.docId, document.title)
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

                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(document)}
                                                    title="Edit"
                                                    aria-label="Edit"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600 cursor-pointer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDelete(document)
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

                {/* PDF Modal (shared by row action + Edit modal's "View Current PDF") */}

                {pdfModal.open && pdfModal.docId && (

                    <div
                        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
                        onClick={closePdfModal}
                    >

                        <div
                            className="flex h-[95vh] w-full max-w-6xl flex-col rounded-sm bg-white shadow-xl"
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

                                                <th className="py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    {/* actions */}
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

                                                    <td className="py-2 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditDateModal(detail)}
                                                            title="Edit Date"
                                                            aria-label="Edit Date"
                                                            className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteDate(detail)}
                                                            title="Delete Date"
                                                            aria-label="Delete Date"
                                                            className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        dateModal.docId &&
                                        openAddDateModal(dateModal.docId)
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Date
                                </button>

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

                {/* Add Date Modal */}

                {addDateModal.open && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                        onClick={closeAddDateModal}
                    >
                        <div
                            className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Add Date
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeAddDateModal}
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={submitAddDate}
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Type
                                    </label>

                                    <select
                                        value={addDateData.dateTypeId}
                                        onChange={(e) =>
                                            setAddDateData(
                                                'dateTypeId',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">
                                            Select date type
                                        </option>

                                        {dateTypes.map((dt) => (
                                            <option
                                                key={dt.dateTypeId}
                                                value={dt.dateTypeId}
                                            >
                                                {dt.dateTypeName}
                                            </option>
                                        ))}
                                    </select>

                                    {addDateErrors.dateTypeId && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addDateErrors.dateTypeId}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={addDateData.date_value}
                                        onChange={(e) =>
                                            setAddDateData(
                                                'date_value',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {addDateErrors.date_value && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addDateErrors.date_value}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={closeAddDateModal}
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={addDateProcessing}
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Date Modal */}

                {editDateModal.open && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={closeEditDateModal}
                    >
                        <div
                            className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Edit Date
                                    </h2>
                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {editDateModal.dateTypeName ?? '—'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeEditDateModal}
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={submitEditDate}
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={editDateData.date_value}
                                        onChange={(e) =>
                                            setEditDateData('date_value', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editDateErrors.date_value && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {editDateErrors.date_value}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={closeEditDateModal}
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={editDateProcessing}
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {editDateProcessing ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Date Detail Modal */}

                {deleteDateDetail && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={closeDeleteDate}
                    >
                        <div
                            className="w-full max-w-md rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Delete Date
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeDeleteDate}
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="mt-4 text-sm text-gray-700">
                                Are you sure you want to delete{' '}
                                <span className="font-medium text-gray-900">
                                    "{deleteDateDetail.dateTypeName ?? 'this date'}"
                                </span>
                                ?
                            </p>

                            <div className="mt-5 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteDate}
                                    disabled={deleteDateProcessing}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 
                                    disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmDeleteDate}
                                    disabled={deleteDateProcessing}
                                    className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white 
                                    shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500
                                    focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {deleteDateProcessing ? 'Deleting...' : 'Delete'}
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

                {/* Create Modal */}

                {showCreate && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeCreate}
                    >
                        <div
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        New Document
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        Create a new document.
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
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={createData.title}
                                        onChange={(e) =>
                                            setCreateData('title', e.target.value)
                                        }
                                        placeholder="Enter document title"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {createErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={createData.description}
                                        onChange={(e) =>
                                            setCreateData('description', e.target.value)
                                        }
                                        placeholder="Enter document description"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {createErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Party */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Party
                                    </label>

                                    <select
                                        value={createData.partyName}
                                        onChange={(e) =>
                                            setCreateData('partyName', e.target.value)
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Party</option>

                                        {parties.map((party) => (
                                            <option key={party.partyId} value={party.partyId}>
                                                {party.partyName}
                                            </option>
                                        ))}
                                    </select>

                                    {createErrors.partyName && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.partyName}
                                        </p>
                                    )}
                                </div>

                                {/* Document Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Document Type
                                    </label>

                                    <select
                                        value={createData.docType}
                                        onChange={(e) =>
                                            setCreateData('docType', e.target.value)
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Document Type</option>

                                        {documentTypes.map((type) => (
                                            <option key={type.document_id} value={type.document_id}>
                                                {type.document_name}
                                            </option>
                                        ))}
                                    </select>

                                    {createErrors.docType && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.docType}
                                        </p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={createData.date}
                                        onChange={(e) =>
                                            setCreateData('date', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {createErrors.date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Soft Copy */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Soft Copy
                                    </label>

                                    <textarea
                                        rows={2}
                                        value={createData.soft_copy}
                                        onChange={(e) =>
                                            setCreateData('soft_copy', e.target.value)
                                        }
                                        placeholder="Enter soft copy information"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Attachment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        PDF Attachment
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) =>
                                            setCreateData('attachment', e.target.files?.[0] ?? null)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        PDF only. Maximum 10 MB.
                                    </p>

                                    {createErrors.attachment && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {createErrors.attachment}
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={createData.status}
                                        onChange={(e) =>
                                            setCreateData(
                                                'status',
                                                e.target.value as 'Active' | 'Inactive'
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
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

                {editDocument && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeEdit}
                    >
                        <div
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Edit Document
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        Update document information.
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
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) =>
                                            setEditData('title', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {editErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={editData.description}
                                        onChange={(e) =>
                                            setEditData('description', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.description}
                                        </p>
                                    )}
                                </div>

                                {/* Party */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Party
                                    </label>

                                    <select
                                        value={editData.partyName}
                                        onChange={(e) =>
                                            setEditData('partyName', e.target.value)
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Party</option>

                                        {parties.map((party) => (
                                            <option key={party.partyId} value={party.partyId}>
                                                {party.partyName}
                                            </option>
                                        ))}
                                    </select>

                                    {editErrors.partyName && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.partyName}
                                        </p>
                                    )}
                                </div>

                                {/* Document Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Document Type
                                    </label>

                                    <select
                                        value={editData.docType}
                                        onChange={(e) =>
                                            setEditData('docType', e.target.value)
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Document Type</option>

                                        {documentTypes.map((type) => (
                                            <option key={type.document_id} value={type.document_id}>
                                                {type.document_name}
                                            </option>
                                        ))}
                                    </select>

                                    {editErrors.docType && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.docType}
                                        </p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) =>
                                            setEditData('date', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editErrors.date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Soft Copy */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Soft Copy
                                    </label>

                                    <textarea
                                        rows={2}
                                        value={editData.soft_copy}
                                        onChange={(e) =>
                                            setEditData('soft_copy', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Existing PDF - opens in the shared PDF modal */}
                                {editDocument.attachment && (
                                    <div className="rounded-sm bg-gray-50 p-3">
                                        <p className="text-sm text-gray-600">
                                            Existing attachment
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openPdfModal(editDocument.docId, editDocument.title)
                                            }
                                            className="mt-2 inline-flex cursor-pointer items-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
                                        >
                                            View Current PDF
                                        </button>
                                    </div>
                                )}

                                {/* Replace PDF */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Replace PDF
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) =>
                                            setEditData('attachment', e.target.files?.[0] ?? null)
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm"
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave empty to keep the current PDF.
                                    </p>

                                    {editErrors.attachment && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {editErrors.attachment}
                                        </p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={editData.status}
                                        onChange={(e) =>
                                            setEditData(
                                                'status',
                                                e.target.value as 'Active' | 'Inactive'
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
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

                {deleteDocument && (
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
                                        Delete Document
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
                                Are you sure you want to delete{' '}
                                <span className="font-medium text-gray-900">
                                    "{deleteDocument.title}"
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