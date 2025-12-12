-- Drop the existing restrictive ALL policy
DROP POLICY IF EXISTS "Staff can manage products" ON public.products;

-- Create permissive INSERT policy for admin types
CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin_type(auth.uid()));

-- Create permissive UPDATE policy for admin types  
CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
TO authenticated
USING (is_admin_type(auth.uid()));

-- Create permissive DELETE policy for admin types
CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
TO authenticated
USING (is_admin_type(auth.uid()));