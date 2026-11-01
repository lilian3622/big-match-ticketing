
// =====================================
// BIG MATCH - COMPLETE MAIN WEBSITE SCRIPT
// =====================================

// =====================================
// 1. MOBILE NAVIGATION
// =====================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
});

document.querySelectorAll("#navLinks a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
  });
});


// =====================================
// 2. SEAT SELECTION ELEMENTS
// =====================================

const seatGroups = document.getElementById("seatGroups");
const selectedSeats = document.getElementById("selectedSeats");
const totalPrice = document.getElementById("totalPrice");

let eventData = null;
let categories = [];
let allSeats = [];
let currentCategory = null;
let selected = [];
let currentSide = "EAST";
let currentRow = "";

const STADIUM_SIDES = ["EAST", "WEST", "NORTH", "SOUTH"];
const SIDE_CAPACITY = 12500;
const TOTAL_CAPACITY = 50000;


// =====================================
// 3. DISPLAY MESSAGES
// =====================================

function showMessage(message) {
  if (seatGroups) {
    seatGroups.textContent = message;
  }
}


// =====================================
// 4. UPDATE BOOKING SUMMARY
// =====================================

function updateSummary() {
  if (!selectedSeats || !totalPrice) return;

  selectedSeats.textContent = selected.length
    ? selected.map(seat =>
        `${seat.section}-${seat.row_label}-${seat.seat_number}`
      ).join(", ")
    : "None";

  const total = selected.reduce((sum, seat) => {
    const category = categories.find(
      c => c.id === seat.category_id
    );

    return sum + (Number(category?.price_kes) || 0);
  }, 0);

  totalPrice.textContent =
    "KSh " + total.toLocaleString("en-KE");
}


// =====================================
// 5. RENDER STADIUM SEATS
// =====================================

function renderSeats() {
  if (!seatGroups) return;

  seatGroups.innerHTML = "";

  if (!currentCategory) {
    showMessage("Choose a ticket category to view seats.");
    return;
  }

  // Compact stadium-side tabs
  const tabs = document.createElement("div");
  tabs.className = "stadium-side-tabs";

  STADIUM_SIDES.forEach(side => {
    const sideSeats = allSeats.filter(
      seat => (seat.stadium_side || "").toUpperCase() === side
    );

    const categorySeats = sideSeats.filter(
      seat => seat.category_id === currentCategory.id
    );

    const available = categorySeats.filter(
      seat => seat.status === "available"
    ).length;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "stadium-side-tab";
    tab.classList.toggle("active", currentSide === side);

    tab.innerHTML = `
      <strong>${side}</strong>
      <small>${available.toLocaleString("en-KE")} available</small>
    `;

    tab.addEventListener("click", () => {
      currentSide = side;
      currentRow = "";
      renderSeats();
    });

    tabs.appendChild(tab);
  });

  seatGroups.appendChild(tabs);

  // Seats for the selected side and category
  const sideSeats = allSeats.filter(seat =>
    (seat.stadium_side || "").toUpperCase() === currentSide &&
    seat.category_id === currentCategory.id
  );

  const availableCount = sideSeats.filter(
    seat => seat.status === "available"
  ).length;

  const heading = document.createElement("h3");
  heading.className = "selected-side-heading";
  heading.textContent = `${currentSide} SIDE`;

  const summary = document.createElement("p");
  summary.className = "selected-side-summary";
  summary.textContent =
    `${currentCategory.name} — ${availableCount.toLocaleString("en-KE")} seats available`;

  seatGroups.appendChild(heading);
  seatGroups.appendChild(summary);

  if (!sideSeats.length) {
    const note = document.createElement("p");
    note.textContent = "No seats available in this category on this side.";
    seatGroups.appendChild(note);
    return;
  }

  // Group seats by section and row
  const sections = {};

  sideSeats.forEach(seat => {
    if (!sections[seat.section]) sections[seat.section] = {};

    if (!sections[seat.section][seat.row_label]) {
      sections[seat.section][seat.row_label] = [];
    }

    sections[seat.section][seat.row_label].push(seat);
  });

  const sectionNames = Object.keys(sections).sort();

  const sectionSelect = document.createElement("select");
  sectionSelect.className = "seat-filter";

  sectionNames.forEach(section => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = `${section} SECTION`;
    sectionSelect.appendChild(option);
  });

  seatGroups.appendChild(sectionSelect);

  const rowSelect = document.createElement("select");
  rowSelect.className = "seat-filter";

  const rowContainer = document.createElement("div");
  rowContainer.className = "seat-display";

  seatGroups.appendChild(rowSelect);
  seatGroups.appendChild(rowContainer);

  function displayRows() {
    const section = sectionSelect.value;
    const rows = sections[section] || {};
    const rowNames = Object.keys(rows).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    rowSelect.innerHTML = "";

    rowNames.forEach(row => {
      const option = document.createElement("option");
      option.value = row;
      option.textContent = `ROW ${row}`;
      rowSelect.appendChild(option);
    });

    currentRow = rowNames.includes(currentRow)
      ? currentRow
      : rowNames[0] || "";

    rowSelect.value = currentRow;
    displaySelectedRow();
  }

  function displaySelectedRow() {
    rowContainer.innerHTML = "";

    const seats = sections[sectionSelect.value]?.[rowSelect.value] || [];

    const rowHeading = document.createElement("h4");
    rowHeading.textContent = `ROW ${rowSelect.value}`;
    rowContainer.appendChild(rowHeading);

    const grid = document.createElement("div");
    grid.className = "compact-seat-grid";

    seats.sort((a, b) =>
      Number(a.seat_number) - Number(b.seat_number)
    );

    seats.forEach(seat => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seat";
      button.textContent = seat.seat_number;

      const isSelected = selected.some(s => s.id === seat.id);
      const unavailable = seat.status !== "available";

      button.disabled = unavailable;

      if (isSelected) button.classList.add("active");

      button.title =
        `${currentSide}, ${seat.section}, Row ${seat.row_label}, Seat ${seat.seat_number}`;

      button.addEventListener("click", () => {
        if (isSelected) {
          selected = selected.filter(s => s.id !== seat.id);
        } else {
          if (selected.length >= 10) {
            alert("You can select a maximum of 10 seats.");
            return;
          }

          selected.push(seat);
        }

        updateSummary();
        displaySelectedRow();
      });

      grid.appendChild(button);
    });

    rowContainer.appendChild(grid);
  }

  sectionSelect.addEventListener("change", () => {
    currentRow = "";
    displayRows();
  });

  rowSelect.addEventListener("change", () => {
    currentRow = rowSelect.value;
    displaySelectedRow();
  });

  displayRows();
}

