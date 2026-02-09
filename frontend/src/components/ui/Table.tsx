import { ReactNode } from 'react';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
    columns,
    data,
    onRowClick,
    emptyMessage = 'Không có dữ liệu',
}: TableProps<T>) {
    return (
        <table className="data-table">
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={String(col.key)} data-field={col.key}>
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="empty-message" style={{ textAlign: 'center', padding: '48px 16px' }}>
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'clickable' : ''}
                            tabIndex={onRowClick ? 0 : undefined}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && onRowClick) {
                                    onRowClick(item);
                                }
                            }}
                        >
                            {columns.map((col) => (
                                <td key={String(col.key)}>
                                    {col.render
                                        ? col.render(item)
                                        : String(item[col.key as keyof T] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
