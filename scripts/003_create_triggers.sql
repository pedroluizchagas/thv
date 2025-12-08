-- Triggers para automação do sistema

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION public.handle_sale_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Diminui o estoque do produto
  UPDATE public.products 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  -- Registra a movimentação de estoque
  INSERT INTO public.stock_movements (product_id, type, quantity, reference_type, reference_id, user_id)
  SELECT NEW.product_id, 'out', NEW.quantity, 'sale', NEW.sale_id, s.user_id
  FROM public.sales s WHERE s.id = NEW.sale_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sale_item_created ON public.sale_items;
CREATE TRIGGER on_sale_item_created
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock();

-- Função para registrar transação financeira após venda
CREATE OR REPLACE FUNCTION public.handle_sale_financial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO public.financial_transactions (
      type, category, description, amount, payment_method, 
      reference_type, reference_id, user_id, transaction_date
    )
    VALUES (
      'income', 
      'Venda', 
      'Venda #' || NEW.sale_number,
      NEW.total,
      NEW.payment_method,
      'sale',
      NEW.id,
      NEW.user_id,
      CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sale_completed ON public.sales;
CREATE TRIGGER on_sale_completed
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_financial();

-- Função para atualizar estoque após compra
CREATE OR REPLACE FUNCTION public.handle_purchase_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Aumenta o estoque do produto
  UPDATE public.products 
  SET stock_quantity = stock_quantity + NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  -- Registra a movimentação de estoque
  INSERT INTO public.stock_movements (product_id, type, quantity, reference_type, reference_id, user_id)
  SELECT NEW.product_id, 'in', NEW.quantity, 'purchase', NEW.purchase_id, p.user_id
  FROM public.purchases p WHERE p.id = NEW.purchase_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_item_created ON public.purchase_items;
CREATE TRIGGER on_purchase_item_created
  AFTER INSERT ON public.purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_stock();

-- Função para registrar transação financeira após compra
CREATE OR REPLACE FUNCTION public.handle_purchase_financial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO public.financial_transactions (
      type, category, description, amount, payment_method, 
      reference_type, reference_id, user_id, transaction_date
    )
    VALUES (
      'expense', 
      'Compra', 
      'Compra #' || NEW.purchase_number || COALESCE(' - NF: ' || NEW.invoice_number, ''),
      NEW.total,
      'transfer',
      'purchase',
      NEW.id,
      NEW.user_id,
      CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_completed ON public.purchases;
CREATE TRIGGER on_purchase_completed
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_financial();
