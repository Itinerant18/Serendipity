const supabase = require('./config/supabase');

const testAuth = async () => {
    console.log('Testing Supabase Auth SignUp...');
    const email = 'test_script_user@example.com';
    const password = 'password123';

    // Trim just in case
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Test Script User'
            }
        }
    });

    if (error) {
        console.error('Sign Up Error:', error);
    } else {
        console.log('Sign Up Success:', data);
    }
};

testAuth();
