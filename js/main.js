
var date = new Date();
var month = date.getUTCMonth() + 1;
var day = date.getUTCDate();
var year = date.getUTCFullYear();

var dateToday = month + '/' + day + '/' + year;

data.date = dateToday;
var dateText = document.querySelector('.todays-date');
dateText.textContent = dateToday;

var targetSubmitButton = document.querySelector('.daily-target-submit');
targetSubmitButton.addEventListener('click', submitTargets);

function submitTargets() {
  event.preventDefault();

  var inputForm = document.querySelector('.target-input-form');
  var inputValue = inputForm.elements;

  data.targets.calories = inputValue.calories.value;
  data.targets.protein = inputValue.protein.value;
  data.targets.fats = inputValue.fats.value;
  data.targets.carbohydrates = inputValue.carbohydrates.value;

  data.view = 'daily-targets';
  inputForm.reset();

  var dataViewDiv = document.querySelector('div[data-view = daily-targets]');
  trackTargetProgress(dataViewDiv);
  switchViews();
  var currentMealView = document.querySelector('div[data-view="current-day-meals"');
  currentMealView.classList.remove('hidden');

}

var addMealButton = document.querySelector('.add-meal-button');
addMealButton.addEventListener('click', function () {
  var modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
});

var newMealButton = document.querySelector('.add-meal-submit');

newMealButton.addEventListener('click', submitNewMeal);

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

  var inputForm = document.querySelector('.new-meal-modal-form');
  var inputValue = inputForm.elements;

  data.mealEntries[data.nextMealEntryId - 1].mealName = inputValue['meal-name'].value;
  data.mealEntries[data.nextMealEntryId - 1].foodItem[0].name = inputValue['food-item'].value;
  data.mealEntries[data.nextMealEntryId - 1].entryId = data.nextMealEntryId;

  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    var tableBody = document.querySelectorAll('tbody');

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
  });
  xhr.send();

  var dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  dataViewDiv.append(createNewMealEntry(data.mealEntries[data.mealEntries.entryId - 1]));

  inputForm.reset();

  var modalDiv = document.querySelector('div[data-view=new-meal-modal');
  modalDiv.classList.toggle('hidden');
}

