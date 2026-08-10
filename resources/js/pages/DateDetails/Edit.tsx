import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DateDetailController from '@/actions/App/Http/Controllers/DateDetailController';

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
    docId: number;
    date_value: string;
    status: 'Active' | 'Inactive';
}

interface Props {
    dateDetail: DateDetail;
    dateTypes: DateType[];
    documents: Document[];
}

export default function Edit({
    dateDetail,
    dateTypes,
    documents,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        dateTypeId:
            String(dateDetail.dateTypeId),

        docId:
            String(dateDetail.docId),

        date_value:
            dateDetail.date_value,

        status:
            dateDetail.status,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        put(
            DateDetailController.update(
                dateDetail.id
            ).url
        );
    }

    return (
        <>
            <Head title="Edit Date Detail" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">
                <div className="mx-auto w-full max-w-xl">

                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Date Detail
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the date detail.
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border border-sidebar-border/70 bg-white p-6 shadow-sm"
                    >

                        {/* Date Type */}
                        <div>
                            <label
                                htmlFor="dateTypeId"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Date Type
                            </label>

                            <select
                                id="dateTypeId"
                                value={
                                    data.dateTypeId
                                }
                                onChange={(e) =>
                                    setData(
                                        'dateTypeId',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">
                                    Select Date Type
                                </option>

                                {dateTypes.map(
                                    (dateType) => (
                                        <option
                                            key={
                                                dateType.dateTypeId
                                            }
                                            value={
                                                dateType.dateTypeId
                                            }
                                        >
                                            {
                                                dateType.dateTypeName
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.dateTypeId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.dateTypeId
                                    }
                                </p>
                            )}
                        </div>

                        {/* Document Title */}
                        <div>
                            <label
                                htmlFor="docId"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Document Title
                            </label>

                            <select
                                id="docId"
                                value={data.docId}
                                onChange={(e) =>
                                    setData(
                                        'docId',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">
                                    Select Document
                                </option>

                                {documents.map(
                                    (document) => (
                                        <option
                                            key={
                                                document.docId
                                            }
                                            value={
                                                document.docId
                                            }
                                        >
                                            {
                                                document.title
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {errors.docId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.docId}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label
                                htmlFor="date_value"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Date
                            </label>

                            <input
                                id="date_value"
                                type="date"
                                value={
                                    data.date_value
                                }
                                onChange={(e) =>
                                    setData(
                                        'date_value',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.date_value && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors.date_value
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
                                value={data.status}
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
                                    DateDetailController.index()
                                        .url
                                }
                                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            title: 'Date Details',
            href: DateDetailController.index()
                .url,
        },
        {
            title: 'Edit',
            href: DateDetailController.index()
                .url,
        },
    ],
};