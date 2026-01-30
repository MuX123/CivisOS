CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS facility_bookings_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  resident_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_overlapping_bookings_test EXCLUDE USING GIST (
    facility_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

INSERT INTO facility_bookings_test (
  facility_id, 
  resident_id, 
  start_time, 
  end_time, 
  purpose
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 
   '550e8400-e29b-41d4-a716-446655440001'::UUID,
   '2024-01-15 10:00:00+08:00'::TIMESTAMP WITH TIME ZONE,
   '2024-01-15 12:00:00+08:00'::TIMESTAMP WITH TIME ZONE,
   'Test booking'
);

INSERT INTO facility_bookings_test (
  facility_id, 
  resident_id, 
  start_time, 
  end_time, 
  purpose
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 
   '550e8400-e29b-41d4-a716-446655440002'::UUID,
   '2024-01-15 11:00:00+08:00'::TIMESTAMP WITH TIME ZONE,
   '2024-01-15 13:00:00+08:00'::TIMESTAMP WITH TIME ZONE,
   'Overlapping test booking'
);

DROP TABLE IF EXISTS facility_bookings_test;