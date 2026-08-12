import { useEffect, useRef, useState } from 'react';

interface DocumentType {
    document_id: number;
    document_name: string;
}

interface DocumentTypeComboboxProps {
    id?: string;
    documentTypes: DocumentType[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function DocumentTypeCombobox({
    id,
    documentTypes,
    value,
    onChange,
    error,
}: DocumentTypeComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = documentTypes.find(
        (dt) => String(dt.document_id) === String(value),
    );

    // Keep the visible input text in sync with the selected value
    useEffect(() => {
        setQuery(selected ? selected.document_name : '');
    }, [selected]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery(selected ? selected.document_name : '');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);

    const filtered = documentTypes.filter((dt) =>
        dt.document_name.toLowerCase().includes(query.toLowerCase()),
    );

    function handleSelect(dt: DocumentType) {
        onChange(String(dt.document_id));
        setQuery(dt.document_name);
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
                placeholder="Search document type..."
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm 
                border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {filtered.map((dt) => (
                        <li
                            key={dt.document_id}
                            onClick={() => handleSelect(dt)}
                            className={
                                'cursor-pointer px-3 py-2 hover:bg-indigo-50 ' +
                                (String(dt.document_id) === String(value)
                                    ? 'bg-indigo-100 font-medium text-indigo-700'
                                    : 'text-gray-700')
                            }
                        >
                            {dt.document_name}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-gray-200 
                bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No document type found.
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}