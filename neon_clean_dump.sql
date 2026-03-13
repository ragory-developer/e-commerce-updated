--
-- PostgreSQL database dump
--

-- \restrict qKSfAhIVQpNeOi6LsdsnokcViWViZ3pJxbu1jWctMjx0Yip1UvnzV4qn2muz5Eh

-- Dumped from database version 17.8 (6108b59)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AdminPermission; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminPermission" AS ENUM (
    'MANAGE_USERS',
    'VIEW_USERS',
    'MANAGE_PRODUCTS',
    'VIEW_PRODUCTS',
    'MANAGE_ORDERS',
    'VIEW_ORDERS',
    'MANAGE_PAYMENTS',
    'VIEW_PAYMENTS',
    'VIEW_REPORTS',
    'EXPORT_DATA',
    'MANAGE_SETTINGS',
    'MANAGE_COUPONS',
    'MANAGE_SHIPPING',
    'MANAGE_DELIVERY'
);


--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'MANAGER'
);


--
-- Name: AttributeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AttributeType" AS ENUM (
    'TEXT',
    'NUMBER',
    'SELECT',
    'MULTI_SELECT',
    'COLOR_PICKER',
    'CHECKBOX',
    'DATE_PICKER'
);


--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE'
);


--
-- Name: AuthUserType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuthUserType" AS ENUM (
    'ADMIN',
    'CUSTOMER'
);


--
-- Name: CouponDiscountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CouponDiscountType" AS ENUM (
    'FIXED',
    'PERCENT'
);


--
-- Name: FileStorage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FileStorage" AS ENUM (
    'LOCAL',
    'S3',
    'CLOUDINARY',
    'GCS'
);


--
-- Name: InventoryReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InventoryReason" AS ENUM (
    'ORDER_PLACED',
    'ORDER_CANCELED',
    'ORDER_REFUNDED',
    'MANUAL_ADJUSTMENT',
    'RESTOCK',
    'DAMAGED',
    'RETURNED',
    'RESERVED',
    'RESERVATION_RELEASED'
);


--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'PUSH',
    'WEBHOOK'
);


--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'QUEUED',
    'SENT',
    'DELIVERED',
    'FAILED',
    'BOUNCED'
);


--
-- Name: OptionPriceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OptionPriceType" AS ENUM (
    'FIXED',
    'PERCENT'
);


--
-- Name: OptionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OptionType" AS ENUM (
    'DROPDOWN',
    'CHECKBOX',
    'RADIO',
    'MULTIPLE_SELECT',
    'TEXT',
    'TEXTAREA',
    'DATE',
    'TIME',
    'DATE_TIME',
    'FILE'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'DECLINED',
    'CANCELED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'ON_HOLD',
    'SHIPPED',
    'DELIVERED'
);


--
-- Name: OtpChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpChannel" AS ENUM (
    'EMAIL',
    'SMS'
);


--
-- Name: OtpPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpPurpose" AS ENUM (
    'VERIFY_PHONE',
    'VERIFY_EMAIL',
    'RESET_PASSWORD',
    'LOGIN_OTP',
    'REGISTER_ACCOUNT'
);


--
-- Name: PackageStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PackageStatus" AS ENUM (
    'CREATED',
    'PACKED',
    'ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'RETURNED'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'BKASH',
    'NAGAD',
    'SSLCOMMERZ',
    'COD',
    'BANK_TRANSFER',
    'STRIPE',
    'PAYPAL'
);


--
-- Name: PromotionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromotionType" AS ENUM (
    'CART_DISCOUNT',
    'PRODUCT_DISCOUNT',
    'BUY_X_GET_Y',
    'FREE_SHIPPING',
    'BUNDLE_DISCOUNT',
    'FIRST_ORDER'
);


--
-- Name: PublishStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PublishStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'SCHEDULED'
);


--
-- Name: QueueJobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QueueJobStatus" AS ENUM (
    'QUEUED',
    'ACTIVE',
    'COMPLETED',
    'FAILED',
    'STALLED',
    'DELAYED'
);


--
-- Name: RefundReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundReason" AS ENUM (
    'CUSTOMER_REQUEST',
    'DEFECTIVE_PRODUCT',
    'WRONG_ITEM',
    'ITEM_NOT_RECEIVED',
    'DUPLICATE_ORDER',
    'FRAUD',
    'OTHER'
);


--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REJECTED'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'ACTIVE',
    'CONVERTED',
    'EXPIRED',
    'CANCELED'
);


--
-- Name: ShippingMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ShippingMethod" AS ENUM (
    'FREE_SHIPPING',
    'LOCAL_PICKUP',
    'FLAT_RATE'
);


--
-- Name: ShippingRateType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ShippingRateType" AS ENUM (
    'FLAT',
    'WEIGHT_BASED',
    'PRICE_BASED',
    'ITEM_BASED'
);


--
-- Name: SpecialPriceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SpecialPriceType" AS ENUM (
    'FIXED',
    'PERCENT'
);


--
-- Name: TaxBasedOn; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaxBasedOn" AS ENUM (
    'BILLING_ADDRESS',
    'SHIPPING_ADDRESS',
    'STORE_ADDRESS'
);


