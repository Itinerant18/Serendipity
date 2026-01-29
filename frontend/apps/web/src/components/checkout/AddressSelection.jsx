import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressModal from './AddressModal';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

const AddressSelection = ({ selectedAddress, onSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            // Using /api/addresses as per fix
            const data = await apiRequest('/api/addresses');
            setAddresses(data);

            // Auto-select default if none selected
            if (!selectedAddress && data.length > 0) {
                const defaultAddr = data.find(a => a.is_default) || data[0];
                onSelect(defaultAddr);
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to load addresses"); // Suppress initial load error to avoid spam if empty
        } finally {
            setLoading(false);
        }
    };

    const handleAddressAdded = (newAddress) => {
        setAddresses(prev => [newAddress, ...prev]);
        onSelect(newAddress); // Auto-select the new address
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await apiRequest(`/api/addresses/${id}`, { method: 'DELETE' });
            setAddresses(prev => prev.filter(a => a.id !== id));
            if (selectedAddress?.id === id) onSelect(null);
            toast.success("Address deleted");
        } catch (error) {
            toast.error("Failed to delete address");
        }
    };

    return (
        <div className="space-y-6">
            {/* Render the Modal (Hidden by default until triggered) */}
            <AddressModal
                onClose={() => document.getElementById('add_address_modal').close()}
                onAddressAdded={handleAddressAdded}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Add New Button */}
                <button
                    onClick={() => document.getElementById('add_address_modal').showModal()}
                    className="min-h-[200px] flex flex-col items-center justify-center gap-4 border-4 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-yellow-400 flex items-center justify-center border-2 border-transparent group-hover:border-black transition-colors">
                        <Plus className="w-6 h-6 text-black" />
                    </div>
                    <span className="font-bold uppercase tracking-wider">Add New Address</span>
                </button>

                {addresses.map(addr => (
                    <AddressCard
                        key={addr.id}
                        address={addr}
                        isSelected={selectedAddress?.id === addr.id}
                        onSelect={onSelect}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default AddressSelection;
