/* need function to update daily totals
    Add food item modal and submit form
    */

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

  var inputForm = document.querySelector('.new-meal-modal-form');
  var inputValue = inputForm.elements;

  data.mealEntries[data.nextMealEntryId - 1].mealName = inputValue['meal-name'].value;
  data.mealEntries[data.nextMealEntryId - 1].foodItem[data.nextMealEntryId - 1] = inputValue['food-item'].value;
  data.mealEntries[data.nextMealEntryId - 1].entryId = data.nextMealEntryId;

  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://api.edamam.com/api/food-database/v2/parser?app_id=c2713387&app_key=4ef3b4c8226f2708aa7e3b8b470ed40e&ingr=' + encodeURI(inputValue['food-item'].value) + '&nutrition-type=cooking');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    console.log(xhr.status);
    console.log(xhr.response);
    data.xhrResponse = xhr.response;
    var tableBody = document.querySelector('tbody');
    tableBody.prepend(addFoodItem(data.xhrResponse));
  });
  xhr.send();

  var dataViewDiv = document.querySelector('div[data-view = current-day-meals');
  dataViewDiv.append(createNewMealEntry(data.mealEntries[data.mealEntries.entryId - 1]));

  inputForm.reset();
  data.nextMealEntryId += 1;

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
  calorieP.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  calorieColumnThird.appendChild(calorieP);

  var calorieTwoThirds = document.createElement('div');
  calorieTwoThirds.setAttribute('class', 'column-66 padding-right');
  calorieRow.appendChild(calorieTwoThirds);

  var progressBarDiv = document.createElement('div');
  progressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  calorieTwoThirds.appendChild(progressBarDiv);

  var progressFillDiv = document.createElement('div');
  progressFillDiv.setAttribute('style', 'width: ' + data.dailyTotals.calories / data.targets.calories * 100 + '%');
  progressFillDiv.setAttribute('class', 'fill-progress-calories progress text-align-center padding-top-3');
  progressBarDiv.appendChild(progressFillDiv);

  var progressFillText = document.createElement('p');
  progressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
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
  proteinP.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + ' g';
  proteinColumnThird.appendChild(proteinP);

  var proteinTwoThirds = document.createElement('div');
  proteinTwoThirds.setAttribute('class', 'column-66 padding-right');
  proteinRow.appendChild(proteinTwoThirds);

  var proteinProgressBarDiv = document.createElement('div');
  proteinProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  proteinTwoThirds.appendChild(proteinProgressBarDiv);

  var proteinProgressFillDiv = document.createElement('div');
  proteinProgressFillDiv.setAttribute('style', 'width: ' + (data.dailyTotals.protein / data.targets.protein * 100) + '%');
  proteinProgressFillDiv.setAttribute('class', 'fill-progress-protein progress text-align-center padding-top-3');
  proteinProgressBarDiv.appendChild(proteinProgressFillDiv);

  var proteinProgressFillText = document.createElement('p');
  proteinProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
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
  fatsP.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + ' g';
  fatsColumnThird.appendChild(fatsP);

  var fatsTwoThirds = document.createElement('div');
  fatsTwoThirds.setAttribute('class', 'column-66 padding-right');
  fatsRow.appendChild(fatsTwoThirds);

  var fatsProgressBarDiv = document.createElement('div');
  fatsProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  fatsTwoThirds.appendChild(fatsProgressBarDiv);

  var fatsProgressFillDiv = document.createElement('div');
  fatsProgressFillDiv.setAttribute('style', 'width: ' + data.dailyTotals.fats / data.targets.fats * 100 + '%');
  fatsProgressFillDiv.setAttribute('class', 'fill-progress-fats progress text-align-center padding-top-3');
  fatsProgressBarDiv.appendChild(fatsProgressFillDiv);

  var fatsProgressFillText = document.createElement('p');
  fatsProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
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
  carbohydratesP.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + ' g';
  carbohydratesColumnThird.appendChild(carbohydratesP);

  var carbohydratesTwoThirds = document.createElement('div');
  carbohydratesTwoThirds.setAttribute('class', 'column-66 padding-right');
  carbohydratesRow.appendChild(carbohydratesTwoThirds);

  var carbohydratesProgressBarDiv = document.createElement('div');
  carbohydratesProgressBarDiv.setAttribute('class', 'progress-bar background-color-white row align-items-center');
  carbohydratesTwoThirds.appendChild(carbohydratesProgressBarDiv);

  var carbohydratesProgressFillDiv = document.createElement('div');
  carbohydratesProgressFillDiv.setAttribute('style', 'width: ' + (data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100) + '%');
  carbohydratesProgressFillDiv.setAttribute('class', 'fill-progress-carbohydrates progress text-align-center padding-top-3');
  carbohydratesProgressBarDiv.appendChild(carbohydratesProgressFillDiv);

  var carbohydratesProgressFillText = document.createElement('p');
  carbohydratesProgressFillText.setAttribute('class', 'margin-top-0 color-white font-weight-bold');
  carbohydratesProgressFillText.textContent = carbohydratesProgressFillDiv.style.width;
  carbohydratesProgressFillDiv.appendChild(carbohydratesProgressFillText);

  return element;

}

