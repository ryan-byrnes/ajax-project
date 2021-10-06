const date = new Date();

const dateToday = date.toLocaleDateString();

data.date = dateToday;
const dateText = document.querySelector('.todays-date');
dateText.textContent = dateToday;

const targetSubmitButton = document.querySelector('.daily-target-submit');
targetSubmitButton.addEventListener('click', submitTargets);

if (data.targets.date !== data.date) {
  data.view = 'target-input-form';
  data.targets = {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0,
    date: data.date
  };
  data.dailyTotals = {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0
  };
  switchViews();
}

function submitTargets() {
  event.preventDefault();

  const inputForm = document.querySelector('.target-input-form');
  const inputValue = inputForm.elements;

  data.targets.calories = inputValue.calories.value;
  data.targets.protein = inputValue.protein.value;
  data.targets.fats = inputValue.fats.value;
  data.targets.carbohydrates = inputValue.carbohydrates.value;
  data.targets.date = data.date;

  data.view = 'daily-targets';
  inputForm.reset();

  const dataViewDiv = document.querySelector('div[data-view = daily-targets]');
  trackTargetProgress(dataViewDiv);
  switchViews();
  const currentMealView = document.querySelector('div[data-view="current-day-meals"');
  currentMealView.classList.remove('hidden');
  updateProgress();

}

const addMealButton = document.querySelector('.add-meal-button');
addMealButton.addEventListener('click', function () {
  const modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
});

const newMealButton = document.querySelector('.add-meal-submit');

newMealButton.addEventListener('submit', submitNewMeal);

function submitNewMeal() {

  event.preventDefault();

  data.mealEntries.push({
    date: '',
    mealName: '',
    foodItem: [{}],
    foodEntryId: 1,
    entryId: ''
  });

  data.mealEntries[data.nextMealEntryId - 1].date = dateToday;

  const inputForm = document.querySelector('.new-meal-modal-form');
  const inputValue = inputForm.elements;

  data.mealEntries[data.nextMealEntryId - 1].mealName = inputValue['meal-name'].value;
  data.mealEntries[data.nextMealEntryId - 1].foodItem[0].name = inputValue['food-item'].value;
  data.mealEntries[data.nextMealEntryId - 1].entryId = data.nextMealEntryId;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  const spinner = document.querySelector('.spinner');
  spinner.classList.toggle('hidden');
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    const tableBody = document.querySelectorAll('tbody');

    if (tableBody.length === 1) {
      tableBody[0].append(addFoodItem(data.xhrResponse));
    } else {
      tableBody[tableBody.length - 1].append(addFoodItem(data.xhrResponse));
    }

    data.mealEntries[data.mealEntries.length - 1].foodItem[0].calories = Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].protein = Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].fats = Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.mealEntries[data.mealEntries.length - 1].foodItem[0].carbohydrates = Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    data.dailyTotals.calories += Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.dailyTotals.protein += Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.dailyTotals.fats += Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.dailyTotals.carbohydrates += Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    if (data.targets.calories !== 0) {
      updateProgress();
    }
    data.nextMealEntryId += 1;
    const spinner = document.querySelector('.spinner');
    spinner.classList.toggle('hidden');
  });
  xhr.send();

  const dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  dataViewDiv.append(createNewMealEntry(data.mealEntries[data.mealEntries.entryId - 1]));

  inputForm.reset();

  const modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
}

