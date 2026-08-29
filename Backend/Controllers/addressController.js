import AddressModel from "../Models/AddressModel.js";
import UserModel from "../Models/UserModel.js";

// ADD NEW ADDRESS
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, street, city, state, zipcode, country, isDefault, mapDetails } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !street || !city || !state || !zipcode || !country) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await AddressModel.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new AddressModel({
      userId,
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      country,
      isDefault: isDefault || false,
      mapDetails: mapDetails || {
        latitude: null,
        longitude: null,
        landmark: "",
        instructions: "",
      },
    });

    await newAddress.save();
    return res.json({ success: true, message: "Address added", address: newAddress });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL ADDRESSES FOR USER
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return res.json({ success: true, addresses });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET DEFAULT ADDRESS
const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const address = await AddressModel.findOne({ userId, isDefault: true });
    if (!address) {
      return res.json({ success: true, address: null, message: "No default address" });
    }
    return res.json({ success: true, address });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET ADDRESS BY ID
const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const address = await AddressModel.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    return res.json({ success: true, address });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;
    const { firstName, lastName, email, phone, street, city, state, zipcode, country, isDefault, mapDetails } = req.body;

    // Verify address belongs to user
    const address = await AddressModel.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If setting as default, remove default from other addresses
    if (isDefault && !address.isDefault) {
      await AddressModel.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      addressId,
      {
        firstName: firstName || address.firstName,
        lastName: lastName || address.lastName,
        email: email || address.email,
        phone: phone || address.phone,
        street: street || address.street,
        city: city || address.city,
        state: state || address.state,
        zipcode: zipcode || address.zipcode,
        country: country || address.country,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
        mapDetails: mapDetails || address.mapDetails,
      },
      { new: true }
    );

    return res.json({ success: true, message: "Address updated", address: updatedAddress });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const address = await AddressModel.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await AddressModel.findByIdAndDelete(addressId);

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const firstAddress = await AddressModel.findOne({ userId });
      if (firstAddress) {
        await AddressModel.findByIdAndUpdate(firstAddress._id, { isDefault: true });
      }
    }

    return res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// SET DEFAULT ADDRESS
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    // Verify address belongs to user
    const address = await AddressModel.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Remove default from all other addresses
    await AddressModel.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });

    // Set this as default
    const updatedAddress = await AddressModel.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });

    return res.json({ success: true, message: "Default address updated", address: updatedAddress });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export {
  addAddress,
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