// =====================================
// 6. CHOOSE TICKET CATEGORY
// =====================================

function chooseCategory(category) {

  currentCategory = category;
  selected = [];

  document.querySelectorAll(".choose-button").forEach(button => {

    button.classList.toggle(
      "active-category",
      button.dataset.category.trim().toUpperCase() ===
      category.name.trim().toUpperCase()
    );

  });

  renderSeats();
  updateSummary();

  document.getElementById("seats")?.scrollIntoView({
    behavior: "smooth"
  });
}


// =====================================
// 7. FORMAT EVENT DATE
// =====================================

function formatEventDate(dateValue) {

  if (!dateValue) {
    return "DATE TO BE CONFIRMED";
  }

  const parts = dateValue.split("-");

  if (parts.length !== 3) {
    return dateValue;
  }

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).toUpperCase();
}


// =====================================
// 8. LOAD ALL SEATS IN BATCHES
// =====================================

async function loadAllSeats(eventId) {

  const loadedSeats = [];

  const batchSize = 1000;
  let from = 0;

  while (true) {

    const { data, error } = await supabaseClient
      .from("seats")
      .select(`
        id,
        event_id,
        category_id,
        section,
        row_label,
        seat_number,
        status,
        stadium_side
      `)
      .eq("event_id", eventId)
      .order("id", { ascending: true })
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    loadedSeats.push(...data);

    from += data.length;

    if (data.length < batchSize) {
      break;
    }
  }

  return loadedSeats;
}


// =====================================
// 9. LOAD EVENT, CATEGORIES AND SEATS
// =====================================

