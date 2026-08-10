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

interface DocumentItem {
    docId: number;
    title: string;
    description: string | null;
    partyName: number;
    docType: number;
    date: string;
    soft_copy: string | null;
    status: 'Active' | 'Inactive';
    attachment: string | null;
}

interface Props {
    document: DocumentItem;
    parties: Party[];
    documentTypes: DocumentType[];
}

export default function Edit({
    document,
    parties,
    documentTypes,
}: Props) {

    const {
        data,
        setData,
        post,
        processing,
        errors,
        transform,
    } = useForm({
        title: document.title,
        description:
            document.description ?? '',
        partyName:
            String(document.partyName),
        docType:
            String(document.docType),
        date: document.date,
        soft_copy:
            document.soft_copy ?? '',
        status: document.status,
        attachment: null as File | null,
        _method: 'PUT',
    });

    function submit(
        e: FormEvent
    ) {

        e.preventDefault();

        // Strip attachment key entirely when no new file was chosen,
        // so the backend never receives a null/empty value that could
        // overwrite the existing PDF path.
        transform((formData) => {
            if (!formData.attachment) {
                const { attachment, ...rest } = formData;
                return rest;
            }
            return formData;
        });

        post(
            DocumentController.update(
                document.docId
            ).url,
            {
                forceFormData: true,
            }
        );
    }

    return (
        <>
            <Head title="Edit Document" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                <div className="mx-auto w-full max-w-2xl">

                    <div>

                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Document
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update document information.
                        </p>

                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border bg-white p-6 shadow-sm"
                    >

                        {/* Title */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>

                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData(
                                        'title',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm"
                            />

                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}

                        </div>

                        {/* Description */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>

                            <textarea
                                rows={4}
                                value={data.description}
                                onChange={(e) =>
                                    setData(
                                        'description',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm"
                            />

                        </div>

                        {/* Party */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700">
                                Party
                            </label>

                            <select
                                value={
                                    data.partyName
                                }
                                onChange={(e) =>
                                    setData(
                                        'partyName',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm"
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

                            <label className="block text-sm font-medium text-gray-700">
                                Document Type
                            </label>

                            <select
                                value={
                                    data.docType
                                }
                                onChange={(e) =>
                                    setData(
                                        'docType',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm"
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

                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>

                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) =>
                                    setData(
                                        'date',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm"
                            />

                            {errors.date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.date}
                                </p>
                            )}

                        </div>

                        {/* Soft Copy */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700">
                                Soft Copy
                            </label>

                            <textarea
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
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm"
                            />

                        </div>

                        {/* Existing PDF */}

                        {document.attachment && (

                            <div className="rounded-sm bg-gray-50 p-3">

                                <p className="text-sm text-gray-600">
                                    Existing attachment
                                </p>

                                <a
                                    href={
                                        DocumentController
                                            .viewAttachment(
                                                document.docId
                                            ).url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
                                >
                                    View Current PDF
                                </a>

                            </div>

                        )}

                        {/* New PDF */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700">
                                Replace PDF
                            </label>

                            <input
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
                                Leave empty to keep the current PDF.
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

                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
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
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm"
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
                                    ? 'Updating...'
                                    : 'Update'}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Documents',
            href:
                DocumentController
                    .index()
                    .url,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};