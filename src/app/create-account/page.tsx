import CreateAccountForm from "@/app/create-account/CreateAccountForm";

export default async function CreateAccount() {
  return (
    <div className="h-full">
      <div className="mx-auto max-w-3xl min-h-full flex flex-col justify-center">
        <CreateAccountForm />
      </div>
    </div>
  );
}
