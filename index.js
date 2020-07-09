let BudgetController = (function () {

    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expenses.prototype.calcPercentages = function(totalInc){
        if(totalInc > 0){
            this.percentage = Math.round((this.value / totalInc) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    };

    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(el){
            sum += el.value;
        });
        data.totals[type] = sum;
    };



    let data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1, // Use "-1", when something is not exist, imagine that our budget is a 0, we don't need to have the "0%" we just say's that percentage is not exist
    };
    // setLC = JSON.parse(setLC);
    // console.log(setLC);


    return {
        addItem: function (type, des, val) {
            let newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            // console.log(newItem)
            return newItem;

        },

        deleteItem: function(type, id){
              let ids, index;
              ids = data.allItems[type].map(function (current) {
                  return current.id;
              });
              index = ids.indexOf(id);
              if(index !== -1){
                  data.allItems[type].splice(index, 1);
              }
        },
        calcBudget: function(){
            // 1. Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function (el) {
                el.calcPercentages(data.totals.inc);
            })
        },

        getPercentage: function(){
            let allPerc = data.allItems.exp.map(function (el) {
                return el.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },
        saveData: function(){
            return data;
        },
    }





})();

let UIController = (function () {
    let DOMStr = {
        inputType: '.add__type',
        inpDesc: '.add__description',
        inpValue: '.add__value',
        btnAccept: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    let formatNumber = function (num, type) {
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];
        return (type === 'exp'? "-" : "+") + ' ' + int + '.' + dec;

    };
    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getUiInputs: function () {
            return {
                inpType: document.querySelector(DOMStr.inputType).value,
                inpDescript: document.querySelector(DOMStr.inpDesc).value,
                inpValue: parseFloat(document.querySelector(DOMStr.inpValue).value),
            }
        },
        addListItem: function (obj, type) {
            let html, element;
            if (type === 'inc') {
                element = DOMStr.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                    <div class="item__value">${formatNumber(obj.value, 'inc')}</div>
                </div>
            </div>`
            }
            else if (type === 'exp') {
                element = DOMStr.expenseContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                    <div class="item__percentage">21</div>
                    <div class="item__value">${formatNumber(obj.value, 'exp')}</div>
                </div>
            </div>`;
            }
            document.querySelector(element).innerHTML += html;
        },
        clearInputFields: function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMStr.inpDesc + ', ' + DOMStr.inpValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                element.value = "";
            });

            // let f1, f2;
            // f1 = document.querySelector(DOMStr.inpDesc);
            // f2 = document.querySelector(DOMStr.inpValue);
            // f1.value = "";
            // f2.value = "";

        },
        displayBudget: function(obj){
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStr.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStr.expensesLabel).textContent =formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStr.budgetLabel).textContent = formatNumber(obj.budget, type);

            if(obj.percentage > 0){
                document.querySelector(DOMStr.budgetLabel).textContent = obj.budget ;
            } else{
                document.querySelector(DOMStr.percentageLabel).textContent = '---';
            }
        },

        displayDate: function(){
            let now, year, month, months;
            months = ["Январе", "Феврале", "Марте", "Апреле", "Мае", "Июне", "Июле", "Августе", "Сентябре", "Октябре", "Ноябрье", "Декабрье"];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStr.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            let fields = document.querySelectorAll(DOMStr.inputType + ',' + DOMStr.inpValue + ',' + DOMStr.inpDesc);
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMStr.btnAccept).classList.toggle('red');

        },

        deleateListItem: function(selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayPercentage: function(perc){
            let fields = document.querySelectorAll(DOMStr.expensesPercLabel);
            // nodeListForEach();
            nodeListForEach(fields, function (cur, index) {
                if(perc[index] > 0){
                    cur.textContent = perc[index] + '%';
                }
                else {
                    cur.textContent = '---';
                }
            });
        },

        getDOMstrings: function () {
            return DOMStr;
        },
    }

})();













let Controller = (function (BgtCtrl, UICtrl) {


    let setUpEL = function () {
    let DOM = UICtrl.getDOMstrings();
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                globalAppCtrl();
            }
        });
        document.querySelector(DOM.btnAccept).addEventListener('click', globalAppCtrl);
        document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let newBudget = function(){
        // 1. Calculate the budget
        BgtCtrl.calcBudget();
        // 2. Return the budget
        let budget = BgtCtrl.getBudget();
        localStorage.setItem('data', JSON.stringify(budget));

        // 3. Display budget on the UI
        UICtrl.displayBudget(budget);

    };

    let updatePercentages = function(){
        BgtCtrl.calculatePercentages();
        let percentages = BgtCtrl.getPercentage();

        UICtrl.displayPercentage(percentages);
    };



    let globalAppCtrl = function () {
        let ctrl, newItem;

        // 1. Get the field input data
        ctrl = UICtrl.getUiInputs();

        if(ctrl.inpDescript !== "" && !isNaN(ctrl.inpValue) && ctrl.inpValue > 0){
            // 2. Add item to tge Budget Controller
            newItem = BgtCtrl.addItem(ctrl.inpType, ctrl.inpDescript, ctrl.inpValue);
            // 3. Add the new item to UI
            UICtrl.addListItem(newItem, ctrl.inpType);
            // 4. Clear Input Fields
            UICtrl.clearInputFields();
            // 5. Calculate and update budget
            newBudget();

            updatePercentages();
        }
    };
    let controlDeleteItem = function (event) {
            let item, itemArr, type, ID;
            item = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if(item){
            itemArr = item.split('-');
            type = itemArr[0];
            ID = parseInt(itemArr[1]);
            BgtCtrl.deleteItem(type, ID);
            UICtrl.deleateListItem(item);
            newBudget();
            updatePercentages();
            }
    };

    return {
        init: function () {
                console.log('Приложение работает');
                UICtrl.displayDate();
                UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1,
                });
                setUpEL();
        },
    }
})(BudgetController, UIController);


Controller.init();










