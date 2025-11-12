// components/LogoutButton.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/dashboard"); // redirect to login after logout
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full mt-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold 
                 hover:from-red-600 hover:to-pink-600 
                 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md opacity+30"
    >
       Logout
    </button>
  );
}