async function loadMatchData() {

  if (typeof supabaseClient === "undefined") {

    showMessage(
      "Supabase connection was not found. Check your config file."
    );

    return;
  }

  try {

    showMessage("Loading BIG MATCH information...");

    // Load published event

    const { data: event, error: eventError } =
      await supabaseClient
        .from("events")
        .select("id, name, venue, event_date")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (eventError) throw eventError;

    if (!event) {

      showMessage(
        "No published event found. Check your event in Supabase."
      );

      return;
    }

    eventData = event;


    // Load ticket categories

    const { data: categoryData, error: categoryError } =
      await supabaseClient
        .from("ticket_categories")
        .select("id, name, price_kes, description")
        .eq("event_id", event.id);

    if (categoryError) throw categoryError;

    categories = categoryData || [];


    // Load ALL 50,000 seats

    showMessage("Loading all stadium seats. Please wait...");

    allSeats = await loadAllSeats(event.id);


    // Count seats by stadium side

    const sideCounts = {
      EAST: 0,
      WEST: 0,
      NORTH: 0,
      SOUTH: 0
    };

    allSeats.forEach(seat => {

      const side = (seat.stadium_side || "").toUpperCase();

      if (Object.prototype.hasOwnProperty.call(sideCounts, side)) {
        sideCounts[side]++;
      }

    });

    console.log("BIG MATCH EVENT:", event);
    console.log("TOTAL SEATS LOADED:", allSeats.length);
    console.table(sideCounts);


    // Warn if inventory does not match the planned allocation

    STADIUM_SIDES.forEach(side => {

      if (sideCounts[side] !== SIDE_CAPACITY) {

        console.warn(
          `${side} has ${sideCounts[side]} seats instead of ${SIDE_CAPACITY}.`
        );

      }

    });


    // Update ticket category prices

    document.querySelectorAll(".ticket-card").forEach(card => {

      const name = card.querySelector("h3")?.textContent.trim();

      const category = categories.find(
        c => c.name.trim().toUpperCase() === name?.toUpperCase()
      );

      if (!category) return;

      const price = card.querySelector("h2");

      if (price) {

        price.textContent =
          "KSh " +
          Number(category.price_kes).toLocaleString("en-KE");

      }

    });


    // Connect category buttons

    document.querySelectorAll(".choose-button").forEach(button => {

      button.addEventListener("click", () => {

        const categoryName =
          button.dataset.category.trim().toUpperCase();

        const category = categories.find(
          c => c.name.trim().toUpperCase() === categoryName
        );

        if (!category) {

          alert(
            "This ticket category was not found in Supabase."
          );

          return;
        }

        chooseCategory(category);

      });

    });


    // Show first category

    if (categories.length) {

      chooseCategory(categories[0]);

    } else {

      showMessage(
        "No ticket categories have been added yet."
      );

    }

    updateSummary();

  } catch (error) {

    console.error("BIG MATCH LOADING ERROR:", error);

    showMessage(
      "Unable to load event information: " + error.message
    );

  }
}


// =====================================
// 10. START BOOKING AND PAYMENT
// =====================================

document.getElementById("continueBooking")?.addEventListener(
  "click",
  async () => {

    const name =
      document.getElementById("customerName")?.value.trim();

    const email =
      document.getElementById("customerEmail")?.value.trim();

    const phone =
      document.getElementById("customerPhone")?.value.trim();

    const button =
      document.getElementById("continueBooking");


    if (!name || !email || !phone) {

      alert("Please fill in all your customer details.");
      return;

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      alert("Please enter a valid email address.");
      return;

    }

    if (!selected.length) {

      alert("Please select at least one seat.");
      return;

    }

    if (!currentCategory || !eventData?.id) {

      alert(
        "Event or ticket category information is not available. Please refresh."
      );

      return;

    }

    button.disabled = true;
    button.textContent = "Starting payment...";

    try {

      const { data, error } =
        await supabaseClient.functions.invoke(
          "initialize-paystack-payment",
          {
            body: {
              event_id: eventData.id,
              seat_ids: selected.map(seat => seat.id),
              customer_name: name,
              customer_email: email,
              customer_phone: phone
            }
          }
        );

      if (error) throw error;

      if (!data || !data.success) {

        throw new Error(
          data?.error || "Payment could not be started."
        );

      }

      alert(
        "PAYMENT REQUEST STARTED\n\n" +
        data.message +
        "\n\nBooking reference: " + data.booking_id +
        "\nAmount: KSh " +
        Number(data.amount).toLocaleString("en-KE") +
        "\n\nFollow the M-Pesa prompt on your phone."
      );

      // Clear local selection after successful reservation request

      selected = [];

      updateSummary();
      renderSeats();

    } catch (error) {

      console.error("BOOKING ERROR:", error);

      alert("Payment error: " + error.message);

    } finally {

      button.disabled = false;
      button.textContent = "CONTINUE TO PAYMENT";

    }

  }
);


