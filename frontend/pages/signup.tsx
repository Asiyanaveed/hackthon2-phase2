import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  return (
    <div>
      <AuthForm mode="signup" onSuccess={handleSuccess} />
    </div>
  );
}
