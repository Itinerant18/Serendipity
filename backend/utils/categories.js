const MAIN_CATEGORIES = [
    {
        name: "Computers",
        subcategories: ["Laptops", "Desktops", "Monitors", "Accessories"]
    },
    {
        name: "Electronics",
        subcategories: ["Smartphones", "Tablets", "Cameras", "Audio"]
    },
    {
        name: "Home & Garden",
        subcategories: ["Furniture", "Kitchen", "Decor", "Appliances"]
    },
    {
        name: "Fashion",
        subcategories: ["Men", "Women", "Kids", "Accessories"]
    },
    {
        name: "Sports",
        subcategories: ["Fitness", "Outdoor", "Team Sports", "Footwear"]
    },
    {
        name: "Beauty",
        subcategories: ["Makeup", "Skincare", "Haircare", "Fragrance"]
    }
];

const getSubcategories = (mainCategory) => {
    const category = MAIN_CATEGORIES.find(c => c.name === mainCategory);
    return category ? category.subcategories : [];
};

const isValidCategory = (category) => {
    return MAIN_CATEGORIES.some(c => c.name === category);
};

const isValidSubcategory = (mainCategory, subcategory) => {
    const category = MAIN_CATEGORIES.find(c => c.name === mainCategory);
    return category ? category.subcategories.includes(subcategory) : false;
};

module.exports = {
    MAIN_CATEGORIES,
    getSubcategories,
    isValidCategory,
    isValidSubcategory
};
