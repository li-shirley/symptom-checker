import mongoose from "mongoose";

const triageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        diagnosisCommon: {
            type: String,
            required: false,
        },

        diagnosisMedical: {
            type: String,
            required: true,
        },

        probability: {
            type: Number, // decimal to represent percentage
            required: true,
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
            maxlength: 5000, 
            trim: true,
        }

    },
    { timestamps: true }
);

triageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Triage", triageSchema);