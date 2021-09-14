let db;
const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  console.log(event);
  const BudgetStore = db.createObjectStore("BudgetStore", {
    autoIncrement: true,
  });

  BudgetStore.createIndex("budgets", "transactions");
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log("There was an error!");
};

// saveRecord being called in catach err

function saveRecord(record) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  budgetStore.add(record);
}

// if online add and remove data in index.js

function checkDatabase() {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  const getAll = budgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      // found in api.js
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        // deleteAll
        .then(() => {
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const budgetStore = transaction.objectStore("BudgetStore");
          budgetStore.clear();
        });
    }
  };
}

// checkDatabases init for when online
window.addEventListener("online", checkDatabase);