import { NavLink, Route, Routes } from "react-router";
import Home from "./pages/Home.jsx";

function Page({ title, description }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export default function App() {
  return (
    <>
      <header className="site-header">
        <span className="brand">Messaging App</span>

        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/register">Register</NavLink>

          <NavLink to="/login">Log in</NavLink>

          <NavLink to="/profile">Profile</NavLink>

          <NavLink to="/conversations">Conversations</NavLink>
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/register"
            element={
              <Page
                title="Register"
                description="The registration form will go here."
              />
            }
          />

          <Route
            path="/login"
            element={
              <Page title="Log in" description="The login form will go here." />
            }
          />

          <Route
            path="/profile"
            element={
              <Page
                title="Profile"
                description="Your profile editor will go here."
              />
            }
          />

          <Route
            path="/conversations"
            element={
              <Page
                title="Conversations"
                description="Your conversation list will go here."
              />
            }
          />

          <Route
            path="*"
            element={
              <Page
                title="Page not found"
                description="Choose a page from the navigation."
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}
