// Updated categories and subcategories structure
export const MAIN_CATEGORIES = [
    {
        name: "Electronics",
        emoji: "📱",
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
        ]
    },
    {
        name: "Fashion",
        emoji: "👕",
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
        ]
    },
    {
        name: "Home & Living",
        emoji: "🏠",
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
        ]
    },
    {
        name: "Beauty",

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
        ]
    },
    {
        name: "Sports",
        emoji: "⚽",
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
        ]
    },
    {
        name: "Books",
        emoji: "📚",
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
        ]
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
