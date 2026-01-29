import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

const AddressModal = ({ onClose, onAddressAdded }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newAddress = await apiRequest('/api/addresses', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            toast.success("Address added successfully");
            onAddressAdded(newAddress);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to add address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id="add_address_modal" className="modal modal-bottom sm:modal-middle bg-transparent backdrop:bg-black/50">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

                <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0_0_#000] max-h-[90vh] overflow-y-auto z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b-4 border-black bg-blue-100 pb-4">
                        <h3 className="font-playfair text-2xl font-bold">Add New Address</h3>
                        <button type="button" onClick={onClose} className="p-1 hover:bg-white border-2 border-transparent hover:border-black transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                        <div>
                            <label className="block text-sm font-bold uppercase mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-1">Address Line 1</label>
                            <input
                                type="text"
                                name="address_line1"
                                required
                                value={formData.address_line1}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                placeholder="Street address, P.O. box"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-1">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                placeholder="Apartment, suite, unit, etc."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    required
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-1">State / Province</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-black focus:bg-yellow-50 focus:border-black focus:outline-none"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                name="is_default"
                                id="is_default"
                                checked={formData.is_default}
                                onChange={handleChange}
                                className="w-5 h-5 border-2 border-black rounded-none checked:bg-black focus:ring-0"
                            />
                            <label htmlFor="is_default" className="text-sm font-bold select-none cursor-pointer">
                                Set as default address
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t-2 border-black mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 font-bold border-2 border-transparent hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-yellow-400 hover:text-black hover:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Address"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default AddressModal;
