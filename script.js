const habitForm = document.querySelector("#habit-form");
const habitInput = document.querySelector("#habit-input");
const habitList = document.querySelector("#habit-list");
const todayDate = document.querySelector("#today-date");
const progressText = document.querySelector("#progress-text");
const habitCount = document.querySelector("#habit-count");
const emptyMessage = document.querySelector("#empty-message");
const statusMessage = document.querySelector("#status");

const STORAGE_KEY = "habit-tracker-habits";

let habits = loadHabits();

todayDate.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(new Date());

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = habitInput.value.trim();
  if (!name) return;

  const alreadyExists = habits.some(
    (habit) => habit.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    showStatus("That habit is already on your list.", true);
    return;
  }

  habits.push({
    id: createId(),
    name,
    completedDates: []
  });

  saveHabits();
  renderHabits();
  habitForm.reset();
  habitInput.focus();
  showStatus("Habit added.");
});

habitList.addEventListener("change", (event) => {
  if (!event.target.matches(".habit-check")) return;

  const habit = habits.find((item) => item.id === event.target.dataset.id);
  if (!habit) return;

  const today = getTodayKey();
  const alreadyCompleted = habit.completedDates.includes(today);

  if (event.target.checked && !alreadyCompleted) {
    habit.completedDates.push(today);
  } else if (!event.target.checked && alreadyCompleted) {
    habit.completedDates = habit.completedDates.filter((date) => date !== today);
  }

  saveHabits();
  renderHabits();
  showStatus(event.target.checked ? "Habit marked complete." : "Completion removed.");
});

habitList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton) return;

  const habitId = deleteButton.dataset.id;
  habits = habits.filter((habit) => habit.id !== habitId);

  saveHabits();
  renderHabits();
  showStatus("Habit deleted.");
});

function renderHabits() {
  habitList.replaceChildren();

  const today = getTodayKey();
  let completedToday = 0;

  habits.forEach((habit) => {
    const isComplete = habit.completedDates.includes(today);
    if (isComplete) completedToday += 1;

    const item = document.createElement("li");
    item.className = `habit-item${isComplete ? " is-complete" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "habit-check";
    checkbox.type = "checkbox";
    checkbox.checked = isComplete;
    checkbox.dataset.id = habit.id;
    checkbox.setAttribute("aria-label", `Mark ${habit.name} complete`);

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = habit.name;

    const streak = document.createElement("span");
    streak.className = "habit-streak";
    const streakCount = calculateStreak(habit.completedDates);
    streak.textContent = `${streakCount} day${streakCount === 1 ? "" : "s"} in a row`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.id = habit.id;
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${habit.name}`);

    item.append(checkbox, name, streak, deleteButton);
    habitList.append(item);
  });

  const total = habits.length;
  progressText.textContent = `${completedToday} of ${total} completed`;
  habitCount.textContent = `${total} habit${total === 1 ? "" : "s"}`;
  emptyMessage.hidden = total !== 0;
}

function calculateStreak(completedDates) {
  const completed = new Set(completedDates);
  let date = new Date();
  let streak = 0;

  if (!completed.has(formatDateKey(date))) {
    date.setDate(date.getDate() - 1);
  }

  while (completed.has(formatDateKey(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

renderHabits();