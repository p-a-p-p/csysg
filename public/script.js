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

  fetch("/availableEvents")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        const event = data[i];
        const eventWrapper = document.querySelector(".wrapper");
        // Create elements for each event
        const newEventbox = document.createElement("DIV");
        newEventbox.className = "information-box";

        const newEvent = document.createElement("DIV");
        newEvent.className = "event";

        const newEventName = document.createElement("A");
        newEventName.href = "./scanning.html";
        newEventName.className = "event-name";
        newEventName.innerText = event.eventName;

        const newEventDate = document.createElement("P");
        newEventDate.className = "event-date";
        newEventDate.innerText = event.eventDate;

        eventWrapper.appendChild(newEventbox);
        newEventbox.appendChild(newEvent);
        newEvent.appendChild(newEventName);
        newEvent.appendChild(newEventDate);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
