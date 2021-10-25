import "regenerator-runtime";

import { App } from "./App";
import { StrictMode } from "react";
import {render} from "react-dom";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Root element should exist");
}

render(
    <StrictMode>
        <App />
    </StrictMode>,
    root,
);