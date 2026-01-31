"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * ValidationPreviewTable - Shows validation status of CSV rows before upload
 * 
 * Props:
 * - data: Array of parsed CSV rows with validation status
 *   Each row: { ...csvData, _validation: { status: 'valid'|'warning'|'error', message?: string } }
 * - onSelectionChange: Callback when row selection changes
 * - selectedRows: Set of selected row indices
 */
export default function ValidationPreviewTable({
    data = [],
    onSelectionChange,
    selectedRows = new Set(),
    columns = ['name', 'price', 'category', 'stock'],
}) {
    const [filter, setFilter] = useState('all'); // 'all', 'valid', 'warning', 'error'

    // Calculate stats
    const stats = useMemo(() => {
        const valid = data.filter(row => row._validation?.status === 'valid').length;
        const warning = data.filter(row => row._validation?.status === 'warning').length;
        const error = data.filter(row => row._validation?.status === 'error').length;
        return { valid, warning, error, total: data.length };
    }, [data]);

    // Filter data based on current filter
    const filteredData = useMemo(() => {
        if (filter === 'all') return data;
        return data.filter(row => row._validation?.status === filter);
    }, [data, filter]);

    // Status icon component
    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'valid':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-400" />;
        }
    };

    // Status row background
    const getRowBg = (status) => {
        switch (status) {
            case 'valid':
                return 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30';
            case 'warning':
                return 'bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-50 dark:hover:bg-yellow-950/30';
            case 'error':
                return 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30';
            default:
                return '';
        }
    };

    // Toggle row selection
    const toggleRow = (index) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        onSelectionChange?.(newSelection);
    };

    // Select all valid rows
    const selectAllValid = () => {
        const validIndices = new Set(
            data
                .map((row, i) => (row._validation?.status !== 'error' ? i : null))
                .filter(i => i !== null)
        );
        onSelectionChange?.(validIndices);
    };

    // Deselect all
    const deselectAll = () => {
        onSelectionChange?.(new Set());
    };

    return (
        <div className="space-y-3">
            {/* Stats Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setFilter('all')}
                        >
                            All ({stats.total})
                        </Button>
                        <Button
                            variant={filter === 'valid' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setFilter('valid')}
                        >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valid ({stats.valid})
                        </Button>
                        <Button
                            variant={filter === 'warning' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setFilter('warning')}
                        >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Skip ({stats.warning})
                        </Button>
                        <Button
                            variant={filter === 'error' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setFilter('error')}
                        >
                            <XCircle className="h-3 w-3 mr-1" />
                            Error ({stats.error})
                        </Button>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllValid}>
                        Select Valid
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={deselectAll}>
                        Deselect All
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {selectedRows.size} selected for upload
                </Badge>
                {stats.warning > 0 && (
                    <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-3 w-3" />
                        {stats.warning} duplicates will be skipped
                    </Badge>
                )}
                {stats.error > 0 && (
                    <Badge variant="outline" className="gap-1 border-red-300 text-red-600 dark:text-red-400">
                        <XCircle className="h-3 w-3" />
                        {stats.error} rows have errors
                    </Badge>
                )}
            </div>

            {/* Table */}
            <ScrollArea className="border rounded-lg max-h-[350px]">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                            <TableHead className="w-10">
                                <span className="sr-only">Select</span>
                            </TableHead>
                            <TableHead className="w-10">Status</TableHead>
                            <TableHead className="w-10">#</TableHead>
                            {columns.map(col => (
                                <TableHead key={col} className="text-xs uppercase font-semibold">
                                    {col}
                                </TableHead>
                            ))}
                            <TableHead className="min-w-[150px]">Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((row, i) => {
                            const originalIndex = data.indexOf(row);
                            const status = row._validation?.status || 'valid';
                            const message = row._validation?.message || '';
                            const isSelected = selectedRows.has(originalIndex);
                            const isError = status === 'error';

                            return (
                                <TableRow
                                    key={originalIndex}
                                    className={`${getRowBg(status)} ${isError ? 'opacity-60' : ''} cursor-pointer transition-colors`}
                                    onClick={() => !isError && toggleRow(originalIndex)}
                                >
                                    <TableCell className="p-2">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={isError}
                                            onCheckedChange={() => toggleRow(originalIndex)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    <TableCell className="p-2">
                                        <StatusIcon status={status} />
                                    </TableCell>
                                    <TableCell className="p-2 text-xs text-muted-foreground">
                                        {originalIndex + 1}
                                    </TableCell>
                                    {columns.map(col => (
                                        <TableCell key={col} className="text-xs max-w-[150px] truncate p-2">
                                            {row[col] ?? '-'}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-xs p-2">
                                        {message && (
                                            <span className={`${status === 'error' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                {message}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
