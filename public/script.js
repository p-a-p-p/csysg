function addEvent(event) {
  // Get the values of eventName and eventDate

  const eventName = document.getElementById("eventName").value;
  const eventDate = document.getElementById("eventDate").value;

  // Create a data object to send to the server
  const data = {
    eventName: eventName,
    eventDate: eventDate,
  };

  fetch("/saveEvent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  location.reload();
}

function loadEvents(e) {
  fetch("/availableEvents")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        const event = data[i];

        const eventWrapper = document.querySelector(".wrapper");

        // Create elements for each event
        const newEventbox = document.createElement("DIV");
        newEventbox.className = "information-box";

        const newEvent = document.createElement("DIV");
        newEvent.className = "event";

        const newEventName = document.createElement("A");
        newEventName.href = `./scanning.html?id=${event.eventID}`;
        newEventName.className = "event-name";
        newEventName.innerText = event.eventName;

        const newEventDate = document.createElement("P");
        newEventDate.className = "event-date";
        var date = new Date(event.eventDate);
        newEventDate.innerText = date.toISOString().substring(0, 10);

        const newButtonDel = document.createElement("BUTTON");
        newButtonDel.className = "buttonDel";
        newButtonDel.textContent = "X";
        newButtonDel.dataset.rowId = event.eventID;

        eventWrapper.appendChild(newEventbox);
        newEventbox.appendChild(newEvent);
        newEvent.appendChild(newEventName);
        newEvent.appendChild(newEventDate);
        newEventbox.appendChild(newButtonDel);

        //script for button
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
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// function addStudentEvent(e) {
//   const studentNo = document.getElementById("eventName").value;
//   const queryString = window.location.search;
//   const urlParams = new URLSearchParams(queryString);

//   console.log(studentNo, urlParams.get("id"));

//   fetch("/attendanceList", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
// }

function loadAttendanceList(e) {
  // const studentNo = document.getElementById("eventName").value;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // console.log(studentNo, urlParams.get("id"));
  const eventID = urlParams.get("id");
  console.log(eventID);

  fetch(`/loadAttendance/${eventID}`, {})
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        const attendance = data[i];
        const attendanceWrapper = document.querySelector(".attendance-box");

        // Create
        const idNumber = document.createElement("LI");
        idNumber.className = "id-number";
        idNumber.innerText = attendance.idNumber;

        attendanceWrapper.appendChild(idNumber);
        console.log(attendance);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const eventID = urlParams.get("id");
// addEventListener("DOMContentLoaded", (event) => {
//   fetch(`/loadAttendance/${eventID}`, {})
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       for (let i = 0; i < data.length; i++) {
//         const attendance = data[i];
//         const attendanceWrapper = document.querySelector(".attendance-box");

//         // Create
//         const idNumber = document.createElement("LI");
//         idNumber.className = "id-number";
//         idNumber.innerText = attendance.idNumber;

//         attendanceWrapper.appendChild(idNumber);
//         console.log(attendance);
//       }
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// });

function importExcel() {
  const filePath = document.getElementById("filePath").value;

  fetch("/importExcel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filePath: filePath }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Import process started.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

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

function sendDataToServer(data) {
  fetch("/importExcel", {
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
