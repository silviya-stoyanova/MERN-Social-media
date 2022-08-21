const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../../middleware/auth-middleware");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

router.get("/all", async (req, res) => {
  try {
    const allProfiles = await Profile.find().populate("user", [
      "name",
      "avatar",
    ]);
    res.send(allProfiles);
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userProfile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", ["name", "avatar"]);

    if (!userProfile) {
      res.status(400).json({ message: "Profile not found." });
    }

    res.send(userProfile);
  } catch (error) {
    const isInvalidIdPassed = error.kind == "ObjectId";

    if (isInvalidIdPassed) {
      res.status(400).json({ message: "Profile not found." });
    }

    res.status(500).send(error.message);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      res
        .status(400)
        .json({ message: "This user doesn't have a profile yet." });
    }

    res.json({ profile });
  } catch ({ message }) {
    res.status(500).json({ message });
  }
});

router.post(
  "/me",
  [
    authMiddleware,
    [
      check("status", "Status is required.").notEmpty(),
      check("skills", "Skills are required.").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram,
      } = req.body;

      const newProfileData = {
        user: req.user._id,
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        social: {
          youtube,
          twitter,
          facebook,
          linkedin,
          instagram,
        },
        lastModifiedDate: Date.now(),
      };

      const existsingProfileData = await Profile.findOne({
        user: req.user._id,
      });

      if (existsingProfileData) {
        await Profile.findOneAndUpdate({ user: req.user._id }, newProfileData);
        res.send(`Updated: ${req.user.name} profile.`);
      } else {
        new Profile({
          ...newProfileData,
        }).save();

        res.send(`Added: ${req.user.name} profile.`);
      }
    } catch ({ message }) {
      res.status(500).json(message);
    }
  }
);

router.put(
  "/me/experience",
  [
    authMiddleware,
    [
      check("title", "Title is required.").notEmpty(),
      check("company", "Company is required.").notEmpty(),
      check("from", "From is required.").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }

      const experience = req.body;
      const profileData = await Profile.findOne({ user: req.user._id });
      profileData.experience.unshift(experience);
      await profileData.save();

      res.send(
        `Successfully added experience to user profile: ${req.user.name}`
      );
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
);

router.put(
  "/me/education",
  [
    authMiddleware,
    [
      check("school", "School is required.").notEmpty(),
      check("degree", "Degree is required.").notEmpty(),
      check("fieldOfStudy", "Field of study is required.").notEmpty(),
      check("from", "From is required.").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }

      const education = req.body;
      const profileData = await Profile.findOne({ user: req.user._id });
      profileData.education.unshift(education);
      await profileData.save();

      res.send(
        `Successfully added education to user profile: ${req.user.name}`
      );
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
);

router.delete("/me/delete", authMiddleware, async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user._id });
    await User.findOneAndDelete({ user: req.user._id });

    res.send(
      `Successfully deleted the profile of user: ${req.user.name} and the user itself.`
    );
  } catch ({ message }) {
    res.status(500).json(message);
  }
});

router.delete(
  "/me/delete/experience/:experienceId",
  authMiddleware,
  async (req, res) => {
    try {
      const experienceId = req.params.experienceId;
      const profile = await Profile.findOne({ user: req.user._id });
      profile.experience = profile.experience.filter(
        (x) => x._id != experienceId
      );
      profile.save();

      res.send("Successfully deleted this experience.");
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
);

router.delete(
  "/me/delete/education/:educationId",
  authMiddleware,
  async (req, res) => {
    try {
      const educationId = req.params.educationId;
      const profile = await Profile.findOne({ user: req.user._id });
      profile.education = profile.education.filter(
        (x) => x._id != educationId
      );
      profile.save();

      res.send("Successfully deleted this education.");
    } catch ({ message }) {
      res.status(500).json({ message });
    }
  }
);

module.exports = router;
