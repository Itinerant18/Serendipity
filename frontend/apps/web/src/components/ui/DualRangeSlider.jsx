import React, { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * DualRangeSlider
 * A custom implementation of a double-thumb slider for range selection.
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Function} onChange - Callback function(values) => void
 * @param {Array} value - [start, end] values
 */
export default function DualRangeSlider({ min, max, onChange, value, className }) {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Update state when props change
    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
    }, [value]);

    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    return (
        <div className={cn("relative w-full pb-8 pt-4", className)}>
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    minValRef.current = value;
                    onChange([value, maxVal]);
                }}
                className="thumb thumb--left"
                style={{ zIndex: minVal > max - 100 && "5" }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    maxValRef.current = value;
                    onChange([minVal, value]);
                }}
                className="thumb thumb--right"
            />

            <div className="slider">
                <div className="slider__track" />
                <div ref={range} className="slider__range" />
            </div>

            <div className="flex justify-between mt-4">
                <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm text-xs font-semibold text-gray-700">
                    ₹{minVal.toLocaleString()}
                </div>
                <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm text-xs font-semibold text-gray-700">
                    ₹{maxVal.toLocaleString()}
                </div>
            </div>

            <style>{`
        .slider {
          position: relative;
          width: 100%;
        }
        .slider__track,
        .slider__range {
          position: absolute;
          border-radius: 3px;
          height: 6px;
        }
        .slider__track {
          background-color: #E2E8F0;
          width: 100%;
          z-index: 1;
        }
        .slider__range {
          background-color: #0EA5E9; /* Sky-500 */
          z-index: 2;
        }
        .thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%; /* For full width scrolling */
          outline: none;
          z-index: 3;
        }
        .thumb--left {
          z-index: 4;
        }
        .thumb--right {
          z-index: 5;
        }
        /* Webkit */
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          border: 2px solid #FFFFFF;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background-color: #0EA5E9;
          cursor: pointer;
          pointer-events: all;
          margin-top: -7px; /* Align vertical */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
        }
        /* Firefox */
        .thumb::-moz-range-thumb {
            border: 2px solid #FFFFFF;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background-color: #0EA5E9;
            cursor: pointer;
            pointer-events: all;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
        </div>
    );
}
