import { Request, Response } from "express";
import { transporter } from "../config/sendEmail";
const jwt = require("jsonwebtoken");
const User = require("../modals/UserModal");
const generateToken = require("../config/token");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");

const registerUser = async (req: Request, res: Response) => {
  try {
    if (!req.body.user_name || !req.body.email_id || !req.body.password) {
      res.status(200).send({ error: true, message: "fields missing" });
    } else {
      const userExists = await User.findOne({ email_id: req.body.email_id });
      if (userExists) {
        res.status(200).send({ error: true, message: "user already exists" });
      } else {
        let user = await User({
          user_name: req.body.user_name,
          password: bcrypt.hashSync(req.body.password, 10),
          picture: req.body.picture,
          email_id: req.body.email_id,
        });
        await user.save();
        if (!user)
          return res
            .status(200)
            .send({ error: true, message: "the user cannot be created!" });
        res.status(200).send({
          error: false,
          response: {
            user_id: user._id,
            username: user.user_name,
            picture: user.picture,
            email_id: user.email_id,
          },
          token: generateToken(user._id, user.email_id),
        });
      }
    }
  } catch (error) {
    res.status(200).send({ error: true, message: "Internal Server Error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ email_id: req.body.email_id });
    if (!user) {
      return res.status(200).send({ error: true, message: "user not found" });
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.status(200).send({
        error: false,
        response: {
          user_id: user._id,
          username: user.user_name,
          picture: user.picture,
          email_id: user.email_id,
        },
        token: generateToken(user._id, user.email_id),
      });
    } else {
      res.status(200).send({ error: true, message: "password is incorrect" });
    }
  } catch (error) {
    res.status(200).send({ error: true, message: "Internal Server Error" });
  }
};

const editProfile = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user_name, picture } = req.body;
    const updatedUser = { user_name, picture };
    const user = await User.findOneAndUpdate({ _id: decoded.id }, updatedUser, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(200).send({ error: true, message: "User not found" });
    }

    res.status(200).send({
      error: false,
      response: {
        user_id: user._id,
        username: user.user_name,
        picture: user.picture,
        email_id: user.email_id,
      },
    });
  } catch (error) {
    res.status(200).send({ error: true, message: "Internal Server Error" });
  }
};
const forgetPassword = async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ email_id: req.body.email_id });
    if (!user) {
      return res.status(200).send({ error: true, message: "user not found" });
    }
    const secret = await speakeasy.generateSecret({ length: 20 }).base32;
    const otp = speakeasy.totp({
      secret,
      encoding: "base32",
      step: 300,
      digits: 4,
    });

    const mailOptions = {
      from: "marketspace130@gmail.com",
      to: user.email_id,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        return res.status(200).send({
          error: true,
          message: `something went wrong while sending otp through email ${error}`,
        });
      }
      User.findOneAndUpdate(
        { email_id: req.body.email_id },
        { secret: secret },
        { new: true }
      )
        .then(() => {
          res.status(200).send({
            error: false,
            message: `otp sent to ${user.email_id}`,
          });
        })
        .catch((updateError: any) => {
          console.error(updateError);
          res
            .status(200)
            .send({ error: true, message: "Internal Server Error" });
        });
    });
  } catch (error) {
    res.status(200).send({ error: true, message: "Internal Server Error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id || !req.body.otp || !req.body.password) {
      res.status(200).send({ message: "fields missing" });
    } else {
      let user = await User.findOne({ email_id: req.body.email_id });
      if (!user) {
        return res.status(200).send({ error: true, message: "user not found" });
      } else {
        const verified = speakeasy.totp.verify({
          secret: user.secret,
          encoding: "base32",
          digits: 4,
          step: 300,
          token: req.body.otp,
        });
        if (verified) {
          await User.findOneAndUpdate(
            { email_id: req.body.email_id },
            { password: bcrypt.hashSync(req.body.password, 10) },
            {
              new: true,
            }
          );
          return res
            .status(200)
            .send({ error: false, message: "password reset succesfull" });
        } else {
          return res.status(200).send({ error: true, message: "Invalid OTP" });
        }
      }
    }
  } catch (error) {
    res.status(200).send({ error: true, message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  editProfile,
  forgetPassword,
  resetPassword,
};
