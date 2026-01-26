export async function POST(request) {
  try {
    const body = await request.json();

    // Forward the payload to the backend Express API
    const backendResponse = await fetch("http://localhost:5000/api/seller/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);

    return Response.json(
      data ?? { message: "Unexpected response from backend" },
      { status: backendResponse.status },
    );
  } catch (error) {
    console.error("Error in /api/seller/signup proxy:", error);
    return Response.json(
      { message: "Failed to create seller account", error: error.message },
      { status: 500 },
    );
  }
}

// React Router form submissions will call this `action` export.
// Delegate directly to our POST handler so both fetch() and form POST work.
export async function action({ request }) {
  return POST(request);
}
