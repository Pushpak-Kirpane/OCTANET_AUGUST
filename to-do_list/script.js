document.addEventListener('DOMContentLoaded', function() {
    loadTasks();

    document.getElementById('addTaskButton').addEventListener('click', function() {
        addTask();
    });
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskTime = document.getElementById('taskTime');
    const taskList = document.getElementById('taskList');

    if (taskInput.value === '') {
        alert('Please enter a task!');
        return;
    }

    const taskId = Date.now();
    const task = {
        id: taskId,
        text: taskInput.value,
        time: taskTime.value,
        completed: false
    };

    createTaskElement(task);
    saveTask(task);

    taskInput.value = '';
    taskTime.value = '';
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;

    const taskText = `${task.text} - ${new Date(task.time).toLocaleString()}`;
    li.innerHTML = `
        <span class="task-text">${taskText}</span>
        <span class="countdown"></span>
        <button class="edit-btn" onclick="editTask(this)">Edit</button>
        <button class="complete-btn" onclick="completeTask(this)">Complete</button>
        <button class="delete-btn" onclick="deleteTask(this)">Delete</button>
    `;

    document.getElementById('taskList').appendChild(li);

    if (task.completed) {
        li.classList.add('completed');
        li.querySelector('.countdown').textContent = 'Completed';
    } else {
        startCountdown(li.querySelector('.countdown'), new Date(task.time).getTime(), li);
    }
}

function startCountdown(countdownElement, endTime, li) {
    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = 'Time is over!';
            if (!li.classList.contains('completed')) {
                alert('The time is over, and the task is not completed. Try harder next time!');
            }
            clearInterval(interval);
        } else {
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            countdownElement.innerHTML = `${hours}h ${minutes}m ${seconds}s remaining`;
        }
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to avoid 1-second delay

    li.dataset.intervalId = interval;
}

function completeTask(button) {
    const li = button.parentElement;
    li.classList.add('completed');
    const countdownElement = li.querySelector('.countdown');
    countdownElement.textContent = 'Completed';

    const taskId = li.dataset.id;
    const tasks = getSavedTasks();
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    clearInterval(li.dataset.intervalId);
    alert('Task completed! Congratulations!');
}

function editTask(button) {
    const li = button.parentElement;
    const taskText = li.querySelector('.task-text').textContent.split(' - ')[0];
    const newTask = prompt('Edit your task:', taskText);
    if (newTask !== null && newTask.trim() !== '') {
        const taskTime = li.querySelector('.task-text').textContent.split(' - ')[1];
        li.querySelector('.task-text').textContent = `${newTask} - ${taskTime}`;
        updateTask(li.dataset.id, newTask);
    }
}

function deleteTask(button) {
    if (confirm('Do you really want to delete this task?')) {
        const li = button.parentElement;
        const taskId = li.dataset.id;
        removeTask(taskId);
        li.remove();
    }
}

function saveTask(task) {
    const tasks = getSavedTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getSavedTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function loadTasks() {
    const tasks = getSavedTasks();
    tasks.forEach(task => createTaskElement(task));
}

function updateTask(taskId, newText) {
    const tasks = getSavedTasks();
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].text = newText;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function removeTask(taskId) {
    let tasks = getSavedTasks();
    tasks = tasks.filter(task => task.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
