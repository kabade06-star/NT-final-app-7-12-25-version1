
import { CentralScript, Lead, Order, Product, User } from "./types";

export const FRANCHISE_PASSWORD = 'NIRMAANFRANCHISE';
export const ADMIN_PASSWORD = 'NIRMAANADMIN';
export const ATTENDANCE_TARGET = { dials: 100, talkTimeMinutes: 120 };
// Updated CITIES list as per specific requirement
export const CITIES = ['All Karnataka', 'Bangalore', 'Mysore', 'Hubli', 'Dharwad', 'Belgaum', 'Mangalore'];
export const LEADS_STATUS_OPTIONS = [
    'Pending', 'Contacted', 'Interested', 'Not Interested', 'Follow-Up',
    'Appointment Scheduled', 'Appointment Conducted', 'Cancelled'
];
export const ORDER_STATUS_OPTIONS = ['Pending', 'Processing', 'Pending from Client', 'Completed', 'Cancelled'];
export const UPI_ID = '8073126541@ptaxis';
export const UPI_QR_MOCK_URL = 'https://picsum.photos/256/256';
export const GST_RATE = 0.18;
export const PARTNER_COMMISSION_RATE = 0.10;

export const INITIAL_CENTRAL_SCRIPTS: CentralScript[] = [
    { 
        id: 1, 
        category: 'General', 
        mainScript: "Hi, my name is [CallerName] from NirmaanTech. We are India's first AI-based platform providing low-cost vendor products and services, including [CategoryList]. What category are you most interested in today?",
        subScripts: [
            { title: "Initial Query", script: "Start by confirming the customer's initial inquiry source and requirement." }
        ],
        assignedRoles: ['T1', 'P1', 'F1']
    },
    { 
        id: 2, 
        category: 'Loans', 
        mainScript: "I see you inquired about our Loan services. We specialize in Personal (up to 5L) and Business loans.",
        subScripts: [
            { title: "Personal Loan Docs", script: "To process a Personal loan, verify documents: PAN, Aadhar, 6 months bank statements." },
            { title: "Business Loan Docs", script: "For Business loans, request 1 year GST returns and business bank statements." },
            { title: "Next Step", script: "If satisfied, schedule a physical/virtual appointment for document collection." }
        ],
        assignedRoles: ['P1', 'T1']
    },
    { 
        id: 3, 
        category: 'Digital Marketing', 
        mainScript: "You showed interest in Digital Marketing solutions (Website, SEO, SMM). Are you looking for brand launch or existing business boost?",
        subScripts: [
            { title: "Website Inquiry", script: "Ask about target pages (e.g., 4-page static vs. 10-page e-commerce)." },
            { title: "Ad Campaign Pitch", script: "Pitch the Meta Ads campaign setup included in the basic package." }
        ],
        assignedRoles: ['T1', 'F1']
    }
];

