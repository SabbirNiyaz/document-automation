import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';
import AttachmentController from '@/actions/App/Http/Controllers/AttachmentController';

import {
    Info as InfoIcon,
    Pencil,
    Trash2,
    FileText,
    Calendar,
    Paperclip,
    X,
    Plus,
} from 'lucide-react';
import DocumentTypeCombobox from '@/components/DocumentTypeCombobox';
import PartyCombobox from '@/components/PartyCombobox';
import DateTypeCombobox from '@/components/DateTypeCombobox';

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
    notify_email: boolean;
    notify_sms: boolean;
    emails_text_area: string | null;
    notification_before_days: number | null;
    notification_after_days: number | null;
    status: 'Active' | 'Inactive';
    created_at?: string | null;
    created_by?: User | null;
    updated_at?: string | null;
    updated_by?: User | null;
}

interface AttachmentItem {
    attachmentId: number;
    file_name: string;
    file_type: string | null;
    file_size: number | null;
    created_at: string | null;
    created_by: User | null;
    updated_at: string | null;
    updated_by: User | null;
}

interface DocumentItem {
    docId: number;
    title: string;
    short_code: string | null;
    description: string | null;
    partyName: Party | null;
    docType: DocumentType | null;
    date: string;
    soft_copy: string | null;
    status: 'Active' | 'Inactive';
    created_at: string | null;
    updated_at: string | null;
    created_by: User | null;
    updated_by: User | null;
    dateDetails: DateDetailItem[];
    attachments: AttachmentItem[];
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
        status: string;
    };

    dateTypes: DateTypeOption[];
    parties: Party[];
    documentTypes: DocumentType[];

    notificationDayOptions: number[];
}

