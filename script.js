const newPartyForm = document.querySelector('#new-party-form');
const partyContainer = document.querySelector('#party-container');

const PARTIES_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/parties';
const GUESTS_API_URL =
  'http://fsa-async-await.herokuapp.com/api/workshop/guests';
const RSVPS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/rsvps';
const GIFTS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/gifts';

// getAllParties with a try/catch implementation.
const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
  }
};

// getPartyById with try/catch implimented.
const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    const party = await response.json();
    return party;
  } catch (error) {
    console.error(error);
  }
};

// deleteParty with try/catch implimented.
const deleteParty = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      return true;
    } else {
      throw new Error(`Could not delete party with id ${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

  

// render a single party by id
const renderSinglePartyById = async (id) => {
  try {
    // fetch party details from server
    const party = await getPartyById(id);

    // GET - /api/workshop/guests/party/:partyId - get guests by party id
    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    const guests = await guestsResponse.json();

    // GET - /api/workshop/rsvps/party/:partyId - get RSVPs by partyId
    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    const rsvps = await rsvpsResponse.json();

    // GET - get all gifts by party id - /api/workshop/parties/gifts/:partyId -BUGGY?
    const giftsResponse = await fetch(`${PARTIES_API_URL}/party/gifts/${id}`);
    const gifts = await giftsResponse.json();

    // create new HTML element to display party details
    const partyDetailsElement = document.createElement('div');
    partyDetailsElement.classList.add('party-details');
    partyDetailsElement.innerHTML = `
            <h2>${party.name}</h2>
            <p>${party.event}</p>
            <p>${party.city}</p>
            <p>${party.state}</p>
            <p>${party.country}</p>
            <h3>Guests:</h3>
            <ul>
            ${guests
              .map(
                (guest, index) => `
              <li>
                <div>${guest.name}</div>
                <div>${rsvps[index].status}</div>
              </li>
            `
              )
              .join('')}
          </ul>
          


            <button class="close-button">Close</button>
        `;
    partyContainer.appendChild(partyDetailsElement);

    // add event listener to close button
    const closeButton = partyDetailsElement.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      partyDetailsElement.remove();
    });
  } catch (error) {
    console.error(error);
  }
};

// Below we are rending all parties.
const renderParties = async (parties) => {
  try {
    partyContainer.innerHTML = "";
    parties.forEach((party) => {
      const partyElement = document.createElement("div");
      partyElement.classList.add("party");
      partyElement.innerHTML = `
                <h2>${party.title}</h2>
                <p>${party.event}</p>
                <p>${party.date}</p>
                <p>${party.time}</p>
                <p>${party.location}</p>
                <button class="details-button" data-id="${party.id}">See Details</button>
                <button class="delete-button" data-id="${party.id}">Delete</button>
            `;
      partyContainer.appendChild(partyElement);

      // See details.
      const detailsButton = partyElement.querySelector(".details-button");
      detailsButton.addEventListener("click", async (event) => {
        const partyId = event.target.dataset.id;
          await renderSinglePartyById(partyId);
      });

      // The following below code is a button used to delete the party.
      const deleteButton = partyElement.querySelector(".delete-button");
      deleteButton.addEventListener("click", async (event) => {
        const partyId = event.target.dataset.id;
        await deleteParty(partyId);
        partyElement.remove();
        // Once deletion is complete, we can use the parties variable to callback getAllParties.
        const parties =  await getAllParties();
        await renderParties(parties);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

// Initiate the function below.

const init = async () => {
  try {
    const parties = await getAllParties();
    await renderParties(parties);
  } catch (error) {
    console.error(error);
  }
};

init();
