import { FormEvent } from 'react';

import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import DocumentTypeController from '@/actions/App/Http/Controllers/DocumentTypeController';

interface DocumentType {
    document_id: number;
    document_name: string;
    status: 'Active' | 'Inactive';
}

interface Props {
    documentType: DocumentType;
}

export default function Edit({
    documentType,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        document_name:
            documentType.document_name,

        status:
            documentType.status,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        put(
            DocumentTypeController.update(
                documentType.document_id
            ).url
        );
    }

    return (
        <>
            <Head title="Edit Document Type" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                <div className="mx-auto w-full max-w-xl">

                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Document Type
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the document type details.
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border border-sidebar-border/70 bg-white p-6 shadow-sm"
                    >

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="document_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="document_name"
                                type="text"
                                value={
                                    data.document_name
                                }
                                onChange={(e) =>
                                    setData(
                                        'document_name',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter document type name"
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                autoFocus
                            />

                            {errors.document_name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.document_name
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
                                        e.target
                                            .value as
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

                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">

                            <Link
                                href={
                                    DocumentTypeController
                                        .index()
                                        .url
                                }
                                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
            title: 'Document Types',
            href: DocumentTypeController
                .index().url,
        },
        {
            title: 'Edit',
            href: DocumentTypeController
                .index().url,
        },
    ],
};