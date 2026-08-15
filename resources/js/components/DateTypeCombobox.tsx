import { useEffect, useRef, useState } from 'react';

interface DateType {
    dateTypeId: number;
    dateTypeName: string;
}

interface DateTypeComboboxProps {
    id?: string;
    dateTypes: DateType[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function DateTypeCombobox({
    id,
    dateTypes,
    value,
    onChange,
    error,
}: DateTypeComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = dateTypes.find(
        (dt) => String(dt.dateTypeId) === String(value),
    );

    useEffect(() => {
        setQuery(selected ? selected.dateTypeName : '');
    }, [selected]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery(selected ? selected.dateTypeName : '');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);

    const filtered = dateTypes.filter((dt) =>
        dt.dateTypeName.toLowerCase().includes(query.toLowerCase()),
    );

    function handleSelect(dt: DateType) {
        onChange(String(dt.dateTypeId));
        setQuery(dt.dateTypeName);
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
                placeholder="Search date type and select"
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm 
                border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {filtered.map((dt) => (
                        <li
                            key={dt.dateTypeId}
                            onClick={() => handleSelect(dt)}
                            className={
                                'cursor-pointer px-3 py-2 hover:bg-indigo-50 ' +
                                (String(dt.dateTypeId) === String(value)
                                    ? 'bg-indigo-100 font-medium text-indigo-700'
                                    : 'text-gray-700')
                            }
                        >
                            {dt.dateTypeName}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-gray-200 
                bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No date type found.
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}