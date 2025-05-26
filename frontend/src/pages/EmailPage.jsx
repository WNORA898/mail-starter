import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/components/AuthContext";
import { formatDate } from "@/lib/utils";

export const Email = () => {
  const { emailCategory, emailId } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const deleteEmail = async () => {
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete email");
      navigate("/c/inbox");
    } catch (error) {
      alert(error.message);
    }
  };

  const reply = () => {
    navigate("/compose", {
      state: {
        recipients: [email.sender, ...email.recipients]
          .filter((r) => r.email !== user.email)
          .map((r) => r.email)
          .join(","),
        subject: `Re: ${email.subject}`,
        body: `\n\n----\non ${formatDate(email.sentAt)}, ${email.sender.email} wrote:\n\n${email.body}`,
      },
    });
  };

  const toggleArchive = async () => {
    try {
      const res = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: !email.archived }),
      });
      if (!res.ok) throw new Error("Failed to update archive status");
      const updatedEmail = await res.json();
      setEmail(updatedEmail);
    } catch (error) {
      alert(error.message);
    }
  };

  const formatTextWithNewlines = (text) => {
    return text?.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await fetch(`/api/emails/${emailId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load email");
        const data = await res.json();
        setEmail(data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId]);

  if (loading) {
    return null;
  }

  if (!email) {
    return <div>Email not found</div>;
  }

  return (
    <div>
      <div>
        <h2 className="font-medium text-3xl">{email.subject}</h2>
        <Badge className="my-4">{emailCategory}</Badge>
        <ul className="pb-4 border-b flex flex-col gap-2">
          <li>
            <span className="font-bold">From:</span>{" "}
            <span>{email.sender.email}</span>
          </li>
          <li>
            <span className="font-bold">To:</span>{" "}
            <span>{email.recipients.map((r) => r.email).join(", ")}</span>
          </li>
          <li>
            <span>{formatDate(email.sentAt)}</span>
          </li>
        </ul>
        <p className="my-4">{formatTextWithNewlines(email.body)}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reply} variant="outline">
          Reply
        </Button>
        {emailCategory !== "sent" && (
          <Button onClick={toggleArchive} variant="outline">
            {email.archived ? "Unarchive" : "Archive"}
          </Button>
        )}
        <Button onClick={deleteEmail} variant="outlineDestructive">
          Delete
        </Button>
      </div>
    </div>
  );
};
