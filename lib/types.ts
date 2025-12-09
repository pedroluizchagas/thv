export interface Profile {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  code: string
  name: string
  description: string | null
  category_id: string | null
  category?: Category
  cost_price: number
  sale_price: number
  stock_quantity: number
  min_stock: number
  unit: string
  brand: string | null
  application: string | null
  photo1_url?: string | null
  photo2_url?: string | null
  photo3_url?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
  address: string | null
  city: string | null
  state: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
  address: string | null
  city: string | null
  state: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface QuoteRequest {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  product_id: string | null
  product_name: string | null
  product?: Product
  status: "pending" | "contacted" | "quoted" | "converted" | "cancelled"
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  sale_number: number
  customer_id: string | null
  customer?: Customer
  user_id: string
  subtotal: number
  discount: number
  total: number
  payment_method: "cash" | "credit" | "debit" | "pix" | "transfer" | "boleto"
  status: "pending" | "completed" | "cancelled"
  notes: string | null
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Purchase {
  id: string
  purchase_number: number
  supplier_id: string | null
  supplier?: Supplier
  user_id: string
  subtotal: number
  total: number
  status: "pending" | "completed" | "cancelled"
  notes: string | null
  invoice_number: string | null
  created_at: string
  items?: PurchaseItem[]
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface FinancialTransaction {
  id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  payment_method: string | null
  reference_type: "sale" | "purchase" | "manual" | null
  reference_id: string | null
  user_id: string | null
  transaction_date: string
  created_at: string
}

export interface StockMovement {
  id: string
  product_id: string
  product?: Product
  type: "in" | "out" | "adjustment"
  quantity: number
  reference_type: "sale" | "purchase" | "adjustment" | null
  reference_id: string | null
  notes: string | null
  user_id: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
