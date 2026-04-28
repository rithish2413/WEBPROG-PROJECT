
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "1234") {
    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText = "Invalid credentials";
  }
}

function checkIn() {
  alert("Check-in clicked (backend later)");
}

function checkOut() {
  alert("Check-out clicked (backend later)");
}

function cancelBooking() {
  alert("Cancel clicked (backend later)");
}