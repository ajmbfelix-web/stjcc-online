export async function handleAuthPopupRequest(): Promise<Response> {
  return Response.json(
    { error: "Popup authentication is disabled; use first-party sign-in." },
    { status: 404 },
  );
}
