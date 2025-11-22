import ocrWeightModel from "../models/ocrWeightModel.js";

export const submitOcrWeight = async (req, res) => {
  try {
    const { weight, imageUri, timestamp, rawOcrText } = req.body;

    if (!weight) {
      return res.json({
        success: false,
        message: "Weight is required"
      });
    }

    const ocrData = new ocrWeightModel({
      weight,
      imageUri,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      rawOcrText,
      submittedBy: req.userId || null
    });

    await ocrData.save();

    return res.json({
      success: true,
      message: "Weight data saved successfully",
      data: ocrData
    });

  } catch (error) {
    console.log("Error in submitOcrWeight Controller:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const getAllOcrWeights = async (req, res) => {
  try {
    const weights = await ocrWeightModel
      .find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      success: true,
      count: weights.length,
      weights
    });

  } catch (error) {
    console.log("Error in getAllOcrWeights Controller:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

export const deleteOcrWeight = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWeight = await ocrWeightModel.findByIdAndDelete(id);

    if (!deletedWeight) {
      return res.json({
        success: false,
        message: "Weight record not found"
      });
    }

    return res.json({
      success: true,
      message: "Weight record deleted successfully"
    });

  } catch (error) {
    console.log("Error in deleteOcrWeight Controller:", error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};