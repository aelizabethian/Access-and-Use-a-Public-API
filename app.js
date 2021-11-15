"use strict";

//Global variables fir API and HTML elements

const urlAPI = `https://randomuser.me/api/?results=12&inc=name, picture,
email, location, phone, dob &noinfo &nat=US`;
const gridContainer = document.querySelector(".grid-container");
const overlay = document.querySelector(".overlay");
const modalContainer = document.querySelector(".modal-content");
const cards = document.querySelectorAll(".card");
const modalClose = document.querySelector(".modal-close");
const left = document.querySelector(".leftArrow");
const right = document.querySelector(".rightArrow");

//Global variable for employees since it's accessed for both directory display and modal
let employees = [];

/*___________________________
Fetch request from https://randomapi.com - can choose what to pull from their database
The data fetched returns an array of 12 objects, so we need to pull out those objects from the array (called 'results')
That is why we're calling response.results.*/

fetch(urlAPI)
  .then((response) => response.json())
  .then((response) => response.results)
  .then(displayEmployees)
  .catch((error) => console.log(error));

//_____________________________
//Function to loop through and collect and display the required info for the directory.
//Using object destructuring to pull out the info because it allows for non-duplication of property name
//Start by putting the employeeData in our employees array

function displayEmployees(employeeData) {
  employees = employeeData;
  let employeeHTML = "";

  employees.forEach((employee, index) => {
    let {
      name,
      email,
      location: { city, state },
      picture,
    } = employees[index];

    employeeHTML += `<div class="card" data-index="${index}">
    <img class="avatar" src="${picture.large}" alt = "employee picture"/>
    <div class = "text-container">
      <h2 class="name">${name.first} ${name.last}</h2>
      <p class="email">${email}</p>
      <p class="address">${city}, ${state}</p>
    </div>
  </div>`;
  });

  gridContainer.innerHTML = employeeHTML;
}

//_____________________________
//Modal display function

function displayModal(index) {
  let {
    name,
    dob,
    phone,
    email,
    location: { city, street, state, postcode },
    picture,
  } = employees[index];

  //Reformat phone number to remove first hyphen only and replace with a space;
  const newPhone = phone.replace(/\-/, " ");

  /*Data comes in this format: '1980-02-10T20:07:55.748Z'
  The employee object has dob and then another object for date so we need dob.date
  We need to pull out the month, day and year to transform*/
  let date = new Date(dob.date);

  /*Note here that the getMonth returns January as 0 so added a 1 so we have Months 1-12
  Using fullYear() for date vs year*/
  const modalHTML = `
      <img class="modal_avatar" src="${
        picture.large
      }" alt="picture of employee" />
      <div class="text-container">
        <h2 class="name">${name.first} ${name.last}</h2>
        <p class="email">${email}</p>
        <p class="address">${city}</p>
        <hr class="modalDivider" />
        <p>${newPhone}</p>
        <p class="address">${street.number} ${
    street.name
  }, ${city}, ${state} ${postcode}</p>
        <p class="birthday">Birthday:
  ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}</p>
      </div>
  `;

  //Display overlay + add modal HTML to the card
  overlay.classList.remove("hidden");
  left.style.display = "block";
  right.style.display = "block";
  modalContainer.innerHTML = modalHTML;
}
/*Add an event listener to the cards in the grid container. Note that click event excludes grid-container
because that area is OUTSIDE of the cards. Looking at targets, it' everything but that.*/
//Keeping track of index for when adding left/right arrow for scrolling through employee details

let index;

gridContainer.addEventListener("click", (e) => {
  let target = e.target;

  if (!target.classList.contains("grid-container")) {
    //Since the target can be anything in the text container, heading or card itself, get the closest card
    let nearestCard = target.closest(".card");
    //Then get the card's index attribute
    index = nearestCard.getAttribute("data-index");
    displayModal(index);
  }
});

//Add a way to move back and forth between employee detail windows when the modal window is open.

left.addEventListener("click", () => {
  if (index === 0) {
    index = 11;
    displayModal(11);
  } else {
    index--;
    displayModal(index);
  }
});

right.addEventListener("click", () => {
  if (index === 11) {
    index = 0;
    displayModal(0);
  } else {
    index++;
    displayModal(index);
  }
});

//Closing the modal window
modalClose.addEventListener("click", () => {
  overlay.classList.add("hidden");
  left.style.display = "none";
  right.style.display = "none";
});

/*Adding a search component - first by creating  variables needed and then the function to 
hide cards with unmatched names*/

const search = document.querySelector(".search");
const searchFail = document.createElement("h2");
search.insertAdjacentElement("afterend", searchFail);
searchFail.innerText = "Sorry, no results found";
searchFail.style.margin = "10px";
searchFail.style.color = "#cfdbd5";
searchFail.classList.add("searchHide");

function searchDir() {
  const searchInput = search.value.toLowerCase();
  const names = document.querySelectorAll(".name");
  let matchNo = 0;

  for (let i = 0; i < names.length; i++) {
    if (names[i].innerText.toLowerCase().includes(searchInput)) {
      matchNo += 1;
      names[i].parentNode.parentNode.classList.remove("searchHide");
      searchFail.classList.add("searchHide");
    } else if (!names[i].innerText.toLowerCase().includes(searchInput)) {
      names[i].parentNode.parentNode.classList.add("searchHide");
    } else if (!searchInput) {
      names[i].parentNode.parentNode.classList.remove("searchHide");
      searchFail.classList.add("searchHide");
    }
  }

  if (matchNo === 0) {
    searchFail.classList.remove("searchHide");
  }
}

search.addEventListener("keyup", () => {
  searchDir();
});
