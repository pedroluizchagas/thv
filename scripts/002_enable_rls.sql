-- Habilitar Row Level Security em todas as tabelas

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_auth_admin" ON public.profiles;
CREATE POLICY "profiles_insert_auth_admin" ON public.profiles FOR INSERT TO service_role WITH CHECK (true);

-- Policies para categories (leitura pública, escrita autenticada)
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_auth" ON public.categories;
DROP POLICY IF EXISTS "categories_update_auth" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_auth" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_insert_auth" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories_update_auth" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "categories_delete_auth" ON public.categories FOR DELETE TO authenticated USING (true);
-- Permite leitura anônima para a landing page
DROP POLICY IF EXISTS "categories_select_anon" ON public.categories;
CREATE POLICY "categories_select_anon" ON public.categories FOR SELECT TO anon USING (true);

-- Policies para products (leitura pública para landing page)
DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_insert_auth" ON public.products;
DROP POLICY IF EXISTS "products_update_auth" ON public.products;
DROP POLICY IF EXISTS "products_delete_auth" ON public.products;
DROP POLICY IF EXISTS "products_select_anon" ON public.products;
CREATE POLICY "products_select_all" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert_auth" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_update_auth" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "products_delete_auth" ON public.products FOR DELETE TO authenticated USING (true);
CREATE POLICY "products_select_anon" ON public.products FOR SELECT TO anon USING (is_active = true);

-- Policies para customers
DROP POLICY IF EXISTS "customers_select_auth" ON public.customers;
DROP POLICY IF EXISTS "customers_insert_auth" ON public.customers;
DROP POLICY IF EXISTS "customers_update_auth" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_auth" ON public.customers;
CREATE POLICY "customers_select_auth" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_insert_auth" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update_auth" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "customers_delete_auth" ON public.customers FOR DELETE TO authenticated USING (true);

-- Policies para suppliers
DROP POLICY IF EXISTS "suppliers_select_auth" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_insert_auth" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_update_auth" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_delete_auth" ON public.suppliers;
CREATE POLICY "suppliers_select_auth" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "suppliers_insert_auth" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "suppliers_update_auth" ON public.suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "suppliers_delete_auth" ON public.suppliers FOR DELETE TO authenticated USING (true);

-- Policies para quote_requests (inserção pública para landing page)
DROP POLICY IF EXISTS "quote_requests_select_auth" ON public.quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_anon" ON public.quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_auth" ON public.quote_requests;
DROP POLICY IF EXISTS "quote_requests_update_auth" ON public.quote_requests;
DROP POLICY IF EXISTS "quote_requests_delete_auth" ON public.quote_requests;
CREATE POLICY "quote_requests_select_auth" ON public.quote_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_requests_insert_anon" ON public.quote_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "quote_requests_insert_auth" ON public.quote_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_requests_update_auth" ON public.quote_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_requests_delete_auth" ON public.quote_requests FOR DELETE TO authenticated USING (true);

-- Policies para sales
DROP POLICY IF EXISTS "sales_select_auth" ON public.sales;
DROP POLICY IF EXISTS "sales_insert_auth" ON public.sales;
DROP POLICY IF EXISTS "sales_update_auth" ON public.sales;
CREATE POLICY "sales_select_auth" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_insert_auth" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sales_update_auth" ON public.sales FOR UPDATE TO authenticated USING (true);

-- Policies para sale_items
DROP POLICY IF EXISTS "sale_items_select_auth" ON public.sale_items;
DROP POLICY IF EXISTS "sale_items_insert_auth" ON public.sale_items;
CREATE POLICY "sale_items_select_auth" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "sale_items_insert_auth" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- Policies para purchases
DROP POLICY IF EXISTS "purchases_select_auth" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_auth" ON public.purchases;
DROP POLICY IF EXISTS "purchases_update_auth" ON public.purchases;
CREATE POLICY "purchases_select_auth" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "purchases_insert_auth" ON public.purchases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "purchases_update_auth" ON public.purchases FOR UPDATE TO authenticated USING (true);

-- Policies para purchase_items
DROP POLICY IF EXISTS "purchase_items_select_auth" ON public.purchase_items;
DROP POLICY IF EXISTS "purchase_items_insert_auth" ON public.purchase_items;
CREATE POLICY "purchase_items_select_auth" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "purchase_items_insert_auth" ON public.purchase_items FOR INSERT TO authenticated WITH CHECK (true);

-- Policies para financial_transactions
DROP POLICY IF EXISTS "financial_select_auth" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_insert_auth" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_update_auth" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_delete_auth" ON public.financial_transactions;
CREATE POLICY "financial_select_auth" ON public.financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "financial_insert_auth" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "financial_update_auth" ON public.financial_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "financial_delete_auth" ON public.financial_transactions FOR DELETE TO authenticated USING (true);

-- Policies para stock_movements
DROP POLICY IF EXISTS "stock_movements_select_auth" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert_auth" ON public.stock_movements;
CREATE POLICY "stock_movements_select_auth" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_movements_insert_auth" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (true);
