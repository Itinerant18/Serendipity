import React from 'react';
import { MapPin, Phone, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const AddressCard = ({ address, isSelected, onSelect, onDelete }) => {
    return (
        <div
            onClick={() => onSelect(address)}
            className={cn(
                "relative p-6 cursor-pointer transition-all duration-200 border-4",
                isSelected
                    ? "bg-yellow-50 border-black shadow-[8px_8px_0_#000]"
                    : "bg-white border-black hover:shadow-[4px_4px_0_#000] hover:-translate-y-1"
            )}
        >
            {/* Selection Indicator */}
            <div className={cn(
                "absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-colors",
                isSelected ? "bg-black" : "bg-white"
            )}>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>

            <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 mt-1 text-black" />
                <div>
                    <h3 className="font-bold text-lg uppercase tracking-wide">{address.name}</h3>
                    {address.is_default && (
                        <span className="inline-block px-2 py-0.5 mt-1 text-xs font-bold bg-black text-white uppercase">
                            Default
                        </span>
                    )}
                </div>
            </div>

            <div className="pl-8 space-y-1 text-gray-700 font-medium">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p className="uppercase">{address.country}</p>

                {address.phone && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-dashed border-gray-300">
                        <Phone className="w-4 h-4" />
                        <span>{address.phone}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(address.id);
                }}
                className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Address"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
};

export default AddressCard;
