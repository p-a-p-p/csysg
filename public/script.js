// Function to add an event
function addEvent(event) {
  const eventName = document.getElementById("eventName").value;
  const eventDate = document.getElementById("eventDate").value;

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
  })
    .then(() => location.reload())
    .catch((error) => console.error("Error:", error));
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
      const eventWrapper = document.querySelector(".wrapper");
      data.forEach((event) => {
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
              console.log(eventId);
              console.error("Error:", error);
            });
        });
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

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

document.getElementById("read-excel").addEventListener("click", function () {
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

    const firstColumn = [];
    const range = XLSX.utils.decode_range(sheet["!ref"]);

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 0 });
      const cell = sheet[cellAddress];
      const cellValue = cell ? cell.v : undefined;
      firstColumn.push(cellValue);
    }

    console.log(firstColumn);
    sendDataToServer(firstColumn);
  };
  reader.readAsArrayBuffer(file);
});

function sendDataToServer(data) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventID = urlParams.get("id");

  const payload = data.map((idNumber) => ({ idNumber, eventID }));

  fetch("/importAttendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to import data.");
      }
      location.reload;
      console.log("Data imported successfully.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function searchStudent() {
  const idNumber = document.getElementById("idNumber").value.trim();

  if (!idNumber) {
    alert("Please enter a student ID");
    return;
  }

  fetch(`/searchStudent/${idNumber}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      displayStudentData(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to fetch student data");
    });
}

function displayStudentData(data) {
  const studentNameDisplay = document.getElementById("studentNameDisplay");
  const eventsList = document.getElementById("eventsList");

  studentNameDisplay.textContent = `Student Name: ${data.studentName}`;

  eventsList.innerHTML = "";
  data.events.forEach((event) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Event: ${event.eventName}, Date: ${new Date(
      event.eventDate
    )
      .toISOString()
      .substring(0, 10)}`;
    eventsList.appendChild(listItem);
  });
}