function trackTargetProgress(element) {

  /*
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-calories">Calories: 0/0 kcal</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 100%;" class="fill-progress-calories progress text-align-center padding-top-3">
                <p class="text-progress-calories margin-top-0 color-white font-weight-bold">100%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-protein">Protein: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 75%;" class="fill-progress-protein progress text-align-center padding-top-3">
                <p class="text-progress-protein margin-top-0 color-white font-weight-bold">75%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-fats">Fats: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 50%;" class="fill-progress-fats progress text-align-center padding-top-3">
                <p class="text-progress-fats margin-top-0 color-white font-weight-bold">50%</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="column-33">
            <p class="daily-target-carbohydrates">Carbohydrates: 0/0g</p>
          </div>
          <div class="column-66 padding-right">
            <div class="progress-bar background-color-white row align-items-center">
              <div style="width: 25%;" class="fill-progress-carbohydrates progress text-align-center padding-top-3">
                <p class="text-progress-carbohydrates margin-top-0 color-white font-weight-bold">25%</p>
              </div>
            </div>
          </div>
        </div>
*/

  var calorieRow = document.createElement('div');
  calorieRow.setAttribute('class', 'row align-items-center');
  element.appendChild(calorieRow);

  var calorieColumnThird = document.createElement('div');
  calorieColumnThird.setAttribute('class', 'column-33');
  calorieRow.appendChild(calorieColumnThird);

  var calorieP = document.createElement('p');
  calorieP.setAttribute('class', 'calorie-numbers');
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  calorieColumnThird.appendChild(calorieP);

  var calorieTwoThirds = document.createElement('div');
  calorieTwoThirds.setAttribute('class', 'column-66 padding-right');
  calorieRow.appendChild(calorieTwoThirds);

  var progressBarDiv = document.createElement('div');
  progressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  calorieTwoThirds.appendChild(progressBarDiv);

  var progressFillDiv = document.createElement('div');
  progressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%');
  progressFillDiv.setAttribute('class', 'fill-progress-calories progress text-align-center padding-top-3');
  progressBarDiv.appendChild(progressFillDiv);

  var progressFillText = document.createElement('p');
  progressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold calories-text');
  progressFillText.textContent = progressFillDiv.style.width;
  progressFillDiv.appendChild(progressFillText);

  // Protein

  var proteinRow = document.createElement('div');
  proteinRow.setAttribute('class', 'row align-items-center');
  element.appendChild(proteinRow);

  var proteinColumnThird = document.createElement('div');
  proteinColumnThird.setAttribute('class', 'column-33');
  proteinRow.appendChild(proteinColumnThird);

  var proteinP = document.createElement('p');
  proteinP.setAttribute('class', 'protein-numbers');
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';
  proteinColumnThird.appendChild(proteinP);

  var proteinTwoThirds = document.createElement('div');
  proteinTwoThirds.setAttribute('class', 'column-66 padding-right');
  proteinRow.appendChild(proteinTwoThirds);

  var proteinProgressBarDiv = document.createElement('div');
  proteinProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  proteinTwoThirds.appendChild(proteinProgressBarDiv);

  var proteinProgressFillDiv = document.createElement('div');
  proteinProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%');
  proteinProgressFillDiv.setAttribute('class', 'fill-progress-protein progress text-align-center padding-top-3');
  proteinProgressBarDiv.appendChild(proteinProgressFillDiv);

  var proteinProgressFillText = document.createElement('p');
  proteinProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold protein-progress-text');
  proteinProgressFillText.textContent = proteinProgressFillDiv.style.width;
  proteinProgressFillDiv.appendChild(proteinProgressFillText);

  // Fats

  var fatsRow = document.createElement('div');
  fatsRow.setAttribute('class', 'row align-items-center');
  element.appendChild(fatsRow);

  var fatsColumnThird = document.createElement('div');
  fatsColumnThird.setAttribute('class', 'column-33');
  fatsRow.appendChild(fatsColumnThird);

  var fatsP = document.createElement('p');
  fatsP.setAttribute('class', 'fats-numbers');
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';
  fatsColumnThird.appendChild(fatsP);

  var fatsTwoThirds = document.createElement('div');
  fatsTwoThirds.setAttribute('class', 'column-66 padding-right');
  fatsRow.appendChild(fatsTwoThirds);

  var fatsProgressBarDiv = document.createElement('div');
  fatsProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  fatsTwoThirds.appendChild(fatsProgressBarDiv);

  var fatsProgressFillDiv = document.createElement('div');
  fatsProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%');
  fatsProgressFillDiv.setAttribute('class', 'fill-progress-fats progress text-align-center padding-top-3');
  fatsProgressBarDiv.appendChild(fatsProgressFillDiv);

  var fatsProgressFillText = document.createElement('p');
  fatsProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold fats-progress-text');
  fatsProgressFillText.textContent = fatsProgressFillDiv.style.width;
  fatsProgressFillDiv.appendChild(fatsProgressFillText);

  // Carbs

  var carbohydratesRow = document.createElement('div');
  carbohydratesRow.setAttribute('class', 'row align-items-center');
  element.appendChild(carbohydratesRow);

  var carbohydratesColumnThird = document.createElement('div');
  carbohydratesColumnThird.setAttribute('class', 'column-33');
  carbohydratesRow.appendChild(carbohydratesColumnThird);

  var carbohydratesP = document.createElement('p');
  carbohydratesP.setAttribute('class', 'carbohydrates-numbers');
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';
  carbohydratesColumnThird.appendChild(carbohydratesP);

  var carbohydratesTwoThirds = document.createElement('div');
  carbohydratesTwoThirds.setAttribute('class', 'column-66 padding-right');
  carbohydratesRow.appendChild(carbohydratesTwoThirds);

  var carbohydratesProgressBarDiv = document.createElement('div');
  carbohydratesProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  carbohydratesTwoThirds.appendChild(carbohydratesProgressBarDiv);

  var carbohydratesProgressFillDiv = document.createElement('div');
  carbohydratesProgressFillDiv.setAttribute('style', 'width: ' + Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%');
  carbohydratesProgressFillDiv.setAttribute('class', 'fill-progress-carbohydrates progress text-align-center padding-top-3');
  carbohydratesProgressBarDiv.appendChild(carbohydratesProgressFillDiv);

  var carbohydratesProgressFillText = document.createElement('p');
  carbohydratesProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold carbohydrates-progress-text');
  carbohydratesProgressFillText.textContent = carbohydratesProgressFillDiv.style.width;
  carbohydratesProgressFillDiv.appendChild(carbohydratesProgressFillText);

  return element;

}

function switchViews() {
  // debugger;
  var dataViewElements = document.querySelectorAll('div[data-view]');
  for (var i = 0; i < dataViewElements.length; i++) {
    if (data.view === dataViewElements[i].getAttribute('data-view')) {
      dataViewElements[i].classList.remove('hidden');
    } else {
      dataViewElements[i].classList.add('hidden');
    }
  }
}

function createNewMealEntry(entry) {

  var showMeal = document.querySelector('div[data-view="current-day-meals"]');
  showMeal.classList.remove('hidden');

  /*  <div id="entry-date">
      <h3>Date</h3>
      </div>
      <div class="table">
        <table>
          <thead>
            <tr class=" margin-top-50 padding-left-20 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold">
              <td>Your Daily Summary</td>
              <div>
                <td class="todays-date">Date</td>
              </div>
            </tr>
            <tr class="heading-row row font-weight-bold">
              <td class="flex-basis-40">Food Item</td>
              <td class="flex-basis-15">Calories</td>
              <td class="flex-basis-15">Protein</td>
              <td class="flex-basis-15">Fats</td>
              <td class="flex-basis-15">Carbs</td>
            </tr>
          </thead>
          <tbody class="space-under">
            <tr>
              <td class="font-weight-bold"><a class="color-navy" href="">Add Food Item</a></td>
            </tr>
          </tbody>
        </table>
      </div>
*/
  var tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table');

  var table = document.createElement('table');
  tableDiv.append(table);

  var tableHead = document.createElement('thead');
  table.append(tableHead);

  var tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-20 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  var addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  var dateDiv = document.createElement('div');
  tableHeadRow.append(dateDiv);

  var tdDate = document.createElement('td');
  for (i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  var tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row font-weight-bold');
  tableHead.append(tableHeadRow2);

  var tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'flex-basis-40');
  tdFoodItem.textContent = 'Food Item';
  tableHeadRow2.append(tdFoodItem);

  var tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'flex-basis-15');
  tdCalories.textContent = 'Calories';
  tableHeadRow2.append(tdCalories);

  var tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'flex-basis-15');
  tdProtein.textContent = 'Protein';
  tableHeadRow2.append(tdProtein);

  var tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'flex-basis-15');
  tdFats.textContent = 'Fats';
  tableHeadRow2.append(tdFats);

  var tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'flex-basis-15');
  tdCarbohydrates.textContent = 'Carbs';
  tableHeadRow2.append(tdCarbohydrates);

  var tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  var tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  var tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold add-new-food-item color-navy');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  return tableDiv;

}

