"use client"; // Optional here, but ensures client-side behavior if needed

import { redirect } from "next/navigation"; // Next.js helper for client/server redirects
import React from "react";

// --------------------- REDIRECT PAGE ---------------------
const page = () => {
  // Immediately redirect to the chat page
  return redirect("/chat");
};

export default page;
