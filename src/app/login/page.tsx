import LoginForm from "@/app/login/LoginForm";

export default async function Login() {
  return (
    <div className="h-full px-[1rem]">
      <div className="mx-auto max-w-3xl min-h-full flex flex-col justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
