import { redirect } from "next/navigation";

export default function CatPreviewIndexRedirect() {
  redirect("/internal/protocol-preview");
}
