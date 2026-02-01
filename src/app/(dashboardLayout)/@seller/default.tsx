import { redirect } from "next/navigation";

export default function SellerDefault() {
  redirect("/seller-dashboard");
  return null;
}