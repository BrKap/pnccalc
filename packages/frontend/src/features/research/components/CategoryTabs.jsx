import React from 'react';
export default function CategoryTabs({
  categories,
  selectedCategoryId,
  enabledCategories,
  onSelectCategory,
  onToggleCategory,
}) {
  return (
    <section className="category-strip" aria-label="Research categories">
      {categories.map((category) => (
        <div
          key={category.id}
          className={`category-tab ${category.id === selectedCategoryId ? 'active' : ''}`}
        >
          <input
            type="checkbox"
            checked={enabledCategories[category.id] !== false}
            onChange={() => onToggleCategory(category.id)}
            aria-label={`Include ${category.name} in overall total`}
          />
          <button type="button" onClick={() => onSelectCategory(category.id)}>
            {category.name}
          </button>
        </div>
      ))}
    </section>
  );
}
