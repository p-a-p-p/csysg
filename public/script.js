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
        newButtonDel.textContent = "DEL";
        newButtonDel.dataset.rowId = event.eventID;

        eventWrapper.appendChild(newEventbox);
        newEventbox.appendChild(newEvent);
        newEvent.appendChild(newEventName);
        newEvent.appendChild(newEventDate);
        newEvent.appendChild(newButtonDel);

        //script for button
        newButtonDel.addEventListener("click", function () {
          const eventId = this.dataset.rowId; // Get event ID from dataset
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

function addStudentEvent() {
  const studentNo = document.getElementById("eventName").value;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  console.log(studentNo, urlParams.get("id"));
}
