import { redirect } from "react-router";

export function loader({ params }: { params: { codename: string } }) {
  return redirect(`/devices/${params.codename}`, 301);
}
