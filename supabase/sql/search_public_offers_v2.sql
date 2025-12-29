CREATE OR REPLACE FUNCTION public.search_public_offers(
  p_platform text DEFAULT NULL,
  p_niche text DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_cities text[] DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_radius_km double precision DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  creator_id uuid,
  title text,
  description text,
  platform text,
  niche text,
  language text,
  price_from numeric,
  city text,
  state text,
  country text,
  lat double precision,
  lng double precision,
  created_at timestamptz,
  distance_m double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.id,
    o.creator_id,
    o.title,
    o.description,
    o.platform,
    o.niche,
    o.language,
    o.price_from,
    o.city,
    o.state,
    o.country,
    o.lat,
    o.lng,
    o.created_at,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND p_radius_km IS NOT NULL AND o.geo IS NOT NULL
        THEN ST_Distance(
          o.geo,
          ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        )
      ELSE NULL
    END AS distance_m
  FROM public.creator_offers o
  WHERE
    o.is_public = TRUE
    AND o.is_active = TRUE
    AND (p_platform IS NULL OR o.platform = p_platform)
    AND (p_niche IS NULL OR o.niche ILIKE '%' || p_niche || '%')
    AND (p_max_price IS NULL OR o.price_from <= p_max_price)
    AND (
      p_cities IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(p_cities) c
        WHERE lower(coalesce(o.city,'')) = lower(c)
      )
    )
    AND (p_state IS NULL OR lower(coalesce(o.state,'')) = lower(p_state))
    AND (p_country IS NULL OR lower(coalesce(o.country,'')) = lower(p_country))
    AND (
      p_radius_km IS NULL OR p_lat IS NULL OR p_lng IS NULL
      OR (o.geo IS NOT NULL AND ST_DWithin(
        o.geo,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_km * 1000
      ))
    )
  ORDER BY o.created_at DESC;
$$;
