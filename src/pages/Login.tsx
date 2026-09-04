import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, CircleAlert } from "lucide-react";
import { loginFormSchema, type LoginForm } from "@/lib/validation";
import loginRegisterImage from "@/assets/loginregister_image.jpeg";
export default function Login() {
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setServerError("");
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : "Login failed";
      setServerError(message || "Invalid email or password");
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Design Tracker account
                  </p>
                </div>

                {serverError && (
                  <Alert className="flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                    <CircleAlert className="size-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Email</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><Mail className="size-4" /></InputGroupAddon>
                          <InputGroupInput aria-invalid={fieldState.invalid} placeholder="you@example.com" {...field} />
                        </InputGroup>
                        {fieldState.invalid && (
                          <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                            <CircleAlert className="size-4" />
                            <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                          </Alert>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Password</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><Lock className="size-4" /></InputGroupAddon>
                          <InputGroupInput placeholder="Password" type="password" aria-invalid={fieldState.invalid} {...field} />
                        </InputGroup>
                        {fieldState.invalid && (
                          <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                            <CircleAlert className="size-4" />
                            <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                          </Alert>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit">Login</Button>
                </Field>

                <FieldDescription className="text-center">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </FieldDescription>
              </FieldGroup>
            </form>

            <div className="relative hidden bg-muted md:block">
              <img
                src={loginRegisterImage}
                alt="Design Tracker"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4]"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}