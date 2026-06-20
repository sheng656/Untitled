"use client";

import React, { useState } from "react";
import SubmissionForm from "./SubmissionForm";
import PasswordGate from "./PasswordGate";

interface SubmitPageClientProps {
  eventId: string;
  eventSlug: string;
  initialAuthed: boolean;
}

export default function SubmitPageClient({
  eventId,
  eventSlug,
  initialAuthed,
}: SubmitPageClientProps) {
  const [isAuthed, setIsAuthed] = useState(initialAuthed);

  if (!isAuthed) {
    return (
      <PasswordGate
        eventSlug={eventSlug}
        onSuccess={() => setIsAuthed(true)}
      />
    );
  }

  return <SubmissionForm eventId={eventId} eventSlug={eventSlug} />;
}
