import { signOut, useSession } from "next-auth/react";

export default function Profile() {
  const { data } = useSession();
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h3>{data?.user?.name}</h3>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-blue-400 outline-none border-none"
        type="button"
      >
        Sign Out
      </button>
    </div>
  );
}
