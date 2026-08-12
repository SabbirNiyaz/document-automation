import { useEffect, useRef, useState } from 'react';

interface PartyType {
    partyTypeId: number;
    partyTypeName: string;
}

interface PartyTypeComboboxProps {
    id: string;
    partyTypes: PartyType[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function PartyTypeCombobox({
    id,
    partyTypes,
    value,
    onChange,
    error,
}: PartyTypeComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = partyTypes.find(
        (pt) => String(pt.partyTypeId) === String(value),
    );

    // Keep the visible input text in sync with the selected value
    useEffect(() => {
        setQuery(selected ? selected.partyTypeName : '');
    }, [selected]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                // revert text if nothing valid was chosen
                setQuery(selected ? selected.partyTypeName : '');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);

    const filtered = partyTypes.filter((pt) =>
        pt.partyTypeName.toLowerCase().includes(query.toLowerCase()),
    );

    function handleSelect(pt: PartyType) {
        onChange(String(pt.partyTypeId));
        setQuery(pt.partyTypeName);
        setOpen(false);
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                id={id}
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (e.target.value === '') {
                        onChange('');
                    }
                }}
                onFocus={() => setOpen(true)}
                placeholder="Search party type..."
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm 
                border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {filtered.map((pt) => (
                        <li
                            key={pt.partyTypeId}
                            onClick={() => handleSelect(pt)}
                            className={
                                'cursor-pointer px-3 py-2 hover:bg-indigo-50 ' +
                                (String(pt.partyTypeId) === String(value)
                                    ? 'bg-indigo-100 font-medium text-indigo-700'
                                    : 'text-gray-700')
                            }
                        >
                            {pt.partyTypeName}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-gray-200 
                bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No party type found.
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}