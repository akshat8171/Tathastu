'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard, ProductCardProps } from '@/components/products/product-card'
import './products.css'

// Category mapping - matches the categories from category-icons.tsx
const categoryMap: Record<string, { name: string; description: string }> = {
  lamps: {
    name: 'Lamps',
    description: 'Illuminate your space with our handcrafted lamp collection.',
  },
  organizers: {
    name: 'Organizers',
    description: 'Keep your space tidy with our elegant organizers.',
  },
  planters: {
    name: 'Planters',
    description: 'Bring nature indoors with our beautiful planters.',
  },
  keychains: {
    name: 'Keychains',
    description: 'Add style to your keys with our unique keychains.',
  },
  'customized-signs': {
    name: 'Customized Signs',
    description: 'Personalize your space with custom signs.',
  },
  'customized-miniatures': {
    name: 'Customized Miniatures',
    description: 'Collectible miniatures crafted just for you.',
  },
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  // Get category info or default to "Best Sellers"
  const categoryInfo = categoryParam && categoryMap[categoryParam]
    ? categoryMap[categoryParam]
    : { name: 'Best Sellers', description: 'Popular enough to brag about, subtle enough to use daily.' }

  const [products, setProducts] = useState<ProductCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    availability: true,
    price: true,
  })

  const [priceRange, setPriceRange] = useState({ min: 0, max: 3299.00 })
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(3)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Fetch products dynamically from API
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const categoryQuery = categoryParam ? `?category=${categoryParam}` : ''
        const response = await fetch(`/api/products${categoryQuery}`)
        const data = await response.json()
        
        if (data.products) {
          setProducts(data.products)
          // Update price range based on products
          if (data.products.length > 0) {
            const prices = data.products.map((p: ProductCardProps) => p.originalPrice || p.price)
            const maxPrice = Math.max(...prices)
            const roundedMax = Math.ceil(maxPrice / 100) * 100
            setPriceRange(prev => ({ ...prev, max: roundedMax }))
          } else {
            // Reset to default if no products
            setPriceRange({ min: 0, max: 3299.00 })
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryParam])

  const toggleFilter = (filter: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setPriceRange((prev) => {
      const maxLimit = prev.max || 3299
      const newValue = Math.max(0, Math.min(maxLimit, value))
      if (type === 'min') {
        return {
          ...prev,
          min: Math.min(newValue, prev.max),
        }
      } else {
        return {
          ...prev,
          max: Math.max(newValue, prev.min),
        }
      }
    })
  }

  return (
    <main className="main-content" id="MainContent" role="main">
      {/* Best Sellers Header Section */}
      <div className="index-section-custom" style={{ background: '#ffffff', padding: '30px 0px 10px 0px', margin: '0px' }}>
        <div className="container">
          <div className="section-block">
            <div className="row justify-content-center">
              <div className="col-lg-7 col-12">
                <h3 className="section-title-1 text-center mb-3">
                  {categoryInfo.name.toUpperCase()}
                </h3>
                <div className="rte text-center txt-body-70">
                  <p className="my-0">{categoryInfo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="main-collection section-template--product-grid-padding container collection-vertical" style={{ backgroundColor: '#ffffff' }}>
        <div className="facets-vertical row">
          {/* Filters Sidebar */}
          <aside aria-labelledby="verticalTitle" className="facets-wrapper col-md-3 v-col" id="main-collection-filters">
            <div className="facets-container pt-0 js-stick-parent">
              <div className="facets small-hide">
                <form id="FacetFiltersForm" className="facets__form-vertical">
                  <div id="FacetsWrapperDesktop">
                    <div className="active-facets active-facets-desktop">
                      <div className="active-facets-vertical-filter">
                        <h3 className="facets__heading facets__heading--vertical caption-large text-body" id="verticalTitle" tabIndex={-1}>
                          FILTER:
                        </h3>
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="facets__display">
                      <div className="facets__header">
                        <button
                          type="button"
                          className="facets__summary"
                          onClick={() => toggleFilter('availability')}
                          aria-expanded={expandedFilters.availability}
                        >
                          <span className="facets__summary-inner">
                            <span className="facets__summary-text">AVAILABILITY</span>
                            <span className="facets__display-icon">
                              <svg
                                className={`icon icon-arrow ${expandedFilters.availability ? 'icon-arrow-up' : 'icon-arrow-down'}`}
                                aria-hidden="true"
                                focusable="false"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 10 6"
                              >
                                <path fillRule="evenodd" d="m9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708z" />
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>
                      {expandedFilters.availability && (
                        <div className="facets__display-list">
                          <div className="facets__item">
                            <label className="facet-checkbox">
                              <input
                                type="checkbox"
                                className="facet-checkbox__input"
                                name="availability"
                                value="in-stock"
                              />
                              <span className="facet-checkbox__label">
                                In stock (30)
                              </span>
                            </label>
                          </div>
                          <div className="facets__item">
                            <label className="facet-checkbox">
                              <input
                                type="checkbox"
                                className="facet-checkbox__input"
                                name="availability"
                                value="out-of-stock"
                              />
                              <span className="facet-checkbox__label">
                                Out of stock (1)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Filter */}
                    <div className="facets__display">
                      <div className="facets__header">
                        <button
                          type="button"
                          className="facets__summary"
                          onClick={() => toggleFilter('price')}
                          aria-expanded={expandedFilters.price}
                        >
                          <span className="facets__summary-inner">
                            <span className="facets__summary-text">PRICE</span>
                            <span className="facets__display-icon">
                              <svg
                                className={`icon icon-arrow ${expandedFilters.price ? 'icon-arrow-up' : 'icon-arrow-down'}`}
                                aria-hidden="true"
                                focusable="false"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 10 6"
                              >
                                <path fillRule="evenodd" d="m9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708z" />
                              </svg>
                            </span>
                          </span>
                        </button>
                      </div>
                      {expandedFilters.price && (
                        <div className="facets__display-list">
                          <div className="price-range-wrapper">
                            <div className="price-range-slider">
                              <input
                                type="range"
                                min="0"
                                max={priceRange.max}
                                value={priceRange.min}
                                onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                                className="price-range-input price-range-input--min"
                              />
                              <input
                                type="range"
                                min="0"
                                max={priceRange.max}
                                value={priceRange.max}
                                onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                                className="price-range-input price-range-input--max"
                              />
                              <div className="price-range-track">
                                <div
                                  className="price-range-fill"
                                  style={{
                                    left: `${(priceRange.min / priceRange.max) * 100}%`,
                                    width: `${((priceRange.max - priceRange.min) / priceRange.max) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="price-range-inputs">
                              <div className="price-input-wrapper">
                                <span className="price-input-currency">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={priceRange.max}
                                  step="0.01"
                                  value={priceRange.min === 0 ? '0' : priceRange.min.toFixed(2)}
                                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                                  className="price-input"
                                />
                              </div>
                              <div className="price-input-wrapper">
                                <span className="price-input-currency">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={priceRange.max}
                                  step="0.01"
                                  value={priceRange.max.toFixed(2)}
                                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                                  className="price-input"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </aside>

          {/* Product Grid Container */}
          <div id="ProductGridContainer" className="col-md-9 pl-lg-5">
            {/* Mobile Filter/Sort Button */}
            <div className="mobile-filter-sort-button-wrapper">
              <button
                type="button"
                className="mobile-filter-sort-btn"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open filters and sort"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5H17.5M5 10H15M7.5 15H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Filter & Sort</span>
              </button>
              <div className="mobile-product-count">
                {loading ? '...' : products.length} Products
              </div>
            </div>

            {/* Grid View Controls - Desktop Only */}
            <div className="product-grid-controls desktop-only">
              <div className="grid-view-buttons">
                <button
                  type="button"
                  className={`grid-view-btn ${gridColumns === 2 ? 'active' : ''}`}
                  onClick={() => setGridColumns(2)}
                  aria-label="2 columns"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="9" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`grid-view-btn ${gridColumns === 3 ? 'active' : ''}`}
                  onClick={() => setGridColumns(3)}
                  aria-label="3 columns"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="1" width="4" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="6" y="1" width="4" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="11.5" y="1" width="4" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`grid-view-btn ${gridColumns === 4 ? 'active' : ''}`}
                  onClick={() => setGridColumns(4)}
                  aria-label="4 columns"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="1" width="3" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="4.5" y="1" width="3" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="8.5" y="1" width="3" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="12.5" y="1" width="3" height="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
              <div className="product-grid-header-right">
                <div className="sort-by-wrapper">
                  <label htmlFor="sort-by" className="sort-by-label">Sort by:</label>
                  <select id="sort-by" className="sort-by-select">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
                <div className="product-count">
                  {loading ? '...' : products.length} Products
                </div>
              </div>
            </div>

            <div className="collection pt-4">
              <div className={`loading-overlay gradient ${loading ? '' : 'hidden'}`}></div>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : products.length > 0 ? (
                <ul
                  id="product-grid"
                  data-id="template--25165094551837__product-grid"
                  className={`product-grid-new product-grid-${gridColumns}-col mobile-grid-2-col`}
                >
                  {products.map((product) => (
                    <li key={product.id} className="product-grid-item">
                      <div className="product-grid-item-inner">
                        <ProductCard {...product} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p>No products found for this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="mobile-sidebar-overlay show"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h3 className="mobile-sidebar-title">Filter & Sort</h3>
          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close filters"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="mobile-sidebar-content">
          {/* Sort Options in Mobile Sidebar */}
          <div className="mobile-sidebar-section">
            <h4 className="mobile-sidebar-section-title">Sort by</h4>
            <div className="sort-by-wrapper mobile-sort-wrapper">
              <select id="sort-by-mobile" className="sort-by-select mobile-sort-select">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Filters in Mobile Sidebar */}
          <div className="mobile-sidebar-section">
            <h4 className="mobile-sidebar-section-title">FILTER:</h4>
            
            {/* Availability Filter */}
            <div className="facets__display">
              <div className="facets__header">
                <button
                  type="button"
                  className="facets__summary"
                  onClick={() => toggleFilter('availability')}
                  aria-expanded={expandedFilters.availability}
                >
                  <span className="facets__summary-inner">
                    <span className="facets__summary-text">AVAILABILITY</span>
                    <span className="facets__display-icon">
                      <svg
                        className={`icon icon-arrow ${expandedFilters.availability ? 'icon-arrow-up' : 'icon-arrow-down'}`}
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 6"
                      >
                        <path fillRule="evenodd" d="m9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
              {expandedFilters.availability && (
                <div className="facets__display-list">
                  <div className="facets__item">
                    <label className="facet-checkbox">
                      <input
                        type="checkbox"
                        className="facet-checkbox__input"
                        name="availability"
                        value="in-stock"
                      />
                      <span className="facet-checkbox__label">
                        In stock (30)
                      </span>
                    </label>
                  </div>
                  <div className="facets__item">
                    <label className="facet-checkbox">
                      <input
                        type="checkbox"
                        className="facet-checkbox__input"
                        name="availability"
                        value="out-of-stock"
                      />
                      <span className="facet-checkbox__label">
                        Out of stock (1)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="facets__display">
              <div className="facets__header">
                <button
                  type="button"
                  className="facets__summary"
                  onClick={() => toggleFilter('price')}
                  aria-expanded={expandedFilters.price}
                >
                  <span className="facets__summary-inner">
                    <span className="facets__summary-text">PRICE</span>
                    <span className="facets__display-icon">
                      <svg
                        className={`icon icon-arrow ${expandedFilters.price ? 'icon-arrow-up' : 'icon-arrow-down'}`}
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 6"
                      >
                        <path fillRule="evenodd" d="m9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708z" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
              {expandedFilters.price && (
                <div className="facets__display-list">
                  <div className="price-range-wrapper">
                    <div className="price-range-slider">
                      <input
                        type="range"
                        min="0"
                        max={priceRange.max}
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                        className="price-range-input price-range-input--min"
                      />
                      <input
                        type="range"
                        min="0"
                        max={priceRange.max}
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                        className="price-range-input price-range-input--max"
                      />
                      <div className="price-range-track">
                        <div
                          className="price-range-fill"
                          style={{
                            left: `${(priceRange.min / priceRange.max) * 100}%`,
                            width: `${((priceRange.max - priceRange.min) / priceRange.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="price-range-inputs">
                      <div className="price-input-wrapper">
                        <span className="price-input-currency">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={priceRange.max}
                          step="0.01"
                          value={priceRange.min === 0 ? '0' : priceRange.min.toFixed(2)}
                          onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                          className="price-input"
                        />
                      </div>
                      <div className="price-input-wrapper">
                        <span className="price-input-currency">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={priceRange.max}
                          step="0.01"
                          value={priceRange.max.toFixed(2)}
                          onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                          className="price-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mobile-sidebar-footer">
          <button
            type="button"
            className="mobile-sidebar-apply-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
