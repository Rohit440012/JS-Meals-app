"use strict";
//initializing variable & selecting DOM elements
const searchInput = document.getElementById("search-input");
const list = document.querySelector(".list");
const favouriteList = document.querySelector(".favourites-list");
const favouriteLink = document.getElementById("favourites");
const searchMealLink = document.getElementById("home");
const mealHeading = document.getElementById("meal-heading");
const favouriteHeading = document.getElementById("favourite-heading");
const container = document.querySelector(".container");
const mealDetail = document.querySelector(".meal-detail");
let favourite = JSON.parse(localStorage.getItem("favourites")) || [];
let mealDetails;

//function for updating DOM
const updateUI = (meals) => {
  list.innerHTML = "";
  if (!meals) {
    list.insertAdjacentHTML(
      "beforeend",
      `<p class="no-match">No meals matching</p>`
    );
    return;
  }
  meals.forEach((meal) => {
    list.insertAdjacentHTML(
      "beforeend",
      `
        <div class="card ml">
              <img src=${meal.strMealThumb} alt="meal" />
              <h4>${meal.strMeal}</h4>
              <button class="favourite-btn" id=${meal.idMeal}>Add to favourite</button>
              <button class="details" id=${meal.idMeal}>Details</button>
              </div>
        `
    );
  });
};

//Function for optimising performance and data fetching
const debounce = (cb, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

//Data fetching function on basis of search-key
const fetchMeals = debounce(async (searchKey) => {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchKey}`
  );
  const data = await response.json();
  updateUI(data.meals);
}, 300);
searchInput.addEventListener("keyup", () => {
  fetchMeals(searchInput.value);
});

//Function for fetching meal by id
const fetchMealById = async (id) => {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const data = await response.json();
  favourite.push(data.meals[0]);
  localStorage.setItem("favourites", JSON.stringify(favourite));
};

//Adding event delegation for list
list.addEventListener("click", (e) => {
  const mealId = e.target.getAttribute("id");
  if (e.target.className === "favourite-btn") {
    if (e.target.innerText === "Add to favourite") {
      e.target.innerText = "Remove from favourite";
      fetchMealById(mealId);
    } else {
      e.target.innerText = "Add to favourite";
      favourite = favourite.filter((meal) => meal.idMeal !== mealId);
    }
  }
});

//Function for updating DOM elements
const updateFavouritesUI = () => {
  favouriteList.innerHTML = "";
  if (!favourite.length) {
    favouriteList.insertAdjacentHTML(
      "beforeend",
      `<p class="no-match">No Favourite Meal...</p>`
    );
    return;
  }
  favourite.forEach((localMeal) => {
    favouriteList.insertAdjacentHTML(
      "beforeend",
      `
    <div class="card fv">
          <img src=${localMeal.strMealThumb} alt="meal" />
          <h4>${localMeal.strMeal}</h4>
          <button class="favourite-btn" id=${localMeal.idMeal}>Remove from favourite</button>
          <button class="details" id=${localMeal.idMeal}>Details</button>
        </div>
    `
    );
  });
};

//Adding event delegation for favourites
favouriteLink.addEventListener("click", (e) => {
  e.preventDefault();
  favouriteList.classList.remove("hidden");
  list.classList.add("hidden");
  mealHeading.classList.add("hidden");
  favouriteHeading.classList.remove("hidden");
  searchInput.classList.add("hidden");
  updateFavouritesUI();
});

//Event listener for showing Search Meals page
searchMealLink.addEventListener("click", (e) => {
  e.preventDefault();
  list.classList.remove("hidden");
  favouriteList.classList.add("hidden");
  mealHeading.classList.remove("hidden");
  favouriteHeading.classList.add("hidden");
  searchInput.classList.remove("hidden");
});

//Event listener for removing meal from favourites
favouriteList.addEventListener("click", (e) => {
  const mealId = e.target.getAttribute("id");
  if (e.target.className === "favourite-btn") {
    localStorage.clear("favourites");
    favourite = favourite.filter((meal) => meal.idMeal !== mealId);
    localStorage.setItem("favourites", JSON.stringify(favourite));
  }
  updateFavouritesUI();
});

//Function for fetching meal details by id and showing in DOM
const fetchMealForDetails = async (id) => {
  mealDetail.innerHTML = "<p>Loading...</p>";
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const data = await response.json();
  mealDetails = data.meals[0];
  mealDetail.innerHTML = "";
  mealDetail.insertAdjacentHTML(
    "beforeend",
    ` <div class="card">
  <img src=${mealDetails.strMealThumb} alt="meal" />
  <h4>${mealDetails.strMeal}</h4>
  <div class="instructions">
    <span>Instructions :</span><br />
    <span class="recipe">
    ${mealDetails.strInstructions}
    </span>
  </div>
  <button class="close">Close</button>
</div>
  `
  );
};

//Function for accessing meal details from Search Meals page
const updateDetailsUIFromList = () => {
  list.classList.add("hidden");
  mealHeading.classList.add("hidden");
  searchInput.classList.add("hidden");
  searchMealLink.classList.add("hidden");
  favouriteLink.classList.add("hidden");
  mealDetail.classList.remove("hidden");
};

//Function for accessing meal details from Favourites page
const updateDetailsUIFromfavourite = () => {
  favouriteList.classList.add("hidden");
  favouriteHeading.classList.add("hidden");
  searchMealLink.classList.add("hidden");
  favouriteLink.classList.add("hidden");
  mealDetail.classList.remove("hidden");
};

//Function for closing meal details page
const closeDetailsUI = () => {
  list.classList.remove("hidden");
  mealHeading.classList.remove("hidden");
  searchInput.classList.remove("hidden");
  searchMealLink.classList.remove("hidden");
  favouriteLink.classList.remove("hidden");
  mealDetail.classList.add("hidden");
};

//Adding event delegation for container element
container.addEventListener("click", (e) => {
  if (e.target.className === "details") {
    const mealId = e.target.getAttribute("id");
    fetchMealForDetails(mealId);
    if (e.target.parentElement.className === "card ml") {
      updateDetailsUIFromList();
    }
    if (e.target.parentElement.className === "card fv") {
      updateDetailsUIFromfavourite();
    }
  }
  if (e.target.className === "close") {
    closeDetailsUI();
  }
});
