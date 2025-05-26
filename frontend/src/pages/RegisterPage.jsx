import { Form, Formik, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { string, ref, object } from "yup";

const registerSchema = object({
  email: string()
    .trim()
    .required("Email is required")
    .matches(/^\S+@\S+\.\S+$/, "Please enter a valid email"),
  password: string().trim().min(8, "Minimum 8 characters").required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export const RegisterPage = () => {
  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const registerUser = async (registerValues, { setSubmitting }) => {
    setErr("");
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: registerValues.email,
          password: registerValues.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      navigate("/c/inbox");
    } catch (error) {
      setErr(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xs mx-auto my-4">
      <Formik
        initialValues={initialValues}
        validationSchema={registerSchema}
        onSubmit={registerUser}
      >
        {(formikProps) => (
          <Form className="flex flex-col gap-4" autoComplete="off">
            {err && (
              <div className="text-sm bg-red-100 p-3 rounded-sm text-red-600">
                {err}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="mb-4 block">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                {...formikProps.getFieldProps("email")}
              />
              <ErrorMessage
                name="email"
                component="span"
                className="text-red-600 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-4 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...formikProps.getFieldProps("password")}
              />
              <ErrorMessage
                name="password"
                component="span"
                className="text-red-600 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="mb-4 block">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...formikProps.getFieldProps("confirmPassword")}
              />
              <ErrorMessage
                name="confirmPassword"
                component="span"
                className="text-red-600 text-sm"
              />
            </div>
            <div className="flex items-center gap-4 justify-between">
              <span>
                Already have an account?{" "}
                <Link className="text-blue-500" to="/login">
                  Login
                </Link>
              </span>
              <Button
                type="submit"
                className="self-end"
                disabled={formikProps.isSubmitting}
              >
                Register
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
