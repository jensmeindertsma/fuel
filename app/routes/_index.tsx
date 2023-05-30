import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Fuel" },
    { name: "description", content: "Welcome to Fuel!" },
  ];
};

export default function Index() {
  return <h1>Fuel</h1>;
}