function switchViews() {
  var dataViewElements = document.querySelectorAll('div[data-view]');

  for (var i = 0; i < dataViewElements.length; i++) {
    if (data.view === dataViewElements[i].getAttribute('data-view')) {
      dataViewElements[i].classList.toggle('hidden');
    } else {
      dataViewElements[i].classList.add('hidden');
    }
  }
}

function createNewMealEntry(entry) {

  /*  <div class="table">
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
  addMealName.textContent = data.mealEntries[data.mealEntries.length - 1].mealName;
  tableHeadRow.appendChild(addMealName);

  var dateDiv = document.createElement('div');
  tableHeadRow.append(dateDiv);

  var tdDate = document.createElement('td');
  tdDate.setAttribute('class', 'todays-date');
  tdDate.textContent = data.mealEntries[data.mealEntries.length - 1].date;

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
  table.append(tableBody);

  var tableBodyRow2 = document.createElement('tr');
  tableBody.append(tableBodyRow2);

  var tdAddFoodItem = document.createElement('td');
  tdAddFoodItem.setAttribute('class', 'font-weight-bold');
  tableBodyRow2.append(tdAddFoodItem);

  var addFoodItemAnchor = document.createElement('a');
  addFoodItemAnchor.setAttribute('class', 'add-new-food-item color-navy');
  addFoodItemAnchor.setAttribute('href', '');
  addFoodItemAnchor.textContent = 'Add Food Item';
  tdAddFoodItem.append(addFoodItemAnchor);

  return tableDiv;

}

// Add a food entry to day

function addFoodItem(entry) {

  var tableBodyRow = document.createElement('tr');
  tableBodyRow.setAttribute('class', 'row');

  var tdFoodItemName = document.createElement('td');
  tdFoodItemName.setAttribute('class', 'flex-basis-40');
  tdFoodItemName.textContent = data.mealEntries[data.mealEntries.length - 1].foodItem[data.mealEntries[data.mealEntries.length - 1].foodItem.length - 1];
  tableBodyRow.append(tdFoodItemName);

  var tdCaloriesValue = document.createElement('td');
  tdCaloriesValue.setAttribute('class', 'flex-basis-15');
  tdCaloriesValue.textContent = data.xhrResponse.hints[0].food.nutrients.ENERC_KCAL;
  tableBodyRow.append(tdCaloriesValue);

  var tdProteinValue = document.createElement('td');
  tdProteinValue.setAttribute('class', 'flex-basis-15');
  tdProteinValue.textContent = data.xhrResponse.hints[0].food.nutrients.PROCNT;
  tableBodyRow.append(tdProteinValue);

  var tdFatsValue = document.createElement('td');
  tdFatsValue.setAttribute('class', 'flex-basis-15');
  tdFatsValue.textContent = data.xhrResponse.hints[0].food.nutrients.FAT;
  tableBodyRow.append(tdFatsValue);

  var tdCarbohydratesValue = document.createElement('td');
  tdCarbohydratesValue.setAttribute('class', 'flex-basis-15');
  tdCarbohydratesValue.textContent = data.xhrResponse.hints[0].food.nutrients.CHOCDF;
  tableBodyRow.append(tdCarbohydratesValue);

  data.mealEntries[data.mealEntries.length - 1].foodEntryId += 1;

  return tableBodyRow;

}

var addNewFoodItem = document.querySelector('.add-new-food-item');

addNewFoodItem.addEventListener('click', function openAddFoodItemModal() {
  var showModal = document.querySelector('.add-food-item-modal');
  showModal.classList.toggle('hidden');
});
