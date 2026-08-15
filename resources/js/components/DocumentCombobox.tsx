import { useEffect, useRef, useState } from 'react';

interface Document {
    docId: number;
    title: string;
}

interface DocumentComboboxProps {
    id?: string;
    documents: Document[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function DocumentCombobox({
    id,
    documents,
    value,
    onChange,
    error,
}: DocumentComboboxProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = documents.find(
        (d) => String(d.docId) === String(value),
    );

    useEffect(() => {
        setQuery(selected ? selected.title : '');
    }, [selected]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery(selected ? selected.title : '');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [selected]);

    const filtered = documents.filter((d) =>
        d.title.toLowerCase().includes(query.toLowerCase()),
    );

    function handleSelect(d: Document) {
        onChange(String(d.docId));
        setQuery(d.title);
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
                placeholder="Search document title and select"
                autoComplete="off"
                className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm 
                px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            />

            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-sm 
                border border-gray-200 bg-white py-1 text-sm shadow-lg">
                    {filtered.map((d) => (
                        <li
                            key={d.docId}
                            onClick={() => handleSelect(d)}
                            className={
                                'cursor-pointer px-3 py-2 hover:bg-indigo-50 ' +
                                (String(d.docId) === String(value)
                                    ? 'bg-indigo-100 font-medium text-indigo-700'
                                    : 'text-gray-700')
                            }
                        >
                            {d.title}
                        </li>
                    ))}
                </ul>
            )}

            {open && filtered.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-gray-200 
                bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No document found.
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}