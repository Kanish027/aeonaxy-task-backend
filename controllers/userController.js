import User from "../model/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";

const resend = new Resend(process.env.RESENT_API);

const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({
        success: false,
        message: "Email already exists",
      });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res.status(401).json({
        success: false,
        message: "Username has already been taken",
      });
    }

    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password,
    });

    const result = await newUser.save();

    const response = {
      _id: result._id,
      name: result.name,
      username: result.username,
      email: result.email,
      password: result.password,
    };

    const token = await newUser.generateAuthToken();

    // Send email using Resend after user registration
    const { data, error } = await resend.emails.send({
      from: "Kanish Mohariya <onboarding@resend.dev>",
      to: [email], // Send email to the newly registered user
      subject: "Welcome to Our Platform",
      html: `<strong>Welcome, ${name}!</strong>`,
    });

    console.log(error);

    res
      .status(201)
      .cookie("token", token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
        secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
      })
      .json({
        success: true,
        message: "User Registered Successfully",
        response,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User Profile Function
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { avatar, location } = req.body;

    if (location) {
      user.location = location;
    }

    if (avatar !== null) {
      // If the user does not have an avatar, create a new entry
      if (!user.avatar) {
        user.avatar = {
          public_id: "",
          avatar_url: "",
        };
      } else {
        // If the user has an existing avatar and the new avatar is null, destroy it
        if (user.avatar.public_id && avatar === null) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
          user.avatar.public_id = ""; // Clear public_id after destroying the asset
          user.avatar.avatar_url = ""; // Clear avatar_url as well
        }
      }

      // Upload the new avatar if it is not null
      if (avatar !== null) {
        const myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "dribbble-task",
        });

        user.avatar.public_id = myCloud.public_id;
        user.avatar.avatar_url = myCloud.secure_url;
      }
    } else {
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
        user.avatar.public_id = "";
        user.avatar.avatar_url = "";
      }
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const purpose = async (req, res) => {
  try {
    const { purpose } = req.body;
    const userId = req.user._id; // Assuming you have authenticated the user and have access to their ID

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Push the new purpose value into the user's purpose array
    user.purpose.push(purpose);

    await user.save();

    res.status(200).json({
      success: true,
      message: "User purpose added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  // Clear the authentication token cookie
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

export { createUser, getUserProfile, editProfile, purpose, logoutUser };
