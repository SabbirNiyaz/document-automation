import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PartyTypeController from '@/actions/App/Http/Controllers/PartyTypeController';

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
    status: 'Active' | 'Inactive';
}

interface Props {
    partyType: PartyType;
}

export default function Edit({ partyType }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        partyTypeName: partyType.partyTypeName,
        status: partyType.status,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        put(
            PartyTypeController.update(
                partyType.partyTypeId
            ).url
        );
    }

    return (
        <>
            <Head title="Edit Party Type" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">
                <div className="mx-auto w-full max-w-xl">

                    {/* Page Header */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Party Type
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the party type information.
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border"
                    >
                        {/* Party Type Name */}
                        <div>
                            <label
                                htmlFor="partyTypeName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="partyTypeName"
                                type="text"
                                value={data.partyTypeName}
                                onChange={(e) =>
                                    setData(
                                        'partyTypeName',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                autoFocus
                            />

                            {errors.partyTypeName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.partyTypeName}
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
                                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
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
                                href={PartyTypeController.index().url}
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

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Party Types',
            href: PartyTypeController.index().url,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};