--
-- Name: VariationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VariationType" AS ENUM (
    'TEXT',
    'COLOR',
    'IMAGE',
    'DROPDOWN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    label character varying(50),
    address character varying(191) NOT NULL,
    descriptions text NOT NULL,
    city character varying(191) NOT NULL,
    state character varying(191) NOT NULL,
    road character varying(191) NOT NULL,
    zip character varying(20) NOT NULL,
    country character varying(50) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    customer_id text NOT NULL
);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id text NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    avatar text,
    role public."AdminRole" DEFAULT 'ADMIN'::public."AdminRole" NOT NULL,
    permissions public."AdminPermission"[] DEFAULT ARRAY[]::public."AdminPermission"[],
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(3) without time zone,
    last_login_ip character varying(45),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    locked_until timestamp(3) without time zone,
    login_attempts integer DEFAULT 0 NOT NULL
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id text NOT NULL,
    user_id text NOT NULL,
    name character varying(191) NOT NULL,
    key character varying(500) NOT NULL,
    prefix character varying(10) NOT NULL,
    permissions jsonb NOT NULL,
    last_used_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    revoked_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: attribute_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attribute_sets (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: attribute_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attribute_values (
    id text NOT NULL,
    attribute_id text NOT NULL,
    value character varying(191) NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attributes (
    id text NOT NULL,
    attribute_set_id text NOT NULL,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    type public."AttributeType" DEFAULT 'TEXT'::public."AttributeType" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    action public."AuditAction" NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id text NOT NULL,
    changes jsonb,
    ip_address character varying(45),
    user_agent character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "actorType" public."AuthUserType" NOT NULL,
    actor_id text
);


--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_tokens (
    id text NOT NULL,
    admin_id text,
    customer_id text,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    revoked_at timestamp(3) without time zone,
    revoked_reason character varying(100),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    device_id text,
    token_family character varying(191) NOT NULL,
    user_type public."AuthUserType" NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    description text,
    image character varying(500),
    translations jsonb,
    seo jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id text NOT NULL,
    session_id character varying(191),
    data jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    customer_id text
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    parent_id text,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    description text,
    image character varying(191),
    icon character varying(191),
    "position" integer DEFAULT 0 NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    translations jsonb,
    seo jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    path character varying(1000),
    is_active boolean DEFAULT true NOT NULL,
    path_ids character varying(1000)
);


--
-- Name: coupon_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_categories (
    coupon_id text NOT NULL,
    category_id text NOT NULL,
    exclude boolean DEFAULT false NOT NULL
);


--
-- Name: coupon_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_products (
    coupon_id text NOT NULL,
    product_id text NOT NULL,
    exclude boolean DEFAULT false NOT NULL
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    code character varying(50) NOT NULL,
    discount_type public."CouponDiscountType" DEFAULT 'PERCENT'::public."CouponDiscountType" NOT NULL,
    value numeric(18,4),
    free_shipping boolean DEFAULT false NOT NULL,
    minimum_spend numeric(18,4),
    maximum_spend numeric(18,4),
    usage_limit_per_coupon integer,
    usage_limit_per_customer integer,
    used integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: cross_sell_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cross_sell_products (
    product_id text NOT NULL,
    cross_sell_product_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: currency_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.currency_rates (
    id text NOT NULL,
    currency character varying(10) NOT NULL,
    rate numeric(18,4) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    phone character varying(20) NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    password character varying(255),
    avatar text,
    is_guest boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(3) without time zone,
    last_login_ip character varying(45),
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    locked_until timestamp(3) without time zone,
    login_attempts integer DEFAULT 0 NOT NULL
);


--
-- Name: delivery_riders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_riders (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(191),
    is_active boolean DEFAULT true NOT NULL,
    details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.devices (
    id text NOT NULL,
    admin_id text,
    customer_id text,
    user_type public."AuthUserType" NOT NULL,
    device_id character varying(191) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    device_name character varying(191),
    device_type character varying(50),
    ip_address character varying(45),
    is_active boolean DEFAULT true NOT NULL,
    last_active_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at timestamp(3) without time zone,
    user_agent text
);


--
-- Name: entity_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_media (
    id text NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id text NOT NULL,
    media_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    purpose character varying(50),
    is_main boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id text NOT NULL,
    filename character varying(191) NOT NULL,
    disk public."FileStorage" DEFAULT 'LOCAL'::public."FileStorage" NOT NULL,
    path character varying(500) NOT NULL,
    url character varying(500) NOT NULL,
    extension character varying(20) NOT NULL,
    mime character varying(100) NOT NULL,
    size integer NOT NULL,
    alt character varying(191),
    variants jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    uploaded_by text
);


--
-- Name: flash_sale_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flash_sale_products (
    id text NOT NULL,
    flash_sale_id text NOT NULL,
    product_id text NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    price numeric(18,4) NOT NULL,
    qty integer NOT NULL,
    sold integer DEFAULT 0 NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: flash_sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flash_sales (
    id text NOT NULL,
    campaign_name character varying(191) NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_logs (
    id text NOT NULL,
    product_id text NOT NULL,
    product_variant_id text,
    sku character varying(100),
    reason public."InventoryReason" NOT NULL,
    quantity integer NOT NULL,
    stock_before integer NOT NULL,
    stock_after integer NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id text NOT NULL,
    filename character varying(191) NOT NULL,
    original_name character varying(191) NOT NULL,
    "mime_Type" character varying(100) NOT NULL,
    size integer NOT NULL,
    extension character varying(20) NOT NULL,
    storage_driver character varying(20) NOT NULL,
    storage_path character varying(500) NOT NULL,
    storage_url character varying(500) NOT NULL,
    variants jsonb,
    width integer,
    height integer,
    alt character varying(191),
    reference_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text,
    channel public."NotificationChannel" NOT NULL,
    status public."NotificationStatus" DEFAULT 'QUEUED'::public."NotificationStatus" NOT NULL,
    data jsonb NOT NULL,
    sent_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    failed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: option_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_values (
    id text NOT NULL,
    option_id text NOT NULL,
    label character varying(191) NOT NULL,
    price numeric(18,4),
    price_type public."OptionPriceType" DEFAULT 'FIXED'::public."OptionPriceType" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.options (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    type public."OptionType" NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: order_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_packages (
    id text NOT NULL,
    order_id text NOT NULL,
    rider_id text,
    status public."PackageStatus" DEFAULT 'CREATED'::public."PackageStatus" NOT NULL,
    tracking_number character varying(191),
    items jsonb NOT NULL,
    packed_at timestamp(3) without time zone,
    packed_by text,
    assigned_at timestamp(3) without time zone,
    assigned_by text,
    picked_up_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    failed_at timestamp(3) without time zone,
    returned_at timestamp(3) without time zone,
    delivery_details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: order_product_option_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_product_option_values (
    id text NOT NULL,
    order_product_option_id text NOT NULL,
    option_value_id text NOT NULL,
    label character varying(191) NOT NULL,
    price numeric(18,4)
);


--
-- Name: order_product_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_product_options (
    id text NOT NULL,
    order_product_id text NOT NULL,
    option_name character varying(191) NOT NULL,
    value text
);


--
-- Name: order_product_variation_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_product_variation_values (
    order_product_variation_id text NOT NULL,
    variation_value_id text NOT NULL
);


--
-- Name: order_product_variations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_product_variations (
    id text NOT NULL,
    order_product_id text NOT NULL,
    variation_name character varying(191) NOT NULL,
    type public."VariationType" NOT NULL,
    value character varying(191) NOT NULL
);


--
-- Name: order_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_products (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    product_variant_id text,
    product_name character varying(191) NOT NULL,
    product_sku character varying(100),
    product_slug character varying(191) NOT NULL,
    product_image jsonb,
    unit_price numeric(18,4) NOT NULL,
    qty integer NOT NULL,
    line_total numeric(18,4) NOT NULL
);


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id text NOT NULL,
    order_id text NOT NULL,
    from_status public."OrderStatus",
    to_status public."OrderStatus" NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_taxes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_taxes (
    order_id text NOT NULL,
    tax_rate_id text NOT NULL,
    amount numeric(15,4) NOT NULL,
    rate_name character varying(191) NOT NULL,
    rate_value numeric(8,4) NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number integer NOT NULL,
    customer_id text,
    customer_email character varying(191) NOT NULL,
    customer_phone character varying(50),
    customer_first_name character varying(191) NOT NULL,
    customer_last_name character varying(191) NOT NULL,
    billing_address jsonb NOT NULL,
    shipping_address jsonb NOT NULL,
    sub_total numeric(18,4) NOT NULL,
    shipping_cost numeric(18,4) DEFAULT 0 NOT NULL,
    discount numeric(18,4) DEFAULT 0 NOT NULL,
    tax_total numeric(18,4) DEFAULT 0 NOT NULL,
    total numeric(18,4) NOT NULL,
    shipping_method public."ShippingMethod",
    payment_method public."PaymentMethod" NOT NULL,
    tracking_reference text,
    coupon_id text,
    coupon_code character varying(191),
    currency character varying(10) NOT NULL,
    currency_rate numeric(18,4) NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    notes jsonb,
    locale character varying(10) NOT NULL,
    ip_address character varying(45),
    user_agent character varying(500),
    paid_at timestamp(3) without time zone,
    shipped_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    canceled_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: orders_order_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_order_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_order_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_order_number_seq OWNED BY public.orders.order_number;


--
-- Name: price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_history (
    id text NOT NULL,
    product_id text NOT NULL,
    product_variant_id text,
    previous_price numeric(18,4),
    new_price numeric(18,4),
    previous_special_price numeric(18,4),
    new_special_price numeric(18,4),
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_attribute_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attribute_values (
    product_attribute_id text NOT NULL,
    attribute_value_id text NOT NULL
);


--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attributes (
    id text NOT NULL,
    product_id text NOT NULL,
    attribute_id text NOT NULL
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    product_id text NOT NULL,
    category_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_options (
    product_id text NOT NULL,
    option_id text NOT NULL
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tags (
    product_id text NOT NULL,
    tag_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    uid character varying(191) NOT NULL,
    uids text NOT NULL,
    product_id text NOT NULL,
    name character varying(191) NOT NULL,
    sku character varying(100),
    price numeric(18,4),
    special_price numeric(18,4),
    special_price_type public."SpecialPriceType",
    special_price_start timestamp(3) without time zone,
    special_price_end timestamp(3) without time zone,
    manage_stock boolean,
    qty integer,
    in_stock boolean,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    images jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: product_variations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variations (
    product_id text NOT NULL,
    variation_id text NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    brand_id text,
    tax_class_id text,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    description text NOT NULL,
    short_description text,
    sku character varying(100),
    price numeric(18,4),
    special_price numeric(18,4),
    special_price_type public."SpecialPriceType",
    special_price_start timestamp(3) without time zone,
    special_price_end timestamp(3) without time zone,
    manage_stock boolean DEFAULT false NOT NULL,
    qty integer,
    in_stock boolean DEFAULT true NOT NULL,
    weight numeric(10,2),
    dimensions jsonb,
    is_active boolean DEFAULT true NOT NULL,
    viewed integer DEFAULT 0 NOT NULL,
    new_from timestamp(3) without time zone,
    new_to timestamp(3) without time zone,
    images jsonb,
    downloads jsonb,
    translations jsonb,
    seo jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text,
    created_by text,
    updated_by text
);


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    description text,
    type public."PromotionType" NOT NULL,
    is_auto_apply boolean DEFAULT false NOT NULL,
    is_stackable boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    rules jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    start_date timestamp(3) without time zone,
    end_date timestamp(3) without time zone,
    usage_limit integer,
    used integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: queue_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queue_jobs (
    id text NOT NULL,
    queue character varying(100) NOT NULL,
    name character varying(191) NOT NULL,
    status public."QueueJobStatus" DEFAULT 'QUEUED'::public."QueueJobStatus" NOT NULL,
    data jsonb NOT NULL,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    failed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id text NOT NULL,
    order_id text NOT NULL,
    transaction_id text NOT NULL,
    amount numeric(18,4) NOT NULL,
    currency character varying(10) NOT NULL,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    reason public."RefundReason" NOT NULL,
    details jsonb NOT NULL,
    gateway_response jsonb,
    processed_by text,
    processed_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    rejected_at timestamp(3) without time zone,
    rejection_details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: related_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.related_products (
    product_id text NOT NULL,
    related_product_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    reviewer_id text,
    product_id text NOT NULL,
    rating integer NOT NULL,
    reviewer_name character varying(191) NOT NULL,
    title character varying(191),
    comment text NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    admin_reply jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: search_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_terms (
    id text NOT NULL,
    term character varying(191) NOT NULL,
    results integer DEFAULT 0 NOT NULL,
    hits integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key character varying(191) NOT NULL,
    "group" character varying(100),
    value jsonb NOT NULL,
    is_translatable boolean DEFAULT false NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_rates (
    id text NOT NULL,
    shipping_zone_id text NOT NULL,
    name character varying(191) NOT NULL,
    type public."ShippingRateType" DEFAULT 'FLAT'::public."ShippingRateType" NOT NULL,
    cost numeric(18,4) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    conditions jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_zones (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    regions jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: stock_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_reservations (
    id text NOT NULL,
    product_id text NOT NULL,
    product_variant_id text,
    user_id text,
    session_id text,
    qty integer NOT NULL,
    status public."ReservationStatus" DEFAULT 'ACTIVE'::public."ReservationStatus" NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    converted_at timestamp(3) without time zone,
    released_at timestamp(3) without time zone,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    slug character varying(191) NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: tax_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_classes (
    id text NOT NULL,
    name character varying(191) NOT NULL,
    based_on public."TaxBasedOn" DEFAULT 'SHIPPING_ADDRESS'::public."TaxBasedOn" NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rates (
    id text NOT NULL,
    tax_class_id text NOT NULL,
    name character varying(191) NOT NULL,
    country character varying(2) NOT NULL,
    state character varying(191) DEFAULT '*'::character varying NOT NULL,
    city character varying(191) DEFAULT '*'::character varying NOT NULL,
    zip character varying(20) DEFAULT '*'::character varying NOT NULL,
    rate numeric(8,4) NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    order_id text NOT NULL,
    transaction_id character varying(191) NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    amount numeric(18,4) NOT NULL,
    currency character varying(10) NOT NULL,
    gateway_response jsonb,
    refunds jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: up_sell_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.up_sell_products (
    product_id text NOT NULL,
    up_sell_product_id text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: variation_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variation_values (
    id text NOT NULL,
    uid character varying(191) NOT NULL,
    variation_id text NOT NULL,
    label character varying(191) NOT NULL,
    value character varying(191),
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: variations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.variations (
    id text NOT NULL,
    uid character varying(191) NOT NULL,
    name character varying(191) NOT NULL,
    type public."VariationType" DEFAULT 'TEXT'::public."VariationType" NOT NULL,
    is_global boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    translations jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone,
    deleted_by text
);


--
-- Name: verification_otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_otps (
    id text NOT NULL,
    channel public."OtpChannel" NOT NULL,
    purpose public."OtpPurpose" NOT NULL,
    target character varying(255) NOT NULL,
    code_hash character varying(255) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 5 NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    verified_at timestamp(3) without time zone,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wish_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wish_lists (
    product_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id text NOT NULL
);


--
-- Name: orders order_number; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_number SET DEFAULT nextval('public.orders_order_number_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost) FROM stdin;
ff78e3b5-f550-4a01-bb3e-c7910e924a0b	E-Commerce	ep-mute-hat-a1mf891s	2026-01-18 05:34:16.458+00	2026-01-18 05:34:16.458+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6029fb0e-d45d-49d0-963a-7f15a213eece	6944e3daf2cbdf6499d6ab7ceb5158c0b86501435f8c00f6034161ef43897398	2026-03-08 15:32:22.874198+00	20260215092525_databse_initial	\N	\N	2026-03-08 15:32:21.954935+00	1
891bcfbc-9719-423a-bd29-5d8c303f0ff9	8220ee83732da651ed17be9d2862000921b53310aac73e0e6cb94c08dbad66cc	2026-03-08 15:32:23.376579+00	20260216055553_split_admin_customer_auth	\N	\N	2026-03-08 15:32:22.977583+00	1
b855ac61-c1c4-4b3e-a891-cff0fb36317e	1039c9aa0148a1bb8451bf97d69a4777e68f5802ceff05efefdd8346f256df32	2026-03-08 15:32:23.755427+00	20260222055745_update_add_rotation	\N	\N	2026-03-08 15:32:23.480095+00	1
a2ecaf61-e56b-4c3f-9dfa-5fc099ffdaec	5348962b981f2a629f4c3547c8ee16e3b1ab3d2f950893e2dff355738a5ff62c	2026-03-08 15:32:24.118148+00	20260222071013_solved_errors_auth_part	\N	\N	2026-03-08 15:32:23.858071+00	1
0ace3ce2-ae7d-44c8-9dc3-15ee2ae95002	4ad3439d6a18597a7d367f3679a57215ca59c656e2f2c1cca5c69f84731241e0	2026-03-08 15:32:24.495442+00	20260227194009	\N	\N	2026-03-08 15:32:24.221461+00	1
ca61d126-805b-4bc3-b5de-f3d4f9141e32	2fe88d2d58ee2cec46ddfd7440f3a7374a003c3e37753879e82e5ac971b6a301	2026-03-08 17:10:31.620249+00	20260308171030_add_prisma_things	\N	\N	2026-03-08 17:10:31.354302+00	1
30e3d256-f19a-454c-98c7-21698b2d417a	bcd47650837b616de7afb801295108cac50c6eb419d013bb27ca618ecaa9bf4d	2026-03-08 17:40:52.653957+00	20260308174051_add_active_at	\N	\N	2026-03-08 17:40:52.276401+00	1
79afa7fc-faab-4a9a-95de-dcb92f4b6b03	d17ae0a017b78b46a37d8e56f72ef313a932cffce304fed5d198952f3956080c	2026-03-10 06:25:14.275985+00	20260310062513_add_product_audit_fields	\N	\N	2026-03-10 06:25:13.944336+00	1
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addresses (id, label, address, descriptions, city, state, road, zip, country, is_default, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, customer_id) FROM stdin;
cmmltvzpf000rnw2aju5q4at8	Sample Address	Sample Address		Sample City	Sample State	Sample Road	12345	BANGLADESH	t	2026-03-11 09:20:12.675	2026-03-11 09:20:12.675	cmmltvzln000pnw2awv2u9lz1	\N	\N	\N	cmmltvzln000pnw2awv2u9lz1
cmmlx0wcx0003rq2axbm0vqvl	Home	mainaaddsfs	asdfas	dhaak	dh	Adfals Asfdjalsd	4234	BD	f	2026-03-11 10:48:00.466	2026-03-11 10:48:00.466	cmmltvzln000pnw2awv2u9lz1	\N	\N	\N	cmmltvzln000pnw2awv2u9lz1
cmmlx29d00005rq2a7ap0j2bl	Address 2	Dfasdl	Adsfla	asdf	Af	Asdflasdjlj Asdflajs dl	2342	BD	f	2026-03-11 10:49:03.972	2026-03-11 10:49:03.972	cmmltvzln000pnw2awv2u9lz1	\N	\N	\N	cmmltvzln000pnw2awv2u9lz1
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, first_name, last_name, email, phone, password, avatar, role, permissions, is_active, last_login_at, last_login_ip, created_at, updated_at, created_by, deleted_at, deleted_by, locked_until, login_attempts) FROM stdin;
cmmlo9gz70007qx2aracxkzwo	rasel	al	rasel@gmail.com	+8801700000000	$2b$12$mbWSWUcLRUXHjsHKeEg8kuf3wsDqhgYbewY.crQW8r5Ezs9zFRTvi	\N	SUPERADMIN	{}	t	2026-03-11 09:43:56.884	103.179.201.47	2026-03-11 06:42:43.891	2026-03-11 09:43:56.885	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N	0
cmmi0ilow0000odx8rp8ckf1v	Super	Admin	admin@gmail.com	\N	$2b$12$zNxFa1uQxsZOlJ0OxWSZPel/AlsLNzI3ZPsQVLAxG/FbIXaIX1I1C	\N	SUPERADMIN	{}	t	2026-03-11 09:51:36.983	103.179.201.47	2026-03-08 17:14:40.172	2026-03-11 09:51:36.984	\N	\N	\N	\N	0
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, user_id, name, key, prefix, permissions, last_used_at, expires_at, revoked_at, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: attribute_sets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attribute_sets (id, name, slug, translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
cmminfnb40002n72p4fgq9obz	Laptop Specifications	laptop-specifications	{"ar": {"name": "مواصفات الكمبيوتر المحمول"}, "bn": {"name": "ল্যাপটপ বৈশিষ্ট্য"}}	2026-03-09 03:56:13.889	2026-03-09 03:56:13.889	\N	\N
cmmkaolx8000cpd2ad5wja31a	General information	general-information	{"ar": {"name": "مواصفات الكمبيوتر المحمول"}, "bn": {"name": "ল্যাপটপ বৈশিষ্ট্য"}}	2026-03-10 07:34:49.34	2026-03-10 07:34:49.34	\N	\N
cmmkapfuk000dpd2ag2d5tkb8	physical information	physical-information	{"ar": {"name": "مواصفات الكمبيوتر المحمول"}, "bn": {"name": "ল্যাপটপ বৈশিষ্ট্য"}}	2026-03-10 07:35:28.124	2026-03-10 07:35:28.124	\N	\N
cmmkaq6rq000epd2asncdphay	Display	display	{"ar": {"name": "مواصفات الكمبيوتر المحمول"}, "bn": {"name": "ল্যাপটপ বৈশিষ্ট্য"}}	2026-03-10 07:36:03.014	2026-03-10 07:36:03.014	\N	\N
\.


--
-- Data for Name: attribute_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attribute_values (id, attribute_id, value, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmkdqpp0000kpd2ajwmrbpa7	cmmkau535000gpd2atd2u88ws	Apple	1	null	2026-03-10 09:00:26.388	2026-03-10 09:00:26.388	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmkdqpp0000ipd2apg4rbfd1	cmmkau535000gpd2atd2u88ws	6.87 	0	null	2026-03-10 09:00:26.389	2026-03-10 09:00:26.389	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmkdqpyv000mpd2ah42izifg	cmmkau535000gpd2atd2u88ws	Motorola	2	null	2026-03-10 09:00:26.389	2026-03-10 09:00:26.389	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attributes (id, attribute_set_id, name, slug, type, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmminh8vs0004n72paumuiu3v	cmminfnb40002n72p4fgq9obz	Brand	brand	TEXT	0	{"ar": {"name": "العلامة التجارية"}, "bn": {"name": "ব্র্যান্ড"}}	2026-03-09 03:57:28.504	2026-03-09 03:57:28.504	\N	\N	\N	\N
cmmkau535000gpd2atd2u88ws	cmmkaq6rq000epd2asncdphay	6.88 inchies	6.88-inchies	TEXT	0	{"ar": {"name": "العلامة التجارية"}, "bn": {"name": "ব্র্যান্ড"}}	2026-03-10 07:39:07.457	2026-03-10 07:39:07.457	\N	\N	\N	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at, "actorType", actor_id) FROM stdin;
\.


--
-- Data for Name: auth_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_tokens (id, admin_id, customer_id, token_hash, expires_at, revoked, revoked_at, revoked_reason, created_at, device_id, token_family, user_type) FROM stdin;
cmmi0jmf60003s72pt2bm8lgo	cmmi0ilow0000odx8rp8ckf1v	\N	bea00836b61c510710f7ba5cb758a37939d080c3cc02ea48d355c14d406928f0	2026-03-15 17:15:28.193	f	\N	\N	2026-03-08 17:15:28.194	cmmi0jm510001s72po9cl4cs9	19a4b900-743c-4b4b-996e-1d2971f363a3	ADMIN
cmmi22qxe0001rx2ppl9lm9l8	cmmi0ilow0000odx8rp8ckf1v	\N	08ed4ecce461dde5242d85017c1bf6938c6a5c5fbd23c270e80059644d9d0e02	2026-03-15 17:58:20.113	f	\N	\N	2026-03-08 17:58:20.115	cmmi0jm510001s72po9cl4cs9	7c85efc9-f487-4bc2-a5a1-6eb5e779380b	ADMIN
cmmineuf30001n72pet06286i	cmmi0ilow0000odx8rp8ckf1v	\N	b6406af86431daa9d9c1a30c2ec94f64ae3e725ac881314deffb4f78d3936eae	2026-03-16 03:55:36.446	f	\N	\N	2026-03-09 03:55:36.447	cmmi0jm510001s72po9cl4cs9	186a492e-7e5c-461a-9162-9a82cd19b590	ADMIN
cmmiuo6k70001qt2bgaozngf9	cmmi0ilow0000odx8rp8ckf1v	\N	8177919c4f27698aab30c03ecdd731c66d1aa4cadc674591488f15bf46dba087	2026-03-16 07:18:49.397	f	\N	\N	2026-03-09 07:18:49.4	cmmi0jm510001s72po9cl4cs9	1a350f2c-ce28-4240-ac99-fc0143e6fc8f	ADMIN
cmmix1ai90003qt2bz95vkdho	cmmi0ilow0000odx8rp8ckf1v	\N	19a26add95230ced30c1c4981e6c9116e7c2902c4b916862bcb3e38c9688eaa3	2026-03-16 08:25:00.271	f	\N	\N	2026-03-09 08:25:00.273	cmmi0jm510001s72po9cl4cs9	8b72c759-f40c-4f7b-bebe-bc1d41830231	ADMIN
cmmka14xp0001pd2atoxw34a9	cmmi0ilow0000odx8rp8ckf1v	\N	eb827571cb12aa8fce3575f4e1afeca9a65636075760599c4752c8f7cc33c76e	2026-03-17 07:16:34.236	f	\N	\N	2026-03-10 07:16:34.237	cmmi0jm510001s72po9cl4cs9	7e4c8244-f840-491a-babf-49e62394f90a	ADMIN
cmmlga3qs0001qf2bmfotwdej	cmmi0ilow0000odx8rp8ckf1v	\N	b66ae7e41629eb0d4eb2839d348c02f71b3e5847ffc1d2101574dd9bbe98e754	2026-03-18 02:59:16.468	f	\N	\N	2026-03-11 02:59:16.469	cmmi0jm510001s72po9cl4cs9	d5666d4e-6205-4879-90d3-e45fe7ead07e	ADMIN
cmmlhnj6e0007qf2b725wd57u	cmmi0ilow0000odx8rp8ckf1v	\N	a2742fe3151b4c7d86206703ed274dade7896785387d36097674dbdb5da21f15	2026-03-18 03:37:42.614	f	\N	\N	2026-03-11 03:37:42.615	cmmi0jm510001s72po9cl4cs9	b3dc67a9-81a4-4d27-bcc7-50b0147c90da	ADMIN
cmmlknhzd000iqf2bn8qh85fq	cmmi0ilow0000odx8rp8ckf1v	\N	9a9b349a63cca275b157865320f24f801b7f8bf8bf7021ab00595e759f8f16ca	2026-03-18 05:01:39.913	f	\N	\N	2026-03-11 05:01:39.914	cmmi0jm510001s72po9cl4cs9	6d1d3be7-c751-4e1a-80a5-74eb0c00404c	ADMIN
cmmlle3x6000kqf2bmixvopa2	cmmi0ilow0000odx8rp8ckf1v	\N	bbcf472a6aceef9faed1694e95c6ab5f60bc415fcda31e96ecf73efa6e49042e	2026-03-18 05:22:21.401	f	\N	\N	2026-03-11 05:22:21.403	cmmi0jm510001s72po9cl4cs9	3adb50ca-1028-4b2e-b4ce-d11d7c2a80ff	ADMIN
cmmllg1kq000mqf2bawefaugz	cmmi0ilow0000odx8rp8ckf1v	\N	e19e7b9e420b8c0e78a6cd31eaedd9f974d2e0b3dec1a706ce2321cb6dff1c12	2026-03-18 05:23:51.673	f	\N	\N	2026-03-11 05:23:51.674	cmmi0jm510001s72po9cl4cs9	cc81c3c5-5c89-44f3-9a40-664ba4d06563	ADMIN
cmmlnseye0001qx2amuer1owb	cmmi0ilow0000odx8rp8ckf1v	\N	3c0548917fa541aa186e29c9159f60ad1682f361c7ea2011ecbdd51edb97c6fb	2026-03-18 06:29:28.117	f	\N	\N	2026-03-11 06:29:28.119	cmmi0jm510001s72po9cl4cs9	1f59bdb1-496f-421b-9cbd-8f49aa56bd0d	ADMIN
cmmlnxtyn0003qx2a7zau1vai	cmmi0ilow0000odx8rp8ckf1v	\N	e17aaa26dac31a581225fd66689dbe471e2fa4fdaec39b6b768387521db3dfe8	2026-03-18 06:33:40.847	f	\N	\N	2026-03-11 06:33:40.848	cmmi0jm510001s72po9cl4cs9	0056462d-29c1-4550-855b-ca14fd7a7978	ADMIN
cmmlo3myd0005qx2av2cz5x1f	cmmi0ilow0000odx8rp8ckf1v	\N	2d3fe7e2da3895bb82f1ed737ed2673914575d702b752f270b6ec300a595c9de	2026-03-18 06:38:11.7	f	\N	\N	2026-03-11 06:38:11.701	cmmi0jm510001s72po9cl4cs9	294ee58a-41b8-4148-a97f-42b8cdf3cf63	ADMIN
cmmlockwy000bqx2aaxq0k3h4	cmmlo9gz70007qx2aracxkzwo	\N	838c0a540ed2f7bae970a8790917ea07fc12ceef265649b4eb20cec6b2cf3d69	2026-03-18 06:45:08.962	f	\N	\N	2026-03-11 06:45:08.963	cmmlocktl0009qx2ae415te99	2199e557-d6ce-4026-bb82-473f4ddcb840	ADMIN
cmmlotosw0001mv29vuplswzb	cmmi0ilow0000odx8rp8ckf1v	\N	394b37fb093e14334eba51cb2f2ed26827bca46a4968c496db0003ee092338c2	2026-03-18 06:58:27.151	f	\N	\N	2026-03-11 06:58:27.153	cmmi0jm510001s72po9cl4cs9	4fa2a5a2-23f1-4828-bea2-14d9c203aea3	ADMIN
cmmlpp81r0001nw2at9ar2x39	cmmi0ilow0000odx8rp8ckf1v	\N	c4164898c46c59055baa97212a7d2b121defe83e1efdbd4f27114d5709c3f8cf	2026-03-18 07:22:58.43	f	\N	\N	2026-03-11 07:22:58.431	cmmi0jm510001s72po9cl4cs9	c062e872-eae0-4913-86b4-6a6adb5b0736	ADMIN
cmmltw020000vnw2af6yi4wj6	\N	cmmltvzln000pnw2awv2u9lz1	22ce7a412e3d3df32b6e0438f45ca4e01e8a8f295815aadf9908d33beecbe042	2026-03-18 09:20:13.127	f	\N	\N	2026-03-11 09:20:13.129	cmmltvzyh000tnw2am4guk4no	437b1505-c76c-4e11-8c5f-5942f2b33e1b	CUSTOMER
cmmluc1hv000znw2a34qggk9k	\N	cmmltvzln000pnw2awv2u9lz1	ac25160ee6a9a611978e9b00a2175089beea5e198791b968b82b1b181b633a46	2026-03-18 09:32:41.49	f	\N	\N	2026-03-11 09:32:41.491	cmmluc1e9000xnw2ai3saebv3	e51c37a3-950a-4af0-af50-67f588e5edc1	CUSTOMER
cmmluooy60001oy2almmpkp48	cmmi0ilow0000odx8rp8ckf1v	\N	7c2c2124d23a7dfb130b7fdd4700b0ad1b5ac4967fae74fcfd8642f4679aa2eb	2026-03-18 09:42:31.757	f	\N	\N	2026-03-11 09:42:31.758	cmmi0jm510001s72po9cl4cs9	1039f8f1-6a1f-49cd-a9a2-90f53027cc1d	ADMIN
cmmlupqot0003oy2ab7tv65o3	cmmlo9gz70007qx2aracxkzwo	\N	4e143266021263741151fb5ab10b3d9a3865c8ce6baba6bf19d46a32a220f2d6	2026-03-18 09:43:20.669	f	\N	\N	2026-03-11 09:43:20.67	cmmlocktl0009qx2ae415te99	50ea731b-5960-4c5e-8d96-81a51ab580f8	ADMIN
cmmluqis00005oy2au09h1o1a	cmmlo9gz70007qx2aracxkzwo	\N	764deea6fddf1f3b13f52970d7893782aeec1c04bd207962199945540d835f72	2026-03-18 09:43:57.071	f	\N	\N	2026-03-11 09:43:57.072	cmmlocktl0009qx2ae415te99	d59b232b-4815-44f5-83c3-3edfbcb085d1	ADMIN
cmmlv0dxf0001rq2agzrdknog	cmmi0ilow0000odx8rp8ckf1v	\N	9038d108376755ee6fdc62f6b46c9e8299b15c0080f67ce6d3721b76202250c3	2026-03-18 09:51:37.347	f	\N	\N	2026-03-11 09:51:37.348	cmmi0jm510001s72po9cl4cs9	67b1e5e3-33c7-4de2-a6f7-3e6086c460df	ADMIN
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, name, slug, description, image, translations, seo, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmkajjtt0003pd2awi24q3d7	mi	mi-12	Leading electronics brand worldwide	cmmka24sq0002pd2aoqep3he8	{"ar": {"name": "سامسونج", "description": "علامة تجارية معروفة"}, "bn": {"name": "স্যামসাং", "description": "বিশ্ব ব্র্যান্ড"}}	{"ogImage": "https://cdn.example.com/samsung-og.jpg", "metaTitle": "Samsung - Official Store", "canonicalUrl": "/brands/samsung", "metaDescription": "Shop Samsung products..."}	2026-03-10 07:30:53.345	2026-03-10 07:30:53.345	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmkak0pi0006pd2amdwqn43f	xlomi	xlomi-12	Leading electronics brand worldwide	cmmka24sq0002pd2aoqep3he8	{"ar": {"name": "سامسونج", "description": "علامة تجارية معروفة"}, "bn": {"name": "স্যামসাং", "description": "বিশ্ব ব্র্যান্ড"}}	{"ogImage": "https://cdn.example.com/samsung-og.jpg", "metaTitle": "Samsung - Official Store", "canonicalUrl": "/brands/samsung", "metaDescription": "Shop Samsung products..."}	2026-03-10 07:31:15.222	2026-03-10 07:31:15.222	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmkakf4w0009pd2asbz4mom0	poco	poco-12	Leading electronics brand worldwide	cmmka24sq0002pd2aoqep3he8	{"ar": {"name": "سامسونج", "description": "علامة تجارية معروفة"}, "bn": {"name": "স্যামসাং", "description": "বিশ্ব ব্র্যান্ড"}}	{"ogImage": "https://cdn.example.com/samsung-og.jpg", "metaTitle": "Samsung - Official Store", "canonicalUrl": "/brands/samsung", "metaDescription": "Shop Samsung products..."}	2026-03-10 07:31:33.921	2026-03-10 07:31:33.921	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
brand1	Apple	apple	Technology company	apple-logo.jpg	{"en": "Apple", "es": "Apple"}	{"title": "Apple Products", "description": "Find the latest Apple products"}	2026-03-10 08:41:52.578	2026-03-10 08:41:52.578	\N	\N	\N	\N
brand2	Nike	nike	Sports apparel company	nike-logo.jpg	{"en": "Nike", "es": "Nike"}	{"title": "Nike Sportswear", "description": "Discover Nike sportswear and equipment"}	2026-03-10 08:41:52.578	2026-03-10 08:41:52.578	\N	\N	\N	\N
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, session_id, data, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, customer_id) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, parent_id, name, slug, description, image, icon, "position", depth, translations, seo, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, path, is_active, path_ids) FROM stdin;
cmmi3mve60001qp2ptowztq1q	\N	Electronics	electronics	All electronic items	cmmi23r0q0002rx2prj8h6x97	\N	1	0	{"bn": {"name": "ইলেকট্রনিক্স", "description": "সকল ইলেকট্রনিক পণ্য"}}	{"ogImage": null, "metaTitle": "Electronics - Best Deals", "canonicalUrl": null, "metaDescription": "Shop the best electronics..."}	2026-03-08 18:41:58.639	2026-03-08 18:41:58.639	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N		t
cmmixenho0006qt2bmo2p75zh	\N	Electronics-oven	electronics-12	All electronic items	cmmix1z070004qt2bhequ3zrb	\N	0	0	{"bn": {"name": "ইলেকট্রনিক্স", "description": "সকল ইলেকট্রনিক পণ্য"}}	{"ogImage": "string", "metaTitle": "Electronics - Best Deals", "canonicalUrl": "string", "metaDescription": "Shop the best electronics..."}	2026-03-09 08:35:23.628	2026-03-09 08:35:23.628	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N		t
cmmlih9r0000cqf2b6l1125py	cmmi3mve60001qp2ptowztq1q	Mobiles	mobile-1	All electronic items	cmmka24sq0002pd2aoqep3he8	cmmka24sq0002pd2aoqep3he8	0	1	{"bn": {"name": "ইলেকট্রনিক্স", "description": "সকল ইলেকট্রনিক পণ্য"}}	{"ogImage": "string", "metaTitle": "Electronics - Best Deals", "canonicalUrl": "string", "metaDescription": "Shop the best electronics..."}	2026-03-11 04:00:50.076	2026-03-11 04:00:50.076	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N	electronics	t	cmmi3mve60001qp2ptowztq1q
\.


--
-- Data for Name: coupon_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_categories (coupon_id, category_id, exclude) FROM stdin;
cmmlgcdox0002qf2b8ldv9wxa	cmmi3mve60001qp2ptowztq1q	f
cmmlgcdox0002qf2b8ldv9wxa	cmmixenho0006qt2bmo2p75zh	f
\.


--
-- Data for Name: coupon_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_products (coupon_id, product_id, exclude) FROM stdin;
cmmlgcdox0002qf2b8ldv9wxa	cmmke7nfs000zpd2aivn6ard3	f
cmmlgcdox0002qf2b8ldv9wxa	cmmkl1kos0016pd2ajadobocz	f
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, name, code, discount_type, value, free_shipping, minimum_spend, maximum_spend, usage_limit_per_coupon, usage_limit_per_customer, used, is_active, start_date, end_date, translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
cmmlgcdox0002qf2b8ldv9wxa	Summer Sale 20% Off	SUMMER20	PERCENT	20.0000	f	100.0000	1000.0000	100	1	0	t	2026-03-01 00:00:00	2026-03-31 23:59:59	{"ar": {"name": "خصم الصيف ٢٠٪"}, "bn": {"name": "গ্রীষ্মকালীন ছাড় ২০%"}}	2026-03-11 03:01:02.673	2026-03-11 03:01:02.673	\N	\N
\.


--
-- Data for Name: cross_sell_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cross_sell_products (product_id, cross_sell_product_id, "position") FROM stdin;
\.


--
-- Data for Name: currency_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.currency_rates (id, currency, rate, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, first_name, last_name, email, email_verified, phone, phone_verified, password, avatar, is_guest, is_active, last_login_at, last_login_ip, deleted_at, deleted_by, created_at, updated_at, locked_until, login_attempts) FROM stdin;
cmmltvzln000pnw2awv2u9lz1	shafi	asfld	shfadf@gmail.com	f	01409530856	t	$2b$12$dDpyUj5X43zAEALpUktE2.QDoLiuh0dXgPlUQnyYS03JbxC5mXq3a	\N	f	t	2026-03-11 09:32:41.109	103.155.71.185	\N	\N	2026-03-11 09:20:12.539	2026-03-11 09:32:41.11	\N	0
\.


--
-- Data for Name: delivery_riders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_riders (id, name, phone, email, is_active, details, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.devices (id, admin_id, customer_id, user_type, device_id, created_at, device_name, device_type, ip_address, is_active, last_active_at, revoked_at, user_agent) FROM stdin;
cmmlocktl0009qx2ae415te99	cmmlo9gz70007qx2aracxkzwo	\N	ADMIN	a1b2c3d4-e5f6-4s...	2026-03-11 06:45:08.842	Chrome on macOS	desktop	103.179.201.47	t	2026-03-11 09:44:37.628	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
cmmi0jm510001s72po9cl4cs9	cmmi0ilow0000odx8rp8ckf1v	\N	ADMIN	a1b2c3d4-e5f6-...	2026-03-08 17:15:27.83	Chrome on macOS	desktop	103.179.201.47	t	2026-03-11 09:51:37.223	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
cmmluc1e9000xnw2ai3saebv3	\N	cmmltvzln000pnw2awv2u9lz1	CUSTOMER	string	2026-03-11 09:32:41.361	string	mobile	103.155.71.185	t	2026-03-11 11:25:37.513	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
cmmltvzyh000tnw2am4guk4no	\N	cmmltvzln000pnw2awv2u9lz1	CUSTOMER		2026-03-11 09:20:13.001			103.155.71.185	t	2026-03-11 13:55:40.114	\N	Dart/3.9 (dart:io)
\.


--
-- Data for Name: entity_media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entity_media (id, entity_type, entity_id, media_id, "position", purpose, is_main, created_at, updated_at) FROM stdin;
cmmi3mw9z0003qp2pshv5fnit	Category	cmmi3mve60001qp2ptowztq1q	cmmi23r0q0002rx2prj8h6x97	0	thumbnail	t	2026-03-08 18:41:59.784	2026-03-08 18:41:59.784
cmmixenty0008qt2byyzfqdin	Category	cmmixenho0006qt2bmo2p75zh	cmmix1z070004qt2bhequ3zrb	0	thumbnail	t	2026-03-09 08:35:24.071	2026-03-09 08:35:24.071
cmmkajjxc0005pd2apz5bcfbw	Brand	cmmkajjtt0003pd2awi24q3d7	cmmka24sq0002pd2aoqep3he8	0	logo	t	2026-03-10 07:30:53.472	2026-03-10 07:30:53.472
cmmkak0tb0008pd2am9dqx3ro	Brand	cmmkak0pi0006pd2amdwqn43f	cmmka24sq0002pd2aoqep3he8	0	logo	t	2026-03-10 07:31:15.359	2026-03-10 07:31:15.359
cmmkakf6l000bpd2atfbutiuv	Brand	cmmkakf4w0009pd2asbz4mom0	cmmka24sq0002pd2aoqep3he8	0	logo	t	2026-03-10 07:31:33.981	2026-03-10 07:31:33.981
cmmke7obe0014pd2a74l0nb2v	ProductVariant	cmmke7o7z0013pd2a7owygq5t	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 09:13:37.755	2026-03-10 09:13:37.755
cmmkl1lfs0019pd2agubwdzf5	ProductVariant	cmmkl1lc90018pd2aiydu6s1e	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:24:51.399	2026-03-10 12:24:51.399
cmmkl3iog001cpd2a5bc7nmhm	Product	cmmkl3hxv001bpd2a7hhp81y8	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:26:21.136	2026-03-10 12:26:21.136
cmmkl4h5k001fpd2arxxe52qn	Product	cmmkl4gty001epd2ad90ecaso	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:27:05.817	2026-03-10 12:27:05.817
cmmkl6ela001mpd2anbj0yz27	ProductVariant	cmmkl6ehu001lpd2aj001eeae	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:28:35.806	2026-03-10 12:28:35.806
cmmkl70bj001rpd2an2l033pp	Product	cmmkl6zom001opd2aou01dwhb	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:29:03.967	2026-03-10 12:29:03.967
cmmkl7p0r001wpd2awnvf47by	ProductVariant	cmmkl7oz3001vpd2a06e6y207	cmmka24sq0002pd2aoqep3he8	0	gallery	t	2026-03-10 12:29:35.979	2026-03-10 12:29:35.979
cmmliha5m000eqf2bkpyjmmwg	Category	cmmlih9r0000cqf2b6l1125py	cmmka24sq0002pd2aoqep3he8	0	thumbnail	t	2026-03-11 04:00:50.603	2026-03-11 04:00:50.603
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.files (id, filename, disk, path, url, extension, mime, size, alt, variants, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, uploaded_by) FROM stdin;
\.


--
-- Data for Name: flash_sale_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flash_sale_products (id, flash_sale_id, product_id, end_date, price, qty, sold, "position", created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmlgh7t60005qf2b8zfzfmhp	cmmlgh7pl0003qf2bfnt1m56d	cmmkl4gty001epd2ad90ecaso	2026-03-15 23:59:59	99.9900	100	0	0	2026-03-11 03:04:48.33	2026-03-11 03:04:48.33	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: flash_sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flash_sales (id, campaign_name, translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmlgh7pl0003qf2bfnt1m56d	Spring Sale 2026	{"ar": {"campaignName": "تخفيضات الربيع ٢٠٢٦"}, "bn": {"campaignName": "বসন্ত বিক্রয় ২০২৬"}}	2026-03-11 03:04:48.201	2026-03-11 03:04:48.201	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_logs (id, product_id, product_variant_id, sku, reason, quantity, stock_before, stock_after, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media (id, filename, original_name, "mime_Type", size, extension, storage_driver, storage_path, storage_url, variants, width, height, alt, reference_count, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmi23r0q0002rx2prj8h6x97	media/rg0ub4wfsweife6jqylf	Screenshot 2026-01-09 001132.png	image/png	37545	.png	cloudinary	media/rg0ub4wfsweife6jqylf	https://res.cloudinary.com/dfxkbil20/image/upload/v1772992745/media/rg0ub4wfsweife6jqylf.png	{"thumb": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_thumb,h_150,w_150/v1772992745/media/rg0ub4wfsweife6jqylf.png", "width": 150, "height": 150}, "medium": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_limit,h_600,w_600/v1772992745/media/rg0ub4wfsweife6jqylf.png", "width": 285, "height": 600}, "original": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/v1772992745/media/rg0ub4wfsweife6jqylf.png", "width": 294, "height": 619}}	294	619	\N	1	2026-03-08 17:59:06.89	2026-03-08 18:42:00.171	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmix1z070004qt2bhequ3zrb	media/y5nn3pnqq8mrsufwekuo	Screenshot 2026-01-07 212908.png	image/png	298569	.png	cloudinary	media/y5nn3pnqq8mrsufwekuo	https://res.cloudinary.com/dfxkbil20/image/upload/v1773044730/media/y5nn3pnqq8mrsufwekuo.png	{"thumb": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_thumb,h_150,w_150/v1773044730/media/y5nn3pnqq8mrsufwekuo.png", "width": 150, "height": 150}, "medium": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_limit,h_600,w_600/v1773044730/media/y5nn3pnqq8mrsufwekuo.png", "width": 600, "height": 330}, "original": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/v1773044730/media/y5nn3pnqq8mrsufwekuo.png", "width": 950, "height": 523}}	950	523	\N	1	2026-03-09 08:25:32.023	2026-03-09 08:35:24.224	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
media1	product1.jpg	product1.jpg	image/jpeg	1024	jpg	LOCAL	/uploads/product1.jpg	http://example.com/uploads/product1.jpg	\N	\N	\N	\N	0	2026-03-10 08:41:52.66	2026-03-10 08:41:52.66	\N	\N	\N	\N
media2	product2.jpg	product2.jpg	image/jpeg	2048	jpg	LOCAL	/uploads/product2.jpg	http://example.com/uploads/product2.jpg	\N	\N	\N	\N	0	2026-03-10 08:41:52.66	2026-03-10 08:41:52.66	\N	\N	\N	\N
cmmka24sq0002pd2aoqep3he8	media/d1wsbuhgjqc0mjemafax	Screenshot 2026-01-09 005956.png	image/png	903155	.png	cloudinary	media/d1wsbuhgjqc0mjemafax	https://res.cloudinary.com/dfxkbil20/image/upload/v1773127038/media/d1wsbuhgjqc0mjemafax.png	{"thumb": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_thumb,h_150,w_150/v1773127038/media/d1wsbuhgjqc0mjemafax.png", "width": 150, "height": 150}, "medium": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/c_limit,h_600,w_600/v1773127038/media/d1wsbuhgjqc0mjemafax.png", "width": 600, "height": 272}, "original": {"url": "https://res.cloudinary.com/dfxkbil20/image/upload/v1773127038/media/d1wsbuhgjqc0mjemafax.png", "width": 1881, "height": 854}}	1881	854	\N	11	2026-03-10 07:17:20.715	2026-03-11 04:00:50.733	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, channel, status, data, sent_at, delivered_at, failed_at, created_at) FROM stdin;
\.


--
-- Data for Name: option_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_values (id, option_id, label, price, price_type, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.options (id, name, type, is_required, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: order_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_packages (id, order_id, rider_id, status, tracking_number, items, packed_at, packed_by, assigned_at, assigned_by, picked_up_at, delivered_at, failed_at, returned_at, delivery_details, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: order_product_option_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_product_option_values (id, order_product_option_id, option_value_id, label, price) FROM stdin;
\.


--
-- Data for Name: order_product_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_product_options (id, order_product_id, option_name, value) FROM stdin;
\.


--
-- Data for Name: order_product_variation_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_product_variation_values (order_product_variation_id, variation_value_id) FROM stdin;
\.


--
-- Data for Name: order_product_variations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_product_variations (id, order_product_id, variation_name, type, value) FROM stdin;
\.


--
-- Data for Name: order_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_products (id, order_id, product_id, product_variant_id, product_name, product_sku, product_slug, product_image, unit_price, qty, line_total) FROM stdin;
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, order_id, from_status, to_status, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: order_taxes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_taxes (order_id, tax_rate_id, amount, rate_name, rate_value) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, customer_id, customer_email, customer_phone, customer_first_name, customer_last_name, billing_address, shipping_address, sub_total, shipping_cost, discount, tax_total, total, shipping_method, payment_method, tracking_reference, coupon_id, coupon_code, currency, currency_rate, status, notes, locale, ip_address, user_agent, paid_at, shipped_at, delivered_at, canceled_at, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_history (id, product_id, product_variant_id, previous_price, new_price, previous_special_price, new_special_price, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: product_attribute_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_attribute_values (product_attribute_id, attribute_value_id) FROM stdin;
cmmke7nut0011pd2afryxhxo2	cmmkdqpp0000ipd2apg4rbfd1
cmmkl6e5g001jpd2acttzre6g	cmmkdqpp0000ipd2apg4rbfd1
cmmkl6zww001qpd2akg8fu1dv	cmmkdqpp0000kpd2ajwmrbpa7
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_attributes (id, product_id, attribute_id) FROM stdin;
cmmke7nut0011pd2afryxhxo2	cmmke7nfs000zpd2aivn6ard3	cmminh8vs0004n72paumuiu3v
cmmkl6e5g001jpd2acttzre6g	cmmkl6e0g001hpd2a11uuwert	cmminh8vs0004n72paumuiu3v
cmmkl6zww001qpd2akg8fu1dv	cmmkl6zom001opd2aou01dwhb	cmminh8vs0004n72paumuiu3v
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (product_id, category_id, assigned_at) FROM stdin;
cmmke7nfs000zpd2aivn6ard3	cmmi3mve60001qp2ptowztq1q	2026-03-10 09:13:36.846
cmmkl1kos0016pd2ajadobocz	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:24:50.712
cmmkl3hxv001bpd2a7hhp81y8	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:26:20.496
cmmkl4gty001epd2ad90ecaso	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:27:05.459
cmmkl6e0g001hpd2a11uuwert	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:28:35.116
cmmkl6zom001opd2aou01dwhb	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:29:03.29
cmmkl7oqu001tpd2ac1tlu1rb	cmmi3mve60001qp2ptowztq1q	2026-03-10 12:29:35.682
\.


--
-- Data for Name: product_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_options (product_id, option_id) FROM stdin;
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_tags (product_id, tag_id, assigned_at) FROM stdin;
cmmke7nfs000zpd2aivn6ard3	tag2	2026-03-10 09:13:37.037
cmmkl1kos0016pd2ajadobocz	tag2	2026-03-10 12:24:50.861
cmmkl3hxv001bpd2a7hhp81y8	tag2	2026-03-10 12:26:20.655
cmmkl4gty001epd2ad90ecaso	tag1	2026-03-10 12:27:05.519
cmmkl6e0g001hpd2a11uuwert	tag2	2026-03-10 12:28:35.177
cmmkl6zom001opd2aou01dwhb	tag1	2026-03-10 12:29:03.365
cmmkl7oqu001tpd2ac1tlu1rb	tag1	2026-03-10 12:29:35.742
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (id, uid, uids, product_id, name, sku, price, special_price, special_price_type, special_price_start, special_price_end, manage_stock, qty, in_stock, is_default, is_active, "position", images, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
cmmke7o7z0013pd2a7owygq5t	xl-red	xl-red	cmmke7nfs000zpd2aivn6ard3	XL Red	TSHIRT-XL-RED	35.0000	\N	\N	\N	\N	t	50	t	t	t	0	\N	2026-03-10 09:13:37.631	2026-03-10 09:13:37.631	\N	\N
cmmkl1lc90018pd2aiydu6s1e	size-xl-black	size-xl-black	cmmkl1kos0016pd2ajadobocz	Size XL Black	SNKR-XL-BLK	120.0000	\N	\N	\N	\N	t	25	t	t	t	0	\N	2026-03-10 12:24:51.272	2026-03-10 12:24:51.272	\N	\N
cmmkl6ehu001lpd2aj001eeae	hoodie-xl-black	hoodie-xl-black	cmmkl6e0g001hpd2a11uuwert	Hoodie XL Black	HOODIE-XL-BLK	65.0000	55.0000	FIXED	2026-04-01 00:00:00	2026-05-01 00:00:00	t	120	t	t	t	0	\N	2026-03-10 12:28:35.683	2026-03-10 12:28:35.683	\N	\N
cmmkl7oz3001vpd2a06e6y207	fitness-watch-xl-edition	fitness-watch-xl-edition	cmmkl7oqu001tpd2ac1tlu1rb	Fitness Watch XL Edition	WATCH-PRO-XL	249.0000	219.0000	FIXED	2026-05-01 00:00:00	2026-06-01 00:00:00	t	60	t	t	t	0	\N	2026-03-10 12:29:35.919	2026-03-10 12:29:35.919	\N	\N
\.


--
-- Data for Name: product_variations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variations (product_id, variation_id) FROM stdin;
cmmke7nfs000zpd2aivn6ard3	cmmkds5tp000ppd2am2nsakec
cmmkl1kos0016pd2ajadobocz	cmmkds5tp000ppd2am2nsakec
cmmkl6e0g001hpd2a11uuwert	cmmkds5tp000ppd2am2nsakec
cmmkl7oqu001tpd2ac1tlu1rb	cmmkds5tp000ppd2am2nsakec
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, brand_id, tax_class_id, name, slug, description, short_description, sku, price, special_price, special_price_type, special_price_start, special_price_end, manage_stock, qty, in_stock, weight, dimensions, is_active, viewed, new_from, new_to, images, downloads, translations, seo, created_at, updated_at, deleted_at, deleted_by, created_by, updated_by) FROM stdin;
cmmke7nfs000zpd2aivn6ard3	cmmkajjtt0003pd2awi24q3d7	\N	Classic Cotton T-Shirt	classic-cotton-t-shirt	<p>Comfortable cotton t-shirt</p>	Comfortable cotton t-shirt	\N	\N	\N	\N	\N	\N	f	\N	t	\N	\N	t	0	\N	\N	\N	\N	\N	{"url": "classic-cotton-tshirt", "metaTitle": "Classic Cotton T-Shirt", "metaDescription": "Comfortable premium cotton t-shirt"}	2026-03-10 09:13:36.617	2026-03-10 09:13:36.617	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl1kos0016pd2ajadobocz	cmmkajjtt0003pd2awi24q3d7	\N	Running Sneakers	running-sneakers	<p>Lightweight running sneakers</p>	Sport sneakers	\N	\N	\N	\N	\N	\N	f	\N	t	\N	\N	t	0	\N	\N	\N	\N	\N	{"url": "running-sneakers", "metaTitle": "Running Sneakers", "metaDescription": "Comfortable running sneakers"}	2026-03-10 12:24:50.421	2026-03-10 12:24:50.421	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl3hxv001bpd2a7hhp81y8	cmmkajjtt0003pd2awi24q3d7	\N	Laptop Travel Bag	laptop-travel-bag	<p>Durable laptop bag</p>	Travel laptop bag	LAPBAG-001	79.9900	\N	\N	\N	\N	t	40	t	\N	\N	t	0	\N	\N	\N	\N	\N	{"url": "laptop-travel-bag", "metaTitle": "Laptop Travel Bag", "metaDescription": "Durable laptop travel bag"}	2026-03-10 12:26:20.179	2026-03-10 12:26:20.179	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl4gty001epd2ad90ecaso	cmmkajjtt0003pd2awi24q3d7	\N	Wireless Mouse	wireless-mouse	<p>Ergonomic wireless mouse</p>	Wireless mouse	MOUSE-001	25.0000	\N	\N	\N	\N	t	80	t	\N	\N	t	0	\N	\N	\N	\N	\N	{"url": "wireless-mouse", "metaTitle": "Wireless Mouse", "metaDescription": "Comfortable wireless mouse"}	2026-03-10 12:27:05.398	2026-03-10 12:27:05.398	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl6e0g001hpd2a11uuwert	cmmkajjtt0003pd2awi24q3d7	\N	Premium Street Hoodie	premium-street-hoodie	<p>Heavyweight premium hoodie designed for comfort and street style.</p>	Premium street hoodie	\N	\N	\N	\N	\N	\N	f	\N	t	\N	\N	t	0	2026-04-01 00:00:00	2026-06-01 00:00:00	\N	\N	\N	{"url": "premium-street-hoodie", "metaTitle": "Premium Street Hoodie", "metaDescription": "Heavyweight street hoodie for everyday style."}	2026-03-10 12:28:35.056	2026-03-10 12:28:35.056	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl6zom001opd2aou01dwhb	cmmkajjtt0003pd2awi24q3d7	\N	Mechanical Gaming Keyboard	mechanical-gaming-keyboard	<p>RGB mechanical keyboard designed for professional gaming.</p>	Mechanical RGB keyboard	KEYBOARD-MECH-RGB	149.9900	129.9900	FIXED	2026-04-01 00:00:00	2026-04-30 23:59:59	t	75	t	\N	\N	t	0	2026-03-01 00:00:00	2026-05-01 00:00:00	\N	\N	\N	{"url": "mechanical-gaming-keyboard", "metaTitle": "Mechanical Gaming Keyboard", "metaDescription": "Professional RGB mechanical gaming keyboard."}	2026-03-10 12:29:03.142	2026-03-10 12:29:03.142	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
cmmkl7oqu001tpd2ac1tlu1rb	cmmkajjtt0003pd2awi24q3d7	\N	Smart Fitness Watch Pro	smart-fitness-watch-pro	<p>Advanced smartwatch with health monitoring and GPS tracking.</p>	Smart fitness watch	\N	\N	\N	\N	\N	\N	f	\N	t	\N	\N	t	0	2026-04-01 00:00:00	2026-07-01 00:00:00	\N	\N	\N	{"url": "smart-fitness-watch-pro", "metaTitle": "Smart Fitness Watch Pro", "metaDescription": "Advanced smartwatch with health and fitness tracking."}	2026-03-10 12:29:35.622	2026-03-10 12:29:35.622	\N	\N	cmmi0ilow0000odx8rp8ckf1v	\N
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotions (id, name, slug, description, type, is_auto_apply, is_stackable, priority, rules, is_active, start_date, end_date, usage_limit, used, translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: queue_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.queue_jobs (id, queue, name, status, data, started_at, completed_at, failed_at, created_at) FROM stdin;
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refunds (id, order_id, transaction_id, amount, currency, status, reason, details, gateway_response, processed_by, processed_at, completed_at, rejected_at, rejection_details, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: related_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.related_products (product_id, related_product_id, "position") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, reviewer_id, product_id, rating, reviewer_name, title, comment, is_approved, admin_reply, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: search_terms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.search_terms (id, term, results, hits, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, "group", value, is_translatable, translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_rates (id, shipping_zone_id, name, type, cost, is_active, conditions, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_zones (id, name, is_active, regions, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: stock_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_reservations (id, product_id, product_variant_id, user_id, session_id, qty, status, expires_at, converted_at, released_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, name, slug, translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
tag1	Electronics	electronics	{"en": "Electronics", "es": "Electrónica"}	2026-03-10 08:41:52.419	2026-03-10 08:41:52.419	\N	\N	\N	\N
tag2	Clothing	clothing	{"en": "Clothing", "es": "Ropa"}	2026-03-10 08:41:52.419	2026-03-10 08:41:52.419	\N	\N	\N	\N
tag3	Books	books	{"en": "Books", "es": "Libros"}	2026-03-10 08:41:52.419	2026-03-10 08:41:52.419	\N	\N	\N	\N
cmmlo46ff0006qx2ayqjvendv	mobile	mobile-122	{}	2026-03-11 06:38:36.939	2026-03-11 06:38:36.939	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmlokm6m000cqx2ajol9gres	gfrth	ghfjy	{}	2026-03-11 06:51:23.854	2026-03-11 06:51:23.854	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlqpuk80002nw2asfbg9q21	school-bag	school-bag	null	2026-03-11 07:51:27.224	2026-03-11 07:51:27.224	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmls0ukt0003nw2a20twfh4y	size	size	null	2026-03-11 08:28:00.078	2026-03-11 08:28:00.078	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmls1rc60004nw2ae73lsn38	asdad	asdad	null	2026-03-11 08:28:42.534	2026-03-11 08:28:42.534	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmls9px50005nw2acop0vzms	RASSEL MAHMUD SHANTO	rassel-mahmud-shanto	null	2026-03-11 08:34:53.946	2026-03-11 08:34:53.946	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlse6u20006nw2azlw7h3vl	shoes	shoes	null	2026-03-11 08:38:22.491	2026-03-11 08:38:22.491	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlsk6uw0007nw2adwfn8dx8	ad	ad	null	2026-03-11 08:43:02.456	2026-03-11 08:43:02.456	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlspqel0008nw2aj1u1wlzz	asd	asd	null	2026-03-11 08:47:21.07	2026-03-11 08:47:21.07	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlsqwqi0009nw2a07b9062q	sad	sad	null	2026-03-11 08:48:15.93	2026-03-11 08:48:15.93	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlsstld000anw2a22j5uxaj	sad4	sad4	null	2026-03-11 08:49:45.169	2026-03-11 08:49:45.169	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlsviii000bnw2a5tgrxccl	sad4asda	sad4asda	null	2026-03-11 08:51:50.779	2026-03-11 08:51:50.779	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlt3e5x000cnw2a9s3qkume	MD HUMAUN-AL-RASEL	md-humaun-al-rasel	null	2026-03-11 08:57:58.39	2026-03-11 08:57:58.39	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmlt4slw000dnw2axhlj0d8t	bag	bag	null	2026-03-11 08:59:03.764	2026-03-11 08:59:03.764	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmltc4yj000fnw2au70jx53f	asdasd	asdasd	null	2026-03-11 09:04:46.363	2026-03-11 09:04:46.363	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
cmmltvggg000onw2a45ermhy2	adsd	adsd	null	2026-03-11 09:19:47.728	2026-03-11 09:19:47.728	cmmlo9gz70007qx2aracxkzwo	\N	\N	\N
\.


--
-- Data for Name: tax_classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_classes (id, name, based_on, translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
cmmlowvb60002mv29am0ejt0r	Standard Tax	SHIPPING_ADDRESS	{}	2026-03-11 07:00:55.204	2026-03-11 07:00:55.204	\N	\N
cmmlox8mr0003mv29s802wzq5	Standard Tax	SHIPPING_ADDRESS	{}	2026-03-11 07:01:12.761	2026-03-11 07:01:12.761	\N	\N
cmmloxd770004mv2931xk2x98	Standard Tax	SHIPPING_ADDRESS	{}	2026-03-11 07:01:18.74	2026-03-11 07:01:18.74	\N	\N
\.


--
-- Data for Name: tax_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rates (id, tax_class_id, name, country, state, city, zip, rate, "position", translations, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
cmmlp1r700006mv29s1cn1eoy	cmmloxd770004mv2931xk2x98	VAT 15%	BD	*	Dhaka	*	15.0000	0	{}	2026-03-11 07:04:43.501	2026-03-11 07:04:43.501	\N	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, order_id, transaction_id, payment_method, amount, currency, gateway_response, refunds, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: up_sell_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.up_sell_products (product_id, up_sell_product_id, "position") FROM stdin;
\.


--
-- Data for Name: variation_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variation_values (id, uid, variation_id, label, value, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmkds610000rpd2ak884l41g	size-xl	cmmkds5tp000ppd2am2nsakec	XL	#ff0000	0	{"bn": {"label": "এক্সএল"}}	2026-03-10 09:01:34.212	2026-03-10 09:01:34.212	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
cmmkdswu9000tpd2a4ek3npo4	size-xl-1	cmmkds5tp000ppd2am2nsakec	XL	#ff0000	0	{"bn": {"label": "এক্সএল"}}	2026-03-10 09:02:08.962	2026-03-10 09:02:08.962	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: variations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.variations (id, uid, name, type, is_global, "position", translations, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by) FROM stdin;
cmmkds5tp000ppd2am2nsakec	size	Size	TEXT	t	0	{"bn": {"name": "সাইজ"}}	2026-03-10 09:01:33.949	2026-03-10 09:01:33.949	cmmi0ilow0000odx8rp8ckf1v	\N	\N	\N
\.


--
-- Data for Name: verification_otps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_otps (id, channel, purpose, target, code_hash, expires_at, attempts, max_attempts, verified, verified_at, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: wish_lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wish_lists (product_id, created_at, customer_id) FROM stdin;
\.


--
-- Name: orders_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_order_number_seq', 1, false);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: attribute_sets attribute_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attribute_sets
    ADD CONSTRAINT attribute_sets_pkey PRIMARY KEY (id);


--
-- Name: attribute_values attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attribute_values
    ADD CONSTRAINT attribute_values_pkey PRIMARY KEY (id);


--
-- Name: attributes attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupon_categories coupon_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_pkey PRIMARY KEY (coupon_id, category_id, exclude);


--
-- Name: coupon_products coupon_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_products
    ADD CONSTRAINT coupon_products_pkey PRIMARY KEY (coupon_id, product_id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: cross_sell_products cross_sell_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_sell_products
    ADD CONSTRAINT cross_sell_products_pkey PRIMARY KEY (product_id, cross_sell_product_id);


--
-- Name: currency_rates currency_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.currency_rates
    ADD CONSTRAINT currency_rates_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_riders delivery_riders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_riders
    ADD CONSTRAINT delivery_riders_pkey PRIMARY KEY (id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: entity_media entity_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_media
    ADD CONSTRAINT entity_media_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: flash_sale_products flash_sale_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_sale_products
    ADD CONSTRAINT flash_sale_products_pkey PRIMARY KEY (id);


--
-- Name: flash_sales flash_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_sales
    ADD CONSTRAINT flash_sales_pkey PRIMARY KEY (id);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: option_values option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_values
    ADD CONSTRAINT option_values_pkey PRIMARY KEY (id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (id);


--
-- Name: order_packages order_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_packages
    ADD CONSTRAINT order_packages_pkey PRIMARY KEY (id);


--
-- Name: order_product_option_values order_product_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_option_values
    ADD CONSTRAINT order_product_option_values_pkey PRIMARY KEY (id);


--
-- Name: order_product_options order_product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_options
    ADD CONSTRAINT order_product_options_pkey PRIMARY KEY (id);


--
-- Name: order_product_variation_values order_product_variation_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_variation_values
    ADD CONSTRAINT order_product_variation_values_pkey PRIMARY KEY (order_product_variation_id, variation_value_id);


--
-- Name: order_product_variations order_product_variations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_variations
    ADD CONSTRAINT order_product_variations_pkey PRIMARY KEY (id);


--
-- Name: order_products order_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: order_taxes order_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_pkey PRIMARY KEY (order_id, tax_rate_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_values product_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_pkey PRIMARY KEY (product_attribute_id, attribute_value_id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: product_options product_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_pkey PRIMARY KEY (product_id, option_id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: product_variations product_variations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_pkey PRIMARY KEY (product_id, variation_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: queue_jobs queue_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queue_jobs
    ADD CONSTRAINT queue_jobs_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: related_products related_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_pkey PRIMARY KEY (product_id, related_product_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: search_terms search_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_terms
    ADD CONSTRAINT search_terms_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- Name: stock_reservations stock_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_reservations
    ADD CONSTRAINT stock_reservations_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tax_classes tax_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_classes
    ADD CONSTRAINT tax_classes_pkey PRIMARY KEY (id);


--
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: up_sell_products up_sell_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.up_sell_products
    ADD CONSTRAINT up_sell_products_pkey PRIMARY KEY (product_id, up_sell_product_id);


--
-- Name: variation_values variation_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variation_values
    ADD CONSTRAINT variation_values_pkey PRIMARY KEY (id);


--
-- Name: variations variations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variations
    ADD CONSTRAINT variations_pkey PRIMARY KEY (id);


--
-- Name: verification_otps verification_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_otps
    ADD CONSTRAINT verification_otps_pkey PRIMARY KEY (id);


--
-- Name: wish_lists wish_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wish_lists
    ADD CONSTRAINT wish_lists_pkey PRIMARY KEY (customer_id, product_id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: addresses_country_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_country_idx ON public.addresses USING btree (country);


--
-- Name: addresses_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_created_at_idx ON public.addresses USING btree (created_at);


--
-- Name: addresses_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_customer_id_idx ON public.addresses USING btree (customer_id);


--
-- Name: addresses_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_deleted_at_idx ON public.addresses USING btree (deleted_at);


--
-- Name: admins_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_deleted_at_idx ON public.admins USING btree (deleted_at);


--
-- Name: admins_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_email_idx ON public.admins USING btree (email);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: admins_is_active_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_is_active_deleted_at_idx ON public.admins USING btree (is_active, deleted_at);


--
-- Name: admins_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_role_idx ON public.admins USING btree (role);


--
-- Name: api_keys_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_deleted_at_idx ON public.api_keys USING btree (deleted_at);


--
-- Name: api_keys_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_key_idx ON public.api_keys USING btree (key);


--
-- Name: api_keys_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX api_keys_key_key ON public.api_keys USING btree (key);


--
-- Name: api_keys_prefix_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_prefix_idx ON public.api_keys USING btree (prefix);


--
-- Name: api_keys_revoked_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_revoked_at_idx ON public.api_keys USING btree (revoked_at);


--
-- Name: api_keys_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_user_id_idx ON public.api_keys USING btree (user_id);


--
-- Name: attribute_sets_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attribute_sets_deleted_at_idx ON public.attribute_sets USING btree (deleted_at);


--
-- Name: attribute_sets_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attribute_sets_slug_idx ON public.attribute_sets USING btree (slug);


--
-- Name: attribute_sets_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attribute_sets_slug_key ON public.attribute_sets USING btree (slug);


--
-- Name: attribute_values_attribute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attribute_values_attribute_id_idx ON public.attribute_values USING btree (attribute_id);


--
-- Name: attribute_values_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attribute_values_created_at_idx ON public.attribute_values USING btree (created_at);


--
-- Name: attribute_values_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attribute_values_deleted_at_idx ON public.attribute_values USING btree (deleted_at);


--
-- Name: attributes_attribute_set_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attributes_attribute_set_id_idx ON public.attributes USING btree (attribute_set_id);


--
-- Name: attributes_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attributes_created_at_idx ON public.attributes USING btree (created_at);


--
-- Name: attributes_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attributes_deleted_at_idx ON public.attributes USING btree (deleted_at);


--
-- Name: attributes_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attributes_slug_idx ON public.attributes USING btree (slug);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_actorType_actor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_actorType_actor_id_idx" ON public.audit_logs USING btree ("actorType", actor_id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_type_entity_id_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: auth_tokens_admin_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_admin_id_idx ON public.auth_tokens USING btree (admin_id);


--
-- Name: auth_tokens_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_customer_id_idx ON public.auth_tokens USING btree (customer_id);


--
-- Name: auth_tokens_device_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_device_id_idx ON public.auth_tokens USING btree (device_id);


--
-- Name: auth_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_expires_at_idx ON public.auth_tokens USING btree (expires_at);


--
-- Name: auth_tokens_revoked_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_revoked_idx ON public.auth_tokens USING btree (revoked);


--
-- Name: auth_tokens_token_family_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_token_family_idx ON public.auth_tokens USING btree (token_family);


--
-- Name: auth_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_token_hash_idx ON public.auth_tokens USING btree (token_hash);


--
-- Name: auth_tokens_user_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auth_tokens_user_type_idx ON public.auth_tokens USING btree (user_type);


--
-- Name: brands_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_created_at_idx ON public.brands USING btree (created_at);


--
-- Name: brands_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_deleted_at_idx ON public.brands USING btree (deleted_at);


--
-- Name: brands_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_slug_idx ON public.brands USING btree (slug);


--
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- Name: carts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_created_at_idx ON public.carts USING btree (created_at);


--
-- Name: carts_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_customer_id_idx ON public.carts USING btree (customer_id);


--
-- Name: carts_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_deleted_at_idx ON public.carts USING btree (deleted_at);


--
-- Name: carts_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_session_id_idx ON public.carts USING btree (session_id);


--
-- Name: categories_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_created_at_idx ON public.categories USING btree (created_at);


--
-- Name: categories_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_deleted_at_idx ON public.categories USING btree (deleted_at);


--
-- Name: categories_depth_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_depth_idx ON public.categories USING btree (depth);


--
-- Name: categories_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_is_active_idx ON public.categories USING btree (is_active);


--
-- Name: categories_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_parent_id_idx ON public.categories USING btree (parent_id);


--
-- Name: categories_path_ids_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_path_ids_idx ON public.categories USING btree (path_ids);


--
-- Name: categories_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_path_idx ON public.categories USING btree (path);


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: coupon_categories_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupon_categories_category_id_idx ON public.coupon_categories USING btree (category_id);


--
-- Name: coupon_products_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupon_products_product_id_idx ON public.coupon_products USING btree (product_id);


--
-- Name: coupons_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupons_code_idx ON public.coupons USING btree (code);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: coupons_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupons_deleted_at_idx ON public.coupons USING btree (deleted_at);


--
-- Name: coupons_is_active_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupons_is_active_start_date_end_date_idx ON public.coupons USING btree (is_active, start_date, end_date);


--
-- Name: cross_sell_products_cross_sell_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cross_sell_products_cross_sell_product_id_idx ON public.cross_sell_products USING btree (cross_sell_product_id);


--
-- Name: currency_rates_currency_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX currency_rates_currency_idx ON public.currency_rates USING btree (currency);


--
-- Name: currency_rates_currency_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX currency_rates_currency_key ON public.currency_rates USING btree (currency);


--
-- Name: currency_rates_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX currency_rates_deleted_at_idx ON public.currency_rates USING btree (deleted_at);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: customers_is_active_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_is_active_deleted_at_idx ON public.customers USING btree (is_active, deleted_at);


--
-- Name: customers_is_guest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_is_guest_idx ON public.customers USING btree (is_guest);


--
-- Name: customers_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);


--
-- Name: customers_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_phone_key ON public.customers USING btree (phone);


--
-- Name: delivery_riders_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_riders_deleted_at_idx ON public.delivery_riders USING btree (deleted_at);


--
-- Name: delivery_riders_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_riders_is_active_idx ON public.delivery_riders USING btree (is_active);


--
-- Name: delivery_riders_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_riders_phone_idx ON public.delivery_riders USING btree (phone);


--
-- Name: delivery_riders_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX delivery_riders_phone_key ON public.delivery_riders USING btree (phone);


--
-- Name: devices_admin_id_device_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX devices_admin_id_device_id_key ON public.devices USING btree (admin_id, device_id);


--
-- Name: devices_customer_id_device_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX devices_customer_id_device_id_key ON public.devices USING btree (customer_id, device_id);


--
-- Name: devices_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devices_is_active_idx ON public.devices USING btree (is_active);


--
-- Name: devices_revoked_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devices_revoked_at_idx ON public.devices USING btree (revoked_at);


--
-- Name: entity_media_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_media_entity_type_entity_id_idx ON public.entity_media USING btree (entity_type, entity_id);


--
-- Name: entity_media_entity_type_entity_id_media_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX entity_media_entity_type_entity_id_media_id_key ON public.entity_media USING btree (entity_type, entity_id, media_id);


--
-- Name: entity_media_is_main_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_media_is_main_idx ON public.entity_media USING btree (is_main);


--
-- Name: entity_media_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_media_media_id_idx ON public.entity_media USING btree (media_id);


--
-- Name: files_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_created_at_idx ON public.files USING btree (created_at);


--
-- Name: files_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_deleted_at_idx ON public.files USING btree (deleted_at);


--
-- Name: files_disk_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_disk_idx ON public.files USING btree (disk);


--
-- Name: files_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_filename_idx ON public.files USING btree (filename);


--
-- Name: files_mime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_mime_idx ON public.files USING btree (mime);


--
-- Name: files_uploaded_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX files_uploaded_by_idx ON public.files USING btree (uploaded_by);


--
-- Name: flash_sale_products_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sale_products_created_at_idx ON public.flash_sale_products USING btree (created_at);


--
-- Name: flash_sale_products_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sale_products_deleted_at_idx ON public.flash_sale_products USING btree (deleted_at);


--
-- Name: flash_sale_products_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sale_products_end_date_idx ON public.flash_sale_products USING btree (end_date);


--
-- Name: flash_sale_products_flash_sale_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sale_products_flash_sale_id_idx ON public.flash_sale_products USING btree (flash_sale_id);


--
-- Name: flash_sale_products_flash_sale_id_product_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX flash_sale_products_flash_sale_id_product_id_key ON public.flash_sale_products USING btree (flash_sale_id, product_id);


--
-- Name: flash_sale_products_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sale_products_product_id_idx ON public.flash_sale_products USING btree (product_id);


--
-- Name: flash_sales_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sales_created_at_idx ON public.flash_sales USING btree (created_at);


--
-- Name: flash_sales_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flash_sales_deleted_at_idx ON public.flash_sales USING btree (deleted_at);


--
-- Name: inventory_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_logs_created_at_idx ON public.inventory_logs USING btree (created_at);


--
-- Name: inventory_logs_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_logs_product_id_idx ON public.inventory_logs USING btree (product_id);


--
-- Name: inventory_logs_product_variant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_logs_product_variant_id_idx ON public.inventory_logs USING btree (product_variant_id);


--
-- Name: inventory_logs_reason_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inventory_logs_reason_idx ON public.inventory_logs USING btree (reason);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_deleted_at_idx ON public.media USING btree (deleted_at);


--
-- Name: media_mime_Type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "media_mime_Type_idx" ON public.media USING btree ("mime_Type");


--
-- Name: media_reference_count_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_reference_count_idx ON public.media USING btree (reference_count);


--
-- Name: media_storage_driver_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_storage_driver_idx ON public.media USING btree (storage_driver);


--
-- Name: notifications_channel_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_channel_idx ON public.notifications USING btree (channel);


--
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);


--
-- Name: notifications_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_status_idx ON public.notifications USING btree (status);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: option_values_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX option_values_created_at_idx ON public.option_values USING btree (created_at);


--
-- Name: option_values_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX option_values_deleted_at_idx ON public.option_values USING btree (deleted_at);


--
-- Name: option_values_option_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX option_values_option_id_idx ON public.option_values USING btree (option_id);


--
-- Name: options_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX options_created_at_idx ON public.options USING btree (created_at);


--
-- Name: options_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX options_deleted_at_idx ON public.options USING btree (deleted_at);


--
-- Name: order_packages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_created_at_idx ON public.order_packages USING btree (created_at);


--
-- Name: order_packages_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_deleted_at_idx ON public.order_packages USING btree (deleted_at);


--
-- Name: order_packages_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_order_id_idx ON public.order_packages USING btree (order_id);


--
-- Name: order_packages_rider_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_rider_id_idx ON public.order_packages USING btree (rider_id);


--
-- Name: order_packages_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_status_idx ON public.order_packages USING btree (status);


--
-- Name: order_packages_tracking_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_packages_tracking_number_idx ON public.order_packages USING btree (tracking_number);


--
-- Name: order_product_option_values_option_value_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_product_option_values_option_value_id_idx ON public.order_product_option_values USING btree (option_value_id);


--
-- Name: order_product_options_order_product_id_option_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX order_product_options_order_product_id_option_name_key ON public.order_product_options USING btree (order_product_id, option_name);


--
-- Name: order_product_variation_values_variation_value_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_product_variation_values_variation_value_id_idx ON public.order_product_variation_values USING btree (variation_value_id);


--
-- Name: order_product_variations_order_product_id_variation_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX order_product_variations_order_product_id_variation_name_key ON public.order_product_variations USING btree (order_product_id, variation_name);


--
-- Name: order_products_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_products_order_id_idx ON public.order_products USING btree (order_id);


--
-- Name: order_products_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_products_product_id_idx ON public.order_products USING btree (product_id);


--
-- Name: order_status_history_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_status_history_created_at_idx ON public.order_status_history USING btree (created_at);


--
-- Name: order_status_history_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_status_history_order_id_idx ON public.order_status_history USING btree (order_id);


--
-- Name: order_status_history_to_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_status_history_to_status_idx ON public.order_status_history USING btree (to_status);


--
-- Name: order_taxes_tax_rate_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_taxes_tax_rate_id_idx ON public.order_taxes USING btree (tax_rate_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- Name: orders_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_deleted_at_idx ON public.orders USING btree (deleted_at);


--
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: orders_paid_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_paid_at_idx ON public.orders USING btree (paid_at);


--
-- Name: orders_payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_payment_method_idx ON public.orders USING btree (payment_method);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: price_history_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_history_created_at_idx ON public.price_history USING btree (created_at);


--
-- Name: price_history_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_history_product_id_idx ON public.price_history USING btree (product_id);


--
-- Name: price_history_product_variant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_history_product_variant_id_idx ON public.price_history USING btree (product_variant_id);


--
-- Name: product_attribute_values_attribute_value_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_attribute_values_attribute_value_id_idx ON public.product_attribute_values USING btree (attribute_value_id);


--
-- Name: product_attributes_attribute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_attributes_attribute_id_idx ON public.product_attributes USING btree (attribute_id);


--
-- Name: product_attributes_product_id_attribute_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_attributes_product_id_attribute_id_idx ON public.product_attributes USING btree (product_id, attribute_id);


--
-- Name: product_attributes_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_attributes_product_id_idx ON public.product_attributes USING btree (product_id);


--
-- Name: product_categories_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);


--
-- Name: product_options_option_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_options_option_id_idx ON public.product_options USING btree (option_id);


--
-- Name: product_tags_tag_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_tags_tag_id_idx ON public.product_tags USING btree (tag_id);


--
-- Name: product_variants_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_deleted_at_idx ON public.product_variants USING btree (deleted_at);


--
-- Name: product_variants_is_active_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_is_active_deleted_at_idx ON public.product_variants USING btree (is_active, deleted_at);


--
-- Name: product_variants_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);


--
-- Name: product_variants_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: product_variants_uid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_variants_uid_key ON public.product_variants USING btree (uid);


--
-- Name: product_variations_variation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_variations_variation_id_idx ON public.product_variations USING btree (variation_id);


--
-- Name: products_brand_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_brand_id_idx ON public.products USING btree (brand_id);


--
-- Name: products_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_created_at_idx ON public.products USING btree (created_at);


--
-- Name: products_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_deleted_at_idx ON public.products USING btree (deleted_at);


--
-- Name: products_is_active_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_active_deleted_at_idx ON public.products USING btree (is_active, deleted_at);


--
-- Name: products_price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_price_idx ON public.products USING btree (price);


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_tax_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_tax_class_id_idx ON public.products USING btree (tax_class_id);


--
-- Name: promotions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_deleted_at_idx ON public.promotions USING btree (deleted_at);


--
-- Name: promotions_is_active_start_date_end_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_is_active_start_date_end_date_idx ON public.promotions USING btree (is_active, start_date, end_date);


--
-- Name: promotions_is_auto_apply_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_is_auto_apply_idx ON public.promotions USING btree (is_auto_apply);


--
-- Name: promotions_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_priority_idx ON public.promotions USING btree (priority);


--
-- Name: promotions_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_slug_idx ON public.promotions USING btree (slug);


--
-- Name: promotions_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promotions_slug_key ON public.promotions USING btree (slug);


--
-- Name: promotions_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_type_idx ON public.promotions USING btree (type);


--
-- Name: queue_jobs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX queue_jobs_created_at_idx ON public.queue_jobs USING btree (created_at);


--
-- Name: queue_jobs_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX queue_jobs_name_idx ON public.queue_jobs USING btree (name);


--
-- Name: queue_jobs_queue_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX queue_jobs_queue_idx ON public.queue_jobs USING btree (queue);


--
-- Name: queue_jobs_queue_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX queue_jobs_queue_status_idx ON public.queue_jobs USING btree (queue, status);


--
-- Name: queue_jobs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX queue_jobs_status_idx ON public.queue_jobs USING btree (status);


--
-- Name: refunds_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_created_at_idx ON public.refunds USING btree (created_at);


--
-- Name: refunds_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_deleted_at_idx ON public.refunds USING btree (deleted_at);


--
-- Name: refunds_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_order_id_idx ON public.refunds USING btree (order_id);


--
-- Name: refunds_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_status_idx ON public.refunds USING btree (status);


--
-- Name: refunds_transaction_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refunds_transaction_id_idx ON public.refunds USING btree (transaction_id);


--
-- Name: related_products_related_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX related_products_related_product_id_idx ON public.related_products USING btree (related_product_id);


--
-- Name: reviews_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_deleted_at_idx ON public.reviews USING btree (deleted_at);


--
-- Name: reviews_product_id_is_approved_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_product_id_is_approved_idx ON public.reviews USING btree (product_id, is_approved);


--
-- Name: reviews_rating_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_rating_idx ON public.reviews USING btree (rating);


--
-- Name: reviews_reviewer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_reviewer_id_idx ON public.reviews USING btree (reviewer_id);


--
-- Name: search_terms_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_terms_deleted_at_idx ON public.search_terms USING btree (deleted_at);


--
-- Name: search_terms_hits_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX search_terms_hits_idx ON public.search_terms USING btree (hits DESC);


--
-- Name: search_terms_term_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX search_terms_term_key ON public.search_terms USING btree (term);


--
-- Name: settings_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_deleted_at_idx ON public.settings USING btree (deleted_at);


--
-- Name: settings_group_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_group_idx ON public.settings USING btree ("group");


--
-- Name: settings_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_key_idx ON public.settings USING btree (key);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: shipping_rates_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_rates_deleted_at_idx ON public.shipping_rates USING btree (deleted_at);


--
-- Name: shipping_rates_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_rates_is_active_idx ON public.shipping_rates USING btree (is_active);


--
-- Name: shipping_rates_shipping_zone_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_rates_shipping_zone_id_idx ON public.shipping_rates USING btree (shipping_zone_id);


--
-- Name: shipping_rates_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_rates_type_idx ON public.shipping_rates USING btree (type);


--
-- Name: shipping_zones_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_zones_deleted_at_idx ON public.shipping_zones USING btree (deleted_at);


--
-- Name: shipping_zones_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_zones_is_active_idx ON public.shipping_zones USING btree (is_active);


--
-- Name: stock_reservations_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_expires_at_idx ON public.stock_reservations USING btree (expires_at);


--
-- Name: stock_reservations_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_product_id_idx ON public.stock_reservations USING btree (product_id);


--
-- Name: stock_reservations_product_variant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_product_variant_id_idx ON public.stock_reservations USING btree (product_variant_id);


--
-- Name: stock_reservations_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_session_id_idx ON public.stock_reservations USING btree (session_id);


--
-- Name: stock_reservations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_status_idx ON public.stock_reservations USING btree (status);


--
-- Name: stock_reservations_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_user_id_idx ON public.stock_reservations USING btree (user_id);


--
-- Name: tags_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tags_created_at_idx ON public.tags USING btree (created_at);


--
-- Name: tags_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tags_deleted_at_idx ON public.tags USING btree (deleted_at);


--
-- Name: tags_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tags_slug_idx ON public.tags USING btree (slug);


--
-- Name: tags_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);


--
-- Name: tax_classes_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_classes_deleted_at_idx ON public.tax_classes USING btree (deleted_at);


--
-- Name: tax_rates_country_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_country_state_idx ON public.tax_rates USING btree (country, state);


--
-- Name: tax_rates_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_deleted_at_idx ON public.tax_rates USING btree (deleted_at);


--
-- Name: tax_rates_tax_class_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tax_rates_tax_class_id_idx ON public.tax_rates USING btree (tax_class_id);


--
-- Name: transactions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_created_at_idx ON public.transactions USING btree (created_at);


--
-- Name: transactions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_deleted_at_idx ON public.transactions USING btree (deleted_at);


--
-- Name: transactions_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX transactions_order_id_key ON public.transactions USING btree (order_id);


--
-- Name: transactions_payment_method_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_payment_method_idx ON public.transactions USING btree (payment_method);


--
-- Name: transactions_transaction_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_transaction_id_idx ON public.transactions USING btree (transaction_id);


--
-- Name: up_sell_products_up_sell_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX up_sell_products_up_sell_product_id_idx ON public.up_sell_products USING btree (up_sell_product_id);


--
-- Name: variation_values_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX variation_values_created_at_idx ON public.variation_values USING btree (created_at);


--
-- Name: variation_values_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX variation_values_deleted_at_idx ON public.variation_values USING btree (deleted_at);


--
-- Name: variation_values_uid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX variation_values_uid_key ON public.variation_values USING btree (uid);


--
-- Name: variation_values_variation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX variation_values_variation_id_idx ON public.variation_values USING btree (variation_id);


--
-- Name: variations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX variations_created_at_idx ON public.variations USING btree (created_at);


--
-- Name: variations_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX variations_deleted_at_idx ON public.variations USING btree (deleted_at);


--
-- Name: variations_uid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX variations_uid_key ON public.variations USING btree (uid);


--
-- Name: verification_otps_channel_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_otps_channel_purpose_idx ON public.verification_otps USING btree (channel, purpose);


--
-- Name: verification_otps_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_otps_expires_at_idx ON public.verification_otps USING btree (expires_at);


--
-- Name: verification_otps_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_otps_target_idx ON public.verification_otps USING btree (target);


--
-- Name: verification_otps_verified_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX verification_otps_verified_idx ON public.verification_otps USING btree (verified);


--
-- Name: wish_lists_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wish_lists_product_id_idx ON public.wish_lists USING btree (product_id);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attribute_values attribute_values_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attribute_values
    ADD CONSTRAINT attribute_values_attribute_id_fkey FOREIGN KEY (attribute_id) REFERENCES public.attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attributes attributes_attribute_set_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_attribute_set_id_fkey FOREIGN KEY (attribute_set_id) REFERENCES public.attribute_sets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: auth_tokens auth_tokens_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_tokens auth_tokens_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_tokens auth_tokens_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: coupon_categories coupon_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_categories coupon_categories_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_products coupon_products_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_products
    ADD CONSTRAINT coupon_products_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_products coupon_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_products
    ADD CONSTRAINT coupon_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cross_sell_products cross_sell_products_cross_sell_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_sell_products
    ADD CONSTRAINT cross_sell_products_cross_sell_product_id_fkey FOREIGN KEY (cross_sell_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cross_sell_products cross_sell_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cross_sell_products
    ADD CONSTRAINT cross_sell_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: devices devices_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: devices devices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entity_media entity_media_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_media
    ADD CONSTRAINT entity_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: flash_sale_products flash_sale_products_flash_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_sale_products
    ADD CONSTRAINT flash_sale_products_flash_sale_id_fkey FOREIGN KEY (flash_sale_id) REFERENCES public.flash_sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: flash_sale_products flash_sale_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flash_sale_products
    ADD CONSTRAINT flash_sale_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: option_values option_values_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_values
    ADD CONSTRAINT option_values_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.options(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_packages order_packages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_packages
    ADD CONSTRAINT order_packages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_packages order_packages_rider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_packages
    ADD CONSTRAINT order_packages_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.delivery_riders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_product_option_values order_product_option_values_option_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_option_values
    ADD CONSTRAINT order_product_option_values_option_value_id_fkey FOREIGN KEY (option_value_id) REFERENCES public.option_values(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_product_option_values order_product_option_values_order_product_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_option_values
    ADD CONSTRAINT order_product_option_values_order_product_option_id_fkey FOREIGN KEY (order_product_option_id) REFERENCES public.order_product_options(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_product_options order_product_options_order_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_options
    ADD CONSTRAINT order_product_options_order_product_id_fkey FOREIGN KEY (order_product_id) REFERENCES public.order_products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_product_variation_values order_product_variation_values_order_product_variation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_variation_values
    ADD CONSTRAINT order_product_variation_values_order_product_variation_id_fkey FOREIGN KEY (order_product_variation_id) REFERENCES public.order_product_variations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_product_variation_values order_product_variation_values_variation_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_variation_values
    ADD CONSTRAINT order_product_variation_values_variation_value_id_fkey FOREIGN KEY (variation_value_id) REFERENCES public.variation_values(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_product_variations order_product_variations_order_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_product_variations
    ADD CONSTRAINT order_product_variations_order_product_id_fkey FOREIGN KEY (order_product_id) REFERENCES public.order_products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_products order_products_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_products order_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_products order_products_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_taxes order_taxes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_taxes order_taxes_tax_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_taxes
    ADD CONSTRAINT order_taxes_tax_rate_id_fkey FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_attribute_values product_attribute_values_attribute_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_attribute_value_id_fkey FOREIGN KEY (attribute_value_id) REFERENCES public.attribute_values(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attribute_values product_attribute_values_product_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attribute_values
    ADD CONSTRAINT product_attribute_values_product_attribute_id_fkey FOREIGN KEY (product_attribute_id) REFERENCES public.product_attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attributes product_attributes_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_attribute_id_fkey FOREIGN KEY (attribute_id) REFERENCES public.attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attributes product_attributes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_categories product_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_options product_options_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.options(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_options product_options_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_options
    ADD CONSTRAINT product_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_tags product_tags_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variations product_variations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variations product_variations_variation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variations
    ADD CONSTRAINT product_variations_variation_id_fkey FOREIGN KEY (variation_id) REFERENCES public.variations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: related_products related_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: related_products related_products_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.related_products
    ADD CONSTRAINT related_products_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipping_rates shipping_rates_shipping_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_shipping_zone_id_fkey FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tax_rates tax_rates_tax_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_tax_class_id_fkey FOREIGN KEY (tax_class_id) REFERENCES public.tax_classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: up_sell_products up_sell_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.up_sell_products
    ADD CONSTRAINT up_sell_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: up_sell_products up_sell_products_up_sell_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.up_sell_products
    ADD CONSTRAINT up_sell_products_up_sell_product_id_fkey FOREIGN KEY (up_sell_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variation_values variation_values_variation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.variation_values
    ADD CONSTRAINT variation_values_variation_id_fkey FOREIGN KEY (variation_id) REFERENCES public.variations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wish_lists wish_lists_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wish_lists
    ADD CONSTRAINT wish_lists_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wish_lists wish_lists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wish_lists
    ADD CONSTRAINT wish_lists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict qKSfAhIVQpNeOi6LsdsnokcViWViZ3pJxbu1jWctMjx0Yip1UvnzV4qn2muz5Eh
