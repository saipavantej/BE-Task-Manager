import { Request, Response } from "express";
import { transporter } from "../config/sendEmail";

const User = require("../modals/UserModal");
const generateToken = require("../config/token");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");

const registerUser = async (req: Request, res: Response) => {
  if (!req.body.user_name || !req.body.email_id || !req.body.password) {
    res.status(400).send({ message: "fields missing" });
  } else {
    const userExists = await User.findOne({ email_id: req.body.email_id });
    if (userExists) {
      res.status(400).send({ error: true, message: "user already exists" });
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
          .status(400)
          .send({ error: true, message: "the user cannot be created!" });
      res.status(200).send({
        error: false,
        response: {
          username: user.user_name,
          picture: user.picture,
          email_id: user.email_id,
        },
        token: generateToken(user._id, user.email_id),
      });
    }
  }
};

const loginUser = async (req: Request, res: Response) => {
  let user = await User.findOne({ email_id: req.body.email_id });
  if (!user) {
    return res.status(400).send({ error: true, message: "user not found" });
  }

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.status(200).send({
      error: false,
      response: {
        id: user._id,
        username: user.user_name,
        picture: user.picture,
        email_id: user.email_id,
      },
      token: generateToken(user._id, user.email_id),
    });
  } else {
    res.status(200).send({ error: true, message: "password is incorrect" });
  }
};

const editProfile = async (req: Request, res: Response) => {
  try {
    const { user_id, user_name } = req.body;
    const updatedUser = {
      user_name,
    };

    const user = await User.findOneAndUpdate({ _id: user_id }, updatedUser, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgetPassword = async (req: Request, res: Response) => {
  let user = await User.findOne({ email_id: req.body.email_id });
  if (!user) {
    return res.status(400).send({ error: true, message: "user not found" });
  } else {
    const secret = await speakeasy.generateSecret({ length: 20 }).base32;

    await User.findOneAndUpdate(
      { email_id: req.body.email_id },
      { secret: secret },
      {
        new: true,
      }
    );

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
        res.status(200).send({
          error: true,
          message: `something went wrong while sending otp through email`,
        });
      }
    });
    res
      .status(200)
      .send({ error: false, message: `otp sent to ${user.email_id}` });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  if (!req.body.email_id || !req.body.otp || !req.body.password) {
    res.status(400).send({ message: "fields missing" });
  } else {
    let user = await User.findOne({ email_id: req.body.email_id });
    if (!user) {
      return res.status(400).send({ error: true, message: "user not found" });
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
          { email_id: user.req.body.email_id },
          { password: bcrypt.hashSync(req.body.password, 10) },
          {
            new: true,
          }
        );
        return res
          .status(200)
          .send({ error: false, message: "password reset succesfull" });
      } else {
        return res.status(401).send({ error: true, message: "Invalid OTP" });
      }
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  editProfile,
  forgetPassword,
  resetPassword,
};