function addFoodItem(entry) {
  var tableBodyRow = document.createElement('tr');
  tableBodyRow.setAttribute('class', 'row');

  var tdFoodItemName = document.createElement('td');
  tdFoodItemName.setAttribute('class', 'flex-basis-40');
  tdFoodItemName.textContent = data.xhrResponse.text;
  tableBodyRow.append(tdFoodItemName);

  var tdCaloriesValue = document.createElement('td');
  tdCaloriesValue.setAttribute('class', 'flex-basis-15');
  tdCaloriesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
  tableBodyRow.append(tdCaloriesValue);

  var tdProteinValue = document.createElement('td');
  tdProteinValue.setAttribute('class', 'flex-basis-15');
  tdProteinValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
  tableBodyRow.append(tdProteinValue);

  var tdFatsValue = document.createElement('td');
  tdFatsValue.setAttribute('class', 'flex-basis-15');
  tdFatsValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
  tableBodyRow.append(tdFatsValue);

  var tdCarbohydratesValue = document.createElement('td');
  tdCarbohydratesValue.setAttribute('class', 'flex-basis-15');
  tdCarbohydratesValue.textContent = Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);
  tableBodyRow.append(tdCarbohydratesValue);

  var deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('class', 'fas fa-minus-circle padding-left-35 delete-icon');
  tdCarbohydratesValue.append(deleteIcon);

  data.mealEntries[data.mealEntries.length - 1].foodEntryId += 1;

  return tableBodyRow;

}
var eventTarget;
document.addEventListener('click', function openAddFoodItemModal() {
  if (event.target.id === 'add-new-food-item') {
    eventTarget = event.target;
    var showModal = document.querySelector('.add-food-item-modal');
    showModal.classList.toggle('hidden');
  }
});
var addNewItemButton = document.querySelector('.add-next-food-item');
addNewItemButton.addEventListener('click', addNextFoodItem);

