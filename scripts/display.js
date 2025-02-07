// All checkboxes and progress bars are handled here
// Get elements
const taskCheckboxes = document.querySelectorAll(
  '.task input[type="checkbox"]'
);
const progressBarContainers = document.querySelectorAll(".progress");
// Call this function after the tasks are rendered
// document.addEventListener("DOMContentLoaded", () => {});

// Function to update task status
function updateTaskStatus(event) {
  const checkbox = event.target;
  const taskName = checkbox.nextElementSibling;
  const goalContainer = checkbox.closest("article");
  const progressBar = goalContainer.querySelector(".progress-bar");

  // Send AJAX request to update task completion status
  const taskId = checkbox.id;
  const completed = checkbox.checked ? 1 : 0;

  fetch("./config/update_task.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `task_id=${taskId}&completed=${completed}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        if (checkbox.checked) {
          taskName.classList.add("completed");
        } else {
          taskName.classList.remove("completed");
        }
        checkAllTasksCompleted(goalContainer);
        updateProgressBars();
        updateGoalProgressBars();
      } else {
        console.error("Error updating task status");
      }
    })
    .catch((error) => console.error("Error:", error));
}

// Add event listeners to task checkboxes
taskCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateTaskStatus);
});

// Function to check if all tasks are completed
function checkAllTasksCompleted(goalContainer) {
  const checkboxes = goalContainer.querySelectorAll(
    '.task input[type="checkbox"]'
  );
  const checkedCheckboxes = goalContainer.querySelectorAll(
    '.task input[type="checkbox"]:checked'
  );
  const taskStatus = goalContainer.querySelector("#task-status");

  if (checkedCheckboxes.length === checkboxes.length) {
    taskStatus.textContent = "Congratulations! You have completed all tasks";
    taskStatus.classList.add("text-success");
  } else {
    taskStatus.textContent = "";
    taskStatus.classList.remove("text-success");
  }
}

// Function to update progress bar
function updateProgressBars() {
  const tasks = document.querySelectorAll(".task");
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter(
    (task) => task.querySelector('input[type="checkbox"]').checked
  ).length;
  const percentageCompleted = (completedTasks / totalTasks) * 100;

  // Update the progress bar width
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    progressBar.style.width = percentageCompleted + "%";
    progressBar.textContent = `${Math.floor(percentageCompleted)}%`;
  }
}

// Function to update progress bar for each goal
function updateGoalProgressBars() {
  const goalContainers = document.querySelectorAll("article");
  goalContainers.forEach((goalContainer) => {
    const checkboxes = goalContainer.querySelectorAll(
      '.task input[type="checkbox"]'
    );
    const checkedCheckboxes = goalContainer.querySelectorAll(
      '.task input[type="checkbox"]:checked'
    );
    const progressBar = goalContainer.querySelector(".progress-bar");
    const progressPercentage =
      (checkedCheckboxes.length / checkboxes.length) * 100;

    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.floor(progressPercentage)}%`;
  });
}

// Call this function after the tasks are rendered
document.addEventListener("DOMContentLoaded", () => {
  updateProgressBars();
  updateGoalProgressBars();
});

//Dropdown Menu
const dropdownItems = document.querySelectorAll(".dropdown-item");

// Add event listener to each dropdown item
dropdownItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const action = item.getAttribute("aria-label");
    const goalId = item
      .closest(".card")
      .querySelector("#card-title")
      .getAttribute("goal-id");
    sendGoalAction(action, goalId);
  });
});

// Function to send goal action request
const sendGoalAction = async (action, goalId) => {
  try {
    const response = await fetch("./config/goal-management.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=${action}&goalId=${goalId}`,
    });

    const data = await response.json();

    if (data.success) {
      updateUI(action, goalId);
      window.showToast(data.message);
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Function to update UI
const updateUI = (action, goalId) => {
  const goalElement = document.querySelector(
    `#card-title[goal-id="${goalId}"]`
  );

  switch (action) {
    case "mark-complete":
      document.getElementById("goal-status").textContent = "Completed";
      break;
    case "missed":
      document.getElementById("goal-status").textContent = "MISSED";
      break;
    case "pause":
      document.getElementById("goal-status").textContent = "ON_HOLD";
      break;
    case "resume":
      document.getElementById("goal-status").textContent = "IN_PROGRESS";
      break;
    case "delete":
      goalElement.closest(".card").remove();
      break;
  }
};

 // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Isotope on the goal container
            var iso = new Isotope('.row', {
                itemSelector: '.card',
                layoutMode: 'fitRows'
            });

            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(function(button) {
                button.addEventListener('click', function() {
                    var filterValue = this.getAttribute('data-filter');
                    iso.arrange({
                        filter: filterValue
                    });
                });
            });

            // Sort buttons
            document.querySelectorAll('.dropdown-item[data-sort-by]').forEach(function(button) {
                button.addEventListener('click', function() {
                    var sortByValue = this.getAttribute('data-sort-by');
                    var sortAscending = (sortByValue === 'original-order') ? true : false;
                    iso.arrange({
                        sortBy: sortByValue,
                        sortAscending: sortAscending
                    });
                });
            });
        });