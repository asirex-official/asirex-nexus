-- Drop and recreate app_role enum with department-based roles
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'developer', 'employee', 'core_member', 'user');

-- Recreate user_roles table with new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  department text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is any type of admin
CREATE OR REPLACE FUNCTION public.is_admin_type(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- Function to check if user is staff (admin, manager, employee, developer, core_member)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'manager', 'developer', 'employee', 'core_member')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage lower roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin') AND role NOT IN ('super_admin', 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Update all existing tables to use new role function
DROP POLICY IF EXISTS "Admins can manage company info" ON public.company_info;
CREATE POLICY "Staff can manage company info"
ON public.company_info FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Staff can manage contact messages"
ON public.contact_messages FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Staff can manage events"
ON public.events FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Staff can manage all orders"
ON public.orders FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Staff can manage products"
ON public.products FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Staff can manage projects"
ON public.projects FOR ALL
USING (public.is_admin_type(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Super admins can manage site settings"
ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Admins can manage site stats" ON public.site_stats;
CREATE POLICY "Staff can manage site stats"
ON public.site_stats FOR ALL
USING (public.is_admin_type(auth.uid()));