function addNextFoodItem() {
  event.preventDefault();
  var inputForm = document.querySelector('.next-item-modal-form');
  var inputValue = inputForm.elements;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['new-food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {

    data.xhrResponse = xhr.response;
    eventTarget.closest('tbody').append(addFoodItem(data.xhrResponse));

    data.dailyTotals.calories += Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL);
    data.dailyTotals.protein += Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT);
    data.dailyTotals.fats += Math.round(data.xhrResponse.hints[0].food.nutrients.FAT);
    data.dailyTotals.carbohydrates += Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF);

    for (var i = 0; i < data.mealEntries.length; i++) {

      if (data.mealEntries[i].mealName === eventTarget.closest('table').firstChild.firstChild.firstChild.textContent) {
        data.mealEntries[i].foodItem.push({
          name: data.xhrResponse.text,
          calories: Math.round(data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL),
          protein: Math.round(data.xhrResponse.hints[0].food.nutrients.PROCNT),
          fats: Math.round(data.xhrResponse.hints[0].food.nutrients.FAT),
          carbohydrates: Math.round(data.xhrResponse.hints[0].food.nutrients.CHOCDF)
        });
      }
    }
    if (data.view === 'meal-log' && eventTarget.closest('table').firstChild.firstChild.firstChild.nextSibling.nextSibling.textContent === data.date) {
      updateProgress();
    } else if (data.view !== 'meal-log') {
      updateProgress();
    }
  });
  xhr.send();
  inputForm.reset();
  var showModal = document.querySelector('.add-food-item-modal');
  showModal.classList.toggle('hidden');
}

