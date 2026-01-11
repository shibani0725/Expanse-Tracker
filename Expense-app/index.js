const tform = document.querySelector(".t-form");
const selectEl = tform.querySelector("select");
const inputs = tform.querySelectorAll("input");

const balanceEl = document.querySelector(".balance-amount");
const incomeEl = document.querySelector(".income-amount");
const expenseEl = document.querySelector(".expense-amount");

const tlistEl = document.querySelector(".t-list");
const btnClose = document.querySelector(".btn-close");
const submitBtn = document.querySelector(".submit-btn");
const updateBtn = document.querySelector(".update-btn");

let editIndex = null;
let pieChart, barChart;

// STORAGE
let transaction = JSON.parse(localStorage.getItem("transaction")) || [];
let initialBalance = Number(localStorage.getItem("initialBalance")) || 0;

// ASK INITIAL BALANCE ONCE
if (!localStorage.getItem("initialBalance")) {
    swal("Enter Initial Balance:", {
        content: "input"
    }).then(val => {
        initialBalance = Number(val) || 0;
        localStorage.setItem("initialBalance", initialBalance);
        showTransaction();
    });
}

// SHOW TRANSACTIONS
function showTransaction() {
    tlistEl.innerHTML = "";

    let income = 0;
    let expense = 0;

    transaction.forEach((item, index) => {
        if (item.type === "cr") income += item.amount;
        else expense += item.amount;

        tlistEl.innerHTML += `
        <tr>
            <td>${item.title}</td>
            <td>₹${item.amount}</td>
            <td>${item.type.toUpperCase()}</td>
            <td>${item.date}</td>
            <td>
                <button class="btn text-primary" onclick="editTransaction(${index})">
                    <i class="fa fa-pen"></i>
                </button>
                <button class="btn text-danger" onclick="deleteTransaction(${index})">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });

    const balance = initialBalance + income - expense;

    balanceEl.innerText = `₹${balance}`;
    incomeEl.innerText = `₹${income}`;
    expenseEl.innerText = `₹${expense}`;

    balanceEl.classList.remove("text-success", "text-danger");
    balanceEl.classList.add(balance < 0 ? "text-danger" : "text-success");

    updateCharts(income, expense);
}

// ADD TRANSACTION
tform.addEventListener("submit", function (e) {
    e.preventDefault();

    const obj = {
        type: selectEl.value,
        title: inputs[0].value,
        amount: Number(inputs[1].value),
        date: inputs[2].value
    };

    transaction.push(obj);
    localStorage.setItem("transaction", JSON.stringify(transaction));

    swal("Success!", "Transaction Added", "success");

    tform.reset();
    btnClose.click();
    showTransaction();
});

// DELETE WITH CONFIRMATION
function deleteTransaction(index) {
    swal({
        title: "Are you sure?",
        text: "This transaction will be deleted permanently!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then(willDelete => {
        if (willDelete) {
            transaction.splice(index, 1);
            localStorage.setItem("transaction", JSON.stringify(transaction));
            swal("Deleted!", "Transaction removed", "success");
            showTransaction();
        }
    });
}

// EDIT
function editTransaction(index) {
    const item = transaction[index];

    selectEl.value = item.type;
    inputs[0].value = item.title;
    inputs[1].value = item.amount;
    inputs[2].value = item.date;

    editIndex = index;
    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");

    new bootstrap.Modal(document.getElementById("myModal")).show();
}

// UPDATE
updateBtn.addEventListener("click", function () {
    transaction[editIndex] = {
        type: selectEl.value,
        title: inputs[0].value,
        amount: Number(inputs[1].value),
        date: inputs[2].value
    };

    localStorage.setItem("transaction", JSON.stringify(transaction));

    swal("Updated!", "Transaction Updated", "success");

    submitBtn.classList.remove("d-none");
    updateBtn.classList.add("d-none");

    tform.reset();
    btnClose.click();
    showTransaction();
});

// CHARTS
function updateCharts(income, expense) {

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#198754", "#dc3545"]
            }]
        }
    });

    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                label: "Amount (₹)",
                data: [income, expense],
                backgroundColor: ["#198754", "#dc3545"]
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

showTransaction();
