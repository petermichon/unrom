import { redirect } from "react-router";

// Letters are no longer a destination. Send every old letter URL to the
// directory, where brand and coverage filters (and search) now live.
export async function loader() {
  throw redirect("/devices", 301);
}

export async function clientLoader() {
  throw redirect("/devices", 301);
}