function showTodaysMeals(entry) {

  var tableDiv = document.createElement('div');
  tableDiv.setAttribute('class', 'table');

  var table = document.createElement('table');
  tableDiv.append(table);

  var tableHead = document.createElement('thead');
  table.append(tableHead);

  var tableHeadRow = document.createElement('tr');
  tableHeadRow.setAttribute('class', 'margin-top-50 padding-left-20 padding-right form-header row justify-content-space-between background-color-navy margin-top-50 align-items-center color-white font-weight-bold');
  tableHead.append(tableHeadRow);

  var addMealName = document.createElement('td');
  addMealName.setAttribute('class', 'meal-name-td');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      addMealName.textContent = data.mealEntries[i].mealName;
    }
  }
  tableHeadRow.appendChild(addMealName);

  var dateDiv = document.createElement('div');
  tableHeadRow.append(dateDiv);

  var tdDate = document.createElement('td');
  for (i = 0; i < data.mealEntries.length; i++) {
    if (i === data.mealEntries[i].entryId - 1) {
      tdDate.textContent = data.mealEntries[i].date;
    }
  }
  tableHeadRow.append(tdDate);

  var tableHeadRow2 = document.createElement('tr');
  tableHeadRow2.setAttribute('class', 'heading-row row font-weight-bold');
  tableHead.append(tableHeadRow2);

  var tdFoodItem = document.createElement('td');
  tdFoodItem.setAttribute('class', 'flex-basis-40');
  tdFoodItem.textContent = 'Food Item';
  tableHeadRow2.append(tdFoodItem);

  var tdCalories = document.createElement('td');
  tdCalories.setAttribute('class', 'flex-basis-15');
  tdCalories.textContent = 'Calories';
  tableHeadRow2.append(tdCalories);

  var tdProtein = document.createElement('td');
  tdProtein.setAttribute('class', 'flex-basis-15');
  tdProtein.textContent = 'Protein';
  tableHeadRow2.append(tdProtein);

  var tdFats = document.createElement('td');
  tdFats.setAttribute('class', 'flex-basis-15');
  tdFats.textContent = 'Fats';
  tableHeadRow2.append(tdFats);

  var tdCarbohydrates = document.createElement('td');
  tdCarbohydrates.setAttribute('class', 'flex-basis-15');
  tdCarbohydrates.textContent = 'Carbs';
  tableHeadRow2.append(tdCarbohydrates);

  var tableBody = document.createElement('tbody');
  tableBody.setAttribute('class', 'table-body-append');
  table.append(tableBody);

  var tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  var tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold add-new-food-item color-navy');
  tdAddFoodItem.setAttribute('id', 'add-new-food-item');
  tdAddFoodItem.textContent = 'Add Food Item';
  tableBodyRow2.append(tdAddFoodItem);

  function createFoodItem() {

    var tableBodyRow = document.createElement('tr');
    tableBodyRow.setAttribute('class', 'row');
    tableBody.append(tableBodyRow);

    var tdFoodItemName = document.createElement('td');
    tdFoodItemName.setAttribute('class', 'flex-basis-40');
    tdFoodItemName.textContent = data.mealEntries[i].foodItem[item].name;
    tableBodyRow.append(tdFoodItemName);

    var tdCaloriesValue = document.createElement('td');
    tdCaloriesValue.setAttribute('class', 'flex-basis-15');
    tdCaloriesValue.textContent = data.mealEntries[i].foodItem[item].calories;
    tableBodyRow.append(tdCaloriesValue);

    var tdProteinValue = document.createElement('td');
    tdProteinValue.setAttribute('class', 'flex-basis-15');
    tdProteinValue.textContent = data.mealEntries[i].foodItem[item].protein;
    tableBodyRow.append(tdProteinValue);

    var tdFatsValue = document.createElement('td');
    tdFatsValue.setAttribute('class', 'flex-basis-15');
    tdFatsValue.textContent = data.mealEntries[i].foodItem[item].fats;
    tableBodyRow.append(tdFatsValue);

    var tdCarbohydratesValue = document.createElement('td');
    tdCarbohydratesValue.setAttribute('class', 'flex-basis-15');
    tdCarbohydratesValue.textContent = data.mealEntries[i].foodItem[item].carbohydrates;
    tableBodyRow.append(tdCarbohydratesValue);

    var deleteIcon = document.createElement('i');
    deleteIcon.setAttribute('class', 'fas fa-minus-circle padding-left-35 delete-icon');
    tdCarbohydratesValue.append(deleteIcon);

  }

  for (i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].entryId === entry.entryId) {
      for (var item = 0; item < data.mealEntries[i].foodItem.length; item++) {
        createFoodItem();
      }
    }
  }

  // if (data.view === 'meal-log') {
  //   var dateLabelDiv = document.createElement('div');
  //   dateLabelDiv.setAttribute('class', 'margin-top-50');

  //   var dateLabelText = document.createElement('h3');
  //   dateLabelText.setAttribute('class', 'log-date');
  //   dateLabelText.textContent = entry.date;
  //   dateLabelDiv.append(dateLabelText);

  //   dateLabelDiv.append(tableDiv);

  //   return dateLabelDiv;
  // }

  return tableDiv;
}

var mealLog = document.querySelector('.meal-log-view');

mealLog.addEventListener('click', function () {
  var dataMealLog = document.querySelector('div[data-view="meal-log"]');
  data.view = 'meal-log';
  for (var i = data.mealEntries.length - 1; i >= 0; i--) {
    dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
  }
  switchViews();

  var dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  var mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');
});

var homePageView = document.querySelector('.home-page-view');

homePageView.addEventListener('click', function () {
  if (data.targets.calories === 0) {
    data.view = 'target-input-form';
  } else {
    data.view = 'daily-targets';
  }

  var dailySummary = document.querySelector('.daily-summary-heading');
  dailySummary.classList.add('hidden');
  var mealButton = document.querySelector('.meal-button');
  mealButton.classList.add('hidden');

  switchViews();

  var currentMeals = document.querySelector('div[data-view="current-day-meals"]');
  currentMeals.classList.remove('hidden');
});

window.addEventListener('DOMContentLoaded', function () {
  var formDataView = document.querySelector('div[data-view = target-input-form]');
  var trackingView = document.querySelector('div[data-view = daily-targets]');

  switchViews();

  if (data.targets.calories !== 0 && data.mealEntries[data.mealEntries.length - 1].date === data.date && data.view !== 'meal-log') {
    trackTargetProgress(trackingView);
    formDataView.classList.add('hidden');
    trackingView.classList.remove('hidden');

  }
  var dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (data.mealEntries[i].date === data.date && data.view !== 'meal-log') {
      dataViewDiv.append(showTodaysMeals(data.mealEntries[i]));
      dataViewDiv.classList.remove('hidden');
    }
  }

  var dataMealLog = document.querySelector('div[data-view="meal-log"]');
  if (data.view === 'meal-log') {
    for (i = data.mealEntries.length - 1; i >= 0; i--) {

      dataMealLog.append(showTodaysMeals(data.mealEntries[i]));
    }
    var dailySummary = document.querySelector('.daily-summary-heading');
    dailySummary.classList.add('hidden');
    var mealButton = document.querySelector('.meal-button');
    mealButton.classList.add('hidden');
  }
  if (data.targets.calories > 0) {
    updateProgress();
  }
});

