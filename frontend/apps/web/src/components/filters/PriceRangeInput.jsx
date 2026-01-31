import React, { useState } from 'react';

const PriceRangeInput = ({ min = 0, max = 500000, value = [min, max], onChange, currency = "₹" }) => {
    const [localMin, setLocalMin] = useState(value[0]);
    const [localMax, setLocalMax] = useState(value[1]);

    const presets = [
        { label: `Under ${currency}1K`, min: 0, max: 1000 },
        { label: `${currency}1K-5K`, min: 1000, max: 5000 },
        { label: `${currency}5K-10K`, min: 5000, max: 10000 },
        { label: `${currency}10K-25K`, min: 10000, max: 25000 },
        { label: `${currency}25K-50K`, min: 25000, max: 50000 },
        { label: `${currency}50K+`, min: 50000, max: max }
    ];

    const handlePreset = (preset) => {
        setLocalMin(preset.min);
        setLocalMax(preset.max);
        onChange([preset.min, preset.max]);
    };

    const handleManualChange = () => {
        onChange([localMin, localMax]);
    };

    const resetRange = () => {
        setLocalMin(min);
        setLocalMax(max);
        onChange([min, max]);
    };

    return (
        <div className="border-4 border-black bg-white p-4">
            <h4 className="font-bold text-black mb-3 uppercase text-sm">Price Range</h4>
            
            <div className="flex items-center gap-3 mb-4">
                <input
                    type="number"
                    value={localMin}
                    onChange={(e) => {
                        setLocalMin(Number(e.target.value));
                        handleManualChange();
                    }}
                    placeholder="Min"
                    className="w-full px-3 py-2 border-2 border-black font-bold text-black focus:bg-yellow-200 focus:border-black focus:outline-none"
                    aria-label="Minimum price"
                />
                <span className="font-bold text-black mx-2">-</span>
                <input
                    type="number"
                    value={localMax}
                    onChange={(e) => {
                        setLocalMax(Number(e.target.value));
                        handleManualChange();
                    }}
                    placeholder="Max"
                    className="w-full px-3 py-2 border-2 border-black font-bold text-black focus:bg-yellow-200 focus:border-black focus:outline-none"
                    aria-label="Maximum price"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {presets.map((preset, index) => (
                    <button
                        key={index}
                        onClick={() => handlePreset(preset)}
                        className="px-3 py-2 text-xs border-2 border-black font-bold transition-all duration-150 bg-white text-black hover:bg-pink-500 hover:text-white"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <button
                onClick={resetRange}
                className="w-full px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-black transition-all duration-150"
            >
                <i className="fas fa-redo mr-2"></i>
                Reset Range
            </button>
        </div>
    );
};

export default PriceRangeInput;