// =====================================
// 11. RETRIEVE PAID TICKETS
// =====================================

const retrieveTicketBtn =
  document.getElementById("retrieveTicketBtn");

retrieveTicketBtn?.addEventListener("click", async () => {

  const bookingId =
    document.getElementById("lookupBookingId").value.trim();

  const email =
    document.getElementById("lookupEmail").value.trim();

  const message =
    document.getElementById("ticketMessage");


  if (!bookingId || !email) {

    message.textContent =
      "Please enter your booking ID and email.";

    return;

  }

  retrieveTicketBtn.disabled = true;
  retrieveTicketBtn.textContent = "Retrieving...";

  try {

    const { data, error } =
      await supabaseClient.functions.invoke(
        "get-my-tickets",
        {
          body: {
            booking_id: bookingId,
            email: email
          }
        }
      );

    if (error) throw error;

    if (!data?.success || !data.tickets?.length) {

      throw new Error(
        data?.error || "No tickets were found."
      );

    }


    // Display the first ticket

    const ticket = data.tickets[0];


    document.getElementById("ticketCategory").textContent =
      ticket.category || "Ticket";

    document.getElementById("ticketSection").textContent =
      ticket.section || "—";

    document.getElementById("ticketRow").textContent =
      ticket.row || "—";

    document.getElementById("ticketSeat").textContent =
      ticket.seat ?? "—";

    document.getElementById("ticketNumber").textContent =
      ticket.ticket_number || "—";

    document.getElementById("ticketStatus").textContent =
      (ticket.ticket_status || "UNKNOWN").toUpperCase();


    // Event details

    const eventDate =
      ticket.event_date || eventData?.event_date;

    const venue =
      ticket.venue || eventData?.venue;

    document.getElementById("ticketEventDate").textContent =
      formatEventDate(eventDate);

    document.getElementById("ticketVenue").textContent =
      venue || "VENUE TO BE CONFIRMED";


    // Ticket price

    const price = Number(ticket.price);

    document.getElementById("ticketPrice").textContent =
      ticket.price !== null &&
      ticket.price !== undefined &&
      Number.isFinite(price)
        ? "KSh " + price.toLocaleString("en-KE")
        : "Price unavailable";


    document.getElementById("ticketBarcodeNumber").textContent =
      ticket.ticket_number || "BIG MATCH ADMISSION PASS";


    // QR code generation

    if (typeof QRCode === "undefined") {

      throw new Error(
        "QR code library did not load. Refresh the page."
      );

    }

    const qrContainer =
      document.getElementById("ticketQrCode");

    const smallQrContainer =
      document.getElementById("ticketQrCodeSmall");


    if (!qrContainer || !smallQrContainer) {

      throw new Error(
        "Ticket QR code containers were not found."
      );

    }

    if (!ticket.qr_token) {

      throw new Error(
        "This ticket does not have a QR token."
      );

    }

    qrContainer.innerHTML = "";
    smallQrContainer.innerHTML = "";

    new QRCode(qrContainer, {
      text: ticket.qr_token,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.H
    });

    new QRCode(smallQrContainer, {
      text: ticket.qr_token,
      width: 57,
      height: 57,
      correctLevel: QRCode.CorrectLevel.H
    });


    // Show ticket

    document.getElementById("digitalTicket").hidden = false;

    document.getElementById("ticketActions").hidden = false;

    message.textContent =
      "Your ticket has been retrieved!";

    document.getElementById("digitalTicket").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error("TICKET RETRIEVAL ERROR:", error);

    if (error.context instanceof Response) {

      const details = await error.context.clone().text();

      console.log("SERVER RESPONSE:", details);

      message.textContent = details;

    } else {

      message.textContent =
        error.message || "Unable to retrieve your ticket.";

    }

  } finally {

    retrieveTicketBtn.disabled = false;
    retrieveTicketBtn.textContent = "RETRIEVE MY TICKET";

  }

});


// =====================================
// 12. PRINT / SAVE TICKET AS PDF
// =====================================

document.getElementById("downloadTicket")?.addEventListener(
  "click",
  () => {

    document.body.classList.add("printing-ticket");

    window.print();

  }
);

window.addEventListener("afterprint", () => {

  document.body.classList.remove("printing-ticket");

});


// =====================================
// 13. START WEBSITE
// =====================================

loadMatchData();
