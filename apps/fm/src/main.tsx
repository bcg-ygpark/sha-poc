import { createRoot } from "react-dom/client";
import { ClickToComponent } from "click-to-react-component";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <>
      {import.meta.env.DEV && <ClickToComponent editor="cursor" />}
      <App />
    </>
  );
}