function trackTargetProgress(element) {

  const calorieRow = document.createElement('div');
  calorieRow.setAttribute('class', 'row align-items-center');
  element.appendChild(calorieRow);

  const calorieColumnThird = document.createElement('div');
  calorieColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  calorieRow.appendChild(calorieColumnThird);

  const calorieP = document.createElement('p');
  calorieP.setAttribute('class', 'calorie-numbers font-size-h');
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  calorieColumnThird.appendChild(calorieP);

  const calorieTwoThirds = document.createElement('div');
  calorieTwoThirds.setAttribute('class', 'column-66 padding-right');
  calorieRow.appendChild(calorieTwoThirds);

  const progressBarDiv = document.createElement('div');
  progressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  calorieTwoThirds.appendChild(progressBarDiv);

  const progressFillDiv = document.createElement('div');
  progressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%');
  progressFillDiv.setAttribute('class', 'fill-progress-calories progress text-align-center padding-top-3');
  progressBarDiv.appendChild(progressFillDiv);

  const progressFillText = document.createElement('p');
  progressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold calories-text');
  progressFillText.textContent = progressFillDiv.style.width;
  progressFillDiv.appendChild(progressFillText);

  const proteinRow = document.createElement('div');
  proteinRow.setAttribute('class', 'row align-items-center');
  element.appendChild(proteinRow);

  const proteinColumnThird = document.createElement('div');
  proteinColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  proteinRow.appendChild(proteinColumnThird);

  const proteinP = document.createElement('p');
  proteinP.setAttribute('class', 'protein-numbers font-size-h');
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';
  proteinColumnThird.appendChild(proteinP);

  const proteinTwoThirds = document.createElement('div');
  proteinTwoThirds.setAttribute('class', 'column-66 padding-right');
  proteinRow.appendChild(proteinTwoThirds);

  const proteinProgressBarDiv = document.createElement('div');
  proteinProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  proteinTwoThirds.appendChild(proteinProgressBarDiv);

  const proteinProgressFillDiv = document.createElement('div');
  proteinProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%');
  proteinProgressFillDiv.setAttribute('class', 'fill-progress-protein progress text-align-center padding-top-3');
  proteinProgressBarDiv.appendChild(proteinProgressFillDiv);

  const proteinProgressFillText = document.createElement('p');
  proteinProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold protein-progress-text');
  proteinProgressFillText.textContent = proteinProgressFillDiv.style.width;
  proteinProgressFillDiv.appendChild(proteinProgressFillText);

  const fatsRow = document.createElement('div');
  fatsRow.setAttribute('class', 'row align-items-center');
  element.appendChild(fatsRow);

  const fatsColumnThird = document.createElement('div');
  fatsColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  fatsRow.appendChild(fatsColumnThird);

  const fatsP = document.createElement('p');
  fatsP.setAttribute('class', 'fats-numbers font-size-h');
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';
  fatsColumnThird.appendChild(fatsP);

  const fatsTwoThirds = document.createElement('div');
  fatsTwoThirds.setAttribute('class', 'column-66 padding-right');
  fatsRow.appendChild(fatsTwoThirds);

  const fatsProgressBarDiv = document.createElement('div');
  fatsProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  fatsTwoThirds.appendChild(fatsProgressBarDiv);

  const fatsProgressFillDiv = document.createElement('div');
  fatsProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%');
  fatsProgressFillDiv.setAttribute('class', 'fill-progress-fats progress text-align-center padding-top-3');
  fatsProgressBarDiv.appendChild(fatsProgressFillDiv);

  const fatsProgressFillText = document.createElement('p');
  fatsProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold fats-progress-text');
  fatsProgressFillText.textContent = fatsProgressFillDiv.style.width;
  fatsProgressFillDiv.appendChild(fatsProgressFillText);

  const carbohydratesRow = document.createElement('div');
  carbohydratesRow.setAttribute('class', 'row align-items-center');
  element.appendChild(carbohydratesRow);

  const carbohydratesColumnThird = document.createElement('div');
  carbohydratesColumnThird.setAttribute('class', 'flex-basis-40 flex-media');
  carbohydratesRow.appendChild(carbohydratesColumnThird);

  const carbohydratesP = document.createElement('p');
  carbohydratesP.setAttribute('class', 'carbohydrates-numbers font-size-h');
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';
  carbohydratesColumnThird.appendChild(carbohydratesP);

  const carbohydratesTwoThirds = document.createElement('div');
  carbohydratesTwoThirds.setAttribute('class', 'column-66 padding-right');
  carbohydratesRow.appendChild(carbohydratesTwoThirds);

  const carbohydratesProgressBarDiv = document.createElement('div');
  carbohydratesProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  carbohydratesTwoThirds.appendChild(carbohydratesProgressBarDiv);

  const carbohydratesProgressFillDiv = document.createElement('div');
  carbohydratesProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%');
  carbohydratesProgressFillDiv.setAttribute('class', 'fill-progress-carbohydrates progress text-align-center padding-top-3');
  carbohydratesProgressBarDiv.appendChild(carbohydratesProgressFillDiv);

  const carbohydratesProgressFillText = document.createElement('p');
  carbohydratesProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold carbohydrates-progress-text');
  carbohydratesProgressFillText.textContent = carbohydratesProgressFillDiv.style.width;
  carbohydratesProgressFillDiv.appendChild(carbohydratesProgressFillText);

  return element;

}

function switchViews() {
  const dataViewElements = document.querySelectorAll('div[data-view]');
  for (let i = 0; i < dataViewElements.length; i++) {
    if (data.view === dataViewElements[i].getAttribute('data-view')) {
      dataViewElements[i].classList.remove('hidden');
    } else {
      dataViewElements[i].classList.add('hidden');
    }
  }
}

