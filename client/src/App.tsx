import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [privateData, setPrivateData] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    const googleLoginUrl = getGoogleLoginUrl();
    window.location.href = googleLoginUrl;
  };

  const getGoogleLoginUrl = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI as string,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
      prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const urlAccessToken = url.searchParams.get("token");

    if (urlAccessToken) {
      localStorage.setItem("accessToken", urlAccessToken);
    }

    const accessToken = urlAccessToken || localStorage.getItem("accessToken");
    window.history.replaceState({}, "", window.location.origin);

    const fetchUserProfile = async () => {
      if (accessToken) {
        try {
          const userProfile = await jwtDecode(accessToken);
          setUser(userProfile as User);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const fetchPrivateData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/private`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setPrivateData(data);
      } catch (error) {
        console.error("Error fetching private data:", error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Google Login</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={fetchPrivateData}>Fetch Private Data</button>
      <pre>{JSON.stringify(privateData, null, 2)}</pre>
    </div>
  );
};
