const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const path = require('path');

// 1. Get the absolute path to the FRONTEND folder
const frontendPath = path.join(__dirname, '..', 'FRONTEND');

// 2. Tell Express to serve those files
app.use(express.static(frontendPath, { index: false }));

mongoose.connect("mongodb://127.0.0.1:27017/guesthouse")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const roomSchema = mongoose.Schema({
    roomNumber:String,
    status:Number//0:available 1:booked 2:occupied
});
const room = mongoose.model('room',roomSchema);
const guestSchema = mongoose.Schema({
    bookingId:{type:String, required: true, unique: true},
    name:String,
    phoneNumber:Number,
    nationality:String,
    gmail:String,
    status:{type:String, default:"Confirmed"},
    roomNumber:String,
    checkInTime:Date,
    checkOutTime:Date,
    duration:Number
});
const guest = mongoose.model('guest',guestSchema);

// 3. Serve the login page at the root
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

// Using URL parameters like /checkIn/B101
app.get("/checkIn/:id", async (req, res) => {
  try {
    const bookingId = req.params.id; // Get ID from the URL
    const person = await guest.findOne({ bookingId: bookingId });

    if (person) {
      if(person.status === "Confirmed"){
        res.json(person);
      }
      else{
        const msg = "the guest is already " + person.status;
        res.status(400).json({message: msg});
      }
    } else {
      res.status(404).json({ message: "Cannot find the guest" });
    }
  } catch (err) {
    res.status(500).json({message:err});
  }
});

// UPDATE: Using .put for status changes
app.put("/confirmCheckIn/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const person = await guest.findOne({ bookingId: bookingId });
    if (person && person.status === "Confirmed") {
      // person.status = "CheckIn";
      // person.checkInTime = new Date(); 
      await guest.updateOne(
        { bookingId: bookingId },
        { $set: { status: 'CheckIn' , checkInTime: new Date()} }
      );
      await room.updateOne(
        { roomNumber: person.roomNumber },
        { $set: { status: 2} }
      );
      res.json({ message: "Check-in Successful"});
    } else {
      res.status(400).json({ message: "Cannot check in. Current status: " + person.status });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/checkOut/:id", async (req, res) => {
  try {
    const bookingId = req.params.id; // Get ID from the URL
    const person = await guest.findOne({ bookingId: bookingId });

    if (person) {
      if(person.status === "CheckIn"){
        // await guest.update(
        //   { bookingId: bookingId },
        //   { $set: { status: 'CheckOut' , checkOutTime: new Date()} }
        // );
        res.json(person);
      }
      else{
        const msg = "the guest is already " + person.status;
        res.status(400).json({message: msg});
      }
    } else {
      res.status(404).json({ message: "Cannot find the guest" });
    }
  } catch (err) {
    res.status(500).json({message:err});
  }
});

app.put("/confirmCheckOut/:id", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const person = await guest.findOne({ bookingId: bookingId });
      if (person && person.status === "CheckIn") {
        const now = new Date();
        const diffMs = now - person.checkInTime;
        // CALCULATION LOGIC
        const duration = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // Calculate days
        // person.checkOutTime = now;
        // person.status = "CheckOut"; 
        // await person.save();
        await guest.updateOne(
        { bookingId: bookingId },
        { $set: { status: 'CheckOut' , checkOutTime: now, duration: duration} }
      );
        await room.updateOne(
        { roomNumber: person.roomNumber },
        { $set: { status: 0} }
      );
        res.json({ message: "Check-out Successful", duration: person.duration });
      } else {
      res.status(400).json({ message: "Cannot check in. Current status: " + person.status });
    }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

app.get("/cancelBooking/:id", async (req, res) => {
  try {
    const bookingId = req.params.id; // Get ID from the URL
    const person = await guest.findOne({ bookingId: bookingId });

    if (person) {
      if(person.status === "Confirmed"){
        // await guest.update(
        //   { bookingId: bookingId },
        //   { $set: { status: 'Cancelled' } }
        // );
        res.json(person);
      }
      else{
        const msg = "the guest is already " + person.status;
        res.status(400).json({message: msg});
      }
    } else {
      res.status(404).json({ message: "Cannot find the guest" });
    }
  } catch (err) {
    res.status(500).json({message:err});
  }
});

app.put("/confirmCancel/:id", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const person = await guest.findOne({ bookingId: bookingId });
      if (person && person.status === "Confirmed") {
        await guest.updateOne(
        { bookingId: bookingId },
        { $set: { status: 'Cancelled'} }
      );
       await room.updateOne(
        { roomNumber: person.roomNumber },
        { $set: { status: 0} }
      );
        res.json({ message: "Successful cancellation"});
      } else {
      res.status(400).json({ message: "Cannot check in. Current status: " + person.status });
    }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server flying on http://localhost:${PORT}`));