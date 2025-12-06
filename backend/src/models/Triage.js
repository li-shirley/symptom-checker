import mongoose from "mongoose";

const TriageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        diagnosisCommon: {
            type: String,
            required: true,
        },

        diagnosisMedical: {
            type: String,
            required: false,
        },

        probability: {
            type: Number, // decimal to represent percentage
            min: 0,
            max: 1,
        },

        symptoms: {
            type: [String],
            default: [],
        },

        notes: {
            type: String,
            default: "",
        },

    },
    { timestamps: true }   // adds createdAt & updatedAt
);

export default mongoose.model("Triage", TriageSchema);