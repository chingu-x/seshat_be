import asyncHandler from 'express-async-handler'

const wakeUp = asyncHandler(async (req, res) => {
  console.log("I am awake")
  res.status(200).json({ status: "Awake" });
})

export default wakeUp
