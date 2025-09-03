import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Star, 
  Filter,
  Search,
  Tag,
  Heart,
  Truck,
  Shield,
  Clock,
  Target
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  features: string[];
  ecsImpact: {
    absorption?: number;
    antioxidant?: number;
    neuro?: number;
    gut?: number;
    sleep?: number;
  };
  image: string;
  inStock: boolean;
  subscriptionDiscount?: number;
}

const ShopPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'omega3', name: 'Omega-3 & Fatty Acids' },
    { id: 'minerals', name: 'Minerals & Electrolytes' },
    { id: 'adaptogens', name: 'Adaptogens & Herbs' },
    { id: 'mushrooms', name: 'Functional Mushrooms' },
    { id: 'mct', name: 'MCT & Absorption' },
    { id: 'antioxidants', name: 'Antioxidants & Detox' },
    { id: 'sleep', name: 'Sleep Support' },
    { id: 'probiotics', name: 'Gut Health' }
  ];

  const products: Product[] = [
    {
      id: 'omega3-kn',
      name: 'Omega-3 Fish Oil',
      brand: 'Nordic Naturals',
      price: 24.95,
      originalPrice: 29.95,
      rating: 4.8,
      reviews: 2847,
      category: 'omega3',
      description: 'High-potency EPA/DHA fish oil for ECS membrane health and cannabinoid absorption.',
      features: ['1000mg EPA/DHA per serving', 'Third-party tested', 'Sustainable sourcing', 'Lemon flavor'],
      ecsImpact: { absorption: 25, neuro: 15 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 15
    },
    {
      id: 'magnesium-glycinate',
      name: 'Magnesium Glycinate',
      brand: 'Thorne',
      price: 19.95,
      rating: 4.9,
      reviews: 1523,
      category: 'minerals',
      description: 'Highly absorbable magnesium for GABA and cannabinoid receptor function support.',
      features: ['200mg elemental magnesium', 'Chelated for absorption', 'No laxative effect', 'Sleep support'],
      ecsImpact: { neuro: 20, sleep: 25 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 10
    },
    {
      id: 'ashwagandha-ksm66',
      name: 'Ashwagandha KSM-66',
      brand: 'Jarrow Formulas',
      price: 22.50,
      originalPrice: 26.99,
      rating: 4.7,
      reviews: 892,
      category: 'adaptogens',
      description: 'Clinically studied adaptogen for stress reduction and cortisol regulation.',
      features: ['600mg KSM-66 extract', 'Clinically studied', 'Standardized withanolides', 'Mood support'],
      ecsImpact: { neuro: 25, antioxidant: 15 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 12
    },
    {
      id: 'mushroom-complex',
      name: 'Mushroom Immune Booster',
      brand: 'Host Defense',
      price: 35.95,
      rating: 4.6,
      reviews: 654,
      category: 'mushrooms',
      description: 'Comprehensive mushroom blend with Lion\'s Mane, Cordyceps, Reishi, and Chaga.',
      features: ['Organic mushroom blend', 'Dual-extracted', 'Immune support', 'Cognitive enhancement'],
      ecsImpact: { neuro: 20, antioxidant: 20 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 20
    },
    {
      id: 'mct-oil-caps',
      name: 'MCT Oil Capsules',
      brand: 'Sports Research',
      price: 18.95,
      rating: 4.5,
      reviews: 1234,
      category: 'mct',
      description: 'C8/C10 MCT oil in convenient capsules for enhanced cannabinoid absorption.',
      features: ['1000mg per capsule', 'C8/C10 blend', 'Keto-friendly', 'Easy to take'],
      ecsImpact: { absorption: 35 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 15
    },
    {
      id: 'nac-600mg',
      name: 'NAC (N-Acetyl Cysteine)',
      brand: 'NOW Foods',
      price: 16.99,
      rating: 4.7,
      reviews: 987,
      category: 'antioxidants',
      description: 'Powerful antioxidant and glutathione precursor for detox support.',
      features: ['600mg per capsule', 'Antioxidant support', 'Respiratory health', 'Liver support'],
      ecsImpact: { antioxidant: 30, neuro: 10 },
      image: '/api/placeholder/300/300',
      inStock: true,
      subscriptionDiscount: 10
    }
  ];

  const calculateECSScore = (ecsImpact: Product['ecsImpact']) => {
    const score = Math.round(
      (ecsImpact.absorption || 0) * 0.4 +
      (ecsImpact.antioxidant || 0) * 0.25 +
      (ecsImpact.neuro || 0) * 0.2 +
      (ecsImpact.gut || 0) * 0.1 +
      (ecsImpact.sleep || 0) * 0.05
    );
    return Math.min(score, 100);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ECS Support Shop</h1>
          <p className="text-gray-600">Evidence-based supplements for optimal Endocannabinoid System function</p>
        </div>
        
        {/* Free Shipping Notice */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <Truck className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Free shipping on orders $75+</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="ecs-score">ECS Impact Score</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-medium text-gray-900">Third-Party Tested</h3>
            <p className="text-sm text-gray-600">All products verified for purity</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow">
          <Clock className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">Subscribe & Save</h3>
            <p className="text-sm text-gray-600">Up to 20% off with subscription</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow">
          <Heart className="h-8 w-8 text-red-600" />
          <div>
            <h3 className="font-medium text-gray-900">ECS Optimized</h3>
            <p className="text-sm text-gray-600">Formulated for cannabinoid support</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const ecsScore = calculateECSScore(product.ecsImpact);
          const discountedPrice = product.subscriptionDiscount 
            ? product.price * (1 - product.subscriptionDiscount / 100)
            : product.price;

          return (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {product.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    <Tag className="h-3 w-3 inline mr-1" />
                    Sale
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  ECS: {ecsScore}
                </div>
              </div>

              <div className="p-4">
                {/* Brand & Name */}
                <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews})</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                {/* ECS Impact */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">ECS Impact</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(product.ecsImpact).map(([key, value]) => (
                      <span 
                        key={key} 
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        {key}: +{value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.subscriptionDiscount && (
                      <p className="text-sm text-green-600">
                        ${discountedPrice.toFixed(2)} with subscription (-{product.subscriptionDiscount}%)
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Subscribe & Save {product.subscriptionDiscount}%
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Bundle CTA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Ready for Complete ECS Support?</h3>
        <p className="text-lg mb-6">
          Get all the supplements you need in our pre-designed stacks - optimized for maximum ECS impact.
        </p>
        <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors mr-4">
          View ECS Stacks
        </button>
        <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-colors">
          Custom Stack Builder
        </button>
      </div>
    </div>
  );
};

export default ShopPage;