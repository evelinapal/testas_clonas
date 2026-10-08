import { useState } from "react";
import "./AddTaskForm.css";

function AddTaskForm({ onAddTask }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Nepradėta");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await onAddTask({ title, status, deadline });
      setTitle("");
      setDeadline("");
      setStatus("Nepradėta");
      setIsOpen(false);
    } catch (saveError) {
      setError(saveError.message || "Nepavyko išsaugoti užduoties.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setTitle("");
    setDeadline("");
    setStatus("Nepradėta");
    setError("");
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="add-task">
        <button type="button" className="add-task__open-button" onClick={() => setIsOpen(true)}>
          + Nauja užduotis
        </button>
      </div>
    );
  }

  return (
    <div className="add-task">
      <div className="add-task__card">
        <div className="add-task__header">
          <div>
            <h2>Nauja užduotis</h2>
            <p>Pridėkite naują užduotį į savo sąrašą</p>
          </div>
          <button type="button" className="add-task__close" onClick={handleCancel} aria-label="Uždaryti">
            ×
          </button>
        </div>

        <form className="add-task__form" onSubmit={handleSubmit}>
          <label className="add-task__field">
            <span>Užduoties pavadinimas</span>
            <input
              type="text"
              placeholder="Pvz. Sukurti profilio puslapį"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label className="add-task__field">
            <span>Terminas</span>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </label>
          <label className="add-task__field">
            <span>Statusas</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Nepradėta">Nepradėta</option>
              <option value="Vykdoma">Vykdoma</option>
              <option value="Atlikta">Atlikta</option>
            </select>
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}
          <div className="add-task__actions">
            <button type="button" className="add-task__cancel" onClick={handleCancel} disabled={isSaving}>
              Atšaukti
            </button>
            <button type="submit" className="add-task__submit" disabled={isSaving}>
              {isSaving ? "Saugoma..." : "Pridėti užduotį"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskForm;
