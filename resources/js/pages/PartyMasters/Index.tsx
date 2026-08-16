import { FormEvent, useEffect, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import PartyMasterController from '@/actions/App/Http/Controllers/PartyMasterController';
import { Info as InfoIcon, Pencil, Trash2, X } from 'lucide-react';
import PartyTypeCombobox from '@/components/PartyTypeCombobox';

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
    partyTypes: PartyType[];
    filters: {
        search: string;
    };
}

export default function Index({ partyMasters, partyTypes, filters }: Props) {
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
        partyName: '',
        address: '',
        partyTypeId: '',
        contactPerson: '',
        phone: '',
        email: '',
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
            PartyMasterController.store().url,
            {
                preserveScroll: true,
                onSuccess: () => closeCreate(),
            }
        );
    }

    // Edit modal
    const [editParty, setEditParty] = useState<PartyMaster | null>(null);

    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
        partyName: '',
        address: '',
        partyTypeId: '',
        contactPerson: '',
        phone: '',
        email: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    function openEdit(party: PartyMaster) {
        setEditParty(party);

        setEditData({
            partyName: party.partyName,
            address: party.address,
            partyTypeId: String(party.partyTypeId),
            contactPerson: party.contactPerson,
            phone: party.phone,
            email: party.email,
            status: party.status,
        });

        clearEditErrors();
    }

    function closeEdit() {
        setEditParty(null);
        resetEdit();
        clearEditErrors();
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (!editParty) {
            return;
        }

        putEdit(
            PartyMasterController.update(editParty.partyId).url,
            {
                preserveScroll: true,
                onSuccess: () => closeEdit(),
            }
        );
    }

    // Delete modal
    const [deleteParty, setDeleteParty] = useState<PartyMaster | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    function openDelete(party: PartyMaster) {
        setDeleteParty(party);
    }

    function closeDelete() {
        setDeleteParty(null);
    }

    function confirmDelete() {
        if (!deleteParty) {
            return;
        }

        setDeleteProcessing(true);

        router.delete(
            PartyMasterController.destroy(deleteParty.partyId).url,
            {
                preserveScroll: true,
                onSuccess: () => closeDelete(),
                onFinish: () => setDeleteProcessing(false),
            }
        );
    }

    // Close modals on Escape
    useEffect(() => {
        if (!infoParty && !showCreate && !editParty && !deleteParty) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeInfo();
                closeCreate();
                closeEdit();
                closeDelete();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [infoParty, showCreate, editParty, deleteParty]);

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
    function handleResetSearch() {
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
            <Head title="Party Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-hidden rounded-sm p-3 sm:p-4">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                            Party Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage parties used across the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex w-full items-center justify-center rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto cursor-pointer"
                    >
                        Add Party
                    </button>
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
                                onClick={handleResetSearch}
                                className="shrink-0 inline-flex items-center justify-center rounded-sm border border-gray-300 
                                bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50 cursor-pointer"
                                title="Clear search"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
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

                                    <button
                                        type="button"
                                        onClick={() => openEdit(party)}
                                        title="Edit"
                                        aria-label="Edit"
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-yellow-500 p-2
                                        text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 
                                        focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openDelete(party)}
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

                                            <button
                                                type="button"
                                                onClick={() => openEdit(party)}
                                                title="Edit"
                                                aria-label="Edit"
                                                className="ml-4 inline-flex items-center justify-center rounded-md bg-yellow-500 p-2 
                                                text-white hover:bg-yellow-600 cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDelete(party)}
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
                                    New Party
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Create a new party.
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
                            {/* Party Name */}
                            <div>
                                <label
                                    htmlFor="create-partyName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Party Name
                                </label>

                                <input
                                    id="create-partyName"
                                    type="text"
                                    value={createData.partyName}
                                    onChange={(e) =>
                                        setCreateData('partyName', e.target.value)
                                    }
                                    placeholder="Enter party name"
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    autoFocus
                                />

                                {createErrors.partyName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.partyName}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    htmlFor="create-address"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Address
                                </label>

                                <input
                                    id="create-address"
                                    type="text"
                                    value={createData.address}
                                    onChange={(e) =>
                                        setCreateData('address', e.target.value)
                                    }
                                    placeholder="Enter address"
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {createErrors.address && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.address}
                                    </p>
                                )}
                            </div>

                            {/* Party Type */}
                            <div>
                                <label
                                    htmlFor="create-partyTypeId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Party Type
                                </label>

                                <PartyTypeCombobox
                                    id="create-partyTypeId"
                                    partyTypes={partyTypes}
                                    value={createData.partyTypeId}
                                    onChange={(value) => setCreateData('partyTypeId', value)}
                                    error={createErrors.partyTypeId}
                                />
                            </div>

                            {/* Contact Person */}
                            <div>
                                <label
                                    htmlFor="create-contactPerson"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Contact Person
                                </label>

                                <input
                                    id="create-contactPerson"
                                    type="text"
                                    value={createData.contactPerson}
                                    onChange={(e) =>
                                        setCreateData('contactPerson', e.target.value)
                                    }
                                    placeholder="Enter contact person"
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {createErrors.contactPerson && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.contactPerson}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="create-phone"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone
                                </label>

                                <input
                                    id="create-phone"
                                    type="text"
                                    value={createData.phone}
                                    onChange={(e) =>
                                        setCreateData('phone', e.target.value)
                                    }
                                    placeholder="Enter phone number"
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {createErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="create-email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="create-email"
                                    type="text"
                                    value={createData.email}
                                    onChange={(e) =>
                                        setCreateData('email', e.target.value)
                                    }
                                    placeholder="Enter email address"
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {createErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {createErrors.email}
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
            {editParty && (
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
                                    Edit Party
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    Update the party information.
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
                            {/* Party Name */}
                            <div>
                                <label
                                    htmlFor="edit-partyName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Party Name
                                </label>

                                <input
                                    id="edit-partyName"
                                    type="text"
                                    value={editData.partyName}
                                    onChange={(e) =>
                                        setEditData('partyName', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    autoFocus
                                />

                                {editErrors.partyName && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.partyName}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    htmlFor="edit-address"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Address
                                </label>

                                <input
                                    id="edit-address"
                                    type="text"
                                    value={editData.address}
                                    onChange={(e) =>
                                        setEditData('address', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {editErrors.address && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.address}
                                    </p>
                                )}
                            </div>

                            {/* Party Type */}
                            <div>
                                <label
                                    htmlFor="edit-partyTypeId"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Party Type
                                </label>

                                <PartyTypeCombobox
                                    id="edit-partyTypeId"
                                    partyTypes={partyTypes}
                                    value={editData.partyTypeId}
                                    onChange={(value) => setEditData('partyTypeId', value)}
                                    error={editErrors.partyTypeId}
                                />
                            </div>

                            {/* Contact Person */}
                            <div>
                                <label
                                    htmlFor="edit-contactPerson"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Contact Person
                                </label>

                                <input
                                    id="edit-contactPerson"
                                    type="text"
                                    value={editData.contactPerson}
                                    onChange={(e) =>
                                        setEditData('contactPerson', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {editErrors.contactPerson && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.contactPerson}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="edit-phone"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone
                                </label>

                                <input
                                    id="edit-phone"
                                    type="text"
                                    value={editData.phone}
                                    onChange={(e) =>
                                        setEditData('phone', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {editErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="edit-email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="edit-email"
                                    type="text"
                                    value={editData.email}
                                    onChange={(e) =>
                                        setEditData('email', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                    px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                />

                                {editErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {editErrors.email}
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
            {deleteParty && (
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
                                    Delete Party
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
                                "{deleteParty.partyName}"
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
            title: 'Party Masters',
            href: PartyMasterController.index().url,
        },
    ],
};