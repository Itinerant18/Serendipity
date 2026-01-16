import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/utils/authStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function RootLayout({ children }) {
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();
  const pathname = location.pathname;

  // Define routes where global header/footer should NOT appear
  const isExcludedRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin') || pathname.startsWith('/auth');

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
      // Skip if on callback page to avoid race conditions
      if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
        console.log("RootLayout: Skipping initial session check on /auth/callback route");
        return;
      }

      if (session?.user) {
        fetchProfileAndLogin(session);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip profile fetch in RootLayout if we are on the auth callback page
      // to avoid race conditions with the page's own fetch logic.
      if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
        console.log("RootLayout: Skipping profile fetch on /auth/callback route");
        return;
      }

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
      {!isExcludedRoute && <Header />}
      {children}
      {!isExcludedRoute && <Footer />}
    </QueryClientProvider>
  );
}
