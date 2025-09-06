"use client";

import SubmitButton from "@/components/SubmitButton";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const forgotPassSchema = z.object({
  email: z.string().min(1, "Email is Required").email("Enter a valid email"),
});

const ForgotPassword = () => {
  const [forgotPassword, { isLoading, isSuccess, error }] =
    useForgotPasswordMutation();

  const form = useForm<z.infer<typeof forgotPassSchema>>({
    resolver: zodResolver(forgotPassSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (
    data: z.infer<typeof forgotPassSchema>
  ) => {
    await forgotPassword({
      email: data.email,
      userType: "admin",
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Email send Successfull");
      form.reset();
    }
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = error as any;
      toast.error(errorData.data.message);
    }
  }, [error, form, isSuccess]);

  return (
    <div className="m-auto h-screen flex flex-col items-center justify-center">
      <Card className="max-w-[450px]">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email. this email should be a registerd email in this
            website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="space-y-4"
            >
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter Your Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton isLoading={isLoading} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
