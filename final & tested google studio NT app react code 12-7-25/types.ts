
export interface Review {
    rating: number;
    comment: string;
    reviewer: string;
    photoUrl: string;
    date: string;
}

export interface Product {
    id: number;
    sku: string;
    priceType: 'unit' | 'fixed' | 'percentage';
    unitLabel?: string;
    category: string;
    city: string;
    name: string;
    mrp: number;
    unitRateMRP?: number;
    unitRateSelling?: number;
    unitRateFranchise?: number;
    sellingPrice: number;
    franchisePrice: number;
    sellingPriceThreshold?: number;
    franchisePercentAbove?: number;
    franchisePercentBelow?: number;
    shortDescription: string;
    image: string;
    galleryImages: string[];
    videoLink: string;
    reviews: Review[];
    isVisible: boolean;
    vendorId?: string;
}

export interface ContactHistory {
    status: string;
    comments: string;
    callDate: string;
    callTimeSeconds: number;
    nextFollowupDate: string | null;
    loggedBy: string;
}

export interface Lead {
    leadId: number;
    telecallerId: string | null;
    assignedFranchiseId: string | null;
    assignedPartnerId: string | null;
    customerName: string;
    customerPhone: string;
    productRequirement: string;
    source: string;
    currentStatus: string;
    contactHistory: ContactHistory[];
    assignedScriptId?: number; // New field for specific script assignment
}

export interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    sku: string;
}

export interface Order {
    orderId: number;
    date: string;
    status: string;
    items: OrderItem[];
    totalAmount: number;
    paymentType: string;
    subtotal: number;
    clientDetails: { name: string; phone: string; email: string; address?: string };
    franchiseDetails: { name: string; id: string; phone: string; email: string };
    telecallerDetails: { name: string; id: string; phone: string; email: string };
    partnerDetails: { name: string; id: string; phone: string; email: string };
    adminComments: string;
}

export interface User {
    id: string;
    name: string;
    password?: string;
    city?: string;
    email?: string;
    phone?: string;
    role?: 'telecaller' | 'franchise' | 'partner' | 'vendor' | 'admin';
    plan?: 'basic' | 'paid'; // Subscription plan for vendors and franchise
    registrationDate?: string; // Track registration for trial periods
}

export interface SubScript {
    title: string;
    script: string;
}

export interface CentralScript {
    id: number;
    category: string;
    mainScript: string;
    subScripts: SubScript[];
    assignedRoles: string[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Cart {
    [key: number]: CartItem;
}

export interface AttendanceMetrics {
    lastDate: string;
    totalDials: number;
    totalTalkTimeSeconds: number;
    statusCounts: Record<string, number>;
}