function createNewMealEntry(entry) {

  const showMeal = document.querySelector('div[data-view="current-day-meals"]');
  showMeal.classList.remove('hidden');

  const tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table-div row justify-content-center');

  const table = document.createElement('table');
  table.setAttribute('class', 'table');
  tableDiv.append(table);

  const tableHead = document.createElement('thead');
  table.append(tableHead);

  const tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-10 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  const addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (let i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  const dateDiv = document.createElement('div');
  dateDiv.setAttribute('class', 'meal-date-td');
  tableHeadRow.append(dateDiv);

  const tdDate = document.createElement('td');
  tdDate.setAttribute('class', 'meal-date-td');
  for (let i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  const tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row font-weight-bold');
  tableHead.append(tableHeadRow2);

  const tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'flex-basis-40');
  tdFoodItem.textContent = 'Food Item';
  tableHeadRow2.append(tdFoodItem);

  const tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'flex-basis-15');
  tdCalories.textContent = 'Calories';
  tableHeadRow2.append(tdCalories);

  const tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'flex-basis-15');
  tdProtein.textContent = 'Protein';
  tableHeadRow2.append(tdProtein);

  const tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'flex-basis-15');
  tdFats.textContent = 'Fats';
  tableHeadRow2.append(tdFats);

  const tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'flex-basis-15');
  tdCarbohydrates.textContent = 'Carbs';
  tableHeadRow2.append(tdCarbohydrates);

  const tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  const tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  const tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold add-new-food-item color-navy');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  return tableDiv;

}

function addFoodItem(entry) {
  const tableBodyRow = document.createElement('tr');
  tableBodyRow.setAttribute('class', 'row');

  const tdFoodItemName = document.createElement('td');
  tdFoodItemName.setAttribute('class', 'flex-basis-40');
  tdFoodItemName.textContent = data.xhrResponse.text;
  tableBodyRow.append(tdFoodItemName);

  const tdCaloriesValue = document.createElement('td');
  tdCaloriesValue.setAttribute('class', 'flex-basis-15');
  tdCaloriesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
  tableBodyRow.append(tdCaloriesValue);

  const tdProteinValue = document.createElement('td');
  tdProteinValue.setAttribute('class', 'flex-basis-15');
  tdProteinValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
  tableBodyRow.append(tdProteinValue);

  const tdFatsValue = document.createElement('td');
  tdFatsValue.setAttribute('class', 'flex-basis-15');
  tdFatsValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
  tableBodyRow.append(tdFatsValue);

  const tdCarbohydratesValue = document.createElement('td');
  tdCarbohydratesValue.setAttribute('class', 'flex-basis-15');
  tdCarbohydratesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);
  tableBodyRow.append(tdCarbohydratesValue);

  const deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('class', 'fas fa-minus-circle padding-left-35 delete-icon');
  tdCarbohydratesValue.append(deleteIcon);

  data.mealEntries[data.mealEntries.length - 1].foodEntryId += 1;

  return tableBodyRow;

}
let eventTarget;
document.addEventListener('click', function openAddFoodItemModal() {
  if (event.target.id === 'add-new-food-item') {
    eventTarget = event.target;
    const showModal = document.querySelector('.add-food-item-modal');
    showModal.classList.toggle('hidden');
  }
});
const addNewItemButton = document.querySelector('.add-next-food-item');
addNewItemButton.addEventListener('submit', addNextFoodItem);

function addNextFoodItem() {
  event.preventDefault();
  const inputForm = document.querySelector('.next-item-modal-form');
  const inputValue = inputForm.elements;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['new-food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  const spinner = document.querySelector('.spinner');
  spinner.classList.toggle('hidden');
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    eventTarget.closest('tbody').append(addFoodItem(data.xhrResponse));

    data.dailyTotals.calories += Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.dailyTotals.protein += Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.dailyTotals.fats += Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.dailyTotals.carbohydrates += Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    for (let i = 0; i < data.mealEntries.length; i++) {

      if (data.mealEntries[i].mealName === eventTarget.closest('table').querySelector('.meal-name-td').textContent) {
        data.mealEntries[i].foodItem.push({
          name: data.xhrResponse.text,
          calories: Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL),
          protein: Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT),
          fats: Math.round(data.xhrResponse.hints[0].food.nutrients.FAT),
          carbohydrates: Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF)
        });
      }
    }
    if (data.view === 'meal-log' && eventTarget.closest('table').querySelector('.meal-name-td').nextSibling.nextSibling.textContent === data.date) {
      updateProgress();
    } else if (data.view !== 'meal-log') {
      updateProgress();
    }
    const spinner = document.querySelector('.spinner');
    spinner.classList.toggle('hidden');
  });
  xhr.send();
  inputForm.reset();
  const showModal = document.querySelector('.add-food-item-modal');
  showModal.classList.toggle('hidden');
}

