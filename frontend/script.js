const API_CONFIG = {
    subscribeEndpoint: "https://0ju75o37b6.execute-api.us-east-1.amazonaws.com/subscribers",
    createEventEndpoint: "https://0ju75o37b6.execute-api.us-east-1.amazonaws.com/events",
    eventsEndpoint: "https://0ju75o37b6.execute-api.us-east-1.amazonaws.com/events"
};

document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // SUBSCRIBE FORM
    // ==============================

    const subscribeForm = document.getElementById("subscribe-form");

    if (subscribeForm) {
        subscribeForm.addEventListener("submit", handleSubscription);
        console.log("Subscription form connected.");
    }


    // ==============================
    // CREATE EVENT FORM
    // ==============================

    const eventForm = document.getElementById("event-form");

    if (eventForm) {
        eventForm.addEventListener("submit", handleCreateEvent);
        console.log("Create event form connected.");
    }


    // Events endpoint will be added later
    if (API_CONFIG.eventsEndpoint) {
        loadEvents();
    }
});


// =====================================================
// SUBSCRIBE
// Website → API Gateway → Subscription Lambda → SNS
// =====================================================

async function handleSubscription(event) {

    event.preventDefault();

    const emailInput = document.getElementById("subscriber-email");
    const message = document.getElementById("subscribe-message");

    const email = emailInput.value.trim();

    if (!email) {
        showMessage(
            message,
            "Please enter your email address.",
            true
        );
        return;
    }

    try {

        console.log("Sending subscription request...");
        console.log("Email:", email);

        const response = await fetch(
            API_CONFIG.subscribeEndpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        console.log("Subscription response:", data);

        if (response.ok) {

            showMessage(
                message,
                "Subscription request submitted successfully! Please check your email for the SNS confirmation link.",
                false
            );

            emailInput.value = "";

        } else {

            showMessage(
                message,
                "Subscription failed: " +
                (data.message || "Unknown error"),
                true
            );
        }

    } catch (error) {

        console.error("Subscription error:", error);

        showMessage(
            message,
            "Unable to connect to the subscription service. Please try again.",
            true
        );
    }
}


// =====================================================
// CREATE EVENT
// Website → API Gateway → Event Lambda → S3
// =====================================================

async function handleCreateEvent(event) {

    event.preventDefault();

    const nameInput =
        document.getElementById("event-name");

    const dateInput =
        document.getElementById("event-date");

    const locationInput =
        document.getElementById("event-location");

    const descriptionInput =
        document.getElementById("event-description");

    const message =
        document.getElementById("event-message");

    const submitButton =
        event.target.querySelector('button[type="submit"]');


    const title = nameInput.value.trim();

    const date = dateInput.value;

    const location =
        locationInput.value.trim();

    const description =
        descriptionInput.value.trim();


    // Validate fields

    if (
        !title ||
        !date ||
        !location ||
        !description
    ) {

        showMessage(
            message,
            "Please fill in all event fields.",
            true
        );

        return;
    }


    const originalButtonText =
        submitButton.textContent;


    try {

        submitButton.disabled = true;

        submitButton.textContent = "Creating...";


        console.log("Creating event...");

        console.log(
            "API:",
            API_CONFIG.createEventEndpoint
        );


        // Send event to API Gateway

        const response = await fetch(
            API_CONFIG.createEventEndpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,

                    date: date,

                    location: location,

                    description: description

                })
            }
        );


        const data = await response.json();


        console.log(
            "Event API response:",
            data
        );


        if (response.ok) {

            showMessage(
                message,
                "Event created successfully! The event has been saved to S3.",
                false
            );


            // Clear the form

            event.target.reset();


            // Later we will use this
            // to refresh the event list

            if (API_CONFIG.eventsEndpoint) {

                loadEvents();

            }

        } else {

            showMessage(
                message,
                "Event creation failed: " +
                (data.message || "Unknown error"),
                true
            );
        }


    } catch (error) {

        console.error(
            "Create event error:",
            error
        );


        showMessage(
            message,
            "Unable to connect to the event service. Please try again.",
            true
        );


    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            originalButtonText;
    }
}


// =====================================================
// LOAD EVENTS
// We will configure this in the next step.
// =====================================================

async function loadEvents() {

    const eventsList =
        document.getElementById("events-list");

    const eventCount =
        document.getElementById("event-count");


    if (
        !eventsList ||
        !eventCount ||
        !API_CONFIG.eventsEndpoint
    ) {

        return;
    }


    try {

        eventsList.innerHTML =
            '<div class="loading-card">Loading events...</div>';


        const response =
            await fetch(
                API_CONFIG.eventsEndpoint
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load events."
            );
        }


        const data =
            await response.json();


        const events =
            data.events || [];


        eventCount.textContent =
            `${events.length} event${events.length === 1 ? "" : "s"}`;


        if (events.length === 0) {

            eventsList.innerHTML =
                '<div class="loading-card">No events available.</div>';

            return;
        }


        eventsList.innerHTML =
            events.map(event => `

                <article class="event-card">

                    <p class="eyebrow">
                        ${escapeHtml(event.date || "")}
                    </p>

                    <h3>
                        ${escapeHtml(
                            event.title ||
                            "Untitled Event"
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            event.description || ""
                        )}
                    </p>

                    ${
                        event.location
                        ? `
                            <p class="event-location">
                                ${escapeHtml(
                                    event.location
                                )}
                            </p>
                          `
                        : ""
                    }

                </article>

            `).join("");


    } catch (error) {

        console.error(
            "Load events error:",
            error
        );


        eventsList.innerHTML =
            '<div class="loading-card">Unable to load events.</div>';
    }
}


// =====================================================
// MESSAGE DISPLAY
// =====================================================

function showMessage(
    element,
    text,
    isError
) {

    if (!element) {

        return;
    }


    element.textContent = text;

    element.style.display = "block";


    element.classList.toggle(
        "error",
        isError
    );
}


// =====================================================
// SECURITY
// Prevent HTML from being inserted directly.
// =====================================================

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}
