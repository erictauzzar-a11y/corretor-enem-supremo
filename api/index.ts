import { createApp } from "../server/_core/app";

const app = await createApp({ serveFrontend: false });

export default app;
