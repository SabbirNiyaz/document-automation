import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PartyMasterController from '@/actions/App/Http/Controllers/PartyMasterController';

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
}

interface PartyMaster {
    partyId: number;
    partyName: string;
    address: string;
    partyTypeId: number;
    contactPerson: string;
    phone: string;
    email: string;
    status: 'Active' | 'Inactive';
}

interface Props {
    partyMaster: PartyMaster;
    partyTypes: PartyType[];
}

export default function Edit({
    partyMaster,
    partyTypes,
}: Props) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        partyName: partyMaster.partyName,
        address: partyMaster.address,
        partyTypeId: String(
            partyMaster.partyTypeId
        ),
        contactPerson: partyMaster.contactPerson,
        phone: partyMaster.phone,
        email: partyMaster.email,
        status: partyMaster.status,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        put(
            PartyMasterController.update(
                partyMaster.partyId
            ).url
        );
    }

    return (
        <>
            <Head title="Edit Party" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-sm p-4">

                <div className="mx-auto w-full max-w-2xl">

                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Party
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Update the party information.
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-5 rounded-sm border border-sidebar-border/70 bg-white p-6 shadow-sm"
                    >

                        {/* Party Name */}
                        <div>
                            <label
                                htmlFor="partyName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Party Name
                            </label>

                            <input
                                id="partyName"
                                type="text"
                                value={data.partyName}
                                onChange={(e) =>
                                    setData(
                                        'partyName',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                autoFocus
                            />

                            {errors.partyName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.partyName}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Address
                            </label>

                            <input
                                id="address"
                                type="text"
                                value={data.address}
                                onChange={(e) =>
                                    setData(
                                        'address',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Party Type */}
                        <div>
                            <label
                                htmlFor="partyTypeId"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Party Type
                            </label>

                            <select
                                id="partyTypeId"
                                value={data.partyTypeId}
                                onChange={(e) =>
                                    setData(
                                        'partyTypeId',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full cursor-pointer rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">
                                    Select Party Type
                                </option>

                                {partyTypes.map((partyType) => (
                                    <option
                                        key={partyType.partyTypeId}
                                        value={partyType.partyTypeId}
                                    >
                                        {partyType.partyTypeName}
                                    </option>
                                ))}
                            </select>

                            {errors.partyTypeId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.partyTypeId}
                                </p>
                            )}
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label
                                htmlFor="contactPerson"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Contact Person
                            </label>

                            <input
                                id="contactPerson"
                                type="text"
                                value={data.contactPerson}
                                onChange={(e) =>
                                    setData(
                                        'contactPerson',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.contactPerson && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.contactPerson}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Phone
                            </label>

                            <input
                                id="phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData(
                                        'phone',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData(
                                        'email',
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-full rounded-sm border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">

                            <Link
                                href={
                                    PartyMasterController.index().url
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
            title: 'Party Masters',
            href: PartyMasterController.index().url,
        },
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
