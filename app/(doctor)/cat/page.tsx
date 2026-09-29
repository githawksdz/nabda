import { redirect } from "next/navigation";

export default function CatIndexRedirect() {
  redirect("/protocols");
}
