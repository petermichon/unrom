import { redirect } from "react-router";

export function loader({ params }: { params: { id: string } }) {
  return redirect(`/roms/${params.id}`, 301);
}
