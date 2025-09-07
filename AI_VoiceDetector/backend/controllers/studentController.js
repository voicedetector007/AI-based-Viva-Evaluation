import Test from "../models/Test.js";
import Student from "../models/Student.js";
import TestAttempt from "../models/TestAttempt.js";

export const joinTest = async (req, res) => {
   try {
      const { user } = req;
      const { testId } = req.params;

      const student = await Student.findOne({ user: user._id }).populate("user", "name email role");
      if (!student) return res.status(403).json({ msg: "Only registered students can access the test" });

      const test = await Test.findById(testId);
      if (!test) return res.status(404).json({ msg: "Test does not exist" });

      const isAllowed = test.students.some(sid => sid.toString() === student._id.toString());
      if (!isAllowed) return res.status(403).json({ msg: "Student not allowed to access this test" });

      const now = new Date();
      if (now < new Date(test.startTime)) return res.status(403).json({ msg: "Test has not started yet" });
      if (now > new Date(test.endTime)) return res.status(403).json({ msg: "Test has already ended" });

      let attempt = await TestAttempt.findOne({ test: test._id, student: student._id });
      if (!attempt) {
         attempt = await TestAttempt.create({ test: test._id, student: student._id });
      }

      res.status(200).json({
         msg: "Student can access the test",
         test,
         student: {
            name: student.user.name,
            role: student.user.role,
            scholarId: student.scholarId,
            email: student.user.email,
         },
         attemptId: attempt._id,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
   }
};

export const startTest = async (req, res) => {
   try {
      const { user } = req;
      const { testId } = req.params;
      const student = await Student.findOne({ user: user._id });
      if (!student) return res.status(403).json({ msg: "Unauthorized" });

      const attempt = await TestAttempt.findOne({ test: testId, student: student._id });
      if (attempt.startedAt) return res.status(400).json({ msg: "Test already started" });

      attempt.startedAt = new Date();
      await attempt.save();
      res.status(200).json({ msg: "Test started", startedAt: attempt.startedAt });
   } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
   }
};

export const submitTest = async (req, res) => {
   try {
      const { user } = req;
      const { testId } = req.params;
      const student = await Student.findOne({ user: user._id });
      if (!student) return res.status(403).json({ msg: "Unauthorized" });

      const attempt = await TestAttempt.findOne({ test: testId, student: student._id });
      if (!attempt) return res.status(404).json({ msg: "Test not attempted" });
      if (attempt.submittedAt) return res.status(400).json({ msg: "Test already submitted" });

      attempt.submittedAt = new Date();
      await attempt.save();
      res.status(200).json({ msg: "Test submitted successfully" });
   } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
   }
};

// export const getUpcomingTestsForStudent = async (req, res) => {
//    try {
//       const { user } = req;
//       const student = await Student.findOne({ user: user._id });
//       if (!student) return res.status(404).json({ msg: "Student not found" });

//       const tests = await Test.find({ students: student._id, endTime: { $gt: new Date() } })
//          .select("title startTime endTime examiner sharedLinkId createdAt");

//       res.status(200).json({ tests });
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Server Error" });
//    }
// };

export const getUpcomingTestsForStudent = async (req, res) => {
   try {
      const { _id } = req.user;
      const student = await Student.findOne({ user: _id });
      const now = new Date(); // UTC

      const tests = await Test.find({
         students: student._id,
         end_time: { $gt: now }, // Compare with UTC
      }).select("title start_time end_time examiner sharedLinkId createdAt");


      console.log('Student._id:', student._id);
      console.log('Now:', now);
      console.log('Tests found:', tests.length, tests);

      return res.status(200).json({ tests });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server Error" });
   }
};
