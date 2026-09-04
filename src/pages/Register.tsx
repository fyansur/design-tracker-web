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
import { User, Mail, Lock, CircleAlert } from "lucide-react";
import { registerFormSchema, type RegisterForm } from "@/lib/validation";
import loginRegisterImage from "@/assets/loginregister_image.jpeg";

export default function Register() {
  const [serverError, setServerError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterForm) {
    setServerError("");
    try {
      await register(values.name, values.email, values.password);
      navigate("/");
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : "Registration failed";
      setServerError(message || "Registration failed");
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
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Start tracking your designs today
                  </p>
                </div>

                {serverError && (
                  <Alert className="flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                    <CircleAlert className="size-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Name</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><User className="size-4" /></InputGroupAddon>
                          <InputGroupInput placeholder="Your name" aria-invalid={fieldState.invalid} {...field} />
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

                <Field>
                  <Field className="grid grid-cols-2 gap-4">
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
                    <Controller
                      name="confirmPassword"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Confirm Password</FieldLabel>
                          <FieldContent>
                            <InputGroup>
                              <InputGroupAddon align="inline-start"><Lock className="size-4" /></InputGroupAddon>
                              <InputGroupInput placeholder="Confirm Password" type="password" aria-invalid={fieldState.invalid} {...field} />
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
                  </Field>
                  <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                </Field>

                <Field>
                  <Button type="submit">Create Account</Button>
                </Field>

                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
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