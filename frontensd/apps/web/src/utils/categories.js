export const MAIN_CATEGORIES = [
    {
        name: "Electronics",
        emoji: "📱",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Smartphones", "Laptops", "Audio", "Cameras", "Accessories"]
    },
    {
        name: "Fashion",
        emoji: "👕",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Men's Wear", "Women's Wear", "Kids", "Watches", "Accessories"]
    },
    {
        name: "Home & Living",
        emoji: "🏠",
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Furniture", "Kitchen", "Decor", "Appliances", "Bedding"]
    },
    {
        name: "Beauty",
        emoji: "💄",
        image: "https://images.unsplash.com/photo-1522335789201-a21f1da22315?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Makeup", "Skincare", "Haircare", "Fragrance", "Bath & Body"]
    },
    {
        name: "Sports",
        emoji: "⚽",
        image: "https://images.unsplash.com/photo-1461896756970-f49c121d73ef?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Fitness", "Outdoor", "Team Sports", "Footwear", "Gym Gear"]
    },
    {
        name: "Books",
        emoji: "📚",
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
        subcategories: ["Fiction", "Non-Fiction", "Self-Help", "Children", "Academic"]
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
