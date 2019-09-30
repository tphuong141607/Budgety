
// BUDGET CONTROLLER
var budgetController = (function () {
	
	// Constructor
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	// private prototype functions
	Expense.prototype.calcPercentage = function(totalIncome){
		if (totalIncome > 0) {
			this.percentage = ((this.value / totalIncome) * 100).toFixed(2);
		} else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}
	
	// Constructor
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	// private functions
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	};
	
	// private data
	var data = {
		// store object (id, description, value)
		allItems: {
			exp: [],
			inc: []
		},
		
		totals: {
			exp: 0,
			inc: 0
		},
		
		budget: 0,
		percentage: -1 // -1 means does not exist at this point
	};
	
	// Public functions used to access private data
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			
			// Create new ID: ID = the last ID + 1
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
			} else {
				ID = 0;
			}		
			
			// Create the new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			// Push the newly created item into our data structure
			data.allItems[type].push(newItem);
			
			// Return the item
			return newItem;
		},
		
		deleteItem: function (type, id) {
			var ids, index;
			
			// Create the new array with only IDs (not objects as in the original array)
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			// Get the index of the needed id
			index = ids.indexOf(id);

			// Delete the object that associates with the id
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		
		calculateBudget: function() {
			
			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			
			// Calculate the budget = income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			
			// Calculate the % of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(2);
			} else {
				data.percentage = -1;
			}		
		},
		
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};	
		},
		
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});	
		},
		
		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPerc;
		},
		
		testing: function() {
			console.log(data);
		}
	};

})();


// UI CONTROLLER
var UIController = (function() {
	
	// Private DOMstrings object (reusable and managable names)
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentage: '.item__percentage',
		dateLabel: '.budget__title--month'
		
	};
	
	var formatNumber = function(num, type) {
		/*	RULES:
			• +/- before number: + 234456
			• exactly 2 decimal points: 2344.56
			• comma separating the thousands: 2,344.56
		*/
			
		var numSplit, int, dec, commaCount;
		num = Math.abs(num);
		num = num.toFixed(2);
			
		numSplit = num.split('.');
			
		// Adding the ","
		int = numSplit[0];	
		commaCount = 0;
		for (var i = 3; int.length > i; i = i + 3 + commaCount) {
			int = int.substr(0, int.length - i) + ',' + int.substr(int.length - i, int.length);
			commaCount++;
		}	
			
		dec = numSplit[1];
		
		return (type === 'exp' ? '-' : '+')+ ' ' + int + '.' + dec;
	};
		
	// Creating our own version of "forEach functions" for node list
	var nodeListForEach = function(nodeList, callback) {
		for (var i = 0; i < nodeList.length; i++) {
			callback(nodeList[i], i);
		}
	};
	
	// Public functions
	return {
		getInput: function() {
			return { // return an object with 3 properties (user input)
				type: document.querySelector(DOMstrings.inputType).value, // Value = inc || exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			
			// Create HTML string w/ placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
				
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}
	
			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			
			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);	
		},
		
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		
		clearFields: function() {
			var fields, fieldArray;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fieldArray = Array.prototype.slice.call(fields); // convert list to array
			
			// callback function can receive up to 3 arguments
			fieldArray.forEach(function(current, index, array) {
				current.value = "";

			});
			
			fieldArray[0].focus(); // go back to the first element of the array
		},
		
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		
		displayPercentages: function(percentagesArray) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentage); // return a list of nodes
			
			nodeListForEach(fields, function(current, index) {
				if (percentagesArray[index] > 0) {
					current.textContent = percentagesArray[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
			
		},
		
		displayMonth: function() {
			var currentTime, year, month, months;
			currentTime = new Date();
			year = currentTime.getFullYear();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = currentTime.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		
		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ', ' +
				DOMstrings.inputDescription + ', ' +
				DOMstrings.inputValue
			);
			
			nodeListForEach(fields, function(current){ 
				current.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		
		// access to private data
		getDOMstrings: function() {
			return DOMstrings;		
		}
	};
	
})();



// GLOBAL APP CONTROLLER (any clicks/events happen in here)
var controller = (function(budgetCtrl, UICtrl) {
	// Private functions
	// Setting up event listeners
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();
		// add items
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrAddItem); // click this button
		document.addEventListener('keypress', function(event) { // press the enter/return key
			if (event.keyCode === 13 || event.which === 13) {
				ctrAddItem();
			}
		});
		
		// delete items (Event delegation)
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};
	
	var updateBudget = function () {
		
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		
		// 2. Return the budget
		var budget = budgetCtrl.getBudget(); 
		
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	var updatePercentage = function() {
		
		// 1. Calculate the percentage
		budgetCtrl.calculatePercentages();
		
		// 2. Read percentages from the budget controller
		var allPercentages = budgetCtrl.getPercentages();
		
		// 3. Update the UI
		UICtrl.displayPercentages(allPercentages);
	};
	
	// Adding new item
	var ctrAddItem = function() {
		var input, newItem;
		
		// 1. Get the field input data
		input = UICtrl.getInput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		
			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);
		
			// 4. Clear the input fields
			UICtrl.clearFields();
		
			// 5. Calculate and update the budget
			updateBudget();
			
			// 6. CAlculate and update the percentage
			updatePercentage();
		}	
	};
	
	// Deleting item
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		// We also hard-coded the html (DOM structure) in javascript code
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
		}
		
		// 1. Delete the item from the data structure
		budgetCtrl.deleteItem(type, ID);
		
		// 2. Detele the item from the UI
		UICtrl.deleteListItem(itemID);
		
		// 3. Update and show the new budget
		updateBudget();
		
		// 4. CAlculate and update the percentage
		updatePercentage();
	};
	
	
	// Public functions
	return {
		init: function() {
			console.log('App');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();








