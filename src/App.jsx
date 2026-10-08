import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import UsersPage from "./UsersPage";
import { loginUser, logoutUser, registerUser } from "./authApi";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import { createUserTask, deleteUserTask, getUserTasks, updateUserTask } from "./userTasksApi";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const currentUser = session?.user;
  const currentUserId = currentUser?.id;
  const displayName = currentUser?.user_metadata?.display_name || username || currentUser?.email?.split("@")[0] || "";

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) return undefined;

    let isActive = true;
    async function loadTasks() {
      setIsLoadingTasks(true);
      setTasksError("");
      try {
        const loadedTasks = await getUserTasks(currentUserId);
        if (isActive) setTasks(loadedTasks);
      } catch (error) {
        if (isActive) setTasksError(error.message || "Nepavyko gauti užduočių.");
      } finally {
        if (isActive) setIsLoadingTasks(false);
      }
    }
    loadTasks();
    return () => { isActive = false; };
  }, [currentUserId]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");
    try {
      if (isRegistering) {
        await registerUser(username, password);
      } else {
        await loginUser(username, password);
      }
    } catch (error) {
      setAuthError(error.message || "Nepavyko prisijungti.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    try {
      await logoutUser();
      setActivePage("home");
      setPassword("");
    } catch (error) {
      setAuthError(error.message || "Nepavyko atsijungti.");
    }
  }

  async function handleAddTask(task) {
    if (!currentUser) return;
    setTasksError("");
    try {
      const created = await createUserTask(currentUser.id, task);
      setTasks((current) => [...current, created]);
    } catch (error) {
      setTasksError(error.message || "Nepavyko pridėti užduoties.");
      throw error;
    }
  }

  async function handleUpdateTask(taskId, updates) {
    setTasksError("");
    try {
      const saved = await updateUserTask(taskId, updates);
      setTasks((current) => current.map((task) => task.id === taskId ? saved : task));
    } catch (error) {
      setTasksError(error.message || "Nepavyko atnaujinti užduoties.");
    }
  }

  async function handleDeleteTask(taskId) {
    setTasksError("");
    try {
      await deleteUserTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (error) {
      setTasksError(error.message || "Nepavyko ištrinti užduoties.");
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedTaskCount = tasks.filter((task) => task.status === "Atlikta").length;
  const overdueTaskCount = tasks.filter((task) => task.status !== "Atlikta" && task.deadline && new Date(`${task.deadline}T00:00:00`) < today).length;

  return (
    <>
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        isLoggedIn={Boolean(session)}
        onLogout={handleLogout}
      />

      {activePage === "home" && (
        <>
          {session ? (
            <>
              <header className="welcome-message">
                <h1>Sveiki sugrįžę!</h1>
                <p>Prisijungėte kaip {displayName}.</p>
              </header>
              <main className="login-page">
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
                <ProgressBar initialProgress={completedTaskCount} />
              </main>
            </>
          ) : (
            <main className="login-page">
              <div className="login-card">
                <header className="login-card__header">
                  <h1>{isRegistering ? "Nauja paskyra" : "Prisijungti"}</h1>
                  <p>{isRegistering ? "Sukurk paskyrą vardu ir slaptažodžiu" : "Įveskite savo vartotojo vardą ir slaptažodį"}</p>
                </header>
                {!isSupabaseConfigured && (
                  <p className="login-error" role="alert">Supabase dar nenustatytas. Užpildyk .env.local pagal .env.example ir paleisk Vite iš naujo.</p>
                )}
                <form className="login-form" onSubmit={handleAuthSubmit}>
                  <label className="login-field">
                    <span>Vartotojo vardas</span>
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={3}
                      required
                    />
                  </label>
                  <label className="login-field">
                    <span>Slaptažodis</span>
                    <input
                      type="password"
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={6}
                      required
                    />
                  </label>
                  <button type="submit" className="login-submit" disabled={isAuthLoading || !isSupabaseConfigured}>
                    {isAuthLoading ? "Palaukite..." : isRegistering ? "Registruotis" : "Prisijungti"}
                  </button>
                  {authError && <p className="login-error" role="alert">{authError}</p>}
                </form>
                <button
                  type="button"
                  className="auth-mode-toggle"
                  onClick={() => { setIsRegistering((value) => !value); setAuthError(""); }}
                >
                  {isRegistering ? "Jau turi paskyrą? Prisijunk" : "Neturi paskyros? Registruokis"}
                </button>
              </div>
            </main>
          )}
        </>
      )}

      {activePage === "profile" && session && (
        <Profile
          user={{ name: displayName, email: currentUser.email || "" }}
          tasks={tasks}
        />
      )}
      {activePage === "users" && session && <UsersPage />}
    </>
  );
}

export default App;