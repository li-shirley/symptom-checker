import mongoose from 'mongoose';
import Triage from '../models/Triage.js';

// get all triage records for a user
export async function getAllTriages(req, res) {
    const { _id: userId } = req.user;

    try {
        const triages = await Triage.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(triages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching triage records' });
    }
};

// get one triage record for a user
export async function getOneTriage(req, res) {
    const { id } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid triage ID' });
    }

    try {
        const triage = await Triage.findOne({ _id: id, userId });

        if (!triage) {
            return res.status(404).json({ error: 'Triage record not found' });
        }

        res.status(200).json(triage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while fetching triage record' });
    }
}

// create one triage record for a user
export async function createTriage(req, res) {
    const { _id: userId } = req.user;

    try {
        const triage = await Triage.create({
            ...req.body,
            userId
        });

        res.status(201).json(triage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while creating triage record' });
    }
}

// update one triage record for a user
export async function updateTriage(req, res) {
    const { id } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid triage ID' });
    }

    try {
        const { _id, userId: bodyUserId, ...updates } = req.body;
        const updated = await Triage.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Triage record not found' });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while updating triage record' });
    }
}

// delete one triage record for a user
export async function deleteTriage(req, res) {
    const { id } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid triage ID' });
    }

    try {
        const deleted = await Triage.findOneAndDelete({ _id: id, userId });

        if (!deleted) {
            return res.status(404).json({ error: 'Triage record not found' });
        }

        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while deleting triage record' });
    }
}
