import { Form, Outlet } from "@remix-run/react";

export default function App() {
  return (
    <>
      <h2>Fuel App</h2>
      <Form method="post" action="/signout">
        <button type="submit">Sign out</button>
      </Form>
      <Outlet />
    </>
  );
}
