import useAuthStore from './authStore';

const useUser = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Maintain compatible API with previous implementation
  return {
    user: user,
    data: user,
    loading: false, // Store is synchronous/persisted
    isAuthenticated
  };
};

export { useUser };
export default useUser;