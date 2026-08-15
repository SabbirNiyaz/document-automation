import { useEffect, useRef, useState } from 'react';

interface Party {
    partyId: number;
    partyName: string;
}

interface PartyComboboxProps {
    id?: string;
    parties: Party[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function PartyCombobox({
    id,
    parties,
    value,
    onChange,
    error,
}: PartyComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = parties.find(
        (p) => String(p.partyId) === String(value),
    );

    // Keep the visible input text in sync with the selected value
    useEffect(() => {
        setQuery(selected ? selected.partyName : '');
    }, [selected]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery(selected ? selected.partyName : '');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);

    const filtered = parties.filter((p) =>
        p.partyName.toLowerCase().includes(query.toLowerCase()),
    );

    function handleSelect(p: Party) {
        onChange(String(p.partyId));
        setQuery(p.partyName);
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
                placeholder="Search party and select"
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm 
                border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {filtered.map((p) => (
                        <li
                            key={p.partyId}
                            onClick={() => handleSelect(p)}
                            className={
                                'cursor-pointer px-3 py-2 hover:bg-indigo-50 ' +
                                (String(p.partyId) === String(value)
                                    ? 'bg-indigo-100 font-medium text-indigo-700'
                                    : 'text-gray-700')
                            }
                        >
                            {p.partyName}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-gray-200 
                bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No party found.
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}