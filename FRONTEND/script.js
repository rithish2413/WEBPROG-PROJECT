
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!user || !pass) {
    document.getElementById("error").innerText = "Enter username and password";
    return;
  }

  if (user === "admin" && pass === "1234") {
    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText = "Invalid credentials";
  }
}



function checkIn() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  document.getElementById("message").innerText =
    "Check-in successful for " + id;

  document.getElementById("bookingId").value = "";
}



function checkOut() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  document.getElementById("message").innerText =
    "Check-out successful for " + id;

  document.getElementById("bookingId").value = "";
}



function cancelBooking() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  document.getElementById("message").innerText =
    "Booking cancelled for " + id;

  document.getElementById("bookingId").value = "";
}