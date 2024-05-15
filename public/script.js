// Function to add an event
function addEvent(event) {
  // Get the values of eventName and eventDate
  const eventName = document.getElementById("eventName").value;
  const eventDate = document.getElementById("eventDate").value;

  // Create a data object to send to the server
  const data = {
    eventName: eventName,
    eventDate: eventDate,
  };

  // Send POST request to save the event
  fetch("/saveEvent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(() => location.reload())
    .catch((error) => console.error("Error:", error));
}

// Function to load events
function loadEvents(e) {
  fetch("/availableEvents")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const eventWrapper = document.querySelector(".wrapper");
      data.forEach((event) => {
        // Create elements for each event
        const newEventbox = document.createElement("div");
        newEventbox.className = "information-box";

        const newEvent = document.createElement("div");
        newEvent.className = "event";

        const newEventName = document.createElement("a");
        newEventName.href = `./scanning.html?id=${event.eventID}`;
        newEventName.className = "event-name";
        newEventName.innerText = event.eventName;

        const newEventDate = document.createElement("p");
        newEventDate.className = "event-date";
        const date = new Date(event.eventDate);
        newEventDate.innerText = date.toISOString().substring(0, 10);

        const newButtonDel = document.createElement("button");
        newButtonDel.className = "buttonDel";
        newButtonDel.textContent = "X";
        newButtonDel.dataset.rowId = event.eventID;

        newEventbox.appendChild(newEvent);
        newEvent.appendChild(newEventName);
        newEvent.appendChild(newEventDate);
        newEventbox.appendChild(newButtonDel);
        eventWrapper.appendChild(newEventbox);

        // Script for delete button
        newButtonDel.addEventListener("click", function () {
          const eventId = this.dataset.rowId;
          fetch(`/deleteEvent/${eventId}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete event");
              }
              location.reload();
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to add a student to an event
function addStudentEvent(e) {
  const studentNo = document.getElementById("eventName").value;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const data = {
    idNumber: studentNo,
    eventID: urlParams.get("id"),
  };

  fetch("/addAttendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(() => location.reload())
    .catch((error) => console.error("Error:", error));
}

// Function to load the attendance list for an event
function loadAttendanceList(e) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventID = urlParams.get("id");

  fetch(`/loadAttendance/${eventID}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const attendanceWrapper = document.querySelector(".attendance-box");
      data.forEach((attendance) => {
        const idNumber = document.createElement("li");
        idNumber.className = "id-number";
        idNumber.innerText = attendance.idNumber;
        attendanceWrapper.appendChild(idNumber);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to handle file upload and convert to JSON
function handleFile() {
  const fileInput = document.getElementById("excel-file");
  const file = fileInput.files[0];

  if (!file) {
    console.error("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    sendDataToServer(jsonData);
  };
  reader.readAsArrayBuffer(file);
}

// Function to send the JSON data to the server
function sendDataToServer(data) {
  fetch("/importAttendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to import data.");
      }
      console.log("Data imported successfully.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to export data
function exportData(e) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventID = urlParams.get("id");

  fetch(`/exportData/${eventID}`, {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.arrayBuffer();
    })
    .then((buffer) => {
      const bytes = new Uint8Array(buffer);
      const workbook = XLSX.read(bytes, { type: "array" });
      XLSX.writeFile(workbook, "attendance.xlsx");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
