import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DateTypeController from '@/actions/App/Http/Controllers/DateTypeController';

interface DateType {
    dateTypeId: number;
    dateTypeName: string;
    status: 'Active' | 'Inactive';
}

interface Props {
    dateType: DateType;
}

export default function Edit({ dateType }: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        dateTypeName: dateType.dateTypeName,
        status: dateType.status,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        put(
            DateTypeController.update(dateType.dateTypeId).url
        );
    }

    return (
        <>
            <Head title="Edit Date Type" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                <div className="mx-auto w-full max-w-xl">

                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Date Type
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the date type details.
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
                                htmlFor="dateTypeName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="dateTypeName"
                                type="text"
                                value={data.dateTypeName}
                                onChange={(e) =>
                                    setData(
                                        'dateTypeName',
                                        e.target.value
                                    )
                                }
                                placeholder="Enter date type name"
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                autoFocus
                            />

                            {errors.dateTypeName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.dateTypeName}
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
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
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
                                href={DateTypeController.index().url}
                                className="text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-sm bg-indigo-600 px-4 py-2 text-sm font-medium text-white 
                                shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Updating...' : 'Update'}
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
            title: 'Date Types',
            href: DateTypeController.index().url,
        },
        {
            title: 'Edit',
            href: DateTypeController.index().url,
        },
    ],
};