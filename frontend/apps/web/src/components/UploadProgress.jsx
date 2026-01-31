"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Upload } from "lucide-react";

/**
 * UploadProgress - A chunked upload progress component
 * 
 * Props:
 * - total: Total number of items to upload
 * - processed: Number of items processed so far
 * - succeeded: Number of successful uploads
 * - failed: Number of failed uploads
 * - skipped: Number of skipped items (duplicates)
 * - currentChunk: Current chunk number
 * - totalChunks: Total number of chunks
 * - isUploading: Whether upload is in progress
 * - errors: Array of error messages [{row: number, message: string}]
 */
export default function UploadProgress({
    total = 0,
    processed = 0,
    succeeded = 0,
    failed = 0,
    skipped = 0,
    currentChunk = 0,
    totalChunks = 0,
    isUploading = false,
    errors = [],
    onComplete,
}) {
    const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
    const isComplete = processed === total && total > 0;

    useEffect(() => {
        if (isComplete && onComplete) {
            onComplete({ succeeded, failed, skipped });
        }
    }, [isComplete, succeeded, failed, skipped, onComplete]);

    return (
        <div className="space-y-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <Upload className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="font-semibold text-sm">
                        {isComplete ? "Upload Complete" : isUploading ? "Uploading Products..." : "Ready to Upload"}
                    </span>
                </div>
                {totalChunks > 0 && (
                    <span className="text-xs text-muted-foreground">
                        Batch {currentChunk}/{totalChunks}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 drop-shadow-sm">
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-center border border-blue-200 dark:border-blue-900">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{processed}</div>
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Processed</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-center border border-green-200 dark:border-green-900">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{succeeded}</div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70">Succeeded</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-2 text-center border border-yellow-200 dark:border-yellow-900">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{skipped}</div>
                    <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">Skipped</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2 text-center border border-red-200 dark:border-red-900">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{failed}</div>
                    <div className="text-xs text-red-600/70 dark:text-red-400/70">Failed</div>
                </div>
            </div>

            {/* Errors List (if any) */}
            {errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-900">
                    <div className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.length} Error{errors.length > 1 ? "s" : ""}
                    </div>
                    {errors.slice(0, 10).map((err, i) => (
                        <div key={i} className="text-xs text-red-600/80 dark:text-red-400/80 flex items-start gap-1">
                            <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>Row {err.row}: {err.message}</span>
                        </div>
                    ))}
                    {errors.length > 10 && (
                        <div className="text-xs text-red-500 italic">
                            ...and {errors.length - 10} more errors
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