export const INITIAL_PRODUCTS_DATA: Product[] = [
    { id: 1, sku: "WP-FT-001", priceType: "unit", unitLabel: "sqft", category: "Interior Decor", city: "Bangalore", name: "Feathertouch Designer Wallpaper", mrp: 1500, unitRateMRP: 30, unitRateSelling: 26, unitRateFranchise: 19, sellingPrice: 1300, franchisePrice: 950, shortDescription: "Premium designer wallpaper (21 inches x 33 ft). Price calculated per square foot.", image: "https://picsum.photos/400/250?random=1", galleryImages: [ "https://picsum.photos/800/600?random=11" ], videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", reviews: [{ rating: 5, comment: "Excellent quality and easy to install. Highly recommend!", reviewer: "Priya S.", photoUrl: "", date: "2024-10-01" }], isVisible: true, vendorId: 'V1' },
    { id: 2, sku: "WP-PD-002", priceType: "unit", unitLabel: "sqft", category: "Interior Decor", city: "Bangalore", name: "Pandora Designer Wallpaper", mrp: 1500, unitRateMRP: 35, unitRateSelling: 28, unitRateFranchise: 21, sellingPrice: 1300, franchisePrice: 950, shortDescription: "High-quality wallpaper. Price calculated per square foot.", image: "https://picsum.photos/400/250?random=2", galleryImages: [ "https://picsum.photos/800/600?random=12" ], videoLink: "https://www.youtube.com/watch?v=0kF6j9hO41Y", reviews: [{ rating: 4, comment: "Good value, but delivery took a week.", reviewer: "Rohan M.", photoUrl: "", date: "2024-10-15" }], isVisible: true, vendorId: 'V1' },
    { id: 3, sku: "DM-BPA-003", priceType: "fixed", category: "Digital Marketing", city: "All Karnataka", name: "Basic Package WPA (Web + Ads)", mrp: 10000, sellingPrice: 6000, franchisePrice: 4500, shortDescription: "4-page professional website, social media setup, 8 festival ad banners, 1 Meta Ads campaign setup.", image: "https://picsum.photos/400/250?random=3", galleryImages: [ "https://picsum.photos/800/600?random=13" ], videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", reviews: [{ rating: 5, comment: "Affordable start-up package. Met all expectations!", reviewer: "Kavita A.", photoUrl: "", date: "2025-11-05" }], isVisible: true, vendorId: 'System' },
    { id: 4, sku: "DM-PRO-004", priceType: "percentage", category: "Digital Marketing", city: "All Karnataka", name: "Pro Package WPA (Percentage)", mrp: 24000, sellingPrice: 15000, franchisePrice: 0, sellingPriceThreshold: 12000, franchisePercentAbove: 0.65, franchisePercentBelow: 0.8, shortDescription: "Professional digital marketing package with performance-based pricing.", image: "https://picsum.photos/400/250?random=4", galleryImages: [], videoLink: "", reviews: [{ rating: 3, comment: "SEO results are slow, but telecalling support is great.", reviewer: "Vijay C.", photoUrl: "", date: "2025-09-10" }], isVisible: true, vendorId: 'System' },
    { id: 5, sku: "WP-PD-005", priceType: "fixed", category: "Interior Decor", city: "Bangalore", name: "Luxury Silk Finish Roll", mrp: 5000, sellingPrice: 3500, franchisePrice: 2500, shortDescription: "Exclusive silk-finish roll. Easy maintenance.", image: "https://picsum.photos/400/250?random=5", galleryImages: [], videoLink: "", reviews: [], isVisible: true, vendorId: 'V1' },
    { id: 6, sku: "BI-LP-006", priceType: "fixed", category: "Loans", city: "Chennai", name: "Loan Processing Fee (Business)", mrp: 10000, sellingPrice: 7500, franchisePrice: 5000, shortDescription: "Fee for processing standard SME business loan applications.", image: "https://picsum.photos/400/250?random=6", galleryImages: [], videoLink: "", reviews: [], isVisible: true, vendorId: 'System' },
    { id: 7, sku: "DM-ES-007", priceType: "fixed", category: "Digital Marketing", city: "Pune", name: "E-Commerce Setup Package", mrp: 50000, sellingPrice: 30000, franchisePrice: 20000, shortDescription: "Full 10-page e-commerce store setup using Shopify/WooCommerce.", image: "https://picsum.photos/400/250?random=7", galleryImages: [], videoLink: "", reviews: [], isVisible: true, vendorId: 'System' },
    { id: 8, sku: "WP-TC-008", priceType: "unit", unitLabel: "sqft", category: "Interior Decor", city: "Bangalore", name: "Textured Concrete Wall Finish", unitRateMRP: 80, unitRateSelling: 65, unitRateFranchise: 40, mrp: 4000, sellingPrice: 3250, franchisePrice: 2000, shortDescription: "Modern industrial textured wall finish application.", image: "https://picsum.photos/400/250?random=8", galleryImages: [], videoLink: "", reviews: [], isVisible: true, vendorId: 'V1' },
    { id: 12, sku: "BI-FL-012", priceType: "fixed", category: "Franchise", city: "All Karnataka", name: "NirmaanTech Store Franchise License", mrp: 60000, sellingPrice: 36000, franchisePrice: 27000, shortDescription: "Single page E-commerce setup, product onboarding, full SMM, Paid Ads setup support. Franchise profit margin applies.", image: "https://picsum.photos/400/250?random=9", galleryImages: [], videoLink: "", reviews: [], isVisible: false, vendorId: 'System' }
];

export const MOCK_TELECALLERS_INITIAL: Record<string, User> = {
    'T1': { id: 'T1', name: 'Priya', password: 'T1', role: 'telecaller', phone: '9876543210' },
    'T2': { id: 'T2', name: 'Rohan', password: 'T2', role: 'telecaller', phone: '9876543211' },
    'T3': { id: 'T3', name: 'Supriya', password: 'T3', role: 'telecaller', phone: '9876543212' },
};
export const MOCK_FRANCHISEES_INITIAL: Record<string, User> = {
    'F1': { id: 'F1', name: 'Raju Traders', password: 'F1', city: 'Bangalore', role: 'franchise', phone: '9900112233', plan: 'paid', registrationDate: '2024-01-01' },
    'F2': { id: 'F2', name: 'Shakti Services', password: 'F2', city: 'Mysore', role: 'franchise', phone: '9900112234', plan: 'basic', registrationDate: '2025-11-25' }, // Recent
    'F3': { id: 'F3', name: 'Expired Demo', password: 'F3', city: 'Hubli', role: 'franchise', phone: '9900112235', plan: 'basic', registrationDate: '2023-01-01' }, // Expired
};
export const MOCK_PARTNERS_INITIAL: Record<string, User> = { 
    'P1': { id: 'P1', name: 'Amit', password: 'P1', role: 'partner', phone: '8877665544' },
    'P2': { id: 'P2', name: 'Divya', password: 'P2', role: 'partner', phone: '8877665545' },
};
export const MOCK_VENDORS_INITIAL: Record<string, User> = {
    'V1': { id: 'V1', name: 'Decor World', password: 'V1', city: 'Bangalore', role: 'vendor', phone: '7766554433', plan: 'basic', registrationDate: '2024-01-01' },
    'V2': { id: 'V2', name: 'Tech Solutions', password: 'V2', city: 'Pune', role: 'vendor', phone: '7766554434', plan: 'paid', registrationDate: '2024-01-01' },
};

export const INITIAL_LEADS_DATA: Lead[] = [
    { leadId: 101, telecallerId: 'T1', assignedFranchiseId: 'F1', assignedPartnerId: null, customerName: 'Sumanth B.', customerPhone: '9876543210', productRequirement: 'Loans', source: 'Facebook Ad', currentStatus: 'Interested', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-01', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }, { status: 'Contacted', comments: 'Requested details on SME loans.', callDate: '2025-11-02', callTimeSeconds: 95, nextFollowupDate: '2025-11-05', loggedBy: 'T1' }, { status: 'Interested', comments: 'Shared documents. Follow up for processing fee.', callDate: '2025-11-05', callTimeSeconds: 150, nextFollowupDate: '2025-11-07', loggedBy: 'T1' }, { status: 'Follow-Up', comments: 'Pending document verification.', callDate: '2025-11-07', callTimeSeconds: 70, nextFollowupDate: '2025-11-10', loggedBy: 'T1' }] },
    { leadId: 102, telecallerId: 'T2', assignedFranchiseId: 'F2', assignedPartnerId: null, customerName: 'Kavita R.', customerPhone: '9988776655', productRequirement: 'Digital Marketing', source: 'Website Form', currentStatus: 'Appointment Scheduled', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-01', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }, { status: 'Contacted', comments: 'Needs e-commerce site. Booked demo.', callDate: '2025-11-03', callTimeSeconds: 220, nextFollowupDate: '2025-11-15', loggedBy: 'T2' }, { status: 'Appointment Scheduled', comments: 'Demo confirmed for 15th.', callDate: '2025-11-08', callTimeSeconds: 35, nextFollowupDate: '2025-11-15', loggedBy: 'T2' }] },
    { leadId: 103, telecallerId: 'T1', assignedFranchiseId: null, assignedPartnerId: 'P2', customerName: 'Ganesh M.', customerPhone: '8899001122', productRequirement: 'Interior Decor', source: 'Instagram', currentStatus: 'Not Interested', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-04', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }, { status: 'Not Interested', comments: 'Already hired a local vendor. Cold.', callDate: '2025-11-04', callTimeSeconds: 50, nextFollowupDate: null, loggedBy: 'T1' }] },
    { leadId: 104, telecallerId: 'T2', assignedFranchiseId: null, assignedPartnerId: null, customerName: 'Priya S.', customerPhone: '7766554433', productRequirement: 'Franchise', source: 'Referral', currentStatus: 'Pending', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-10', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }] },
    { leadId: 105, telecallerId: 'T1', assignedFranchiseId: 'F1', assignedPartnerId: null, customerName: 'Ravi V.', customerPhone: '9000111222', productRequirement: 'Loans', source: 'Website Form', currentStatus: 'Appointment Conducted', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-10', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }, { status: 'Interested', comments: 'Sent to F1.', callDate: '2025-11-11', callTimeSeconds: 60, nextFollowupDate: '2025-11-12', loggedBy: 'T1' }, { status: 'Appointment Conducted', comments: 'F1 Visit complete. Waiting for payment.', callDate: '2025-11-12', callTimeSeconds: 120, nextFollowupDate: '2025-11-15', loggedBy: 'F1' }] },
    { leadId: 106, telecallerId: 'T1', assignedFranchiseId: null, assignedPartnerId: null, customerName: 'Deepa K.', customerPhone: '8765432109', productRequirement: 'Digital Marketing', source: 'LinkedIn', currentStatus: 'Pending', contactHistory: [{ status: 'Pending', comments: 'Initial lead entry.', callDate: '2025-11-11', callTimeSeconds: 0, loggedBy: 'System', nextFollowupDate: null }] }
];

export const INITIAL_ORDERS_DATA: Order[] = [
    {
        orderId: 2025001, date: '2025-11-15', status: 'Completed',
        items: [{ name: "Basic Package WPA", price: 6000, quantity: 1, sku: "DM-BPA-003" }],
        totalAmount: 7080, paymentType: 'GST_RAZORPAY', subtotal: 6000,
        clientDetails: { name: 'Pankaj V.', phone: '9900011100', email: 'pankaj@example.com' },
        franchiseDetails: { name: 'Raju Traders', id: 'F1', phone: '9898989898', email: 'raju@nirmaan.com' },
        telecallerDetails: { name: 'Priya', id: 'T1', phone: '7766554433', email: 'priya@nirmaan.com' },
        partnerDetails: { name: 'Amit', id: 'P1', phone: '', email: '' },
        adminComments: 'Order received. Website draft initiated.'
    },
    {
        orderId: 2025002, date: '2025-11-18', status: 'Completed',
        items: [{ name: "Loan Processing Fee", price: 7500, quantity: 1, sku: "BI-LP-006" }],
        totalAmount: 8850, paymentType: 'GST_RAZORPAY', subtotal: 7500,
        clientDetails: { name: 'Ravi V.', phone: '9000111222', email: 'ravi@example.com' },
        franchiseDetails: { name: 'Raju Traders', id: 'F1', phone: '9898989898', email: 'raju@nirmaan.com' },
        telecallerDetails: { name: 'Priya', id: 'T1', phone: '7766554433', email: 'priya@nirmaan.com' },
        partnerDetails: { name: 'Divya', id: 'P2', phone: '', email: '' },
        adminComments: 'Loan documents verified and processed.'
    }
];