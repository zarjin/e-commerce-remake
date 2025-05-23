import userModel from '../models/user.models.js';

export const updateUser = async (req, res) => {
  const { phone } = req.body;
  const userId = req.user.id;

  try {
    const updateData = { phone };

    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const update = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json({ message: 'User Updated', user: update });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Update User error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.user.id;

  try {
    await userModel.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Deleted Successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'User Delete Error', error: error.message });
  }
};

export const getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userModel.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Get User Error', error: error.message });
  }
};

export const previewUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userPreview = await userModel.findById(id);
    res.status(200).json(userPreview);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Preview User Error', error: error.message });
  }
};

export const addCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  console.log(userId);

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyInCart = user.cart.some(
      (item) => item.productId.toString() === productId
    );

    if (alreadyInCart) {
      return res.status(400).json({ message: 'Product already in cart' });
    }

    user.cart.push({ productId });
    await user.save();

    return res
      .status(200)
      .json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};

export const removeCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );
    await user.save();

    return res
      .status(200)
      .json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};

export const isAdmin = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userModel.findById(userId);
    if (user && user.isAdmin) {
      return res.status(200).json({ isAdmin: true });
    } else {
      return res.status(200).json({ isAdmin: false });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Something went wrong', error: error.message });
  }
};

export const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId).populate('cart.productId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Cart retrieved successfully',
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving cart',
      error: error.message,
    });
  }
};

export const makeAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the requesting user is an admin
    const adminUser = await userModel.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Only admins can create other admins' });
    }

    // Find the user to make admin
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user to be an admin
    user.isAdmin = true;
    await user.save();

    return res.status(200).json({
      message: 'User has been made an admin successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error making user an admin',
      error: error.message,
    });
  }
};

export const createFirstAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if there are any admin users already
    const existingAdmins = await userModel.findOne({ isAdmin: true });

    if (existingAdmins) {
      return res.status(403).json({
        message:
          'Admin users already exist. This endpoint can only be used when there are no admins.',
      });
    }

    // Find the user to make admin
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user to be an admin
    user.isAdmin = true;
    await user.save();

    return res.status(200).json({
      message: 'First admin user created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error creating first admin',
      error: error.message,
    });
  }
};
