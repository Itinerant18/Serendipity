const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('addresses')
            .select('*')
            .eq('user_id', req.user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            full_name,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            phone,
            is_default
        } = req.body;

        // If this is set as default, unset other defaults first
        if (is_default) {
            await supabaseAdmin
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', req.user.id);
        }

        const { data, error } = await supabaseAdmin
            .from('addresses')
            .insert({
                user_id: req.user.id,
                full_name,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                country,
                phone,
                is_default: is_default || false
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding address:', error);
            throw error;
        }
        res.status(201).json(data);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Failed to add address' });
    }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const {
            full_name,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            phone,
            is_default
        } = req.body;

        // If this is set as default, unset other defaults first
        if (is_default) {
            await supabaseAdmin
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', req.user.id);
        }

        const { data, error } = await supabaseAdmin
            .from('addresses')
            .update({
                full_name,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                country,
                phone,
                is_default
            })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Failed to update address' });
    }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('addresses')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Address deleted' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
});

// @desc    Set address as default
// @route   POST /api/addresses/:id/set-default
// @access  Private
router.post('/:id/set-default', protect, async (req, res) => {
    try {
        // First, unset all defaults
        await supabaseAdmin
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', req.user.id);

        // Set this address as default
        const { data, error } = await supabaseAdmin
            .from('addresses')
            .update({ is_default: true })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({ message: 'Failed to set default address' });
    }
});

module.exports = router;