export default function Index({
    documents,
    filters,
    dateTypes,
    parties,
    documentTypes,
    notificationDayOptions,
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
            error?: string;
        };
    };

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    // PDF VIEWER MODAL (single file preview, reused by attachments list)
    const [pdfModal, setPdfModal] = useState<{
        open: boolean;
        attachmentId: number | null;
        title: string;
    }>({
        open: false,
        attachmentId: null,
        title: '',
    });

    function openPdfModal(attachment: AttachmentItem) {
        setPdfModal({
            open: true,
            attachmentId: attachment.attachmentId,
            title: attachment.file_name,
        });
    }

    function closePdfModal() {
        setPdfModal({
            open: false,
            attachmentId: null,
            title: '',
        });
    }

    // Info Modal
    const [infoDocument, setInfoDocument] =
        useState<DocumentItem | null>(null);

    function openInfo(document: DocumentItem) {
        setInfoDocument(document);
    }

    function closeInfo() {
        setInfoDocument(null);
    }

    // Create Modal
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
        short_code: '',
        description: '',
        partyName: '',
        docType: '',
        date: '',
        soft_copy: '',
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
            DocumentController.store().url,
            {
                preserveScroll: true,
                onSuccess: () => closeCreate(),
            }
        );
    }

    // Edit Modal
    const [editDocument, setEditDocument] =
        useState<DocumentItem | null>(null);

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
        title: '',
        short_code: '',
        description: '',
        partyName: '',
        docType: '',
        date: '',
        soft_copy: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    function openEdit(document: DocumentItem) {
        setEditDocument(document);

        setEditData({
            title: document.title,
            short_code: document.short_code ?? '',
            description: document.description ?? '',
            partyName: document.partyName
                ? String(document.partyName.partyId)
                : '',
            docType: document.docType
                ? String(document.docType.document_id)
                : '',
            date: document.date,
            soft_copy: document.soft_copy ?? '',
            status: document.status,
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

        putEdit(
            DocumentController.update(
                editDocument.docId
            ).url,
            {
                preserveScroll: true,
                onSuccess: () => closeEdit(),
            }
        );
    }

    // Delete Document
    const [deleteDocument, setDeleteDocument] =
        useState<DocumentItem | null>(null);

    const [deleteProcessing, setDeleteProcessing] =
        useState(false);

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

        router.delete(
            DocumentController.destroy(
                deleteDocument.docId
            ).url,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeDelete();
                },

                onFinish: () => {
                    setDeleteProcessing(false);
                },
            }
        );
    }

    // Date Details Modal
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
            dateDetails: (document.dateDetails ?? []).filter(
                (detail) => detail.status === 'Active'
            ),
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

    // Add Date Modal
    const [addDateModal, setAddDateModal] =
        useState<{
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
        notify_email: false as boolean,
        notify_sms: false as boolean,
        emails_text_area: '',
        notification_before_days: '',
        notification_after_days: '',
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
            notify_email: false,
            notify_sms: false,
            emails_text_area: '',
            notification_before_days: '',
            notification_after_days: '',
            status: 'Active',
            stay: true,
        });

        setAddDateModal({
            open: true,
            docId,
        });
    }

    function closeAddDateModal() {
        setAddDateModal({
            open: false,
            docId: null,
        });

        resetAddDate();
        clearAddDateErrors();
    }

    function submitAddDate(e: FormEvent) {
        e.preventDefault();

        postAddDate(
            DateDetailController.store().url,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeAddDateModal();
                    closeDateModal();
                },
            }
        );
    }

    // Edit Date Modal

    const [editDateModal, setEditDateModal] =
        useState<{
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
        notify_email: false as boolean,
        notify_sms: false as boolean,
        emails_text_area: '',
        notification_before_days: '',
        notification_after_days: '',
        status: 'Active' as 'Active' | 'Inactive',
        stay: true,
    });

    function openEditDateModal(
        detail: DateDetailItem
    ) {
        resetEditDate();
        clearEditDateErrors();

        setEditDateData({
            dateTypeId: detail.dateTypeId,
            docId: dateModal.docId ?? '',
            date_value: detail.date_value ?? '',
            notify_email: detail.notify_email,
            notify_sms: detail.notify_sms,
            emails_text_area: detail.emails_text_area ?? '',
            notification_before_days:
                detail.notification_before_days !== null
                    ? String(detail.notification_before_days)
                    : '',
            notification_after_days:
                detail.notification_after_days !== null
                    ? String(detail.notification_after_days)
                    : '',
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
        setEditDateModal({
            open: false,
            id: null,
            dateTypeName: null,
        });

        resetEditDate();
        clearEditDateErrors();
    }

    function submitEditDate(e: FormEvent) {
        e.preventDefault();

        if (!editDateModal.id) {
            return;
        }

        putEditDate(
            DateDetailController.update(
                editDateModal.id
            ).url,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeEditDateModal();
                    closeDateModal();
                },
            }
        );
    }

    // Delete Date Detail

    const [deleteDateDetail, setDeleteDateDetail] =
        useState<DateDetailItem | null>(null);

    const [deleteDateProcessing, setDeleteDateProcessing] =
        useState(false);

    function openDeleteDate(
        detail: DateDetailItem
    ) {
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

        router.delete(
            DateDetailController.destroy(
                deleteDateDetail.id
            ).url,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeDeleteDate();
                    closeDateModal();
                },

                onFinish: () => {
                    setDeleteDateProcessing(false);
                },
            }
        );
    }

    // Date Detail Info Modal (mirrors Attachment Info Modal)

    const [infoDateDetail, setInfoDateDetail] =
        useState<DateDetailItem | null>(null);

    function openDateDetailInfo(detail: DateDetailItem) {
        setInfoDateDetail(detail);
    }

    function closeDateDetailInfo() {
        setInfoDateDetail(null);
    }

    // Attachments Modal (list, mirrors Date Details modal)

    const [attachmentModal, setAttachmentModal] = useState<{
        open: boolean;
        docId: number | null;
        title: string;
        attachments: AttachmentItem[];
    }>({
        open: false,
        docId: null,
        title: '',
        attachments: [],
    });

    function openAttachmentModal(document: DocumentItem) {
        setAttachmentModal({
            open: true,
            docId: document.docId,
            title: document.title,
            attachments: document.attachments ?? [],
        });
    }

    function closeAttachmentModal() {
        setAttachmentModal({
            open: false,
            docId: null,
            title: '',
            attachments: [],
        });
    }

    // Add Attachment Modal

    const [addAttachmentModal, setAddAttachmentModal] =
        useState<{
            open: boolean;
            docId: number | null;
        }>({
            open: false,
            docId: null,
        });

    const {
        data: addAttachmentData,
        setData: setAddAttachmentData,
        post: postAddAttachment,
        processing: addAttachmentProcessing,
        errors: addAttachmentErrors,
        reset: resetAddAttachment,
        clearErrors: clearAddAttachmentErrors,
    } = useForm({
        docId: '' as number | string,
        attachment: null as File | null,
    });

    function openAddAttachmentModal(docId: number) {
        resetAddAttachment();
        clearAddAttachmentErrors();

        setAddAttachmentData({
            docId,
            attachment: null,
        });

        setAddAttachmentModal({
            open: true,
            docId,
        });
    }

    function closeAddAttachmentModal() {
        setAddAttachmentModal({
            open: false,
            docId: null,
        });

        resetAddAttachment();
        clearAddAttachmentErrors();
    }

    function submitAddAttachment(e: FormEvent) {
        e.preventDefault();

        postAddAttachment(
            AttachmentController.store().url,
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    closeAddAttachmentModal();
                    closeAttachmentModal();
                },
            }
        );
    }

    // Delete Attachment

    const [deleteAttachment, setDeleteAttachment] =
        useState<AttachmentItem | null>(null);

    const [deleteAttachmentProcessing, setDeleteAttachmentProcessing] =
        useState(false);

    function openDeleteAttachment(attachment: AttachmentItem) {
        setDeleteAttachment(attachment);
    }

    function closeDeleteAttachment() {
        setDeleteAttachment(null);
    }

    function confirmDeleteAttachment() {
        if (!deleteAttachment) {
            return;
        }

        setDeleteAttachmentProcessing(true);

        router.delete(
            AttachmentController.destroy(
                deleteAttachment.attachmentId
            ).url,
            {
                preserveScroll: true,

                onSuccess: () => {
                    closeDeleteAttachment();
                    closeAttachmentModal();
                },

                onFinish: () => {
                    setDeleteAttachmentProcessing(false);
                },
            }
        );
    }

    // Attachment Info Modal

    const [infoAttachment, setInfoAttachment] =
        useState<AttachmentItem | null>(null);

    function openAttachmentInfo(attachment: AttachmentItem) {
        setInfoAttachment(attachment);
    }

    function closeAttachmentInfo() {
        setInfoAttachment(null);
    }

    // Edit Attachment Modal (replace PDF)
    const [editAttachment, setEditAttachment] =
        useState<AttachmentItem | null>(null);

    const {
        data: editAttachmentData,
        setData: setEditAttachmentData,
        post: postEditAttachment,
        processing: editAttachmentProcessing,
        errors: editAttachmentErrors,
        reset: resetEditAttachment,
        clearErrors: clearEditAttachmentErrors,
    } = useForm({
        attachment: null as File | null,
        _method: 'PUT',
    });

    function openEditAttachment(attachment: AttachmentItem) {
        resetEditAttachment();
        clearEditAttachmentErrors();

        setEditAttachmentData({
            attachment: null,
            _method: 'PUT',
        });

        setEditAttachment(attachment);
    }

    function closeEditAttachment() {
        setEditAttachment(null);
        resetEditAttachment();
        clearEditAttachmentErrors();
    }

    function submitEditAttachment(e: FormEvent) {
        e.preventDefault();

        if (!editAttachment) {
            return;
        }

        postEditAttachment(
            AttachmentController.update(
                editAttachment.attachmentId
            ).url,
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    closeEditAttachment();
                    closeAttachmentModal();
                },
            }
        );
    }

    // Escape Key Handlers
    useEffect(() => {
        if (!pdfModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closePdfModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [pdfModal.open]);

    useEffect(() => {
        if (!infoDocument) {
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

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [infoDocument]);

    useEffect(() => {
        if (
            !showCreate &&
            !editDocument &&
            !deleteDocument
        ) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeCreate();
                closeEdit();
                closeDelete();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        showCreate,
        editDocument,
        deleteDocument,
    ]);

    useEffect(() => {
        if (!dateModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeDateModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [dateModal.open]);

    useEffect(() => {
        if (!addDateModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeAddDateModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [addDateModal.open]);

    useEffect(() => {
        if (!editDateModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeEditDateModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [editDateModal.open]);

    useEffect(() => {
        if (!deleteDateDetail) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeDeleteDate();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [deleteDateDetail]);

    useEffect(() => {
        if (!infoDateDetail) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeDateDetailInfo();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [infoDateDetail]);

    useEffect(() => {
        if (!attachmentModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeAttachmentModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [attachmentModal.open]);

    useEffect(() => {
        if (!addAttachmentModal.open) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeAddAttachmentModal();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [addAttachmentModal.open]);

    useEffect(() => {
        if (!deleteAttachment) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeDeleteAttachment();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [deleteAttachment]);

    useEffect(() => {
        if (!infoAttachment) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeAttachmentInfo();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [infoAttachment]);

    useEffect(() => {
        if (!editAttachment) {
            return;
        }

        function handleKeyDown(
            e: KeyboardEvent
        ) {
            if (e.key === 'Escape') {
                closeEditAttachment();
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [editAttachment]);

    // Flash Messages
    useEffect(() => {
        if (!flash?.success) {
            return;
        }

        setShowSuccess(true);

        const timer = setTimeout(
            () => setShowSuccess(false),
            3000
        );

        return () => clearTimeout(timer);
    }, [flash?.success]);

    useEffect(() => {
        if (!flash?.error) {
            return;
        }

        setShowError(true);

        const timer = setTimeout(
            () => setShowError(false),
            3000
        );

        return () => clearTimeout(timer);
    }, [flash?.error]);

    // Search
    function handleSearch(
        e: FormEvent
    ) {
        e.preventDefault();

        router.get(
            DocumentController.index().url,
            {
                search,
                status:
                    status !== 'all'
                        ? status
                        : undefined,
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
                status:
                    status !== 'all'
                        ? status
                        : undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function handleStatusChange(
        value: string
    ) {
        setStatus(value);

        router.get(
            DocumentController.index().url,
            {
                search,
                status:
                    value !== 'all'
                        ? value
                        : undefined,
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

    // Formatting
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

    function formatFileSize(value: number | null) {
        if (value === null || value === undefined) {
            return '—';
        }

        if (value < 1024) {
            return `${value} B`;
        }

        if (value < 1024 * 1024) {
            return `${(value / 1024).toFixed(1)} KB`;
        }

        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    function notificationTypeLabel(
        detail: DateDetailItem
    ) {
        if (detail.notify_email && detail.notify_sms) {
            return 'SMS & Email';
        }

        if (detail.notify_email) {
            return 'Email';
        }

        if (detail.notify_sms) {
            return 'SMS';
        }

        return 'None';
    }

    function notificationTypeBadgeClass(
        detail: DateDetailItem
    ) {
        if (detail.notify_email && detail.notify_sms) {
            return 'bg-green-100 text-green-800';
        }

        if (detail.notify_email) {
            return 'bg-red-100 text-red-800';
        }

        if (detail.notify_sms) {
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
            <Head title="Documents" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* HEADER */}
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

                {/* FLASH MESSAGES */}
                {showSuccess &&
                    flash?.success && (
                        <div className="rounded-sm bg-green-50 px-4 py-3 text-center text-sm text-green-700 shadow-sm">
                            {flash.success}
                        </div>
                    )}

                {showError &&
                    flash?.error && (
                        <div className="rounded-sm bg-red-50 px-4 py-3 text-center text-sm text-red-700 shadow-sm">
                            {flash.error}
                        </div>
                    )}

                {/* SEARCH + STATUS */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search by Title, Description or Document Type..."
                            className="w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:w-[420px]"
                        />

                        <button
                            type="submit"
                            className="shrink-0 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                        >
                            Search
                        </button>

                        {(search ||
                            filters?.search) && (
                                <button
                                    type="button"
                                    onClick={
                                        handleResetSearch
                                    }
                                    className="shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                                    title="Clear search"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                    </form>

                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="status-filter"
                            className="text-sm text-gray-500 shrink-0"
                        >
                            Status:
                        </label>

                        <select
                            id="status-filter"
                            value={status}
                            onChange={(e) =>
                                handleStatusChange(
                                    e.target.value
                                )
                            }
                            className="rounded-sm border-gray-300 text-sm shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">
                                All
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>

                        {status !== 'all' && (
                            <button
                                type="button"
                                onClick={
                                    handleResetStatus
                                }
                                className="shrink-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                                title="Clear status filter"
                                aria-label="Clear status filter"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* EMPTY */}
                {documents.data.length === 0 && (
                    <div className="rounded-sm border bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No documents found.
                    </div>
                )}

                {/* MOBILE DOCUMENT LIST */}
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
                                                ID:{' '}
                                                {
                                                    document.docId
                                                }
                                            </p>

                                            <p className="text-sm font-medium text-gray-600">
                                                <span className='text-xs uppercase tracking-wide text-gray-400'>Title: {' '}</span>
                                                {
                                                    document.title
                                                }
                                            </p>

                                            <p className="text-sm font-medium text-gray-600">
                                                <span className='text-xs uppercase tracking-wide text-gray-400'>Short Code: {' '}</span>
                                                {
                                                    document.short_code
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
                                                    document
                                                        .partyName
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
                                                    document
                                                        .docType
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
                                            onClick={() =>
                                                openInfo(
                                                    document
                                                )
                                            }
                                            title="Info"
                                            aria-label="Info"
                                            className="inline-flex items-center justify-center rounded-md bg-gray-500 p-2 text-white hover:bg-gray-600 cursor-pointer"
                                        >
                                            <InfoIcon className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openAttachmentModal(
                                                    document
                                                )
                                            }
                                            title="Attachments"
                                            aria-label="Attachments"
                                            className="relative inline-flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 cursor-pointer"
                                        >
                                            <Paperclip className="h-4 w-4" />

                                            {document.attachments.length > 0 && (
                                                <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-500">
                                                    {document.attachments.length}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openDateModal(
                                                    document
                                                )
                                            }
                                            title="View Dates"
                                            aria-label="View Dates"
                                            className="relative inline-flex items-center justify-center rounded-md bg-purple-500 p-2 text-white hover:bg-purple-600 cursor-pointer"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {document.dateDetails.filter((d) => d.status === 'Active').length > 0 && (
                                                <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-purple-600 ring-1 ring-purple-500">
                                                    {document.dateDetails.filter((d) => d.status === 'Active').length}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEdit(
                                                    document
                                                )
                                            }
                                            title="Edit"
                                            aria-label="Edit"
                                            className="inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600 cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openDelete(
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

                {/* DESKTOP TABLE */}
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
                                        Short Code
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

                                    {/* <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Attachments
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Date Details
                                    </th> */}

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

                                            <td className="px-4 py-3 text-sm font-medium text-gray-600">
                                                {
                                                    document.short_code
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.description ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document
                                                        .partyName
                                                        ?.partyName ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document
                                                        .docType
                                                        ?.document_name ??
                                                    '—'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {
                                                    document.soft_copy ??
                                                    '—'
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

                                            {/* <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAttachmentModal(
                                                            document
                                                        )
                                                    }
                                                    title="Attachments"
                                                    aria-label="Attachments"
                                                    className="relative inline-flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 cursor-pointer"
                                                >
                                                    <Paperclip className="h-4 w-4" />

                                                    {document.attachments.length > 0 && (
                                                        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-500">
                                                            {document.attachments.length}
                                                        </span>
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDateModal(
                                                            document
                                                        )
                                                    }
                                                    title="View Dates"
                                                    aria-label="View Dates"
                                                    className="relative inline-flex items-center justify-center rounded-md bg-purple-500 p-2 text-white hover:bg-purple-600 cursor-pointer"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                    {document.dateDetails.filter((d) => d.status === 'Active').length > 0 && (
                                                        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-purple-600 ring-1 ring-purple-500">
                                                            {document.dateDetails.filter((d) => d.status === 'Active').length}
                                                        </span>
                                                    )}
                                                </button>
                                            </td> */}

                                            <td className="px-4 py-3 text-right whitespace-nowrap">

                                                {/* Attachment Button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAttachmentModal(
                                                            document
                                                        )
                                                    }
                                                    title="Attachments"
                                                    aria-label="Attachments"
                                                    className="relative inline-flex items-center justify-center rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 cursor-pointer"
                                                >
                                                    <Paperclip className="h-4 w-4" />

                                                    {document.attachments.length > 0 && (
                                                        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-500">
                                                            {document.attachments.length}
                                                        </span>
                                                    )}
                                                </button>

                                                {/* Date Button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDateModal(
                                                            document
                                                        )
                                                    }
                                                    title="View Dates"
                                                    aria-label="View Dates"
                                                    className="ml-3 relative inline-flex items-center justify-center rounded-md bg-purple-500 p-2 text-white hover:bg-purple-600 cursor-pointer"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                    {document.dateDetails.filter((d) => d.status === 'Active').length > 0 && (
                                                        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-purple-600 ring-1 ring-purple-500">
                                                            {document.dateDetails.filter((d) => d.status === 'Active').length}
                                                        </span>
                                                    )}
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openInfo(
                                                            document
                                                        )
                                                    }
                                                    title="Info"
                                                    aria-label="Info"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-gray-400 p-2 text-white hover:bg-gray-500 cursor-pointer"
                                                >
                                                    <InfoIcon className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEdit(
                                                            document
                                                        )
                                                    }
                                                    title="Edit"
                                                    aria-label="Edit"
                                                    className="ml-3 inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600 cursor-pointer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDelete(
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

                {/* PAGINATION*/}
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

                {/* PDF VIEWER MODAL*/}
                {pdfModal.open &&
                    pdfModal.attachmentId && (

                        <div
                            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
                            onClick={closePdfModal}
                        >
                            <div
                                className="flex h-[95vh] w-full max-w-6xl flex-col rounded-sm bg-white shadow-xl"
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                            >

                                <div className="flex items-center justify-between border-b px-4 py-3">

                                    <h2 className="truncate pr-4 text-sm font-medium text-gray-900">
                                        {pdfModal.title}
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={
                                            closePdfModal
                                        }
                                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                </div>

                                <div className="flex-1 overflow-hidden bg-gray-100">

                                    <iframe
                                        key={pdfModal.attachmentId}

                                        src={AttachmentController.view(
                                            pdfModal.attachmentId
                                        ).url}

                                        className="h-full w-full"

                                        title={
                                            pdfModal.title
                                        }
                                    />

                                </div>

                            </div>
                        </div>
                    )}

                {/* ATTACHMENTS MODAL */}
                {attachmentModal.open && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeAttachmentModal
                        }
                    >
                        <div
                            className="w-full max-w-2xl rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Attachments
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {
                                            attachmentModal.title
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeAttachmentModal
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <div className="mt-4 overflow-x-auto border-t border-gray-100 pt-4">

                                {attachmentModal.attachments
                                    .length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No attachments for this document.
                                    </p>
                                ) : (

                                    <table className="min-w-full divide-y divide-gray-200 text-sm">

                                        <thead>
                                            <tr>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    File Name
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Size
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Uploaded
                                                </th>

                                                <th className="py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Actions
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">

                                            {attachmentModal.attachments.map(
                                                (
                                                    attachment
                                                ) => (
                                                    <tr
                                                        key={
                                                            attachment.attachmentId
                                                        }
                                                    >

                                                        <td className="py-2 pr-2 text-gray-700">
                                                            <span className="flex items-center gap-1.5">
                                                                <FileText className="h-4 w-4 shrink-0 text-gray-400" />

                                                                <span className="max-w-[220px] truncate">
                                                                    {
                                                                        attachment.file_name
                                                                    }
                                                                </span>
                                                            </span>
                                                        </td>

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">
                                                            {formatFileSize(attachment.file_size)}
                                                        </td>

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">
                                                            {formatDate(attachment.created_at)}
                                                        </td>

                                                        <td className="py-2 text-right whitespace-nowrap">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openAttachmentInfo(
                                                                        attachment
                                                                    )
                                                                }
                                                                title="Info"
                                                                aria-label="Info"
                                                                className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                                            >
                                                                <InfoIcon className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openPdfModal(
                                                                        attachment
                                                                    )
                                                                }
                                                                title="View PDF"
                                                                aria-label="View PDF"
                                                                className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditAttachment(
                                                                        attachment
                                                                    )
                                                                }
                                                                title="Replace PDF"
                                                                aria-label="Replace PDF"
                                                                className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDeleteAttachment(
                                                                        attachment
                                                                    )
                                                                }
                                                                title="Delete Attachment"
                                                                aria-label="Delete Attachment"
                                                                className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>
                                    </table>
                                )}

                            </div>

                            <div className="mt-5 flex items-center justify-between">

                                <button
                                    type="button"
                                    onClick={() =>
                                        attachmentModal.docId &&
                                        openAddAttachmentModal(
                                            attachmentModal.docId
                                        )
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Attachment
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        closeAttachmentModal
                                    }
                                    className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* ADD ATTACHMENT MODAL */}
                {addAttachmentModal.open && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeAddAttachmentModal
                        }
                    >
                        <div
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <h2 className="text-base font-semibold text-gray-900">
                                    Add Attachment
                                </h2>

                                <button
                                    type="button"
                                    onClick={
                                        closeAddAttachmentModal
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitAddAttachment
                                }
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >

                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        PDF File
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) =>
                                            setAddAttachmentData(
                                                'attachment',
                                                e.target.files?.[0] ??
                                                null
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm"
                                        autoFocus
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        PDF only. Maximum 10 MB.
                                    </p>

                                    {addAttachmentErrors.attachment && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                addAttachmentErrors.attachment
                                            }
                                        </p>
                                    )}

                                </div>

                                <div className="mt-5 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeAddAttachmentModal
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            addAttachmentProcessing
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {
                                            addAttachmentProcessing
                                                ? 'Uploading...'
                                                : 'Upload'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* =========================================================
                    DELETE ATTACHMENT MODAL */}
                {deleteAttachment && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeDeleteAttachment
                        }
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
                                        Delete Attachment
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteAttachment
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <p className="mt-4 text-sm text-gray-700">
                                Are you sure you want to
                                delete{' '}

                                <span className="font-medium text-gray-900">
                                    "
                                    {
                                        deleteAttachment.file_name
                                    }
                                    "
                                </span>
                                ?
                            </p>

                            <div className="mt-5 flex items-center justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteAttachment
                                    }
                                    disabled={
                                        deleteAttachmentProcessing
                                    }
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        confirmDeleteAttachment
                                    }
                                    disabled={
                                        deleteAttachmentProcessing
                                    }
                                    className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {
                                        deleteAttachmentProcessing
                                            ? 'Deleting...'
                                            : 'Delete'
                                    }
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* ATTACHMENT INFO MODAL */}
                {infoAttachment && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={closeAttachmentInfo}
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
                                        Attachment Info
                                    </h2>

                                    <p className="mt-0.5 truncate text-sm text-gray-500">
                                        {
                                            infoAttachment.file_name
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeAttachmentInfo
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
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
                                        {formatDate(
                                            infoAttachment.created_at
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Created By
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {infoAttachment.created_by
                                            ? `${infoAttachment.created_by.name} (ID: ${infoAttachment.created_by.id})`
                                            : '—'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Updated
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {formatDate(
                                            infoAttachment.updated_at
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Updated By
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {infoAttachment.updated_by
                                            ? `${infoAttachment.updated_by.name} (ID: ${infoAttachment.updated_by.id})`
                                            : '—'}
                                    </dd>
                                </div>

                            </dl>

                            <div className="mt-5 flex justify-end">

                                <button
                                    type="button"
                                    onClick={
                                        closeAttachmentInfo
                                    }
                                    className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* EDIT ATTACHMENT MODAL (replace PDF) */}
                {editAttachment && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeEditAttachment
                        }
                    >
                        <div
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div>

                                    <h2 className="text-base font-semibold text-gray-900">
                                        Replace Attachment
                                    </h2>

                                    <p className="mt-0.5 truncate text-sm text-gray-500">
                                        {
                                            editAttachment.file_name
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeEditAttachment
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitEditAttachment
                                }
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >

                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        New PDF File
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={(e) =>
                                            setEditAttachmentData(
                                                'attachment',
                                                e.target.files?.[0] ??
                                                null
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm"
                                        autoFocus
                                    />

                                    <p className="mt-1 text-xs text-gray-500">
                                        PDF only. Maximum 10 MB. This will replace
                                        the current file.
                                    </p>

                                    {editAttachmentData.attachment && (
                                        <p className="mt-1 text-xs text-green-600">
                                            New PDF selected:{' '}
                                            {
                                                editAttachmentData
                                                    .attachment
                                                    .name
                                            }
                                        </p>
                                    )}

                                    {editAttachmentErrors.attachment && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                editAttachmentErrors.attachment
                                            }
                                        </p>
                                    )}

                                </div>

                                <div className="mt-5 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeEditAttachment
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            editAttachmentProcessing
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {
                                            editAttachmentProcessing
                                                ? 'Uploading...'
                                                : 'Replace'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* DATE DETAILS MODAL */}
                {dateModal.open && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeDateModal
                        }
                    >
                        <div
                            className="w-full max-w-2xl rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Date Details
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {
                                            dateModal.title
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDateModal
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <div className="mt-4 overflow-x-auto border-t border-gray-100 pt-4">

                                {dateModal.dateDetails
                                    .length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No date details for this document.
                                    </p>
                                ) : (

                                    <table className="min-w-full divide-y divide-gray-200 text-sm">

                                        <thead>
                                            <tr>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Date Type
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Date
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Notification
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Before
                                                </th>

                                                <th className="py-2 pr-2 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    After
                                                </th>

                                                <th className="py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Actions
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">

                                            {dateModal.dateDetails.map(
                                                (
                                                    detail
                                                ) => (
                                                    <tr
                                                        key={
                                                            detail.id
                                                        }
                                                    >

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">
                                                            {
                                                                detail.dateTypeName ??
                                                                '—'
                                                            }
                                                        </td>

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">

                                                            {detail.date_value
                                                                ? new Date(
                                                                    `${detail.date_value}T00:00:00`
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    }
                                                                )
                                                                : '—'}

                                                        </td>

                                                        <td className="py-2 pr-2 whitespace-nowrap">
                                                            <span
                                                                className={
                                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                                    notificationTypeBadgeClass(detail)
                                                                }
                                                            >
                                                                {notificationTypeLabel(detail)}
                                                            </span>
                                                        </td>

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">
                                                            {formatDays(detail.notification_before_days)}
                                                        </td>

                                                        <td className="py-2 pr-2 text-gray-700 whitespace-nowrap">
                                                            {formatDays(detail.notification_after_days)}
                                                        </td>

                                                        <td className="py-2 text-right whitespace-nowrap">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDateDetailInfo(
                                                                        detail
                                                                    )
                                                                }
                                                                title="Info"
                                                                aria-label="Info"
                                                                className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                                                            >
                                                                <InfoIcon className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditDateModal(
                                                                        detail
                                                                    )
                                                                }
                                                                title="Edit Date"
                                                                aria-label="Edit Date"
                                                                className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDeleteDate(
                                                                        detail
                                                                    )
                                                                }
                                                                title="Delete Date"
                                                                aria-label="Delete Date"
                                                                className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>
                                    </table>
                                )}

                            </div>

                            <div className="mt-5 flex items-center justify-between">

                                <button
                                    type="button"
                                    onClick={() =>
                                        dateModal.docId &&
                                        openAddDateModal(
                                            dateModal.docId
                                        )
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Date
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        closeDateModal
                                    }
                                    className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* ADD DATE MODAL */}
                {addDateModal.open && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeAddDateModal
                        }
                    >
                        <div
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <h2 className="text-base font-semibold text-gray-900">
                                    Add Date
                                </h2>

                                <button
                                    type="button"
                                    onClick={
                                        closeAddDateModal
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitAddDate
                                }
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >

                                {/* Date Type */}
                                <div>
                                    <label
                                        htmlFor="create-dateTypeId"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Date Type
                                    </label>

                                    <DateTypeCombobox
                                        id="create-dateTypeId"
                                        dateTypes={dateTypes}
                                        value={addDateData.dateTypeId}
                                        onChange={(value) => setAddDateData('dateTypeId', value)}
                                        error={addDateErrors.dateTypeId}
                                    />
                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            addDateData.date_value
                                        }
                                        onChange={(e) =>
                                            setAddDateData(
                                                'date_value',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 p-2 block w-full rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {addDateErrors.date_value && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                addDateErrors.date_value
                                            }
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
                                                checked={addDateData.notify_email}
                                                onChange={(e) =>
                                                    setAddDateData(
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
                                                checked={addDateData.notify_sms}
                                                onChange={(e) =>
                                                    setAddDateData(
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

                                    {addDateErrors.notify_email && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addDateErrors.notify_email}
                                        </p>
                                    )}

                                    {addDateErrors.notify_sms && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {addDateErrors.notify_sms}
                                        </p>
                                    )}
                                </div>

                                { /* Email Text Area */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Addresses
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            addDateData.emails_text_area
                                        }
                                        onChange={(e) =>
                                            setAddDateData(
                                                'emails_text_area',
                                                e.target.value
                                            )
                                        }
                                        placeholder="one@example.com, two@example.com (separate multiple emails with commas)"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {addDateErrors.emails_text_area && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                addDateErrors.emails_text_area
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Notify Before / After */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notify Before
                                        </label>

                                        <select
                                            value={addDateData.notification_before_days}
                                            onChange={(e) =>
                                                setAddDateData(
                                                    'notification_before_days',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 p-2 block w-full cursor-pointer rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>

                                            {notificationDayOptions.map((days) => (
                                                <option key={days} value={days}>
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </option>
                                            ))}
                                        </select>

                                        {addDateErrors.notification_before_days && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {addDateErrors.notification_before_days}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notify After
                                        </label>

                                        <select
                                            value={addDateData.notification_after_days}
                                            onChange={(e) =>
                                                setAddDateData(
                                                    'notification_after_days',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 p-2 block w-full cursor-pointer rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>

                                            {notificationDayOptions.map((days) => (
                                                <option key={days} value={days}>
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </option>
                                            ))}
                                        </select>

                                        {addDateErrors.notification_after_days && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {addDateErrors.notification_after_days}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeAddDateModal
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            addDateProcessing
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {
                                            addDateProcessing
                                                ? 'Saving...'
                                                : 'Save'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* EDIT DATE MODAL */}
                {editDateModal.open && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeEditDateModal
                        }
                    >
                        <div
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-start justify-between gap-3">

                                <div>

                                    <h2 className="text-base font-semibold text-gray-900">
                                        Edit Date
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {
                                            editDateModal.dateTypeName ??
                                            '—'
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeEditDateModal
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitEditDate
                                }
                                className="mt-4 space-y-4 border-t border-gray-100 pt-4"
                            >

                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            editDateData.date_value
                                        }
                                        onChange={(e) =>
                                            setEditDateData(
                                                'date_value',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 p-2 block w-full rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editDateErrors.date_value && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {
                                                editDateErrors.date_value
                                            }
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
                                                checked={editDateData.notify_email}
                                                onChange={(e) =>
                                                    setEditDateData(
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
                                                checked={editDateData.notify_sms}
                                                onChange={(e) =>
                                                    setEditDateData(
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

                                    {editDateErrors.notify_email && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {editDateErrors.notify_email}
                                        </p>
                                    )}

                                    {editDateErrors.notify_sms && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {editDateErrors.notify_sms}
                                        </p>
                                    )}
                                </div>

                                { /* Email Text Area */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Addresses
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            editDateData.emails_text_area
                                        }
                                        onChange={(e) =>
                                            setEditDateData(
                                                'emails_text_area',
                                                e.target.value
                                            )
                                        }
                                        placeholder="one@example.com, two@example.com (separate multiple emails with commas)"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editDateErrors.emails_text_area && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editDateErrors.emails_text_area
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Notify Before / After */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notify Before
                                        </label>

                                        <select
                                            value={editDateData.notification_before_days}
                                            onChange={(e) =>
                                                setEditDateData(
                                                    'notification_before_days',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 p-2 block w-full cursor-pointer rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>

                                            {notificationDayOptions.map((days) => (
                                                <option key={days} value={days}>
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </option>
                                            ))}
                                        </select>

                                        {editDateErrors.notification_before_days && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {editDateErrors.notification_before_days}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Notify After
                                        </label>

                                        <select
                                            value={editDateData.notification_after_days}
                                            onChange={(e) =>
                                                setEditDateData(
                                                    'notification_after_days',
                                                    e.target.value
                                                )
                                            }
                                            className="mt-1 p-2 block w-full cursor-pointer rounded-sm border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>

                                            {notificationDayOptions.map((days) => (
                                                <option key={days} value={days}>
                                                    {days} {days === 1 ? 'day' : 'days'}
                                                </option>
                                            ))}
                                        </select>

                                        {editDateErrors.notification_after_days && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {editDateErrors.notification_after_days}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeEditDateModal
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            editDateProcessing
                                        }
                                        className="inline-flex cursor-pointer items-center rounded-sm border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {
                                            editDateProcessing
                                                ? 'Saving...'
                                                : 'Save'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* DELETE DATE MODAL */}
                {deleteDateDetail && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeDeleteDate
                        }
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
                                        Delete Date
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteDate
                                    }
                                    className="cursor-pointer rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <p className="mt-4 text-sm text-gray-700">
                                Are you sure you want to
                                delete{' '}

                                <span className="font-medium text-gray-900">
                                    "
                                    {
                                        deleteDateDetail.dateTypeName ??
                                        'this date'
                                    }
                                    "
                                </span>
                                ?
                            </p>

                            <div className="mt-5 flex items-center justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeDeleteDate
                                    }
                                    disabled={
                                        deleteDateProcessing
                                    }
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        confirmDeleteDate
                                    }
                                    disabled={
                                        deleteDateProcessing
                                    }
                                    className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {
                                        deleteDateProcessing
                                            ? 'Deleting...'
                                            : 'Delete'
                                    }
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* DATE DETAIL INFO MODAL (mirrors Attachment Info Modal) */}
                {infoDateDetail && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
                        onClick={closeDateDetailInfo}
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
                                        Date Detail Info
                                    </h2>

                                    <p className="mt-0.5 truncate text-sm text-gray-500">
                                        {
                                            infoDateDetail.dateTypeName ??
                                            '—'
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDateDetailInfo
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Notify Emails
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {infoDateDetail.emails_text_area
                                            ? infoDateDetail.emails_text_area
                                            : '—'}
                                    </dd>
                                </div>

                            </dl>

                            <dl className="mt-4 grid grid-cols-1 gap-y-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 sm:gap-x-4">

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-gray-400">
                                        Created
                                    </dt>

                                    <dd className="mt-0.5 text-gray-700">
                                        {formatDate(infoDateDetail.created_at ?? null)}
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
                                        {formatDate(infoDateDetail.updated_at ?? null)}
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
                                        closeDateDetailInfo
                                    }
                                    className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* INFO MODAL */}
                {infoDocument && (
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
                                            infoDocument.title
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeInfo
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
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
                                        {formatDate(
                                            infoDocument.created_at
                                        )}
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
                                        {formatDate(
                                            infoDocument.updated_at
                                        )}
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
                                    onClick={
                                        closeInfo
                                    }
                                    className="inline-flex items-center rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* CREATE DOCUMENT MODAL*/}
                {showCreate && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeCreate}
                    >
                        <div
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
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
                                    onClick={
                                        closeCreate
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitCreate
                                }
                                className="mt-4 space-y-4"
                            >

                                {/* Title */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            createData.title
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter document title"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {createErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                createErrors.title
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Short Code */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Short Code
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            createData.short_code
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'short_code',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter document short code"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {createErrors.short_code && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                createErrors.short_code
                                            }
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
                                        value={
                                            createData.description
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter document description"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {createErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                createErrors.description
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Party */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Party
                                    </label>

                                    <PartyCombobox
                                        parties={parties}
                                        value={createData.partyName}
                                        onChange={(value) => setCreateData('partyName', value)}
                                        error={createErrors.partyName}
                                    />
                                </div>

                                {/* Document Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Document Type
                                    </label>

                                    <DocumentTypeCombobox
                                        documentTypes={documentTypes}
                                        value={createData.docType}
                                        onChange={(value) => setCreateData('docType', value)}
                                        error={createErrors.docType}
                                    />
                                </div>

                                {/* Date */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            createData.date
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'date',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {createErrors.date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                createErrors.date
                                            }
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
                                        value={
                                            createData.soft_copy
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'soft_copy',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter soft copy information"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                </div>

                                {/* Status */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            createData.status
                                        }
                                        onChange={(e) =>
                                            setCreateData(
                                                'status',
                                                e.target.value as
                                                | 'Active'
                                                | 'Inactive'
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    {createErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                createErrors.status
                                            }
                                        </p>
                                    )}

                                </div>

                                <p className="text-xs text-gray-500">
                                    You can attach PDFs after saving, from the
                                    Attachments panel.
                                </p>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeCreate
                                        }
                                        className="text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            createProcessing
                                        }
                                        className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                    >
                                        {
                                            createProcessing
                                                ? 'Saving...'
                                                : 'Save'
                                        }
                                    </button>

                                </div>

                            </form>
                        </div>
                    </div>
                )}

                {/* EDIT DOCUMENT MODAL */}
                {editDocument && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeEdit}
                    >
                        <div
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm bg-white p-5 shadow-lg"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
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
                                    onClick={
                                        closeEdit
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    submitEdit
                                }
                                className="mt-4 space-y-4"
                            >

                                {/* Title */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editData.title
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {editErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editErrors.title
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Short Code */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Short Code
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editData.short_code
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'short_code',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter document short code"
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                        autoFocus
                                    />

                                    {editErrors.short_code && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editErrors.short_code
                                            }
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
                                        value={
                                            editData.description
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editErrors.description
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Party */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Party
                                    </label>

                                    <PartyCombobox
                                        parties={parties}
                                        value={editData.partyName}
                                        onChange={(value) => setEditData('partyName', value)}
                                        error={editErrors.partyName}
                                    />
                                </div>

                                {/* Document Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Document Type
                                    </label>

                                    <DocumentTypeCombobox
                                        documentTypes={documentTypes}
                                        value={editData.docType}
                                        onChange={(value) => setEditData('docType', value)}
                                        error={editErrors.docType}
                                    />
                                </div>

                                {/* Date */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            editData.date
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'date',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                    {editErrors.date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editErrors.date
                                            }
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
                                        value={
                                            editData.soft_copy
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'soft_copy',
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />

                                </div>

                                <div className="rounded-sm bg-gray-50 p-3">

                                    <p className="text-sm text-gray-600">
                                        {
                                            editDocument.attachments.length
                                        }{' '}
                                        attachment
                                        {
                                            editDocument.attachments.length === 1
                                                ? ''
                                                : 's'
                                        }
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeEdit();
                                            openAttachmentModal(editDocument);
                                        }}
                                        className="mt-2 inline-flex cursor-pointer items-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
                                    >
                                        <Paperclip className="mr-2 h-4 w-4" />
                                        Manage Attachments
                                    </button>

                                </div>

                                {/* Status */}
                                <div>

                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            editData.status
                                        }
                                        onChange={(e) =>
                                            setEditData(
                                                'status',
                                                e.target.value as
                                                | 'Active'
                                                | 'Inactive'
                                            )
                                        }
                                        className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    >

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                    {editErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                editErrors.status
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-2">

                                    <button
                                        type="button"
                                        onClick={
                                            closeEdit
                                        }
                                        className="text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            editProcessing
                                        }
                                        className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                    >
                                        {
                                            editProcessing
                                                ? 'Updating...'
                                                : 'Update'
                                        }
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                )}

                {/* DELETE DOCUMENT MODAL */}
                {deleteDocument && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={
                            closeDelete
                        }
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
                                        Delete Document
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        This action cannot be undone.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeDelete
                                    }
                                    className="rounded-sm p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <p className="mt-4 text-sm text-gray-700">
                                Are you sure you want to
                                delete{' '}

                                <span className="font-medium text-gray-900">
                                    "
                                    {
                                        deleteDocument.title
                                    }
                                    "
                                </span>
                                ?
                            </p>

                            <div className="mt-5 flex items-center justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeDelete
                                    }
                                    disabled={
                                        deleteProcessing
                                    }
                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        confirmDelete
                                    }
                                    disabled={
                                        deleteProcessing
                                    }
                                    className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {
                                        deleteProcessing
                                            ? 'Deleting...'
                                            : 'Delete'
                                    }
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