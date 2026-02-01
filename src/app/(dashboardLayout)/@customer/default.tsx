import { redirect } from "next/navigation";

export default function CustomerDefault() {
  redirect("/dashboard");
  return null;
}