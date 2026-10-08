import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import { createTask, deleteTask, getTasks, updateTask } from "./tasksApi";
import "./App.css";

function App() {
  const user = {
    name: "Jonas Jonaitis",
    email: "jonas@flowly.lt",
  };

  const [activePage, setActivePage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      setIsLoadingTasks(true);
      setTasksError("");

      try {
        const loadedTasks = await getTasks();
        if (isActive) setTasks(loadedTasks);
      } catch (error) {
        if (isActive) setTasksError(error.message || "Nepavyko gauti užduočių.");
      } finally {
        if (isActive) setIsLoadingTasks(false);
      }
    }

    loadTasks();
    return () => { isActive = false; };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (email === "admin" && password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("Neteisingas vartotojo vardas arba slaptažodis.");
  }

  async function handleAddTask(task) {
    setTasksError("");
    try {
      const createdTask = await createTask(task);
      setTasks((currentTasks) => [...currentTasks, createdTask]);
    } catch (error) {
      setTasksError(error.message || "Nepavyko pridėti užduoties.");
      throw error;
    }
  }

  async function handleUpdateTask(taskId, updates) {
    const currentTask = tasks.find((task) => String(task.id) === String(taskId));
    if (!currentTask) return;

    const updatedTask = { ...currentTask, ...updates };
    setTasksError("");
    try {
      const savedTask = await updateTask(taskId, updatedTask);
      setTasks((currentTasks) => currentTasks.map((task) =>
        String(task.id) === String(taskId) ? { ...task, ...savedTask, ...updatedTask } : task,
      ));
    } catch (error) {
      setTasksError(error.message || "Nepavyko atnaujinti užduoties.");
    }
  }

  async function handleDeleteTask(taskId) {
    setTasksError("");
    try {
      await deleteTask(taskId);
      setTasks((currentTasks) => currentTasks.filter(
        (task) => String(task.id) !== String(taskId),
      ));
    } catch (error) {
      setTasksError(error.message || "Nepavyko ištrinti užduoties.");
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedTaskCount = tasks.filter((task) => task.status === "Atlikta").length;
  const overdueTaskCount = tasks.filter((task) => {
    if (task.status === "Atlikta" || !task.deadline) return false;
    return new Date(`${task.deadline}T00:00:00`) < today;
  }).length;

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "home" && (
        <>
          {isLoggedIn && (
            <header className="welcome-message">
              <h1>Sveiki sugrįžę!</h1>
              <p>Prisijungėte kaip admin.</p>
            </header>
          )}

          <main className="login-page">
            {!isLoggedIn && (
              <div className="login-card">
                <header className="login-card__header">
                  <h1>Prisijungti</h1>
                  <p>Įveskite savo duomenis, kad tęstumėte</p>
                </header>

                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-field">
                    <span>Vartotojo vardas</span>
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      placeholder="admin"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>
                  <label className="login-field">
                    <span>Slaptažodis</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" className="login-submit">Prisijungti</button>
                  {loginError && <p className="login-error" role="alert">{loginError}</p>}
                </form>
              </div>
            )}

            {isLoggedIn && (
              <>
                <section className="dashboard-summary" aria-label="Užduočių suvestinė">
                  <p>
                    <strong>{tasks.length} užduotys</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{completedTaskCount} atliktos</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{overdueTaskCount} vėluoja</strong>
                  </p>
                </section>

                {tasksError && <p className="login-error" role="alert">{tasksError}</p>}
                <TaskList
                  tasks={tasks}
                  loading={isLoadingTasks}
                  onStatusChange={(id, status) => handleUpdateTask(id, { status })}
                  onDeadlineChange={(id, deadline) => handleUpdateTask(id, { deadline })}
                  onDelete={handleDeleteTask}
                />
                <AddTaskForm onAddTask={handleAddTask} />
                <ProgressBar initialProgress={50} />
              </>
            )}
          </main>
        </>
      )}

      {activePage === "profile" && <Profile user={user} tasks={tasks} />}
    </>
  );
}

export default App;