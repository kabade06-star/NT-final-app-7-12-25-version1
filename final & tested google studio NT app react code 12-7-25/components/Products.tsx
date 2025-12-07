
import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, Video, Eye } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    isFranchise: boolean;
    onAdd: () => void;
    onView: () => void;
    cartQty: number;
    isAdmin: boolean;
    onEdit?: (p: Product) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

export const ProductCard: React.FC<ProductCardProps> = ({ product, isFranchise, onAdd, onView, cartQty, isAdmin, onEdit }) => {
    
    // Price Calculation Logic
    const calculatePriceDisplay = (p: Product) => {
        if (p.priceType === 'unit') {
            return {
                displayPrice: isFranchise ? p.unitRateFranchise : p.unitRateSelling,
                mrp: p.unitRateMRP,
                label: `/${p.unitLabel}`,
                isPercentage: false
            };
        } else if (p.priceType === 'percentage') {
            // For percentage, we display the raw percentage value (e.g. 6%)
            return {
                displayPrice: isFranchise ? p.franchisePrice : p.sellingPrice,
                mrp: p.mrp,
                label: '% of Value',
                isPercentage: true
            };
        }
        return {
            displayPrice: isFranchise ? p.franchisePrice : p.sellingPrice,
            mrp: p.mrp,
            label: '',
            isPercentage: false
        };
    };

    const { displayPrice, mrp, label, isPercentage } = calculatePriceDisplay(product);
    const discount = !isPercentage && mrp && displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;
    const avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / (product.reviews.length || 1);

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition-all border border-gray-100 flex flex-col relative group">
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(product); }}
                    className="absolute top-2 right-2 z-10 bg-blue-500 text-white p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <Eye size={16} />
                </button>
            )}
            
            <div className="relative h-40 sm:h-48 overflow-hidden cursor-pointer" onClick={onView}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        {discount}% OFF
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold tracking-wider text-primary uppercase bg-blue-50 px-2 py-0.5 rounded">{product.category}</span>
                    <div className="flex items-center space-x-0.5">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500 font-medium">{avgRating.toFixed(1)}</span>
                    </div>
                </div>

                <h3 className="text-gray-800 font-bold text-base sm:text-lg leading-tight mb-1 line-clamp-2 hover:text-primary cursor-pointer" onClick={onView}>{product.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{product.sku}</p>
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.shortDescription}</p>

                <div className="mt-auto border-t pt-3 flex items-center justify-between">
                    <div>
                        {isFranchise ? (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 line-through">MRP: {isPercentage ? `${mrp}%` : currencyFormatter.format(mrp || 0)}</span>
                                <span className="text-[10px] text-gray-500">Retail: {isPercentage ? `${product.sellingPrice}%` : currencyFormatter.format(isPercentage ? product.sellingPrice : (product.priceType === 'unit' ? product.unitRateSelling : product.sellingPrice) || 0)}</span>
                                <span className="text-red-600 font-extrabold text-lg">
                                    {isPercentage ? `${displayPrice}%` : currencyFormatter.format(displayPrice || 0)}
                                    <span className="text-[10px] font-normal text-gray-500 ml-1">{label}</span>
                                </span>
                            </div>
                        ) : (
                            <>
                                {mrp && <p className="text-xs text-gray-400 line-through">{isPercentage ? `${mrp}%` : currencyFormatter.format(mrp)}</p>}
                                <p className={`font-extrabold text-base sm:text-lg text-green-700`}>
                                    {isPercentage ? `${displayPrice}%` : currencyFormatter.format(displayPrice || 0)}
                                    <span className="text-xs font-normal text-gray-500 ml-1">{label}</span>
                                </p>
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={onAdd}
                        className="bg-gray-900 text-white p-2 sm:px-3 rounded-lg hover:bg-primary transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                    >
                        <ShoppingCart size={16} />
                        {cartQty > 0 ? <span>({cartQty})</span> : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProductDetails: React.FC<{
    product: Product;
    isFranchise: boolean;
    onAdd: (qty: number) => void;
}> = ({ product, isFranchise, onAdd }) => {
    // For Percentage type, qty acts as the Base Value amount
    const [qty, setQty] = React.useState(product.priceType === 'unit' ? 100 : product.priceType === 'percentage' ? 100000 : 1);

    // Calculate dynamic price
    const calculateTotalEstimate = () => {
        if (product.priceType === 'unit') {
            const rate = isFranchise ? (product.unitRateFranchise || 0) : (product.unitRateSelling || 0);
            return rate * qty;
        } else if (product.priceType === 'percentage') {
            const rate = isFranchise ? product.franchisePrice : product.sellingPrice;
            // Rate is percentage (e.g. 6), Qty is Base Value (e.g. 500000)
            return (rate / 100) * qty;
        } else {
            const rate = isFranchise ? product.franchisePrice : product.sellingPrice;
            return rate * qty;
        }
    };

    const grandTotal = calculateTotalEstimate();
    const displayRate = product.priceType === 'percentage' 
        ? (isFranchise ? product.franchisePrice : product.sellingPrice) 
        : (isFranchise ? (product.priceType === 'unit' ? product.unitRateFranchise : product.franchisePrice) : (product.priceType === 'unit' ? product.unitRateSelling : product.sellingPrice));

    const mrpRate = product.priceType === 'unit' ? product.unitRateMRP : product.mrp;

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4">
            <div className="w-full md:w-1/2">
                <img src={product.image} className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-lg bg-gray-100" alt={product.name} />
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    <img src={product.image} className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-primary" />
                    {product.galleryImages.map((img, i) => (
                        <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg cursor-pointer border hover:border-primary" />
                    ))}
                </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
                <div className="mb-3">
                    <span className="text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase tracking-wide">{product.category}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h2>
                <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm text-gray-500">
                    <span>SKU: {product.sku}</span>
                    {product.videoLink && (
                        <a href={product.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <Video size={14} /> Watch Demo
                        </a>
                    )}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{product.shortDescription}</p>

                <div className={`p-4 rounded-xl border-l-4 mb-6 ${isFranchise ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                    <p className="text-xs text-gray-500 mb-1 uppercase font-bold">Price Configuration {isFranchise ? '(Franchise)' : '(Retail)'}</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>MRP</span>
                            <span className="line-through">{product.priceType === 'percentage' ? `${mrpRate}%` : currencyFormatter.format(mrpRate || 0)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-gray-800 font-bold">Your Rate</span>
                            <span className={`text-3xl font-extrabold ${isFranchise ? 'text-red-700' : 'text-green-700'}`}>
                                {product.priceType === 'percentage' ? `${displayRate}%` : currencyFormatter.format(displayRate || 0)}
                                {product.priceType === 'unit' && <span className="text-gray-500 text-sm font-normal">/{product.unitLabel}</span>}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        {product.priceType === 'percentage' ? 'Enter Value (e.g. Loan Amount / Project Value)' : 
                         product.priceType === 'unit' ? `Quantity (${product.unitLabel})` : 'Quantity'}
                    </label>
                    <div className="flex items-center gap-4 mb-4">
                        <input 
                            type="number" 
                            value={qty} 
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-3 border border-gray-300 rounded-lg text-center font-bold text-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    
                    <div className="flex justify-between items-center mb-4 text-sm">
                         <span className="text-gray-500">Total Estimate</span>
                         <span className="font-bold text-lg text-gray-800">{currencyFormatter.format(grandTotal)}</span>
                    </div>

                    <button 
                        onClick={() => onAdd(qty)}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                        <ShoppingCart /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};
