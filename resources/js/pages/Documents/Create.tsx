import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DocumentController from '@/actions/App/Http/Controllers/DocumentController';

interface Party {
    partyId: number;
    partyName: string;
}

interface DocumentType {
    document_id: number;
    document_name: string;
}

interface Props {
    parties: Party[];
    documentTypes: DocumentType[];
}

export default function Create({
    parties,
    documentTypes,
}: Props) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        title: '',
        description: '',
        partyName: '',
        docType: '',
        date: '',
        soft_copy: '',
        status: 'Active' as
            | 'Active'
            | 'Inactive',
        attachment: null as File | null,
    });

    function submit(
        e: FormEvent
    ) {

        e.preventDefault();

        post(
            DocumentController.store().url,
            {
                forceFormData: true,
            }
        );
    }

    return (
        <>
            <Head title="New Document" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                <div className="mx-auto w-full max-w-2xl">

                    <div>

                        <h1 className="text-xl font-semibold text-gray-900">
                            New Document
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Create a new document.
                        </p>

                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border bg-white p-6 shadow-sm"
                    >

                        {/* Title */}

                        <div>

                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Title
                            </label>

                            <input
                                id="title"
                                type="text"
                                value={
                                    data.title
                                }
                                onChange={(e) =>
                                    setData(
                                        'title',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter document title"
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}

                        </div>

                        {/* Description */}

                        <div>

                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                rows={4}
                                value={
                                    data.description
                                }
                                onChange={(e) =>
                                    setData(
                                        'description',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter document description"
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.description
                                    }
                                </p>
                            )}

                        </div>

                        {/* Party */}

                        <div>

                            <label
                                htmlFor="partyName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Party
                            </label>

                            <select
                                id="partyName"
                                value={
                                    data.partyName
                                }
                                onChange={(e) =>
                                    setData(
                                        'partyName',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >

                                <option value="">
                                    Select Party
                                </option>

                                {parties.map(
                                    (party) => (

                                        <option
                                            key={
                                                party.partyId
                                            }
                                            value={
                                                party.partyId
                                            }
                                        >
                                            {
                                                party.partyName
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                            {errors.partyName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.partyName
                                    }
                                </p>
                            )}

                        </div>

                        {/* Document Type */}

                        <div>

                            <label
                                htmlFor="docType"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Document Type
                            </label>

                            <select
                                id="docType"
                                value={
                                    data.docType
                                }
                                onChange={(e) =>
                                    setData(
                                        'docType',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >

                                <option value="">
                                    Select Document Type
                                </option>

                                {documentTypes.map(
                                    (type) => (

                                        <option
                                            key={
                                                type.document_id
                                            }
                                            value={
                                                type.document_id
                                            }
                                        >
                                            {
                                                type.document_name
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                            {errors.docType && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.docType
                                    }
                                </p>
                            )}

                        </div>

                        {/* Date */}

                        <div>

                            <label
                                htmlFor="date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Date
                            </label>

                            <input
                                id="date"
                                type="date"
                                value={
                                    data.date
                                }
                                onChange={(e) =>
                                    setData(
                                        'date',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.date}
                                </p>
                            )}

                        </div>

                        {/* Soft Copy */}

                        <div>

                            <label
                                htmlFor="soft_copy"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Soft Copy
                            </label>

                            <textarea
                                id="soft_copy"
                                rows={3}
                                value={
                                    data.soft_copy
                                }
                                onChange={(e) =>
                                    setData(
                                        'soft_copy',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter soft copy information"
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                        </div>

                        {/* Attachment */}

                        <div>

                            <label
                                htmlFor="attachment"
                                className="block text-sm font-medium text-gray-700"
                            >
                                PDF Attachment
                            </label>

                            <input
                                id="attachment"
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(e) =>
                                    setData(
                                        'attachment',
                                        e.target.files?.[0] ??
                                            null
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 text-sm shadow-sm"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                PDF only. Maximum 10 MB.
                            </p>

                            {errors.attachment && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.attachment
                                    }
                                </p>
                            )}

                        </div>

                        {/* Status */}

                        <div>

                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>

                            <select
                                id="status"
                                value={
                                    data.status
                                }
                                onChange={(e) =>
                                    setData(
                                        'status',
                                        e.target.value as
                                            | 'Active'
                                            | 'Inactive'
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >

                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>

                            </select>

                        </div>

                        {/* Buttons */}

                        <div className="flex items-center justify-end gap-3 pt-2">

                            <Link
                                href={
                                    DocumentController
                                        .index()
                                        .url
                                }
                                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Saving...'
                                    : 'Save'}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href:
                DocumentController
                    .index()
                    .url,
        },
        {
            title: 'New',
            href:
                DocumentController
                    .create()
                    .url,
        },
    ],
};