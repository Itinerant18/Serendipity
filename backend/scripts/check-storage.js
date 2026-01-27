const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials missing in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkAndCreateBucket() {
    try {
        console.log('🔍 Checking Supabase storage configuration...\n');

        // List all buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            return;
        }

        console.log('📦 Existing buckets:', buckets.map(b => b.name).join(', ') || 'None');

        // Check if product-media bucket exists
        const productMediaBucket = buckets.find(b => b.name === 'product-media');

        if (!productMediaBucket) {
            console.log('\n⚠️  "product-media" bucket NOT found!');
            console.log('📝 Creating "product-media" bucket...');

            const { data: newBucket, error: createError } = await supabase.storage.createBucket('product-media', {
                public: true,
                fileSizeLimit: 104857600, // 100MB
                allowedMimeTypes: ['image/*', 'video/*']
            });

            if (createError) {
                console.error('❌ Error creating bucket:', createError.message);
                console.log('\n📋 Manual fix required:');
                console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/storage/buckets');
                console.log('2. Click "New bucket"');
                console.log('3. Name: product-media');
                console.log('4. Public: YES (checked)');
                console.log('5. File size limit: 100 MB');
                console.log('6. Click "Create bucket"');
                return;
            }

            console.log('✅ Bucket "product-media" created successfully!');
        } else {
            console.log(`\n✅ "product-media" bucket exists!`);
            console.log(`   - Public: ${productMediaBucket.public ? 'YES ✅' : 'NO ❌'}`);
            console.log(`   - ID: ${productMediaBucket.id}`);

            if (!productMediaBucket.public) {
                console.log('\n⚠️  WARNING: Bucket is NOT public!');
                console.log('📋 Fix required:');
                console.log('1. Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/storage/buckets/product-media');
                console.log('2. Click "Settings" tab');
                console.log('3. Toggle "Public bucket" to ON');
                console.log('4. Click "Save"');
            }
        }

        // Test upload
        console.log('\n🧪 Testing file upload...');
        const testFile = Buffer.from('test');
        const testPath = 'test/test-upload.txt';

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-media')
            .upload(testPath, testFile, {
                contentType: 'text/plain',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ Upload test failed:', uploadError.message);
        } else {
            console.log('✅ Upload test successful!');

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('product-media')
                .getPublicUrl(testPath);

            console.log('🔗 Public URL:', urlData.publicUrl);

            // Clean up test file
            await supabase.storage.from('product-media').remove([testPath]);
            console.log('🧹 Test file cleaned up');
        }

        console.log('\n✨ Storage setup complete!');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkAndCreateBucket();
