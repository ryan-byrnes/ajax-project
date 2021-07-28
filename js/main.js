// var dailyTargetSubmitButton = document.querySelector('.daily-target-submit');

document.addEventListener('submit', submitTargets);

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

  trackTargetProgress();
  switchViews();

}

function trackTargetProgress() {
  var calorieText = document.querySelector('.daily-target-calories');
  var proteinText = document.querySelector('.daily-target-protein');
  var fatsText = document.querySelector('.daily-target-fats');
  var carbohydrateText = document.querySelector('.daily-target-carbohydrates');

  calorieText.textContent = 'Calories: ' + data.dailyTotals.calories + '/' + data.targets.calories + ' kcal';
  proteinText.textContent = 'Protein: ' + data.dailyTotals.protein + '/' + data.targets.protein + 'g';
  fatsText.textContent = 'Fats: ' + data.dailyTotals.fats + '/' + data.targets.fats + 'g';
  carbohydrateText.textContent = 'Carbs: ' + data.dailyTotals.carbohydrates + '/' + data.targets.carbohydrates + 'g';

  var calorieFill = document.querySelector('.fill-progress-calories');
  var proteinFill = document.querySelector('.fill-progress-protein');
  var fatsFill = document.querySelector('.fill-progress-fats');
  var carbohydratesFill = document.querySelector('.fill-progress-carbohydrates');

  calorieFill.style.width = data.dailyTotals.calories / data.targets.calories * 100 + '%';
  proteinFill.style.width = data.dailyTotals.protein / data.targets.protein * 100 + '%';
  fatsFill.style.width = data.dailyTotals.fats / data.targets.fats * 100 + '%';
  carbohydratesFill.style.width = data.dailyTotals.carbohydrates / data.targets.carbohydrates * 100 + '%';

  var calorieFillText = document.querySelector('.text-progress-calories');
  var proteinFillText = document.querySelector('.text-progress-protein');
  var fatsFillText = document.querySelector('.text-progress-fats');
  var carbohydratesFillText = document.querySelector('.text-progress-carbohydrates');

  calorieFillText.textContent = calorieFill.style.width;
  proteinFillText.textContent = proteinFill.style.width;
  fatsFillText.textContent = fatsFill.style.width;
  carbohydratesFillText.textContent = carbohydratesFill.style.width;

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
