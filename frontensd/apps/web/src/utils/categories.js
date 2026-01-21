// Updated categories and subcategories structure
export const MAIN_CATEGORIES = [
    {
        name: "Electronics",
        emoji: "📱",
        icon: "fa-solid fa-mobile-screen-button",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Smartphones & Accessories",
            "Laptops & Computers",
            "Audio & Headphones",
            "Cameras & Photography",
            "Gaming & Consoles",
            "Wearables & Smart Devices",
            "TV & Home Entertainment",
            "Computer Accessories"
        ],
        subcategoryIcons: {
            "Smartphones & Accessories": "fa-solid fa-mobile",
            "Laptops & Computers": "fa-solid fa-laptop",
            "Audio & Headphones": "fa-solid fa-headphones",
            "Cameras & Photography": "fa-solid fa-camera",
            "Gaming & Consoles": "fa-solid fa-gamepad",
            "Wearables & Smart Devices": "fa-solid fa-stopwatch",
            "TV & Home Entertainment": "fa-solid fa-tv",
            "Computer Accessories": "fa-solid fa-keyboard"
        }
    },
    {
        name: "Fashion",
        emoji: "👕",
        icon: "fa-solid fa-shirt",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Men's Clothing",
            "Women's Clothing",
            "Kids' Clothing",
            "Footwear",
            "Bags & Luggage",
            "Watches",
            "Jewelry & Accessories",
            "Sunglasses & Eyewear"
        ],
        subcategoryIcons: {
            "Men's Clothing": "fa-solid fa-user-tie",
            "Women's Clothing": "fa-solid fa-person-dress",
            "Kids' Clothing": "fa-solid fa-child",
            "Footwear": "fa-solid fa-shoe-prints",
            "Bags & Luggage": "fa-solid fa-suitcase",
            "Watches": "fa-solid fa-clock",
            "Jewelry & Accessories": "fa-solid fa-gem",
            "Sunglasses & Eyewear": "fa-solid fa-glasses"
        }
    },
    {
        name: "Home & Living",
        emoji: "🏠",
        icon: "fa-solid fa-house",
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Furniture",
            "Kitchen & Dining",
            "Bedding & Bath",
            "Home Decor",
            "Storage & Organization",
            "Lighting",
            "Garden & Outdoor",
            "Home Appliances"
        ],
        subcategoryIcons: {
            "Furniture": "fa-solid fa-couch",
            "Kitchen & Dining": "fa-solid fa-utensils",
            "Bedding & Bath": "fa-solid fa-bed",
            "Home Decor": "fa-solid fa-image",
            "Storage & Organization": "fa-solid fa-box-open",
            "Lighting": "fa-solid fa-lightbulb",
            "Garden & Outdoor": "fa-solid fa-leaf",
            "Home Appliances": "fa-solid fa-blender"
        }
    },
    {
        name: "Beauty",
        emoji: "💄",
        icon: "fa-solid fa-wand-magic-sparkles",
        image: "https://images.unsplash.com/photo-1522335789201-a21f1da22315?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Skincare",
            "Makeup & Cosmetics",
            "Haircare",
            "Fragrances",
            "Personal Care & Grooming",
            "Bath & Body",
            "Beauty Tools & Accessories",
            "Men's Grooming"
        ],
        subcategoryIcons: {
            "Skincare": "fa-solid fa-spa",
            "Makeup & Cosmetics": "fa-solid fa-palette",
            "Haircare": "fa-solid fa-scissors",
            "Fragrances": "fa-solid fa-spray-can-sparkles",
            "Personal Care & Grooming": "fa-solid fa-soap",
            "Bath & Body": "fa-solid fa-bath",
            "Beauty Tools & Accessories": "fa-solid fa-brush",
            "Men's Grooming": "fa-solid fa-user"
        }
    },
    {
        name: "Sports",
        emoji: "⚽",
        icon: "fa-solid fa-futbol",
        image: "https://images.unsplash.com/photo-1461896756970-f49c121d73ef?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Fitness Equipment",
            "Sportswear & Activewear",
            "Outdoor & Camping",
            "Cycling",
            "Yoga & Pilates",
            "Team Sports",
            "Running & Athletics",
            "Sports Accessories"
        ],
        subcategoryIcons: {
            "Fitness Equipment": "fa-solid fa-dumbbell",
            "Sportswear & Activewear": "fa-solid fa-person-running",
            "Outdoor & Camping": "fa-solid fa-campground",
            "Cycling": "fa-solid fa-bicycle",
            "Yoga & Pilates": "fa-solid fa-person-praying",
            "Team Sports": "fa-solid fa-basketball",
            "Running & Athletics": "fa-solid fa-stopwatch-20",
            "Sports Accessories": "fa-solid fa-medal"
        }
    },
    {
        name: "Books",
        emoji: "📚",
        icon: "fa-solid fa-book",
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
        subcategories: [
            "Fiction",
            "Non-Fiction",
            "Children's Books",
            "Comics & Graphic Novels",
            "Educational & Textbooks",
            "Self-Help & Business",
            "Magazines",
            "E-Books & Audiobooks"
        ],
        subcategoryIcons: {
            "Fiction": "fa-solid fa-book-open",
            "Non-Fiction": "fa-solid fa-earth-americas",
            "Children's Books": "fa-solid fa-child-reaching",
            "Comics & Graphic Novels": "fa-solid fa-mask",
            "Educational & Textbooks": "fa-solid fa-graduation-cap",
            "Self-Help & Business": "fa-solid fa-briefcase",
            "Magazines": "fa-solid fa-newspaper",
            "E-Books & Audiobooks": "fa-solid fa-tablet-screen-button"
        }
    }
];

export const getSubcategories = (mainCategory) => {
    const category = MAIN_CATEGORIES.find(c => c.name === mainCategory);
    return category ? category.subcategories : [];
};

export const isValidCategory = (category) => {
    return MAIN_CATEGORIES.some(c => c.name === category);
};

export const isValidSubcategory = (mainCategory, subcategory) => {
    const category = MAIN_CATEGORIES.find(c => c.name === mainCategory);
    return category ? category.subcategories.includes(subcategory) : false;
};

// Get all categories as a simple array
export const getAllCategories = () => {
    return MAIN_CATEGORIES.map(c => c.name);
};

// Get category by name
export const getCategoryByName = (name) => {
    return MAIN_CATEGORIES.find(c => c.name === name);
};
