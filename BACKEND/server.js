console.log("THIS IS MY CURRENT SERVER FILE");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});
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
    expectedArrivalDate: Date,
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
      const now = new Date();
      await guest.updateOne(
        { bookingId: bookingId },
        { $set: { status: 'CheckIn' , checkInTime: now} }
      );
      await room.updateOne(
        { roomNumber: person.roomNumber },
        { $set: { status: 2} }
      );
      const localTime = now.toLocaleString();
      res.json({ message: "Check-in Successful. Check in Time:"+ localTime});
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
        res.json({ message: "Check-out Successful and the Duration is " + duration + "day stay" });
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

app.get("/allGuests", async (req, res) => {
  console.log("ALL GUESTS ROUTE HIT");
  try {
    const guests = await guest.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//for autocancellation
const autoCancelNoShows = async () => {
    try {
        const now = new Date();
        // 1. Find all guests who are late (Arrival Date is in the past) and are still marked as "Confirmed"
        const expiredGuests = await guest.find({
            status: "Confirmed",
            expectedArrivalDate: { $lt: now } 
        });
        if (expiredGuests.length > 0) {
            for (let person of expiredGuests) {
                // Update Guest Status
                person.status = "Cancelled";
                await person.save();
                // Update Room Status (Make it 0: Available again)
                await room.updateOne(
                    { roomNumber: person.roomNumber },
                    { $set: { status: 0 } }
                );
                console.log(`[Auto-Cancel] Guest ${person.name} (Room ${person.roomNumber}) cancelled.`);
            }
        }
    } catch (err) {
        console.error("Auto-cancel error:", err);
    }
};
// Run the check every 1 hour
setInterval(autoCancelNoShows, 1000 * 60 * 60);
// Run once immediately when server starts to clean up 
autoCancelNoShows();



const PORT = 4000;
app.listen(PORT, () => console.log(`Server flying on http://localhost:${PORT}`));