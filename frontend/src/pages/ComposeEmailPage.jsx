import { Form, Formik, ErrorMessage } from "formik";
import { useLocation, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { string, object } from "yup";

const emailComposeSchema = object({
  subject: string().trim().min(3).required(),
  body: string().trim().min(3).required(),
  recipients: string()
    .trim()
    .required()
    .test("are-valid-emails", "One or more emails are invalid", (value) => {
      const emails = value.split(",");
      const emailRegex = /^\S+@\S+\.\S+$/;
      return emails.every((email) => emailRegex.test(email.trim()));
    }),
});

export const ComposeEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialValues = location.state || {
    recipients: "",
    subject: "",
    body: "",
  };

  const sendEmail = async (emailValues) => {
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailValues),
      });

      if (!res.ok) {
        throw new Error("Failed to send email");
      }

      navigate("/c/inbox");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={emailComposeSchema}
        onSubmit={sendEmail}
      >
        {(formik) => {
          return (
            <Form
              autoComplete="off"
              className="max-w-md mx-auto flex flex-col gap-4"
            >
              <div>
                <Label className="mb-4 inline-block" htmlFor="recipients">
                  Recipients
                </Label>
                <Input id="recipients" {...formik.getFieldProps("recipients")} />
                <ErrorMessage
                  name="recipients"
                  component="span"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label className="mb-4 inline-block" htmlFor="subject">
                  Subject
                </Label>
                <Input id="subject" {...formik.getFieldProps("subject")} />
                <ErrorMessage
                  name="subject"
                  component="span"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label className="mb-4 inline-block" htmlFor="body">
                  Body
                </Label>
                <Textarea id="body" rows="15" {...formik.getFieldProps("body")} />
                <ErrorMessage
                  name="body"
                  component="span"
                  className="text-red-600"
                />
              </div>
              <Button className="self-end" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? "Sending..." : "Send"}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
