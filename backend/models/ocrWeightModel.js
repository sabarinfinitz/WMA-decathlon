import mongoose from 'mongoose';

const ocrWeightSchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: true
    },
    imageUri: {
        type: String,
        trim: true
    },
    rawOcrText: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    }
}, 
{ timestamps: true }
);

const ocrWeightModel = mongoose.models.ocrWeight || mongoose.model('ocrWeight', ocrWeightSchema);
export default ocrWeightModel;