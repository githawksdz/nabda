import { redirect } from "next/navigation";

export default function InteractionsPage() {
  redirect("/search?type=drugs");
}