function showTodaysMeals(entry) {

  const tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table');

  const table = document.createElement('table');
  tableDiv.append(table);

  const tableHead = document.createElement('thead');
  table.append(tableHead);

  const tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-10 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  const addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  const dateDiv = document.createElement('div');
  tableHeadRow.append(dateDiv);

  const tdDate = document.createElement('td');
  tdDate.setAttribute('class', 'td-date');
  for (i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  const tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row width-95 font-weight-bold');
  tableHead.append(tableHeadRow2);

  const tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'flex-basis-40 font-size-h');
  tdFoodItem.textContent = 'Food Item';
  tableHeadRow2.append(tdFoodItem);

  const tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'flex-basis-15 font-size-h');
  tdCalories.textContent = 'Calories';
  tableHeadRow2.append(tdCalories);

  const tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
  tdProtein.textContent = 'Protein';
  tableHeadRow2.append(tdProtein);

  const tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
  tdFats.textContent = 'Fats';
  tableHeadRow2.append(tdFats);

  const tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
  tdCarbohydrates.textContent = 'Carbs';
  tableHeadRow2.append(tdCarbohydrates);

  const tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  const tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  const tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold add-new-food-item color-navy font-size-h');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  function createFoodItem() {

    const tableBodyRow = document.createElement('tr');
    tableBodyRow.setAttribute('class', 'row align-items-end');
    tableBody.append(tableBodyRow);

    const tdFoodItemName = document.createElement('td');
    tdFoodItemName.setAttribute('class', 'flex-basis-40 font-size-h');
    tdFoodItemName.textContent = data.mealEntries[i].foodItem[item].name;
    tableBodyRow.append(tdFoodItemName);

    const tdCaloriesValue = document.createElement('td');
    tdCaloriesValue.setAttribute('class', 'flex-basis-15 font-size-h');
    tdCaloriesValue.textContent = data.mealEntries[i].foodItem[item].calories;
    tableBodyRow.append(tdCaloriesValue);

    const tdProteinValue = document.createElement('td');
    tdProteinValue.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
    tdProteinValue.textContent = data.mealEntries[i].foodItem[item].protein;
    tableBodyRow.append(tdProteinValue);

    const tdFatsValue = document.createElement('td');
    tdFatsValue.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
    tdFatsValue.textContent = data.mealEntries[i].foodItem[item].fats;
    tableBodyRow.append(tdFatsValue);

    const tdCarbohydratesValue = document.createElement('td');
    tdCarbohydratesValue.setAttribute('class', 'flex-basis-15 font-size-h padding-left-media');
    tdCarbohydratesValue.textContent = data.mealEntries[i].foodItem[item].carbohydrates;
    tableBodyRow.append(tdCarbohydratesValue);

    const deleteIcon = document.createElement('i');
    deleteIcon.setAttribute('class', 'fas fa-minus-circle padding-left-35 delete-icon font-size-h flex-basis-15');
    tdCarbohydratesValue.append(deleteIcon);

  }

  for (let i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      for (var item = 0; item < data.mealEntries[i].foodItem.length; item++) {
        createFoodItem();
      }
    }
  }

  return tableDiv;
}

const mealLog = document.querySelector('.meal-log-view');

mealLog.addEventListener('click', function () {
  const dataMealLog = document.querySelector('div[data-view="meal-log"]');
  data.view = 'meal-log';
  for (let i = data.mealEntries.length - 1; i >= 0; i--) {
    dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
  }
  switchViews();

  const dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  const mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');
});

const homePageView = document.querySelector('.home-page-view');

homePageView.addEventListener('click', function () {
  if (data.targets.calories === 0) {
    data.view = 'target-input-form';
  } else {
    data.view = 'daily-targets';
  }

  const dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  const mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');

  switchViews();

  const currentMeals = document.querySelector('div[data-view="current-day-meals"]');
  currentMeals.classList.remove('hidden');
});

