import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/utils/authStore';

export default function RootLayout({ children }) {
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    const fetchProfileAndLogin = async (session) => {
      try {
        const profileRes = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        let isSeller = false;
        let isAdmin = false;
        let sellerProfileId = null;
        let mobile = null;

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          isSeller = profileData.user?.isSeller || false;
          isAdmin = profileData.user?.isAdmin || false;
          sellerProfileId = profileData.user?.sellerProfileId || null;
          mobile = profileData.user?.mobile || null;
        }

        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url,
          authProvider: 'google',
          mobile,
          isSeller,
          isAdmin,
          sellerProfileId
        };
        login(user, session.access_token);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fallback to basic user
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url,
          authProvider: 'google',
          isSeller: false,
          isAdmin: false
        };
        login(user, session.access_token);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfileAndLogin(session);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchProfileAndLogin(session);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
