/* exported data */

var data = {
  targets: {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0
  },
  dailyTotals: {
    calories: 0,
    protein: 0,
    fats: 0,
    carbohydrates: 0
  },
  mealEntries: [{
    date: '',
    mealName: '',
    foodItem: [],
    nutrients: {
      calories: 0,
      protein: 0,
      fats: 0,
      carbohydrates: 0
    },
    foodEntryId: 1,
    entryId: ''
  }],
  veiw: 'target-input-form',
  date: '',
  nextMealEntryId: 1,
  xhrResponse: ''
};

window.addEventListener('beforeunload', function () {
  localStorage.setItem('meal-data', JSON.stringify(data));
});

var previousInput = localStorage.getItem('meal-data');
if (previousInput !== null) {
  data = JSON.parse(previousInput);
}