window.addEventListener('DOMContentLoaded', function () {
  const formDataView = document.querySelector('div[data-view = target-input-form]');
  const trackingView = document.querySelector('div[data-view = daily-targets]');

  switchViews();

  if (data.targets.calories !== 0 && data.mealEntries.length > 0 && data.mealEntries[data.mealEntries.length - 1].date === data.date && data.view !== 'meal-log') {
    trackTargetProgress(trackingView);
    updateProgress();
    formDataView.classList.add('hidden');
    trackingView.classList.remove('hidden');

  }
  const dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  for (let i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].date === data.date && data.view !== 'meal-log') {
      dataViewDiv.append(showTodaysMeals(data.mealEntries[i]));
      dataViewDiv.classList.remove('hidden');
    }
  }

  const dataMealLog = document.querySelector('div[data-view="meal-log"]');
  if (data.view === 'meal-log') {

    if (data.mealEntries.length < 1) {
      const noEntries = document.querySelector('.no-entries');
      noEntries.classList.toggle('hidden');
    }

    for (let i = data.mealEntries.length - 1; i >= 0; i--) {

      dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
    }
    const dailySummary = document.querySelector('.daily-summary-heading');
    dailySummary.classList.add('hidden');
    const mealButton = document.querySelector('.meal-button');
    mealButton.classList.add('hidden');
  }
});

function updateProgress() {
  if (data.view === 'daily-targets') {
    const calorieP = document.querySelector('.calorie-numbers');
    calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';

    const fillProgressCalories = document.querySelector('.fill-progress-calories');
    fillProgressCalories.style.width = Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%';
    const calorieLimit = Math.round(data.dailyTotals.calories / data.targets.calories * 100);
    if (calorieLimit > 100) {
      fillProgressCalories.style.backgroundColor = 'red';
    }

    const caloriesText = document.querySelector('.calories-text');
    caloriesText.textContent = fillProgressCalories.style.width;

    const proteinP = document.querySelector('.protein-numbers');
    proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';

    const fillProgressProtein = document.querySelector('.fill-progress-protein');
    fillProgressProtein.style.width = Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%';
    const proteinLimit = Math.round(data.dailyTotals.protein / data.targets.protein * 100);
    if (proteinLimit > 100) {
      fillProgressProtein.style.backgroundColor = 'red';
    }

    const proteinText = document.querySelector('.protein-progress-text');
    proteinText.textContent = fillProgressProtein.style.width;

    const fatsP = document.querySelector('.fats-numbers');
    fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';

    const fillProgressFats = document.querySelector('.fill-progress-fats');
    fillProgressFats.style.width = Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%';
    const fatsLimit = Math.round(data.dailyTotals.fats / data.targets.fats * 100);
    if (fatsLimit > 100) {
      fillProgressFats.style.backgroundColor = 'red';
    }

    const fatsText = document.querySelector('.fats-progress-text');
    fatsText.textContent = fillProgressFats.style.width;

    const carbohydratesP = document.querySelector('.carbohydrates-numbers');
    carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';

    const fillProgressCarbohydrates = document.querySelector('.fill-progress-carbohydrates');
    fillProgressCarbohydrates.style.width = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%';
    const carbohydratesLimit = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100);
    if (carbohydratesLimit > 100) {
      fillProgressCarbohydrates.style.backgroundColor = 'red';
    }

    const carbohydratesText = document.querySelector('.carbohydrates-progress-text');
    carbohydratesText.textContent = fillProgressCarbohydrates.style.width;
  }
}

const deleteIconListener = document.querySelector('body');

deleteIconListener.addEventListener('click', showDeleteModal);

let deleteTargetElement;

function showDeleteModal() {
  if (event.target.tagName === 'I') {
    const deleteModal = document.querySelector('.delete-food-item-modal');
    deleteModal.classList.remove('hidden');
    deleteTargetElement = event.target;
  }
}

const confirmDeleteButton = document.querySelector('.delete-button');

confirmDeleteButton.addEventListener('click', deleteFoodItem);

function deleteFoodItem() {

  for (let i = 0; i < data.mealEntries.length; i++) {
    if (deleteTargetElement.closest('table').firstChild.firstChild.firstChild.nextSibling.nextSibling.textContent === data.mealEntries[i].date && deleteTargetElement.closest('table').firstChild.firstChild.firstChild.textContent === data.mealEntries[i].mealName) {
      for (let k = 0; k < data.mealEntries[i].foodItem.length; k++) {
        if (deleteTargetElement.closest('tr').firstChild.textContent === data.mealEntries[i].foodItem[k].name) {
          data.mealEntries[i].foodItem.splice(k, 1);
          const deleteModal = document.querySelector('.delete-food-item-modal');
          deleteModal.classList.add('hidden');
        }
      }
    }
  }
  location.reload();
}
