import "./TaskList.css";

function TaskList({ tasks = [], loading = false, onStatusChange, onDeadlineChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <section className="task-card">
        <p className="task-state">Kraunamos užduotys...</p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="task-card">
        <p className="task-state">Užduočių kol kas nėra.</p>
      </section>
    );
  }

  return (
    <section className="task-card">
      <header className="task-card__header">
        <h2>Užduotys</h2>
        <p>Artimiausi darbai ir jų būsena</p>
      </header>

      <div className="task-list">
        {tasks.map((task) => {
          const isOverdue =
            task.status !== "Atlikta" &&
            task.deadline &&
            new Date(`${task.deadline}T00:00:00`) < today;

          return (
          <article
            className={`task-item${isOverdue ? " task-item--overdue" : ""}`}
            key={task.id}
          >
            <div className="task-item__top">
              <h3>{task.title}</h3>

              <label className="task-status-field">
                <span className="visually-hidden">Užduoties statusas</span>
                <select
                  className={`task-status task-status--${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  value={task.status}
                  onChange={(event) =>
                    onStatusChange?.(task.id, event.target.value)
                  }
                  aria-label={`Keisti užduoties „${task.title}“ statusą`}
                >
                  <option value="Nepradėta">Nepradėta</option>
                  <option value="Vykdoma">Vykdoma</option>
                  <option value="Atlikta">Atlikta</option>
                </select>
              </label>
            </div>

            <label className={`task-deadline${isOverdue ? " task-deadline--overdue" : ""}`}>
              <span>Terminas:</span>
              <input
                type="date"
                value={task.deadline}
                onChange={(event) =>
                  onDeadlineChange?.(task.id, event.target.value)
                }
                aria-label={`Keisti užduoties „${task.title}“ terminą`}
              />
            </label>
          </article>
          );
        })}
      </div>
    </section>
  );
}

export default TaskList;
