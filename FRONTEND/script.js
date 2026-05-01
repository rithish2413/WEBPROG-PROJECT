
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
// 0:checkin 1:checkout 2:cancelled
async function createGuestDetailsBlock(data, stage) {
  // Remove existing block if it exists (prevents duplicates if user clicks Submit twice)
  const existing = document.getElementById("guestDetails");
  if (existing) existing.remove();
  //the input that one will be disapper
  const cont = document.getElementsByClassName("container");
  cont[0].style.display="none";
  const div = document.createElement("div");
  div.className = "container"; 
  div.id = "guestDetails";
  div.style.marginTop = "20px"; // Add some space
  div.innerHTML = 
   `<h3>Guest Details</h3>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Booking ID:</strong> ${data.bookingId}</p>
    <p><strong>Room:</strong> ${data.roomNumber}</p>
    <p><strong>Current Status:</strong> ${data.status}</p>
    <button id="confirmButton">Confirm Action</button>`;
  document.body.appendChild(div);
  // Handle the actual database update when Confirm is clicked
  document.getElementById("confirmButton").onclick = async () => {
    let url = "";
    if (stage === 0) url = `/confirmCheckIn/${data.bookingId}`;
    if (stage === 1) url = `/confirmCheckOut/${data.bookingId}`;
    if (stage === 2) url = `/confirmCancel/${data.bookingId}`;

    const resp = await fetch(url, { method: 'PUT' });
    const result = await resp.json();
    
    if (resp.ok) {
      alert(result.message);
      location.reload(); // Refresh to clear the screen
    } else {
      alert("Error: " + result.message);
    }
  };
}

async function checkIn() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  // document.getElementById("message").innerText =
  //   "Check-in successful for " + id;

  // document.getElementById("bookingId").value = "";
  const resp = await fetch(`/checkIn/${id}`, {
    method: 'GET'
  });
  const data = await resp.json();
  if (resp.ok) {
    createGuestDetailsBlock(data,0);
  } else {
    alert(data.message);
  }
}

async function checkOut() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  const resp = await fetch(`/checkOut/${id}`, {
    method: 'GET'
  });
  const data = await resp.json();
  if (resp.ok) {
    // Now you show the details to the admin
    createGuestDetailsBlock(data,1);
  } else {
    alert(data.message);
  }
}

async function cancelBooking() {
  const id = document.getElementById("bookingId").value.trim();

  if (!id) {
    alert("Enter Booking ID");
    return;
  }

  if (!id.startsWith("B")) {
    alert("Booking ID should start with B (e.g., B101)");
    return;
  }

  const resp = await fetch(`/cancelBooking/${id}`, {
    method: 'GET'
  });
  const data = await resp.json();
  if (resp.ok) {
    createGuestDetailsBlock(data,2);
  } else {
    alert(data.message);
  }
}