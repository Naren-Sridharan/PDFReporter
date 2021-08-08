import { neverland as $, render, html } from "neverland";
import App from "./components/App.js";
render(document.body, html`${App()}`);