function updateProgress() {
  var calorieP = document.querySelector('.calorie-numbers');
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';

  var fillProgressCalories = document.querySelector('.fill-progress-calories');
  fillProgressCalories.style.width = Math.round(data.dailyTotals.calories / data.targets.calories * 100) + '%';
  var calorieLimit = Math.round(data.dailyTotals.calories / data.targets.calories * 100);
  if (calorieLimit > 100) {
    fillProgressCalories.style.backgroundColor = 'red';
  }

  var caloriesText = document.querySelector('.calories-text');
  caloriesText.textContent = fillProgressCalories.style.width;

  var proteinP = document.querySelector('.protein-numbers');
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';

  var fillProgressProtein = document.querySelector('.fill-progress-protein');
  fillProgressProtein.style.width = Math.round(data.dailyTotals.protein / data.targets.protein * 100) + '%';
  var proteinLimit = Math.round(data.dailyTotals.protein / data.targets.protein * 100);
  if (proteinLimit > 100) {
    fillProgressProtein.style.backgroundColor = 'red';
  }

  var proteinText = document.querySelector('.protein-progress-text');
  proteinText.textContent = fillProgressProtein.style.width;

  var fatsP = document.querySelector('.fats-numbers');
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';

  var fillProgressFats = document.querySelector('.fill-progress-fats');
  fillProgressFats.style.width = Math.round(data.dailyTotals.fats / data.targets.fats * 100) + '%';
  var fatsLimit = Math.round(data.dailyTotals.fats / data.targets.fats * 100);
  if (fatsLimit > 100) {
    fillProgressFats.style.backgroundColor = 'red';
  }

  var fatsText = document.querySelector('.fats-progress-text');
  fatsText.textContent = fillProgressFats.style.width;

  var carbohydratesP = document.querySelector('.carbohydrates-numbers');
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';

  var fillProgressCarbohydrates = document.querySelector('.fill-progress-carbohydrates');
  fillProgressCarbohydrates.style.width = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%';
  var carbohydratesLimit = Math.round(data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100);
  if (carbohydratesLimit > 100) {
    fillProgressCarbohydrates.style.backgroundColor = 'red';
  }

  var carbohydratesText = document.querySelector('.carbohydrates-progress-text');
  carbohydratesText.textContent = fillProgressCarbohydrates.style.width;
}

var deleteIconListener = document.querySelector('body');

// deleteIconButton.addEventListener('click', showDeleteModal);

// function showDeleteModal() {
//   var deleteModal = document.querySelector('.delete-food-item-modal');
//   deleteModal.classList.remove('hidden');
//   console.log('click');
// }

deleteIconListener.addEventListener('click', showDeleteModal);

var deleteTargetElement;

function showDeleteModal() {
  if (event.target.tagName === 'I') {
    var deleteModal = document.querySelector('.delete-food-item-modal');
    deleteModal.classList.remove('hidden');
    deleteTargetElement = event.target;
  }
}

var confirmDeleteButton = document.querySelector('.delete-button');

confirmDeleteButton.addEventListener('click', deleteFoodItem);

function deleteFoodItem() {

  // debugger;
  for (var i = 0; i < data.mealEntries.length; i++) {
    if (deleteTargetElement.closest('table').firstChild.firstChild.firstChild.nextSibling.nextSibling.textContent === data.mealEntries[i].date && deleteTargetElement.closest('table').firstChild.firstChild.firstChild.textContent === data.mealEntries[i].mealName) {
      for (var k = 0; k < data.mealEntries[i].foodItem.length; k++) {
        if (deleteTargetElement.closest('tr').firstChild.textContent === data.mealEntries[i].foodItem[k].name) {
          data.mealEntries[i].foodItem.splice(k, 1);
          var deleteModal = document.querySelector('.delete-food-item-modal');
          deleteModal.classList.add('hidden');
        }
      }
    }
  }
  location.reload();
}
