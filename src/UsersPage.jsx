import { useEffect, useState } from "react";
import { getUsers } from "./usersApi";
import "./UsersPage.css";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getUsers();
        if (isActive) setUsers(result);
      } catch (loadError) {
        if (isActive) setError(loadError.message || "Nepavyko įkelti vartotojų.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadUsers();
    return () => { isActive = false; };
  }, []);

  return (
    <main className="users-page">
      <section className="users-card">
        <header className="users-card__header">
          <div>
            <p className="users-card__eyebrow">Administravimas</p>
            <h1>Vartotojai</h1>
            <p>Supabase registruoti vartotojai</p>
          </div>
          <span className="users-count">{users.length}</span>
        </header>

        {isLoading && <p className="users-state">Kraunami vartotojai...</p>}
        {!isLoading && error && (
          <div className="users-error" role="alert">
            <p>{error}</p>
            <p>Sukurk Testapi.io paskyroje viešą Users lentelę su username, displayName, email ir role laukais.</p>
          </div>
        )}
        {!isLoading && !error && users.length === 0 && (
          <p className="users-state">Vartotojų dar nėra.</p>
        )}
        {!isLoading && !error && users.length > 0 && (
          <div className="users-list">
            {users.map((user) => (
              <article className="users-item" key={user.id ?? user._id ?? user.username}>
                <div className="users-item__avatar" aria-hidden="true">
                  {(user.displayName || user.username || "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="users-item__details">
                  <h2>{user.displayName || user.username || "Vartotojas"}</h2>
                  <p>{user.username}</p>
                </div>
                <span className="users-item__role">{user.role || "Vartotojas"}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default UsersPage;