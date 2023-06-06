import { Link, Outlet } from "@remix-run/react";

export default function Public() {
  return (
    <>
      <header>
        <h1>
          <Link to="/">Fuel</Link>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="/signin">Sign in</Link>
            </li>
            <li>
              <Link to="/signup">Sign up</Link>
            </li>
          </ul>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
